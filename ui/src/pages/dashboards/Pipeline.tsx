import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { biDashboardsApi } from "@/api/biDashboards";
import { useCompany } from "@/context/CompanyContext";
import { useDialog } from "@/context/DialogContext";

const STAGE_COLORS: Record<string, string> = {
  "Lead": "#6B9BD2",
  "Qualified": "#7FB3D3",
  "Demo": "#93C6D4",
  "Proposal": "#A8C4A2",
  "Negotiation": "#C8B86B",
  "Closed Won": "#72B07F",
  "Closed Lost": "#C87070",
};

function StageBar({ stage, count, value, total }: { stage: string; count: number; value: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const color = STAGE_COLORS[stage] ?? "#6B9BD2";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-foreground">{stage}</span>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span>{count} deals</span>
          <span className="font-medium text-foreground">${(value / 1000).toFixed(0)}k</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

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
  const totalDeals = stages.reduce((s: number, st: { count: number }) => s + st.count, 0);
  const coverageRatio = data?.coverageRatio ?? null;
  const belowTarget = coverageRatio !== null && coverageRatio < 3;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pipeline</h1>
        <span className="text-[12px] text-muted-foreground">Pipedrive · live</span>
      </div>

      {/* Coverage alert */}
      {belowTarget && (
        <div className="flex items-center justify-between rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
          <div>
            <p className="text-[13px] font-medium text-yellow-400">Pipeline coverage below 3×</p>
            <p className="text-[12px] text-muted-foreground">
              Current ratio: {coverageRatio?.toFixed(1)}× · Target: 3.0×
            </p>
          </div>
          <button
            onClick={() => openNewIssue({ title: "Investigate pipeline coverage drop" })}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-[12px] font-medium text-[#6B9BD2] hover:bg-[#6B9BD2]/10 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Create task
          </button>
        </div>
      )}

      {/* Stage funnel */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
          Deals by Stage
        </p>
        {stages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pipeline data.</p>
        ) : (
          stages.map((s: { stage: string; count: number; value: number }) => (
            <StageBar key={s.stage} stage={s.stage} count={s.count} value={s.value} total={totalDeals} />
          ))
        )}
      </div>

      {/* Velocity */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Avg Days to Close", value: velocity.avgDaysToClose },
          { label: "Win Rate", value: velocity.winRate },
          { label: "Forecast vs Actual", value: velocity.forecastVsActual },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-2">{label}</p>
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
