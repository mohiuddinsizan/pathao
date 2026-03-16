import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  Plus,
  Bell,
  BellOff,
  X,
  AlertCircle,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  Package,
  Store,
  BarChart3,
  CreditCard,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/deliveries", label: "Deliveries", icon: Package },
  { to: "/stores", label: "Stores", icon: Store },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

function getNotificationBadgeVariant(type) {
  if (type === "success") return "success";
  if (type === "warning") return "warning";
  if (type === "destructive") return "destructive";
  return "info";
}

function NotificationItem({ item, onNotificationClick, onRemoveNotification }) {
  const Icon = item.icon ?? Bell;
  const tone = getNotificationBadgeVariant(item.type);

  const iconToneClass =
    tone === "success"
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
      : tone === "warning"
        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
        : tone === "destructive"
          ? "bg-destructive/15 text-destructive"
          : "bg-primary/15 text-primary";

  const unreadRailClass =
    tone === "success"
      ? "bg-emerald-500"
      : tone === "warning"
        ? "bg-amber-500"
        : tone === "destructive"
          ? "bg-destructive"
          : "bg-primary";

  return (
    <DropdownMenuItem
      onClick={() => onNotificationClick(item)}
      onSelect={(event) => event.preventDefault()}
      className="group relative cursor-pointer items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-all duration-200 focus:bg-accent/70 focus:text-foreground data-highlighted:bg-accent/70 hover:border-border/70 hover:bg-accent/60"
    >
      {item.unread ? <span className={`absolute bottom-2 left-0 top-2 w-1 rounded-r-full ${unreadRailClass}`} /> : null}

      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconToneClass}`}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        {/* Always visible: title + dismiss button */}
        <div className="flex items-center justify-between gap-2">
          <p className={`line-clamp-1 text-sm leading-5 ${item.unread ? "font-semibold text-foreground" : "font-medium text-foreground/90"}`}>
            {item.title}
          </p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemoveNotification(item.id);
            }}
            className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:bg-muted hover:text-foreground"
            aria-label="Remove notification"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        {/* Hover-expanded: description + timestamp */}
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-250 ease-out group-hover:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <div className="flex flex-col gap-0.5 opacity-0 transition-opacity duration-150 delay-75 group-hover:opacity-100">
              <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
              <p className="text-[11px] font-medium text-foreground/55">{item.timestamp}</p>
            </div>
          </div>
        </div>
      </div>
    </DropdownMenuItem>
  );
}

function NotificationsMenu({
  notifications,
  onMarkAllRead,
  onNotificationClick,
  onRemoveNotification,
  onClearRead,
  onClearAll,
}) {
  const unreadCount = notifications.filter((item) => item.unread).length;
  const hasRead = notifications.some((item) => !item.unread);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 cursor-pointer rounded-full" aria-label="Open notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px] font-semibold leading-none"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="border-b border-border/70 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 ? (
              <Badge variant="secondary" className="h-5 rounded-full px-2 text-[11px] font-medium">
                {unreadCount} unread
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {unreadCount === 0 ? "All caught up" : `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`}
          </p>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BellOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No notifications</p>
            <p className="mt-1 text-xs text-muted-foreground">You're all set for now.</p>
          </div>
        ) : (
          <div className="max-h-104 space-y-1 overflow-y-auto p-2">
            {notifications.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onNotificationClick={onNotificationClick}
                onRemoveNotification={onRemoveNotification}
              />
            ))}
          </div>
        )}

        <DropdownMenuSeparator className="my-0" />
        <div className="grid grid-cols-3 gap-1.5 p-2">
          <DropdownMenuItem
            disabled={unreadCount === 0}
            onClick={onMarkAllRead}
            onSelect={(event) => event.preventDefault()}
            className="cursor-pointer justify-center gap-1.5 rounded-md border border-border/70 px-2 py-2 text-xs font-medium data-disabled:cursor-not-allowed data-disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Read all
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!hasRead}
            onClick={onClearRead}
            onSelect={(event) => event.preventDefault()}
            className="cursor-pointer justify-center gap-1.5 rounded-md border border-border/70 px-2 py-2 text-xs font-medium data-disabled:cursor-not-allowed data-disabled:opacity-50"
          >
            <Clock3 className="h-3.5 w-3.5" />
            Clear read
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={notifications.length === 0}
            onClick={onClearAll}
            onSelect={(event) => event.preventDefault()}
            className="cursor-pointer justify-center gap-1.5 rounded-md border border-destructive/30 px-2 py-2 text-xs font-medium text-destructive data-disabled:cursor-not-allowed data-disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarNav({ onNavigate, iconOnly = false }) {
  const location = useLocation();

  return (
    <nav className={`flex flex-col gap-1 ${iconOnly ? "items-center px-1" : "px-2"}`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = location.pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={iconOnly ? item.label : undefined}
            className={`flex items-center ${iconOnly ? "justify-center rounded-lg p-2.5" : "gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"} transition-colors duration-200 cursor-pointer ${
              active
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Icon className={`${iconOnly ? "h-5 w-5" : "h-4 w-4"} shrink-0`} />
            {!iconOnly && item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "New parcel created",
      description: "PTH-100043 is ready for assignment",
      timestamp: "2 minutes ago",
      type: "info",
      icon: Package,
      unread: true,
      link: "/deliveries/PTH-100043",
    },
    {
      id: "notif-2",
      title: "Delivery completed",
      description: "PTH-100009 marked as delivered",
      timestamp: "1 hour ago",
      type: "success",
      icon: CheckCircle2,
      unread: true,
      link: "/deliveries/PTH-100009",
    },
    {
      id: "notif-3",
      title: "Store needs attention",
      description: "Main Branch was deactivated",
      timestamp: "Today",
      type: "warning",
      icon: AlertCircle,
      unread: false,
      link: "/stores",
    },
    {
      id: "notif-4",
      title: "Status changed",
      description: "PTH-100040 moved to assigned",
      timestamp: "Today",
      type: "info",
      icon: Clock3,
      unread: false,
      link: "/deliveries/PTH-100040",
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const handleNotificationClick = (item) => {
    setNotifications((prev) =>
      prev.map((entry) =>
        entry.id === item.id
          ? { ...entry, unread: false }
          : entry
      )
    );

    if (item.link) {
      navigate(item.link);
    }
  };

  const handleRemoveNotification = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearRead = () => {
    setNotifications((prev) => prev.filter((item) => item.unread));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
      {/* ── Mobile: top bar + full-width content ── */}
      <div className="flex flex-col flex-1 md:hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between rounded-xl border-2 border-border bg-card px-4 py-2.5 m-2 mb-0">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 cursor-pointer"
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="border-b border-border px-5 py-4">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                      <Package className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-base font-bold">Pathao Merchant</span>
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigation menu
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <SidebarNav onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <Link
              to="/dashboard"
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold">Pathao Merchant</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <NotificationsMenu
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onNotificationClick={handleNotificationClick}
              onRemoveNotification={handleRemoveNotification}
              onClearRead={handleClearRead}
              onClearAll={handleClearAll}
            />
            <ThemeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">Merchant</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile content */}
        <div className="flex-1 overflow-hidden p-2">
          <div className="flex-1 h-full rounded-xl border-2 border-border bg-card overflow-hidden">
            <main className="h-full overflow-y-auto scrollbar-thin">
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      {/* ── Desktop: two-state sidebar + content ── */}
      <div className="hidden md:flex flex-1 overflow-hidden p-2 gap-2">
        {/* Left column: Logo + Nav (toggleable) with edge pill */}
        <div className={`group/sidebar relative flex flex-col gap-2 shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-15' : 'w-50'}`}>
          {/* Logo card */}
          <div className={`flex items-center rounded-xl border-2 border-border bg-card p-2.5 shrink-0 ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
              <Package className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && <span className="text-sm font-bold truncate">Pathao Merchant</span>}
          </div>

          {/* Nav card */}
          <div className="flex flex-1 flex-col rounded-xl border-2 border-border bg-card overflow-hidden">
            <div className="py-3 flex-1 overflow-y-auto scrollbar-thin">
              <SidebarNav iconOnly={sidebarCollapsed} />
            </div>
          </div>

          {/* Edge pill toggle button — appears on sidebar hover */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-border bg-card text-muted-foreground shadow-sm opacity-0 group-hover/sidebar:opacity-100 hover:bg-accent hover:text-foreground transition-all duration-200 cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        </div>

        {/* Right column: Topbar + Content */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {/* Top bar card */}
          <div className="flex items-center justify-between rounded-xl border-2 border-border bg-card px-4 py-2.5 shrink-0">
            {/* Create Parcel button */}
            <Link to="/deliveries/new">
              <Button size="sm" className="gap-1.5 cursor-pointer">
                <Plus className="h-4 w-4" />
                Create Parcel
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <NotificationsMenu
                notifications={notifications}
                onMarkAllRead={handleMarkAllRead}
                onNotificationClick={handleNotificationClick}
                onRemoveNotification={handleRemoveNotification}
                onClearRead={handleClearRead}
                onClearAll={handleClearAll}
              />
              <ThemeToggle />

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Merchant
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Content card */}
          <div className="flex-1 rounded-xl border-2 border-border bg-card overflow-hidden">
            <main className="h-full overflow-y-auto scrollbar-thin">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
