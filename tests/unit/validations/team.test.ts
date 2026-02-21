import { describe, it, expect } from "vitest";
import { roleUpdateSchema, inviteSchema } from "@/lib/validations/team";

describe("roleUpdateSchema", () => {
  it("accepts ADMIN role", () => {
    expect(roleUpdateSchema.safeParse({ role: "ADMIN" }).success).toBe(true);
  });

  it("accepts MANAGER role", () => {
    expect(roleUpdateSchema.safeParse({ role: "MANAGER" }).success).toBe(true);
  });

  it("accepts MEMBER role", () => {
    expect(roleUpdateSchema.safeParse({ role: "MEMBER" }).success).toBe(true);
  });

  it("rejects invalid role", () => {
    expect(roleUpdateSchema.safeParse({ role: "SUPERADMIN" }).success).toBe(false);
  });

  it("rejects empty object", () => {
    expect(roleUpdateSchema.safeParse({}).success).toBe(false);
  });
});

describe("inviteSchema", () => {
  it("validates correct invite", () => {
    const result = inviteSchema.safeParse({
      email: "new@example.com",
      role: "MEMBER",
    });
    expect(result.success).toBe(true);
  });

  it("requires valid email", () => {
    const result = inviteSchema.safeParse({
      email: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("allows optional role", () => {
    const result = inviteSchema.safeParse({
      email: "valid@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid role in invite", () => {
    const result = inviteSchema.safeParse({
      email: "valid@example.com",
      role: "OWNER",
    });
    expect(result.success).toBe(false);
  });
});
