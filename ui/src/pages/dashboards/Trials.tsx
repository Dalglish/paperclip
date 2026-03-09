import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { biDashboardsApi } from "@/api/biDashboards";
import { useCompany } from "@/context/CompanyContext";
import { useDialog } from "@/context/DialogContext";

function FunnelStep({ label, value, rate }: { label: string; value: number; rate?: string }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="flex-1">
        <p className="text-[13px] font-medium">{label}</p>
        {rate && <p className="text-[12px] text-muted-foreground">conversion: {rate}</p>}
      </div>
      <span className="text-xl font-semibold tabular-nums">{value.toLocaleString()}</span>
    </div>
  );
}

export function Trials() {
  const { selectedCompanyId } = useCompany();
  const { openNewIssue } = useDialog();
  const { data, isLoading } = useQuery({
    queryKey: ["bi", "trials", selectedCompanyId],
    queryFn: () => biDashboardsApi.trials(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 60_000,
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  const funnel = data?.funnel ?? [];
  const timeToConvert = data?.timeToConvert ?? "—";
  const conversionRate = data?.conversionRate ?? "—";
  const belowThreshold = data?.belowThreshold ?? false;
  const sources = data?.sources ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Leads / Trials</h1>
        <span className="text-[12px] text-muted-foreground">Pipedrive + GA4 · live</span>
      </div>

      {/* Alert */}
      {belowThreshold && (
        <div className="flex items-center justify-between rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
          <div>
            <p className="text-[13px] font-medium text-yellow-400">Trial conversion below threshold</p>
            <p className="text-[12px] text-muted-foreground">Current: {conversionRate} · Review nurture sequence</p>
          </div>
          <button
            onClick={() => openNewIssue({ title: "Review trial nurture sequence — conversion below threshold" })}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-[12px] font-medium text-[#6B9BD2] hover:bg-[#6B9BD2]/10 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Create task
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-2">Trial Conversion</p>
          <p className="text-3xl font-semibold">{conversionRate}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-2">Avg Time to Convert</p>
          <p className="text-3xl font-semibold">{timeToConvert}</p>
        </div>
      </div>

      {/* Conversion funnel */}
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-2">
          Conversion Funnel
        </p>
        {funnel.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3">No funnel data.</p>
        ) : (
          funnel.map((step: { label: string; value: number; rate?: string }) => (
            <FunnelStep key={step.label} {...step} />
          ))
        )}
      </div>

      {/* Source attribution */}
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">
          Source Attribution
        </p>
        {sources.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No source data.</p>
        ) : (
          <div className="space-y-2">
            {sources.map((s: { source: string; trials: number; pct: number }) => (
              <div key={s.source} className="space-y-1">
                <div className="flex items-center justify-between text-[12px]">
                  <span>{s.source}</span>
                  <span className="text-muted-foreground">{s.trials} trials</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-[#6B9BD2]" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
