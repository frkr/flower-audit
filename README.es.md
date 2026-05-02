# Flower

Sistema de auditoría construido sobre Cloudflare Workers (D1 + R2) con React Router v7.

> Fuentes de verdad:
> - Instrucciones para agentes: [`AGENTS.md`](./AGENTS.md)
> - Esquema de base de datos: [`schema.sql`](./schema.sql)

Otros idiomas: [English](./README.md) · [Português (Brasil)](./README.pt-br.md)

## Funcionalidades principales

- **Bienvenida (`/landing`)** — hero page pública mostrada tras el cierre de sesión, con la lista de funcionalidades del sistema y un botón **Entrar** que inicia el flujo de login.
- **Comenzar** — barra de búsqueda centrada al estilo Google que se anima hacia la parte superior tras una búsqueda. Busca primero en `flux` (10 resultados) y luego en `process` (10 resultados).
- **Flujos** — CRUD simple con búsqueda y paginación de 10 por página. Cada flujo tiene nombre, descripción y una lista editable de pasos.
- **Procesos** — CRUD simple donde cada proceso pertenece a un flujo. El campo `Contenido` de cada paso usa un editor WYSIWYG basado en Lexical con botón para maximizar a pantalla completa.
- **Configuración** — parámetros del sistema (clave/valor) persistidos en la base de datos.
- **Barra lateral derecha**:
  - Calendario (arriba): un pequeño ícono abre una vista mensual que destaca los días en que se iniciaron flujos, con tres intensidades (1, 2–4, 5+) según `process.created_at`.
  - Chat IA (medio): panel de chat mínimo, preparado para integrarse con [assistant-ui](https://github.com/assistant-ui/assistant-ui).
  - Perfil (abajo, flotante): botón de perfil del usuario con menú desplegable para información de cuenta y selección de idioma.

## Stack

- React Router v7 SSR
- Cloudflare Workers (smart placement)
- Cloudflare D1 (binding `DB`, recurso `flower-audit`)
- Cloudflare R2 (binding `FLOWER`, recurso `flower-audit`)
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/)
- [Lexical](https://github.com/facebook/lexical) para el editor de texto enriquecido
- [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/) para internacionalización (resources bundled — sin FS backend, compatible con Cloudflare Workers)

## Internacionalización (i18n)

- **Idioma predeterminado:** Inglés (`en`)
- **Idiomas soportados:** `en`, `pt-BR`, `es`, `de`, `ru`, `zh-TW`, `zh-CN`, `ja`, `ko`
- **Detección:** `navigator.language` en el cliente; preferencia guardada en `localStorage` (clave: `flower_language`)
- **Sin enrutamiento por URL** — el idioma se selecciona mediante la detección del navegador o el menú desplegable en el botón de Perfil
- **Archivos de traducción:** `src/front/i18n/locales/<código>.ts`
- **Configuración principal:** `src/front/i18n/i18n.ts`
- **Provider:** `I18nextProvider` en `src/front/root.tsx`
- **Uso en componentes:** `const { t } = useTranslation()`

## Estructura

```
src/
  back/worker.ts                # Entrypoint del Worker (createRequestHandler)
  front/
    routes.ts                   # Tabla de rutas de React Router
    layouts/app.tsx             # Layout principal (menú superior + barra lateral)
    routes/                     # Un directorio por módulo; facade + *.server.ts + database.json
      landing/                  # /landing (pública), / (índice tras login)
      go/                       # /go, /api/search, /api/index
      flow/                     # /flow, /flow/:id
      process/                  # /process, /process/:id
      setup/                    # /setup
      login/                    # /login, /login/callback, /logout
      calendar/                 # /api/calendar
      chat/                     # /api/chat
      files/                    # /api/files
    components/                 # Componentes de UI (AlertModal, ConfirmModal, LexicalEditor, …)
    i18n/
      i18n.ts                   # Configuración de i18next
      locales/                  # Archivos de traducción (en.ts, pt-BR.ts, es.ts, de.ts, ru.ts, …)
    lib/                        # Utilidades compartidas (auth.server.ts, db.server.ts, formatDate.ts, …)
schema.sql                      # Esquema D1
wrangler.jsonc                  # Bindings de Cloudflare
```

## Desarrollo

```bash
pnpm install
pnpm dev          # servidor local
pnpm typecheck    # generar tipos + tsc
pnpm test         # vitest run
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
