<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# makeup_agenda

Site de agenda para un negocio de maquillaje (Guayaquil, EC). Next.js 16.3.3 (App Router, `src/`), React 19, Tailwind v4, Prisma 5 + PostgreSQL (Supabase). `CLAUDE.md` tiene notas de arquitectura más detalladas y verificadas — consúltalo antes de tocar flujo de datos o imágenes.

## Commands

```bash
npm run dev                    # dev server en :3000
npm run build                  # build de producción (única verificación de tipos real en CI)
npx tsc --noEmit               # type-check rápido
npx prisma migrate dev --name <name>   # crear y aplicar migración
npx prisma db seed             # corre prisma/seed.ts vía tsx (config en package.json > "prisma")
npx prisma studio              # GUI para la BD
```

No hay lint, ni tests, ni CI. `postinstall` corre `prisma generate` — si los tipos de Prisma se ven desactualizados, corre `npx prisma generate`.

## Gotchas

- **Tailwind v4 CSS-first**: todos los tokens viven en `@theme {}` en `src/app/globals.css`. **No existe** `tailwind.config.ts` — no lo crees.
- **`proxy.ts`, no `middleware.ts`**: en Next.js 16 el archivo se renombró. `src/proxy.ts` protege `/admin/*` y corre en runtime Edge, por eso `src/lib/auth.ts` usa Web Crypto (`crypto.subtle`), no `node:crypto`. Protege **navegación a páginas**, no las Server Actions — ver invariantes.
- **Timezone**: el negocio opera en `America/Guayaquil` (UTC-5, sin DST). Todo "hoy/mañana" pasa por `guayaquilDateString()` en `src/lib/dates.ts` — nunca uses `new Date()` crudo para fechas de negocio (el server en Vercel corre UTC). Para renderizar una fecha de la BD sin corrimiento de día, re-parsea a mediodía: `new Date(iso.split("T")[0] + "T12:00:00")` (patrón `toDateKey` en `AvailabilityCalendar.tsx`, usado en 5+ lugares).
- **`.env` está gitignored**; los valores reales viven solo local/Vercel. Claves requeridas: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.

## Invariantes de arquitectura (no romper)

- **Dos zonas, un deploy**: `/`, `/booking`, `/calendario` son públicas y de **solo lectura** (no escriben en la BD; `/booking` termina en un enlace `wa.me`, y `/calendario` consume `getPublicAppointmentAvailability()` que no trae PII). Toda escritura pasa por `/admin/*` (auth por cookie).
- **`"use server"` publica TODO el archivo, no solo lo que usas.** Cada función exportada de un archivo `"use server"` queda accesible como endpoint HTTP (POST + header `Next-Action`) desde **cualquier página que importe el archivo**, incluidas las públicas. `proxy.ts` no lo impide: su matcher `/admin/:path*` filtra rutas de navegación, y estos POST llegan por rutas públicas. Esto ya causó una vulnerabilidad real en este proyecto: 10 funciones de citas, sin sesión, alcanzables desde `/`, `/booking` y `/calendario`.
- **Por eso la capa de datos vive en `src/lib/`, no en `src/actions/`.** `src/lib/appointments-data.ts` y `src/lib/clients-data.ts` son funciones normales de servidor, sin `"use server"` — no existen como endpoint. **No les agregues esa directiva.** Solo se llaman desde Server Components.
- **Lo único con `"use server"`** es `src/actions/{admin,clients,auth}.ts`, que es lo que de verdad invocan los componentes de navegador. Toda escritura empieza con `requireAdmin()` (fuera del `try`, para que la denegación no se enmascare como error de guardado) y valida sus entradas con los esquemas de `src/lib/schemas.ts`. Si agregas una acción que escribe, va ahí y sigue ese patrón.
- **Verifica la superficie tras tocar imports o `"use server"`**: `npm run build` y luego revisar `.next/server/server-reference-manifest.json` — ninguna acción debe listar un worker fuera de `app/admin/*`.
- **Validación en runtime**: los tipos de TypeScript se borran al compilar y no protegen nada. La validación real son los esquemas Zod de `src/lib/schemas.ts`. Importa que `timeSlot` se valide contra `BUSINESS_TIME_SLOTS`: un valor libre vuelve `NaN` en `timeToMinutes()` y **desactiva la detección de citas que chocan**.
- **Login con límite de intentos** (`src/lib/rate-limit.ts`): 5 por IP cada 15 min, contador en memoria del proceso. En Vercel cada instancia tiene el suyo, así que frena fuerza bruta desde una máquina, no un ataque distribuido.
- **Estados de cita** (strings en español en la BD): `PENDIENTE` → `CONFIRMADA` → `COMPLETADA`; cualquiera puede pasar a `CANCELADA`; canceladas/completadas se pueden reabrir a `PENDIENTE`.
- **`updateAppointment` excluye la propia cita** al buscar solapamientos de horario — no lo "simplifiques".
- Los tipos reales vienen de `@prisma/client` (regenerados por `postinstall`). `src/types/` está vacío/obsoleto.
- `src/lib/time.ts`: horarios de atención cada 30 min de 05:00 a 18:00 (`BUSINESS_TIME_SLOTS`), compartido por booking público y formulario admin.

## Imágenes

- Fuentes originales en `images/` (raíz, gitignored). Copiar a `public/images/` para servirlas como `/images/<file>`.
- Hero: `<Image unoptimized>` (preserva calidad JPEG); galería: `quality={85}`. `next.config.ts` solo permite qualities `[75, 85]`.
- Galería: sin celdas `col-span-2` (recortan fotos de retrato) — detalle visual deliberado, ver `CLAUDE.md`.
