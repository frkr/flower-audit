# Flower

Sistema de auditoria construído sobre Cloudflare Workers (D1 + R2) com React Router v7.

> Fontes da verdade:
> - Instruções para agentes: [`AGENTS.md`](./AGENTS.md)
> - Schema do banco: [`schema.sql`](./schema.sql)

Outras línguas: [English](./README.md) · [Español](./README.es.md)

## Funcionalidades principais

- **Boas-vindas (`/landing`)** — hero page pública exibida após o logout, com a lista de funcionalidades do sistema e um botão **Entrar** que inicia o fluxo de login.
- **Começar** — caixa de pesquisa centralizada estilo Google que se anima até o topo após a pesquisa. Busca primeiro em `flux` (10 resultados) e em seguida em `process` (10 resultados).
- **Fluxos** — CRUD simples com pesquisa e paginação de 10 por vez. Cada fluxo tem nome, descrição e uma lista editável de passos.
- **Processos** — CRUD simples onde cada processo pertence a um fluxo. O campo `Conteúdo` de cada passo é um editor WYSIWYG baseado em Lexical com botão para maximizar em tela cheia.
- **Configuração** — parâmetros do sistema (chave/valor) persistidos no banco.
- **Barra lateral à direita**:
  - Calendário (topo): pequeno ícone abre uma visão mensal destacando os dias em que fluxos foram iniciados. Usa três intensidades (1, 2–4, 5+) com base em `process.created_at`.
  - Chat IA (meio): painel mínimo, pronto para ser ligado em [assistant-ui](https://github.com/assistant-ui/assistant-ui).
  - Perfil (rodapé, flutuando): ícone de perfil do usuário.

## Stack

- React Router v7 SSR
- Cloudflare Workers (smart placement)
- Cloudflare D1 (binding `DB`, recurso `flower-audit`)
- Cloudflare R2 (binding `FLOWER`, recurso `flower-audit`)
- Tailwind CSS v4
- [Lexical](https://github.com/facebook/lexical) para o editor de texto rico

## Estrutura

```
src/
  back/worker.ts                # Entrypoint do Worker (createRequestHandler)
  front/
    routes.ts                   # Tabela de rotas do React Router
    layouts/app.tsx             # Layout principal (menu superior + barra lateral)
    routes/                     # Facades — só reexportam loader/action de .server/
      start.tsx                 # /
      flow.tsx                  # /flow
      flow.id.tsx               # /flow/:id
      process.tsx               # /process
      process.id.tsx            # /process/:id
      setup.tsx                 # /setup
    api/                        # Resource routes (sem default export)
      index.ts                  # /api/index (entrypoint segundo AGENTS.md)
      calendar.ts               # /api/calendar
      search.ts                 # /api/search
      chat.ts                   # /api/chat
    .server/                    # Módulos de backend (um diretório por rota)
      db.ts                     # Helpers para os bindings D1/R2
      <modulo>/database.json    # SQL do módulo (obrigatório; ver AGENTS.md)
    components/                 # Componentes client-only
    lib/                        # Utilitários puros (randomHEX, isEmpty, httpcodes)
schema.sql                      # Schema do D1
wrangler.jsonc                  # Bindings da Cloudflare
```

## Desenvolvimento

```bash
pnpm install
pnpm dev          # servidor local
pnpm typecheck    # gerar tipos + tsc
pnpm test         # vitest com @cloudflare/vitest-pool-workers
```

## Deploy

```bash
# 1. Criar recursos (uma vez)
npx wrangler r2 bucket create flower-audit
npx wrangler d1 create flower-audit --location=enam
# copie o database_id retornado para o wrangler.jsonc

# 2. Aplicar schema (remoto)
npx wrangler d1 execute flower-audit --remote --file=./schema.sql

# 3. Gerar tipos
pnpm wrangler types

# 4. Deploy
pnpm run deploy
```
