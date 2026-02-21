"use client";

import { create } from "zustand";

interface UserRoleStore {
  role: string;
  setRole: (role: string) => void;
}

export const useUserRoleStore = create<UserRoleStore>((set) => ({
  role: "MEMBER",
  setRole: (role) => set({ role }),
}));

export function useUserRole(): string {
  return useUserRoleStore((s) => s.role);
}
