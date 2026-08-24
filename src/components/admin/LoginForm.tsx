"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "@/actions/auth";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin";
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      <label className="flex flex-col gap-2">
        <span className="font-sans text-xs tracking-[0.16em] uppercase text-charcoal-light">
          Contraseña
        </span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus
          required
          className="h-14 rounded-2xl border border-cream-deep bg-white px-4 font-sans text-lg text-dark-charcoal outline-none focus:border-muted-rose"
        />
      </label>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-muted-rose-light/50 px-4 py-3 font-sans text-sm text-muted-rose-dark"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-14 rounded-2xl bg-muted-rose font-sans text-base tracking-[0.08em] uppercase text-cream-soft transition-colors active:bg-muted-rose-dark disabled:opacity-60"
      >
        {isPending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
