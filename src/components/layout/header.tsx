"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/layout/notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useLocaleStore } from "@/stores/locale-store";
import { useT } from "@/hooks/use-translations";
import { logoutAction } from "@/lib/auth-actions";

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    organizationName: string;
  };
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const toggle = useSidebarStore((s) => s.toggle);
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);
  const { locale, setLocale } = useLocaleStore();
  const t = useT("header");
  const tNav = useT("nav");

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    await logoutAction();
    router.push("/login");
    router.refresh();
  }

  function handleLocaleToggle() {
    void setLocale(locale === "en" ? "ja" : "en");
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleMobile}
        aria-label={tNav("toggleMenu")}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">{tNav("toggleMenu")}</span>
      </Button>

      {/* Desktop sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:flex"
        onClick={toggle}
        aria-label={tNav("toggleSidebar")}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">{tNav("toggleSidebar")}</span>
      </Button>

      {/* Organization name */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{user.organizationName}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Language toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLocaleToggle}
          aria-label={t("toggleLanguage")}
          className="text-xs font-medium"
        >
          {locale === "en" ? "EN" : "JA"}
        </Button>

        {/* Notifications */}
        <NotificationBell />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
