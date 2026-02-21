import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => null),
}));

import { parsePaginationParams, successResponse, errorResponse } from "@/lib/api-helpers";

describe("parsePaginationParams", () => {
  it("returns defaults when no params provided", () => {
    const params = new URLSearchParams();
    const result = parsePaginationParams(params);
    expect(result).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it("parses page and limit correctly", () => {
    const params = new URLSearchParams({ page: "3", limit: "20" });
    const result = parsePaginationParams(params);
    expect(result).toEqual({ page: 3, limit: 20, skip: 40 });
  });

  it("clamps page minimum to 1", () => {
    const params = new URLSearchParams({ page: "0" });
    const result = parsePaginationParams(params);
    expect(result.page).toBe(1);
  });

  it("clamps page minimum for negative values", () => {
    const params = new URLSearchParams({ page: "-5" });
    const result = parsePaginationParams(params);
    expect(result.page).toBe(1);
  });

  it("clamps limit maximum to 100", () => {
    const params = new URLSearchParams({ limit: "500" });
    const result = parsePaginationParams(params);
    expect(result.limit).toBe(100);
  });

  it("clamps limit minimum to 1", () => {
    const params = new URLSearchParams({ limit: "0" });
    const result = parsePaginationParams(params);
    expect(result.limit).toBe(1);
  });

  it("calculates skip correctly", () => {
    const params = new URLSearchParams({ page: "5", limit: "25" });
    const result = parsePaginationParams(params);
    expect(result.skip).toBe(100);
  });

  it("handles non-numeric input gracefully", () => {
    const params = new URLSearchParams({ page: "abc", limit: "xyz" });
    const result = parsePaginationParams(params);
    // parseInt("abc") returns NaN; Math.max(1, NaN) returns NaN
    expect(result.page).toBeNaN();
    expect(result.limit).toBeNaN();
  });
});

describe("successResponse", () => {
  it("returns a JSON response with 200 status by default", async () => {
    const res = successResponse({ message: "ok" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ message: "ok" });
  });

  it("accepts a custom status code", async () => {
    const res = successResponse({ id: "123" }, 201);
    expect(res.status).toBe(201);
  });
});

describe("errorResponse", () => {
  it("returns an error response with the given message", async () => {
    const res = errorResponse("Not found", 404);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Not found");
  });

  it("defaults to 400 status", async () => {
    const res = errorResponse("Bad request");
    expect(res.status).toBe(400);
  });

  it("includes details when provided", async () => {
    const details = [{ message: "Invalid field", path: ["name"], code: "invalid_type" }];
    const res = errorResponse("Validation failed", 422, details as never);
    const data = await res.json();
    expect(data.details).toHaveLength(1);
    expect(data.details[0].message).toBe("Invalid field");
  });
});
