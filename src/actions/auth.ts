"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  createSessionToken,
  verifyPassword,
  verifySessionToken,
} from "@/lib/auth";

export type LoginState = { error?: string };

// Solo aceptamos redirecciones internas al propio panel: un `redirect`
// tomado del query string podría venir manipulado y mandar a otro sitio.
function safeRedirectTarget(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "";
  return value.startsWith("/admin") && !value.startsWith("/admin/login")
    ? value
    : "/admin";
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!password) {
    return { error: "Escribe tu contraseña." };
  }

  if (!verifyPassword(password)) {
    return { error: "Contraseña incorrecta." };
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: token.maxAge,
  });

  redirect(safeRedirectTarget(formData.get("redirect")));
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// Segunda línea de defensa. `proxy.ts` ya bloquea la navegación a /admin,
// pero las Server Actions se invocan por POST desde el cliente y podrían
// llamarse sin pasar por una página: cada acción que escribe en la BD
// vuelve a verificar la sesión aquí.
export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("No autorizado.");
  }
}
