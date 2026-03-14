import { useEffect, useState } from "react";
import { getOrders } from "@/api/orders";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const statusColors = {
  pending: "secondary",
  assigned: "secondary",
  picked_up: "default",
  in_transit: "default",
  delivered: "success",
  cancelled: "destructive",
};

const STATUSES = ["all", "pending", "assigned", "picked_up", "in_transit", "delivered"];

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export default function DeliveriesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter !== "all") params.status = filter;

    getOrders(params)
      .then((data) => {
        setOrders(Array.isArray(data) ? data : data.orders || []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [page, filter]);

  const filtered = search
    ? orders.filter(
        (o) =>
          (o.recipient_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (o.recipient_phone || "").includes(search) ||
          (o.order_id || "").toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deliveries</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and track all delivery orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilter(s);
                setPage(1);
              }}
              className="capitalize cursor-pointer text-xs"
            >
              {s === "all" ? "All" : s.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">
            Orders{" "}
            {!loading && (
              <span className="text-muted-foreground font-normal">
                ({filtered.length})
              </span>
            )}
          </CardTitle>
          <CardDescription>Click any row to view details</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-4">
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
                    Phone
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                    Amount
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
                ) : filtered.length > 0 ? (
                  filtered.map((order) => (
                    <tr
                      key={order.order_id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors duration-150 cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono text-xs">
                        {order.order_id}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {order.recipient_name || "—"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {order.recipient_phone || "—"}
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
                      <td className="py-3 px-4">
                        {order.amount != null
                          ? `৳${order.amount}`
                          : "—"}
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
                      colSpan={6}
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

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground px-2">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={filtered.length < 20}
          className="cursor-pointer"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
