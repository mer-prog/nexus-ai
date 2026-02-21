import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { inviteSchema } from "@/lib/validations/team";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";
import { createActivityLog } from "@/lib/activity-log";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  if (user.role !== "ADMIN") {
    return errorResponse("Forbidden: Only admins can invite members", 403);
  }

  const body: unknown = await request.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse("Validation failed", 422, parsed.error.issues);
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return errorResponse("A user with this email already exists", 409);
  }

  // Mock: Create the user directly with a temporary password
  // In production, this would send an invite email
  const tempPassword = await bcrypt.hash("invited123", 10);

  const newMember = await prisma.user.create({
    data: {
      name: parsed.data.email.split("@")[0],
      email: parsed.data.email,
      password: tempPassword,
      role: parsed.data.role ?? "MEMBER",
      organizationId: user.organizationId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // Mock: Log the invite (in production, would send email)
  console.log(`[Mock Email] Invite sent to ${parsed.data.email} for organization ${user.organizationName}`);

  await createActivityLog({
    action: "user.invited",
    details: `Invited ${parsed.data.email} as ${parsed.data.role ?? "MEMBER"}`,
    userId: user.id,
    organizationId: user.organizationId,
  });

  return successResponse({ member: newMember, invited: true }, 201);
}
