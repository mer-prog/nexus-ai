import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";
import { getMockAIResponse } from "@/lib/ai-mock";
import { z } from "zod/v4";

const chatSchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body: unknown = await request.json();
  const parsed = chatSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse("Validation failed", 422, parsed.error.issues);
  }

  const { conversationId, message } = parsed.data;

  const conversation = await prisma.aiConversation.findFirst({
    where: { id: conversationId, userId: user.id },
  });

  if (!conversation) return errorResponse("Conversation not found", 404);

  // Save user message
  await prisma.aiMessage.create({
    data: {
      role: "USER",
      content: message,
      conversationId,
    },
  });

  // Get mock AI response
  const aiResponse = getMockAIResponse(message);

  // Save AI message
  await prisma.aiMessage.create({
    data: {
      role: "ASSISTANT",
      content: aiResponse,
      conversationId,
    },
  });

  // Stream response via SSE with typing simulation
  const encoder = new TextEncoder();
  const words = aiResponse.split(" ");

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? "" : " ") + words[i];
        const data = JSON.stringify({ type: "chunk", content: chunk });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

        // Random delay between 30-80ms per word for typing effect
        await new Promise((resolve) =>
          setTimeout(resolve, 30 + Math.random() * 50)
        );
      }

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
