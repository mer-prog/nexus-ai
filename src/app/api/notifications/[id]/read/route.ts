import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  const notification = await prisma.notification.findFirst({
    where: { id, userId: user.id },
  });

  if (!notification) return errorResponse("Notification not found", 404);

  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return successResponse(updated);
}
