# YEMEMUNNAI — Hyperlocal Campus Food Discovery

React 19 + Vite + Tailwind 4 frontend with a **Supabase backend** (Postgres, Auth, Realtime, Storage).

## Backend setup (5 minutes)

1. Create a Supabase project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open **SQL Editor → New query**, paste the whole of [`supabase/schema.sql`](supabase/schema.sql), and **Run**.
   This creates tables, RLS policies, counter triggers, realtime publications, the `food-photos` storage bucket,
   and sample shops and menu items. Vendor accounts are provisioned separately.
3. Copy **Project Settings → API → Project URL** and **anon public** key.
4. `cp .env.example .env.local`, paste the two values, then `npm run dev`.

Without credentials the app shows a **preview menu** with local data; ordering and business login require the backend.
The business portal requires a configured backend and an authenticated cafe account.

## Business portal login

Apply the `vendor_pin_login` migration, provision accounts using `supabase/setup_vendor_auth.mjs`,
and deploy `vendor-pin-login`. See [server setup and verification](supabase/functions/vendor-pin-login/README.md).
The outlet picker and four-digit keypad remain; PINs are checked on the server, with five failed
attempts locking the cafe for 15 minutes. Private PINs are stored locally in `supabase/vendor-pins.local`,
which is ignored by git and excluded from deployment.

Run `node supabase/test_vendor_pin.mjs` for the handler checks. Administrative scripts require
server environment variables; never put an administrative key or a PIN in a `VITE_` variable.

## Architecture

Consumer tokens, component contracts and verification limits are documented in the [consumer system blueprint](docs/consumer-design-system.md).
Run `node scripts/check_consumer_colors.cjs` for contrast checks. Run `scripts/check_consumer_ui.cjs` with
`PLAYWRIGHT_PACKAGE` pointing to an available Playwright installation for browser checks with intercepted orders.

```
supabase/schema.sql      Tables (vendors, food_items, reactions, reviews, orders),
                         RLS policies, counter triggers, storage bucket, seed data
src/lib/supabase.ts      Client singleton (null → demo mode)
src/lib/types.ts         DB row shapes + camelCase UI types
src/lib/api.ts           All backend calls (typed data-access layer)
src/lib/hooks.ts         useFoodItems, useShops, useReactions, useVendorSession,
                         useVendorOrders (realtime), useVendorStats
src/components/*         Screens, all wired through the hooks above
```

Key behaviors:

- **Consumer** — no account: likes/dislikes/reviews/orders are keyed by an anonymous `anon:<uuid>` in localStorage; orders INSERT-only via RLS.
- **Vendor** — signs in (Supabase Auth); RLS scopes orders/items strictly to their own shop; order feed updates in realtime; photo uploads go to Storage under `<user-id>/`.
- **Counters** (`likes_count` etc.) are maintained by `SECURITY DEFINER` triggers, so the grid never needs joins.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
