import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Users, RefreshCw, AlertTriangle, Plus } from "lucide-react";
import { biDashboardsApi } from "@/api/biDashboards";
import { useCompany } from "@/context/CompanyContext";
import { useDialog } from "@/context/DialogContext";

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-2">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="text-[12px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function TargetRow({
  account,
  type,
  value,
  onTask,
}: {
  account: string;
  type: string;
  value: string;
  onTask: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate">{account}</p>
        <p className="text-[12px] text-muted-foreground">{type}</p>
      </div>
      <span className="text-[13px] font-medium text-foreground tabular-nums">{value}</span>
      <button
        onClick={onTask}
        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#6B9BD2] hover:bg-[#6B9BD2]/10 transition-colors"
      >
        <Plus className="h-3 w-3" />
        Task
      </button>
    </div>
  );
}

export function Sales() {
  const { selectedCompanyId } = useCompany();
  const { openNewIssue } = useDialog();
  const { data, isLoading } = useQuery({
    queryKey: ["bi", "sales", selectedCompanyId],
    queryFn: () => biDashboardsApi.sales(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 60_000,
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  const kpis = data?.kpis ?? { totalRevenue: "—", nrrGrowth: "—", trialConversion: "—", pipelineDeals: "—", valueAtRisk: "—" };
  const upsellTargets = data?.upsellTargets ?? [];
  const winBackTargets = data?.winBackTargets ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sales</h1>
        <span className="text-[12px] text-muted-foreground">Pipedrive · live</span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard label="Total Revenue" value={kpis.totalRevenue} />
        <KpiCard label="NRR Growth" value={kpis.nrrGrowth} />
        <KpiCard label="Trial Conversion" value={kpis.trialConversion} />
        <KpiCard label="Pipeline Deals" value={kpis.pipelineDeals} />
        <KpiCard label="Value at Risk" value={kpis.valueAtRisk} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upsell Targets */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">
            Upsell Targets
          </p>
          {upsellTargets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No upsell targets identified.</p>
          ) : (
            upsellTargets.map((t: { id: string; account: string; type: string; value: string }) => (
              <TargetRow
                key={t.id}
                account={t.account}
                type={t.type}
                value={t.value}
                onTask={() => openNewIssue({ title: `Upsell: ${t.account}` })}
              />
            ))
          )}
        </div>

        {/* Win-Back Targets */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">
            Win-Back Targets
          </p>
          {winBackTargets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No win-back targets identified.</p>
          ) : (
            winBackTargets.map((t: { id: string; account: string; type: string; value: string }) => (
              <TargetRow
                key={t.id}
                account={t.account}
                type={t.type}
                value={t.value}
                onTask={() => openNewIssue({ title: `Win-back: ${t.account}` })}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
