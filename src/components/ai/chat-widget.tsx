"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bot, X, Plus, Send, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/chat-store";
import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  _count: { messages: number };
}

interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

export function ChatWidget() {
  const { isOpen, toggle, close, activeConversationId, setActiveConversation } =
    useChatStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const res = await fetch("/api/ai/conversations");
      if (res.ok) {
        const data = await res.json() as { conversations: Conversation[] };
        setConversations(data.conversations);
      }
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (convId: string) => {
    const res = await fetch(`/api/ai/conversations/${convId}/messages`);
    if (res.ok) {
      const data = await res.json() as { messages: Message[] };
      setMessages(data.messages);
    }
  }, []);

  useEffect(() => {
    if (isOpen) void fetchConversations();
  }, [isOpen, fetchConversations]);

  useEffect(() => {
    if (activeConversationId) void fetchMessages(activeConversationId);
    else setMessages([]);
  }, [activeConversationId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamContent, scrollToBottom]);

  async function handleNewConversation() {
    const res = await fetch("/api/ai/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Conversation" }),
    });
    if (res.ok) {
      const conv = await res.json() as Conversation;
      setActiveConversation(conv.id);
      await fetchConversations();
    }
  }

  async function handleSend() {
    if (!input.trim() || !activeConversationId || streaming) return;

    const userMessage = input.trim();
    setInput("");

    // Optimistically add user message
    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        role: "USER",
        content: userMessage,
        createdAt: new Date().toISOString(),
      },
    ]);

    setStreaming(true);
    setStreamContent("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: userMessage,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to send message");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as {
                type: string;
                content?: string;
              };
              if (data.type === "chunk" && data.content) {
                fullContent += data.content;
                setStreamContent(fullContent);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      // Replace streaming with final message
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "ASSISTANT",
          content: fullContent,
          createdAt: new Date().toISOString(),
        },
      ]);
      setStreamContent("");
    } catch {
      // On error, show error message
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "ASSISTANT",
          content: "Sorry, I encountered an error. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggle}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105",
          isOpen && "scale-0 pointer-events-none"
        )}
        aria-label="Open AI chat"
      >
        <Bot className="h-6 w-6" />
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex w-96 flex-col rounded-lg border bg-background shadow-2xl transition-all duration-300",
          isOpen
            ? "h-[32rem] opacity-100 translate-y-0"
            : "h-0 opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          {activeConversationId && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setActiveConversation(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="flex-1 text-sm font-semibold">
            {activeConversationId ? "AI Assistant" : "Conversations"}
          </h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={close}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!activeConversationId ? (
          // Conversation list
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <Button size="sm" className="w-full" onClick={handleNewConversation}>
                <Plus className="mr-2 h-4 w-4" />
                New Conversation
              </Button>
            </div>
            {loadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No conversations yet
              </p>
            ) : (
              <div className="space-y-1 px-3 pb-3">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {conv._count.messages} messages
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Chat view
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {messages.length === 0 && !streaming && (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Bot className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Ask me anything about your data
                    </p>
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "mb-3",
                    msg.role === "USER" ? "text-right" : "text-left"
                  )}
                >
                  <div
                    className={cn(
                      "inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      msg.role === "USER"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {msg.role === "ASSISTANT" ? (
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert [&_pre]:my-2 [&_code]:text-xs [&_table]:text-xs [&_li]:my-0"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(msg.content),
                        }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {streaming && streamContent && (
                <div className="mb-3 text-left">
                  <div className="inline-block max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert [&_pre]:my-2 [&_code]:text-xs [&_table]:text-xs [&_li]:my-0"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(streamContent),
                      }}
                    />
                  </div>
                </div>
              )}
              {streaming && !streamContent && (
                <div className="mb-3 text-left">
                  <div className="inline-block rounded-lg bg-muted px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  disabled={streaming}
                  className="text-sm"
                />
                <Button
                  size="icon"
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || streaming}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
