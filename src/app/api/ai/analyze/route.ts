import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";
import { getAnalysisResponse } from "@/lib/ai-mock";
import { z } from "zod/v4";

const analyzeSchema = z.object({
  mrr: z.number(),
  newCustomers: z.number(),
  churnRate: z.number(),
  nrr: z.number(),
  totalRevenue: z.number(),
  activeCustomers: z.number(),
});

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body: unknown = await request.json();
  const parsed = analyzeSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse("Validation failed", 422, parsed.error.issues);
  }

  // Create a conversation for this analysis
  const conversation = await prisma.aiConversation.create({
    data: {
      title: `Data Analysis — ${new Date().toLocaleDateString()}`,
      userId: user.id,
    },
  });

  // Save the user context message
  await prisma.aiMessage.create({
    data: {
      role: "USER",
      content: `Analyze my current KPI data: MRR $${parsed.data.mrr}, ${parsed.data.newCustomers} new customers, ${parsed.data.churnRate}% churn rate, ${parsed.data.nrr}% NRR, $${parsed.data.totalRevenue} total revenue, ${parsed.data.activeCustomers} active customers.`,
      conversationId: conversation.id,
    },
  });

  const aiResponse = getAnalysisResponse(parsed.data);

  // Save the AI analysis
  await prisma.aiMessage.create({
    data: {
      role: "ASSISTANT",
      content: aiResponse,
      conversationId: conversation.id,
    },
  });

  // Stream response via SSE
  const encoder = new TextEncoder();
  const words = aiResponse.split(" ");

  const stream = new ReadableStream({
    async start(controller) {
      // Send conversation ID first
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "meta", conversationId: conversation.id })}\n\n`
        )
      );

      // Add initial delay to simulate "thinking"
      await new Promise((resolve) => setTimeout(resolve, 800));

      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? "" : " ") + words[i];
        const data = JSON.stringify({ type: "chunk", content: chunk });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        await new Promise((resolve) =>
          setTimeout(resolve, 20 + Math.random() * 40)
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
