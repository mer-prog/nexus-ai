"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useUserRoleStore } from "@/hooks/use-user-role";
import { ChatWidget } from "@/components/ai/chat-widget";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
    organizationName: string;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const isOpen = useSidebarStore((s) => s.isOpen);
  const setRole = useUserRoleStore((s) => s.setRole);

  useEffect(() => {
    setRole(user.role);
  }, [user.role, setRole]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300",
          isOpen ? "lg:pl-64" : "lg:pl-0"
        )}
      >
        <Header user={user} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
      <ChatWidget />
      <Toaster />
    </div>
  );
}
