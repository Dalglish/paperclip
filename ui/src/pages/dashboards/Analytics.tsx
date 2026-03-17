import { useQuery } from "@tanstack/react-query";
import { biDashboardsApi } from "@/api/biDashboards";
import { useCompany } from "@/context/CompanyContext";
import { KpiCard } from "./components/KpiCard";
import { DashCard } from "./components/DashCard";
import { DashboardApiError } from "./components/DashboardApiError";
import { DashPageSkeleton } from "./components/DashSkeleton";

function CohortGrid({ cohorts }: { cohorts: { label: string; months: (number | null)[] }[] }) {
  if (!cohorts.length) return <p className="text-sm text-muted-foreground">No cohort data.</p>;

  const maxMonth = Math.max(...cohorts.map((c) => c.months.length));
  const headers = Array.from({ length: maxMonth }, (_, i) => `M${i}`);

  return (
    <div className="overflow-x-auto">
      <table className="text-xs w-full">
        <thead>
          <tr>
            <th className="text-left py-1.5 pr-4 text-muted-foreground font-medium">Cohort</th>
            {headers.map((h) => (
              <th key={h} className="text-right py-1.5 px-2 text-muted-foreground font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c) => (
            <tr key={c.label} className="border-t border-border">
              <td className="py-1.5 pr-4 font-medium">{c.label}</td>
              {c.months.map((val, i) => {
                const bg =
                  val === null
                    ? ""
                    : val >= 80
                    ? "bg-green-500/20 text-green-300"
                    : val >= 60
                    ? "bg-yellow-500/10 text-yellow-300"
                    : "bg-red-500/10 text-red-300";
                return (
                  <td key={i} className={`py-1.5 px-2 text-right rounded tabular-nums ${bg}`}>
                    {val !== null ? `${val}%` : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Analytics() {
  const { selectedCompanyId } = useCompany();
  const { data, isLoading } = useQuery({
    queryKey: ["bi", "analytics", selectedCompanyId],
    queryFn: () => biDashboardsApi.analytics(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 300_000,
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  const cohorts = data?.cohorts ?? [];
  const segments = data?.segments ?? [];
  const kpis = data?.kpis ?? { avgLtv: "—", medianRetention: "—", churnRate: "—" };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Analytics</h1>
        <span className="text-xs text-muted-foreground">Pipedrive · refreshes every 5m</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Avg LTV" value={kpis.avgLtv} />
        <KpiCard label="Median Retention" value={kpis.medianRetention} />
        <KpiCard label="Churn Rate" value={kpis.churnRate} />
      </div>

      {/* Cohort retention — keep table (heatmap is better than charts here) */}
      <DashCard label="Retention Cohorts">
        <CohortGrid cohorts={cohorts} />
      </DashCard>

      {/* Segmentation */}
      <DashCard label="Segmentation">
        {segments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No segment data.</p>
        ) : (
          <div className="space-y-2">
            {segments.map((s: { segment: string; customers: number; revenue: string; ltv: string }) => (
              <div key={s.segment} className="flex items-center gap-4 py-2.5 border-b border-border last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.segment}</p>
                  <p className="text-xs text-muted-foreground">{s.customers} customers · LTV {s.ltv}</p>
                </div>
                <span className="text-sm font-medium tabular-nums">{s.revenue}</span>
              </div>
            ))}
          </div>
        )}
      </DashCard>
    </div>
  );
}
