"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { destroySession, getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { DifficultyLevel } from "@/lib/types";

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function setDifficultyAction(level: DifficultyLevel) {
  const session = await getSession();
  if (!session || session.role !== "learner") throw new Error("Not logged in as a learner");

  const { error } = await supabaseAdmin()
    .from("profiles")
    .update({ preferred_difficulty: level })
    .eq("id", session.profileId);
  if (error) throw error;

  revalidatePath("/practice");
  revalidatePath("/today");
}
