import { DollarSign, Users, TrendingDown, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

const kpiData = [
  {
    title: "Monthly Recurring Revenue",
    value: "$54,690",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
    description: "vs last month",
  },
  {
    title: "Active Users",
    value: "2,847",
    change: "+8.2%",
    trend: "up" as const,
    icon: Users,
    description: "vs last month",
  },
  {
    title: "Churn Rate",
    value: "2.4%",
    change: "-0.3%",
    trend: "down" as const,
    icon: TrendingDown,
    description: "vs last month",
  },
  {
    title: "Revenue Growth",
    value: "+18.7%",
    change: "+3.2%",
    trend: "up" as const,
    icon: TrendingUp,
    description: "vs last quarter",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s an overview of your business.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
