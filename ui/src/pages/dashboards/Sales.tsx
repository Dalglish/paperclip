import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { biDashboardsApi } from "@/api/biDashboards";
import { useCompany } from "@/context/CompanyContext";
import { useDialog } from "@/context/DialogContext";
import { KpiCard } from "./components/KpiCard";
import { DashCard } from "./components/DashCard";
import { DashboardApiError } from "./components/DashboardApiError";
import { DashPageSkeleton } from "./components/DashSkeleton";

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
        <p className="text-sm font-medium truncate">{account}</p>
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
      <span className="text-sm font-medium text-foreground tabular-nums">{value}</span>
      <button
        onClick={onTask}
        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[#6B9BD2] hover:bg-[#6B9BD2]/10 transition-colors"
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
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bi", "sales", selectedCompanyId],
    queryFn: () => biDashboardsApi.sales(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 60_000,
  });

  if (isLoading) return <DashPageSkeleton kpis={5} cards={2} />;
  if (isError) return <DashboardApiError message={(error as Error)?.message} />;

  const kpis = data?.kpis ?? { totalRevenue: "—", nrrGrowth: "—", trialConversion: "—", pipelineDeals: "—", valueAtRisk: "—" };
  const upsellTargets = data?.upsellTargets ?? [];
  const winBackTargets = data?.winBackTargets ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sales</h1>
        <span className="text-xs text-muted-foreground">Pipedrive · live</span>
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
        <DashCard label="Upsell Targets">
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
        </DashCard>

        {/* Win-Back Targets */}
        <DashCard label="Win-Back Targets">
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
        </DashCard>
      </div>
    </div>
  );
}
