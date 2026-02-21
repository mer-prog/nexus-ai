import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  {
    action: "New customer signed up",
    detail: "ClearView — Pro plan",
    time: "2 minutes ago",
  },
  {
    action: "Invoice paid",
    detail: "BlueWave — $299.00",
    time: "15 minutes ago",
  },
  {
    action: "Team member joined",
    detail: "James Wilson — Acme Corp",
    time: "1 hour ago",
  },
  {
    action: "Subscription upgraded",
    detail: "NeonApps — Pro → Enterprise",
    time: "3 hours ago",
  },
  {
    action: "AI conversation started",
    detail: "Revenue Analysis — Yuki Tanaka",
    time: "5 hours ago",
  },
  {
    action: "Invoice overdue",
    detail: "DataNest — $187.00",
    time: "1 day ago",
  },
  {
    action: "Customer churned",
    detail: "OptiCore — canceled subscription",
    time: "2 days ago",
  },
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest events across your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-none">{activity.action}</p>
                <p className="mt-1 text-xs text-muted-foreground">{activity.detail}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
