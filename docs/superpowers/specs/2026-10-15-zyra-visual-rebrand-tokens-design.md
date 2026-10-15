# Rebranding visual do Zyra — Etapa 1: tokens globais de tema

Status: aprovado (brainstorm conversacional, 2026-10-15).

## Contexto

O Thulio começou um rebranding visual dos widgets de gráfico (commit `eb67d358`,
`feat(front): rebranding visual dos graficos de barra e linha`): barras mais largas e
arredondadas, grid sólido em vez de tracejado, e hachura diagonal nas barras/área inativas
quando há apenas uma série — inspirado num kit de dashboard baixado do Figma Community
("CRM UI Charts for SaaS Dashboards", autor "Loud").

Pedido do usuário: estender esse rebranding para **todo o produto Zyra** (o visual padrão
committado, não uma marca white-label específica — ver [[debranding_scope]] pro sistema de
white-label existente, que fica fora de escopo aqui). Inclui tanto polimento visual quanto
funcionalidades novas inspiradas no kit (mapa-múndi de clientes, funil de vendas, etc.).

Dado o tamanho do pedido, o trabalho foi decomposto em sub-projetos:

0. ~~Gráficos de barra/linha~~ — feito (Thulio).
1. **Tokens globais de tema** (este spec) — cor de marca, raio de borda, cor secundária.
2. Chrome de card do dashboard (header com botão de abrir, badge de variação) — depende de 1.
3. Widgets novos (mapa-múndi, funil/Sankey, sparkline+badge no KPI, heatmap, gauge, scatter,
   treemap) — ver mapeamento completo no artefato publicado na conversa
   (`zyra-kit-gap-map.html`). Mapa-múndi e funil de vendas são os de maior prioridade pro
   contexto de CRM.
4. Navegação (sidebar/topbar), tabelas/listas de registro, formulários/modais/configurações —
   ainda não mapeados em detalhe.

Fora de escopo em qualquer etapa: `zyra-website` (landing page) — confirmado explicitamente
pelo usuário ("ainda não mexa na landing page, apenas no front do app").

Este spec cobre **só a etapa 1**. As etapas seguintes recebem spec próprio depois que esta for
implementada ("vamos mudando aos poucos").

## Decisões

1. **Alvo é o tema padrão committado**, não o sistema de marca white-label
   (`brands/<slug>/brand.config.json`). Edita-se diretamente
   `packages/zyra-ui/src/theme/constants/Accent{Light,Dark}.ts` e afins — os mesmos arquivos
   que `scripts/select-brand.mjs` normalmente regeneraria para uma marca não-`zyra`, mas aqui a
   intenção é redefinir o que a marca `zyra` (o sentinel "não mexer, já é a fonte da verdade")
   *passa a ser*.
2. **Cor de marca — mecanismo corrigido após investigação**: a ideia original era editar
   `AccentLight.ts`/`AccentDark.ts` (que importam a escala `violet` do `@radix-ui/colors`).
   Investigação mostrou que **isso não teria efeito visual no app**: esses arquivos TS só
   alimentam `ThemeLight.ts`/`ThemeDark.ts`, que por sua vez só é consumido por
   `zyra-website` (mockups de app-preview da landing — fora de escopo). O app real
   (`asturian-front`) importa `zyra-ui/theme-light.css` e `zyra-ui/theme-dark.css` diretamente em
   `packages/asturian-front/src/index.tsx:8-9`, e todo componente lê cor via
   `ThemeContext`/`themeCssVariables`, que resolve os valores das variáveis CSS **computadas do
   DOM** (`ThemeProvider.tsx`, função `computeThemeFromCss`) — ou seja, o valor vivo vem só do
   `.css`. Não existe hoje nenhum passo de build que gere o `.css` a partir do `.ts`, nem teste de
   paridade entre os dois (o comentário nos arquivos citando um "teste de paridade" em
   `src/theme-constants/__tests__` não corresponde a nenhum arquivo real encontrado).
   - **Decisão**: editar diretamente o bloco `--t-accent-*` (18 propriedades: `primary`,
     `secondary`, `tertiary`, `quaternary`, `accent3570`, `accent4060`, `accent1`-`accent12`) em
     `theme-light.css` (linhas 74-91) e `theme-dark.css` (linhas 74-91). **Não tocar**
     `AccentLight.ts`/`AccentDark.ts` nesta etapa — isso ficaria fora do escopo combinado (mudaria
     visualmente a landing page, que o usuário pediu pra não mexer ainda).
   - Escala gerada via OKLCH (mesmo algoritmo de `scripts/select-brand.mjs`, função
     `generateScaleSteps`/`oklchToHex`/`hexToOklch`, linhas ~213-341) a partir do hex semente
     `#6E56CF` (mesmo valor já usado como placeholder em `brands/cliente/brand.config.json`,
     visualmente próximo ao roxo do kit). Valores exatos computados e prontos pra colar estão no
     plano de implementação.
3. **Raio de borda dos cards**: `WidgetCard.tsx` usa `border.radius.md` (10px) hoje — ver uso em
   `WidgetCard.tsx:70-76`; o kit usa cards bem mais arredondados (~20px). Troca para
   `border.radius.xl` (20px — token que já existe em `BorderCommon.ts`, nenhum token novo
   necessário).
4. **Cor secundária (lime) — adiado**: investigação não achou nenhum uso atual de "verde
   genérico = positivo" dentro de `page-layout/widgets` pra trocar por lime. O único uso de verde
   hoje ali é a paleta categórica de séries de gráfico (`createGraphColorRegistry.ts`), que é um
   conceito diferente (cor rotativa por série, não semântica de "positivo") e não deve ser tocado.
   O badge de variação (+/-%) que justificaria essa cor ainda não existe (é item da etapa 2/3).
   Decisão: lime entra junto quando esse badge for construído, não retroativamente agora.
5. **Sem mudança funcional nesta etapa** — só tokens visuais. Novos widgets (etapa 3) e chrome
   de card (etapa 2) ficam para specs seguintes.

## Arquivos afetados

- `packages/zyra-ui/src/theme-constants/theme-light.css` (bloco `--t-accent-*`, linhas 74-91)
- `packages/zyra-ui/src/theme-constants/theme-dark.css` (bloco `--t-accent-*`, linhas 74-91)
- `packages/asturian-front/src/modules/page-layout/widgets/widget-card/components/WidgetCard.tsx`
  (linha 75: troca de `themeCssVariables.border.radius.md` para `.xl`)

**Não afetados nesta etapa** (ver decisões 2 e 4): `AccentLight.ts`, `AccentDark.ts`,
`createGraphColorRegistry.ts`, `BorderCommon.ts` (token `xl` já existe, só reaproveitado).

## Risco principal

A escala "accent" é consumida em muita superfície (botões primários, foco, seleção, links,
destaque de linha). Depois da troca, é preciso passar visualmente pelas telas principais
(dashboard, lista de registros, configurações) — não só pelos gráficos — pra pegar contraste
ruim ou texto ilegível sobre o novo tom, em ambos os temas.

## Em aberto (não bloqueia esta etapa, mas fica registrado)

- Prioridade exata entre os widgets novos da etapa 3 (mapa-múndi já confirmado como prioridade;
  funil de vendas, sparkline+badge no KPI parecem os próximos óbvios; gauge/scatter/treemap/
  heatmap de uso mais raro).
- Auditoria visual do que "não está bonito hoje" fora dos gráficos — usuário ainda não
  especificou quais telas, e isso não foi verificado ao vivo (só por código). Pode precisar subir
  o ambiente de dev e varrer as telas principais num momento futuro.
