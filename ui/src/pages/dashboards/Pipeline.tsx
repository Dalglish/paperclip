import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { AlertTriangle, Plus } from "lucide-react";
import { biDashboardsApi } from "@/api/biDashboards";
import { useCompany } from "@/context/CompanyContext";
import { useDialog } from "@/context/DialogContext";
import { DashCard } from "./components/DashCard";
import { KpiCard } from "./components/KpiCard";
import { AlertBanner } from "./components/AlertBanner";
import { CHART_COLORS, AXIS_STYLE, TOOLTIP_CONTENT_STYLE, TOOLTIP_LABEL_STYLE } from "./components/ChartTheme";

const STAGE_COLORS: Record<string, string> = {
  "Lead": "#6B9BD2",
  "Qualified": "#7FB3D3",
  "Demo": "#93C6D4",
  "Proposal": "#A8C4A2",
  "Negotiation": "#C8B86B",
  "Closed Won": "#72B07F",
  "Closed Lost": "#C87070",
};

export function Pipeline() {
  const { selectedCompanyId } = useCompany();
  const { openNewIssue } = useDialog();
  const { data, isLoading } = useQuery({
    queryKey: ["bi", "pipeline", selectedCompanyId],
    queryFn: () => biDashboardsApi.pipeline(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 60_000,
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  const stages = data?.stages ?? [];
  const velocity = data?.velocity ?? { avgDaysToClose: "—", winRate: "—", forecastVsActual: "—" };
  const coverageRatio = data?.coverageRatio ?? null;
  const belowTarget = coverageRatio !== null && coverageRatio < 3;
  const leaks = data?.leaks;

  const chartData = stages.map((s: { stage: string; count: number; value: number }) => ({
    name: s.stage,
    deals: s.count,
    value: s.value,
    fill: STAGE_COLORS[s.stage] ?? CHART_COLORS[0],
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pipeline</h1>
        <span className="text-xs text-muted-foreground">Pipedrive · live</span>
      </div>

      {belowTarget && (
        <AlertBanner
          title="Pipeline coverage below 3×"
          detail={`Current ratio: ${coverageRatio?.toFixed(1)}× · Target: 3.0×`}
          onCreateTask={() => openNewIssue({ title: "Investigate pipeline coverage drop" })}
        />
      )}

      {/* Stage funnel — Horizontal Bar Chart */}
      <DashCard label="Deals by Stage">
        {stages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pipeline data.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" {...AXIS_STYLE} />
                <YAxis type="category" dataKey="name" {...AXIS_STYLE} width={90} />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  formatter={(value, name) => {
                    const v = Number(value);
                    if (name === "value") return [`$${(v / 1000).toFixed(0)}k`, "Value"];
                    return [v, "Deals"];
                  }}
                />
                <Bar dataKey="deals" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry: { fill: string }, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </DashCard>

      {/* Velocity */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Avg Days to Close" value={velocity.avgDaysToClose} />
        <KpiCard label="Win Rate" value={velocity.winRate} />
        <KpiCard label="Exp / Best Case" value={velocity.forecastVsActual} />
      </div>

      {/* Pipeline Leaks */}
      {leaks && leaks.total > 0 && (
        <DashCard label="Pipeline Leaks">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-4 w-4 shrink-0 ${leaks.critical > 0 ? "text-red-400" : "text-yellow-400"}`} />
              <div>
                <p className="text-[13px] font-medium">
                  {leaks.total} deal{leaks.total !== 1 ? "s" : ""} stalling
                  {leaks.critical > 0 && (
                    <span className="ml-2 text-[11px] text-red-400 font-medium">{leaks.critical} critical</span>
                  )}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  £{(leaks.value / 1000).toFixed(0)}k at risk
                </p>
              </div>
            </div>
            <button
              onClick={() => openNewIssue({ title: `Investigate ${leaks.total} stalling pipeline deal${leaks.total !== 1 ? "s" : ""}` })}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#6B9BD2] hover:bg-[#6B9BD2]/10 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Create task
            </button>
          </div>
        </DashCard>
      )}
    </div>
  );
}
