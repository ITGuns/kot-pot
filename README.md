# Kot Pot I — website, reservations & menu CMS

Production-grade restaurant platform for **Kot Pot I** (400 W Nolana Ave Ste V, McAllen, TX 78504 · (956) 843-0065): a cinematic public site, a real table-reservation system with server-side availability, and a staff control panel for the menu, all-you-can-eat pricing, photos, hours and bookings.

Every fact on the site — name, tagline, description, rating, price range, service types, address, phone, hours, all-you-can-eat prices, all 34 menu items with Korean names and prices, and the four photos — comes from `kot-pot-i-mcallen.md` (the previous website). Nothing is invented; anything the source did not state (reservation rules, social links, email, hero headline) is admin-configurable and seeded with neutral defaults.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React 19, Server Actions), TypeScript |
| Styling | Tailwind CSS v4 · Instrument Serif (display) / Manrope (body) / Bebas Neue (labels) / Noto Sans KR (Korean) via `next/font` |
| Motion | `motion` (Framer Motion 12): hero parallax + embers + steam, split-text reveals, drag carousel, broth selector, sauce builder, drag-and-drop admin ordering |
| Database | Postgres via Drizzle ORM (`pg` driver). Local dev uses a bundled Postgres cluster; production works with Supabase's pooler. Admin uploads are stored in a `bytea` table so deployments need no disk or bucket. |
| Auth | Signed HttpOnly JWT session cookie (`jose`) with a per-user token version (sign-out and password changes revoke every earlier token), scrypt password hashes, middleware-protected `/admin`, server-side `requireAdmin()` on every mutation |
| Validation | Zod on every server action; typed field errors returned to forms; rate limiting on login and booking |
| Headers | Content-Security-Policy, Permissions-Policy, HSTS (Vercel), X-Frame-Options, nosniff; `X-Powered-By` disabled |

## Quick start

```bash
npm install
cp .env.example .env.local        # DATABASE_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:local init             # starts a local Postgres on :5433 and creates the `kotpot` database
npm run db:push                   # creates the schema
npm run db:seed                   # imports the full menu, pricing, hours, photos + admin user
npm run dev                       # http://localhost:3000  ·  admin at /admin
```

`npm run db:local start|stop|status|psql` manages the local cluster (data lives in `data/pg`, git-ignored). `npm run db:reseed` wipes and re-seeds content tables without deleting reservations; `npm run db:reset` also clears reservations and date overrides. `npm run assets:fetch` re-downloads the source photos into `public/images` if they are missing. `npm run db:sync-media` adds bundled photos the database doesn't have yet, such as the 30 Google Maps photos in `public/images/google`, without touching other content. Add `-- --reorder` to reset their gallery order.

## Deployment

Hosted on Vercel (`vercel.json` pins functions to `hnd1`, next to the Supabase `ap-northeast-1` database). Required env vars on Vercel: `DATABASE_URL` (Supabase **transaction pooler**, port 6543), `SESSION_SECRET`, optionally `NEXT_PUBLIC_SITE_URL` (falls back to `VERCEL_PROJECT_PRODUCTION_URL`). `DIRECT_URL` (session pooler, port 5432) is only needed locally for `drizzle-kit push` and the seed. The direct `db.*.supabase.co` host is IPv6-only, which Vercel cannot reach, so always use the pooler. SSL is enabled automatically for non-localhost hosts. Pushes to `main` on GitHub deploy automatically once the repo is connected to the Vercel project.

## What's inside

**Public**
- `/` — full-bleed hero (source photo, parallax, steam + ember particles), ticker, editorial intro with rating / price range / service types, interactive **all-you-can-eat pricing** (day-group tabs, lunch/dinner toggle, "right now" indicator, holiday-aware), **Choose your experience** (BBQ meat cards ↔ hot-pot broth selector), signature-dish drag carousel, **build-your-own sauce** bowl, cocktails + beer & sake, gallery bento, visit section with map.
- `/menu` — data-driven explorer: category tabs, instant search across English + Korean names and descriptions, dietary / signature / available-now filters, thumbnail-left rows (typographic tiles when an item has no photo), detail modal with modifiers, deep links (`?category=`, `?item=`).
- `/korean-bbq`, `/hot-pot` — dedicated experience pages (hero, meat grid / broth selector, pricing, sauce bar, CTA band).
- `/gallery` — horizontal strip, filterable masonry, keyboard + swipe lightbox. `/visit` — address, phone, hours, service types, map.
- `/book` — 5-step wizard (date → party size → time → details → review) → stored reservation → confirmation with `KP-xxxxx` code, calendar links and a private manage link (`/book/[code]?t=…`) for viewing / cancelling.

**Admin** (`/admin`, login required) — Dashboard (today's reservations, expected guests, pending, hours, current all-you-can-eat session, featured items, quick actions) · Reservations (list / calendar / day views, detail page, confirm / complete / no-show / cancel / edit / delete, staff-created bookings) · Menu items (drag ordering, editor with Korean name, price, photo from the media library, dietary tags, availability rules, modifiers, featured / hide / archive / duplicate / delete) · Categories · Modifiers · All-you-can-eat pricing · Media library (upload with type / size / dimension validation, alt text, caption, tag, focal point, featured, gallery visibility, replace, reorder, delete) · Hours (restaurant hours, weekly reservation windows, holidays / closures / special hours) · Settings (restaurant info, rating, service types, hero copy, SEO, links, booking rules, password).

## Availability & booking engine

`src/lib/booking.ts` computes reservation slots from the weekly windows + date overrides + booking settings (slot interval, turn time, max bookings / covers per overlapping window, lead time, party limits, days in advance) and re-checks availability inside a per-date advisory-locked transaction, so two guests can't take the last seat. Bookings are idempotent per submission and de-duplicated per guest/date/time.

`src/lib/availability.ts` resolves restaurant hours and each item's own rule (`always | days | schedule | seasonal | limited`) into *Available now* / badges. `src/lib/ayce.ts` picks today's all-you-can-eat group and the running session, treating dates flagged as holidays like weekends.

## Testing & QA

```bash
npm run test:unit     # Vitest: booking engine, availability, all-you-can-eat logic, validation, image headers, menu search
npm run test:e2e      # Playwright: every customer + admin flow (desktop + Pixel 7) with axe accessibility scans and a data-integrity audit against the source
node scripts/qa-screens.mjs [--admin] [--widths 320,768,1920]   # full-page screenshots into data/qa-screens
```

The E2E suite reuses the dev server on :3000, warms every route, logs into the admin, then exercises booking (create → manage → cancel, large parties, validation, blackout dates, capacity limits), the menu explorer, gallery, visit/BBQ/hot-pot pages, 404/sitemap/robots/upload/auth guards, mobile layout, and the admin dashboard, reservations, menu CMS, all-you-can-eat pricing, media uploads, hours, overrides and settings. Records it creates are tagged `QA` / `@qa.kotpot.test` and removed afterwards; settings it changes are reverted. `tests/e2e/public/data-integrity.spec.ts` compares the database against `kot-pot-i-mcallen.md` item by item.

## Source-of-truth notes

- Hours (Sun–Thu 11 AM–10 PM, Fri–Sat 11 AM–11 PM) and all-you-can-eat pricing are stored in the database and editable under Admin → Hours / Menu → All-you-can-eat; nothing is hard-coded in components.
- The source has no reservation rules, so the defaults (30-minute slots, 90-minute turns, first seating at opening, last seating an hour before close, parties of 1–8 online, 7+ held as pending) are derived from the hours and fully editable.
- Menu items ship without photos (the source only had four general photos); items render as typographic tiles until staff upload a photo. No stock photography is used.
- The hero headline is campaign copy editable under Settings; the official tagline "Authentic Korean · Korean BBQ · Hot Pot" is always shown.
