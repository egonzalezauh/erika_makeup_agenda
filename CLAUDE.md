# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # start dev server on :3000
npm run build        # production build
npx tsc --noEmit     # type-check without emitting

npx prisma migrate dev --name <name>   # create and apply a migration
npx prisma db seed                      # seed services (runs prisma/seed.ts via tsx)
npx prisma studio                       # GUI to browse the database
```

## Stack

- **Next.js 16.3.3** — App Router, `src/` directory, React 19
- **Tailwind CSS v4** — CSS-first; all theme tokens live in `src/app/globals.css` under `@theme {}`. There is **no** `tailwind.config.ts`.
- **Prisma v5.22.0 + PostgreSQL (Supabase)** — `schema.prisma` ya apunta a `postgresql` con `directUrl`; no hay SQLite local. Tanto dev como prod usan `DATABASE_URL` / `DIRECT_URL`.
- **Fonts** — Cormorant Garamond (serif, `font-serif`) + DM Sans (sans-serif, `font-sans`), loaded via `next/font/google` in `layout.tsx`, exposed as CSS variables `--font-cormorant` / `--font-dm-sans`.

## Architecture

### Data flow
La capa de acceso a datos es `src/lib/appointments-data.ts` y `src/lib/clients-data.ts`. Llaman al singleton de Prisma de `src/lib/prisma.ts` y hacen `revalidatePath("/calendario")` tras cada mutación.

**Viven en `src/lib/` y no en `src/actions/` por seguridad, no por gusto.** Un archivo con `"use server"` publica *todas* sus funciones exportadas como endpoints HTTP, alcanzables desde cualquier página que importe el archivo — incluidas las públicas, que `proxy.ts` no cubre. Como funciones normales, solo se pueden llamar desde el servidor. **No les pongas `"use server"`.**

Las páginas del panel (Server Components) las llaman directo. Los componentes de navegador escriben solo a través de `src/actions/admin.ts` y `src/actions/clients.ts`, que exigen `requireAdmin()` y validan sus entradas con Zod (`src/lib/schemas.ts`).

### Component split
- **Async Server Components** fetch data directly: `ServicesSection`, `src/app/booking/page.tsx`, `src/app/calendario/page.tsx`
- **`"use client"` components** handle interactivity: `BookingWizard`, `AvailabilityCalendar`
- `src/components/shared/CalendarGrid.tsx` is a shared month-view calendar grid used by both `BookingWizard` (date picker) and `AvailabilityCalendar` (public availability display)

### Routes
| Path | Description |
|---|---|
| `/` | Marketing home page (Hero → Services → Gallery → Ticker → Footer) |
| `/booking` | 2-step booking bridge (service → date/time), ends with a `wa.me` link pre-filled with the request — does not write to the DB |
| `/calendario` | Public availability calendar — shows busy/free slots only (no client PII), no login required |

### Panel de administración (Fase 3)

La dueña gestiona sus citas desde `/admin`, un panel mobile-first pensado para
usarse instalado como app en el celular. Es la única interfaz de gestión.

**Separación de zonas.** Un solo deploy sirve dos zonas:

- **Pública, solo lectura** — `/`, `/booking`, `/calendario`. No escriben en la
  BD (`/booking` termina en un enlace `wa.me`) y `/calendario` usa
  `getPublicAppointmentAvailability()`, que no trae nombre, email, teléfono ni
  notas del servidor. Este invariante no debe romperse.
- **Privada, lectura + escritura** — `/admin/*`, protegida por `src/proxy.ts`.

**Autenticación.** Una sola usuaria, así que no hay tabla de usuarios: una
contraseña en `ADMIN_PASSWORD` y una cookie httpOnly firmada con HMAC-SHA256
(`ADMIN_SESSION_SECRET`), 60 días de vigencia. `src/lib/auth.ts` usa Web Crypto,
no `node:crypto`, porque `proxy.ts` corre en el runtime Edge.

**`src/proxy.ts`** (en Next.js 16 el archivo `middleware.ts` se renombró a
`proxy.ts`) bloquea toda ruta `/admin/*` sin cookie válida y redirige a
`/admin/login?redirect=…`. Solo se aceptan destinos de redirección internos.

`AppointmentForm` sirve para crear y para editar: la diferencia es si recibe
`appointmentId`. `updateAppointment` excluye la propia cita al buscar
solapamientos — si no, guardar sin mover el horario chocaría consigo misma.

**`src/actions/admin.ts`** son envoltorios autenticados de `appointments.ts`.
Las Server Actions se invocan por POST desde el cliente sin pasar por el
enrutado de páginas, así que `requireAdmin()` es necesario **además** del
`proxy.ts` — el proxy no las ve. Cada acción valida además sus entradas con
los esquemas de `src/lib/schemas.ts`; los tipos de TypeScript desaparecen al
compilar y no validan nada en runtime.

`src/app/admin/(panel)/layout.tsx` repite la verificación de sesión a
propósito: `proxy.ts` es un único punto de fallo, y saltárselo ha sido una
vulnerabilidad real de Next.js más de una vez.

**PWA.** `src/app/manifest.ts` hace la app instalable (`start_url: "/admin"`,
`display: "standalone"`), con íconos en `public/icons/`. Es también la base
sobre la que se empaqueta el `.apk` de Android.

| Ruta | Descripción |
|---|---|
| `/admin` | Citas de hoy, con botones de estado grandes |
| `/admin/nueva` | Formulario para registrar una cita (nace `CONFIRMADA`) |
| `/admin/agenda` | Próximas citas agrupadas por día |
| `/admin/cita/[id]` | Editar y reprogramar (no toca el estado) |
| `/admin/login` | Contraseña única |

## Images

Static images live in `public/images/` and are served by Next.js as `/images/<file>`.

The originals are kept in `images/` at the project root (not served, source only). When adding new images, copy them from `images/` → `public/images/`.

### Hero (`HeroSection.tsx`)
- Image: `public/images/novia_mirando_arriba.jpeg`
- Uses `<Image unoptimized>` — bypasses Next.js WebP conversion to preserve original JPEG quality.
- Panel width: `w-[38%] lg:w-[40%]` (deliberately narrow to avoid upscaling blur).
- `objectPosition: "center 15%"` keeps the face centered.

### Gallery (`GallerySection.tsx`)
- Layout: 3-column grid, `auto-rows-[220px] md:auto-rows-[480px]`.
- 5 images; first cell is `row-span-2` (tall portrait for the novia shot).
- **No `col-span-2` cells** — wide landscape cells at 3.3:1 ratio make portrait photos look cut; avoid reintroducing them.
- All single cells use `objectPosition: "top"` so portrait photos show the face from crown down without cutting the chin.
- Gallery images use `quality={85}` (Next.js optimized); hero uses `unoptimized`.

| Cell | File | Notes |
|---|---|---|
| Novia · 2024 (tall) | `novia_velo_perfil.jpeg` | `objectPosition: "center 5%"` |
| Look social | `maquillaje_ahumado_rosa.jpeg` | `objectPosition: "top"` |
| Quinceañera | `maquillaje_novia_ojos_abiertos.jpeg` | `objectPosition: "top"` |
| Sesión fotográfica | `artista_aplicando_maquillaje.jpeg` | `objectPosition: "top"` |
| Editorial | `maquillaje_editorial_verde.jpeg` | `objectPosition: "top"` |

### Timezone invariant
Prisma SQLite serializes dates as `YYYY-MM-DDT00:00:00.000Z`. When displayed on a UTC-5 machine, `new Date()` shifts the date one day back. Fix: extract the date string and re-parse as local noon — `new Date(isoString.split("T")[0] + "T12:00:00")`. This pattern is used in `AvailabilityCalendar.tsx` (`toDateKey()`).

### Appointment status flow
Valid statuses (Spanish strings stored in DB): `"PENDIENTE"` → `"CONFIRMADA"` → `"COMPLETADA"`. Any status can transition to `"CANCELADA"`. Cancelled/completed appointments can be reopened to `"PENDIENTE"`.

### Stale types
`src/types/index.ts` contains an older interface that predates the Prisma models and is not used by the main application. Actual types come from `@prisma/client`.
