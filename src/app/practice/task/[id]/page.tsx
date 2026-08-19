import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { TASK_TYPES } from "@/lib/taskTypes";
import { TaskRunner } from "@/components/task-runner/TaskRunner";
import type { QuestionRow, TaskType } from "@/lib/types";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabaseAdmin().from("question_bank").select("*").eq("id", id).single();
  if (!data) notFound();

  const question = data as QuestionRow;
  const config = TASK_TYPES[question.task_type as TaskType];

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
      <TaskRunner question={question} config={config} />
    </main>
  );
}
