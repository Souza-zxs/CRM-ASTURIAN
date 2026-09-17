# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com o código deste repositório.

## Visão Geral do Projeto

Zyra é um CRM proprietário da Horizon LTDA (privado), construído com tecnologias modernas em uma estrutura de monorepo. O código é organizado como um workspace Nx com múltiplos pacotes.

## Comandos Principais

### Desenvolvimento
```bash
# Start development environment (frontend + backend + worker)
npm run dev

# Individual package development
npx nx start asturian-front     # Start frontend dev server
npx nx start zyra-server    # Start backend server
npx nx run zyra-server:worker  # Start background worker
```

### Testes
```bash
# Preferred: run a single test file (fast)
npx jest path/to/test.test.ts --config=packages/PROJECT/jest.config.mjs

# Run all tests for a package
npx nx test asturian-front      # Frontend unit tests
npx nx test zyra-server     # Backend unit tests
npx nx run zyra-server:test:integration:with-db-reset  # Integration tests with DB reset
# To run an indivual test or a pattern of tests, use the following command:
cd packages/{workspace} && npx jest "pattern or filename"

# Storybook
npx nx storybook:build asturian-front
npx nx storybook:test asturian-front

# When testing the UI end to end, click on "Continue with Email" and use the prefilled credentials.
```

### Qualidade de Código
```bash
# Linting (diff with main - fastest, always prefer this)
npx nx lint:diff-with-main asturian-front
npx nx lint:diff-with-main zyra-server
npx nx lint:diff-with-main asturian-front --configuration=fix  # Auto-fix

# Linting (full project - slower, use only when needed)
npx nx lint asturian-front
npx nx lint zyra-server

# Type checking
npx nx typecheck asturian-front
npx nx typecheck zyra-server

# Format code
npx nx fmt asturian-front
npx nx fmt zyra-server
```

### Build
```bash
# Build packages (zyra-shared must be built first)
npx nx build zyra-shared
npx nx build asturian-front
npx nx build zyra-server
```

### Operações de Banco de Dados
```bash
# Database management
npx nx database:reset zyra-server  # Reset database (wipes data)
npx nx run zyra-server:database:init    # First-time schema setup + migrations (includes slow)
npx nx run zyra-server:database:migrate # Run pending instance commands (fast only)

# Generate an instance command (fast or slow)
npx nx run zyra-server:database:migrate:generate --name <name> --type <fast|slow>
```

### Inspeção de Banco de Dados (Postgres MCP)

Um servidor MCP Postgres somente leitura está configurado em `.mcp.json`. Use-o para:
- Inspecionar dados de workspace, metadados e definições de objetos durante o desenvolvimento
- Verificar resultados de migrações (colunas, tipos, restrições) após executá-las
- Explorar a estrutura de schema multi-tenant (core, metadata, schemas específicos de workspace)
- Depurar problemas consultando dados brutos para confirmar se um bug é de frontend, backend ou em nível de dados
- Inspecionar tabelas de metadados para depurar problemas de geração do schema GraphQL

Este servidor é somente leitura — para operações de escrita (reset, migrações, sync), use os comandos de CLI acima.

### GraphQL
```bash
# Generate GraphQL types (run after schema changes)
npx nx run asturian-front:graphql:generate
npx nx run asturian-front:graphql:generate --configuration=metadata
```

## Visão Geral da Arquitetura

### Stack de Tecnologias
- **Frontend**: React 18, TypeScript, Jotai (gerenciamento de estado), Linaria (estilização), Vite
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, GraphQL (com GraphQL Yoga)
- **Monorepo**: workspace Nx gerenciado com npm (workspaces)

### Estrutura de Pacotes
```
packages/
├── asturian-front/          # React frontend application
├── zyra-server/         # NestJS backend API
├── zyra-ui/             # Shared UI components library
├── zyra-shared/         # Common types and utilities
├── zyra-emails/         # Email templates with React Email
├── zyra-website/    # Next.js marketing website
├── zyra-docs/           # Documentation website
├── zyra-zapier/         # Zapier integration
└── zyra-e2e-testing/    # Playwright E2E tests
```

### Princípios Fundamentais de Desenvolvimento
- **Apenas componentes funcionais** (sem componentes de classe)
- **Apenas exports nomeados** (sem default exports)
- **Types em vez de interfaces** (exceto ao estender interfaces de terceiros)
- **String literals em vez de enums** (exceto para enums do GraphQL)
- **Nenhum uso do tipo 'any'** — TypeScript estrito é obrigatório
- **Event handlers preferidos a useEffect** para atualizações de estado
- **Props para baixo, eventos para cima** — fluxo de dados unidirecional
- **Composição em vez de herança**
- **Sem abreviações** em nomes de variáveis (`user` e não `u`, `fieldMetadata` e não `fm`)

### Convenções de Nomenclatura
- **Variáveis/funções**: camelCase
- **Constantes**: SCREAMING_SNAKE_CASE
- **Types/Classes**: PascalCase (sufixe as props de componentes com `Props`, ex.: `ButtonProps`)
- **Arquivos/diretórios**: kebab-case com sufixos descritivos (`.component.tsx`, `.service.ts`, `.entity.ts`, `.dto.ts`, `.module.ts`)
- **Generics do TypeScript**: nomes descritivos (`TData` e não `T`)

### Estrutura de Arquivos
- Componentes com menos de 300 linhas, serviços com menos de 500 linhas
- Componentes em seus próprios diretórios, com testes e stories
- Use barrel exports em `index.ts` para imports limpos
- Ordem de imports: bibliotecas externas primeiro, depois internas (`@/`), depois relativas

### Comentários
- Use comentários curtos (`//`), não blocos JSDoc
- Explique o PORQUÊ (lógica de negócio), não o QUÊ
- Não comente código óbvio
- Comentários de múltiplas linhas usam várias linhas `//`, não `/** */`

### Gerenciamento de Estado
- **Jotai** para estado global: atoms para estado primitivo, selectors para estado derivado, atom families para coleções dinâmicas
- Estado específico de componente com React hooks (`useState`, `useReducer` para lógica complexa)
- Cache GraphQL gerenciado pelo Apollo Client
- Use atualizações de estado funcionais: `setState(prev => prev + 1)`

### Arquitetura do Backend
- **Módulos NestJS** para organização de funcionalidades
- **TypeORM** como ORM de banco de dados com PostgreSQL
- **GraphQL** como API com abordagem code-first
- **Redis** para cache e gerenciamento de sessão
- **BullMQ** para processamento de jobs em background

### Comandos de Banco de Dados e Upgrade
- **PostgreSQL** como banco de dados principal
- **Redis** para cache e sessões
- **ClickHouse** para analytics (quando habilitado)
- Ao alterar arquivos de entidade, gere um **instance command** (`database:migrate:generate --name <name> --type <fast|slow>`)
- Instance commands **fast** tratam mudanças de schema; os **slow** adicionam uma etapa `runDataMigration` para backfills de dados
- **Workspace commands** iteram sobre todos os workspaces ativos/suspensos para upgrades por workspace
- Comandos usam os decorators `@RegisteredInstanceCommand` e `@RegisteredWorkspaceCommand` para descoberta automática
- Inclua tanto a lógica `up` quanto a `down` nos instance commands
- Nunca exclua ou reescreva a lógica `up`/`down` de instance commands já commitados
- Veja `packages/zyra-server/docs/UPGRADE_COMMANDS.md` para a documentação completa

### Helpers Utilitários
Use os helpers existentes de `zyra-shared` em vez de type guards manuais:
- `isDefined()`, `isNonEmptyString()`, `isNonEmptyArray()`

## Fluxo de Trabalho de Desenvolvimento

IMPORTANTE: Use o Context7 para geração de código, etapas de setup ou configuração, ou documentação de bibliotecas/APIs. Use automaticamente as ferramentas MCP do Context7 para resolver IDs de bibliotecas e obter docs de bibliotecas sem esperar por solicitações explícitas.

### Antes de Fazer Alterações
1. Sempre execute linting (`lint:diff-with-main`) e type checking após alterações no código
2. Teste as alterações com as suítes de teste relevantes (prefira execuções de teste por arquivo único)
3. Garanta que instance commands sejam gerados para alterações em entidades (`database:migrate:generate`)
4. Verifique se as alterações no schema GraphQL são retrocompatíveis
5. Execute `graphql:generate` após qualquer alteração no schema GraphQL

### Notas de Estilo de Código
- Use **Linaria** para estilização com CSS-in-JS de zero runtime (padrão styled-components)
- Siga as convenções de workspace do **Nx** para imports
- Use **Lingui** para internacionalização
- Aplique segurança primeiro, depois formatação (sanitize antes de formatar)

### Estratégia de Testes
- **Teste comportamento, não implementação** — foque na perspectiva do usuário
- **Pirâmide de testes**: 70% unitários, 20% integração, 10% E2E
- Consulte por elementos visíveis ao usuário (texto, roles, labels) em vez de test IDs
- Use `@testing-library/user-event` para interações realistas
- Nomes de teste descritivos: "should [behavior] when [condition]"
- Limpe os mocks entre testes com `jest.clearAllMocks()`

## Configuração do Ambiente de Desenvolvimento

Todos os ambientes de desenvolvimento (Claude Code web, Cursor, local) usam um único script:

```bash
bash packages/zyra-utils/setup-dev-env.sh
```

Isso cuida de tudo: inicia Postgres + Redis (detecta automaticamente serviços locais vs Docker), cria os bancos de dados, copia os arquivos `.env` e inicializa o schema do banco (executa migrações) em um banco novo. Idempotente — seguro para executar várias vezes.

- `--docker` — força o modo Docker (usa `packages/zyra-docker/docker-compose.dev.yml`)
- `--down` — para os serviços
- `--reset` — apaga os dados e reinicia do zero
- **Pule o script de setup** para tarefas que apenas leem código — perguntas sobre arquitetura, revisão de código, documentação, etc.

**Nota:** Workflows de CI (GitHub Actions) gerenciam serviços via service containers do Actions e executam as etapas de setup individualmente — não usam este script.

## Arquivos Importantes
- `nx.json` - Configuração do workspace Nx com definições de tarefas
- `tsconfig.base.json` - Configuração base do TypeScript
- `package.json` - Pacote raiz com definições de workspace
- `.cursor/rules/` - Diretrizes detalhadas de desenvolvimento e boas práticas
