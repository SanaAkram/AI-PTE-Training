import { ReactNode, ButtonHTMLAttributes } from "react";

/** Urdu-primary, English-secondary label — the app's core bilingual pattern. */
export function Bilingual({ ur, en, center }: { ur: ReactNode; en: ReactNode; center?: boolean }) {
  return (
    <div className={`flex flex-col gap-0.5 ${center ? "items-center text-center" : "items-end text-right"}`}>
      <div className="ur text-lg leading-loose">{ur}</div>
      <div className="en text-[0.7rem] font-bold tracking-wide text-ink-soft">{en}</div>
    </div>
  );
}

type Variant = "primary" | "secondary" | "teal" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-[color:var(--accent-ink)] hover:brightness-105",
  secondary: "bg-surface-alt text-ink border border-line",
  teal: "bg-teal text-white hover:brightness-105",
  ghost: "bg-transparent text-ink-soft border border-line",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`w-full rounded-2xl px-5 py-4 font-display font-bold text-base flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-surface border border-line rounded-[20px] p-5 shadow-[var(--shadow)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PteTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block mt-1.5 text-[0.66rem] font-extrabold tracking-wide text-accent-deep bg-surface-alt border border-line rounded-full px-2.5 py-0.5">
      {children}
    </span>
  );
}
