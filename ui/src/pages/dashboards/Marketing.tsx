import { useQuery } from "@tanstack/react-query";
import { Plus, TrendingUp } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { biDashboardsApi } from "@/api/biDashboards";
import { useCompany } from "@/context/CompanyContext";
import { useDialog } from "@/context/DialogContext";
import { KpiCard } from "./components/KpiCard";
import { DashCard } from "./components/DashCard";
import { CHART_COLORS } from "./components/ChartTheme";
import { DashboardApiError } from "./components/DashboardApiError";
import { DashPageSkeleton } from "./components/DashSkeleton";

export function Marketing() {
  const { selectedCompanyId } = useCompany();
  const { openNewIssue } = useDialog();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bi", "marketing", selectedCompanyId],
    queryFn: () => biDashboardsApi.marketing(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 120_000,
  });

  if (isLoading) return <DashPageSkeleton kpis={4} cards={2} />;
  if (isError) return <DashboardApiError message={(error as Error)?.message} />;

  const gsc = data?.gsc ?? { impressions: "—", clicks: "—", avgPosition: "—", ctr: "—" };
  const ga4 = data?.ga4 ?? { sessions: "—", newUsers: "—", bounceRate: "—" };
  const linkedin = data?.linkedin ?? { posts: 0, avgEngagement: "—", followers: "—" };
  const seoHealth = data?.seoHealth ?? 0;
  const spikes = data?.spikes ?? [];

  const seoColor = seoHealth >= 80 ? CHART_COLORS[1] : seoHealth >= 60 ? CHART_COLORS[2] : CHART_COLORS[3];
  const seoGaugeData = [{ name: "seo", value: seoHealth, fill: seoColor }];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Marketing</h1>
        <span className="text-xs text-muted-foreground">GSC + GA4 · refreshes every 2m</span>
      </div>

      {/* GSC */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
          Google Search Console
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Impressions" value={gsc.impressions} />
          <KpiCard label="Clicks" value={gsc.clicks} />
          <KpiCard label="Avg Position" value={gsc.avgPosition} />
          <KpiCard label="CTR" value={gsc.ctr} />
        </div>
      </div>

      {/* GA4 */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
          GA4
        </p>
        <div className="grid grid-cols-3 gap-4">
          <KpiCard label="Sessions" value={ga4.sessions} />
          <KpiCard label="New Users" value={ga4.newUsers} />
          <KpiCard label="Bounce Rate" value={ga4.bounceRate} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SEO Health — Radial Gauge */}
        <DashCard label="SEO Health Score">
          <div className="flex items-center gap-4">
            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  startAngle={180}
                  endAngle={0}
                  data={seoGaugeData}
                  barSize={10}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={6}
                    background={{ fill: 'hsl(var(--muted))' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <span className="text-4xl font-bold tabular-nums" style={{ color: seoColor }}>
                {seoHealth}
              </span>
              <span className="text-muted-foreground ml-1">/ 100</span>
            </div>
          </div>
        </DashCard>

        {/* LinkedIn */}
        <DashCard label="LinkedIn">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-semibold tabular-nums">{linkedin.posts}</p>
              <p className="text-xs text-muted-foreground mt-1">Posts</p>
            </div>
            <div>
              <p className="text-xl font-semibold tabular-nums">{linkedin.avgEngagement}</p>
              <p className="text-xs text-muted-foreground mt-1">Avg Eng.</p>
            </div>
            <div>
              <p className="text-xl font-semibold tabular-nums">{linkedin.followers}</p>
              <p className="text-xs text-muted-foreground mt-1">Followers</p>
            </div>
          </div>
        </DashCard>
      </div>

      {/* Keyword spikes */}
      {spikes.length > 0 && (
        <DashCard label="Trending Keywords">
          {spikes.map((s: { keyword: string; impressions: number; delta: string }) => (
            <div key={s.keyword} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <TrendingUp className="h-4 w-4 text-green-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.keyword}</p>
                <p className="text-xs text-muted-foreground">{s.impressions.toLocaleString()} impressions · {s.delta}</p>
              </div>
              <button
                onClick={() => openNewIssue({ title: `Capitalize on trending keyword: ${s.keyword}` })}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[#6B9BD2] hover:bg-[#6B9BD2]/10 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Task
              </button>
            </div>
          ))}
        </DashCard>
      )}
    </div>
  );
}
