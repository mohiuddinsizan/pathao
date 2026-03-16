import { useEffect, useRef } from "react";
import { getDashboardStats, getRecentActivity } from "@/api/dashboard";
import { useCachedQuery } from "@/hooks/use-cached-query";
import {
  AlertCircle,
  ArrowUpRight,
  Banknote,
  BarChart3,
  CheckCircle2,
  CircleHelp,
  Clock3,
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

function StatCard({ title, value, icon: Icon, href }) {
  const navigate = useNavigate();
  const hasValue = value !== "" && value !== null && value !== undefined;

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border-2 border-border bg-card px-4 py-3 transition-all duration-200 ${
        href ? "cursor-pointer hover:bg-muted/50 hover:shadow-[0_0_0_3px_rgba(15,23,42,0.06)] hover:-translate-y-0.5" : ""
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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          {hasValue ? (
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
      <div className="flex h-full flex-col items-center self-stretch">
        <div className="w-px flex-1 bg-transparent" />
        <div className="my-1 h-8 w-8 rounded-full border-[3px] border-border bg-muted/70 animate-pulse" />
        <div className="w-px flex-1 bg-border" />
      </div>
      <div className="space-y-2 rounded-lg border-2 border-border/80 px-3 py-3">
        <div className="h-4 w-36 rounded bg-muted animate-pulse" />
        <div className="h-3 w-52 rounded bg-muted animate-pulse" />
        <div className="h-3 w-28 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

function formatActivityTime(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatStatusLabel(status) {
  if (!status) return "";
  return status.replace(/_/g, " ");
}

function getActivityMeta(activity) {
  if (activity.type === "parcel_created") {
    return {
      icon: Package,
      color: "text-foreground bg-sky-500/12",
      titleClass: "text-foreground",
      referenceClass: "border-sky-500/20 bg-sky-500/10 text-foreground",
      statusClass: "border-sky-500/20 bg-sky-500/10 text-foreground",
    };
  }
  if (activity.type === "parcel_status_changed") {
    if (activity.status === "assigned") {
      return {
        icon: UserCheck,
        color: "text-foreground bg-indigo-500/12",
        titleClass: "text-foreground",
        referenceClass: "border-indigo-500/20 bg-indigo-500/10 text-foreground",
        statusClass: "border-indigo-500/20 bg-indigo-500/10 text-foreground",
      };
    }
    if (activity.status === "picked_up") {
      return {
        icon: Package,
        color: "text-foreground bg-amber-500/12",
        titleClass: "text-foreground",
        referenceClass: "border-amber-500/20 bg-amber-500/10 text-foreground",
        statusClass: "border-amber-500/20 bg-amber-500/10 text-foreground",
      };
    }
    if (activity.status === "in_transit") {
      return {
        icon: Truck,
        color: "text-foreground bg-cyan-500/12",
        titleClass: "text-foreground",
        referenceClass: "border-cyan-500/20 bg-cyan-500/10 text-foreground",
        statusClass: "border-cyan-500/20 bg-cyan-500/10 text-foreground",
      };
    }
    if (activity.status === "delivered") {
      return {
        icon: CheckCircle2,
        color: "text-foreground bg-emerald-500/12",
        titleClass: "text-foreground",
        referenceClass: "border-emerald-500/20 bg-emerald-500/10 text-foreground",
        statusClass: "border-emerald-500/20 bg-emerald-500/10 text-foreground",
      };
    }
    return {
      icon: Clock3,
      color: "text-foreground bg-slate-500/12",
      titleClass: "text-foreground",
      referenceClass: "border-slate-500/20 bg-slate-500/10 text-foreground",
      statusClass: "border-slate-500/20 bg-slate-500/10 text-foreground",
    };
  }
  if (activity.type === "store_created") {
    return {
      icon: Store,
      color: "text-foreground bg-violet-500/12",
      titleClass: "text-foreground",
      referenceClass: "border-violet-500/20 bg-violet-500/10 text-foreground",
      statusClass: "border-violet-500/20 bg-violet-500/10 text-foreground",
    };
  }
  if (activity.type === "store_updated") {
    return {
      icon: AlertCircle,
      color: "text-foreground bg-orange-500/12",
      titleClass: "text-foreground",
      referenceClass: "border-orange-500/20 bg-orange-500/10 text-foreground",
      statusClass: "border-orange-500/20 bg-orange-500/10 text-foreground",
    };
  }
  return {
    icon: Store,
    color: "text-foreground bg-muted",
    titleClass: "text-foreground",
    referenceClass: "border-border bg-muted text-foreground",
    statusClass: "border-border bg-muted text-foreground",
  };
}

function ActivityItem({ activity, isFirst, isLast }) {
  const navigate = useNavigate();
  const { icon: Icon, color, titleClass, referenceClass, statusClass } = getActivityMeta(activity);
  const isClickable = Boolean(activity.href);

  return (
    <div className="grid grid-cols-[2.75rem_1fr] gap-4">
      <div className="relative flex h-full items-center justify-center self-stretch">
        {isFirst ? (
          <div className="absolute bottom-[calc(50%+1rem)] left-1/2 top-0 z-1 w-3 -translate-x-1/2 rounded-full bg-card" />
        ) : null}
        {isLast ? (
          <div className="absolute bottom-0 left-1/2 top-[calc(50%+1rem)] z-1 w-3 -translate-x-1/2 rounded-full bg-card" />
        ) : null}
        <div className="absolute left-1/2 top-1/2 z-1 h-10 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card" />
        <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 border-slate-500/55 bg-background p-1 dark:border-slate-300">
          <div className={`flex h-full w-full items-center justify-center rounded-full ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div
        className={`group rounded-2xl border-2 border-border/80 px-3 py-3 transition-all duration-200 ${
          isClickable ? "cursor-pointer hover:scale-[1.01] hover:bg-slate-100 dark:hover:bg-muted/40" : ""
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
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold ${titleClass}`}>{activity.title}</p>
            <p className="mt-0.5 text-sm text-foreground">{activity.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/80">
              {activity.reference ? (
                <span className={`rounded-full border px-2 py-0.5 font-mono ${referenceClass}`}>
                  {activity.reference}
                </span>
              ) : null}
              {activity.type === "parcel_status_changed" && activity.status ? (
                <span className={`rounded-full border px-2 py-0.5 font-medium capitalize ${statusClass}`}>
                  {formatStatusLabel(activity.status)}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                {formatActivityTime(activity.occurred_at)}
              </span>
            </div>
          </div>
          {isClickable ? (
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, loading: statsLoading } = useCachedQuery("dashboard-stats-v2", getDashboardStats);
  const {
    data: activities,
    loading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useCachedQuery("dashboard-recent-activity-v2", getRecentActivity);

  return (
    <div className="flex h-full flex-col overflow-hidden p-4 lg:p-6">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
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
            <StatCard title="Total Parcels" value={stats.total_orders ?? 0} icon={Package} href="/deliveries" />
            <StatCard
              title="Total Income"
              value={`৳${(stats.total_revenue ?? 0).toLocaleString()}`}
              icon={Banknote}
              href="/payments"
            />
            <StatCard title="Active Stores" value={stats.stores ?? 0} icon={Store} href="/stores" />
            <StatCard title="View Analytics" value="" icon={BarChart3} href="/analytics" />
          </>
        ) : (
          <>
            <StatCard title="Total Parcels" value="—" icon={Package} />
            <StatCard title="Total Income" value="—" icon={Banknote} />
            <StatCard title="Active Stores" value="—" icon={Store} />
            <StatCard title="View Analytics" value="" icon={BarChart3} href="/analytics" />
          </>
        )}
      </div>

      <RecentActivityFeed
        loading={activitiesLoading}
        activities={activities}
        error={activitiesError}
        onRetry={refetchActivities}
      />
    </div>
  );
}

function RecentActivityFeed({ loading, activities, error, onRetry }) {
  const scrollRef = useRef(null);
  const progressRef = useRef(null);
  const topBlurRef = useRef(null);
  const bottomBlurRef = useRef(null);

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
                Top 10 parcel and store events across your merchant account, including the latest parcel status updates.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="relative shrink-0 border-t-2 border-border bg-primary/3 dark:bg-primary/6">
        <div className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-foreground/80">Latest 10 events</div>
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
            <div className="space-y-4 px-6 py-4">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
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
                    isLast={index === activities.length - 1}
                  />
                ))}
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
