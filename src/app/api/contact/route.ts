import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1).max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rl = checkRateLimit(`contact:${ip}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, subject, message } = parsed.data;

  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("notifications").insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      title: `Contact: ${subject}`,
      message: `From: ${firstName} ${lastName} <${email}>\n\n${message}`,
    });
  } catch {
    // Store failure is non-fatal — still return success to user
  }

  return NextResponse.json({ success: true });
}
