/**
 * Placeholder page — shown for in-development sections.
 * Displays which team member is responsible for the feature.
 */

import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

const pageAssignments = {
  "/dashboard": { title: "Dashboard", assignee: "2105056 — S M A Mahdi", desc: "Dashboard overview with stats and recent orders" },
  "/deliveries": { title: "Deliveries", assignee: "2105057 — Team Member", desc: "Order tracking and delivery management" },
  "/stores": { title: "Stores", assignee: "2105039 — Team Member", desc: "Store management and configuration" },
  "/analytics": { title: "Analytics", assignee: "2105040 — Team Member", desc: "Analytics and reporting dashboard" },
  "/payments": { title: "Payments", assignee: "2105041 — Team Member", desc: "Payment processing and history" },
  "/settings": { title: "Settings", assignee: "2105042 — Team Member", desc: "Account and application settings" },
};

export default function Placeholder() {
  const location = useLocation();
  const info = pageAssignments[location.pathname] || {
    title: "Page",
    assignee: "Team",
    desc: "This section is under development",
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Construction className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{info.title}</h2>
          <p className="text-muted-foreground">{info.desc}</p>
        </div>
        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Assigned to</p>
          <p className="text-sm font-medium">{info.assignee}</p>
        </div>
      </div>
    </div>
  );
}
