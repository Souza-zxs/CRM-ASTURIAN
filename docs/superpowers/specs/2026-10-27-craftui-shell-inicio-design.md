# Zyra — Casca CRAFTUI e aba Início (projeto 1 de 6)

Data: 2026-10-27 · Idioma base: pt-BR · Status: aguardando aprovação

## Por que

O Zyra hoje é o desenho do Twenty: barra lateral larga e de texto, tabelas
densas, tudo com o mesmo peso visual. O dono acha que o produto está confuso.
Ele entregou um kit de UI (CRAFTUI, PNGs em `Downloads/` — pastas `Ui`,
`Dashboard`, `Contacts`, `Kanban`, `Messages`, `Tasks`, `Calendar`,
`Projects`) e quer que **o estado inicial de quem entra no Zyra seja o do kit**:
um CRM "normal", claro e simples, que o usuário pode personalizar depois.

Ao entrar, a primeira tela deve mostrar **os números reais da operação** do
usuário dentro do Zyra, não dados de demonstração.

## Este documento cobre só o projeto 1

Os seis projetos combinados, na ordem: (1) casca + aba Início, (2) aba
WhatsApp, (3) aba Checkout, (4) aba Anúncios, (5) aba CS, (6) Visão do gestor.
Cada um terá seu próprio desenho. **Este é o 1.** As abas 2–6 aparecem aqui só
como lugares reservados no menu.

## Objetivos

- A casca do app (navegação, cabeçalho, fundo, cartões) segue o kit.
- A primeira tela depois do login é a aba **Início** ("Meu dia"), com 3 KPIs
  reais e, abaixo, o funil e os próximos compromissos.
- Quem entra pela primeira vez enxerga o visual do kit sem configurar nada.
- Tudo o que o Zyra já faz continua funcionando igual.

## Não objetivos

- Nenhuma função nova de CRM: mesmos objetos, views, filtros, permissões,
  workflows, importação, API.
- Não criar objetos, campos ou tabelas novos.
- Não construir as abas WhatsApp, Checkout, Anúncios, CS e Gestor (projetos 2–6).
- Não tocar em Mensagens, Calendário, Kanban, formulários e Configurações
  (etapas posteriores).

## Anti-objetivos (seria fracasso mesmo funcionando)

- Perder uma função, um atalho ou uma permissão que existia.
- Piorar a navegação de quem personalizou o menu (pastas, favoritos).
- Texto ilegível ou contraste abaixo de WCAG AA, alvos de toque abaixo de 44px.
- Mostrar número inventado ou fixo no lugar do dado real.
- Quebrar o mobile (hoje há `MobileNavigationBar`).

## Restrições

- Monorepo Nx; front em `packages/asturian-front`, tema em `packages/zyra-ui`.
- Estilo com Linaria (`styled` de `@linaria/react`) e tokens `themeCssVariables`.
- Apenas componentes funcionais, exports nomeados, sem `any`, componentes < 300
  linhas, nomes sem abreviação (regras do `CLAUDE.md` do repositório).
- i18n com Lingui: textos novos em pt-BR primeiro, depois EN/ES.
- Os valores de tema vivem em `theme-light.css`/`theme-dark.css`; o teste
  `themeAccentColor.test.ts` fixa o acento.
- O deploy do app é manual pelo CLI da Vercel (projeto `workshop-os-app`);
  cada etapa é validada num **preview**, nunca direto em produção.

## O que já está feito (spike aprovado pelo dono)

Tokens do kit aplicados nos dois temas: acento `#5E81F4` (escala de 12 passos),
fundo `#F5F5FA`, texto `#1C1D21`/`#6B6B8A`, bordas frias, sombras suaves,
status em verde/rosa/amarelo/lilás; padrão de esquema de cor passa a `Light`;
fonte Geist (do Thulio) mantida. O dono viu o preview e aprovou ("ficou bom").
Está num branch local, **sem commit**.

## Decisões do dono

- Redesenho completo, em etapas; o kit é o modelo inicial, personalizável depois.
- Só visual: nenhuma funcionalidade muda.
- A tela de entrada é um painel com os números reais da operação.
- Os 3 KPIs da aba Início, confirmados pelo dono: **novos contatos** (últimos
  7 dias, com mini-gráfico), **oportunidades abertas e valor total**, **tarefas
  de hoje** (vencem hoje e atrasadas).
- Abaixo dos KPIs: funil por etapa em barras e lista de próximos compromissos.
- Abas independentes no menu: Início, Vendas, Anúncios, WhatsApp, Checkout, CS,
  Gestor. Nesta etapa só **Início** e **Vendas** têm conteúdo.

## Estrutura da casca (proposta, a validar no preview)

Três faixas, como no kit:

1. **Barra de ícones** (~84px): logo no topo, um ícone por item de nível
   superior do menu, avatar do usuário embaixo. Item ativo com barra azul e
   fundo `#F5F5FA`. Tooltip com o nome.
2. **Painel de contexto** (~390px): nome do workspace com seletor no topo e, em
   cartões arredondados, os itens da seção selecionada (as views/objetos que já
   existem). **Não adiciona métricas novas** — só apresenta a navegação atual.
   Recolhível, como a gaveta de hoje.
3. **Área principal**: painel branco arredondado sobre o fundo `#F5F5FA`, com
   barra de título (botão de recolher, título, busca, ação "novo").

A navegação continua guiada pelos itens de menu que o usuário já tem
(`navigationMenuItem`: pastas, objetos, favoritos). A barra de ícones mostra os
itens de nível superior; escolher uma pasta (Vendas, Produtividade) mostra seus
filhos no painel de contexto. Quem reorganizou o menu vê a própria
organização, com o visual novo.

## Aba Início

- É o **primeiro item do menu** para workspaces novos; a página inicial do app
  já é o primeiro link do menu (`useDefaultHomePagePath`), então nenhuma rota
  nova é necessária.
- É o dashboard padrão ("My First Dashboard"), remontado com widgets que o Zyra
  já tem (agregados/KPI, gráfico de barras, lista de registros), lendo dados ao
  vivo de Pessoas, Oportunidades e Tarefas.
- Cartões de KPI com mini-gráfico, seguindo o `Dashboard/02.png` do kit.
- O dashboard padrão nasce **na criação do workspace** (servidor:
  `compute-my-first-dashboard-widgets.util.ts` e a ordem do menu padrão).
  Workspaces existentes (o Horizon) **não** são reescritos sozinhos: a atualização
  deles é um passo separado, sem apagar dados.

## Escolhas minhas (marcadas para o dono revisar)

- O painel de contexto não mostra métricas; só navegação (evita função nova).
- O mobile mantém a `MobileNavigationBar` atual; a casca de três faixas vale só
  no desktop nesta etapa.
- Tema escuro continua existindo, reentonado no mesmo azul; o claro é o padrão.
- Fonte Geist mantida (o kit usa Lato; trocar de novo traria só ruído).
- Cores de status um pouco mais escuras que as do kit, para manter AA.

## Deixado para quem constrói

- Como mapear exatamente os itens de menu para a barra de ícones (ícone de cada
  item, limite de itens visíveis, o que fazer com muitos itens).
- Componentização, nomes de arquivo, ordem das mudanças.
- Detalhes finos de espaçamento, raios e sombras ao comparar com o kit.
- Se o painel de contexto reusa `NavigationDrawer` ou vira um componente novo.

## Respostas à revisão (escolhas minhas, para o dono conferir)

- **Widgets disponíveis.** O servidor já tem widgets `GRAPH` (gráficos e KPI por
  agregado), `RECORD_TABLE`, `TASKS` e `CALENDAR`. Os KPIs e as listas da aba
  Início usam esses, com filtros de registro (como o dashboard padrão já faz em
  `createFilterConfigs`). **Mini-gráfico (sparkline) dentro do cartão de KPI não
  existe hoje e fica fora desta etapa**: os KPIs saem como número + variação,
  no estilo visual do kit. Se o dono quiser o mini-gráfico, será um passo à
  parte, e só como mudança de apresentação do widget de KPI.
- **"Próximos compromissos"** = tarefas com prazo futuro (widget `TASKS`), não
  eventos de calendário.
- **Workspace existente (Horizon).** Entra neste projeto como passo final:
  **adicionar** um dashboard "Início" novo e colocá-lo como primeiro item do
  menu, **sem substituir nem apagar** o dashboard atual nem qualquer registro.
  Sem esse passo o dono não veria a aba Início nos previews.
- **Abas Anúncios, WhatsApp, Checkout, CS e Gestor** **não são criadas neste
  projeto** (nem escondidas nem vazias): cada uma entra no menu quando o seu
  projeto for entregue. **Vendas** é a pasta que já existe hoje (Pessoas,
  Empresas, Oportunidades), só com o visual novo.
- **Ponto de partida.** O spike de tokens está no worktree `D:\dwt`, branch
  `feat/zyra-ui-craftui-theme`, **sem commit**. O padrão `Light` só vale para
  quem **não tem preferência salva**; quem já escolheu Sistema ou Escuro (como o
  perfil do Horizon) mantém a própria escolha até mudar em Configurações →
  Aparência.
- **Inventário do menu.** Antes de mexer na navegação, quem constrói lista tudo
  o que a gaveta atual expõe (busca, favoritos, abas de IA/chat, Configurações,
  seletor de workspace, ação "novo") e define onde cada item fica na casca nova.
  Nenhum item some.
- **Mobile e tablet.** A casca de três faixas vale acima do breakpoint que o app
  já usa (`MOBILE_VIEWPORT`). Abaixo dele, `MobileNavigationBar` como hoje. Em
  larguras intermediárias, o painel de contexto começa recolhido e a barra de
  ícones continua visível.

## Como validar

- Preview da Vercel a cada etapa, com o link entregue ao dono.
- Tokens: `themeAccentColor.test.ts` atualizado.
- Checagem de que cada tela existente ainda abre e que nenhuma ação sumiu.
- Revisão de contraste e de alvos de toque nas telas tocadas.
