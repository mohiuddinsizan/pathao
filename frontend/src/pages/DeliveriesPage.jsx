import { useCallback, useEffect, useRef, useState } from "react";
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
import { AlertCircle, Search, ChevronRight, X, ArrowUp, ArrowDown, Plus, Loader2, LayoutList, Clock, UserCheck, Package, Truck, CheckCircle, XCircle, Eye, SlidersHorizontal } from "lucide-react";
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

const statusIcons = {
  pending:    Clock,
  assigned:   UserCheck,
  picked_up:  Package,
  in_transit: Truck,
  delivered:  CheckCircle,
  cancelled:  XCircle,
};

// activeClass mirrors Badge variant colors exactly for full consistency
const STATUS_TABS = [
  {
    key: "all",
    label: "All",
    icon: LayoutList,
    activeClass: "bg-foreground text-background border border-foreground shadow-sm font-bold",
    activePillClass: "bg-background/30 text-background",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    activeClass: "bg-amber-500/30 text-foreground border border-amber-500/40 shadow-sm font-bold",
    activePillClass: "bg-background/80 text-foreground",
  },
  {
    key: "assigned",
    label: "Assigned",
    icon: UserCheck,
    activeClass: "bg-sky-500/30 text-foreground border border-sky-500/40 shadow-sm font-bold",
    activePillClass: "bg-background/80 text-foreground",
  },
  {
    key: "picked_up",
    label: "Picked Up",
    icon: Package,
    activeClass: "bg-teal-500/30 text-foreground border border-teal-500/40 shadow-sm font-bold",
    activePillClass: "bg-background/80 text-foreground",
  },
  {
    key: "in_transit",
    label: "In Transit",
    icon: Truck,
    activeClass: "bg-orange-500/30 text-foreground border border-orange-500/40 shadow-sm font-bold",
    activePillClass: "bg-background/80 text-foreground",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: CheckCircle,
    activeClass: "bg-emerald-500/30 text-foreground border border-emerald-500/40 shadow-sm font-bold",
    activePillClass: "bg-background/80 text-foreground",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    activeClass: "bg-red-500/30 text-foreground border border-red-500/40 shadow-sm font-bold",
    activePillClass: "bg-background/80 text-foreground",
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
    <div className="grid grid-cols-[0.85fr_1.2fr_1fr_0.95fr_0.8fr_1.1fr_auto] gap-x-3">
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
  const sentinelRef = useRef(null);
  const [page, setPage] = useState(1);
  const [allOrders, setAllOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState([]);
  const [storeFilter, setStoreFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDatePreset, setSelectedDatePreset] = useState(null);
  const [sortField, setSortField] = useState(null); // "amount" | "created_at" | null
  const [sortDir, setSortDir] = useState("desc");
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Per-tab cache: remembers loaded orders + page for each status tab
  const tabCacheRef = useRef({});

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
    tabCacheRef.current = {};
    setAllOrders([]);
    setFilter("all");
    setStoreFilter("all");
    setDateFrom("");
    setDateTo("");
    setSelectedDatePreset(null);
    setSearch("");
    setPage(1);
  };

  const orders = ordersData?.orders || [];
  const totalPages = ordersData?.pages ?? 0;
  const hasNextPage = totalPages > 0 ? page < totalPages : orders.length === 20;
  const loadingMore = loading && allOrders.length > 0;
  const [autoLoadPhase, setAutoLoadPhase] = useState("idle"); // idle | pending | fetching
  const showSkeletons = autoLoadPhase !== "idle";

  // Graceful auto-load: keep a stable phase flow to avoid loading flicker
  useEffect(() => {
    if (autoLoadPhase !== "pending") return;
    const timer = setTimeout(() => {
      setPage((p) => p + 1);
      setAutoLoadPhase("fetching");
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoLoadPhase]);

  // Exit fetching phase only after the request settles, with a small buffer
  useEffect(() => {
    if (autoLoadPhase !== "fetching") return;
    if (loading || loadingMore) return;
    const timer = setTimeout(() => setAutoLoadPhase("idle"), 250);
    return () => clearTimeout(timer);
  }, [autoLoadPhase, loading, loadingMore]);

  // Accumulate orders across pages and persist to per-tab cache
  useEffect(() => {
    if (!orders.length) return;
    setAllOrders((prev) => {
      let next;
      if (page === 1) {
        next = orders;
      } else {
        const existingIds = new Set(prev.map((o) => o.order_id));
        const newOrders = orders.filter((o) => !existingIds.has(o.order_id));
        next = newOrders.length > 0 ? [...prev, ...newOrders] : prev;
      }
      // Save to per-tab cache so we can restore when switching back
      const cacheKey = `${filter}__${storeFilter}`;
      tabCacheRef.current[cacheKey] = { orders: next, page };
      return next;
    });
  }, [orders, page, filter, storeFilter]);

  // When filter/storeFilter changes: save current state to cache, restore target tab
  const prevFilterRef = useRef({ filter, storeFilter });
  useEffect(() => {
    const prev = prevFilterRef.current;
    if (prev.filter === filter && prev.storeFilter === storeFilter) return;
    prevFilterRef.current = { filter, storeFilter };
    setAutoLoadPhase("idle");

    // Restore from per-tab cache if available
    const cacheKey = `${filter}__${storeFilter}`;
    const cached = tabCacheRef.current[cacheKey];
    if (cached) {
      setAllOrders(cached.orders);
      setPage(cached.page);
    } else {
      setAllOrders([]);
      setPage(1);
    }
  }, [filter, storeFilter]);

  // IntersectionObserver: auto-load next page when sentinel enters viewport
  const loadNextPage = useCallback(() => {
    if (!loading && hasNextPage && autoLoadPhase === "idle") setAutoLoadPhase("pending");
  }, [loading, hasNextPage, autoLoadPhase]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollRef.current;
    if (!sentinel || !container || !hasNextPage || loading || autoLoadPhase !== "idle") return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadNextPage(); },
      { root: container, threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, loading, autoLoadPhase, loadNextPage, allOrders.length]);

  // Since each tab now has its own cached orders, just use allOrders directly.
  // The API already filters by status, so allOrders contains the right data for the active tab.
  const statusScopedOrders = allOrders;

  const filtered = statusScopedOrders
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
  }, [loading, filtered.length, page]);

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 lg:p-6 gap-4">
      {/* Page bar: title + Create Parcel CTA */}
      <div className="shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Deliveries</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`h-9 gap-1.5 cursor-pointer ${filtersVisible || activeFilterCount > 0 ? "border-primary text-primary" : ""}`}
            onClick={() => setFiltersVisible((v) => !v)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {activeFilterCount > 0 && (
              <span className="text-xs bg-primary text-primary-foreground rounded-full h-4 w-4 inline-flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5 cursor-pointer"
            onClick={() => navigate("/deliveries/new")}
          >
            <Plus className="h-4 w-4" />
            Create Parcel
          </Button>
        </div>
      </div>

      {/* Collapsible filter card */}
      {filtersVisible && (
      <div className="shrink-0 rounded-lg border border-border bg-card p-3 space-y-3">
        {/* Row 1: Search + Store */}
        <div className="flex items-center gap-2">
          <div className="relative w-56 xl:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Name, phone, or ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-8 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Select
            value={storeFilter}
            onValueChange={(v) => { setStoreFilter(v); setPage(1); }}
          >
            <SelectTrigger className={cn("h-8 w-40 text-xs", storeFilter !== "all" && "border-primary bg-primary/10 text-primary")}>
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
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="ml-auto inline-flex items-center gap-1 h-7 rounded-md px-2.5 text-xs font-medium text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>

        {/* Row 2: Date presets + Custom range */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "Today", key: "today", from: 0, to: 0 },
            { label: "Yesterday", key: "yesterday", from: 1, to: 1 },
            { label: "7d", key: "7d", from: 6, to: 0 },
            { label: "30d", key: "30d", from: 29, to: 0 },
          ].map(({ label, key, from, to }) => {
            const isPresetActive = selectedDatePreset === key;
            const apply = () => {
              if (isPresetActive) {
                setDateFrom("");
                setDateTo("");
                setSelectedDatePreset(null);
                setPage(1);
                return;
              }
              const fmt = (d) => d.toISOString().split("T")[0];
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const start = new Date(today);
              start.setDate(start.getDate() - from);
              const end = new Date(today);
              end.setDate(end.getDate() - to);
              setDateFrom(fmt(start));
              setDateTo(fmt(end));
              setSelectedDatePreset(key);
              setPage(1);
            };
            return (
              <button
                key={label}
                type="button"
                onClick={apply}
                className={cn(
                  "h-7 rounded-md border px-2.5 text-xs font-medium transition-colors cursor-pointer",
                  isPresetActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {label}
              </button>
            );
          })}

          <div className="h-5 w-px bg-border" />

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setSelectedDatePreset(null); setPage(1); }}
            className={cn(
              "h-8 rounded-md border bg-background px-2 text-xs cursor-pointer",
              dateFrom ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground"
            )}
            title="From date"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setSelectedDatePreset(null); setPage(1); }}
            className={cn(
              "h-8 rounded-md border bg-background px-2 text-xs cursor-pointer",
              dateTo ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground"
            )}
            title="To date"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Row 3: Status tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {STATUS_TABS.map(({ key, label, icon: Icon, activeClass, activePillClass }) => {
            const hasClientFilters = search.trim() !== "" || dateFrom !== "" || dateTo !== "";
            let count;
            if (filter === "all") {
              count = key === "all" ? filtered.length : filtered.filter((o) => o.status === key).length;
            } else if (key === filter) {
              count = filtered.length;
            } else if (!hasClientFilters && !statsLoading) {
              count = key === "all" ? totalCount : (orderCounts[key] ?? 0);
            } else {
              count = "–";
            }
            const isActive = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => { setFilter(key); setPage(1); }}
                className={cn(
                  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold font-mono uppercase leading-none whitespace-nowrap transition-all duration-200 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:ring-offset-2",
                  isActive
                    ? activeClass
                    : "border-border text-muted-foreground bg-transparent hover:bg-muted hover:text-foreground"
                )}
              >
                  <Icon className="h-3.5 w-3.5 stroke-[2.4]" />
                {label}
                <span
                  className={cn(
                    "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                    isActive
                      ? activePillClass
                      : "bg-muted text-muted-foreground"
                  )}
                  title={count === "–" ? "Count unavailable — clear filters to see all counts" : undefined}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* Table */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-xl border-2 border-border bg-card">
        <div className="relative shrink-0 bg-muted/40 dark:bg-muted/30">
          <div className="grid grid-cols-[0.85fr_1.2fr_1fr_0.95fr_0.8fr_1.1fr_auto] gap-x-3 items-center px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-foreground/60">
            <div className="text-left pl-2">Order ID</div>
            <div className="text-left">Recipient</div>
            <div className="text-left pl-1">Phone</div>
            <div className="text-center">Status</div>
            <button
              type="button"
              onClick={() => toggleSort("amount")}
              className="flex items-center justify-end pr-3 gap-1 cursor-pointer hover:text-foreground/90 transition-colors text-right"
            >
              Amount <SortIcon field="amount" sortField={sortField} sortDir={sortDir} />
            </button>
            <button
              type="button"
              onClick={() => toggleSort("created_at")}
              className="flex items-center justify-center gap-1 cursor-pointer hover:text-foreground/90 transition-colors"
            >
              Time <SortIcon field="created_at" sortField={sortField} sortDir={sortDir} />
            </button>
            <div className="text-center">Detail</div>
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
              {loading && allOrders.length === 0 ? (
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
                <>
                <div className="divide-y divide-border/50">
                  {sortedFiltered.map((order) => (
                    <div
                      key={order.order_id}
                      className="grid grid-cols-[0.85fr_1.2fr_1fr_0.95fr_0.8fr_1.1fr_auto] gap-x-3 items-center px-4 py-3 border-l-2 border-l-transparent hover:border-l-primary hover:bg-muted/80 transition-all duration-150"
                    >
                      <div className="font-mono text-xs font-semibold text-left pl-2">
                        {order.order_id}
                      </div>
                      <div className="text-sm font-medium truncate text-left">
                        {order.recipient_name || "—"}
                      </div>
                      <div className="text-sm font-normal text-muted-foreground text-left pl-1">
                        {order.recipient_phone || "—"}
                      </div>
                      <div className="flex justify-center">
                        {(() => {
                          const StatusIcon = statusIcons[order.status];
                          return (
                            <Badge variant={statusColors[order.status] || "secondary"} className="uppercase text-[10px] font-bold font-mono min-w-26 justify-center gap-1">
                              {StatusIcon && <StatusIcon className="h-3.5 w-3.5 stroke-[2.4]" />}
                              {(order.status || "unknown").replace(/_/g, " ")}
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="text-sm font-medium text-right tabular-nums pr-3">
                        {order.amount != null ? `৳${order.amount}` : "—"}
                      </div>
                      <div className="relative flex items-center justify-center text-sm font-medium text-muted-foreground">
                        <span className="text-center">{formatOrderDate(order.created_at)}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/deliveries/${order.order_id}`)}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                          title="View details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {showSkeletons && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Loading more...</span>
                  </div>
                )}
                {hasNextPage ? (
                  <div ref={sentinelRef} className="h-1" />
                ) : allOrders.length > 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">All orders loaded</p>
                ) : null}
                </>
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

    </div>
  );
}
