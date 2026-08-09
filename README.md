# Arcanova

Arcanova is a premium travel and experiences web app with a public catalog, quote/contact flow, admin tools, and a small Postgres-backed API.

The codebase is a pnpm monorepo:

- `artifacts/riviera-cancun`: current frontend app. This folder still carries the old project name and should be renamed after the brand migration.
- `artifacts/api-server`: Express API.
- `lib/db`: Drizzle schema and database access.
- `lib/api-spec`, `lib/api-zod`, `lib/api-client-react`: API contract and generated clients.

## Current Local URL

```text
http://localhost:5173
```

## Verification

```bash
npm.cmd run typecheck
```

```bash
$env:CI='true'; $env:PORT='5174'; $env:BASE_PATH='/'; npm.cmd run build
```

## Project Docs

- [Project Rules](docs/project-rules.markdown)
- [Brand Guide](docs/brand-arcanova.markdown)
- [Supabase Database](docs/supabase-database.markdown)
- [Deploy Checklist](docs/deploy-checklist.markdown)
