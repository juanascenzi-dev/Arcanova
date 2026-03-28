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
│   ├── api-client-react/   # Generated React Query hooks + customFetch with JWT injection
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
- **Fully bilingual (ES/EN)** — React Context i18n, default EN, localStorage preference persistence
- **Hero carousel** — 6 Unsplash images (1200px, q=75) rotating every 10s with lazy loading (only loads current + next slide)
- **Ship wheel (timón) SVG logo** — custom inline SVG, reusable `<Logo />` component with size/color props
- **6 experience cards** with real Unsplash images, category filter tabs, and detail modals
- **Inquiry flow** — ContactChannelSelector in modals: WhatsApp, Email, Facebook. Leads saved to PostgreSQL.
- **Image error fallback** — `onError` handler shows gradient + emoji if Unsplash fails
- **Scroll-to-top button** — appears after 400px scroll, themed with wave/arrow SVG, gold color
- **WhatsApp floating button** — always visible, links to wa.me/529981234567
- **Scroll-triggered fade-in animations** via Framer Motion
- **Mobile-first responsive** — hamburger nav, single-column cards on mobile
- **SEO** — meta title/description/OG tags in index.html

### Admin Panel (`/admin`)
- **Route**: `/admin` — shows login screen unless authenticated
- **Authentication**: POST `/api/admin/login` with PIN → returns JWT (8h expiry). JWT stored in sessionStorage (never the PIN itself)
- **JWT flow**: AdminContext fetches JWT → customFetch injects `Authorization: Bearer <token>` on all API calls automatically
- **Experience editing**: pencil icon on card hover → modal to edit title (EN+ES), description (EN+ES), image URL, visible toggle
- **Persistence**: admin edits PATCH `/api/experiences/:id` with JWT → persisted in PostgreSQL
- **Server auth**: `requireAdmin` middleware verifies JWT signature (JWT_SECRET env var)
- **Visibility control**: hidden experiences show grayed/ghosted only to admin; public visitors never see them

### Admin Key Files
- `src/contexts/AdminContext.tsx` — auth state, async login (POST /api/admin/login), JWT management
- `src/components/admin/AdminLogin.tsx` — styled login screen (async, shows loading state)
- `src/components/admin/ExperienceEditorModal.tsx` — edit modal (title EN/ES, desc EN/ES, image, visible)
- `src/components/admin/LeadsPanel.tsx` — leads table with filter and status modal
- `src/pages/Admin.tsx` — route handler (shows AdminLogin or AdminDashboard)
- `artifacts/api-server/src/middlewares/auth.ts` — JWT sign/verify, requireAdmin middleware
- `artifacts/api-server/src/routes/auth.ts` — POST /api/admin/login endpoint

### Security Architecture (Post-Audit)
- **JWT auth**: HS256 tokens signed with JWT_SECRET (8h TTL). PIN never leaves the server.
- **Rate limiting**: 200 req/15min general · 10 req/15min on login · 30 req/15min on lead creation
- **Security headers**: Helmet.js (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
- **CORS**: Restricted to ALLOWED_ORIGINS env var in production (open in development)
- **Body size limit**: 50kb max to prevent payload attacks
- **DB indexes**: leads table has indexes on status, channel, created_at, experience_id
- **Drizzle ORM**: parameterized queries, no raw SQL, no injection risk

### Required env vars for production
- `ADMIN_PIN` — admin panel password (never use default in prod)
- `JWT_SECRET` — secret for signing JWTs (use a long random string)
- `ALLOWED_ORIGINS` — comma-separated list of allowed frontend origins (e.g. `https://australcancun.com`)
- `DATABASE_URL` — PostgreSQL connection string
- `PORT` — server port

### i18n Architecture
- `src/contexts/i18n.tsx` exports: `SUPPORTED_LANGUAGES`, `DEFAULT_LANGUAGE` ('en'), `FALLBACK_LANGUAGE` ('en'), `getTranslation(lang)`
- Adding a new language: add to `SUPPORTED_LANGUAGES` array + add full translation object in `translations`
- No browser auto-detection: defaults to EN, respects saved user preference

### Key Files
- `src/contexts/i18n.tsx` — Complete ES/EN translation system with React Context
- `src/data/experiences.ts` — Static seed types (price, categories, emojis — supplemented by API data)
- `src/lib/leads.ts` — URL builders for WhatsApp/email/Facebook + CONTACT_CONFIG
- `src/components/Logo.tsx` — Reusable ship wheel SVG component
- `src/components/Hero.tsx` — Carousel hero with watermark (lazy-loads slides)
- `src/components/Experiences.tsx` — Fetches from API via useListExperiences(), filterable grid with modal + admin overlay
- `src/components/admin/ExperienceEditorModal.tsx` — PATCHes /api/experiences/:id with JWT
- `src/components/WhatsAppButton.tsx` — Floating WhatsApp CTA
- `src/components/ScrollToTopButton.tsx` — Scroll-to-top with wave icon

### Data Architecture (Backend)
- **Schema**: `lib/db/src/schema/experiences.ts` — Drizzle `experiences` table with JSONB columns for `title`, `desc`, `includes` (multi-language)
- **Leads schema**: `lib/db/src/schema/leads.ts` — UUID PK, channel enum, status enum, lang enum; with 4 DB indexes
- **API**: GET /api/experiences (public), PATCH /api/experiences/:id (JWT required), POST /api/leads (public), GET/PATCH /api/leads (JWT required)
- **Seed**: `artifacts/api-server/src/seed.ts` — 6 experiences with EN+ES translations; run with `npx tsx artifacts/api-server/src/seed.ts`
- **DB Migration note**: `drizzle-kit push` hangs on interactive prompt; use `psql $DATABASE_URL` for DDL changes directly
- **Vite proxy**: `/api` → `http://localhost:8080` in development via `server.proxy` in `vite.config.ts`
- **Codegen**: `pnpm --filter @workspace/api-spec run codegen` → regenerates React Query hooks

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

Express 5 API server. Routes live in `src/routes/`. Security: Helmet + CORS + rate limiting via express-rate-limit.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval codegen config.

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client. `custom-fetch.ts` automatically injects the admin JWT from sessionStorage into all requests.
