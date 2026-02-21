import { create } from "zustand";

interface ChatState {
  isOpen: boolean;
  activeConversationId: string | null;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setActiveConversation: (id: string | null) => void;
  openWithConversation: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  activeConversationId: null,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  openWithConversation: (id) => set({ isOpen: true, activeConversationId: id }),
}));
