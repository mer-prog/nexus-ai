import { prisma } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  if (user.role === "MEMBER") {
    return errorResponse("Forbidden: Members cannot access team management", 403);
  }

  const members = await prisma.user.findMany({
    where: { organizationId: user.organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: [
      { role: "asc" },
      { name: "asc" },
    ],
  });

  return successResponse({ members, currentUserId: user.id, currentUserRole: user.role });
}
