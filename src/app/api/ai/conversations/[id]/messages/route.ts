import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  const conversation = await prisma.aiConversation.findFirst({
    where: { id, userId: user.id },
  });

  if (!conversation) return errorResponse("Conversation not found", 404);

  const messages = await prisma.aiMessage.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
  });

  return successResponse({ conversation, messages });
}
