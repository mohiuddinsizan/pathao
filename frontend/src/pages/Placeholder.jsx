import { useLocation } from "react-router-dom";

const titles = {
  "/deliveries": "Deliveries",
  "/stores": "Stores",
  "/analytics": "Analytics",
  "/payments": "Payments",
  "/settings": "Settings",
};

export default function Placeholder() {
  const location = useLocation();
  const title = titles[location.pathname] || "Page";

  return (
    <div className="flex flex-1 items-center justify-center p-6 min-h-[60vh]">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">TODO</p>
      </div>
    </div>
  );
}
