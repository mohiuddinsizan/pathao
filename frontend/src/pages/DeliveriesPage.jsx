import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStores } from "@/api/stores";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { useNavigate } from "react-router-dom";
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
    <div className="grid grid-cols-6 border-b border-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="py-3 px-4 flex items-center">
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function DeliveriesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [storeFilter, setStoreFilter] = useState("all");

  // Fetch stores once on mount for the store filter dropdown
  useEffect(() => {
    getStores()
      .then((data) => setStores(Array.isArray(data) ? data : data.stores || []))
      .catch(() => setStores([]));
  }, []);

  const fetchOrders = () => {
    const params = { page, limit: 20 };
    if (filter !== "all") params.status = filter;
    if (storeFilter !== "all") params.store_id = storeFilter;

    getOrders(params)
      .then((data) => {
        setOrders(Array.isArray(data) ? data : data.orders || []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [page, filter, storeFilter]);
    return getOrders(params).then((data) =>
      Array.isArray(data) ? data : data.orders || []
    );
  };

  const { data: ordersData, loading } = useCachedQuery(
    `deliveries-${page}-${filter}`,
    fetchOrders
  );

  const orders = ordersData || [];

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
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
        {/* Store filter dropdown Selecting a store re-fetches orders filtered by that store_id. "All Stores" resets the filter (store_id = undefined). */}
        <Select
          value={storeFilter}
          onValueChange={(v) => { setStoreFilter(v); setPage(1); }}
        >
          <SelectTrigger className="w-[180px] text-xs h-8">
            <SelectValue placeholder="All Stores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {stores.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}{s.branch ? " — " + s.branch : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            <div className="w-[800px] min-w-full text-sm">
              <div className="sticky top-0 z-10 grid grid-cols-6 border-b border-border bg-muted/50 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                <div className="py-3 px-4">Order ID</div>
                <div className="py-3 px-4">Recipient</div>
                <div className="py-3 px-4">Phone</div>
                <div className="py-3 px-4">Status</div>
                <div className="py-3 px-4">Amount</div>
                <div className="py-3 px-4">Created</div>
              </div>
              <div className="flex flex-col">
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
                    <div
                      key={order.order_id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors duration-150 cursor-pointer"
                      onClick={() => navigate('/deliveries/' + order.order_id)}
                      className="grid grid-cols-6 items-center border-b border-border last:border-0 hover:bg-muted/50 transition-colors duration-150 cursor-pointer"
                      onClick={() => navigate(`/deliveries/${order.order_id}`)}
                    >
                      <div className="py-3 px-4 font-mono font-semibold text-xs">
                        {order.order_id}
                      </div>
                      <div className="py-3 px-4 font-medium text-sm">
                        {order.recipient_name || "—"}
                      </div>
                      <div className="py-3 px-4 text-muted-foreground text-sm font-medium">
                        {order.recipient_phone || "—"}
                      </div>
                      <div className="py-3 px-4">
                        <Badge
                          variant={
                            statusColors[order.status] || "secondary"
                          }
                        >
                          {(order.status || "unknown").replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="py-3 px-4 font-medium text-sm">
                        {order.amount != null
                          ? `৳${order.amount}`
                          : "—"}
                      </div>
                      <div className="py-3 px-4 text-muted-foreground text-sm font-medium">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground font-medium">
                    No orders found
                  </div>
                )}
              </div>
            </div>
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
