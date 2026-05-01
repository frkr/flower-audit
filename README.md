# Flower

Audit system built on Cloudflare Workers (D1 + R2) with React Router v7.

> Sources of truth:
> - Agent instructions: [`AGENTS.md`](./AGENTS.md)
> - Database schema: [`schema.sql`](./schema.sql)

Translations: [Português (Brasil)](./README.pt-br.md) · [Español](./README.es.md)

## Main features

- **Landing (`/landing`)** — public hero page shown after logout, listing the system features and providing an **Entrar** button that starts the login flow.
- **Go** — Google-style centered search bar that animates to the top after a query, then searches `flux` (10 results) and `process` (10 results).
- **Flows** — simple CRUD with search and pagination of 10 items per page. Each flow has a name, description, and an editable list of steps.
- **Processes** — simple CRUD where each process belongs to a flow. The `Content` field of each step is a Lexical-based WYSIWYG editor with a maximize-to-fullscreen button.
- **Setup** — system-wide key/value parameters persisted in the database.
- **Right sidebar**:
  - Calendar (top): a small button opens a month view that highlights days where flows were started, using three intensity levels (1, 2–4, 5+) based on `process.created_at`.
  - AI chat (middle): minimal chat panel intended to be wired to the [assistant-ui](https://github.com/assistant-ui/assistant-ui) React library.
  - Profile (bottom, floating): user profile button with a dropdown.

## Stack

- React Router v7 SSR
- Cloudflare Workers (smart placement)
- Cloudflare D1 (binding `DB`, resource `flower-audit`)
- Cloudflare R2 (binding `FLOWER`, resource `flower-audit`)
- Tailwind CSS v4
- [Lexical](https://github.com/facebook/lexical) for the rich-text editor

## Project layout

```
src/
  back/worker.ts                # Cloudflare Workers entrypoint (createRequestHandler)
  front/
    routes.ts                   # React Router route table
    layouts/app.tsx             # Main layout (top menu + right sidebar)
    routes/                     # Route facades — re-export loader/action from .server/
      start.tsx                 # /
      flow.tsx                  # /flow
      flow.id.tsx               # /flow/:id
      process.tsx               # /process
      process.id.tsx            # /process/:id
      setup.tsx                 # /setup
    api/                        # Resource routes (no default export)
      index.ts                  # /api/index (request entrypoint per AGENTS.md)
      calendar.ts               # /api/calendar
      search.ts                 # /api/search
      chat.ts                   # /api/chat
    .server/                    # Backend modules (one folder per route)
      db.ts                     # D1 / R2 binding helpers
      <module>/database.json    # Module-scoped SQL (mandatory; see AGENTS.md)
      index/, calendar/, api/, flow/, process/, setup/, start/
    components/                 # Client-only UI components
      LexicalEditor.tsx
      CalendarPanel.tsx
      ChatPanel.tsx
      ProfileButton.tsx
      SearchContext.tsx
    lib/                        # Pure utilities (randomHEX, isEmpty, httpcodes)
schema.sql                      # D1 schema (run with `wrangler d1 execute --file=`)
wrangler.jsonc                  # Cloudflare bindings
```

## Develop

```bash
pnpm install
pnpm dev          # local dev server
pnpm typecheck    # generate types + tsc
pnpm test         # vitest with @cloudflare/vitest-pool-workers
```

## Deploy

```bash
# 1. Create resources (one-time)
npx wrangler r2 bucket create flower-audit
npx wrangler d1 create flower-audit --location=enam
# copy the database_id into wrangler.jsonc

# 2. Apply schema (remote)
npx wrangler d1 execute flower-audit --remote --file=./schema.sql

# 3. Generate types
pnpm wrangler types

# 4. Deploy
pnpm run deploy
```
