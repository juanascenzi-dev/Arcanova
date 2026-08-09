# Arcanova Deploy Setup

## MCP

The project includes `.mcp.json` with two servers:

- `supabase`: remote Supabase MCP over OAuth.
- `obsidian`: local Obsidian MCP through `obsidian-mcp-server@3.2.9`.

To finish Obsidian setup:

1. Install Obsidian Desktop.
2. In Obsidian, enable Community Plugins.
3. Install and enable the `Local REST API` plugin.
4. Enable the non-encrypted HTTP server on `127.0.0.1:27123`.
5. Generate an API key and expose it as `OBSIDIAN_API_KEY`.
6. Restart the MCP client so it reloads `.mcp.json`.

To finish Supabase MCP setup, authenticate the `supabase` MCP server from your MCP client. The server URL is:

```text
https://mcp.supabase.com/mcp?features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching
```

## Supabase

Create a Supabase project and copy the Postgres connection string into `DATABASE_URL`.

The database schema lives in:

```text
lib/db/src/schema
```

After `DATABASE_URL` is set, push the Drizzle schema:

```bash
pnpm --filter @workspace/db run push
```

Production notes:

- Enable RLS on any table exposed through Supabase Data API.
- New public tables may not be exposed to Data API automatically; grant access deliberately only when needed.
- Never expose Supabase service role keys in frontend code.

## Vercel

Deploy the frontend from:

```text
artifacts/riviera-cancun
```

The frontend already has `artifacts/riviera-cancun/vercel.json`.

Set this Vercel environment variable:

```text
VITE_API_URL=https://your-api-domain.example.com
```

## Backend

The Express API is currently configured as a separate Node service. It can run on Railway, Render, or another Node host.

Required production variables:

```text
DATABASE_URL
PORT
NODE_ENV=production
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
JWT_SECRET
ADMIN_PASSWORD
```

After the backend is online, update `VITE_API_URL` in Vercel and redeploy the frontend.

## GitHub

Recommended repository settings:

- Name: `arcanova`
- Visibility: private until production secrets and access rules are reviewed.
- Default branch: `main`

If GitHub CLI is installed and authenticated:

```bash
git branch -M main
gh repo create arcanova --private --source . --remote origin --push
```

If using the GitHub web UI, create an empty private repository and then run:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USER/arcanova.git
git push -u origin main
```
