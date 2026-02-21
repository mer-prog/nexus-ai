import { prisma } from "@/lib/db";

interface CreateActivityLogParams {
  action: string;
  details: string;
  userId: string;
  organizationId: string;
}

export async function createActivityLog(params: CreateActivityLogParams) {
  return prisma.activityLog.create({ data: params });
}
