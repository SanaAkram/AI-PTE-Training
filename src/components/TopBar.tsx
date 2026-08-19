import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import type { SessionPayload } from "@/lib/auth";
import { AudioSpeedToggle } from "./AudioSpeedToggle";

export function TopBar({ session }: { session: SessionPayload }) {
  const home = session.role === "observer" ? "/dashboard" : "/today";
  return (
    <div className="sticky top-0 z-10 bg-bg border-b border-line px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Link href={home} className="flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          <div>
            <div className="ur text-base leading-none">انگریزی سفر</div>
            <div className="en text-[0.6rem] font-bold text-ink-soft tracking-wide">ANGREZI SAFAR</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {session.role === "learner" && <AudioSpeedToggle />}
          <form action={logoutAction}>
            <button className="text-xs font-bold text-ink-soft border border-line rounded-full px-3 py-1.5">
              {session.name} ⏻
            </button>
          </form>
        </div>
      </div>
      {session.role === "learner" && (
        <div className="flex items-center gap-1 flex-wrap">
          <Link href="/today" className="text-xs font-bold text-ink-soft px-2.5 py-1 rounded-full hover:bg-surface-alt">
            آج / Today
          </Link>
          <Link href="/practice" className="text-xs font-bold text-ink-soft px-2.5 py-1 rounded-full hover:bg-surface-alt">
            مشق / Practice
          </Link>
          <Link href="/mock-test" className="text-xs font-bold text-ink-soft px-2.5 py-1 rounded-full hover:bg-surface-alt">
            موک ٹیسٹ / Mock Test
          </Link>
          <Link href="/my-words" className="text-xs font-bold text-ink-soft px-2.5 py-1 rounded-full hover:bg-surface-alt">
            میرے الفاظ / My Words
          </Link>
          <Link href="/dashboard" className="text-xs font-bold text-ink-soft px-2.5 py-1 rounded-full hover:bg-surface-alt">
            پیش رفت / Progress
          </Link>
        </div>
      )}
    </div>
  );
}
