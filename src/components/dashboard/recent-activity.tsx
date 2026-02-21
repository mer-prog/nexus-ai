"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

const actionLabels: Record<string, string> = {
  "customer.created": "New customer added",
  "customer.updated": "Customer updated",
  "customer.deleted": "Customer deleted",
  "user.login": "User logged in",
  "user.invited": "Member invited",
  "user.removed": "Member removed",
  "user.role_changed": "Role changed",
  "invoice.sent": "Invoice sent",
  "subscription.upgraded": "Subscription upgraded",
  "settings.updated": "Settings updated",
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function RecentActivity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest events across your organization</CardDescription>
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
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-none">
                    {actionLabels[log.action] ?? log.action}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {log.details ?? "—"} · {log.user.name}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
