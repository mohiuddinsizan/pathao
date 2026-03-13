import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

const pageInfo = {
  "/analytics": {
    title: "Analytics",
    desc: "Analytics and reporting dashboard",
  },
  "/payments": {
    title: "Payments",
    desc: "Payment processing and history",
  },
  "/settings": {
    title: "Settings",
    desc: "Account and application settings",
  },
};

export default function Placeholder() {
  const location = useLocation();
  const info = pageInfo[location.pathname] || {
    title: "Page",
    desc: "This section is under development",
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6 min-h-[60vh]">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Construction className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{info.title}</h2>
          <p className="text-muted-foreground">{info.desc}</p>
        </div>
        <p className="text-xs text-muted-foreground">Coming soon</p>
      </div>
    </div>
  );
}
