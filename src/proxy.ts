// ─── Guardia de la zona privada ───────────────────────────────────
//
// Corre antes de renderizar cualquier ruta bajo /admin. Si no hay cookie
// de sesión válida, la petición nunca llega a la página: se redirige al
// login. Esto es lo que mantiene separadas las dos zonas de la app —
// /, /booking y /calendario son públicas y de solo lectura; /admin/* es
// la única puerta a los datos de las clientas y a la escritura en la BD.
//
// En Next.js 16 este archivo se llama `proxy.ts` (antes `middleware.ts`).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const LOGIN_PATH = "/admin/login";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLoggedIn = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );

  // Ya con sesión, el login no tiene sentido: al panel directo.
  if (pathname === LOGIN_PATH) {
    return isLoggedIn
      ? NextResponse.redirect(new URL("/admin", request.url))
      : NextResponse.next();
  }

  if (isLoggedIn) return NextResponse.next();

  // Guardamos a dónde iba para devolverla ahí después de entrar.
  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set("redirect", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/admin/:path*",
};
