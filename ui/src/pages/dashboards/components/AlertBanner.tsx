import { Plus } from "lucide-react";

export function AlertBanner({
  title,
  detail,
  severity = "warning",
  onCreateTask,
}: {
  title: string;
  detail: string;
  severity?: "warning" | "critical";
  onCreateTask: () => void;
}) {
  const border = severity === "critical" ? "border-red-500/30" : "border-yellow-500/30";
  const bg = severity === "critical" ? "bg-red-500/5" : "bg-yellow-500/5";
  const titleColor = severity === "critical" ? "text-red-400" : "text-yellow-400";

  return (
    <div className={`flex items-center justify-between rounded-lg border ${border} ${bg} px-4 py-3`}>
      <div>
        <p className={`text-sm font-medium ${titleColor}`}>{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <button
        onClick={onCreateTask}
        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium text-[#6B9BD2] hover:bg-[#6B9BD2]/10 transition-colors"
      >
        <Plus className="h-3 w-3" />
        Create task
      </button>
    </div>
  );
}
