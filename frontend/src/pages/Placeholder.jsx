import { useLocation } from "react-router-dom";
import { Construction, GitBranch, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Maps routes to the team member responsible
const PAGE_OWNERS = {
  "/dashboard": { member: "2105045", task: "Dashboard & KPI Stats" },
  "/deliveries": { member: "2105058", task: "Order Listing, Filtering & Pagination" },
  "/stores": { member: "2105045", task: "Store Management CRUD" },
  "/analytics": { member: "2105045", task: "Analytics & Data Visualization" },
  "/payments": { member: "TBD", task: "Payment History & Transactions" },
  "/settings": { member: "TBD", task: "Account Settings & Preferences" },
  "/support": { member: "TBD", task: "Help Center & Support Tickets" },
  "/pickups": { member: "TBD", task: "Pickup Scheduling" },
};

export default function Placeholder() {
  const location = useLocation();
  const info = PAGE_OWNERS[location.pathname] || { member: "TBD", task: "This feature" };
  const pageName = location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-lg border-dashed border-2 border-border/60 bg-card/50">
        <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
          {/* Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Construction className="h-10 w-10 text-primary" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">{pageName}</h2>
            <p className="text-muted-foreground">
              This page is under active development and will be available soon.
            </p>
          </div>

          {/* Assignment info */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Assigned to</span>
              <Badge variant="secondary" className="font-mono">
                {info.member}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{info.task}</span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Development Progress</span>
              <span>Pending</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div className="h-1.5 w-[5%] rounded-full bg-primary/50 transition-all" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
