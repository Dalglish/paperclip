import { useQuery } from "@tanstack/react-query";
import { TrendingUp, AlertTriangle, Users, DollarSign, Activity, CheckCircle2, XCircle, Plus } from "lucide-react";
import { biDashboardsApi } from "@/api/biDashboards";
import { useCompany } from "@/context/CompanyContext";
import { useDialog } from "@/context/DialogContext";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
  return (
    <span className={`text-5xl font-bold tabular-nums ${color}`}>{score}</span>
  );
}

function AlertRow({
  title,
  detail,
  severity,
  onCreateTask,
}: {
  title: string;
  detail: string;
  severity: "critical" | "warning" | "info";
  onCreateTask: () => void;
}) {
  const Icon = severity === "critical" ? XCircle : severity === "warning" ? AlertTriangle : CheckCircle2;
  const iconColor =
    severity === "critical"
      ? "text-red-400"
      : severity === "warning"
      ? "text-yellow-400"
      : "text-green-400";

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground">{title}</p>
        <p className="text-[12px] text-muted-foreground">{detail}</p>
      </div>
      <button
        onClick={onCreateTask}
        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#6B9BD2] hover:bg-[#6B9BD2]/10 transition-colors shrink-0"
      >
        <Plus className="h-3 w-3" />
        Task
      </button>
    </div>
  );
}

export function CommandCenter() {
  const { selectedCompanyId } = useCompany();
  const { openNewIssue } = useDialog();
  const { data, isLoading } = useQuery({
    queryKey: ["bi", "command-center", selectedCompanyId],
    queryFn: () => biDashboardsApi.commandCenter(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 60_000,
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  const score = data?.revenueEngineScore ?? 0;
  const funnel = data?.funnel ?? { visitors: 0, trials: 0, converted: 0, retained: 0 };
  const alerts = data?.alerts ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Command Center</h1>
        <span className="text-[12px] text-muted-foreground">Live · refreshes every 60s</span>
      </div>

      {/* Revenue Engine Score */}
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">
          Revenue Engine Score
        </p>
        <div className="flex items-end gap-4">
          <ScoreBadge score={score} />
          <div className="text-sm text-muted-foreground mb-1">/ 100</div>
        </div>
        <p className="text-[12px] text-muted-foreground mt-2">
          Composite: retention × conversion × pipeline × NRR
        </p>
      </div>

      {/* Full Funnel */}
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-4">
          Full Funnel
        </p>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Visitors", value: funnel.visitors, icon: Users },
            { label: "Trials", value: funnel.trials, icon: Activity },
            { label: "Converted", value: funnel.converted, icon: CheckCircle2 },
            { label: "Retained", value: funnel.retained, icon: DollarSign },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="h-4 w-4 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts & Action Items */}
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-2">
          Alerts & Action Items
        </p>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No active alerts.</p>
        ) : (
          alerts.map((alert: { id: string; title: string; detail: string; severity: "critical" | "warning" | "info" }) => (
            <AlertRow
              key={alert.id}
              title={alert.title}
              detail={alert.detail}
              severity={alert.severity}
              onCreateTask={() => openNewIssue({ title: alert.title })}
            />
          ))
        )}
      </div>
    </div>
  );
}
