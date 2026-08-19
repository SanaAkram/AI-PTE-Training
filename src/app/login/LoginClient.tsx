"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { loginAction, type LoginState } from "./actions";
import { Bilingual, Button, Card } from "@/components/ui";

export interface LoginProfile {
  id: string;
  name: string;
  role: "learner" | "observer";
}

const PROFILE_ICON: Record<string, string> = { learner: "🧑‍🎓", observer: "👀" };

export default function LoginClient({ profiles }: { profiles: LoginProfile[] }) {
  const [selected, setSelected] = useState<LoginProfile | null>(null);
  const [pin, setPin] = useState("");
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(loginAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (pin.length === 4 && selected && !isPending) {
      formRef.current?.requestSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  useEffect(() => {
    if (state.error) setPin("");
  }, [state.error]);

  if (!selected) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center gap-6 px-5 py-10">
        <div className="text-center">
          <div className="text-5xl mb-2">🧭</div>
          <Bilingual center ur="کون استعمال کر رہا ہے؟" en="WHO'S PRACTICING?" />
        </div>
        <div className="flex flex-col gap-4">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="bg-surface border border-line rounded-[20px] p-6 shadow-[var(--shadow)] flex items-center gap-4 text-right active:scale-[0.98] transition"
            >
              <span className="text-3xl">{PROFILE_ICON[p.role]}</span>
              <span className="flex-1 font-display font-bold text-xl">{p.name}</span>
              <span className="text-ink-soft">›</span>
            </button>
          ))}
          {profiles.length === 0 && (
            <Card>
              <p className="text-sm text-ink-soft text-center">
                No profiles yet — run <code>npm run seed</code> after setting up Supabase.
              </p>
            </Card>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center gap-6 px-5 py-10">
      <div className="text-center">
        <div className="text-4xl mb-2">{PROFILE_ICON[selected.role]}</div>
        <Bilingual center ur={`${selected.name} — اپنا PIN لگائیں`} en="ENTER YOUR PIN" />
      </div>

      <div className="flex justify-center gap-4" dir="ltr">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${
              i < pin.length ? "bg-accent border-accent" : "border-line"
            }`}
          />
        ))}
      </div>

      {state.error && <p className="text-rose text-center text-sm font-bold">{state.error}</p>}

      <div className="grid grid-cols-3 gap-3" dir="ltr">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"].map((k) => {
          if (k === "⌫") {
            return (
              <button
                key={k}
                type="button"
                onClick={() => setPin((p) => p.slice(0, -1))}
                className="rounded-2xl bg-surface-alt border border-line py-5 text-xl font-display font-bold active:scale-95"
              >
                ⌫
              </button>
            );
          }
          if (k === "✓") {
            return (
              <button
                key={k}
                type="button"
                onClick={() => formRef.current?.requestSubmit()}
                disabled={pin.length !== 4 || isPending}
                className="rounded-2xl bg-teal text-white py-5 text-xl font-display font-bold active:scale-95 disabled:opacity-30"
              >
                ✓
              </button>
            );
          }
          return (
            <button
              key={k}
              type="button"
              onClick={() => setPin((p) => (p.length < 4 ? p + k : p))}
              className="rounded-2xl bg-surface border border-line py-5 text-xl font-display font-bold active:scale-95"
            >
              {k}
            </button>
          );
        })}
      </div>

      <form ref={formRef} action={formAction} className="hidden">
        <input type="hidden" name="profileId" value={selected.id} />
        <input type="hidden" name="pin" value={pin} />
      </form>

      <Button variant="ghost" type="button" onClick={() => setSelected(null)}>
        ⬅ واپس <span className="opacity-70 text-sm">(Back)</span>
      </Button>
    </main>
  );
}
