import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationBell } from "@/components/layout/notification-bell";

const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();
const mockNotifications = vi.fn(() => [
  {
    id: "1",
    title: "New Customer",
    message: "John Doe was added",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Payment Received",
    message: "Invoice #123 was paid",
    read: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]);

vi.mock("@/hooks/use-notifications", () => ({
  useNotifications: () => ({
    notifications: mockNotifications(),
    unreadCount: mockNotifications().filter((n: { read: boolean }) => !n.read).length,
    markAsRead: mockMarkAsRead,
    markAllAsRead: mockMarkAllAsRead,
  }),
}));

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the bell button", () => {
    render(<NotificationBell />);
    expect(screen.getByTitle("Notifications")).toBeInTheDocument();
  });

  it("shows unread count badge", () => {
    render(<NotificationBell />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("opens dropdown when clicked", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByTitle("Notifications"));

    expect(screen.getByText("New Customer")).toBeInTheDocument();
    expect(screen.getByText("Payment Received")).toBeInTheDocument();
  });

  it("shows mark all read button when unread exist", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByTitle("Notifications"));
    expect(screen.getByText("Mark all read")).toBeInTheDocument();
  });

  it("shows empty state when no notifications", async () => {
    mockNotifications.mockReturnValue([]);
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByTitle("Notifications"));
    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });

  it("displays 9+ for more than 9 unread", () => {
    mockNotifications.mockReturnValue(
      Array.from({ length: 12 }, (_, i) => ({
        id: String(i),
        title: `Notification ${i}`,
        message: "Test",
        read: false,
        createdAt: new Date().toISOString(),
      }))
    );
    render(<NotificationBell />);
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("has accessible screen reader text", () => {
    mockNotifications.mockReturnValue([
      {
        id: "1",
        title: "Test",
        message: "Test",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    render(<NotificationBell />);
    const srText = screen.getByText((_content, element) => {
      return element?.classList?.contains("sr-only") === true &&
        element?.textContent?.includes("Notifications") === true &&
        element?.textContent?.includes("unread") === true;
    });
    expect(srText).toBeInTheDocument();
  });
});
