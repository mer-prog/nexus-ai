import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatWidget } from "@/components/ai/chat-widget";

const mockToggle = vi.fn();
const mockClose = vi.fn();
const mockSetActiveConversation = vi.fn();
let mockIsOpen = false;
let mockActiveConversationId: string | null = null;

vi.mock("@/stores/chat-store", () => ({
  useChatStore: () => ({
    isOpen: mockIsOpen,
    toggle: mockToggle,
    close: mockClose,
    activeConversationId: mockActiveConversationId,
    setActiveConversation: mockSetActiveConversation,
  }),
}));

vi.mock("@/lib/markdown", () => ({
  renderMarkdown: (text: string) => `<p>${text}</p>`,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ChatWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOpen = false;
    mockActiveConversationId = null;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ conversations: [] }),
    });
  });

  it("renders floating button when closed", () => {
    render(<ChatWidget />);
    expect(screen.getByLabelText("Open AI chat")).toBeInTheDocument();
  });

  it("calls toggle when floating button is clicked", async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByLabelText("Open AI chat"));
    expect(mockToggle).toHaveBeenCalled();
  });

  it("shows conversation list when open", async () => {
    mockIsOpen = true;
    render(<ChatWidget />);
    expect(screen.getByText("Conversations")).toBeInTheDocument();
    expect(screen.getByText("New Conversation")).toBeInTheDocument();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it("shows AI Assistant title when conversation is active", async () => {
    mockIsOpen = true;
    mockActiveConversationId = "conv-1";
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [] }),
    });
    render(<ChatWidget />);
    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it("fetches conversations when opened", async () => {
    mockIsOpen = true;
    render(<ChatWidget />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/ai/conversations");
    });
  });

  it("shows empty state after fetch resolves", async () => {
    mockIsOpen = true;
    render(<ChatWidget />);
    await waitFor(() => {
      expect(screen.getByText("No conversations yet")).toBeInTheDocument();
    });
  });
});
