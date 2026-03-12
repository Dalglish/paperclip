import { api } from "./client";

// All BI dashboard data flows through server-side proxy routes.
// API keys (Pipedrive, GSC, GA4, Apollo) never leave the server.

export const biDashboardsApi = {
  commandCenter: (companyId: string) =>
    api.get<CommandCenterData>(`/companies/${companyId}/bi/command-center`),

  sales: (companyId: string) =>
    api.get<SalesData>(`/companies/${companyId}/bi/sales`),

  pipeline: (companyId: string) =>
    api.get<PipelineData>(`/companies/${companyId}/bi/pipeline`),

  marketing: (companyId: string) =>
    api.get<MarketingData>(`/companies/${companyId}/bi/marketing`),

  trials: (companyId: string) =>
    api.get<TrialsData>(`/companies/${companyId}/bi/trials`),

  analytics: (companyId: string) =>
    api.get<AnalyticsData>(`/companies/${companyId}/bi/analytics`),

  abm: (companyId: string) =>
    api.get<ABMData>(`/companies/${companyId}/bi/abm`),

  alerts: (companyId: string) =>
    api.get<AlertsData>(`/companies/${companyId}/bi/alerts`),
};

// ── Types ────────────────────────────────────────────────────────────────────

export interface CommandCenterData {
  revenueEngineScore: number;
  funnel: { visitors: number; trials: number; converted: number; retained: number };
  alerts: Array<{ id: string; title: string; detail: string; severity: "critical" | "warning" | "info"; agent_assignee?: string }>;
}

export interface SalesData {
  kpis: {
    totalRevenue: string;
    nrrGrowth: string;
    trialConversion: string;
    pipelineDeals: string;
    valueAtRisk: string;
  };
  upsellTargets: Array<{ id: string; account: string; type: string; value: string }>;
  winBackTargets: Array<{ id: string; account: string; type: string; value: string }>;
}

export interface PipelineData {
  stages: Array<{ stage: string; count: number; value: number }>;
  velocity: { avgDaysToClose: string; winRate: string; forecastVsActual: string };
  coverageRatio: number | null;
  leaks?: { total: number; critical: number; value: number };
}

export interface MarketingData {
  gsc: { impressions: string; clicks: string; avgPosition: string; ctr: string };
  ga4: { sessions: string; newUsers: string; bounceRate: string };
  linkedin: { posts: number; avgEngagement: string; followers: string };
  seoHealth: number;
  spikes: Array<{ keyword: string; impressions: number; delta: string }>;
}

export interface TrialsData {
  funnel: Array<{ label: string; value: number; rate?: string }>;
  timeToConvert: string;
  conversionRate: string;
  belowThreshold: boolean;
  sources: Array<{ source: string; trials: number; pct: number }>;
}

export interface AnalyticsData {
  cohorts: Array<{ label: string; months: (number | null)[] }>;
  segments: Array<{ segment: string; customers: number; revenue: string; ltv: string }>;
  kpis: { avgLtv: string; medianRetention: string; churnRate: string };
}

export interface ABMData {
  accounts: Array<{
    id: string;
    name: string;
    industry: string;
    engagement: "high" | "medium" | "low";
    dealStage?: string;
    value?: string;
  }>;
}

export interface AlertsData {
  alerts: Array<{
    id: string;
    title: string;
    detail: string;
    severity: "critical" | "warning" | "info";
    agent_assignee?: string;
  }>;
  count: number;
  critical: number;
  warning: number;
  evaluated_at: string;
}
