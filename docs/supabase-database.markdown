# Supabase Database

## Project Boundary

Arcanova needs a separate Supabase project named `arcanova`.

Current Arcanova project URL:

```text
https://cwdavijxvqzmdqqjejbf.supabase.co
```

Project ref:

```text
cwdavijxvqzmdqqjejbf
```

Do not connect this codebase to unrelated projects such as:

- `prode-prod`
- `prode-dev`

## Current Schema

The database schema is defined with Drizzle in:

```text
lib/db/src/schema
```

Tables:

- `experiences`
- `leads`

## Experiences

The `experiences` table stores the public catalog and admin-editable service data.

Important columns:

- `id`: semantic id such as `yacht` or `atv`.
- `slug`: public URL-friendly identifier.
- `sort_order`: display order.
- `visible`: whether the experience appears publicly.
- `tag_type`: visual/commercial tag.
- `category`: JSON array of categories.
- `image_url`: public image URL.
- `price`: base display price.
- `duration_hours`: display/filter duration value.
- `title`, `desc`, `includes`: i18n JSON fields.
- `booking_rules`: JSON pricing rules.
- `service_pricing`: JSON price breakdown.

## Leads

The `leads` table stores contact intent from users.

Important columns:

- `id`: UUID.
- `experience_id`, `experience_slug`, `experience_title_snapshot`.
- `channel`: `whatsapp`, `email`, or `facebook`.
- `lang`: `en` or `es`.
- `tentative_date`.
- `people`.
- `message_snapshot`.
- `source`.
- `status`: `new`, `contacted`, `closed`, or `discarded`.

## Initial Setup

After the Supabase project exists, set:

```text
DATABASE_URL
```

Then push the schema:

```bash
pnpm --filter @workspace/db run push
```

## Security Notes

- Do not expose service role keys in frontend code.
- Keep `DATABASE_URL` server-side only.
- Enable RLS if tables are exposed through Supabase Data API.
- Prefer API-server access for admin actions.
