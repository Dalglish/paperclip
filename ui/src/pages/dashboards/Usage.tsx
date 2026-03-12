import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { agentsApi } from "@/api/agents";
import { costsApi } from "@/api/costs";
import { issuesApi } from "@/api/issues";
import { useCompany } from "@/context/CompanyContext";
import { queryKeys } from "@/lib/queryKeys";
import { KpiCard } from "./components/KpiCard";
import { DashCard } from "./components/DashCard";
import { CHART_COLORS, AXIS_STYLE, TOOLTIP_CONTENT_STYLE, TOOLTIP_LABEL_STYLE } from "./components/ChartTheme";

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function fmtCost(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function timeAgo(iso: string | Date | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const BILLING_COLORS = { subscription: CHART_COLORS[0], api: CHART_COLORS[3] };

export function Usage() {
  const { selectedCompanyId } = useCompany();

  const { data: agents = [] } = useQuery({
    queryKey: queryKeys.agents.list(selectedCompanyId!),
    queryFn: () => agentsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 30_000,
  });

  const { data: costSummary } = useQuery({
    queryKey: [...queryKeys.costs(selectedCompanyId!), "summary"],
    queryFn: () => costsApi.summary(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 60_000,
  });

  const { data: costsByAgent = [] } = useQuery({
    queryKey: [...queryKeys.costs(selectedCompanyId!), "by-agent"],
    queryFn: () => costsApi.byAgent(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 60_000,
  });

  const { data: allIssues = [] } = useQuery({
    queryKey: queryKeys.issues.list(selectedCompanyId!),
    queryFn: () => issuesApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 30_000,
  });

  // ── Computed metrics ──
  const totalSpendCents = costSummary?.spendCents ?? 0;
  const budgetCents = costSummary?.budgetCents ?? 0;
  const utilPct = budgetCents > 0 ? Math.round((totalSpendCents / budgetCents) * 100) : 0;

  const totalInput = costsByAgent.reduce((s, c) => s + (c.inputTokens ?? 0), 0);
  const totalOutput = costsByAgent.reduce((s, c) => s + (c.outputTokens ?? 0), 0);
  const totalTokens = totalInput + totalOutput;

  const totalSubRuns = costsByAgent.reduce((s, c) => s + (c.subscriptionRunCount ?? 0), 0);
  const totalApiRuns = costsByAgent.reduce((s, c) => s + (c.apiRunCount ?? 0), 0);
  const totalRuns = totalSubRuns + totalApiRuns;

  // Active agents = have run at least once
  const activeAgents = agents.filter((a) => a.lastHeartbeatAt != null);
  const ticketsDone = allIssues.filter((i) => i.status === "done").length;
  const costPerTicket = ticketsDone > 0 ? totalSpendCents / ticketsDone : 0;

  // Agent cost breakdown for bar chart
  const agentCostData = costsByAgent
    .filter((c) => c.costCents > 0)
    .sort((a, b) => b.costCents - a.costCents)
    .map((c) => ({
      name: (c.agentName ?? "unknown").length > 16 ? (c.agentName ?? "unknown").slice(0, 16) + "\u2026" : (c.agentName ?? "unknown"),
      subscription: ((c.subscriptionInputTokens ?? 0) + (c.subscriptionOutputTokens ?? 0)),
      api: ((c.inputTokens ?? 0) + (c.outputTokens ?? 0)) - ((c.subscriptionInputTokens ?? 0) + (c.subscriptionOutputTokens ?? 0)),
      cost: c.costCents / 100,
      runs: (c.subscriptionRunCount ?? 0) + (c.apiRunCount ?? 0),
    }));

  // Billing type pie chart
  const billingPie = [
    { name: "Subscription", value: totalSubRuns, color: BILLING_COLORS.subscription },
    { name: "API", value: totalApiRuns, color: BILLING_COLORS.api },
  ].filter((d) => d.value > 0);

  // Token breakdown pie
  const tokenPie = [
    { name: "Input", value: totalInput, color: CHART_COLORS[0] },
    { name: "Output", value: totalOutput, color: CHART_COLORS[2] },
  ].filter((d) => d.value > 0);

  // Adoption table: all agents sorted by recency
  const adoptionRows = agents
    .map((a) => {
      const cost = costsByAgent.find((c) => c.agentId === a.id);
      return {
        id: a.id,
        name: a.name,
        status: a.status,
        lastRun: a.lastHeartbeatAt,
        runs: cost ? (cost.subscriptionRunCount ?? 0) + (cost.apiRunCount ?? 0) : 0,
        tokens: cost ? (cost.inputTokens ?? 0) + (cost.outputTokens ?? 0) : 0,
        cost: cost?.costCents ?? 0,
        billing: cost && (cost.subscriptionRunCount ?? 0) > 0 ? "subscription" : cost && (cost.apiRunCount ?? 0) > 0 ? "api" : "none",
      };
    })
    .sort((a, b) => {
      if (!a.lastRun && !b.lastRun) return 0;
      if (!a.lastRun) return 1;
      if (!b.lastRun) return -1;
      return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime();
    });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Usage & Adoption</h1>
        <span className="text-xs text-muted-foreground">Paperclip native &middot; live</span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard
          label="Month Spend"
          value={fmtCost(totalSpendCents)}
          sub={budgetCents > 0 ? `${utilPct}% of ${fmtCost(budgetCents)} budget` : "no budget set"}
          tone={totalSpendCents > budgetCents && budgetCents > 0 ? "text-red-400" : ""}
        />
        <KpiCard label="Total Tokens" value={fmtTokens(totalTokens)} sub={`${fmtTokens(totalInput)} in / ${fmtTokens(totalOutput)} out`} />
        <KpiCard label="Agent Runs" value={totalRuns} sub={`${totalSubRuns} sub / ${totalApiRuns} api`} />
        <KpiCard label="Active Agents" value={`${activeAgents.length}/${agents.length}`} tone={activeAgents.length === 0 ? "text-yellow-300" : "text-green-400"} />
        <KpiCard label="Tickets Done" value={ticketsDone} />
        <KpiCard label="Cost / Ticket" value={costPerTicket > 0 ? fmtCost(costPerTicket) : "\u2014"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Cost Bar Chart */}
        <DashCard label="Spend by Agent" className="lg:col-span-2">
          {agentCostData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No cost data yet. Run an agent to see spend.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentCostData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" {...AXIS_STYLE} tickFormatter={(v: number) => `$${v}`} />
                  <YAxis type="category" dataKey="name" {...AXIS_STYLE} width={120} />
                  <Tooltip
                    contentStyle={TOOLTIP_CONTENT_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, "Cost"]}
                  />
                  <Bar dataKey="cost" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashCard>

        {/* Billing + Token breakdown */}
        <div className="space-y-6">
          <DashCard label="Billing Type">
            {billingPie.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No runs yet.</p>
            ) : (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={billingPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2}>
                      {billingPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v) => [`${Number(v)} runs`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </DashCard>

          <DashCard label="Token Split">
            {tokenPie.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No tokens yet.</p>
            ) : (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tokenPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2}>
                      {tokenPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v) => [fmtTokens(Number(v)), ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </DashCard>
        </div>
      </div>

      {/* Full Agent Adoption Table */}
      <DashCard label="Agent Adoption">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Agent</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Status</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Billing</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Runs</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Tokens</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Cost</th>
                <th className="text-right py-2 pl-3 font-medium text-muted-foreground">Last Run</th>
              </tr>
            </thead>
            <tbody>
              {adoptionRows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-4 font-medium">{row.name}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
                      row.status === "idle" || row.status === "active" ? "bg-green-500/15 text-green-300" :
                      row.status === "paused" ? "bg-muted text-muted-foreground" :
                      row.status === "running" ? "bg-blue-500/20 text-blue-300" :
                      "bg-red-500/15 text-red-400"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
                      row.billing === "subscription" ? "bg-blue-500/15 text-blue-300" :
                      row.billing === "api" ? "bg-yellow-500/15 text-yellow-300" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {row.billing}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{row.runs || "\u2014"}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">{row.tokens > 0 ? fmtTokens(row.tokens) : "\u2014"}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{row.cost > 0 ? fmtCost(row.cost) : "\u2014"}</td>
                  <td className="py-2.5 pl-3 text-right text-muted-foreground">{timeAgo(row.lastRun)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>

      {/* Budget alerts */}
      {budgetCents > 0 && totalSpendCents > budgetCents * 0.8 && (
        <DashCard label="Budget Alerts">
          <div className={`flex items-center gap-3 py-2 ${totalSpendCents >= budgetCents ? "text-red-400" : "text-yellow-300"}`}>
            <span className="text-lg">{totalSpendCents >= budgetCents ? "\u26D4" : "\u26A0"}</span>
            <span className="text-sm font-medium">
              {totalSpendCents >= budgetCents
                ? `Budget exceeded: ${fmtCost(totalSpendCents)} / ${fmtCost(budgetCents)}`
                : `Approaching budget: ${fmtCost(totalSpendCents)} / ${fmtCost(budgetCents)} (${utilPct}%)`}
            </span>
          </div>
        </DashCard>
      )}
    </div>
  );
}
