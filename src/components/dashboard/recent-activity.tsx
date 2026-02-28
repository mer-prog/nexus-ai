"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/hooks/use-translations";

interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  user: { name: string };
}

interface ActivityResponse {
  logs: ActivityLog[];
  total: number;
}

const actionKeyMap: Record<string, string> = {
  "customer.created": "customerCreated",
  "customer.updated": "customerUpdated",
  "customer.deleted": "customerDeleted",
  "user.login": "userLogin",
  "user.invited": "userInvited",
  "user.removed": "userRemoved",
  "user.role_changed": "roleChanged",
  "invoice.sent": "invoiceSent",
  "subscription.upgraded": "subscriptionUpgraded",
  "settings.updated": "settingsUpdated",
};

export function RecentActivity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT("activity");

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch("/api/activity?limit=10");
        if (res.ok) {
          const data: ActivityResponse = await res.json();
          setLogs(data.logs);
        }
      } catch {
        // Fallback to empty
      } finally {
        setLoading(false);
      }
    }
    void fetchActivity();
  }, []);

  function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return t("justNow");
    if (diffMin < 60) return t("minutesAgo", { count: diffMin });
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return t("hoursAgo", { count: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return t("daysAgo", { count: diffDays });
    return new Date(dateStr).toLocaleDateString();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentActivity")}</CardTitle>
        <CardDescription>{t("recentActivityDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="mt-1 h-2 w-2 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("noActivity")}
          </p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const key = actionKeyMap[log.action];
              const label = key ? t(key) : log.action;
              return (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none">
                      {label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {log.details ?? "—"} · {log.user.name}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(log.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
