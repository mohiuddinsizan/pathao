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
import { AlertCircle, Search, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown, X, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAnalytics } from "@/api/analytics";

const statusColors = {
  pending:    "warning",   // amber
  assigned:   "sky",       // sky blue (distinct from picked_up)
  picked_up:  "teal",      // teal (clearly distinct from sky/orange)
  in_transit: "orange",    // orange (warm, energetic, distinct from teal)
  delivered:  "success",   // emerald
  cancelled:  "negative",  // red (consistent bg-red-500/30 pattern)
};

// activeClass mirrors Badge variant colors exactly for full consistency
const STATUS_TABS = [
  {
    key: "all",
    label: "All",
    activeClass: "bg-foreground text-background border border-foreground shadow-sm font-bold",
    activePillClass: "bg-background/20 text-background",
  },
  {
    key: "pending",
    label: "Pending",
    // Badge variant="warning" → amber
    activeClass: "bg-amber-500/30 text-foreground border border-amber-500/40 shadow-sm font-bold",
    activePillClass: "bg-amber-500/20 text-foreground",
  },
  {
    key: "assigned",
    label: "Assigned",
    // Badge variant="sky" → sky blue (unique vs indigo/violet)
    activeClass: "bg-sky-500/30 text-foreground border border-sky-500/40 shadow-sm font-bold",
    activePillClass: "bg-sky-500/20 text-foreground",
  },
  {
    key: "picked_up",
    label: "Picked Up",
    // Badge variant="teal" → teal (clearly different from sky/orange)
    activeClass: "bg-teal-500/30 text-foreground border border-teal-500/40 shadow-sm font-bold",
    activePillClass: "bg-teal-500/20 text-foreground",
  },
  {
    key: "in_transit",
    label: "In Transit",
    // Badge variant="orange" → orange (warm, distinct from teal)
    activeClass: "bg-orange-500/30 text-foreground border border-orange-500/40 shadow-sm font-bold",
    activePillClass: "bg-orange-500/20 text-foreground",
  },
  {
    key: "delivered",
    label: "Delivered",
    // Badge variant="success" → emerald
    activeClass: "bg-emerald-500/30 text-foreground border border-emerald-500/40 shadow-sm font-bold",
    activePillClass: "bg-emerald-500/20 text-foreground",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    // Badge variant="negative" → red-500/30 (same pattern as all other statuses)
    activeClass: "bg-red-500/30 text-foreground border border-red-500/40 shadow-sm font-bold",
    activePillClass: "bg-red-500/20 text-foreground",
  },
];

const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatOrderDate(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  const day = date.getDate();
  const mod100 = day % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? "th"
    : day % 10 === 1 ? "st"
    : day % 10 === 2 ? "nd"
    : day % 10 === 3 ? "rd" : "th";
  const timePart = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${day}${suffix} ${MONTH_ABBR[date.getMonth()]} • ${timePart}`;
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return null;
  if (sortDir === "asc") return <ArrowUp className="h-3 w-3 ml-1 text-primary/70 inline" />;
  return <ArrowDown className="h-3 w-3 ml-1 text-primary/70 inline" />;
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1.1fr_1.7fr_1.3fr_1.1fr_0.9fr_1.3fr] gap-x-4">
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
  const [sortField, setSortField] = useState(null); // "amount" | "created_at" | null
  const [sortDir, setSortDir] = useState("desc");

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

  const { data: ordersData, loading, error, refetch } = useCachedQuery(
    `deliveries-${page}-${filter}-${storeFilter}`,
    fetchOrders
  );

  const { data: statsData, loading: statsLoading } = useCachedQuery("delivery-stats", getAnalytics);
  const orderCounts = statsData?.order_counts || {};
  const totalCount = Object.values(orderCounts).reduce((a, b) => a + Number(b), 0);

  const handleClearFilters = () => {
    setFilter("all");
    setStoreFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setPage(1);
  };

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

  const panelFilterCount = [
    storeFilter !== "all",
    dateFrom !== "" || dateTo !== "",
  ].filter(Boolean).length;

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortedFiltered = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    let aVal, bVal;
    if (sortField === "amount") {
      aVal = a.amount ?? 0;
      bVal = b.amount ?? 0;
    } else {
      aVal = a.created_at ? new Date(a.created_at).getTime() : 0;
      bVal = b.created_at ? new Date(b.created_at).getTime() : 0;
    }
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

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
      <div className="shrink-0 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Deliveries</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-9 gap-1.5 cursor-pointer"
            onClick={() => navigate("/deliveries/new")}
          >
            <Plus className="h-4 w-4" />
            New Delivery
          </Button>
          <div className="relative w-60 xl:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Name, phone, or ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-9 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn(
              "gap-2 cursor-pointer transition-colors duration-200 h-9",
              panelFilterCount > 0 && "border-primary/30 bg-primary/5"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {panelFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {panelFilterCount}
              </span>
            )}
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", filtersOpen && "rotate-180")} />
          </Button>
        </div>
      </div>

      {/* Collapsible Filters */}
      {filtersOpen && (
        <div className="shrink-0 flex flex-col sm:flex-row gap-3 flex-wrap items-center">
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
          {panelFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto pb-0.5">
        {STATUS_TABS.map(({ key, label, activeClass, activePillClass }) => {
          const count = key === "all" ? totalCount : (orderCounts[key] ?? 0);
          const isActive = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => { setFilter(key); setPage(1); }}
              className={cn(
                "inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium leading-none whitespace-nowrap transition-all duration-200 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:ring-offset-2 min-w-32",
                isActive
                  ? activeClass
                  : "text-slate-500 border border-transparent bg-transparent hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200"
              )}
            >
              {label}
              {!statsLoading && (
                <span
                  className={cn(
                    "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                    isActive
                      ? "bg-white text-gray-800 shadow-sm ring-1 ring-inset ring-black/10 dark:bg-slate-900 dark:text-gray-100 dark:ring-white/20"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-xl border-2 border-border bg-card">
        <div className="relative shrink-0 bg-muted/40 dark:bg-muted/30">
          <div className="grid grid-cols-[1.1fr_1.7fr_1.3fr_1.1fr_0.9fr_1.3fr] gap-x-4 items-center px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-foreground/60">
            <div>Order ID</div>
            <div>Recipient</div>
            <div>Phone</div>
            <div className="text-center">Status</div>
            <button
              type="button"
              onClick={() => toggleSort("amount")}
              className="flex items-center justify-end gap-1 cursor-pointer hover:text-foreground/90 transition-colors text-right"
            >
              Amount <SortIcon field="amount" sortField={sortField} sortDir={sortDir} />
            </button>
            <button
              type="button"
              onClick={() => toggleSort("created_at")}
              className="flex items-center gap-1 cursor-pointer hover:text-foreground/90 transition-colors"
            >
              Placed On <SortIcon field="created_at" sortField={sortField} sortDir={sortDir} />
            </button>
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
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <p className="mt-3 text-sm font-medium text-foreground">Could not load orders</p>
                  <p className="mt-1 text-sm text-muted-foreground">{error?.message || "Please try again."}</p>
                  <button
                    type="button"
                    onClick={() => refetch?.({ preserveData: false })}
                    className="mt-4 inline-flex items-center rounded-md border-2 border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : filtered.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {sortedFiltered.map((order) => (
                    <div
                      key={order.order_id}
                      className="grid grid-cols-[1.1fr_1.7fr_1.3fr_1.1fr_0.9fr_1.3fr] gap-x-4 items-center px-4 py-3 hover:bg-muted/40 transition-colors duration-200 cursor-pointer"
                      onClick={() => navigate(`/deliveries/${order.order_id}`)}
                    >
                      <div className="font-mono text-xs font-semibold">
                        {order.order_id}
                      </div>
                      <div className="text-sm font-medium">
                        {order.recipient_name || "—"}
                      </div>
                      <div className="text-sm font-normal text-muted-foreground">
                        {order.recipient_phone || "—"}
                      </div>
                      <div className="flex justify-center">
                        <Badge variant={statusColors[order.status] || "secondary"} className="uppercase tracking-widest text-[10px] font-bold font-mono min-w-26 justify-center">
                          {(order.status || "unknown").replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-right tabular-nums">
                        {order.amount != null ? `৳${order.amount}` : "—"}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <span>{formatOrderDate(order.created_at)}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm font-medium text-foreground">
                    {activeFilterCount > 0 ? "No orders match your filters" : "No orders found"}
                  </p>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-md border-2 border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear filters
                    </button>
                  )}
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
