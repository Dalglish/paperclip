import { useQuery } from "@tanstack/react-query";
import { Plus, TrendingUp } from "lucide-react";
import { biDashboardsApi } from "@/api/biDashboards";
import { useCompany } from "@/context/CompanyContext";
import { useDialog } from "@/context/DialogContext";

function StatBlock({ label, value, delta }: { label: string; value: string; delta?: string }) {
  const isPositive = delta?.startsWith("+");
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-2">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {delta && (
        <p className={`text-[12px] mt-1 ${isPositive ? "text-green-400" : "text-red-400"}`}>{delta} vs last period</p>
      )}
    </div>
  );
}

export function Marketing() {
  const { selectedCompanyId } = useCompany();
  const { openNewIssue } = useDialog();
  const { data, isLoading } = useQuery({
    queryKey: ["bi", "marketing", selectedCompanyId],
    queryFn: () => biDashboardsApi.marketing(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    staleTime: 120_000,
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  const gsc = data?.gsc ?? { impressions: "—", clicks: "—", avgPosition: "—", ctr: "—" };
  const ga4 = data?.ga4 ?? { sessions: "—", newUsers: "—", bounceRate: "—" };
  const linkedin = data?.linkedin ?? { posts: 0, avgEngagement: "—", followers: "—" };
  const seoHealth = data?.seoHealth ?? 0;
  const spikes = data?.spikes ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Marketing</h1>
        <span className="text-[12px] text-muted-foreground">GSC + GA4 · refreshes every 2m</span>
      </div>

      {/* GSC */}
      <div className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
          Google Search Console
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBlock label="Impressions" value={gsc.impressions} />
          <StatBlock label="Clicks" value={gsc.clicks} />
          <StatBlock label="Avg Position" value={gsc.avgPosition} />
          <StatBlock label="CTR" value={gsc.ctr} />
        </div>
      </div>

      {/* GA4 */}
      <div className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
          GA4
        </p>
        <div className="grid grid-cols-3 gap-4">
          <StatBlock label="Sessions" value={ga4.sessions} />
          <StatBlock label="New Users" value={ga4.newUsers} />
          <StatBlock label="Bounce Rate" value={ga4.bounceRate} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SEO Health */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">
            SEO Health Score
          </p>
          <div className="flex items-end gap-2">
            <span className={`text-4xl font-bold ${seoHealth >= 80 ? "text-green-400" : seoHealth >= 60 ? "text-yellow-400" : "text-red-400"}`}>
              {seoHealth}
            </span>
            <span className="text-muted-foreground mb-1">/ 100</span>
          </div>
        </div>

        {/* LinkedIn */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">
            LinkedIn
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-semibold">{linkedin.posts}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Posts</p>
            </div>
            <div>
              <p className="text-xl font-semibold">{linkedin.avgEngagement}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Avg Eng.</p>
            </div>
            <div>
              <p className="text-xl font-semibold">{linkedin.followers}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Followers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Keyword spikes */}
      {spikes.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">
            Trending Keywords
          </p>
          {spikes.map((s: { keyword: string; impressions: number; delta: string }) => (
            <div key={s.keyword} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <TrendingUp className="h-4 w-4 text-green-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium">{s.keyword}</p>
                <p className="text-[12px] text-muted-foreground">{s.impressions.toLocaleString()} impressions · {s.delta}</p>
              </div>
              <button
                onClick={() => openNewIssue({ title: `Capitalize on trending keyword: ${s.keyword}` })}
                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#6B9BD2] hover:bg-[#6B9BD2]/10 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Task
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
