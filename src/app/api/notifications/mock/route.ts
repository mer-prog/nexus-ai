import { prisma } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";
import { createNotification } from "@/lib/notifications";

const mockNotifications = [
  { title: "New Signup", message: "A new customer just signed up for the Pro plan" },
  { title: "Payment Received", message: "Payment of $299 received from CloudSync Pro" },
  { title: "Churn Alert", message: "DataNest hasn't logged in for 30 days" },
  { title: "Support Ticket", message: "New high-priority ticket from ByteForge" },
  { title: "Goal Achieved", message: "Monthly revenue target exceeded by 12%" },
  { title: "Team Update", message: "A new team member has been invited" },
  { title: "System Alert", message: "API response times are elevated" },
  { title: "Review Pending", message: "Quarterly report is ready for your review" },
];

export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  // Only allow in dev mode
  if (process.env.NODE_ENV === "production") {
    return errorResponse("Not available in production", 403);
  }

  const mock = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];

  const notification = await createNotification({
    title: mock.title,
    message: mock.message,
    userId: user.id,
  });

  return successResponse(notification, 201);
}
