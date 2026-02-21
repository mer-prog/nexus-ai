"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Bot,
  Users,
  UserCog,
  CreditCard,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "AI Assistant", href: "/dashboard/ai", icon: Bot },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Team", href: "/dashboard/team", icon: UserCog },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function SidebarContent() {
  const pathname = usePathname();
  const closeMobile = useSidebarStore((s) => s.closeMobile);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Bot className="h-6 w-6 text-primary" />
          <span className="text-lg">Nexus AI</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden"
          onClick={closeMobile}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar() {
  const isOpen = useSidebarStore((s) => s.isOpen);
  const isMobileOpen = useSidebarStore((s) => s.isMobileOpen);
  const closeMobile = useSidebarStore((s) => s.closeMobile);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden border-r bg-sidebar text-sidebar-foreground lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:flex-col transition-all duration-300",
          isOpen ? "lg:w-64" : "lg:w-0 lg:overflow-hidden"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
          onKeyDown={(e) => {
            if (e.key === "Escape") closeMobile();
          }}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
