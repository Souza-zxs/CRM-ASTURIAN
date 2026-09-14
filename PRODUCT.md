# Site da Zyra — Contexto de Produto e Marca

> Contexto estratégico para o trabalho de design do site de marketing da Zyra (`packages/zyra-website`). Carregado em toda invocação `impeccable`.

## Registro

**Marca.** O site de marketing é uma superfície pública onde o próprio design faz parte do argumento de credibilidade. Prospects avaliam a Zyra em parte pela forma como o site transmite confiança. O app do produto (`packages/zyra-front`) é uma superfície separada, de registro de produto, governada em outro lugar.

## Público e Propósito

O público primário varia por rota, mas a premissa de trabalho para páginas relacionadas a parceiros é:

- **Quem:** Um tomador de decisão com orçamento (fundador, líder de RevOps ou COO) buscando um parceiro de implementação de CRM. Já está no site da Zyra, avaliando uma shortlist de parceiros.
- **Contexto:** Fazendo uma comparação lado a lado entre 2–5 candidatos em uma única sessão de navegação. Vai gastar de 30 a 90 segundos em cada perfil antes de decidir se agenda uma call.
- **Decisão a ser tomada:** "Este parceiro é credível, do tamanho certo, da especialidade certa e dentro do orçamento? Confio o suficiente para investir 30 minutos numa call de descoberta?"

O que as páginas de parceiro precisam fazer, em ordem de prioridade:
1. Comunicar credibilidade (empresa real, pessoa real, trabalho real).
2. Mostrar sinais de fit rapidamente (habilidades, região, idiomas, expertise de implantação, faixa de orçamento).
3. Dar ao visitante um "próximo passo" confiante (agendar uma call ou validar via LinkedIn) sem pressão.

## Resultado Desejado

O redesign deve fazer `/partners/profile/[slug]` parecer um *perfil cuidadosamente curado de um parceiro de primeira linha*, não um card genérico de template. O visitante deve sair pensando "esta empresa é séria", mesmo que não agende a call nesta sessão.

Especificamente:
- **Confiança acima de densidade de informação.** Um perfil curto e bem diagramado vence um lotado e confuso.
- **Contenção editorial.** Espaço em branco, hierarquia tipográfica deliberada e poucos detalhes bem escolhidos dizem mais do que dezenas de pequenos componentes.
- **Convicção silenciosa.** Sem copy de hype, sem padrões de growth-hack, sem faixas de logos "usado por". O próprio trabalho e a apresentação do parceiro falam por si.

## Personalidade da Marca

**Editorial · Conduzida pelo fundador · Pensada.**

O site se lê como uma publicação independente e cuidadosa, não como uma landing page de SaaS. Títulos com serifa, bastante espaço em branco, ritmo tipográfico deliberado. Discretamente opinativa — a Zyra tem um ponto de vista sobre CRM (customizável e bem desenhado) e o site reflete isso sem gritar.

Âncoras de tom:
- A documentação da Stripe pela clareza, o marketing da Linear pela contenção, uma revista editorial impressa pelas escolhas tipográficas.

## Antirreferências

**Rejeite estes padrões. Eles fazem o trabalho parecer IA genérica / SaaS genérico:**

- **Landing de SaaS genérica.** Heros com números gigantes, cards de grade de ícones idênticos, texto com gradiente, esquemas de cor navy + lima, linguagem do tipo "turbine seu fluxo de trabalho".
- **Tom corporativo enterprise.** Fotos de banco de imagens com apertos de mão diversos. Faixas de logos "usado pela Fortune 500" como principal recurso de credibilidade. Barras de selos de confiança.
- **Templates bento.** Cards repetitivos do mesmo tamanho. Animações de scroll-pin estilo Vercel em toda seção.
- **Bordas com faixa lateral, texto com gradiente, glassmorphism, templates de hero-métrica, grades de cards idênticos** — ver as proibições absolutas compartilhadas do impeccable.

## Princípios Estratégicos de Design

1. **A tipografia carrega o design.** A marca tem um trio serifa/sans/mono. A hierarquia é definida por contraste de escala + peso, não por cor ou bordas.
2. **Paleta contida.** Neutros tingidos (preto/branco via variáveis CSS, com variantes de alfa-tom para texto e bordas) carregam 90%+ da superfície. Cor de destaque usada com parcimônia, quando aparece.
3. **Espaço em branco é um recurso.** Cards apertados parecem baratos. As páginas devem respirar.
4. **Assimetria acima de grade.** Um bento de 12 colunas é a forma errada para uma página de perfil. Use layouts assimétricos de duas colunas, onde uma coluna faz o trabalho pesado.
5. **Um detalhe opinativo por página.** Cada superfície deve ter um momento de convicção editorial (um floreio tipográfico, uma microinteração precisa, um espaço deliberado) em vez de cinco floreios genéricos.

## Acessibilidade

**Baseline WCAG AA + teclado + leitor de tela:**

- Todos os elementos interativos alcançáveis por teclado, foco visível (`outline: 2px solid`, não apenas mudança de cor).
- Landmarks semânticos: `<header>`, `<main>`, `<nav>`, `<section aria-labelledby=…>`, headings em ordem.
- Todas as imagens com conteúdo informativo têm alt text. Ícones decorativos têm `aria-hidden="true"`.
- Texto de corpo ≥ 4.5:1 de contraste; texto grande (≥18pt ou 14pt bold) ≥ 3:1.
- Respeitar `prefers-reduced-motion`. As animações param, não desaceleram.
- Formulários têm labels explícitos. Erros são anunciados.

## Tecnologia e Restrições

- Next.js 16 app router (Server Components por padrão, `'use client'` para interatividade).
- Linaria styled-components (`@linaria/react`) para CSS-in-JS zero-runtime.
- Lingui (`@lingui/react`) para i18n; nunca hardcode strings visíveis ao usuário.
- Tokens de tema em `packages/zyra-website/src/theme/`. Cores são variáveis CSS resolvidas para neutros tingidos em OKLCH.
- `@tabler/icons-react` para iconografia (sem Heroicons, sem SVGs customizados a não ser que sejam propositais).
- `@radix-ui/react-*` para primitivos (Popover etc.) onde comportamento headless é necessário.

## Fora do Escopo deste Arquivo

- Tokens visuais detalhados (cores, escala de tipo, specs de movimento) ficam no `DESIGN.md`.
- Decisões de IA por página ficam nos briefs de shape (`docs/superpowers/specs/`).
