import { useEffect, useState, useRef } from "react";
import { getDashboardStats, getRecentOrders } from "@/api/dashboard";
import { Badge } from "@/components/ui/badge";
import { Package, Store, TrendingUp, Banknote, Eye, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusColors = {
  pending: "warning",
  assigned: "info",
  picked_up: "info",
  in_transit: "info",
  delivered: "success",
  cancelled: "destructive",
};

function StatCard({ title, value, icon: Icon, href, actionLabel }) {
  const navigate = useNavigate();
  const isClickable = href && !actionLabel;
  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border-2 border-border bg-card px-4 py-3 ${
        isClickable ? 'cursor-pointer hover:bg-muted/50 transition-colors duration-200' : ''
      }`}
      onClick={() => isClickable && navigate(href)}
      role={isClickable ? 'link' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => e.key === 'Enter' && isClickable && navigate(href)}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-xl font-bold leading-tight">{value}</p>
        </div>
      </div>
      {actionLabel && href && (
        <button
          onClick={() => navigate(href)}
          className="text-xs text-primary hover:underline text-right cursor-pointer"
        >
          {actionLabel} →
        </button>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-border bg-card px-4 py-3">
      <div className="h-9 w-9 rounded-lg bg-muted animate-pulse shrink-0" />
      <div className="space-y-1.5">
        <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        <div className="h-5 w-10 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr] px-6 py-3.5">
      <div className="h-4 w-20 rounded bg-muted animate-pulse" />
      <div className="h-4 w-32 rounded bg-muted animate-pulse" />
      <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
    </div>
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
    <div className="flex flex-col h-full p-4 lg:p-6 overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Stats grid */}
      <div className="shrink-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
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
              title="Total Parcels"
              value={stats.total_orders ?? 0}
              icon={Package}
              href="/deliveries"
            />
            <StatCard
              title="Total Income"
              value={`৳${(stats.total_revenue ?? 0).toLocaleString()}`}
              icon={Banknote}
              href="/payments"
            />
            <StatCard
              title="Active Stores"
              value={stats.stores ?? 0}
              icon={Store}
              href="/stores"
            />
            <StatCard
              title="Completed Deliveries"
              value={stats.delivered ?? 0}
              icon={CheckCircle2}
              href="/analytics"
              actionLabel="View Analytics"
            />
          </>
        ) : (
          <>
            <StatCard title="Total Parcels" value="—" icon={Package} />
            <StatCard title="Total Income" value="—" icon={Banknote} />
            <StatCard title="Active Stores" value="—" icon={Store} />
            <StatCard title="Completed Deliveries" value="—" icon={CheckCircle2} />
          </>
        )}
      </div>

      {/* Recent orders */}
      <RecentOrdersTable loading={loading} orders={orders} />
    </div>
  );
}

function RecentOrdersTable({ loading, orders }) {
  const scrollRef = useRef(null);
  const progressRef = useRef(null);
  const topBlurRef = useRef(null);
  const bottomBlurRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
      if (progressRef.current) {
        progressRef.current.style.width = `${progress * 100}%`;
      }
      if (topBlurRef.current) {
        topBlurRef.current.style.opacity = scrollTop > 0 ? "1" : "0";
      }
      if (bottomBlurRef.current) {
        bottomBlurRef.current.style.opacity = scrollTop < maxScroll - 1 ? "1" : "0";
      }
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [loading, orders]);

  return (
    <div className="flex flex-col min-h-0 flex-1 mt-6 rounded-xl border-2 border-border bg-card overflow-hidden">
      {/* Title section */}
      <div className="shrink-0 px-6 py-4">
        <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
      </div>

      {/* Column headers with integrated progress bar as bottom border */}
      <div className="shrink-0 bg-primary/[0.03] dark:bg-primary/[0.06] border-t-2 border-border relative">
        <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_auto] items-center px-6 py-3.5">
          <span className="text-xs font-extrabold uppercase tracking-widest text-foreground/80">Order ID</span>
          <span className="text-xs font-extrabold uppercase tracking-widest text-foreground/80">Recipient</span>
          <span className="text-xs font-extrabold uppercase tracking-widest text-foreground/80 text-center">Status</span>
          <span className="text-xs font-extrabold uppercase tracking-widest text-foreground/80">Created</span>
          <span className="w-8" />
        </div>
        {/* Progress bar acts as the bottom separator */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-border overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* Scrollable rows with blur edges */}
      <div className="relative flex-1 min-h-0">
        <div ref={topBlurRef} className="pointer-events-none absolute top-0 left-0 right-0 h-6 z-10 bg-gradient-to-b from-card to-transparent opacity-0 transition-opacity duration-200" />
        <div ref={scrollRef} className="h-full overflow-y-auto scrollbar-hidden">
          {loading ? (
            <div className="divide-y divide-border">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="divide-y divide-border/50">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="grid grid-cols-[1fr_1.5fr_1fr_1fr_auto] items-center px-6 py-3.5 hover:bg-muted/40 transition-colors duration-200 cursor-default group"
                >
                  <span className="font-mono text-xs font-semibold">{order.order_id}</span>
                  <span className="text-sm font-medium">{order.recipient_name || "—"}</span>
                  <span className="flex justify-center">
                    <Badge variant={statusColors[order.status] || "secondary"}>
                      {(order.status || "unknown").replace(/_/g, " ")}
                    </Badge>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : "—"}
                  </span>
                  <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer" title="View details">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No orders found
            </div>
          )}
        </div>
        <div ref={bottomBlurRef} className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 z-10 bg-gradient-to-t from-card to-transparent opacity-0 transition-opacity duration-200" />
      </div>
    </div>
  );
}
