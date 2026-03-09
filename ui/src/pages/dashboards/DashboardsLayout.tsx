import { NavLink, Outlet } from "@/lib/router";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "command-center", label: "Command Center" },
  { to: "sales", label: "Sales" },
  { to: "pipeline", label: "Pipeline" },
  { to: "marketing", label: "Marketing" },
  { to: "trials", label: "Trials" },
  { to: "analytics", label: "Analytics" },
  { to: "abm", label: "ABM" },
  { to: "pm", label: "PM" },
] as const;

export function DashboardsLayout() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Sub-nav tab bar */}
      <div className="flex items-center gap-0 border-b border-border px-6 shrink-0 overflow-x-auto scrollbar-auto-hide">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                "px-4 py-3 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-[#6B9BD2] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40",
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
