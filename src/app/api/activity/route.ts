import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser, parsePaginationParams } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const searchParams = request.nextUrl.searchParams;
  const { limit, skip } = parsePaginationParams(searchParams);

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: { organizationId: user.organizationId },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.activityLog.count({ where: { organizationId: user.organizationId } }),
  ]);

  return successResponse({ logs, total });
}
