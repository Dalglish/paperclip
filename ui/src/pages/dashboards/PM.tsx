import { useQuery } from "@tanstack/react-query";
import { issuesApi } from "@/api/issues";
import { agentsApi } from "@/api/agents";
import { costsApi } from "@/api/costs";
import { approvalsApi } from "@/api/approvals";
import { useCompany } from "@/context/CompanyContext";
import { queryKeys } from "@/lib/queryKeys";
import { Link } from "@/lib/router";
import type { Issue } from "@paperclipai/shared";

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
      <Link to={`/issues/${issue.id}`} className="flex-1 text-[13px] font-medium truncate hover:underline">
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

  const byStatus = allIssues.reduce<Record<string, Issue[]>>((acc, i) => {
    (acc[i.status] ??= []).push(i);
    return acc;
  }, {});

  const inProgress = byStatus["in_progress"] ?? [];
  const blocked = byStatus["blocked"] ?? [];
  const todo = byStatus["todo"] ?? [];
  const done = byStatus["done"] ?? [];

  const velocityThisSprint = done.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">PM Dashboard</h1>
        <span className="text-[12px] text-muted-foreground">Paperclip native · live</span>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "In Progress", value: inProgress.length, tone: "text-yellow-300" },
          { label: "Blocked", value: blocked.length, tone: blocked.length > 0 ? "text-red-400" : "text-foreground" },
          { label: "Todo", value: todo.length, tone: "text-foreground" },
          { label: "Done (sprint)", value: velocityThisSprint, tone: "text-green-400" },
          { label: "Pending Approvals", value: approvals.length, tone: approvals.length > 0 ? "text-yellow-300" : "text-foreground" },
        ].map(({ label, value, tone }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-2">{label}</p>
            <p className={`text-2xl font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* In Progress */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-2">
            In Progress
          </p>
          {inProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Nothing in progress.</p>
          ) : (
            inProgress.slice(0, 10).map((i) => <IssueRow key={i.id} issue={i} />)
          )}
        </div>

        {/* Blocked */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-2">
            Blocked
          </p>
          {blocked.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No blocked items.</p>
          ) : (
            blocked.map((i) => <IssueRow key={i.id} issue={i} />)
          )}
        </div>
      </div>

      {/* Agent Performance */}
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">
          Agent Performance
        </p>
        {agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No agents.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
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
      </div>
    </div>
  );
}
