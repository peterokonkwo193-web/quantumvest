import bcrypt from "bcryptjs";
import { createServerSupabaseClient } from "./supabase-server";

export type { SessionPayload } from "./session";
export { createSession, verifySession } from "./session";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  kycStatus: "pending" | "approved" | "rejected" | "none";
  emailVerified: boolean;
  balance: number;
  referralCode: string;
  createdAt: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, wallet_balance, kyc_status, referral_code, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    name: profile.full_name ?? "",
    role: (user.app_metadata?.role as "user" | "admin") ?? "user",
    kycStatus: (profile.kyc_status as User["kycStatus"]) ?? "none",
    emailVerified: !!user.email_confirmed_at,
    balance: profile.wallet_balance ?? 0,
    referralCode: profile.referral_code ?? "",
    createdAt: profile.created_at ?? user.created_at,
  };
}
