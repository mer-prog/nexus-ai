"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bot, Plus, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { renderMarkdown } from "@/lib/markdown";
import { useT } from "@/hooks/use-translations";
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

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = useT("ai");

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/ai/conversations");
    if (res.ok) {
      const data = await res.json() as { conversations: Conversation[] };
      setConversations(data.conversations);
    }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    const res = await fetch(`/api/ai/conversations/${convId}/messages`);
    if (res.ok) {
      const data = await res.json() as { messages: Message[] };
      setMessages(data.messages);
    }
  }, []);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeId) void fetchMessages(activeId);
    else setMessages([]);
  }, [activeId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamContent, scrollToBottom]);

  async function handleNewConversation() {
    const res = await fetch("/api/ai/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t("newConversation") }),
    });
    if (res.ok) {
      const conv = await res.json() as Conversation;
      setActiveId(conv.id);
      await fetchConversations();
    }
  }

  async function handleSend() {
    if (!input.trim() || !activeId || streaming) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, role: "USER", content: userMessage, createdAt: new Date().toISOString() },
    ]);

    setStreaming(true);
    setStreamContent("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeId, message: userMessage }),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        for (const line of text.split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as { type: string; content?: string };
              if (data.type === "chunk" && data.content) {
                fullContent += data.content;
                setStreamContent(fullContent);
              }
            } catch { /* ignore */ }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: "ASSISTANT", content: fullContent, createdAt: new Date().toISOString() },
      ]);
      setStreamContent("");
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "ASSISTANT", content: t("sendError"), createdAt: new Date().toISOString() },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Sidebar */}
      <div className="hidden w-72 shrink-0 flex-col rounded-lg border bg-card md:flex">
        <div className="border-b p-3">
          <Button size="sm" className="w-full" onClick={() => void handleNewConversation()}>
            <Plus className="mr-2 h-4 w-4" />
            {t("newConversation")}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("noConversations")}
            </p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveId(conv.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                    activeId === conv.id && "bg-accent"
                  )}
                >
                  <Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{conv.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex flex-1 flex-col">
        <CardHeader className="border-b py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">{t("assistant")}</CardTitle>
              <CardDescription className="text-xs">{t("askAnything")}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4">
          {!activeId ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">{t("welcome")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("welcomeDesc")}
                </p>
                <Button className="mt-4" onClick={() => void handleNewConversation()}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("startConversation")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("mb-4", msg.role === "USER" ? "text-right" : "text-left")}
                >
                  <div
                    className={cn(
                      "inline-block max-w-[80%] rounded-lg px-4 py-3 text-sm",
                      msg.role === "USER" ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    {msg.role === "ASSISTANT" ? (
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert [&_pre]:my-2 [&_code]:text-xs [&_table]:text-xs"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {streaming && streamContent && (
                <div className="mb-4 text-left">
                  <div className="inline-block max-w-[80%] rounded-lg bg-muted px-4 py-3 text-sm">
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert [&_pre]:my-2 [&_code]:text-xs [&_table]:text-xs"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(streamContent) }}
                    />
                  </div>
                </div>
              )}
              {streaming && !streamContent && (
                <div className="mb-4 text-left">
                  <div className="inline-block rounded-lg bg-muted px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {activeId && (
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder={t("typePlaceholder")}
                disabled={streaming}
              />
              <Button onClick={() => void handleSend()} disabled={!input.trim() || streaming}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
