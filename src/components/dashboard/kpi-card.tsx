import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  description: string;
}

export function KpiCard({ title, value, change, trend, icon: Icon, description }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          <span
            className={cn(
              "font-medium",
              trend === "up" && title !== "Churn Rate"
                ? "text-emerald-600"
                : trend === "down" && title === "Churn Rate"
                  ? "text-emerald-600"
                  : "text-red-600"
            )}
          >
            {change}
          </span>{" "}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
