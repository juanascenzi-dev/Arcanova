# Deploy Checklist

## GitHub

1. Create an empty private GitHub repository named `arcanova`.
2. Share the repository URL in Codex.
3. Codex will add it as `origin`, push the current branch, and prepare the repo for Vercel.

Recommended URL shape:

```text
https://github.com/juanascenzi-dev/arcanova
```

## Supabase

1. Use the new Supabase project named `arcanova`.
2. Use the same Supabase account if appropriate, but keep it separate from unrelated projects.
3. Copy the new project `DATABASE_URL`.
4. Add it to the API host environment variables.
5. Push the Drizzle schema.
6. Seed initial experiences if needed.

## Vercel

1. Create a new Vercel project named `arcanova`.
2. Connect it to the GitHub repo.
3. Set the root/build settings for the frontend app.
4. Set `VITE_API_URL` to the production API URL.
5. Deploy.

## API Host

The current API is an Express Node server. It needs a Node runtime host with:

```text
DATABASE_URL
PORT
NODE_ENV=production
ALLOWED_ORIGINS=https://your-arcanova-vercel-domain.vercel.app
JWT_SECRET
ADMIN_PASSWORD
```

## Pre-Deploy Verification

Run:

```bash
npm.cmd run typecheck
```

Run:

```bash
$env:CI='true'; $env:PORT='5174'; $env:BASE_PATH='/'; npm.cmd run build
```

Then smoke test:

- Home page loads.
- Brand says Arcanova.
- Experience catalog renders.
- Modal opens.
- Quote/cart flow works.
- Contact buttons generate correct messages.
- Admin login works.
- Leads are written to the Arcanova database.
