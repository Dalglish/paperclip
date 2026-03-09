import { useQuery } from "@tanstack/react-query";
import { Plus, Building2 } from "lucide-react";
import { biDashboardsApi } from "@/api/biDashboards";
import { useCompany } from "@/context/CompanyContext";
import { useDialog } from "@/context/DialogContext";
import { KpiCard } from "./components/KpiCard";
import { DashCard } from "./components/DashCard";

const ENGAGEMENT_COLOR: Record<string, string> = {
  high: "bg-green-500/20 text-green-300",
  medium: "bg-yellow-500/10 text-yellow-300",
  low: "bg-muted text-muted-foreground",
};

export function ABM() {
  const { selectedCompanyId } = useCompany();
  const { openNewIssue } = useDialog();
  const { data, isLoading } = useQuery({
    queryKey: ["bi", "abm", selectedCompanyId],
    queryFn: () => biDashboardsApi.abm(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 120_000,
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  const accounts = data?.accounts ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Account-Based Marketing</h1>
        <span className="text-xs text-muted-foreground">Pipedrive + Apollo · refreshes every 2m</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Target Accounts" value={accounts.length} />
        <KpiCard label="High Engagement" value={accounts.filter((a: { engagement: string }) => a.engagement === "high").length} />
        <KpiCard label="Active Deals" value={accounts.filter((a: { dealStage?: string }) => !!a.dealStage).length} />
      </div>

      {/* Account list */}
      <DashCard label="Target Accounts">
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No target accounts defined.</p>
        ) : (
          accounts.map((a: {
            id: string;
            name: string;
            industry: string;
            engagement: string;
            dealStage?: string;
            value?: string;
          }) => (
            <div key={a.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.industry}
                  {a.dealStage ? ` · ${a.dealStage}` : ""}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ENGAGEMENT_COLOR[a.engagement] ?? ENGAGEMENT_COLOR.low}`}
              >
                {a.engagement}
              </span>
              {a.value && <span className="text-sm font-medium tabular-nums">{a.value}</span>}
              <button
                onClick={() => openNewIssue({ title: `ABM: engage ${a.name}` })}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[#6B9BD2] hover:bg-[#6B9BD2]/10 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Task
              </button>
            </div>
          ))
        )}
      </DashCard>
    </div>
  );
}
