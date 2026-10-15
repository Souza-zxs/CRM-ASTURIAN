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
2. **Cor de marca**: `AccentLight.ts`/`AccentDark.ts` hoje importam a escala `violet` do
   `@radix-ui/colors` — ou seja, o matiz já é roxo/violeta, só não é tão vívido/saturado quanto
   o roxo do kit. Troca-se para uma escala de 12 tons **gerada via OKLCH** a partir de um hex
   semente, reaproveitando o algoritmo que `scripts/select-brand.mjs` já implementa para o modo
   `"generated"` (função `generateScaleSteps`/`oklchToHex`, linhas ~255-417) — não se reescreve a
   lógica, só se gera a escala com o hex certo e cola-se o resultado (literais `color(display-p3
   ...)`, mesmo formato que os arquivos já usam) nos arquivos committados.
   - Hex semente de trabalho: `#6E56CF` (já usado como placeholder em
     `brands/cliente/brand.config.json`, visualmente próximo ao roxo do kit nas imagens
     revisadas). Pode ser refinado depois se o usuário conseguir uma amostra exata do Figma
     (precisa estar com o arquivo aberto no app desktop — a ponte MCP não lê variáveis sem uma
     camada selecionada ao vivo).
   - Luz e escuro precisam ser gerados juntos e manter o teste de paridade
     (`src/theme-constants/__tests__`) passando.
3. **Raio de borda dos cards**: `WidgetCard.tsx` usa `border.radius.md` (10px) hoje; o kit usa
   cards bem mais arredondados (~20px). Troca para `border.radius.xl` (20px — token que já
   existe em `BorderCommon.ts`, nenhum token novo necessário).
4. **Cor secundária (lime)**: a escala lime do Radix já existe inteira no sistema
   (`SECONDARY_COLORS_LIGHT.lime1-12` / `SECONDARY_COLORS_DARK`), hoje só usada em tags. Passa a
   ser a cor de destaque "positivo/secundário" nos lugares onde hoje se usa verde genérico
   (ex.: indicadores de crescimento) — reaproveitamento de token existente, sem criar nada novo.
5. **Sem mudança funcional nesta etapa** — só tokens visuais. Novos widgets (etapa 3) e chrome
   de card (etapa 2) ficam para specs seguintes.

## Arquivos afetados (esperado)

- `packages/zyra-ui/src/theme/constants/AccentLight.ts`
- `packages/zyra-ui/src/theme/constants/AccentDark.ts`
- `packages/zyra-ui/src/theme/constants/BorderCommon.ts` (se necessário — provavelmente só
  reaproveitar `xl` já existente, sem editar)
- `packages/asturian-front/src/modules/page-layout/widgets/widget-card/components/WidgetCard.tsx`
  (troca de `radius.md` para `radius.xl`)
- `packages/zyra-ui/src/theme-constants/theme-light.css` / `theme-dark.css` (mirror — há um
  teste de paridade que provavelmente falha se só um lado for editado manualmente; checar como
  esses CSS são gerados/sincronizados antes de editar à mão)
- Pontos de uso de verde-como-positivo a localizar e trocar para lime (escopo exato a mapear na
  fase de implementação — não é uma lista fechada ainda)

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
