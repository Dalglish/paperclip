import { useQuery } from "@tanstack/react-query";
import { biDashboardsApi } from "@/api/biDashboards";
import { useCompany } from "@/context/CompanyContext";

function CohortGrid({ cohorts }: { cohorts: { label: string; months: (number | null)[] }[] }) {
  if (!cohorts.length) return <p className="text-sm text-muted-foreground">No cohort data.</p>;

  const maxMonth = Math.max(...cohorts.map((c) => c.months.length));
  const headers = Array.from({ length: maxMonth }, (_, i) => `M${i}`);

  return (
    <div className="overflow-x-auto">
      <table className="text-[11px] w-full">
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
                  <td key={i} className={`py-1.5 px-2 text-right rounded ${bg}`}>
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
        <span className="text-[12px] text-muted-foreground">Pipedrive · refreshes every 5m</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Avg LTV", value: kpis.avgLtv },
          { label: "Median Retention", value: kpis.medianRetention },
          { label: "Churn Rate", value: kpis.churnRate },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-2">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* Cohort retention */}
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-4">
          Retention Cohorts
        </p>
        <CohortGrid cohorts={cohorts} />
      </div>

      {/* Segmentation */}
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">
          Segmentation
        </p>
        {segments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No segment data.</p>
        ) : (
          <div className="space-y-2">
            {segments.map((s: { segment: string; customers: number; revenue: string; ltv: string }) => (
              <div key={s.segment} className="flex items-center gap-4 py-2.5 border-b border-border last:border-0">
                <div className="flex-1">
                  <p className="text-[13px] font-medium">{s.segment}</p>
                  <p className="text-[12px] text-muted-foreground">{s.customers} customers · LTV {s.ltv}</p>
                </div>
                <span className="text-[13px] font-medium tabular-nums">{s.revenue}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
