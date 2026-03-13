import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
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
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
                    <span className="text-base font-bold">Pathao Parcel</span>
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
              <span className="text-sm font-bold">Pathao Parcel</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 gap-1.5 px-2 text-sm cursor-pointer"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <ChevronDown className="h-3 w-3 opacity-50" />
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
        <div className={`group/sidebar relative flex flex-col gap-2 shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-[60px]' : 'w-[200px]'}`}>
          {/* Logo card */}
          <div className={`flex items-center rounded-xl border-2 border-border bg-card p-2.5 shrink-0 ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
              <Package className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && <span className="text-sm font-bold truncate">Pathao Parcel</span>}
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
          <div className="flex items-center justify-end rounded-xl border-2 border-border bg-card px-4 py-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 gap-1.5 px-2 text-sm cursor-pointer"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span className="hidden sm:inline text-foreground">
                        {user.name || user.email}
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
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
