# Flower

Sistema de auditoría construido sobre Cloudflare Workers (D1 + R2) con React Router v7.

> Fuentes de verdad:
> - Instrucciones para agentes: [`AGENTS.md`](./AGENTS.md)
> - Esquema de base de datos: [`schema.sql`](./schema.sql)

Otros idiomas: [English](./README.md) · [Português (Brasil)](./README.pt-br.md)

## Funcionalidades principales

- **Comenzar** — barra de búsqueda centrada al estilo Google que se anima hacia la parte superior tras una búsqueda. Busca primero en `flux` (10 resultados) y luego en `process` (10 resultados).
- **Flujos** — CRUD simple con búsqueda y paginación de 10 por página. Cada flujo tiene nombre, descripción y una lista editable de pasos.
- **Procesos** — CRUD simple donde cada proceso pertenece a un flujo. El campo `Contenido` de cada paso usa un editor WYSIWYG basado en Lexical con botón para maximizar a pantalla completa.
- **Configuración** — parámetros del sistema (clave/valor) persistidos en la base de datos.
- **Barra lateral derecha**:
  - Calendario (arriba): un pequeño ícono abre una vista mensual que destaca los días en que se iniciaron flujos, con tres intensidades (1, 2–4, 5+) según `process.created_at`.
  - Chat IA (medio): panel de chat mínimo, preparado para integrarse con [assistant-ui](https://github.com/assistant-ui/assistant-ui).
  - Perfil (abajo, flotante): botón de perfil del usuario.

## Stack

- React Router v7 SSR
- Cloudflare Workers (smart placement)
- Cloudflare D1 (binding `DB`, recurso `flower-audit`)
- Cloudflare R2 (binding `FLOWER`, recurso `flower-audit`)
- Tailwind CSS v4
- [Lexical](https://github.com/facebook/lexical) para el editor de texto enriquecido

## Estructura

```
src/
  back/worker.ts                # Entrypoint del Worker (createRequestHandler)
  front/
    routes.ts                   # Tabla de rutas de React Router
    layouts/app.tsx             # Layout principal (menú superior + barra lateral)
    routes/                     # Facades — solo reexportan loader/action de .server/
                                # start.tsx (/), flow.tsx, flow.id.tsx,
                                # process.tsx, process.id.tsx, setup.tsx
    api/                        # Resource routes (sin default export)
      index.ts                  # /api/index (entrypoint según AGENTS.md)
      calendar.ts, search.ts, chat.ts
    .server/<modulo>/database.json  # SQL por módulo (obligatorio; ver AGENTS.md)
    .server/                    # Módulos backend (uno por ruta)
      db.ts                     # Helpers para los bindings D1/R2
    components/                 # Componentes solo-cliente
    lib/                        # Utilidades puras (randomHEX, isEmpty, httpcodes)
schema.sql
wrangler.jsonc
```

## Desarrollo

```bash
pnpm install
pnpm dev          # servidor local
pnpm typecheck    # generar tipos + tsc
pnpm test         # vitest con @cloudflare/vitest-pool-workers
```

## Despliegue

```bash
# 1. Crear recursos (una sola vez)
npx wrangler r2 bucket create flower-audit
npx wrangler d1 create flower-audit --location=enam
# copia el database_id retornado en wrangler.jsonc

# 2. Aplicar el esquema (remoto)
npx wrangler d1 execute flower-audit --remote --file=./schema.sql

# 3. Generar tipos
pnpm wrangler types

# 4. Desplegar
pnpm run deploy
```
