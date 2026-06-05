import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rl = checkRateLimit(`kyc-upload:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const email = formData.get("email");
  const file = formData.get("file");
  const idNumber = formData.get("idNumber");

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "ID document file is required" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File must be a JPEG, PNG, WebP, or PDF" },
      { status: 400 }
    );
  }

  const supabase = createAdminSupabaseClient();

  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (!userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `kyc/${userData.id}/id-document.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("kyc-documents")
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: urlData } = supabase.storage
    .from("kyc-documents")
    .getPublicUrl(path);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("users") as any)
    .update({
      kyc_status: "pending",
      kyc_document_url: urlData.publicUrl,
      kyc_id_number: typeof idNumber === "string" ? idNumber : null,
    })
    .eq("id", userData.id);

  return NextResponse.json({ success: true, documentUrl: urlData.publicUrl });
}
