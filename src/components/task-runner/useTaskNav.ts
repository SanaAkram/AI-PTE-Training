"use client";
import { useRouter, useSearchParams } from "next/navigation";
import type { TaskType } from "@/lib/types";

/** Shared "what's next" logic for both the post-score Next button and the
 * Skip button — walks the current queue (Today's Practice / Mock Test) if
 * there is one, otherwise asks for another random question of the same type
 * (standalone Practice by Skill). */
export function useTaskNav() {
  const router = useRouter();
  const params = useSearchParams();
  const queue = (params.get("queue") ?? "").split(",").filter(Boolean);
  const pos = Number(params.get("pos") ?? "0");
  const returnTo = params.get("returnTo") ?? "/today";

  function goNext(taskType: TaskType) {
    if (queue.length && pos + 1 < queue.length) {
      const nextId = queue[pos + 1];
      router.push(
        `/practice/task/${nextId}?queue=${queue.join(",")}&pos=${pos + 1}&returnTo=${encodeURIComponent(returnTo)}`
      );
    } else if (queue.length) {
      router.push(returnTo);
    } else {
      router.push(`/practice/${taskType}`);
    }
  }

  /** Leaves the exercise entirely, no attempt recorded — same destination
   * Skip/Next eventually reach, just immediately. */
  function goBack() {
    router.push(returnTo);
  }

  return { goNext, goBack };
}
