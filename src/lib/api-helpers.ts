import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod/v4";

export type ApiError = {
  error: string;
  details?: z.ZodError["issues"];
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400, details?: z.ZodError["issues"]) {
  const body: ApiError = { error: message };
  if (details) body.details = details;
  return NextResponse.json(body, { status });
}

export async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
