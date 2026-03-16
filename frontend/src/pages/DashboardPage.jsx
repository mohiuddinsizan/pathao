import { useEffect, useRef, useState } from "react";
import { getDashboardStats, getRecentActivity } from "@/api/dashboard";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Loader2,
  Package,
  Store,
  Truck,
  UserCheck,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

function StatCard({ title, value, icon: Icon, href, variant = "metric" }) {
  const navigate = useNavigate();
  const hasValue = value !== "" && value !== null && value !== undefined;
  const isCta = variant === "cta";

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border-2 transition-all duration-200 ${
        isCta
          ? "cursor-pointer border-primary/30 bg-primary/5 px-4 py-3 hover:border-primary/60 hover:bg-primary/10 dark:bg-primary/8 dark:hover:bg-primary/15"
          : `border-border bg-card px-4 py-3 ${href ? "cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/55" : ""}`
      }`}
      onClick={() => href && navigate(href)}
      role={href ? "link" : undefined}
      tabIndex={href ? 0 : undefined}
      onKeyDown={(event) => {
        if (event.key === "Enter" && href) {
          navigate(href);
        }
      }}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          isCta ? "bg-primary/15 text-primary" : "bg-primary/10 text-primary"
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          {isCta ? (
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary">{title}</p>
              <ArrowRight className="h-4 w-4 shrink-0 text-primary/70" />
            </div>
          ) : hasValue ? (
            <>
              <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
              <p className="text-xl font-bold leading-tight">{value}</p>
            </>
          ) : (
            <p className="text-sm font-semibold text-foreground/80">{title}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-border bg-card px-4 py-3">
      <div className="h-9 w-9 shrink-0 rounded-lg bg-muted animate-pulse" />
      <div className="space-y-1.5">
        <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        <div className="h-5 w-10 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[2.75rem_1fr] gap-4">
      <div className="relative flex h-full items-center justify-center self-stretch">
        <div className="absolute left-1/2 top-1/2 z-1 h-10 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card" />
        <div className="relative z-10 h-8 w-8 animate-pulse rounded-full border-[3px] border-border bg-muted/70" />
      </div>
      <div className="space-y-2 rounded-2xl border-2 border-border/80 px-4 py-2.5">
        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        <div className="h-3 w-44 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function formatActivityTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const day = date.getDate();
  const mod100 = day % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13
      ? "th"
      : day % 10 === 1
      ? "st"
      : day % 10 === 2
      ? "nd"
      : day % 10 === 3
      ? "rd"
      : "th";

  const month = date.toLocaleDateString([], { month: "long" });
  const year = date.getFullYear();

  const timePart = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${day}${suffix} ${month}, ${year} • ${timePart}`;
}

function formatStatusLabel(status) {
  if (!status) return "";
  return status.replace(/_/g, " ");
}

function getStatusVariant(status) {
  if (status === "delivered") return "success";
  if (status === "cancelled") return "destructive";
  if (status === "assigned" || status === "picked_up" || status === "in_transit") return "info";
  return "warning";
}

function getActivityMeta(activity) {
  if (activity.type === "parcel_created") {
    return {
      icon: Package,
      color: "text-foreground bg-sky-500/35 dark:bg-sky-400/45",
      borderColor: "border-sky-500/55 dark:border-sky-400/40",
      titleClass: "text-foreground",
      referenceClass: "border-sky-500/20 bg-sky-500/10 text-foreground",
      statusClass: "border-sky-500/20 bg-sky-500/10 text-foreground",
    };
  }
  if (activity.type === "parcel_status_changed") {
    if (activity.status === "assigned") {
      return {
        icon: UserCheck,
        color: "text-foreground bg-indigo-500/35 dark:bg-indigo-400/45",
        borderColor: "border-indigo-500/55 dark:border-indigo-400/40",
        titleClass: "text-foreground",
        referenceClass: "border-indigo-500/20 bg-indigo-500/10 text-foreground",
        statusClass: "border-indigo-500/20 bg-indigo-500/10 text-foreground",
      };
    }
    if (activity.status === "picked_up") {
      return {
        icon: Package,
        color: "text-foreground bg-amber-500/35 dark:bg-amber-400/45",
        borderColor: "border-amber-500/55 dark:border-amber-400/40",
        titleClass: "text-foreground",
        referenceClass: "border-amber-500/20 bg-amber-500/10 text-foreground",
        statusClass: "border-amber-500/20 bg-amber-500/10 text-foreground",
      };
    }
    if (activity.status === "in_transit") {
      return {
        icon: Truck,
        color: "text-foreground bg-cyan-500/35 dark:bg-cyan-400/45",
        borderColor: "border-cyan-500/55 dark:border-cyan-400/40",
        titleClass: "text-foreground",
        referenceClass: "border-cyan-500/20 bg-cyan-500/10 text-foreground",
        statusClass: "border-cyan-500/20 bg-cyan-500/10 text-foreground",
      };
    }
    if (activity.status === "delivered") {
      return {
        icon: CheckCircle2,
        color: "text-foreground bg-emerald-500/35 dark:bg-emerald-400/45",
        borderColor: "border-emerald-500/55 dark:border-emerald-400/40",
        titleClass: "text-foreground",
        referenceClass: "border-emerald-500/20 bg-emerald-500/10 text-foreground",
        statusClass: "border-emerald-500/20 bg-emerald-500/10 text-foreground",
      };
    }
    return {
      icon: Clock3,
      color: "text-foreground bg-slate-500/35 dark:bg-slate-400/45",
      borderColor: "border-slate-500/55 dark:border-slate-400/40",
      titleClass: "text-foreground",
      referenceClass: "border-slate-500/20 bg-slate-500/10 text-foreground",
      statusClass: "border-slate-500/20 bg-slate-500/10 text-foreground",
    };
  }
  if (activity.type === "store_created") {
    return {
      icon: Store,
      color: "text-foreground bg-violet-500/35 dark:bg-violet-400/45",
      borderColor: "border-violet-500/55 dark:border-violet-400/40",
      titleClass: "text-foreground",
      referenceClass: "border-violet-500/20 bg-violet-500/10 text-foreground",
      statusClass: "border-violet-500/20 bg-violet-500/10 text-foreground",
    };
  }
  if (activity.type === "store_updated") {
    return {
      icon: AlertCircle,
      color: "text-foreground bg-orange-500/35 dark:bg-orange-400/45",
      borderColor: "border-orange-500/55 dark:border-orange-400/40",
      titleClass: "text-foreground",
      referenceClass: "border-orange-500/20 bg-orange-500/10 text-foreground",
      statusClass: "border-orange-500/20 bg-orange-500/10 text-foreground",
    };
  }
  if (activity.type === "store_deactivated") {
    return {
      icon: AlertCircle,
      color: "text-foreground bg-red-500/35 dark:bg-red-400/45",
      borderColor: "border-red-500/55 dark:border-red-400/40",
      titleClass: "text-foreground",
      referenceClass: "border-red-500/20 bg-red-500/10 text-foreground",
      statusClass: "border-red-500/20 bg-red-500/10 text-foreground",
    };
  }
  return {
    icon: Store,
    color: "text-foreground bg-muted",
    borderColor: "border-slate-500/55 dark:border-slate-400/30",
    titleClass: "text-foreground",
    referenceClass: "border-border bg-muted text-foreground",
    statusClass: "border-border bg-muted text-foreground",
  };
}

function ActivityItem({ activity, isFirst, isLast, isNew }) {
  const navigate = useNavigate();
  const { icon: Icon, color, titleClass, referenceClass, statusClass, borderColor } = getActivityMeta(activity);
  const isClickable = Boolean(activity.href);

  return (
    <div className={isNew ? "animate-in fade-in slide-in-from-bottom-2 duration-500" : undefined}>
    <div className="grid grid-cols-[2.75rem_1fr] gap-4">
      <div className="relative flex h-full items-center justify-center self-stretch">
        {isFirst ? (
          <div className="absolute bottom-[calc(50%+1rem)] left-1/2 top-0 z-1 w-3 -translate-x-1/2 rounded-full bg-card" />
        ) : null}
        {isLast ? (
          <div className="absolute bottom-0 left-1/2 top-[calc(50%+1rem)] z-1 w-3 -translate-x-1/2 rounded-full bg-card" />
        ) : null}
        <div className="absolute left-1/2 top-1/2 z-1 h-10 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card" />
        <div className={`relative z-10 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-4 bg-background ${borderColor}`}>
          <div className={`flex h-full w-full items-center justify-center rounded-full ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div
        className={`group relative rounded-2xl border-2 border-border/80 px-4 py-2.5 transition-all duration-300 ease-out hover:border-border hover:shadow-sm ${
          isClickable ? "cursor-pointer hover:bg-muted/30" : ""
        }`}
        onClick={() => isClickable && navigate(activity.href)}
        role={isClickable ? "link" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={(event) => {
          if (event.key === "Enter" && isClickable) {
            navigate(activity.href);
          }
        }}
      >
        {/* Always visible: title + time */}
        <p className={`text-sm font-semibold leading-snug ${titleClass}`}>{activity.title}</p>
        <div className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-foreground/90">
          <Clock3 className="h-3.5 w-3.5" />
          {formatActivityTime(activity.occurred_at)}
        </div>

        {/* Hover-only: expand via CSS grid trick — zero height by default, natural height on hover */}
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 opacity-0 transition-opacity duration-200 delay-100 group-hover:opacity-100">
              {activity.description ? (
                <span className="w-full text-xs text-muted-foreground">{activity.description}</span>
              ) : null}
              <div className="flex w-full items-center gap-2">
                {activity.reference ? (
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-mono ${referenceClass}`}>
                    {activity.reference}
                  </span>
                ) : null}
                {activity.type === "parcel_status_changed" && activity.status ? (
                  <Badge variant={getStatusVariant(activity.status)} className="capitalize text-xs">
                    {formatStatusLabel(activity.status)}
                  </Badge>
                ) : null}
                {isClickable ? (
                  <ChevronRight className="ml-auto h-4 w-4 text-primary/60" />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default function DashboardPage() {
  const PAGE_SIZE = 10;
  const [activityOffset, setActivityOffset] = useState(0);
  const [activityItems, setActivityItems] = useState([]);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
  const [prevCount, setPrevCount] = useState(0);

  const { data: stats, loading: statsLoading } = useCachedQuery("dashboard-stats-v2", getDashboardStats);
  const {
    data: activitiesPage,
    loading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useCachedQuery(`dashboard-recent-activity-v3-${activityOffset}`, () =>
    getRecentActivity({ limit: PAGE_SIZE, offset: activityOffset })
  );

  const initialLoading = activitiesLoading && activityItems.length === 0;
  const loadingMore = activitiesLoading && activityItems.length > 0;

  useEffect(() => {
    if (!activitiesPage) return;
    if (activityOffset === 0) {
      setActivityItems(activitiesPage);
    } else {
      setActivityItems((prev) => {
        const existing = new Set(prev.map((item) => `${item.type}-${item.reference ?? "x"}-${item.occurred_at}`));
        const next = activitiesPage.filter((item) => !existing.has(`${item.type}-${item.reference ?? "x"}-${item.occurred_at}`));
        return [...prev, ...next];
      });
    }

    setHasMoreActivities(Array.isArray(activitiesPage) && activitiesPage.length === PAGE_SIZE);
  }, [activitiesPage, activityOffset]);

  return (
    <div className="flex h-full flex-col overflow-hidden p-4 lg:p-6">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Daily snapshot (today)</p>
      </div>

      <div className="mt-6 grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : stats ? (
          <>
            <StatCard title="Pending Parcels" value={stats.pending ?? 0} icon={Package} href="/deliveries" />
            <StatCard title="Delivered" value={stats.delivered_today ?? 0} icon={CheckCircle2} href="/deliveries" />
            <StatCard
              title="Revenue"
              value={`৳${(stats.revenue_today ?? 0).toLocaleString()}`}
              icon={Banknote}
              href="/payments"
            />
            <StatCard title="View Analytics" value="" icon={BarChart3} href="/analytics" />
          </>
        ) : (
          <>
            <StatCard title="Pending Parcels" value="—" icon={Package} />
            <StatCard title="Delivered" value="—" icon={CheckCircle2} />
            <StatCard title="Revenue" value="—" icon={Banknote} />
            <StatCard title="View Analytics" value="" icon={BarChart3} href="/analytics" variant="cta" />
          </>
        )}
      </div>

      <RecentActivityFeed
        loading={initialLoading}
        loadingMore={loadingMore}
        activities={activityItems}
        newItemsFrom={prevCount}
        error={activitiesError}
        onRetry={() => refetchActivities?.({ preserveData: false })}
        onLoadMore={() => {
          if (activitiesLoading || !hasMoreActivities) return;
          setPrevCount(activityItems.length);
          setActivityOffset((prev) => prev + PAGE_SIZE);
        }}
        hasMore={hasMoreActivities}
        loadedCount={activityItems.length}
      />
    </div>
  );
}

function RecentActivityFeed({ loading, loadingMore, activities, newItemsFrom, error, onRetry, onLoadMore, hasMore, loadedCount }) {
  const scrollRef = useRef(null);
  const progressRef = useRef(null);
  const topBlurRef = useRef(null);
  const bottomBlurRef = useRef(null);
  const loadMoreAnchorRef = useRef(null);

  // Auto-scroll to show the skeleton loader when loading more
  useEffect(() => {
    if (loadingMore && loadMoreAnchorRef.current) {
      loadMoreAnchorRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [loadingMore]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
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
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => element.removeEventListener("scroll", onScroll);
  }, [loading, activities]);

  return (
    <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-2 border-border bg-card">
      <div className="shrink-0 px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="About recent activity"
                >
                  <CircleHelp className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Recent parcel and store events across your merchant account. Use Load more to expand the list.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="relative shrink-0 border-t-2 border-border bg-muted/40 dark:bg-muted/30">
        <div className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-foreground/60">Loaded {loadedCount} events</div>
        <div className="absolute bottom-0 left-0 right-0 h-0.75 overflow-hidden bg-border">
          <div
            ref={progressRef}
            className="h-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: "0%" }}
          />
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={topBlurRef}
          className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-6 bg-linear-to-b from-card to-transparent opacity-0 transition-opacity duration-200"
        />
        <div ref={scrollRef} className="h-full overflow-y-auto scrollbar-hidden">
          {loading ? (
            <div className="px-6 py-4">
              <div className="relative space-y-4">
                <div className="pointer-events-none absolute bottom-4 left-5.5 top-4 z-0 w-1.5 -translate-x-1/2 rounded-full bg-slate-500/55 dark:bg-slate-400/30" />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-8 text-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <p className="mt-3 text-sm font-medium text-foreground">Could not load recent activity</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error.message || "Please try again."}</p>
              <button
                type="button"
                onClick={() => onRetry?.({ preserveData: false })}
                className="mt-4 inline-flex items-center rounded-md border-2 border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Retry
              </button>
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="px-6 py-4">
              <div className="relative space-y-4">
                <div className="pointer-events-none absolute bottom-4 left-5.5 top-4 z-0 w-1.5 -translate-x-1/2 rounded-full bg-slate-500/55 dark:bg-slate-400/30" />
                {activities.map((activity, index) => (
                  <ActivityItem
                    key={`${activity.type}-${activity.reference ?? "item"}-${activity.occurred_at ?? index}`}
                    activity={activity}
                    isFirst={index === 0}
                    isLast={index === activities.length - 1 && !loadingMore}
                    isNew={newItemsFrom > 0 && index >= newItemsFrom}
                  />
                ))}
                {loadingMore ? (
                  <div ref={loadMoreAnchorRef} className="space-y-4 pt-1">
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </div>
                ) : null}
              </div>
              <div className="mt-4 flex justify-center">
                {hasMore ? (
                  <button
                    type="button"
                    onClick={onLoadMore}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-md border-2 border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      "Load more"
                    )}
                  </button>
                ) : (
                  <p className="text-xs text-muted-foreground">You’re all caught up</p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No recent activity found</div>
          )}
        </div>
        <div
          ref={bottomBlurRef}
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-6 bg-linear-to-t from-card to-transparent opacity-0 transition-opacity duration-200"
        />
      </div>
    </div>
  );
}
