import type { ReactNode } from "react";

export function DashCard({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 ${className ?? ""}`}>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60 mb-3">
        {label}
      </p>
      {children}
    </div>
  );
}
