import { z } from "zod/v4";

export const roleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]),
});

export const inviteSchema = z.object({
  email: z.email("Invalid email address"),
  role: z.enum(["MANAGER", "MEMBER"]).optional(),
});

export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
