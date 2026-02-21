import { getAuthenticatedUser } from "@/lib/api-helpers";
import { addSSEClient, removeSSEClient } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`));

      // Register SSE client
      addSSEClient(user.id, controller);

      // Keep-alive ping every 30 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(interval);
          removeSSEClient(controller);
        }
      }, 30000);

      // Cleanup on close
      const cleanup = () => {
        clearInterval(interval);
        removeSSEClient(controller);
      };

      // Store cleanup for when the connection is closed
      (controller as unknown as Record<string, () => void>).__cleanup = cleanup;
    },
    cancel(controller) {
      const cleanup = (controller as unknown as Record<string, () => void>).__cleanup;
      if (cleanup) cleanup();
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
