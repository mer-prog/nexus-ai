import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock auth
const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  role: "ADMIN",
  organizationId: "org-1",
  organizationName: "Test Org",
};

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ user: mockUser })),
}));

// Mock prisma
const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    customer: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

vi.mock("@/lib/activity-log", () => ({
  createActivityLog: vi.fn(async () => ({})),
}));

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn(async () => ({})),
}));

describe("GET /api/customers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
  });

  it("returns paginated customers", async () => {
    const customers = [
      { id: "c1", name: "Alice", email: "alice@test.com", status: "ACTIVE" },
    ];
    mockFindMany.mockResolvedValue(customers);
    mockCount.mockResolvedValue(1);

    const { GET } = await import("@/app/api/customers/route");
    const req = new NextRequest("http://localhost/api/customers");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.customers).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
  });

  it("supports search parameter", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const { GET } = await import("@/app/api/customers/route");
    const req = new NextRequest("http://localhost/api/customers?search=alice");
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ contains: "alice" }) }),
          ]),
        }),
      })
    );
  });

  it("supports status filter", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const { GET } = await import("@/app/api/customers/route");
    const req = new NextRequest("http://localhost/api/customers?status=ACTIVE");
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "ACTIVE" }),
      })
    );
  });

  it("returns correct pagination metadata", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    const { GET } = await import("@/app/api/customers/route");
    const req = new NextRequest("http://localhost/api/customers?page=2&limit=10");
    const res = await GET(req);
    const data = await res.json();

    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(10);
    expect(data.pagination.total).toBe(50);
    expect(data.pagination.totalPages).toBe(5);
  });
});

describe("POST /api/customers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a customer with valid data", async () => {
    const newCustomer = {
      id: "c-new",
      name: "New Customer",
      email: "new@test.com",
      status: "ACTIVE",
      organizationId: "org-1",
    };
    mockCreate.mockResolvedValue(newCustomer);

    const { POST } = await import("@/app/api/customers/route");
    const req = new NextRequest("http://localhost/api/customers", {
      method: "POST",
      body: JSON.stringify({ name: "New Customer", email: "new@test.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.name).toBe("New Customer");
  });

  it("returns 422 for invalid data", async () => {
    const { POST } = await import("@/app/api/customers/route");
    const req = new NextRequest("http://localhost/api/customers", {
      method: "POST",
      body: JSON.stringify({ name: "", email: "not-email" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);

    expect(res.status).toBe(422);
  });

  it("returns 422 when name is missing", async () => {
    const { POST } = await import("@/app/api/customers/route");
    const req = new NextRequest("http://localhost/api/customers", {
      method: "POST",
      body: JSON.stringify({ email: "valid@test.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);

    expect(res.status).toBe(422);
  });
});
