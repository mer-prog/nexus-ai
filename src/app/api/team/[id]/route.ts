import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { roleUpdateSchema } from "@/lib/validations/team";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";
import { createActivityLog } from "@/lib/activity-log";
import { createNotification } from "@/lib/notifications";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  if (user.role !== "ADMIN") {
    return errorResponse("Forbidden: Only admins can change roles", 403);
  }

  const { id } = await params;

  const body: unknown = await request.json();
  const parsed = roleUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse("Validation failed", 422, parsed.error.issues);
  }

  const target = await prisma.user.findFirst({
    where: { id, organizationId: user.organizationId },
  });

  if (!target) return errorResponse("Member not found", 404);

  if (target.id === user.id) {
    return errorResponse("Cannot change your own role", 400);
  }

  const oldRole = target.role;
  const updated = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  await Promise.all([
    createActivityLog({
      action: "user.role_changed",
      details: `Changed ${target.name}'s role from ${oldRole} to ${parsed.data.role}`,
      userId: user.id,
      organizationId: user.organizationId,
    }),
    createNotification({
      title: "Role Changed",
      message: `${target.name}'s role was changed from ${oldRole} to ${parsed.data.role}`,
      userId: user.id,
    }),
  ]);

  return successResponse(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  if (user.role !== "ADMIN") {
    return errorResponse("Forbidden: Only admins can remove members", 403);
  }

  const { id } = await params;

  if (id === user.id) {
    return errorResponse("Cannot remove yourself from the team", 400);
  }

  const target = await prisma.user.findFirst({
    where: { id, organizationId: user.organizationId },
  });

  if (!target) return errorResponse("Member not found", 404);

  await prisma.user.delete({ where: { id } });

  await createActivityLog({
    action: "user.removed",
    details: `Removed ${target.name} from the team`,
    userId: user.id,
    organizationId: user.organizationId,
  });

  return successResponse({ success: true });
}
