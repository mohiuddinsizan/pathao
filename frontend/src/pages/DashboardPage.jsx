import { useEffect, useState } from "react";
import { getDashboardStats, getRecentOrders } from "@/api/dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Store, Truck, Clock } from "lucide-react";

const statusColors = {
  pending: "secondary",
  assigned: "secondary",
  picked_up: "default",
  in_transit: "default",
  delivered: "success",
  cancelled: "destructive",
};

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 rounded bg-muted animate-pulse" />
        <div className="h-3 w-32 rounded bg-muted animate-pulse mt-2" />
      </CardContent>
    </Card>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      <td className="py-3 px-4">
        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
      </td>
      <td className="py-3 px-4">
        <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getRecentOrders()])
      .then(([s, o]) => {
        setStats(s);
        setOrders(o);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your delivery operations
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : stats ? (
          <>
            <StatCard
              title="Total Orders"
              value={stats.total_orders ?? 0}
              icon={Package}
              description="All time orders"
            />
            <StatCard
              title="Active Deliveries"
              value={stats.in_transit ?? 0}
              icon={Truck}
              description="In transit right now"
            />
            <StatCard
              title="Stores"
              value={stats.stores ?? 0}
              icon={Store}
              description="Registered pickup points"
            />
            <StatCard
              title="Pending"
              value={stats.pending ?? 0}
              icon={Clock}
              description="Awaiting pickup"
            />
          </>
        ) : (
          <>
            <StatCard title="Total Orders" value="—" icon={Package} />
            <StatCard title="Active Deliveries" value="—" icon={Truck} />
            <StatCard title="Stores" value="—" icon={Store} />
            <StatCard title="Pending" value="—" icon={Clock} />
          </>
        )}
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest delivery requests</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Order ID
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Recipient
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <tr
                      key={order.order_id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors duration-150"
                    >
                      <td className="py-3 px-4 font-mono text-xs">
                        {order.order_id}
                      </td>
                      <td className="py-3 px-4">
                        {order.recipient_name || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            statusColors[order.status] || "secondary"
                          }
                        >
                          {(order.status || "unknown").replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
