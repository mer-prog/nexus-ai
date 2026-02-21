import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({
    user: {
      id: "user-1",
      role: "ADMIN",
      organizationId: "org-1",
      organizationName: "Test",
    },
  })),
}));

const mockCustomerFindMany = vi.fn();
const mockInvoiceFindMany = vi.fn();
const mockCustomerCount = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    customer: {
      findMany: (...args: unknown[]) => mockCustomerFindMany(...args),
      count: (...args: unknown[]) => mockCustomerCount(...args),
    },
    invoice: {
      findMany: (...args: unknown[]) => mockInvoiceFindMany(...args),
    },
  },
}));

describe("GET /api/analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCustomerFindMany.mockResolvedValue([
      { id: "c1", status: "ACTIVE", createdAt: new Date() },
      { id: "c2", status: "ACTIVE", createdAt: new Date() },
      { id: "c3", status: "CHURNED", createdAt: new Date() },
    ]);
    mockInvoiceFindMany.mockResolvedValue([
      { amount: 100, status: "PAID", issuedAt: new Date(), paidAt: new Date() },
      { amount: 200, status: "PAID", issuedAt: new Date(), paidAt: new Date() },
      { amount: 50, status: "PENDING", issuedAt: new Date(), paidAt: null },
    ]);
    mockCustomerCount.mockResolvedValue(3);
  });

  it("returns KPI data", async () => {
    const { GET } = await import("@/app/api/analytics/route");
    const req = new NextRequest("http://localhost/api/analytics");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.kpi).toBeDefined();
    expect(data.kpi.activeCustomers).toBe(2);
    expect(data.kpi.totalRevenue).toBe(300);
  });

  it("calculates churn rate correctly", async () => {
    const { GET } = await import("@/app/api/analytics/route");
    const req = new NextRequest("http://localhost/api/analytics");
    const res = await GET(req);
    const data = await res.json();

    // 1 churned out of 3 total = 33.3%
    expect(data.kpi.churnRate).toBeCloseTo(33.3, 0);
  });

  it("supports period parameter", async () => {
    const { GET } = await import("@/app/api/analytics/route");
    const req = new NextRequest("http://localhost/api/analytics?period=7");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.period).toBe(7);
  });

  it("returns status distribution", async () => {
    const { GET } = await import("@/app/api/analytics/route");
    const req = new NextRequest("http://localhost/api/analytics");
    const res = await GET(req);
    const data = await res.json();

    expect(data.statusDistribution).toHaveLength(3);
    const active = data.statusDistribution.find((s: { name: string }) => s.name === "Active");
    expect(active.value).toBe(2);
  });

  it("returns revenue timeline", async () => {
    const { GET } = await import("@/app/api/analytics/route");
    const req = new NextRequest("http://localhost/api/analytics");
    const res = await GET(req);
    const data = await res.json();

    expect(data.revenueTimeline).toBeDefined();
    expect(Array.isArray(data.revenueTimeline)).toBe(true);
  });

  it("returns daily active data", async () => {
    const { GET } = await import("@/app/api/analytics/route");
    const req = new NextRequest("http://localhost/api/analytics");
    const res = await GET(req);
    const data = await res.json();

    expect(data.dailyActive).toBeDefined();
    expect(data.dailyActive.length).toBeGreaterThan(0);
  });
});
