# Project Rules

## Product Identity

- The product name is `Arcanova`.
- Old public names such as `AUSTRAL`, `Austral`, `Riviera Cancún`, `Riviera Cancun`, and `Cancún Premium` should be migrated to `Arcanova`.
- Historical dev logs may keep old names for audit context, but user-facing UI, metadata, emails, messages, and deploy settings should use `Arcanova`.

## Technical Rules

- Keep secrets out of git. Use `.env`, `.env.local`, Vercel environment variables, and Supabase secrets.
- Commit lockfiles when dependencies change.
- Prefer small, typed changes over broad rewrites.
- Keep generated files generated. If API types change, update the OpenAPI spec and regenerate clients instead of hand-editing generated outputs.
- Before deployment, run `npm.cmd run typecheck` and a production build.

## Naming Rules

- GitHub repository: `arcanova`.
- Supabase project: `arcanova`.
- Vercel project: `arcanova`.
- Future frontend package/folder target: `artifacts/arcanova`.
- Current old frontend package/folder: `artifacts/riviera-cancun`.

## Data Rules

- Arcanova must have its own Supabase project and database.
- Do not reuse or modify unrelated Supabase projects such as `prode-prod` or `prode-dev`.
- The first Arcanova database is intentionally small: experiences and leads.
- Admin/auth secrets must stay server-side only.

## Deployment Rules

- Frontend deploys to Vercel.
- API deploys as a Node service unless/until migrated to Vercel Functions.
- `VITE_API_URL` must point to the production API URL.
- `ALLOWED_ORIGINS` on the API must include the Vercel production domain.
