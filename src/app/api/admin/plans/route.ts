import { NextResponse } from "next/server";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("investment_plans")
    .select("*")
    .order("min_deposit", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ plans: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { supabase } = auth;

  const { plan_name, min_deposit, max_deposit, roi, duration, features } =
    await request.json();

  if (!plan_name || !min_deposit || !roi || !duration) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("investment_plans")
    .insert({
      plan_name,
      min_deposit,
      max_deposit: max_deposit ?? null,
      roi,
      duration,
      features: features ?? [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ plan: data });
}
