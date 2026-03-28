# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── riviera-cancun/     # AUSTRAL Cancún Premium website (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## AUSTRAL Cancún Premium Website (`artifacts/riviera-cancun`)

A luxury tourism landing page for AUSTRAL Cancún Premium — a premium tour operator in Cancún & Riviera Maya, Mexico. Argentine-owned (subtle nod in the footer).

### Features
- **Fully bilingual (ES/EN)** — React Context i18n, default EN, localStorage preference persistence, extensible for IT/FR
- **Hero carousel** — 6 Unsplash images rotating every 10s with 1.5s crossfade transition
- **Ship wheel (timón) SVG logo** — custom inline SVG, reusable `<Logo />` component with size/color props
- **Slowly rotating ship wheel watermark** in the hero background (60s CSS animation, 8% opacity)
- **6 experience cards** with real Unsplash images, category filter tabs, and detail modals
- **Inquiry flow** — ContactChannelSelector in modals: WhatsApp, Email, Facebook. Leads saved to localStorage.
- **Image error fallback** — `onError` handler shows gradient + emoji if Unsplash fails
- **Scroll-to-top button** — appears after 400px scroll, themed with wave/arrow SVG, gold color
- **WhatsApp floating button** — always visible, links to wa.me/529981234567
- **Scroll-triggered fade-in animations** via Framer Motion
- **Mobile-first responsive** — hamburger nav, single-column cards on mobile
- **SEO** — meta title/description/OG tags in index.html

### Admin Panel (`/admin`)
- **Route**: `/admin` — shows login screen unless authenticated
- **Authentication**: password via `VITE_ADMIN_PIN` env secret (default: `austral2025`); session in `sessionStorage`
- **AdminTopBar**: gold banner at top while in admin mode, with logout button
- **Experience editing**: pencil icon on card hover → modal to edit title (EN+ES), description (EN+ES), image URL, visible toggle
- **Persistence**: admin edits PATCH `/api/experiences/:id` with `x-admin-token` header → persisted in PostgreSQL
- **Server auth**: API validates `x-admin-token` against `ADMIN_PIN` env var (falls back to `VITE_ADMIN_PIN` then `austral2025`)
- **Visibility control**: hidden experiences show grayed/ghosted only to admin; public visitors never see them

### Admin Key Files
- `src/contexts/AdminContext.tsx` — auth state, login/logout, sessionStorage session
- `src/lib/adminStorage.ts` — localStorage helpers for per-experience overrides
- `src/components/admin/AdminLogin.tsx` — styled login screen
- `src/components/admin/AdminTopBar.tsx` — gold admin indicator bar
- `src/components/admin/ExperienceEditorModal.tsx` — edit modal (title EN/ES, desc EN/ES, image, visible)
- `src/pages/Admin.tsx` — route handler (shows AdminLogin or Home with admin overlays)

### i18n Architecture
- `src/contexts/i18n.tsx` exports: `SUPPORTED_LANGUAGES`, `DEFAULT_LANGUAGE` ('en'), `FALLBACK_LANGUAGE` ('en'), `getTranslation(lang)`
- Adding a new language: add to `SUPPORTED_LANGUAGES` array + add full translation object in `translations`
- Experience item keys: `yacht`, `atv`, `bungee`, `chichenitza`, `transfers`, `rainday` (semantic, no longer fragile `id1..id6`)
- No browser auto-detection: defaults to EN, respects saved user preference

### Key Files
- `src/contexts/i18n.tsx` — Complete ES/EN translation system with React Context
- `src/data/experiences.ts` — Static seed types (price, categories, emojis — supplemented by API data)
- `src/lib/leads.ts` — Lead capture (localStorage) + CONTACT_CONFIG for WhatsApp/email/Facebook
- `src/components/Logo.tsx` — Reusable ship wheel SVG component
- `src/components/Hero.tsx` — Carousel hero with watermark
- `src/components/Experiences.tsx` — Fetches from API via `useListExperiences()`, filterable grid with modal + admin overlay
- `src/components/admin/ExperienceEditorModal.tsx` — PATCHes `/api/experiences/:id` with admin token
- `src/components/WhatsAppButton.tsx` — Floating WhatsApp CTA
- `src/components/ScrollToTopButton.tsx` — Scroll-to-top with wave icon

### Data Architecture (Backend)
- **Schema**: `lib/db/src/schema/experiences.ts` — Drizzle `experiences` table with JSONB columns for `title`, `desc`, `includes` (multi-language, no migration needed to add new languages)
- **API**: `GET /api/experiences` (public, ordered by `sort_order`) and `PATCH /api/experiences/:id` (admin auth via `x-admin-token` header)
- **Seed**: `artifacts/api-server/src/seed.ts` — 6 experiences with EN+ES translations; run with `npx tsx artifacts/api-server/src/seed.ts`
- **Vite proxy**: `/api` → `http://localhost:8080` in development via `server.proxy` in `vite.config.ts`
- **Codegen**: `pnpm --filter @workspace/api-spec run codegen` → regenerates React Query hooks in `lib/api-client-react/src/generated/api.ts`

### Color Palette
| Name       | Hex       | Usage                                  |
|------------|-----------|----------------------------------------|
| Gold       | #C9A84C   | CTAs, accents, logo, scroll-top btn   |
| Deep Blue  | #0A1628   | Navbar, footer, dark backgrounds       |
| Ocean      | #0E4D64   | Gradients, secondary backgrounds       |
| Sand       | #F5ECD7   | Light section backgrounds              |
| White      | #FAFAF7   | Main background                        |
| Coral      | #E07A5F   | Extreme tags, secondary accents        |

### Typography
- **Display / Headings**: Playfair Display (serif, italic for gold emphasis)
- **Body / UI**: DM Sans (sans-serif)

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/`.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval codegen config.

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client.
