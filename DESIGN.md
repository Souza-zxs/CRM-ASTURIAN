# [Nome do Cliente] Website — DESIGN.md

> Sistema visual do site de marketing do [Nome do Cliente]. Destilado de `packages/zyra-website/src/theme/`. Carregado por toda invocação `impeccable` junto com o PRODUCT.md.

## Tema

**Claro por padrão.** Um fundador navegando pelo perfil de um parceiro à luz do dia em um monitor de 14–27 polegadas é a cena padrão. O site até disponibiliza um override `data-scheme="dark"` (veja `css-variables.ts`), mas nenhuma página pública atual adota essa opção. Trate o modo escuro como uma superfície adiada.

## Cor

A paleta é composta por neutros equivalentes a OKLCH no nível das superfícies. Os destaques da marca (azul, rosa, amarelo, verde) estão presentes no sistema de tokens, mas são usados com parcimônia — nenhum deles aparece nas páginas de parceiros.

### Estratégia: Contida

Neutros com tonalidade + um destaque ≤10%. O destaque para as páginas de parceiros é o preto tinta profundo (`var(--color-black-100)`) usado em CTAs e estados de hover. Qualquer coisa além de uma borda fina, um glifo de ícone ou um CTA primário deve questionar se realmente precisa de cor.

### Tokens (de `src/theme/colors.ts` + `css-variables.ts`)

Neutros (os cavalos de batalha):

| Token | Hex (calculado) | Função |
| --- | --- | --- |
| `colors.primary.background[100]` | `#ffffff` | Superfície de página + card |
| `colors.primary.text[100]` | `#1c1c1c` | Títulos, texto primário |
| `colors.primary.text[80]` | `#1c1c1ccc` | Texto de corpo |
| `colors.primary.text[60]` | `#1c1c1c99` | Sobretítulos, meta, legendas |
| `colors.primary.text[40]` | `#1c1c1c66` | Desabilitado / placeholder |
| `colors.primary.text[20]` | `#1c1c1c33` | Separadores sutis |
| `colors.primary.text[10]` | `#1c1c1c1a` | Bordas finas |
| `colors.primary.text[5]` | `#1c1c1c0d` | Preenchimentos sutis (painel de tarifas, chips de habilidade) |
| `colors.primary.border[10]` | `#1c1c1c1a` | Borda padrão |
| `colors.primary.border[20]` | `#1c1c1c33` | Borda em hover |

Paleta invertida (para CTAs escuros):

| Token | Função |
| --- | --- |
| `colors.secondary.background[100]` | Fundo de CTA preenchido (tinta profunda) |
| `colors.secondary.text[100]` | Texto de CTA preenchido (branco) |

Destaques da marca (atualmente ausentes das páginas de parceiros; disponíveis se necessário):

- `colors.accent.blue` — `#4a38f5` / `#8174f8`
- `colors.accent.pink` — `#ed87fc` / `#f3abfd`
- `colors.accent.yellow` — `#feffb7` / `#feffd9`
- `colors.accent.green` — `#89fc9a` / `#b0fdbe`
- `colors.highlight` — mesma matiz do destaque azul

**Não introduza gradientes, desfoques de vidro (glass blur) ou preenchimentos saturados nas páginas de parceiros.** Aqui cor é convicção, não decoração.

## Tipografia

Três famílias, cada uma balanceada por meio de variáveis CSS:

| Família | Var | Uso |
| --- | --- | --- |
| `theme.font.family.serif` | `--font-serif` | Títulos, nomes de parceiros, valores de destaque |
| `theme.font.family.sans` | `--font-sans` | Corpo, prosa, rótulos interativos |
| `theme.font.family.mono` | `--font-mono` | Sobretítulos, meta, rótulos de moeda, numéricos tabulares |
| `theme.font.family.retro` | `--font-retro` | Reservada (não usada nas páginas de parceiros) |

### Contraste de Peso + Tamanho

Pesos: `light: 300`, `regular: 400`, `medium: 500`. Sem bold. A hierarquia é conduzida por escala e contraste de família, nunca apenas por peso.

Escala (`theme.font.size(n)` → `calc(var(--font-base) * n)`, onde `--font-base: 0.25rem` ≈ 4px):

- Display / h1: tamanho 9–12 (36–48px)
- h2 / cabeçalhos de seção: tamanho 7–8 (28–32px)
- h3 / cabeçalhos de card: tamanho 5–6 (20–24px)
- Corpo / prosa: tamanho 4–5 (16–20px)
- Sobretítulo / meta: tamanho 3 (12px) com `letter-spacing: 0.06–0.08em` e `text-transform: uppercase`

Comprimento de linha do corpo: limite em 65–75ch (o `PartnerProfileIntro` existente usa `max-width: 62ch` — mantenha essa ordem de grandeza).

### Contrato de hierarquia

- Um `<h1>` serif em tamanho 9 light se lê como o nome de um parceiro na página de detalhe.
- Um sobretítulo mono acima ou abaixo dele localiza o parceiro (região · cidade · país).
- Um serif tamanho 6 light se lê como um cabeçalho de seção.
- A prosa de corpo é sans regular.
- Valores de moeda são serif (se leem como números de destaque, não como estatísticas).
- Rótulos de moeda e meta são mono.

## Espaçamento & Layout

Unidade base `4px`. O helper de espaçamento `theme.spacing(n)` retorna `n * 4px`. Ritmos comuns nas páginas de parceiros:

- Espaçamento entre seções na página de detalhe: `theme.spacing(10–14)` — espaço generoso, respiro editorial.
- Espaçamento entre elementos dentro de uma seção: `theme.spacing(3–5)`.
- Padding de card: `theme.spacing(6)`.
- Padding horizontal da página: `theme.spacing(4)` no mobile, `theme.spacing(10)` no breakpoint ≥ md.

### Raio

`theme.radius(n)` retorna `n * 2px`. O raio padrão de card é `theme.radius(2)` = 4px. Pílulas usam `999px`. Nada mais arredondado que isso.

### Bordas

As bordas são finas (`1px solid theme.colors.primary.border[10]`). Elas definem arestas discretamente. No hover passam para `border[20]`. Nunca use uma borda grossa como decoração.

## Componentes

### Card (PartnerCard, RatesPanel)

Superfície branca, borda fina, raio de 4px, padding de 24px, sombra suave apenas no hover:

```css
background-color: ${theme.colors.primary.background[100]};
border: 1px solid ${theme.colors.primary.border[10]};
border-radius: ${theme.radius(2)};
padding: ${theme.spacing(6)};

&:hover {
  border-color: ${theme.colors.primary.border[20]};
  box-shadow: 0 12px 32px -16px rgba(0, 0, 0, 0.18);
  transform: translateY(-2px);
}
```

### Chip / Pílula

Arredondada `999px`, borda de 1px, preenchimento de fundo sutil (`primary.text[5]` para pílulas de filtro, transparente para linhas de chips), cor `text[80]`, fonte mono ou sans.

### Button / LinkButton

Vive em `@/design-system/components`. Dois modos de cor: `primary` (preenchimento tinta profunda, texto branco) e `secondary` (preenchimento transparente, texto tinta + borda de 1px). `variant="contained"` é o que as páginas de parceiros usam.

### Avatar

`PartnerAvatar` é uma marca gerada de forma determinística a partir do nome + slug. Usado como fallback quando `profilePictureUrl` está ausente. A foto real o sobrepõe em um círculo de 120px na página de detalhe, e de 56px no card da lista.

## Movimento

- Transições de hover: 250ms, ease-out (curva cubic-bezier em `PartnerCard`: `0.25s ease`).
- Entrada de card: 700ms cubic-bezier `0.22, 1, 0.36, 1` (ease-out-quart), 90ms de stagger por índice.
- Todo movimento respeita `@media (prefers-reduced-motion: reduce)` — as animações param, o translate de hover é desativado.
- **Sem bounce, sem elástico, sem parallax.** Contenção editorial.
  - Exceção registrada: um único objeto com scroll-scrubbed reveal (opacidade/translateY/escala amarrados 1:1 ao progresso do scroll, via GSAP ScrollTrigger `scrub`, o mesmo padrão do `CardsGrid`) **não** é parallax — parallax é múltiplas camadas se movendo em velocidades diferentes. Ver `ProblemVisual` (traço Z) e o dolly de câmera do hero (`HeroDepthScene`) como referência.

## Iconografia

`@tabler/icons-react`, 14–16px em chips de nível de corpo, 18–24px em botões. Sempre `aria-hidden="true"` quando decorativo. Espessura de traço `2` (padrão).

## Padrões de Acessibilidade

- Anel de foco: `outline: 2px solid theme.colors.primary.text[100]; outline-offset: 4px` (já usado no link do card).
- Alvo de toque ≥ 40×40px no mobile.
- `aria-label` em botões só de ícone, `aria-labelledby` em regiões seccionadas.
- Todo `<a target="_blank">` inclui `rel="noopener noreferrer"`.
- A cor nunca é a única portadora de significado. As pílulas de valores monetários carregam tanto um ícone quanto um rótulo de texto.

## Anti-padrões (específicos do projeto)

Além das proibições absolutas compartilhadas do impeccable:

- **Não use as cores de destaque da marca (azul/rosa/amarelo/verde) nas páginas de parceiros** a menos que tenhamos uma razão mais forte do que "para adicionar cor".
- **Sem sombras esqueumórficas em cards.** A sombra de hover é `0 12px 32px -16px rgba(0,0,0,0.18)` — esse é o teto.
- **Sem gradientes em nada.** Incluindo texto, bordas e fundos.
- **Sem barras flutuantes de logos "Confiado por"** nas páginas de parceiros.
