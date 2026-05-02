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
  - Profile (bottom, floating): user profile button with a dropdown for account info and language selection.

## Stack

- React Router v7 SSR
- Cloudflare Workers (smart placement)
- Cloudflare D1 (binding `DB`, resource `flower-audit`)
- Cloudflare R2 (binding `FLOWER`, resource `flower-audit`)
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/)
- [Lexical](https://github.com/facebook/lexical) for the rich-text editor
- [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/) for internationalisation (bundled resources — no FS backend, Cloudflare Workers-compatible)

## Internationalisation (i18n)

- **Default language:** English (`en`)
- **Supported languages:** `en`, `pt-BR`, `es`, `de`, `ru`, `zh-TW`, `zh-CN`, `ja`, `ko`
- **Detection:** `navigator.language` on the client; preference saved in `localStorage` (key: `flower_language`)
- **No URL-based routing** — language is selected via browser detection or the dropdown in the Profile button
- **Translation files:** `src/front/i18n/locales/<code>.ts`
- **Main config:** `src/front/i18n/i18n.ts`
- **Provider:** `I18nextProvider` in `src/front/root.tsx`
- **Usage in components:** `const { t } = useTranslation()`

## Project layout

```
src/
  back/worker.ts                # Cloudflare Workers entrypoint (createRequestHandler)
  front/
    routes.ts                   # React Router route table
    layouts/app.tsx             # Main layout (top menu + right sidebar)
    routes/                     # One folder per module; facade + *.server.ts + database.json
      landing/                  # /landing (public), / (index after login)
      go/                       # /go, /api/search, /api/index
      flow/                     # /flow, /flow/:id
      process/                  # /process, /process/:id
      setup/                    # /setup
      login/                    # /login, /login/callback, /logout
      calendar/                 # /api/calendar
      chat/                     # /api/chat
      files/                    # /api/files
    components/                 # UI components (AlertModal, ConfirmModal, LexicalEditor, …)
    i18n/
      i18n.ts                   # i18next configuration
      locales/                  # Translation files (en.ts, pt-BR.ts, es.ts, de.ts, ru.ts, …)
    lib/                        # Shared utilities (auth.server.ts, db.server.ts, formatDate.ts, …)
schema.sql                      # D1 schema (run with `wrangler d1 execute --file=`)
wrangler.jsonc                  # Cloudflare bindings
```

## Develop

```bash
pnpm install
pnpm dev          # local dev server
pnpm typecheck    # generate types + tsc
pnpm test         # vitest run
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
