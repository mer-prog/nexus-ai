import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const AUTH_RATE_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 }; // 10 attempts per 15 min

async function rateLimitedPOST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const result = rateLimit(`auth:${ip}`, AUTH_RATE_LIMIT);

  if (!result.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  return handlers.POST(request);
}

export const GET = handlers.GET;
export const POST = rateLimitedPOST;
