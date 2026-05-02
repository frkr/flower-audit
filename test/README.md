# Test Folder

> Agents: Use this file ./test/README.md for list all tests and status regarding implementation of each test.

## E2E Tests (Playwright)

Run with: `pnpm test:e2e`

### flow.spec.ts — Flow CRUD

| # | Test | Status |
|---|------|--------|
| 1 | lista de fluxos carrega | ✅ implementado |
| 2 | cria um novo fluxo | ✅ implementado |
| 3 | edita nome e descrição do fluxo | ✅ implementado |
| 4 | adiciona passo ao fluxo | ✅ implementado |
| 5 | renomeia passo do fluxo | ✅ implementado |
| 6 | remove passo do fluxo | ✅ implementado |
| 7 | fluxo aparece na listagem após criação | ✅ implementado |
| 8 | pesquisa filtra fluxos | ✅ implementado |
| 9 | pesquisa sem resultados mostra mensagem | ✅ implementado |
| 10 | exclui fluxo da listagem | ✅ implementado |

### process.spec.ts — Process CRUD

| # | Test | Status |
|---|------|--------|
| 1 | lista de processos carrega | ✅ implementado |
| 2 | cria um novo processo | ✅ implementado |
| 3 | processo aparece na listagem após criação | ✅ implementado |
| 4 | abre processo para edição | ✅ implementado |
| 5 | edita metadados do processo | ✅ implementado |
| 6 | pesquisa filtra processos | ✅ implementado |
| 7 | pesquisa sem resultados mostra mensagem | ✅ implementado |
| 8 | exclui processo da página de detalhe | ✅ implementado |
| 9 | exclui processo diretamente da listagem | ✅ implementado |

## Setup

The `global-setup.ts` seeds the local Cloudflare D1 database with a test `jwt_secret` and
creates a valid session cookie so all tests run as an authenticated user.
