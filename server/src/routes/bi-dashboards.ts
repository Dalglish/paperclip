/**
 * BI Dashboard proxy routes — /api/companies/:companyId/bi/*
 *
 * Proxies to the FastAPI dashboard server at localhost:3200 which
 * runs intelligence.py (full Pipedrive/GSC/GA4 data processing).
 * API keys never leave the server.
 */

import { Router } from "express";
import type { Db } from "@paperclipai/db";
import { assertCompanyAccess } from "./authz.js";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function biDashboardRoutes(_db: Db) {
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

      const alerts: { id: string; title: string; detail: string; severity: "critical" | "warning" | "info" }[] = [];
      if (retentionRate < 80) alerts.push({ id: "retention-low", title: "Retention below 80%", detail: `Current: ${retentionRate.toFixed(1)}%`, severity: "critical" });
      if (totalDeals < 5) alerts.push({ id: "pipeline-thin", title: "Pipeline thin", detail: `Only ${totalDeals} open deals`, severity: "warning" });
      if (nrrPct < 100) alerts.push({ id: "nrr-below-100", title: "NRR below 100%", detail: `Current: ${nrrPct.toFixed(1)}%`, severity: "warning" });

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
      const [pipeline, leaks, forecast] = await Promise.all([
        dashboardGet("pipeline") as Promise<Record<string, unknown>>,
        dashboardGet("pipeline/leaks") as Promise<Record<string, unknown>>,
        dashboardGet("pipeline/forecast") as Promise<Record<string, unknown>>,
      ]);

      const stageCounts = (pipeline as { stage_counts?: Record<string, number> }).stage_counts ?? {};
      const stages = Object.entries(stageCounts).map(([stage, count]) => ({ stage, count, value: 0 }));

      res.json({
        stages,
        velocity: {
          avgDaysToClose: `${Math.round(Number((pipeline as { avg_full_cycle_days?: number }).avg_full_cycle_days ?? 0))}d`,
          winRate: "—",
          forecastVsActual: "—",
        },
        coverageRatio: 0,
        leaks: {
          total: (leaks as { total_leaks?: number }).total_leaks ?? 0,
          critical: (leaks as { critical?: number }).critical ?? 0,
          value: (leaks as { total_leaked_value?: number }).total_leaked_value ?? 0,
        },
        forecast: (forecast as { forecast?: unknown[] }).forecast ?? [],
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
      res.json({
        gsc: gsc.has_data ? gsc : { impressions: "—", clicks: "—", avgPosition: "—", ctr: "—" },
        ga4: { sessions: "—", newUsers: "—", bounceRate: "—" },
        linkedin: { posts: 0, avgEngagement: "—", followers: "—" },
        seoHealth: 0,
        spikes: [],
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
      res.json({
        funnel: [
          { label: "Total Trials", value: (trials as { total_trials?: number }).total_trials ?? 0 },
          { label: "Converted", value: (trials as { total_customers?: number }).total_customers ?? 0, rate: `${(trials as { trial_to_customer_pct?: number }).trial_to_customer_pct ?? 0}%` },
        ],
        timeToConvert: "—",
        conversionRate: `${(trials as { trial_to_customer_pct?: number }).trial_to_customer_pct ?? 0}%`,
        belowThreshold: Number((trials as { trial_to_customer_pct?: number }).trial_to_customer_pct ?? 0) < 25,
        sources: [],
      });
    } catch (err) {
      res.status(502).json({ error: (err as Error).message });
    }
  });

  // ── Analytics ─────────────────────────────────────────────────────────────
  router.get("/companies/:companyId/bi/analytics", async (req, res) => {
    assertCompanyAccess(req, req.params.companyId);
    try {
      const [retention, revenue] = await Promise.all([
        dashboardGet("retention") as Promise<Record<string, unknown>>,
        dashboardGet("revenue/industry") as Promise<Record<string, unknown>>,
      ]);

      const breakdown = (revenue as { breakdown?: unknown[] }).breakdown ?? [];
      res.json({
        cohorts: [],
        segments: breakdown.slice(0, 6).map((b: unknown) => {
          const item = b as Record<string, unknown>;
          return { segment: item.label ?? "", customers: item.customer_count ?? 0, revenue: `£${(Number(item.estimated_arr ?? 0) / 1000).toFixed(0)}k`, ltv: "—" };
        }),
        kpis: {
          avgLtv: "—",
          medianRetention: "—",
          churnRate: `${(retention as { churn_rate?: number }).churn_rate ?? 0}%`,
        },
      });
    } catch (err) {
      res.status(502).json({ error: (err as Error).message });
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
