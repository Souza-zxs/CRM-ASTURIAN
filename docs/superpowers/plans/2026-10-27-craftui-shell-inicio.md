# Casca CRAFTUI e aba Início — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar ao Zyra a casca do kit CRAFTUI (barra de ícones, painel de contexto, área principal em painel) e uma aba Início com os números reais da operação, sem alterar nenhuma função.

**Architecture:** A navegação continua guiada pelos itens de menu existentes (`navigationMenuItem`); um hook novo os projeta numa barra de ícones, e o `NavigationDrawer` atual vira o painel de contexto só com mudança de estilo. O dashboard padrão do servidor é remontado com widgets que já existem (`GRAPH`, `TASKS`), e um comando de workspace idempotente adiciona o mesmo dashboard ao Horizon.

**Tech Stack:** React 18 + TypeScript, Linaria (`@linaria/react`), Jotai, Lingui, NestJS, Jest/Testing Library, Nx. Deploy de preview pelo CLI da Vercel.

**Spec:** `docs/superpowers/specs/2026-10-27-craftui-shell-inicio-design.md`

## Global Constraints

- Só apresentação: nenhum objeto, campo, tabela, permissão ou rota novos (a exceção é o comando de workspace da Tarefa 8, que só cria um dashboard).
- Tema claro é o padrão (`persistedColorSchemeState` = `'Light'`); quem tem preferência salva a mantém.
- Acento `#5E81F4`; fundo de página `#F5F5FA`; texto `#1C1D21` / `#6B6B8A`; contraste mínimo WCAG AA e alvos de toque de 44px no mobile.
- Estilo com `styled` de `@linaria/react` e `themeCssVariables`; sem `any`; exports nomeados; componentes < 300 linhas; nomes sem abreviação.
- Textos novos em pt-BR primeiro (Lingui), depois EN/ES.
- Mobile (abaixo de `MOBILE_VIEWPORT`) mantém `MobileNavigationBar`.
- Nenhum deploy em produção: só preview da Vercel, com `--build-env REACT_APP_SERVER_BASE_URL=https://zyra-api.179-199-135-212.sslip.io`.
- Instalação de dependências é pesada nesta máquina: o ambiente de testes é o `master` local em `D:\projetos\workshop-os` (com `node_modules`), não o worktree `D:\dwt`.

## Review Focus

1. Mais de ~12 itens de menu de nível superior → a barra de ícones rola, sem cortar nem sumir itens (Tarefa 2 e 3).
2. Item de menu sem ícone definido → ícone padrão, nunca vazio (Tarefa 2).
3. Usuário sem permissão de leitura de um objeto → o item não aparece na barra (Tarefa 2).
4. Workspace sem dados → KPIs mostram `0`, sem erro nem painel quebrado (Tarefa 6).
5. Rodar o comando do Horizon duas vezes → não cria dashboard duplicado (Tarefa 8).

---

### Task 1: Congelar o spike de tokens

**Files:**
- Modify (já alterados, sem commit): `packages/zyra-ui/src/theme-constants/theme-light.css`, `theme-dark.css`, `__tests__/themeAccentColor.test.ts`, `brands/zyra/brand.config.json`, `packages/asturian-front/index.html`, `packages/asturian-front/src/modules/ui/theme/states/persistedColorSchemeState.ts`

**Interfaces:**
- Produces: tokens CSS `--t-accent-*`, `--t-background-*`, `--t-border-color-*`, `--t-font-color-*`, `--t-box-shadow-*` já no tom do kit, usados por todas as tarefas seguintes.

- [ ] **Step 1: Rodar o teste de acento** — `cd packages/zyra-ui && npx jest src/theme-constants/__tests__/themeAccentColor.test.ts --config=jest.config.mjs`. Expected: 3 testes passam (rodar no checkout com `node_modules`, copiando os 6 arquivos acima).
- [ ] **Step 2: Commit** — `git add` dos 6 arquivos; mensagem `feat(ui): tokens do kit CRAFTUI (acento azul, neutros frios, sombras suaves)`.

### Task 2: Hook `useIconRailItems`

**Files:**
- Create: `packages/asturian-front/src/modules/navigation/hooks/useIconRailItems.ts`
- Create: `packages/asturian-front/src/modules/navigation/types/IconRailItem.ts`
- Test: `packages/asturian-front/src/modules/navigation/hooks/__tests__/useIconRailItems.test.tsx`

**Interfaces:**
- Consumes: `useNavigationMenuItemSectionItems(): NavigationMenuItem[]`, `useNavigationMenuItemsByFolder()` (retorna `navigationMenuItemsByFolder` com `{ id, folderName, navigationMenuItems }`), `currentNavigationMenuItemFolderIdState`, permissões via `useObjectPermissions`.
- Produces: `type IconRailItem = { id: string; label: string; Icon: IconComponent; kind: 'folder' | 'link'; path?: string; isActive: boolean }` e `useIconRailItems(): IconRailItem[]` (itens de nível superior na ordem de exibição do menu).

- [ ] **Step 1: Escrever os testes** em `useIconRailItems.test.tsx` com estes nomes e asserções:
  - `should return one folder item per top-level folder` → `result.current.filter(i => i.kind === 'folder').map(i => i.label)` igual a `['Sales', 'Productivity']` para o menu padrão mockado.
  - `should return a link item for each top-level object or view item` → `kind === 'link'` e `path` definido.
  - `should use the default icon when an item has no icon` → `Icon` definido (igual a `IconLayoutList`) para item sem ícone.
  - `should hide items whose object the user cannot read` → item de objeto sem permissão não aparece.
  - `should mark the item of the opened folder as active` → `isActive === true` só para a pasta de `currentNavigationMenuItemFolderIdState`.
- [ ] **Step 2: Rodar e ver falhar** — `npx jest packages/asturian-front/src/modules/navigation/hooks/__tests__/useIconRailItems.test.tsx --config=packages/asturian-front/jest.config.mjs`. Expected: FAIL, módulo inexistente.
- [ ] **Step 3: Implementar `useIconRailItems(): IconRailItem[]`** compondo os dois hooks do bloco Consumes; resolver o ícone pelo mesmo utilitário que `NavigationDrawerItem` já usa para o item.
- [ ] **Step 4: Rodar e ver passar.** Expected: 5 passam.
- [ ] **Step 5: Commit** — `feat(navigation): hook que projeta o menu na barra de ícones`.

### Task 3: Componente `AppIconRail` e ligação no layout

**Files:**
- Create: `packages/asturian-front/src/modules/navigation/components/AppIconRail.tsx`
- Modify: `packages/asturian-front/src/modules/ui/layout/page/components/DefaultLayout.tsx` (renderizar `<AppIconRail />` antes de `<AppNavigationDrawer />`, só quando `!isMobile && !useShowFullScreen && !showAuthModal`)
- Test: `packages/asturian-front/src/modules/navigation/components/__tests__/AppIconRail.test.tsx`

**Interfaces:**
- Consumes: `IconRailItem[]` de `useIconRailItems`; `useSetAtomState(currentNavigationMenuItemFolderIdState)`; `useNavigate`.
- Produces: `AppIconRail: () => JSX.Element` (barra de ~84px: logo no topo, itens com `aria-label` e `aria-current`, avatar embaixo levando ao perfil em Configurações).

- [ ] **Step 1: Escrever os testes**:
  - `should render one button per rail item with its label as aria-label`.
  - `should mark the active item with aria-current="page"`.
  - `should open the folder in the context panel when a folder item is clicked` → `currentNavigationMenuItemFolderIdState` passa a ser o `id` da pasta.
  - `should navigate to the item path when a link item is clicked`.
  - `should keep every item reachable when there are more than 12 items` → o contêiner tem `overflow-y: auto` e todos os 14 itens estão no documento.
  - `should not render the rail on mobile`.
- [ ] **Step 2: Rodar e ver falhar.** Expected: FAIL.
- [ ] **Step 3: Inventário antes de implementar** — criar `docs/superpowers/specs/2026-10-27-craftui-menu-inventory.md` listando tudo o que a gaveta atual expõe (busca, favoritos, aba de IA/chat, Configurações, seletor de workspace, ação "novo", itens em edição de layout) e onde cada um fica na casca nova (barra, painel ou cabeçalho). Nenhum item pode ficar sem destino.
- [ ] **Step 3b: Implementar `AppIconRail`** com Linaria; item ativo com barra azul à esquerda e fundo `background.secondary`; alvos de 44px; avatar no rodapé com o mesmo destino que o menu de perfil atual. Ligar no `DefaultLayout`.
- [ ] **Step 4: Rodar e ver passar.**
- [ ] **Step 5: Commit** — `feat(navigation): barra de ícones do kit CRAFTUI`.

### Task 4: Painel de contexto (restyle do `NavigationDrawer`)

**Files:**
- Modify: `packages/asturian-front/src/modules/ui/navigation/navigation-drawer/components/NavigationDrawer.tsx`, `NavigationDrawerHeader.tsx`, `NavigationDrawerItem.tsx`, `NavigationDrawerSection.tsx`
- Test: `packages/asturian-front/src/modules/ui/navigation/navigation-drawer/components/__tests__/NavigationDrawerItem.test.tsx` (existente; ampliar)

**Interfaces:**
- Consumes: tokens da Tarefa 1.
- Produces: mesmas props públicas de hoje (`NavigationDrawerProps`, `NavigationDrawerItemProps`); só muda o estilo.

- [ ] **Step 1: Escrever testes de não regressão** (nomes): `should still call onClick when the item is clicked`, `should still show the active state for the current item`, `should still collapse and expand the drawer`, `should start collapsed between the mobile breakpoint and 1100px while the icon rail stays visible`.
- [ ] **Step 2: Rodar contra o código atual.** Expected: PASS (linha de base).
- [ ] **Step 3: Restilizar** — largura do painel ~390px, fundo `background.primary`, cartão de workspace no topo, itens como cartões arredondados (`border.radius.md`) com espaçamento do kit, estado ativo em `accent.accent2`. Não alterar props, estados nem handlers.
- [ ] **Step 4: Rodar os testes.** Expected: PASS.
- [ ] **Step 5: Commit** — `style(navigation): painel de contexto no estilo do kit`.

### Task 5: Área principal e cabeçalho da página

**Files:**
- Modify: `packages/asturian-front/src/modules/ui/layout/page/components/DefaultLayout.tsx` (fundo `background.secondary`), `PageContainer.tsx`, `PageHeader.tsx`
- Test: `packages/asturian-front/src/modules/ui/layout/page/components/__tests__/PageHeader.test.tsx`

**Interfaces:**
- Consumes: `PageHeaderProps` atual (`title`, `hasClosePageButton`, `onClosePage`, `Icon`, `children`, `className`) — **inalteradas**.
- Produces: nenhum contrato novo.

- [ ] **Step 1: Escrever testes** (nomes): `should render the title`, `should call onClosePage when the close button is clicked`, `should render the page actions passed as children`, `should show the collapse button when the drawer is collapsed on desktop`.
- [ ] **Step 2: Rodar e ver passar na linha de base.**
- [ ] **Step 3: Restilizar** — página em painel branco arredondado sobre `background.secondary`, barra de título com título à esquerda e ações à direita, sem mudar a estrutura de props.
- [ ] **Step 4: Rodar os testes.** Expected: PASS.
- [ ] **Step 5: Commit** — `style(layout): área principal em painel e cabeçalho do kit`.

### Task 6: Dashboard padrão "Início" no servidor

**Files:**
- Modify: `packages/zyra-server/src/engine/workspace-manager/zyra-standard-application/utils/page-layout-widget/compute-my-first-dashboard-widgets.util.ts`
- Modify: `packages/zyra-server/src/engine/workspace-manager/zyra-standard-application/constants/standard-page-layout.constant.ts` (título "Início")
- Test: `.../compute-my-first-dashboard-widgets.util.spec.ts` (novo) e o snapshot existente em `standard-page-layout` (atualizar)

**Interfaces:**
- Consumes: `createStandardPageLayoutWidgetFlatMetadata`, `createFilterConfigs` (já no arquivo), `AggregateOperations`, `WidgetType.GRAPH`, `WidgetType.TASKS`.
- Produces: `computeMyFirstDashboardWidgets(args): FlatPageLayoutWidget[]` com, nesta ordem: KPI **Novos contatos** (count de pessoas com `createdAt` nos últimos 7 dias), KPI **Oportunidades abertas** (count de oportunidades com estágio não fechado), KPI **Tarefas de hoje** (count de tarefas com prazo hoje ou vencidas e não concluídas), gráfico de barras **Funil por etapa** (oportunidades por estágio, soma de valor), widget `TASKS` **Próximos compromissos**.

- [ ] **Step 1: Escrever os testes** (nomes e asserções): `should return the three KPI widgets first, in order`; `should filter new contacts by createdAt in the last 7 days`; `should count only open opportunities`; `should include tasks due today and overdue, excluding done`; `should include the funnel bar chart grouped by stage`; `should include an upcoming tasks widget`; `should not contain a stock-market or placeholder welcome widget`.
- [ ] **Step 2: Rodar e ver falhar** — `npx jest ...compute-my-first-dashboard-widgets.util.spec.ts --config=packages/zyra-server/jest.config.mjs`. Expected: FAIL.
- [ ] **Step 3: Remontar a função** conforme a lista de Produces; o valor total das oportunidades aparece no gráfico do funil (soma por etapa), não num quarto KPI (escolha do desenho). Atualizar o snapshot (`yarn jest -u` só neste arquivo).
- [ ] **Step 4: Rodar e ver passar.** Incluir `should render zero values for an empty workspace` (workspace sem registros devolve os mesmos widgets, sem lançar).
- [ ] **Step 5: Commit** — `feat(server): dashboard Início com KPIs e funil reais`.

### Task 7: Início como primeiro item do menu em workspaces novos

**Files:**
- Modify: `packages/zyra-server/src/engine/workspace-manager/zyra-standard-application/constants/standard-navigation-menu-item.constant.ts` e o util `build-standard-flat-navigation-menu-item-maps.util.ts`
- Test: o spec do util (existente; ampliar) ou novo `standard-navigation-menu-item.constant.spec.ts`

**Interfaces:**
- Consumes: o dashboard "Início" da Tarefa 6.
- Produces: item de menu de topo "Início" apontando para esse dashboard, com a menor posição (primeiro na ordem), antes das pastas Vendas/Produtividade.

- [ ] **Step 1: Escrever o teste** `should place the Início dashboard item before every other top-level item`.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar** o item e a posição; como a página inicial é o primeiro link do menu (`useDefaultHomePagePath`), nenhuma rota nova é necessária.
- [ ] **Step 4: Rodar e ver passar.**
- [ ] **Step 5: Commit** — `feat(server): Início é o primeiro item do menu padrão`.

### Task 8: Comando de workspace para o Horizon

**Files:**
- Create: `packages/zyra-server/src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1810000000000-add-inicio-dashboard.command.ts`
- Modify: `2-16-upgrade-version-command.module.ts` (registrar) e `instance-commands.constant.ts` se o padrão do módulo exigir
- Test: `.../2-16/__tests__/add-inicio-dashboard.command.spec.ts`

**Interfaces:**
- Consumes: o builder de widgets da Tarefa 6 e o do item de menu da Tarefa 7.
- Produces: `@RegisteredWorkspaceCommand('2.16.0', 1810000000000)` que **adiciona** o dashboard "Início" e seu item de menu ao workspace, sem alterar nem apagar o dashboard ou os registros existentes.

- [ ] **Step 1: Escrever os testes**: `should add the Início dashboard when the workspace does not have it`; `should be idempotent when run twice` (segunda execução não cria duplicata); `should not delete or edit existing dashboards`.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar o comando** reutilizando os builders; detectar "já existe" pelo identificador universal do dashboard.
- [ ] **Step 4: Rodar e ver passar.**
- [ ] **Step 5: Commit** — `feat(server): comando que adiciona o dashboard Início a workspaces existentes`.

### Task 9: Preview e verificação

**Files:** nenhum arquivo novo.

**Interfaces:**
- Consumes: Tarefas 1–5 (front) para o preview; Tarefas 6–8 exigem deploy do servidor na VPS (build, `upgrade`, `pm2 restart`).

- [ ] **Step 1: Typecheck e lint do diff** — `npx nx typecheck asturian-front`, `npx nx lint:diff-with-main asturian-front`, o mesmo para `zyra-server`. Expected: sem erros novos.
- [ ] **Step 2: Preview do front** — `vercel deploy --yes --archive=tgz --scope souza-zxs-projects --build-env REACT_APP_SERVER_BASE_URL=https://zyra-api.179-199-135-212.sslip.io` (sem `--prod`). Expected: URL de preview `READY`.
- [ ] **Step 3: Checklist manual no preview** — barra de ícones com um item por pasta; clicar em Vendas abre o painel com Pessoas/Empresas/Oportunidades; busca, favoritos, Configurações e seletor de workspace continuam acessíveis; nenhuma ação sumiu; contraste legível.
- [ ] **Step 4: Servidor** — build na VPS, `node dist/command/command upgrade`, `pm2 restart zyra-server`; abrir o app e confirmar a aba Início com os 3 KPIs reais.
- [ ] **Step 5: Entregar o link do preview ao dono** e aguardar a aprovação antes de qualquer promoção a produção.
