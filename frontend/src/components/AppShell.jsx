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

function SidebarNav({ onNavigate }) {
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = location.pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-svh overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-56 lg:w-64 flex-col border-r border-border bg-sidebar-background shrink-0">
        {/* Logo */}
        <div className="flex h-14 items-center px-5 border-b border-border">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight">
              Pathao Parcel
            </span>
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto scrollbar-thin py-4">
          <SidebarNav />
        </div>

        {/* User info at bottom */}
        {user && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-muted-foreground">Merchant</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 lg:px-6">
          {/* Left: mobile hamburger + page context */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 md:hidden cursor-pointer"
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
                {user && (
                  <div className="mt-auto border-t border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {user.name || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Merchant
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            {/* Mobile logo */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2 md:hidden cursor-pointer"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                <Package className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold">Pathao Parcel</span>
            </Link>
          </div>

          {/* Right: theme toggle + user */}
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
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
