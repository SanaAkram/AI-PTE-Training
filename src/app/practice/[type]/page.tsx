import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { TASK_TYPES } from "@/lib/taskTypes";
import { getLearnerDifficulty, pickRandomQuestionId } from "@/lib/questionPicker";
import type { TaskType } from "@/lib/types";

export default async function SectionPracticePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!(type in TASK_TYPES)) notFound();

  const session = await getSession();
  if (!session) redirect("/login");

  const level = session.role === "learner" ? await getLearnerDifficulty(session.profileId) : "medium";
  const id = await pickRandomQuestionId(type as TaskType, level);

  if (!id) redirect(`/practice?empty=${type}`);
  redirect(`/practice/task/${id}?returnTo=${encodeURIComponent("/practice")}`);
}
