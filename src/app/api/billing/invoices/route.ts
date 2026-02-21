import { prisma } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const invoices = await prisma.invoice.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { issuedAt: "desc" },
  });

  return successResponse({ invoices });
}
