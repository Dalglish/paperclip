import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { issuesApi } from "@/api/issues";
import { agentsApi } from "@/api/agents";
import { costsApi } from "@/api/costs";
import { approvalsApi } from "@/api/approvals";
import { useCompany } from "@/context/CompanyContext";
import { queryKeys } from "@/lib/queryKeys";
import { Link } from "@/lib/router";
import type { Issue } from "@paperclipai/shared";
import { biDashboardsApi } from "@/api/biDashboards";
import { KpiCard } from "./components/KpiCard";
import { DashCard } from "./components/DashCard";
import { CHART_COLORS, AXIS_STYLE, TOOLTIP_CONTENT_STYLE, TOOLTIP_LABEL_STYLE } from "./components/ChartTheme";

// Returns the ISO week label "W{n} MMM D" for a given date
function weekLabel(d: Date): string {
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `${mon.toLocaleDateString("en-GB", { month: "short", day: "numeric" })}`;
}

// Build trailing-N-weeks velocity buckets from a list of completed issues
function buildVelocityData(doneIssues: Issue[], weeks = 4) {
  const now = new Date();
  const buckets: { label: string; count: number; isCurrent: boolean }[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() + 6) % 7) - w * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const count = doneIssues.filter((i) => {
      const t = i.completedAt ? new Date(i.completedAt) : null;
      return t && t >= start && t < end;
    }).length;
    buckets.push({ label: weekLabel(start), count, isCurrent: w === 0 });
  }
  return buckets;
}

const STATUS_COLOR: Record<string, string> = {
  todo: "bg-blue-500/20 text-blue-300",
  in_progress: "bg-yellow-500/15 text-yellow-300",
  done: "bg-green-500/15 text-green-300",
  cancelled: "bg-muted text-muted-foreground",
  blocked: "bg-red-500/15 text-red-400",
  backlog: "bg-muted text-muted-foreground",
};

function IssueRow({ issue }: { issue: Issue }) {
  const statusCls = STATUS_COLOR[issue.status] ?? "bg-muted text-muted-foreground";
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${statusCls}`}>
        {issue.status.replace("_", " ")}
      </span>
      <Link to={`/issues/${issue.id}`} className="flex-1 text-sm font-medium truncate hover:underline">
        {issue.title}
      </Link>
    </div>
  );
}

export function PM() {
  const { selectedCompanyId } = useCompany();

  const { data: allIssues = [] } = useQuery({
    queryKey: queryKeys.issues.list(selectedCompanyId!),
    queryFn: () => issuesApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 30_000,
  });
  const { data: agents = [] } = useQuery({
    queryKey: queryKeys.agents.list(selectedCompanyId!),
    queryFn: () => agentsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 30_000,
  });
  const { data: costsByAgent = [] } = useQuery({
    queryKey: [...queryKeys.costs(selectedCompanyId!), "by-agent"],
    queryFn: () => costsApi.byAgent(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 60_000,
  });
  const { data: approvals = [] } = useQuery({
    queryKey: queryKeys.approvals.list(selectedCompanyId!, "pending"),
    queryFn: () => approvalsApi.list(selectedCompanyId!, "pending"),
    enabled: !!selectedCompanyId,
    staleTime: 30_000,
  });
  const { data: revisionRate } = useQuery({
    queryKey: ["bi", "revision-rate", selectedCompanyId],
    queryFn: () => biDashboardsApi.revisionRate(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 60_000,
  });

  const byStatus = allIssues.reduce<Record<string, Issue[]>>((acc, i) => {
    (acc[i.status] ??= []).push(i);
    return acc;
  }, {});

  const inProgress = byStatus["in_progress"] ?? [];
  const blocked = byStatus["blocked"] ?? [];
  const todo = byStatus["todo"] ?? [];
  const done = byStatus["done"] ?? [];

  const velocityData = buildVelocityData(done, 4);
  const velocityThisWeek = velocityData[velocityData.length - 1]?.count ?? 0;
  const velocityLastWeek = velocityData[velocityData.length - 2]?.count ?? 0;
  const velocityTrend = velocityLastWeek > 0
    ? ((velocityThisWeek - velocityLastWeek) / velocityLastWeek) * 100
    : null;

  // Agent cost chart data
  const agentCostData = agents
    .map((a) => {
      const cost = costsByAgent.find((c) => c.agentId === a.id);
      return {
        name: a.name.length > 14 ? a.name.slice(0, 14) + "…" : a.name,
        cost: cost != null ? cost.costCents / 100 : 0,
      };
    })
    .filter((d) => d.cost > 0)
    .sort((a, b) => b.cost - a.cost);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">PM Dashboard</h1>
        <span className="text-xs text-muted-foreground">Paperclip native · live</span>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard label="In Progress" value={inProgress.length} tone="text-yellow-300" />
        <KpiCard label="Blocked" value={blocked.length} tone={blocked.length > 0 ? "text-red-400" : ""} />
        <KpiCard label="Todo" value={todo.length} />
        <KpiCard
          label="Done (this week)"
          value={velocityThisWeek}
          tone="text-green-400"
          sub={velocityTrend !== null ? `${velocityTrend >= 0 ? "+" : ""}${velocityTrend.toFixed(0)}% vs last wk` : undefined}
        />
        <KpiCard label="Pending Approvals" value={approvals.length} tone={approvals.length > 0 ? "text-yellow-300" : ""} />
        <KpiCard
          label="1st-Pass Rate"
          value={revisionRate?.currentRate !== null && revisionRate?.currentRate !== undefined ? `${revisionRate.currentRate}%` : "—"}
          tone={
            revisionRate?.currentRate !== null && revisionRate?.currentRate !== undefined
              ? revisionRate.currentRate >= 80 ? "text-green-400"
              : revisionRate.currentRate >= 60 ? "text-yellow-300"
              : "text-red-400"
              : ""
          }
          sub={
            revisionRate?.trend !== null && revisionRate?.trend !== undefined
              ? `${revisionRate.trend >= 0 ? "+" : ""}${revisionRate.trend}pp vs last wk`
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* In Progress */}
        <DashCard label="In Progress">
          {inProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Nothing in progress.</p>
          ) : (
            inProgress.slice(0, 10).map((i) => <IssueRow key={i.id} issue={i} />)
          )}
        </DashCard>

        {/* Blocked */}
        <DashCard label="Blocked">
          {blocked.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No blocked items.</p>
          ) : (
            blocked.map((i) => <IssueRow key={i.id} issue={i} />)
          )}
        </DashCard>
      </div>

      {/* Velocity trend — trailing 4 weeks */}
      <DashCard label="Velocity (trailing 4 weeks)">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={velocityData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="label" {...AXIS_STYLE} />
              <YAxis {...AXIS_STYLE} allowDecimals={false} />
              <Tooltip
                contentStyle={TOOLTIP_CONTENT_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                formatter={(v) => [v, "Tasks done"]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                {velocityData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.isCurrent ? CHART_COLORS[0] : CHART_COLORS[1]}
                    opacity={entry.isCurrent ? 1 : 0.55}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashCard>

      {/* Revision Rate — trailing 4 weeks */}
      {revisionRate && revisionRate.weeks.some((w) => w.total > 0) && (
        <DashCard label="1st-Pass Approval Rate (trailing 4 weeks)">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revisionRate.weeks} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="label" {...AXIS_STYLE} />
                <YAxis {...AXIS_STYLE} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  formatter={(v: unknown, _name: unknown, props: { payload?: { total?: number } }) => [
                    `${v}%`,
                    `1st-pass (${props.payload?.total ?? 0} resolved)`,
                  ]}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} barSize={32}>
                  {revisionRate.weeks.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isCurrent ? CHART_COLORS[2] : CHART_COLORS[1]}
                      opacity={entry.isCurrent ? 1 : 0.55}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashCard>
      )}

      {/* Agent Cost — Bar Chart */}
      {agentCostData.length > 0 && (
        <DashCard label="Agent Cost">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentCostData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" {...AXIS_STYLE} tickFormatter={(v: number) => `$${v}`} />
                <YAxis type="category" dataKey="name" {...AXIS_STYLE} width={110} />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "Cost"]}
                />
                <Bar dataKey="cost" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashCard>
      )}

      {/* Agent Performance Table */}
      <DashCard label="Agent Performance">
        {agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No agents.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Agent</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Cost</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => {
                  const agentCost = costsByAgent.find((c) => c.agentId === a.id);
                  return (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4">
                        <Link to={`/agents/${a.id}`} className="font-medium hover:underline">{a.name}</Link>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
                          a.status === "active" ? "bg-green-500/15 text-green-300" :
                          a.status === "paused" ? "bg-muted text-muted-foreground" :
                          "bg-red-500/15 text-red-400"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-muted-foreground tabular-nums">
                        {agentCost != null ? `$${(agentCost.costCents / 100).toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DashCard>
    </div>
  );
}
