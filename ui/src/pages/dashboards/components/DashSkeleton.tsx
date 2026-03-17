/** Skeleton loader for BI dashboard pages */

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted/60 ${className ?? ""}`} />;
}

/** Renders N KPI card skeletons in a grid */
export function KpiSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={`grid gap-4 grid-cols-${Math.min(count, 5)}`} style={{ gridTemplateColumns: `repeat(${Math.min(count, 5)}, minmax(0, 1fr))` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-7 w-28" />
        </div>
      ))}
    </div>
  );
}

/** Renders a card-shaped skeleton (for chart areas or lists) */
export function CardSkeleton({ height = "h-52" }: { height?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className={`w-full ${height}`} />
    </div>
  );
}

/** Full-page dashboard skeleton: KPI row + 2 cards */
export function DashPageSkeleton({ kpis = 3, cards = 2 }: { kpis?: number; cards?: number }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-6 w-40" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
      <KpiSkeleton count={kpis} />
      {Array.from({ length: cards }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
