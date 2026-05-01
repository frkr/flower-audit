# schema.md

Diagrama Mermaid do banco de dados gerado a partir de [`schema.sql`](./schema.sql).

> Mantenha este arquivo em sincronia com `schema.sql`. Toda alteração de tabela/coluna deve ser refletida aqui (regra do `AGENTS.md`).

## Visão geral (ER)

```mermaid
erDiagram
    flux ||--o{ flux_metadata     : has
    flux ||--o{ flux_authors      : has
    flux ||--o{ flux_steps        : has
    flux ||--o{ process           : has
    flux ||--o{ process_steps     : referenced_by

    process ||--o{ process_metadata     : has
    process ||--o{ process_authors      : has
    process ||--o{ process_steps        : has
    process ||--o{ process_step_files   : has

    process_steps ||--o{ process_step_authors : has
    process_steps ||--o{ process_step_files   : has

    flux {
        TEXT    id PK
        TEXT    name
        TEXT    description
        TEXT    created_at
        TEXT    updated_at
        INTEGER active
        INTEGER visible
    }
    flux_metadata {
        TEXT id PK
        TEXT id_fluxo FK
        TEXT name
        TEXT value
    }
    flux_authors {
        TEXT id PK
        TEXT id_fluxo FK
        TEXT author
        TEXT at
    }
    flux_steps {
        TEXT    id PK
        TEXT    id_fluxo FK
        INTEGER id_order
        TEXT    name
    }

    process {
        TEXT    id PK
        TEXT    id_fluxo FK
        TEXT    name
        TEXT    description
        TEXT    created_at
        TEXT    updated_at
        INTEGER active
        INTEGER visible
    }
    process_metadata {
        TEXT id PK
        TEXT id_process FK
        TEXT id_fluxo
        TEXT name
        TEXT value
    }
    process_authors {
        TEXT id PK
        TEXT id_process FK
        TEXT id_fluxo
        TEXT author
        TEXT at
    }
    process_steps {
        TEXT    id PK
        INTEGER id_order
        TEXT    id_reuse_step
        TEXT    id_process FK
        TEXT    id_flux FK
        TEXT    name
        TEXT    content
        TEXT    completed_at
    }
    process_step_authors {
        TEXT id PK
        TEXT id_step FK
        TEXT id_fluxo
        TEXT author
        TEXT at
    }
    process_step_files {
        TEXT    id PK
        TEXT    id_process FK
        TEXT    id_step FK
        TEXT    name
        TEXT    description
        TEXT    finder
        TEXT    mime_type
        INTEGER size_bytes
        INTEGER is_image
        TEXT    uploaded_at
    }

    settings {
        TEXT id PK
        TEXT name UK
        TEXT value
        TEXT description
        TEXT updated_at
    }
```

## Domínio Flux (Fluxos)

```mermaid
erDiagram
    flux ||--o{ flux_metadata : has
    flux ||--o{ flux_authors  : has
    flux ||--o{ flux_steps    : has

    flux {
        TEXT    id PK
        TEXT    name
        TEXT    description
        TEXT    created_at
        TEXT    updated_at
        INTEGER active
        INTEGER visible
    }
    flux_metadata {
        TEXT id PK
        TEXT id_fluxo FK
        TEXT name
        TEXT value
    }
    flux_authors {
        TEXT id PK
        TEXT id_fluxo FK
        TEXT author
        TEXT at
    }
    flux_steps {
        TEXT    id PK
        TEXT    id_fluxo FK
        INTEGER id_order
        TEXT    name
    }
```

## Domínio Process (Processos)

```mermaid
erDiagram
    flux ||--o{ process : starts

    process ||--o{ process_metadata     : has
    process ||--o{ process_authors      : has
    process ||--o{ process_steps        : has
    process ||--o{ process_step_files   : has

    process_steps ||--o{ process_step_authors : has
    process_steps ||--o{ process_step_files   : has

    flux {
        TEXT id PK
        TEXT name
    }
    process {
        TEXT    id PK
        TEXT    id_fluxo FK
        TEXT    name
        TEXT    description
        TEXT    created_at
        TEXT    updated_at
        INTEGER active
        INTEGER visible
    }
    process_metadata {
        TEXT id PK
        TEXT id_process FK
        TEXT id_fluxo
        TEXT name
        TEXT value
    }
    process_authors {
        TEXT id PK
        TEXT id_process FK
        TEXT id_fluxo
        TEXT author
        TEXT at
    }
    process_steps {
        TEXT    id PK
        INTEGER id_order
        TEXT    id_reuse_step
        TEXT    id_process FK
        TEXT    id_flux FK
        TEXT    name
        TEXT    content
        TEXT    completed_at
    }
    process_step_authors {
        TEXT id PK
        TEXT id_step FK
        TEXT id_fluxo
        TEXT author
        TEXT at
    }
    process_step_files {
        TEXT    id PK
        TEXT    id_process FK
        TEXT    id_step FK
        TEXT    name
        TEXT    description
        TEXT    finder
        TEXT    mime_type
        INTEGER size_bytes
        INTEGER is_image
        TEXT    uploaded_at
    }
```

## Settings (Configuração)

```mermaid
erDiagram
    settings {
        TEXT id PK
        TEXT name UK
        TEXT value
        TEXT description
        TEXT updated_at
    }
```

## Convenções

- Todos os PKs (`id`) são gerados via [`src/front/lib/randomHEX.ts`](./src/front/lib/randomHEX.ts) com 16 bytes (string hex).
- Colunas de data (`created_at`, `updated_at`, `at`) usam `datetime('now')` do SQLite.
- Soft delete via `active = 0`. A coluna `visible` controla se a linha aparece em listagens públicas.
- Calendário (heatmap de "fluxos iniciados") consulta `process.created_at` agrupado por dia — não há tabela dedicada.
- Wizard de processo: `process_steps.completed_at` (NULL = pendente). O passo atual é o primeiro com `completed_at IS NULL` ordenado por `id_order`. Passos concluídos são read-only (podem ser reabertos com a action `reopenStep`).

## Índices criados

- `flux`: `idx_flux_name`, `idx_flux_active`, `idx_flux_created`
- `flux_metadata`: `idx_flux_metadata_flux`
- `flux_authors`: `idx_flux_authors_flux`
- `flux_steps`: `idx_flux_steps_flux`
- `process`: `idx_process_flux`, `idx_process_name`, `idx_process_active`, `idx_process_created`
- `process_metadata`: `idx_process_metadata_process`
- `process_authors`: `idx_process_authors_process`
- `process_steps`: `idx_process_steps_process`, `idx_process_steps_flux`
- `process_step_authors`: `idx_process_step_authors_step`
- `process_step_files`: `idx_process_step_files_step`
