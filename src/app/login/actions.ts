"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSession, verifyPin } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const profileId = String(formData.get("profileId") || "");
  const pin = String(formData.get("pin") || "");

  if (!profileId || pin.length < 4) {
    return { error: "PIN مکمل کریں / Enter your full PIN" };
  }

  const { data: profile, error } = await supabaseAdmin()
    .from("profiles")
    .select("id, name, role, pin_hash")
    .eq("id", profileId)
    .single();

  if (error || !profile) {
    return { error: "پروفائل نہیں ملا / Profile not found" };
  }

  const ok = await verifyPin(pin, profile.pin_hash);
  if (!ok) {
    return { error: "غلط PIN، دوبارہ کوشش کریں / Wrong PIN, try again" };
  }

  await createSession({ profileId: profile.id, name: profile.name, role: profile.role });
  redirect("/");
}
