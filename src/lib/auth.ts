// ─── Sesión de administradora ─────────────────────────────────────
//
// El panel /admin tiene una sola usuaria (la dueña del negocio), así que
// no hace falta una tabla de usuarios ni un proveedor OAuth: basta una
// contraseña única guardada en ADMIN_PASSWORD y una cookie firmada.
//
// El token se firma con HMAC-SHA256 usando la Web Crypto API (no el módulo
// `crypto` de Node) porque `proxy.ts` corre en el runtime Edge, donde
// `node:crypto` no está disponible. Este archivo se importa desde ambos
// lados, así que solo puede usar APIs que existan en los dos.

export const SESSION_COOKIE = "ea_admin_session";

// 60 días — la dueña abre la app a diario; pedirle la clave cada semana
// sería exactamente el tipo de fricción que hizo fracasar al bot.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 60;

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "Falta ADMIN_SESSION_SECRET en las variables de entorno."
    );
  }
  return secret;
}

// Memoizada a nivel de módulo — importar la clave desde el secreto es el
// mismo resultado en cada llamada, y esto corre en proxy.ts en cada
// navegación a /admin/*.
let cachedKey: Promise<CryptoKey> | undefined;

function importKey(): Promise<CryptoKey> {
  if (!cachedKey) {
    cachedKey = crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(getSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
  }
  return cachedKey;
}

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importKey(),
    new TextEncoder().encode(payload)
  );
  return toBase64Url(signature);
}

// Comparación en tiempo constante — evita filtrar información sobre la
// firma correcta a través de cuánto tarda en fallar la comparación.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export type SessionToken = { value: string; maxAge: number };

export async function createSessionToken(): Promise<SessionToken> {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  return {
    value: `${payload}.${await sign(payload)}`,
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function verifySessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;

  const separator = token.lastIndexOf(".");
  if (separator === -1) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  return timingSafeEqual(signature, await sign(payload));
}

// La contraseña también se compara en tiempo constante, por el mismo motivo.
export function verifyPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("Falta ADMIN_PASSWORD en las variables de entorno.");
  }
  return timingSafeEqual(candidate, expected);
}
