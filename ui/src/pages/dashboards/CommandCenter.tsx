import { useQuery } from "@tanstack/react-query";
import { Users, Activity, CheckCircle2, DollarSign, XCircle, AlertTriangle } from "lucide-react";
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { biDashboardsApi } from "@/api/biDashboards";
import { useCompany } from "@/context/CompanyContext";
import { useDialog } from "@/context/DialogContext";
import { DashCard } from "./components/DashCard";
import { CHART_COLORS, TOOLTIP_CONTENT_STYLE, TOOLTIP_LABEL_STYLE, AXIS_STYLE } from "./components/ChartTheme";

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
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <button
        onClick={onCreateTask}
        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[#6B9BD2] hover:bg-[#6B9BD2]/10 transition-colors shrink-0"
      >
        + Task
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

  const scoreColor = score >= 80 ? CHART_COLORS[1] : score >= 60 ? CHART_COLORS[2] : CHART_COLORS[3];
  const gaugeData = [{ name: "score", value: score, fill: scoreColor }];

  const funnelData = [
    { name: "Visitors", value: funnel.visitors, icon: Users },
    { name: "Trials", value: funnel.trials, icon: Activity },
    { name: "Converted", value: funnel.converted, icon: CheckCircle2 },
    { name: "Retained", value: funnel.retained, icon: DollarSign },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Command Center</h1>
        <span className="text-xs text-muted-foreground">Live · refreshes every 60s</span>
      </div>

      {/* Revenue Engine Score — Radial Gauge */}
      <DashCard label="Revenue Engine Score">
        <div className="flex items-center gap-6">
          <div className="w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                startAngle={180}
                endAngle={0}
                data={gaugeData}
                barSize={12}
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
            <span className={`text-5xl font-bold tabular-nums`} style={{ color: scoreColor }}>
              {score}
            </span>
            <span className="text-sm text-muted-foreground ml-2">/ 100</span>
            <p className="text-xs text-muted-foreground mt-2">
              Composite: retention × conversion × pipeline × NRR
            </p>
          </div>
        </div>
      </DashCard>

      {/* Full Funnel — Bar Chart */}
      <DashCard label="Full Funnel">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" {...AXIS_STYLE} />
              <YAxis type="category" dataKey="name" {...AXIS_STYLE} width={80} />
              <Tooltip
                contentStyle={TOOLTIP_CONTENT_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                formatter={(value) => [Number(value).toLocaleString(), ""]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {funnelData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashCard>

      {/* Alerts & Action Items */}
      <DashCard label="Alerts & Action Items">
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
      </DashCard>
    </div>
  );
}
