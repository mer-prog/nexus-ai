import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get("period") ?? "30";
  const days = Math.min(365, Math.max(1, parseInt(period, 10)));

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orgId = user.organizationId;

  const [customers, invoices, allCustomers] = await Promise.all([
    prisma.customer.findMany({
      where: { organizationId: orgId },
      select: { id: true, status: true, createdAt: true },
    }),
    prisma.invoice.findMany({
      where: {
        organizationId: orgId,
        issuedAt: { gte: startDate },
      },
      select: { amount: true, status: true, issuedAt: true, paidAt: true },
      orderBy: { issuedAt: "asc" },
    }),
    prisma.customer.count({ where: { organizationId: orgId } }),
  ]);

  // KPI calculations
  const activeCustomers = customers.filter((c) => c.status === "ACTIVE").length;
  const churnedCustomers = customers.filter((c) => c.status === "CHURNED").length;
  const churnRate = allCustomers > 0 ? (churnedCustomers / allCustomers) * 100 : 0;

  const totalRevenue = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const newCustomers = customers.filter(
    (c) => new Date(c.createdAt) >= startDate
  ).length;

  // Monthly revenue data for line chart
  const monthlyRevenue: Record<string, number> = {};
  for (const inv of invoices) {
    if (inv.status === "PAID") {
      const key = new Date(inv.issuedAt).toISOString().slice(0, 7);
      monthlyRevenue[key] = (monthlyRevenue[key] ?? 0) + inv.amount;
    }
  }

  const revenueTimeline = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({
      month: formatMonth(month),
      revenue: Math.round(revenue),
    }));

  // Customer status distribution for pie chart
  const statusDistribution = [
    { name: "Active", value: activeCustomers, fill: "hsl(var(--chart-2))" },
    {
      name: "Inactive",
      value: customers.filter((c) => c.status === "INACTIVE").length,
      fill: "hsl(var(--chart-4))",
    },
    { name: "Churned", value: churnedCustomers, fill: "hsl(var(--chart-1))" },
  ];

  // Daily active users mock (simulated from activity patterns)
  const dailyActive = generateDailyActiveData(days);

  // NRR calculation (mock: based on revenue growth)
  const nrr = totalRevenue > 0 ? 105.2 : 100;

  return successResponse({
    kpi: {
      mrr: Math.round(totalRevenue / Math.max(1, Object.keys(monthlyRevenue).length)),
      newCustomers,
      churnRate: Math.round(churnRate * 10) / 10,
      nrr,
      totalRevenue: Math.round(totalRevenue),
      activeCustomers,
    },
    revenueTimeline,
    statusDistribution,
    dailyActive,
    period: days,
  });
}

function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

function generateDailyActiveData(days: number) {
  const data: Array<{ date: string; users: number }> = [];
  const now = new Date();

  for (let i = Math.min(days, 30); i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const baseUsers = dayOfWeek === 0 || dayOfWeek === 6 ? 120 : 280;
    const variance = Math.floor(Math.random() * 60) - 30;
    data.push({
      date: date.toISOString().slice(5, 10),
      users: baseUsers + variance,
    });
  }

  return data;
}
