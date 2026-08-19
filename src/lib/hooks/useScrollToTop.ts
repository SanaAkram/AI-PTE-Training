"use client";
import { useEffect } from "react";

/** Scrolls the window back to the top whenever `dep` changes — needed
 * anywhere a "Next question" moves to new content by updating state instead
 * of navigating (Grammar, My Words games), since only real page navigation
 * gets Next.js's automatic scroll-to-top. Without this, the learner stays
 * scrolled down at the answer options and never sees the new question's
 * explanation/examples above. */
export function useScrollToTop(dep: unknown) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);
}
