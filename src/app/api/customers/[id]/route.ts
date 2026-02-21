import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { customerUpdateSchema } from "@/lib/validations/customer";
import {
  successResponse,
  errorResponse,
  getAuthenticatedUser,
} from "@/lib/api-helpers";
import { createActivityLog } from "@/lib/activity-log";
import { createNotification } from "@/lib/notifications";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  const customer = await prisma.customer.findFirst({
    where: { id, organizationId: user.organizationId },
  });

  if (!customer) return errorResponse("Customer not found", 404);

  return successResponse(customer);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { id } = await params;
  const body: unknown = await request.json();
  const parsed = customerUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse("Validation failed", 422, parsed.error.issues);
  }

  const existing = await prisma.customer.findFirst({
    where: { id, organizationId: user.organizationId },
  });

  if (!existing) return errorResponse("Customer not found", 404);

  const customer = await prisma.customer.update({
    where: { id },
    data: parsed.data,
  });

  const changes: string[] = [];
  if (parsed.data.name && parsed.data.name !== existing.name) changes.push(`name → ${parsed.data.name}`);
  if (parsed.data.status && parsed.data.status !== existing.status) changes.push(`status → ${parsed.data.status}`);
  if (parsed.data.email && parsed.data.email !== existing.email) changes.push(`email updated`);

  await createActivityLog({
    action: "customer.updated",
    details: `Updated ${customer.name}: ${changes.join(", ") || "details changed"}`,
    userId: user.id,
    organizationId: user.organizationId,
  });

  if (parsed.data.status === "CHURNED" && existing.status !== "CHURNED") {
    await createNotification({
      title: "Customer Churned",
      message: `${customer.name} has been marked as churned`,
      userId: user.id,
    });
  }

  return successResponse(customer);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  const customer = await prisma.customer.findFirst({
    where: { id, organizationId: user.organizationId },
  });

  if (!customer) return errorResponse("Customer not found", 404);

  await prisma.customer.delete({ where: { id } });

  await createActivityLog({
    action: "customer.deleted",
    details: `Deleted customer: ${customer.name}`,
    userId: user.id,
    organizationId: user.organizationId,
  });

  return successResponse({ success: true });
}
