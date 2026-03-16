import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "@/api/orders";
import { getStores } from "@/api/stores";
import { useCachedQuery } from "@/hooks/use-cached-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors = {
  pending: "warning",
  assigned: "info",
  picked_up: "info",
  in_transit: "info",
  delivered: "success",
  cancelled: "destructive",
};

const STATUSES = ["all", "pending", "assigned", "picked_up", "in_transit", "delivered", "cancelled"];

function SkeletonRow() {
  return (
    <div className="grid grid-cols-6">
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
  const scrollRef = useRef(null);
  const progressRef = useRef(null);
  const bottomBlurRef = useRef(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState([]);
  const [storeFilter, setStoreFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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
    return getOrders(params).then((data) => {
      if (Array.isArray(data)) {
        return { orders: data, page, pages: data.length === 20 ? page + 1 : page };
      }

      return {
        orders: Array.isArray(data?.orders) ? data.orders : [],
        page: data?.page ?? page,
        pages: data?.pages ?? 0,
      };
    });
  };

  const { data: ordersData, loading } = useCachedQuery(
    `deliveries-${page}-${filter}-${storeFilter}`,
    fetchOrders
  );

  const orders = ordersData?.orders || [];
  const totalPages = ordersData?.pages ?? 0;
  const hasNextPage = totalPages > 0 ? page < totalPages : orders.length === 20;

  const filtered = orders
    .filter((o) =>
      !search ||
      (o.recipient_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.recipient_phone || "").includes(search) ||
      (o.order_id || "").toLowerCase().includes(search.toLowerCase())
    )
    .filter((o) => {
      if (!dateFrom && !dateTo) return true;
      const d = o.created_at ? new Date(o.created_at) : null;
      if (!d) return true;
      if (dateFrom && d < new Date(dateFrom + "T00:00:00")) return false;
      if (dateTo && d > new Date(dateTo + "T23:59:59.999")) return false;
      return true;
    });

  const activeFilterCount = [
    search.trim() !== "",
    filter !== "all",
    storeFilter !== "all",
    dateFrom !== "" || dateTo !== "",
  ].filter(Boolean).length;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateScrollIndicators = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

      if (progressRef.current) {
        progressRef.current.style.width = `${progress * 100}%`;
      }

      if (bottomBlurRef.current) {
        bottomBlurRef.current.style.opacity = scrollTop < maxScroll - 1 ? "1" : "0";
      }
    };

    updateScrollIndicators();
    el.addEventListener("scroll", updateScrollIndicators, { passive: true });
    window.addEventListener("resize", updateScrollIndicators);

    return () => {
      el.removeEventListener("scroll", updateScrollIndicators);
      window.removeEventListener("resize", updateScrollIndicators);
    };
  }, [filtersOpen, loading, filtered.length, page]);

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 lg:p-6 gap-4">
      <div className="shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Deliveries</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            "gap-2 cursor-pointer transition-colors duration-200",
            activeFilterCount > 0 && "border-primary/30 bg-primary/5"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", filtersOpen && "rotate-180")} />
        </Button>
      </div>

      {/* Collapsible Filters */}
      {filtersOpen && (
      <div className="shrink-0 flex flex-col sm:flex-row gap-3 flex-wrap">
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
          <SelectTrigger className="h-8 w-45 text-xs">
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
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground cursor-pointer"
            title="From date"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground cursor-pointer"
            title="To date"
          />
        </div>
      </div>
      )}

      {/* Table */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-xl border-2 border-border bg-card">
        <div className="relative shrink-0 bg-primary/3 dark:bg-primary/6">
          <div className="grid grid-cols-6 items-center px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-foreground/80">
            <div>Order ID</div>
            <div>Recipient</div>
            <div>Phone</div>
            <div>Status</div>
            <div>Amount</div>
            <div>Created</div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.75 overflow-hidden bg-border">
            <div
              ref={progressRef}
              className="h-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: "0%" }}
            />
          </div>
        </div>
        <div className="relative flex-1 min-h-0">
          <div ref={scrollRef} className="h-full overflow-y-auto scrollbar-hidden">
            <div className="min-w-full text-sm">
              {loading ? (
                <div className="divide-y divide-border/50">
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : filtered.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {filtered.map((order) => (
                    <div
                      key={order.order_id}
                      className="grid grid-cols-6 items-center px-4 py-2.5 hover:bg-muted/40 transition-colors duration-200 cursor-pointer"
                      onClick={() => navigate(`/deliveries/${order.order_id}`)}
                    >
                      <div className="font-mono text-xs font-semibold">
                        {order.order_id}
                      </div>
                      <div className="text-sm font-medium">
                        {order.recipient_name || "—"}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">
                        {order.recipient_phone || "—"}
                      </div>
                      <div>
                        <Badge variant={statusColors[order.status] || "secondary"}>
                          {(order.status || "unknown").replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium">
                        {order.amount != null ? `৳${order.amount}` : "—"}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center font-medium text-muted-foreground">
                  No orders found
                </div>
              )}
            </div>
          </div>
          <div ref={bottomBlurRef} className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-6 bg-linear-to-t from-card to-transparent opacity-0 transition-opacity duration-200" />
        </div>
      </div>

      {/* Pagination */}
      <div className="shrink-0 flex items-center justify-end gap-2">
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
          disabled={!hasNextPage}
          className="cursor-pointer"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
