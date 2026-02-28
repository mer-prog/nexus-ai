"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/hooks/use-translations";
import { useFormat } from "@/hooks/use-format";

const data = [
  { month: "Aug", revenue: 38200 },
  { month: "Sep", revenue: 41500 },
  { month: "Oct", revenue: 43800 },
  { month: "Nov", revenue: 45200 },
  { month: "Dec", revenue: 48100 },
  { month: "Jan", revenue: 51400 },
  { month: "Feb", revenue: 54690 },
];

export function RevenueChart() {
  const t = useT("dashboard");
  const { formatCurrency } = useFormat();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("revenueOverview")}</CardTitle>
        <CardDescription>{t("revenueOverviewDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value: number) => formatCurrency(value)}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), t("revenue")]}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--popover-foreground))",
              }}
            />
            <Bar
              dataKey="revenue"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
