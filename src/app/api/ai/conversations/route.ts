import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";
import { z } from "zod/v4";

const createSchema = z.object({
  title: z.string().min(1).max(200),
});

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const conversations = await prisma.aiConversation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: { select: { messages: true } },
    },
  });

  return successResponse({ conversations });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body: unknown = await request.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse("Validation failed", 422, parsed.error.issues);
  }

  const conversation = await prisma.aiConversation.create({
    data: {
      title: parsed.data.title,
      userId: user.id,
    },
  });

  return successResponse(conversation, 201);
}
