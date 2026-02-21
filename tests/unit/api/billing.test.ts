import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockUser = vi.fn(() => ({
  id: "user-1",
  name: "Admin",
  email: "admin@test.com",
  role: "ADMIN",
  organizationId: "org-1",
  organizationName: "Test Org",
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ user: mockUser() })),
}));

const mockFindFirst = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    subscription: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
    organization: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

vi.mock("@/lib/activity-log", () => ({
  createActivityLog: vi.fn(async () => ({})),
}));

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn(async () => ({})),
}));

describe("GET /api/billing/subscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue(null);
    mockFindUnique.mockResolvedValue({ plan: "FREE", name: "Test Org" });
  });

  it("returns subscription and current plan", async () => {
    const { GET } = await import("@/app/api/billing/subscription/route");
    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.currentPlan).toBe("FREE");
    expect(data.subscription).toBeNull();
  });

  it("returns subscription when it exists", async () => {
    const sub = { id: "sub-1", plan: "PRO", status: "ACTIVE" };
    mockFindFirst.mockResolvedValue(sub);
    mockFindUnique.mockResolvedValue({ plan: "PRO", name: "Test Org" });

    const { GET } = await import("@/app/api/billing/subscription/route");
    const res = await GET();
    const data = await res.json();

    expect(data.subscription).toEqual(sub);
    expect(data.currentPlan).toBe("PRO");
  });
});

describe("PUT /api/billing/subscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.mockReturnValue({
      id: "user-1",
      name: "Admin",
      email: "admin@test.com",
      role: "ADMIN",
      organizationId: "org-1",
      organizationName: "Test Org",
    });
    mockUpdate.mockResolvedValue({ id: "org-1", name: "Test Org", plan: "PRO" });
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "sub-1", plan: "PRO", status: "ACTIVE" });
  });

  it("rejects non-admin users", async () => {
    mockUser.mockReturnValue({
      id: "user-2",
      name: "Member",
      email: "member@test.com",
      role: "MEMBER",
      organizationId: "org-1",
      organizationName: "Test Org",
    });

    const { PUT } = await import("@/app/api/billing/subscription/route");
    const req = new NextRequest("http://localhost/api/billing/subscription", {
      method: "PUT",
      body: JSON.stringify({ plan: "PRO" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req);

    expect(res.status).toBe(403);
  });

  it("rejects invalid plan", async () => {
    const { PUT } = await import("@/app/api/billing/subscription/route");
    const req = new NextRequest("http://localhost/api/billing/subscription", {
      method: "PUT",
      body: JSON.stringify({ plan: "PLATINUM" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req);

    expect(res.status).toBe(422);
  });

  it("accepts valid plan changes for admin", async () => {
    const { PUT } = await import("@/app/api/billing/subscription/route");
    const req = new NextRequest("http://localhost/api/billing/subscription", {
      method: "PUT",
      body: JSON.stringify({ plan: "PRO" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req);

    expect(res.status).toBe(200);
  });
});
