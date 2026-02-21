import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { customerCreateSchema } from "@/lib/validations/customer";
import {
  successResponse,
  errorResponse,
  getAuthenticatedUser,
  parsePaginationParams,
} from "@/lib/api-helpers";
import { createActivityLog } from "@/lib/activity-log";
import { createNotification } from "@/lib/notifications";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const searchParams = request.nextUrl.searchParams;
  const { page, limit, skip } = parsePaginationParams(searchParams);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const where: Prisma.CustomerWhereInput = {
    organizationId: user.organizationId,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status && ["ACTIVE", "INACTIVE", "CHURNED"].includes(status)) {
    where.status = status as Prisma.CustomerWhereInput["status"];
  }

  const allowedSortFields = ["name", "email", "company", "status", "createdAt"];
  const orderField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [orderField]: sortOrder },
    }),
    prisma.customer.count({ where }),
  ]);

  return successResponse({
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body: unknown = await request.json();
  const parsed = customerCreateSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse("Validation failed", 422, parsed.error.issues);
  }

  const customer = await prisma.customer.create({
    data: {
      ...parsed.data,
      status: parsed.data.status ?? "ACTIVE",
      organizationId: user.organizationId,
    },
  });

  await Promise.all([
    createActivityLog({
      action: "customer.created",
      details: `Created customer: ${customer.name}`,
      userId: user.id,
      organizationId: user.organizationId,
    }),
    createNotification({
      title: "New Customer",
      message: `${customer.name} was added as a new customer`,
      userId: user.id,
    }),
  ]);

  return successResponse(customer, 201);
}
