import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";

// Mock the stores
const mockRole = vi.fn(() => "ADMIN");
vi.mock("@/hooks/use-user-role", () => ({
  useUserRole: () => mockRole(),
  useUserRoleStore: Object.assign(
    vi.fn((selector: (state: { role: string; setRole: (r: string) => void }) => unknown) =>
      selector({ role: mockRole(), setRole: vi.fn() })
    ),
    {
      getState: () => ({ role: mockRole(), setRole: vi.fn() }),
      setState: vi.fn(),
      subscribe: vi.fn(),
    }
  ),
}));

vi.mock("@/stores/sidebar-store", () => ({
  useSidebarStore: vi.fn((selector: (state: { isOpen: boolean; isMobileOpen: boolean; closeMobile: () => void }) => unknown) =>
    selector({ isOpen: true, isMobileOpen: false, closeMobile: vi.fn() })
  ),
}));

// Mock locale store with English messages
const navMessages = {
  nav: {
    overview: "Overview",
    analytics: "Analytics",
    aiAssistant: "AI Assistant",
    customers: "Customers",
    team: "Team",
    billing: "Billing",
    settings: "Settings",
    closeSidebar: "Close sidebar",
    toggleMenu: "Toggle menu",
    toggleSidebar: "Toggle sidebar",
  },
};

vi.mock("@/stores/locale-store", () => ({
  useLocaleStore: vi.fn((selector: (state: { locale: string; messages: Record<string, unknown> }) => unknown) =>
    selector({ locale: "en", messages: navMessages })
  ),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    mockRole.mockReturnValue("ADMIN");
  });

  it("renders the Nexus AI branding", () => {
    render(<Sidebar />);
    expect(screen.getAllByText("Nexus AI").length).toBeGreaterThan(0);
  });

  it("shows all nav items for ADMIN", () => {
    render(<Sidebar />);
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Analytics").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AI Assistant").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Customers").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Team").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Billing").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Settings").length).toBeGreaterThan(0);
  });

  it("shows Team for MANAGER role", () => {
    mockRole.mockReturnValue("MANAGER");
    render(<Sidebar />);
    expect(screen.getAllByText("Team").length).toBeGreaterThan(0);
  });

  it("hides Team for MEMBER role", () => {
    mockRole.mockReturnValue("MEMBER");
    render(<Sidebar />);
    expect(screen.queryByText("Team")).toBeNull();
  });

  it("always shows Overview regardless of role", () => {
    mockRole.mockReturnValue("MEMBER");
    render(<Sidebar />);
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
  });

  it("always shows Customers regardless of role", () => {
    mockRole.mockReturnValue("MEMBER");
    render(<Sidebar />);
    expect(screen.getAllByText("Customers").length).toBeGreaterThan(0);
  });
});
