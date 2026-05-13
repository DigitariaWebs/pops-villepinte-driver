# POP'S Villepinte — Server

Backend services for the Pop's Villepinte mobile app.

## Layout

```
server/
  api/          NestJS + Fastify backend (REST API consumed by the mobile app and the admin dashboard)
  admin/        Next.js admin dashboard (kitchen queue + menu CRUD) — Phase 4
  supabase/     Database migrations + Supabase CLI config
```

## Prerequisites

- Node.js 20+
- A Supabase project (URL + anon + service role + JWT secret)
- (Optional) [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) to apply migrations

## First-run setup

1. **Apply the schema to your Supabase project**

   Either via the dashboard SQL editor (paste `supabase/migrations/0001_init.sql`) or via the CLI:

   ```sh
   cd server
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

2. **Configure the API**

   ```sh
   cd server/api
   cp .env.example .env
   # fill SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET
   npm install
   npm run start:dev
   ```

   Health check: `GET http://localhost:3000/api/v1/health`.

3. **(Phase 1) Seed the menu**

   ```sh
   cd server/api
   npm run seed:menu
   ```

   Imports categories, products, supplements from the mobile app's `src/data/menu.ts`.

## Phased rollout

See [`../`'s plan file](../) for the full plan. Current phase: **Phase 0 — skeleton**.
