"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { useT } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const t = useT("notifications");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        closeDropdown();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, closeDropdown]);

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return t("justNow");
    if (diffMin < 60) return t("minutesAgo", { count: diffMin });
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return t("hoursAgo", { count: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    return t("daysAgo", { count: diffDays });
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        title={t("title")}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${t("title")}${unreadCount > 0 ? ` (${t("unreadCount", { count: unreadCount })})` : ""}`}
        className="relative"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
            aria-hidden="true"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="sr-only">{t("title")} ({t("unreadCount", { count: unreadCount })})</span>
      </Button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border bg-popover p-0 shadow-md"
          role="dialog"
          aria-label={t("title")}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold" id="notifications-title">{t("title")}</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={async () => {
                  await markAllAsRead();
                }}
                aria-label={t("markAllRead")}
              >
                <CheckCheck className="mr-1 h-3 w-3" aria-hidden="true" />
                {t("markAllRead")}
              </Button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto" role="list" aria-labelledby="notifications-title">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground" role="listitem">
                {t("noNotifications")}
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  role="listitem"
                  className={cn(
                    "flex items-start gap-3 border-b px-4 py-3 last:border-0 transition-colors",
                    !notification.read && "bg-accent/50"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      <time>{formatTime(notification.createdAt)}</time>
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={async () => {
                        await markAsRead(notification.id);
                      }}
                      aria-label={`${t("markAsRead")} "${notification.title}"`}
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                      <span className="sr-only">{t("markAsRead")}</span>
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
