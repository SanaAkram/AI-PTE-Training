import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import type { SessionPayload } from "@/lib/auth";

export function TopBar({ session }: { session: SessionPayload }) {
  const home = session.role === "observer" ? "/dashboard" : "/today";
  return (
    <div className="sticky top-0 z-10 bg-bg border-b border-line px-4 py-3 flex items-center justify-between">
      <Link href={home} className="flex items-center gap-2">
        <span className="text-2xl">🧭</span>
        <div>
          <div className="ur text-base leading-none">انگریزی سفر</div>
          <div className="en text-[0.6rem] font-bold text-ink-soft tracking-wide">ANGREZI SAFAR</div>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        {session.role === "learner" && (
          <>
            <Link href="/practice" className="text-xs font-bold text-ink-soft px-2 py-1.5">
              Practice
            </Link>
            <Link href="/mock-test" className="text-xs font-bold text-ink-soft px-2 py-1.5">
              Mock Test
            </Link>
            <Link href="/dashboard" className="text-xs font-bold text-ink-soft px-2 py-1.5">
              Progress
            </Link>
          </>
        )}
        <form action={logoutAction}>
          <button className="text-xs font-bold text-ink-soft border border-line rounded-full px-3 py-1.5">
            {session.name} ⏻
          </button>
        </form>
      </div>
    </div>
  );
}
