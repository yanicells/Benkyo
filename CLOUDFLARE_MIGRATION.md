# Cloudflare Workers Migration Notes (Benkyo)

This project is now configured to deploy with `@opennextjs/cloudflare`.

## What was changed

- Added OpenNext + Wrangler dependencies
- Switched build to Webpack (`next build --webpack`)
- Added Cloudflare scripts:
  - `pnpm preview`
  - `pnpm deploy`
  - `pnpm cf-typegen`
- Added `open-next.config.ts`
- Added `wrangler.jsonc`
- Added `cloudflare-env.d.ts` and included it in `tsconfig.json`
- Added `public/_headers` for immutable `_next/static` caching
- Added `.open-next`, `.dev.vars`, `.wrangler` to `.gitignore`
- Added `BETTER_AUTH_URL` to `example.env`

## Turso-specific notes

No DB client migration is needed. Current Drizzle + Turso setup in `lib/db/index.ts` works on Workers with:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

## Secrets to set in Cloudflare

Set secrets with Wrangler (recommended):

```bash
npx wrangler secret put TURSO_DATABASE_URL
npx wrangler secret put TURSO_AUTH_TOKEN
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put BETTER_AUTH_URL
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

Use your production URL for `BETTER_AUTH_URL` (for example `https://<your-worker-domain>`).

## Local Workers preview env

Create `.dev.vars` (already gitignored):

```bash
NEXTJS_ENV=development
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## OAuth callback update

This app uses Google provider (not GitHub), so set callback URL to:

```text
https://<your-domain>/api/auth/callback/google
```

## Commands

```bash
pnpm build
pnpm preview
pnpm deploy
```

## Optional type regeneration

If you update Wrangler bindings, regenerate env typings:

```bash
pnpm cf-typegen
```

## Important

- `wrangler.jsonc` currently uses worker name `benkyo`. If you rename it, update both:
  - `name`
  - `services[0].service`
- If bundle size exceeds free plan limit, use Workers Paid plan.
