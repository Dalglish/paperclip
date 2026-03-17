import { AlertTriangle } from "lucide-react";

export function DashboardApiError({ message }: { message?: string }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center gap-3 text-center min-h-48">
      <AlertTriangle className="h-8 w-8 text-yellow-400 shrink-0" />
      <div>
        <p className="text-sm font-medium text-foreground">Dashboard API unavailable</p>
        <p className="text-xs text-muted-foreground mt-1">
          {message ?? "Could not reach the data service. Run ./dashboard-api/start.sh to restart."}
        </p>
      </div>
    </div>
  );
}
