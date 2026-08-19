import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import type { SessionPayload } from "@/lib/auth";
import { AudioSpeedToggle } from "./AudioSpeedToggle";
import { NavSidebar, DesktopNav } from "./NavSidebar";

export function TopBar({ session }: { session: SessionPayload }) {
  const home = session.role === "observer" ? "/dashboard" : "/today";
  return (
    <div className="sticky top-0 z-10 bg-bg border-b border-line px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {session.role === "learner" && <NavSidebar />}
        <Link href={home} className="flex items-center gap-2 min-w-0">
          <span className="text-2xl shrink-0">🧭</span>
          <div className="min-w-0 hidden sm:block">
            <div className="ur text-base leading-none truncate">انگریزی سفر</div>
            <div className="en text-[0.6rem] font-bold text-ink-soft tracking-wide">ANGREZI SAFAR</div>
          </div>
        </Link>
      </div>

      {session.role === "learner" && <DesktopNav />}

      <div className="flex items-center gap-2 shrink-0">
        {session.role === "learner" && <AudioSpeedToggle />}
        <form action={logoutAction}>
          <button className="text-xs font-bold text-ink-soft border border-line rounded-full px-3 py-1.5">
            {session.name} ⏻
          </button>
        </form>
      </div>
    </div>
  );
}
