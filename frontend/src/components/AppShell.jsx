/**
 * AppShell — top-level layout with top navigation bar.
 * Follows the reference UI pattern exactly.
 */

import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PalettePicker from "@/components/PalettePicker";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { LogOut, User, ChevronDown, Menu } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/deliveries", label: "Deliveries" },
  { to: "/stores", label: "Stores" },
  { to: "/analytics", label: "Analytics" },
  { to: "/payments", label: "Payments" },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur supports-backdrop-filter:bg-card/60">
        <div className="flex h-12 items-center justify-between px-3 sm:px-4 lg:px-6">
          {/* Left */}
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 sm:hidden"
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle className="text-lg font-bold">Pathao Parcel</SheetTitle>
                  <SheetDescription className="sr-only">Navigation menu</SheetDescription>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        location.pathname.startsWith(item.to)
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                {user && (
                  <div className="mt-auto pt-6 border-t border-border">
                    <p className="text-sm font-medium">{user.name || user.email}</p>
                    <p className="text-xs text-muted-foreground mb-3">Merchant</p>
                    <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start">
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      Log out
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            <Link
              to="/dashboard"
              className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity"
            >
              Pathao Parcel
            </Link>

            <Separator orientation="vertical" className="hidden h-5 sm:block" />

            <nav className="hidden items-center gap-1 sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    location.pathname.startsWith(item.to)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <PalettePicker />

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 gap-1.5 px-2 text-sm text-muted-foreground"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {user.name || user.email}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name || user.email}</p>
                    <p className="text-xs text-muted-foreground">Merchant</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
