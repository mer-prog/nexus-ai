import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";
import { createActivityLog } from "@/lib/activity-log";
import bcrypt from "bcryptjs";
import { z } from "zod/v4";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  email: z.email("Invalid email").optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return successResponse({ profile });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body: unknown = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse("Validation failed", 422, parsed.error.issues);
  }

  const updateData: Record<string, string> = {};

  if (parsed.data.name) updateData.name = parsed.data.name;

  if (parsed.data.email) {
    // Check email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing && existing.id !== user.id) {
      return errorResponse("This email is already in use", 409);
    }
    updateData.email = parsed.data.email;
  }

  // Password change
  if (parsed.data.newPassword) {
    if (!parsed.data.currentPassword) {
      return errorResponse("Current password is required to set a new password", 400);
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, password: true },
    });

    if (!currentUser) return errorResponse("User not found", 404);

    const valid = await bcrypt.compare(parsed.data.currentPassword, currentUser.password);
    if (!valid) {
      return errorResponse("Current password is incorrect", 400);
    }

    updateData.password = await bcrypt.hash(parsed.data.newPassword, 10);
  }

  if (Object.keys(updateData).length === 0) {
    return errorResponse("No changes to save", 400);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  await createActivityLog({
    action: "settings.updated",
    details: "Updated profile settings",
    userId: user.id,
    organizationId: user.organizationId,
  });

  return successResponse({ profile: updated });
}
