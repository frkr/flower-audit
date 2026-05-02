# Este projeto é sobre um sistema Chamado 'Flower'

> Este arquivo 'AGENTS.md' é a fonte de verdade absoluta para agentes de IA

- Todas as ações no backend devem checar se o usuario esta logado.
- Não deletar a tabela de configuração pois tem informações importantes
- Mantenha o README.md com as principais funcionalidades do sistema atualizadas.
- Mantenha o schema.sql atualizado com as estruturas de dados necessárias.
- O sistema tem um pequeno menu à esquerda no topo, com os links para 'Começar', 'Fluxos' e 'Configuração'
- Para línguas latinas é melhor usar palavras derivadas destas acima como: 'Começar', 'Fluxos' e 'Configuração'
- Para outras línguas, use outras, como, por exemplo, em inglês: 'Go', 'Flows', 'Setup'
- À direita, vai ter um ícone superior, pequeno, de calendário, onde, clicando vai abrir um calendário onde nas datas ficarão coloridas datas onde os fluxos foram iniciados.
- No calendário vai aparecer os números da data normal, mas com o fundo bem claro para indicar que apenas um fluxo foi iniciado, se 5 fluxos foram iniciados, vai aparecer um fundo um pouco mais escuro do que o normal para identificar que tem 5, mas para 5 fluxo ou mais, ficará um fundo escuro.
- Nesta barra lateral a direita, também vai ter um pequeno chat, onde podemos perguntar coisas pra uma IA (https://github.com/assistant-ui/assistant-ui)
- e no fim, flutuando na parte inferior dessa barra lateral, vai ter um ícone de perfil, onde o usuário pode ver suas informações de perfil.
- Quando clicado em Configurações, vamos ter uma lista imensa de configurações que serão parâmetros do sistema que devem ser gravadas no banco de dados. Esses parâmetros vão ser desenvolvidos ao longo do tempo.
- Em 'Fluxos' vai ser onde terá uma barra de pesquisa e mostrará apenas 10 fluxos por vez. É um crud simples onde a pessoa pode dar Um nome para o Fluxo e colocar seus passos.
- A Estrutura do bando de dados do fluxo vai ser espandita neste arquivo AGENTS.md, mas ela deve ser simples tendo como 'Nome do Fluxo', 'Descrição', 'Passos' e vai dar opção para o usuário adicionar uma lista de Passos.
- Em 'Começar', vai ter uma caixa de pesquisa centralizada igual ao Google. Quando a pessoa digitar e clicar em pesquisa, a barra vai ser animada para ficar pequena e ir parar no topo do lado esquerdo da tela, bem pequena e abaixo do menu.
- Os 10 primeiros resultados serão da tabela `fluxos`. Após carregar esses 10 resultados a tela vai fazer uma nova pesquisa em `processos`
- Esta tela de processos também será um CRUD simples a princípio.
- O campo 'Conteúdo' de `process` deve usar um campo de editor WYSIWYG (https://github.com/facebook/lexical) que deverá ser bem grande com um botão que possa maximizar para ocupar a tela inteira.



- Eu vou escrever muitas coisas em português do Brasil porque é minha lingua nativa, mas toda documentação que esteja fora do AGENTS.md, por favor deixe assim:
  - README.md - Em inglês
  - README.pt-br.md - Em português do Brasil
  - README.es.md - Em espanhol
- Os nomes dos arquivos "README" são um exemplo como toda documentação deve ser feita em arquivos Markdown (Gráficos em Mermaid JS) e traduzidas nessas línguas usando esse formato de arquivo.
- wrangler.jsonc - tem os recursos e variáveis de ambiente desse projeto conectado na Cloudflare.
- Variáveis de ambiente da Cloudflare (bindings) devem estar em MAIÚSCULO e os nomes dos recursos (bucket/queue) em minúsculo. Exemplo: (Queue) foi renomeada para `mqcfgateway` (Binding: `MQCFGATEWAY`).
- Entrypoint de todas as request: `src/front/routes/go/api.ts`
- Todas as Rotas do React Router: `src/front/routes.ts`
- Todas as rotas do React Router tem um arquivo de inicialização em `src/front/routes/<modulo>/`
- O arquivo de inicialização de cada rota deve conter apenas um facade re-exportando funções do arquivo `*.server.ts` do mesmo módulo.
- **Não existe mais a pasta `.server` nem a pasta `api`** — toda a lógica foi migrada para módulos em `src/front/routes/<modulo>/`.
- Utilitários compartilhados de servidor ficam em `src/front/lib/` com sufixo `.server.ts` (ex: `auth.server.ts`, `db.server.ts`).

## Estrutura de Módulos (`src/front/routes/`)

Cada módulo é uma pasta dentro de `src/front/routes/`. Arquivos de rota (facade) ficam na raiz do módulo. A lógica de backend fica em arquivos `*.server.ts` dentro do mesmo módulo.

| Módulo | Pasta | Rotas UI | Arquivos de rota |
|--------|-------|----------|-----------------|
| **Landing** | `routes/landing/` | `/landing`, `/` (index) | `landing.tsx`, `welcome.tsx` |
| **GO** | `routes/go/` | `/go` | `go.tsx`, `search.ts`, `api.ts` |
| **FLOW** | `routes/flow/` | `/flow`, `/flow/:id` | `flow.tsx`, `flow.id.tsx` |
| **Process** | `routes/process/` | `/process`, `/process/:id` | `process.tsx`, `process.id.tsx` |
| **Setup** | `routes/setup/` | `/setup` | `setup.tsx` |
| **login** | `routes/login/` | `/login`, `/login/callback`, `/logout` | `login.ts`, `login.callback.ts`, `logout.ts` |
| **Calendar** | `routes/calendar/` | `/api/calendar` | `calendar.ts` |
| **Chat** | `routes/chat/` | `/api/chat` | `chat.ts` |
| **Files** | `routes/files/` | `/api/files` | `files.ts` |

Arquivos `.server.ts` em cada módulo contêm toda a lógica de backend (loader, action, funções auxiliares). Arquivos sem `.server` são facades (re-exportam) ou componentes React.

- **Nomes de rotas, paths de URL e nomes de arquivos de rota devem estar SEMPRE em inglês**, mesmo que os textos exibidos para o usuário estejam em português. Exemplos: `/flow` (não `/fluxos`), `/process` (não `/processos`), `/setup` (não `/configuracao`), `/api/index` (não `/api/mainroute`). Os módulos correspondentes em `src/front/routes/<nome>/` também seguem o mesmo nome em inglês. Apenas os rótulos visíveis na UI seguem a regra de tradução por idioma.
- Ao criar ou modificar testes unitários, os resultados da execução desses testes devem ser incluídos no corpo do pull request. No entanto, arquivos `.log` ou `.txt` (como `pr_comments.txt` ou saídas de log) usados para armazenar temporariamente esses resultados NÃO devem ser "comitados", para não sujar o histórico do git.
- Sempre deixe atualizado um arquivo chamado schema.md com o mermaidjs do arquivo schema.sql
- **Formatação de datas exibidas para o usuário**: toda data renderizada na UI deve usar `dd/MM/yyyy`; toda data + hora deve usar `dd/MM/yyyy HH:mm`. As datas no banco continuam em ISO/UTC (`datetime('now')`) — a formatação acontece somente na camada de exibição. Centralize a formatação em um helper único (`src/front/lib/formatDate.ts`) para não espalhar `toLocaleString` pelas telas.
- **SEMPRE que precisar fazer qualquer consulta SQL no banco de dados, extraia o SQL para um arquivo `database.json` colocado no MESMO diretório do arquivo `.ts`/`.tsx` que o usa.** Não deixe strings SQL espalhadas pelo código TypeScript. O `database.json` é um objeto cujas chaves nomeiam a query (em camelCase, descritivo) e os valores são as strings SQL parametrizadas (`?1`, `?2`, …). No código TS use `import queries from "./database.json"` e `conn.prepare(queries.nomeDaQuery)`. Cada módulo em `src/front/routes/<modulo>/` que executa SQL deve ter o seu próprio `database.json`.
- **Para fazer deploy, sempre rode `pnpm run deploy`** — nunca `wrangler deploy` direto. O script `deploy` do `package.json` faz primeiro `pnpm run build` (que inclui `typecheck` + `react-router build`) e só então chama `wrangler deploy`, garantindo que o bundle compilado e os tipos estejam atualizados antes do upload.

# Cloudflare Workers - Agents Section

> AGENTS! Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.
> AGENTS! Leave this section always on the final of the file.

## Docs

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

## Commands

| Command                                               | Purpose                   |
|-------------------------------------------------------|---------------------------|
| `npx wrangler dev`                                    | Local development         |
| `npx wrangler deploy`                                 | Deploy to Cloudflare      |
| `npx wrangler types`                                  | Generate TypeScript types |
| `npx wrangler r2 bucket create cfgateway`             | Create R2 bucket          |
| `npx wrangler queues create mqcfgateway`              | Create Queue              |
| `npx wrangler queues create mqcfgateway-dlq`          | Create Dead Letter Queue  |
| `npx wrangler d1 execute <database> --remote --command="ALTER TABLE <table> ADD COLUMN <column> <type>"` | Add column to D1 table |
| `npx wrangler d1 create new-database --location=enam` | Create D1 Database        |

Run `wrangler types` after changing bindings in wrangler.jsonc.

## Node.js Compatibility

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

## Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: https://developers.cloudflare.com/workers/observability/errors/

## Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

## Environment Variables

Do not hand-write your Env interface. Run wrangler types to generate a type definition file that matches your actual Wrangler configuration. This catches mismatches between your config and code at compile time instead of at deploy time.

Re-run wrangler types whenever you add or rename a binding.

```shell
pnpm wrangler types
```
