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

  return (
    <DropdownMenuItem
      onClick={() => onNotificationClick(item)}
      onSelect={(event) => event.preventDefault()}
      className="group relative cursor-pointer items-start gap-3 rounded-none border-b border-border/70 px-2 py-2 last:border-b-0 hover:bg-accent/70"
    >
      {item.unread ? <span className="absolute bottom-1 left-0 top-1 w-0.5 rounded-full bg-primary" /> : null}
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className={`truncate text-sm ${item.unread ? "font-semibold" : "font-medium"}`}>{item.title}</p>
          <div className="flex items-center gap-1">
            <Badge variant={getNotificationBadgeVariant(item.type)} className="shrink-0 capitalize">
              {item.type}
            </Badge>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onRemoveNotification(item.id);
              }}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Remove notification"
              title="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p className="truncate text-xs text-muted-foreground">{item.description}</p>
        <p className="text-xs text-foreground/80">{item.timestamp}</p>
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 cursor-pointer" aria-label="Open notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-2 py-1.5">
          <p className="text-sm font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">Recent dashboard updates</p>
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <BellOff className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto scrollbar-thin rounded-md border border-border/60 bg-background">
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

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onMarkAllRead}
          onSelect={(event) => event.preventDefault()}
          disabled={unreadCount === 0}
          className="cursor-pointer text-xs font-medium"
        >
          Mark all as read
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onClearRead}
          onSelect={(event) => event.preventDefault()}
          disabled={!notifications.some((item) => !item.unread)}
          className="cursor-pointer text-xs font-medium"
        >
          Clear read notifications
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onClearAll}
          onSelect={(event) => event.preventDefault()}
          disabled={notifications.length === 0}
          className="cursor-pointer text-xs font-medium text-destructive focus:text-destructive"
        >
          Clear all notifications
        </DropdownMenuItem>
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
      link: "/deliveries",
    },
    {
      id: "notif-2",
      title: "Delivery completed",
      description: "PTH-100009 marked as delivered",
      timestamp: "1 hour ago",
      type: "success",
      icon: CheckCircle2,
      unread: true,
      link: "/deliveries",
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
      link: "/deliveries",
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
