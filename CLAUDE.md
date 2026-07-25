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

- **Next.js 16.2.9** — App Router, `src/` directory, React 19
- **Tailwind CSS v4** — CSS-first; all theme tokens live in `src/app/globals.css` under `@theme {}`. There is **no** `tailwind.config.ts`.
- **Prisma v5.22.0 + SQLite** — local dev uses `prisma/dev.db`. Production target is Supabase PostgreSQL (requires schema change from `sqlite` → `postgresql` and adding `directUrl`).
- **Fonts** — Cormorant Garamond (serif, `font-serif`) + DM Sans (sans-serif, `font-sans`), loaded via `next/font/google` in `layout.tsx`, exposed as CSS variables `--font-cormorant` / `--font-dm-sans`.

## Architecture

### Data flow
Server Actions in `src/actions/appointments.ts` are the only data-access layer. They call the Prisma singleton from `src/lib/prisma.ts` and call `revalidatePath("/calendario")` after mutations. There is **no authentication anywhere in the public app** — `createAppointment` and `updateAppointmentStatus` are not called by any page UI (the booking flow no longer writes to the DB); they're called exclusively by the Telegram bot webhook (`src/app/api/telegram/webhook/route.ts`), which is the only way appointments actually get created/changed. Bot access is gated by `TELEGRAM_ADMIN_CHAT_ID` (whitelist) and `TELEGRAM_WEBHOOK_SECRET` (request authenticity), not by the app's page routing.

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
| `/api/telegram/webhook` | POST-only Route Handler for the Telegram bot (see below) — not a page |

### Telegram bot (Fase 2)
The business owner manages appointments by chatting with a private Telegram bot (not client-facing). `src/app/api/telegram/webhook/route.ts` receives every message, checks the `X-Telegram-Bot-Api-Secret-Token` header against `TELEGRAM_WEBHOOK_SECRET`, ignores any chat ID that isn't `TELEGRAM_ADMIN_CHAT_ID`, parses the text via the pure parser in `src/lib/telegram/commands.ts`, dispatches to `appointments.ts`, and replies via `src/lib/telegram/client.ts` (`sendMessage`, plain text, no `parse_mode`). Fixed keyword grammar: `ayuda`, `servicios`, `citas hoy|mañana|YYYY-MM-DD`, `confirmar|cancelar|completar|reabrir <nombre>` (fuzzy match via `searchAppointmentsByClientName`, replies with a disambiguation list if 2+ matches instead of guessing), and a multi-line `agendar` block (`servicio:`/`fecha:`/`hora:`/`nombre:`/`telefono:`/optional `email:`/`notas:`) — appointments created this way default to `CONFIRMADA` status (not `PENDIENTE`), since the owner is registering something already agreed with the client. "Hoy"/"mañana" are resolved in `src/lib/dates.ts` (`guayaquilDateString()`) pinned to `America/Guayaquil`, independent of the server's own timezone (Vercel runs UTC).

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
