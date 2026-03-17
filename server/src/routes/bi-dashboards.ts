/**
 * BI Dashboard proxy routes — /api/companies/:companyId/bi/*
 *
 * Proxies to the FastAPI dashboard server at localhost:3200 which
 * runs intelligence.py (full Pipedrive/GSC/GA4 data processing).
 * API keys never leave the server.
 */

import { and, eq, gte, lt, inArray } from "drizzle-orm";
import { Router } from "express";
import type { Db } from "@paperclipai/db";
import { activityLog, approvals } from "@paperclipai/db";
import { assertCompanyAccess } from "./authz.js";
import { issueService, agentService, heartbeatService } from "../services/index.js";

const DASHBOARD_API = process.env.DASHBOARD_API_URL ?? "http://localhost:3200";

// Get or create a session token for the dashboard API
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getDashboardToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const res = await fetch(`${DASHBOARD_API}/api/private/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: process.env.DASHBOARD_PASSWORD ?? "fluidflow2026" }),
  });
  if (!res.ok) throw new Error(`Dashboard auth failed: ${res.status}`);
  const data = await res.json() as { token: string; expires_in_days: number };
  cachedToken = data.token;
  tokenExpiry = Date.now() + (data.expires_in_days * 86_400_000 * 0.9); // refresh at 90%
  return cachedToken!;
}

async function dashboardGet(path: string): Promise<unknown> {
  const token = await getDashboardToken();
  const res = await fetch(`${DASHBOARD_API}/api/private/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Dashboard API ${path}: ${res.status}`);
  return res.json();
}

// Map: Paperclip BI route → FastAPI endpoint
const ROUTE_MAP: Record<string, string> = {
  "command-center": "dashboard",
  "sales": "revenue",
  "pipeline": "pipeline",
  "marketing": "marketing/gsc",
  "trials": "trials",
  "analytics": "retention",
  "abm": "retargeting",
};

// ---------------------------------------------------------------------------
// Auto-task deduplication — alert ID → timestamp of last task creation
// Alerts won't re-fire within ALERT_COOLDOWN_MS (default 24h)
// ---------------------------------------------------------------------------
const firedAlerts = new Map<string, number>();
const ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function shouldFire(alertId: string): boolean {
  const last = firedAlerts.get(alertId);
  return !last || Date.now() - last > ALERT_COOLDOWN_MS;
}

function markFired(alertId: string): void {
  firedAlerts.set(alertId, Date.now());
}

type AlertPayload = {
  id: string;
  title: string;
  detail: string;
  severity: "critical" | "warning" | "info";
  agent_assignee?: string;
};

export function biDashboardRoutes(db: Db) {
  const router = Router();

  // ── Command Center ──────────────────────────────────────────────────────────
  router.get("/companies/:companyId/bi/command-center", async (req, res) => {
    assertCompanyAccess(req, req.params.companyId);
    try {
      const [dashboard, pipeline, nrr, funnel, retention] = await Promise.all([
        dashboardGet("dashboard") as Promise<Record<string, unknown>>,
        dashboardGet("pipeline") as Promise<Record<string, unknown>>,
        dashboardGet("nrr") as Promise<Record<string, unknown>>,
        dashboardGet("funnel") as Promise<Record<string, unknown>>,
        dashboardGet("retention") as Promise<Record<string, unknown>>,
      ]);

      const retentionRate = Number((retention as { retention_rate?: number }).retention_rate ?? 0);
      const nrrPct = Number((nrr as { nrr_pct?: number }).nrr_pct ?? 0);
      const totalDeals = Number((pipeline as { total_deals?: number }).total_deals ?? 0);
      const winRate = Number(((funnel as { win_rate?: number }).win_rate ?? 0));

      // Revenue Engine Score composite
      const retentionScore = Math.min(30, retentionRate * 0.3);
      const conversionScore = Math.min(25, winRate * 0.25);
      const pipelineScore = Math.min(25, Math.min(totalDeals, 25));
      const nrrScore = Math.min(20, Math.max(0, (nrrPct - 80) * 1));
      const revenueEngineScore = Math.round(retentionScore + conversionScore + pipelineScore + nrrScore);

      // Pull alerts from threshold engine (best-effort — fall back to local checks on failure)
      let alerts: { id: string; title: string; detail: string; severity: "critical" | "warning" | "info"; agent_assignee?: string }[] = [];
      try {
        const alertsData = await dashboardGet("alerts") as { alerts: typeof alerts };
        alerts = alertsData.alerts ?? [];
      } catch {
        // Fallback: compute locally if threshold engine unavailable
        if (retentionRate < 80) alerts.push({ id: "retention-low", title: "Retention below 80%", detail: `Current: ${retentionRate.toFixed(1)}%`, severity: "critical" });
        if (totalDeals < 5) alerts.push({ id: "pipeline-thin", title: "Pipeline thin", detail: `Only ${totalDeals} open deals`, severity: "warning" });
        if (nrrPct < 100) alerts.push({ id: "nrr-below-100", title: "NRR below 100%", detail: `Current: ${nrrPct.toFixed(1)}%`, severity: "warning" });
      }

      const stages = (funnel as { stages?: Array<{ name: string; count: number }> }).stages ?? [];
      res.json({
        revenueEngineScore,
        funnel: {
          visitors: 0,
          trials: stages.length > 0 ? stages[0].count : 0,
          converted: stages.length > 2 ? stages[stages.length - 1].count : 0,
          retained: Number((retention as { active_count?: number }).active_count ?? 0),
        },
        alerts,
      });
    } catch (err) {
      res.status(502).json({ error: (err as Error).message });
    }
  });

  // ── Sales ───────────────────────────────────────────────────────────────────
  router.get("/companies/:companyId/bi/sales", async (req, res) => {
    assertCompanyAccess(req, req.params.companyId);
    try {
      const [revenue, nrr, pipeline, funnel, retargeting, sumGap] = await Promise.all([
        dashboardGet("revenue") as Promise<Record<string, unknown>>,
        dashboardGet("nrr") as Promise<Record<string, unknown>>,
        dashboardGet("pipeline") as Promise<Record<string, unknown>>,
        dashboardGet("funnel") as Promise<Record<string, unknown>>,
        dashboardGet("retargeting") as Promise<Record<string, unknown>>,
        dashboardGet("sum/gap") as Promise<unknown[]>,
      ]);

      const summary = (revenue as { summary?: Record<string, unknown> }).summary ?? {};
      const totalRevenue = summary.total_revenue ?? summary.total_arr ?? 0;
      const nrrPct = (nrr as { nrr_pct?: number }).nrr_pct ?? 0;
      const winRate = (funnel as { win_rate?: number }).win_rate ?? 0;
      const totalDeals = (pipeline as { total_deals?: number }).total_deals ?? 0;

      const upsellList = (retargeting as { upsell?: unknown[] }).upsell ?? [];
      const winBackList = (retargeting as { win_back?: unknown[] }).win_back ?? [];

      res.json({
        kpis: {
          totalRevenue: `£${(Number(totalRevenue) / 1000).toFixed(0)}k`,
          nrrGrowth: `${Number(nrrPct).toFixed(1)}%`,
          trialConversion: `${Number(winRate).toFixed(0)}%`,
          pipelineDeals: String(totalDeals),
          valueAtRisk: `£${((sumGap as Array<{ recoverable_arr?: number }>).reduce((s, g) => s + (g.recoverable_arr ?? 0), 0) / 1000).toFixed(0)}k`,
        },
        upsellTargets: upsellList.slice(0, 5).map((u: unknown) => {
          const item = u as Record<string, unknown>;
          return { id: item.company ?? "", account: item.company ?? "", type: "Upsell", value: `£${(Number(item.recoverable_arr ?? item.value ?? 0) / 1000).toFixed(0)}k` };
        }),
        winBackTargets: winBackList.slice(0, 5).map((w: unknown) => {
          const item = w as Record<string, unknown>;
          return { id: item.company ?? "", account: item.company ?? "", type: "Win-back", value: `£${(Number(item.recoverable_arr ?? item.value ?? 0) / 1000).toFixed(0)}k` };
        }),
      });
    } catch (err) {
      res.status(502).json({ error: (err as Error).message });
    }
  });

  // ── Pipeline ──────────────────────────────────────────────────────────────
  router.get("/companies/:companyId/bi/pipeline", async (req, res) => {
    assertCompanyAccess(req, req.params.companyId);
    try {
      const [pipeline, funnel, nrr, leaks, forecast] = await Promise.all([
        dashboardGet("pipeline") as Promise<Record<string, unknown>>,
        dashboardGet("funnel") as Promise<Record<string, unknown>>,
        dashboardGet("nrr") as Promise<Record<string, unknown>>,
        dashboardGet("pipeline/leaks") as Promise<Record<string, unknown>>,
        dashboardGet("pipeline/forecast") as Promise<Record<string, unknown>>,
      ]);

      // Use funnel stages — cleaner than pipeline stage_counts (which are tracking states)
      const funnelStages = (funnel as { stages?: Array<{ name: string; count: number }> }).stages ?? [];
      const dealsByStage = (funnel as { deals_by_stage?: Record<string, Array<{ quote_amount?: number }>> }).deals_by_stage ?? {};

      const stages = funnelStages
        .filter((s) => s.name !== "Lost")
        .map((s) => {
          const deals = dealsByStage[s.name] ?? [];
          const value = deals.reduce((sum, d) => sum + Number(d.quote_amount ?? 0), 0);
          return { stage: s.name, count: s.count, value };
        });

      const winRate = (funnel as { win_rate?: number }).win_rate ?? 0;

      // Coverage ratio: open pipeline value vs quarterly ARR target
      const currentArr = Number((nrr as { current_arr?: number }).current_arr ?? 0);
      const openValue = stages.reduce((sum, s) => sum + s.value, 0);
      const quarterlyTarget = currentArr / 4;
      const coverageRatio = quarterlyTarget > 0 ? openValue / quarterlyTarget : null;

      const avgDays = Math.round(Number((pipeline as { avg_full_cycle_days?: number }).avg_full_cycle_days ?? 0));

      res.json({
        stages,
        velocity: {
          avgDaysToClose: avgDays > 0 ? `${avgDays}d` : "—",
          winRate: `${winRate.toFixed(0)}%`,
          forecastVsActual: (() => {
            const expected = Number((forecast as { expected_revenue?: number }).expected_revenue ?? 0);
            const best = Number((forecast as { best_case?: number }).best_case ?? 0);
            if (expected === 0 && best === 0) return "—";
            return `£${(expected / 1000).toFixed(0)}k / £${(best / 1000).toFixed(0)}k`;
          })(),
        },
        coverageRatio,
        leaks: {
          total: (leaks as { total_leaks?: number }).total_leaks ?? 0,
          critical: (leaks as { critical?: number }).critical ?? 0,
          value: (leaks as { total_leaked_value?: number }).total_leaked_value ?? 0,
        },
      });
    } catch (err) {
      res.status(502).json({ error: (err as Error).message });
    }
  });

  // ── Marketing ─────────────────────────────────────────────────────────────
  router.get("/companies/:companyId/bi/marketing", async (req, res) => {
    assertCompanyAccess(req, req.params.companyId);
    try {
      const gsc = await dashboardGet("marketing/gsc") as Record<string, unknown>;
      const hasGscData = Number(gsc.sites_tracked ?? 0) > 0 || Number(gsc.total_queries ?? 0) > 0;
      const gscFormatted = hasGscData
        ? {
            impressions: `${(Number(gsc.branded_impressions ?? 0) + Number(gsc.non_branded_impressions ?? 0)).toLocaleString()}`,
            clicks: `${(Number(gsc.branded_clicks ?? 0) + Number(gsc.non_branded_clicks ?? 0)).toLocaleString()}`,
            avgPosition: "—",
            ctr: "—",
          }
        : { impressions: "—", clicks: "—", avgPosition: "—", ctr: "—" };

      res.json({
        gsc: gscFormatted,
        ga4: { sessions: "—", newUsers: "—", bounceRate: "—" },
        linkedin: { posts: 0, avgEngagement: "—", followers: "—" },
        seoHealth: 0,
        spikes: (gsc.top_opportunities as unknown[] ?? []).slice(0, 5).map((o: unknown) => {
          const item = o as Record<string, unknown>;
          return { keyword: String(item.query ?? ""), impressions: Number(item.impressions ?? 0), delta: "+trending" };
        }),
      });
    } catch (err) {
      res.status(502).json({ error: (err as Error).message });
    }
  });

  // ── Trials ────────────────────────────────────────────────────────────────
  router.get("/companies/:companyId/bi/trials", async (req, res) => {
    assertCompanyAccess(req, req.params.companyId);
    try {
      const trials = await dashboardGet("trials") as Record<string, unknown>;
      const totalTrials = Number((trials as { total_trials?: number }).total_trials ?? 0);
      const convPct = Number((trials as { trial_to_customer_pct?: number }).trial_to_customer_pct ?? 0);
      const byQual = (trials as { by_qualification?: Record<string, number> }).by_qualification ?? {};
      const sources = Object.entries(byQual)
        .sort(([, a], [, b]) => b - a)
        .map(([source, count]) => ({
          source,
          trials: count,
          pct: totalTrials > 0 ? Math.round((count / totalTrials) * 100) : 0,
        }));
      res.json({
        funnel: [
          { label: "Total Trials", value: totalTrials },
          { label: "Converted", value: (trials as { total_customers?: number }).total_customers ?? 0, rate: `${convPct}%` },
        ],
        timeToConvert: "—",
        conversionRate: `${convPct}%`,
        belowThreshold: convPct < 25,
        sources,
      });
    } catch (err) {
      res.status(502).json({ error: (err as Error).message });
    }
  });

  // ── Analytics ─────────────────────────────────────────────────────────────
  router.get("/companies/:companyId/bi/analytics", async (req, res) => {
    assertCompanyAccess(req, req.params.companyId);
    try {
      const [retention, revenue, revenueBase] = await Promise.all([
        dashboardGet("retention") as Promise<Record<string, unknown>>,
        dashboardGet("revenue/industry") as Promise<Record<string, unknown>>,
        dashboardGet("revenue") as Promise<Record<string, unknown>>,
      ]);

      const breakdown = (revenue as { breakdown?: unknown[] }).breakdown ?? [];
      const summary = (revenueBase as { summary?: Record<string, unknown> }).summary ?? {};
      const totalRevenue = Number(summary.total_revenue_gbp ?? 0);
      const totalClients = Number(summary.total_clients ?? 0);
      const avgLtv = totalClients > 0 ? `£${(totalRevenue / totalClients).toFixed(0)}` : "—";
      const retentionRate = Number((retention as { retention_rate?: number }).retention_rate ?? 0);

      res.json({
        cohorts: [],
        segments: breakdown.slice(0, 6).map((b: unknown) => {
          const item = b as Record<string, unknown>;
          return { segment: item.label ?? "", customers: item.customer_count ?? 0, revenue: `£${(Number(item.estimated_arr ?? 0) / 1000).toFixed(0)}k`, ltv: "—" };
        }),
        kpis: {
          avgLtv,
          medianRetention: retentionRate > 0 ? `${retentionRate.toFixed(1)}%` : "—",
          churnRate: `${(retention as { churn_rate?: number }).churn_rate ?? 0}%`,
        },
      });
    } catch (err) {
      res.status(502).json({ error: (err as Error).message });
    }
  });

  // ── Alerts (threshold engine) ─────────────────────────────────────────────
  router.get("/companies/:companyId/bi/alerts", async (req, res) => {
    assertCompanyAccess(req, req.params.companyId);
    try {
      const data = await dashboardGet("alerts");
      res.json(data);
    } catch (err) {
      res.status(502).json({ error: (err as Error).message });
    }
  });

  // ── Auto-task creation from alert thresholds ──────────────────────────────
  // POST /api/companies/:companyId/bi/alerts/auto-task
  //
  // Evaluates all active alerts. For each critical or warning alert that
  // hasn't fired within the cooldown window, creates a Paperclip issue and
  // wakes the assigned agent. Idempotent within ALERT_COOLDOWN_MS (24h).
  router.post("/companies/:companyId/bi/alerts/auto-task", async (req, res) => {
    const companyId = req.params.companyId;
    assertCompanyAccess(req, companyId);

    const issueSvc = issueService(db);
    const agentSvc = agentService(db);
    const heartbeat = heartbeatService(db);

    const created: Array<{ alertId: string; issueId: string; title: string }> = [];
    const skipped: Array<{ alertId: string; reason: string }> = [];

    try {
      const alertsData = await dashboardGet("alerts") as { alerts: AlertPayload[] };
      const alerts: AlertPayload[] = alertsData.alerts ?? [];

      // Only auto-create tasks for critical/warning alerts
      const actionable = alerts.filter((a) => a.severity === "critical" || a.severity === "warning");

      // Look up all agents for this company once
      const companyAgents = await agentSvc.list(companyId);

      for (const alert of actionable) {
        if (!shouldFire(alert.id)) {
          skipped.push({ alertId: alert.id, reason: "cooldown" });
          continue;
        }

        // Resolve agent_assignee name → UUID
        let assigneeAgentId: string | undefined;
        if (alert.agent_assignee) {
          const match = companyAgents.find(
            (a) => a.name === alert.agent_assignee || a.name.endsWith(`/${alert.agent_assignee}`),
          );
          assigneeAgentId = match?.id;
        }

        const issue = await issueSvc.create(companyId, {
          title: alert.title,
          description: `**Alert:** ${alert.detail}\n\n*Auto-created by alert threshold engine — severity: ${alert.severity}*`,
          status: assigneeAgentId ? "todo" : "backlog",
          priority: alert.severity === "critical" ? "urgent" : "medium",
          assigneeAgentId: assigneeAgentId ?? null,
        });

        markFired(alert.id);
        created.push({ alertId: alert.id, issueId: issue.id, title: issue.title });

        // Wake the assigned agent (same pattern as issues route)
        if (assigneeAgentId && issue.status !== "backlog") {
          void heartbeat
            .wakeup(assigneeAgentId, {
              source: "assignment",
              triggerDetail: "system",
              reason: "issue_assigned",
              payload: { issueId: issue.id, mutation: "create", alertId: alert.id },
              requestedByActorType: "system",
              requestedByActorId: "alert-threshold-engine",
              contextSnapshot: { issueId: issue.id, source: "alert.auto-task" },
            })
            .catch(() => undefined);
        }
      }

      res.json({
        created: created.length,
        skipped: skipped.length,
        tasks: created,
        skippedDetails: skipped,
        evaluatedAt: new Date().toISOString(),
      });
    } catch (err) {
      res.status(502).json({ error: (err as Error).message });
    }
  });

  // Status: show last-fired timestamps for all tracked alert IDs
  router.get("/companies/:companyId/bi/alerts/auto-task/status", (req, res) => {
    assertCompanyAccess(req, req.params.companyId);
    const now = Date.now();
    const status = Object.fromEntries(
      [...firedAlerts.entries()].map(([id, ts]) => [
        id,
        { lastFiredAt: new Date(ts).toISOString(), cooldownRemainingMs: Math.max(0, ALERT_COOLDOWN_MS - (now - ts)) },
      ]),
    );
    res.json({ cooldownMs: ALERT_COOLDOWN_MS, trackedAlerts: status });
  });

  // ── Revision Rate ─────────────────────────────────────────────────────────
  // GET /api/companies/:companyId/bi/revision-rate
  //
  // Returns trailing-4-week first-pass approval rate.
  // "First-pass" = approval resolved without any revision_requested event.
  // revision_rate_pct = 100 * (resolved_without_revision / total_resolved)
  router.get("/companies/:companyId/bi/revision-rate", async (req, res) => {
    assertCompanyAccess(req, req.params.companyId);
    const companyId = req.params.companyId;
    const WEEKS = 4;
    const now = new Date();

    // Build week boundaries (Mon–Sun, trailing WEEKS weeks)
    const weekBoundaries: Array<{ start: Date; end: Date; label: string }> = [];
    for (let w = WEEKS - 1; w >= 0; w--) {
      const start = new Date(now);
      start.setDate(now.getDate() - ((now.getDay() + 6) % 7) - w * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      const label = start.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      weekBoundaries.push({ start, end, label });
    }

    try {
      const earliest = weekBoundaries[0].start;

      // All approvals resolved (approved or rejected) in window
      const resolved = await db
        .select({ id: approvals.id, decidedAt: approvals.decidedAt })
        .from(approvals)
        .where(
          and(
            eq(approvals.companyId, companyId),
            inArray(approvals.status, ["approved", "rejected"]),
            gte(approvals.decidedAt, earliest),
          ),
        );

      // Activity log entries for revision_requested in window
      const revisionEvents = await db
        .select({ entityId: activityLog.entityId })
        .from(activityLog)
        .where(
          and(
            eq(activityLog.companyId, companyId),
            eq(activityLog.action, "approval.revision_requested"),
            gte(activityLog.createdAt, earliest),
          ),
        );
      const revisedIds = new Set(revisionEvents.map((e) => e.entityId));

      // Build per-week buckets
      const weeks = weekBoundaries.map(({ start, end, label }, i) => {
        const weekResolved = resolved.filter((a) => {
          const t = a.decidedAt ? new Date(a.decidedAt) : null;
          return t && t >= start && t < end;
        });
        const total = weekResolved.length;
        const firstPass = weekResolved.filter((a) => !revisedIds.has(a.id)).length;
        const rate = total > 0 ? Math.round((firstPass / total) * 100) : null;
        return { label, total, firstPass, rate, isCurrent: i === WEEKS - 1 };
      });

      const current = weeks[weeks.length - 1];
      const prev = weeks[weeks.length - 2];
      const trend =
        current.rate !== null && prev.rate !== null && prev.rate > 0
          ? current.rate - prev.rate
          : null;

      res.json({ weeks, currentRate: current.rate, trend });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // ── ABM ───────────────────────────────────────────────────────────────────
  router.get("/companies/:companyId/bi/abm", async (req, res) => {
    assertCompanyAccess(req, req.params.companyId);
    try {
      const retargeting = await dashboardGet("retargeting") as Record<string, unknown>;
      const all = [
        ...((retargeting as { lapsed?: unknown[] }).lapsed ?? []),
        ...((retargeting as { upsell?: unknown[] }).upsell ?? []),
        ...((retargeting as { win_back?: unknown[] }).win_back ?? []),
        ...((retargeting as { renewal_urgent?: unknown[] }).renewal_urgent ?? []),
      ];

      const accounts = all.slice(0, 20).map((a: unknown) => {
        const item = a as Record<string, unknown>;
        return {
          id: String(item.company ?? ""),
          name: String(item.company ?? "Unknown"),
          industry: String(item.industry ?? "—"),
          engagement: "medium" as const,
          dealStage: undefined,
          value: item.recoverable_arr ? `£${(Number(item.recoverable_arr) / 1000).toFixed(0)}k` : undefined,
        };
      });

      res.json({ accounts });
    } catch (err) {
      res.status(502).json({ error: (err as Error).message });
    }
  });

  return router;
}
