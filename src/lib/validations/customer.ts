import { z } from "zod/v4";

export const customerCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.email("Invalid email address"),
  company: z.string().max(100).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "CHURNED"]).optional(),
});

export const customerUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  email: z.email("Invalid email address").optional(),
  company: z.string().max(100).nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "CHURNED"]).optional(),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
