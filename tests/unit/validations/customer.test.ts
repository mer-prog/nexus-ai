import { describe, it, expect } from "vitest";
import { customerCreateSchema, customerUpdateSchema } from "@/lib/validations/customer";

describe("customerCreateSchema", () => {
  it("validates a correct customer", () => {
    const result = customerCreateSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      company: "Acme Corp",
      status: "ACTIVE",
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = customerCreateSchema.safeParse({
      email: "john@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("requires valid email", () => {
    const result = customerCreateSchema.safeParse({
      name: "John",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 characters", () => {
    const result = customerCreateSchema.safeParse({
      name: "a".repeat(101),
      email: "john@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid status enum values", () => {
    for (const status of ["ACTIVE", "INACTIVE", "CHURNED"]) {
      const result = customerCreateSchema.safeParse({
        name: "John",
        email: "j@example.com",
        status,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    const result = customerCreateSchema.safeParse({
      name: "John",
      email: "j@example.com",
      status: "DELETED",
    });
    expect(result.success).toBe(false);
  });

  it("allows optional company", () => {
    const result = customerCreateSchema.safeParse({
      name: "John",
      email: "j@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("allows optional status (defaults are handled server-side)", () => {
    const result = customerCreateSchema.safeParse({
      name: "John",
      email: "j@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBeUndefined();
    }
  });
});

describe("customerUpdateSchema", () => {
  it("allows all fields to be optional", () => {
    const result = customerUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("validates email when provided", () => {
    const result = customerUpdateSchema.safeParse({
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("allows nullable company", () => {
    const result = customerUpdateSchema.safeParse({
      company: null,
    });
    expect(result.success).toBe(true);
  });

  it("validates partial updates", () => {
    const result = customerUpdateSchema.safeParse({
      name: "Updated Name",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Updated Name");
      expect(result.data.email).toBeUndefined();
    }
  });
});
