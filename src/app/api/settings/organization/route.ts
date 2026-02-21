import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";
import { createActivityLog } from "@/lib/activity-log";
import { z } from "zod/v4";

const updateOrgSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
});

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
  });

  return successResponse({ organization: org });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  if (user.role !== "ADMIN") {
    return errorResponse("Forbidden: Only admins can update organization settings", 403);
  }

  const body: unknown = await request.json();
  const parsed = updateOrgSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse("Validation failed", 422, parsed.error.issues);
  }

  // Check slug uniqueness if changing
  if (parsed.data.slug) {
    const existing = await prisma.organization.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (existing && existing.id !== user.organizationId) {
      return errorResponse("This slug is already taken", 409);
    }
  }

  const org = await prisma.organization.update({
    where: { id: user.organizationId },
    data: parsed.data,
  });

  await createActivityLog({
    action: "settings.updated",
    details: "Updated organization settings",
    userId: user.id,
    organizationId: user.organizationId,
  });

  return successResponse({ organization: org });
}
