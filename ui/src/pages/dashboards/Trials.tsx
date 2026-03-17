import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { biDashboardsApi } from "@/api/biDashboards";
import { useCompany } from "@/context/CompanyContext";
import { useDialog } from "@/context/DialogContext";
import { DashCard } from "./components/DashCard";
import { KpiCard } from "./components/KpiCard";
import { AlertBanner } from "./components/AlertBanner";
import { CHART_COLORS, AXIS_STYLE, TOOLTIP_CONTENT_STYLE, TOOLTIP_LABEL_STYLE } from "./components/ChartTheme";
import { DashboardApiError } from "./components/DashboardApiError";
import { DashPageSkeleton } from "./components/DashSkeleton";

export function Trials() {
  const { selectedCompanyId } = useCompany();
  const { openNewIssue } = useDialog();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bi", "trials", selectedCompanyId],
    queryFn: () => biDashboardsApi.trials(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 60_000,
  });

  if (isLoading) return <DashPageSkeleton kpis={2} cards={2} />;
  if (isError) return <DashboardApiError message={(error as Error)?.message} />;

  const funnel = data?.funnel ?? [];
  const timeToConvert = data?.timeToConvert ?? "—";
  const conversionRate = data?.conversionRate ?? "—";
  const belowThreshold = data?.belowThreshold ?? false;
  const sources = data?.sources ?? [];

  const funnelChartData = funnel.map((step: { label: string; value: number; rate?: string }) => ({
    name: step.label,
    value: step.value,
  }));

  const sourceChartData = sources.map((s: { source: string; trials: number; pct: number }) => ({
    name: s.source,
    trials: s.trials,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Leads / Trials</h1>
        <span className="text-xs text-muted-foreground">Pipedrive + GA4 · live</span>
      </div>

      {belowThreshold && (
        <AlertBanner
          title="Trial conversion below threshold"
          detail={`Current: ${conversionRate} · Review nurture sequence`}
          onCreateTask={() => openNewIssue({ title: "Review trial nurture sequence — conversion below threshold" })}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <KpiCard label="Trial Conversion" value={conversionRate} />
        <KpiCard label="Avg Time to Convert" value={timeToConvert} />
      </div>

      {/* Conversion funnel — Bar Chart */}
      <DashCard label="Conversion Funnel">
        {funnel.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3">No funnel data.</p>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelChartData} margin={{ left: 10, right: 10, bottom: 5 }}>
                <XAxis dataKey="name" {...AXIS_STYLE} />
                <YAxis {...AXIS_STYLE} />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  formatter={(value) => [Number(value).toLocaleString(), ""]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                  {funnelChartData.map((_: unknown, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </DashCard>

      {/* Source attribution — Horizontal Bar Chart */}
      <DashCard label="Source Attribution">
        {sources.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No source data.</p>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceChartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" {...AXIS_STYLE} />
                <YAxis type="category" dataKey="name" {...AXIS_STYLE} width={90} />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  formatter={(value) => [`${value} trials`, ""]}
                />
                <Bar dataKey="trials" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </DashCard>
    </div>
  );
}
