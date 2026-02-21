import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";
import { createActivityLog } from "@/lib/activity-log";
import { createNotification } from "@/lib/notifications";
import { z } from "zod/v4";

const updateSchema = z.object({
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
});

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const subscription = await prisma.subscription.findFirst({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
  });

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { plan: true, name: true },
  });

  return successResponse({
    subscription,
    currentPlan: organization?.plan ?? "FREE",
    organizationName: organization?.name ?? "",
  });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  if (user.role !== "ADMIN") {
    return errorResponse("Forbidden: Only admins can change the subscription plan", 403);
  }

  const body: unknown = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse("Validation failed", 422, parsed.error.issues);
  }

  const newPlan = parsed.data.plan;

  // Update organization plan
  const org = await prisma.organization.update({
    where: { id: user.organizationId },
    data: { plan: newPlan },
  });

  // Update or create subscription
  const existing = await prisma.subscription.findFirst({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
  });

  const nextPeriodEnd = new Date();
  nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

  let subscription;
  if (existing) {
    subscription = await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        plan: newPlan,
        status: newPlan === "FREE" ? "CANCELED" : "ACTIVE",
        currentPeriodEnd: nextPeriodEnd,
      },
    });
  } else {
    subscription = await prisma.subscription.create({
      data: {
        plan: newPlan,
        status: newPlan === "FREE" ? "CANCELED" : "ACTIVE",
        currentPeriodEnd: nextPeriodEnd,
        organizationId: user.organizationId,
      },
    });
  }

  await Promise.all([
    createActivityLog({
      action: "subscription.changed",
      details: `Changed plan to ${newPlan}`,
      userId: user.id,
      organizationId: user.organizationId,
    }),
    createNotification({
      title: "Plan Changed",
      message: `${org.name}'s plan has been changed to ${newPlan}`,
      userId: user.id,
    }),
  ]);

  return successResponse({ subscription, currentPlan: newPlan });
}
