"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  createSessionToken,
  verifyPassword,
  verifySessionToken,
} from "@/lib/auth";
import { clearRateLimit, hitRateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string };

// Hay una sola contraseña y un solo factor: sin límite de intentos, se puede
// probar el diccionario entero contra este formulario.
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// `x-forwarded-for` puede traer una cadena de proxies; el cliente real es el
// primero. Es falsificable en principio, pero en Vercel la cabecera la escribe
// la propia plataforma. Sin IP, todos los intentos comparten un mismo cubo:
// preferimos limitar de más antes que dejar un hueco sin contar.
async function clientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "desconocida";
}

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

  const ip = await clientIp();
  const limit = hitRateLimit(ip, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
  if (!limit.allowed) {
    console.warn(`[login] demasiados intentos desde ${ip}`);
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    const tiempo = minutes === 1 ? "1 minuto" : `${minutes} minutos`;
    return { error: `Demasiados intentos. Espera ${tiempo} e intenta de nuevo.` };
  }

  if (!verifyPassword(password)) {
    // Sin este registro, un ataque en curso no deja ninguna huella.
    console.warn(`[login] intento fallido desde ${ip}`);
    return { error: "Contraseña incorrecta." };
  }

  clearRateLimit(ip);

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
