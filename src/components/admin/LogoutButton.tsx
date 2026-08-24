"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/actions/auth";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Cerrar sesión"
      disabled={isPending}
      onClick={() => startTransition(() => logout())}
      className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream-deep text-charcoal-light active:bg-cream-mid disabled:opacity-50"
    >
      <LogOut size={18} strokeWidth={1.7} aria-hidden />
    </button>
  );
}
