// Contador de intentos por IP, en memoria del proceso.
//
// Alcance real: en Vercel cada instancia serverless tiene su propio Map, así
// que esto frena a alguien probando contraseñas desde una máquina, no un
// ataque repartido entre muchas IPs. Para una app de una sola usuaria es la
// relación esfuerzo/beneficio correcta; si algún día hace falta más, el
// reemplazo es un contador compartido (Upstash Redis o el rate limiting de
// la plataforma) manteniendo esta misma interfaz.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Evita que el Map crezca sin límite si llegan muchas IPs distintas.
const MAX_TRACKED_KEYS = 10_000;

export type RateLimitResult = {
  allowed: boolean;
  /** Segundos que faltan para poder reintentar. Solo útil si allowed es false. */
  retryAfterSeconds: number;
};

/**
 * Registra un intento y dice si se permite.
 *
 * @param key       identificador del origen (aquí, la IP)
 * @param limit     intentos permitidos por ventana
 * @param windowMs  duración de la ventana en milisegundos
 */
export function hitRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      for (const [k, bucket] of buckets) {
        if (now >= bucket.resetAt) buckets.delete(k);
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Borra el contador de una IP: se llama tras un inicio de sesión correcto. */
export function clearRateLimit(key: string): void {
  buckets.delete(key);
}
