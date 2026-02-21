import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({
    user: {
      id: "user-1",
      role: "ADMIN",
      organizationId: "org-1",
      organizationName: "Test",
    },
  })),
}));

const mockConvFindFirst = vi.fn();
const mockMessageCreate = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    aiConversation: {
      findFirst: (...args: unknown[]) => mockConvFindFirst(...args),
    },
    aiMessage: {
      create: (...args: unknown[]) => mockMessageCreate(...args),
    },
  },
}));

vi.mock("@/lib/ai-mock", () => ({
  getMockAIResponse: vi.fn(() => "This is a mock response from AI"),
}));

describe("POST /api/ai/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConvFindFirst.mockResolvedValue({ id: "conv-1", userId: "user-1" });
    mockMessageCreate.mockResolvedValue({ id: "msg-1" });
  });

  it("returns SSE stream for valid request", async () => {
    const { POST } = await import("@/app/api/ai/chat/route");
    const req = new NextRequest("http://localhost/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        conversationId: "conv-1",
        message: "Hello AI",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
  });

  it("saves user message to database", async () => {
    const { POST } = await import("@/app/api/ai/chat/route");
    const req = new NextRequest("http://localhost/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        conversationId: "conv-1",
        message: "Test message",
      }),
      headers: { "Content-Type": "application/json" },
    });
    await POST(req);

    expect(mockMessageCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: "USER",
          content: "Test message",
          conversationId: "conv-1",
        }),
      })
    );
  });

  it("saves AI response to database", async () => {
    const { POST } = await import("@/app/api/ai/chat/route");
    const req = new NextRequest("http://localhost/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        conversationId: "conv-1",
        message: "Hello",
      }),
      headers: { "Content-Type": "application/json" },
    });
    await POST(req);

    expect(mockMessageCreate).toHaveBeenCalledTimes(2);
    expect(mockMessageCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: "ASSISTANT",
        }),
      })
    );
  });

  it("returns 404 for non-existent conversation", async () => {
    mockConvFindFirst.mockResolvedValue(null);

    const { POST } = await import("@/app/api/ai/chat/route");
    const req = new NextRequest("http://localhost/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        conversationId: "nonexistent",
        message: "Hello",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);

    expect(res.status).toBe(404);
  });

  it("returns 422 for empty message", async () => {
    const { POST } = await import("@/app/api/ai/chat/route");
    const req = new NextRequest("http://localhost/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        conversationId: "conv-1",
        message: "",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);

    expect(res.status).toBe(422);
  });

  it("returns 422 for missing conversationId", async () => {
    const { POST } = await import("@/app/api/ai/chat/route");
    const req = new NextRequest("http://localhost/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Hello",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);

    expect(res.status).toBe(422);
  });
});
