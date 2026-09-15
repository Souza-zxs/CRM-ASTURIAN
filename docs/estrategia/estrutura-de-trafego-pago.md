# Estrutura de Tráfego Pago (Bônus)

Guia para estruturar as campanhas pagas que alimentam o funil de inscrição do workshop. Foco em Meta Ads (Instagram/Facebook), já que é o canal mais comum para esse tipo de funil — os princípios se aplicam a outras plataformas com ajustes.

## 1. Estrutura das campanhas

**Estrutura de conta recomendada** (CBO — Campaign Budget Optimization):

```
Campanha: [Oferta] — Aquisição de Leads
├── Conjunto 1: Frio — Interesses amplos
├── Conjunto 2: Frio — Lookalike 1% (compradores, se já existir base)
├── Conjunto 3: Frio — Lookalike 1% (leads/inscritos, se já existir base)
└── Conjunto 4: Frio — Advantage+ Audience (deixa a Meta otimizar sem restrição de interesse)

Campanha: [Oferta] — Remarketing (funil quente)
├── Conjunto 1: Visitou a página de inscrição, não se inscreveu (7 dias)
├── Conjunto 2: Inscreveu-se, não assistiu (3 dias)
├── Conjunto 3: Assistiu, não comprou (7 dias)
└── Conjunto 4: Iniciou checkout, não comprou (3 dias) — maior prioridade de orçamento
```

- **Objetivo de campanha**: Leads (otimizado pro evento de conversão "Lead"/inscrição) para a campanha fria; Vendas (otimizado pro evento "Purchase") para o remarketing, sempre que houver volume de dados suficiente (a partir de ~50 conversões/semana o algoritmo otimiza melhor por resultado final do que por lead).
- **Orçamento inicial**: comece com verba diária fixa por conjunto (não CBO) até ter dados de qual público performa melhor; migre pra CBO/Advantage+ depois de identificar os 2-3 melhores públicos.
- **Teste**: nunca coloque mais de 1 variável nova por conjunto de teste (ou testa público, ou testa criativo, não os dois ao mesmo tempo) — senão não dá pra saber o que funcionou.

## 2. Configuração de públicos e remarketing

**Públicos frios** (quem nunca ouviu falar de você):
- Interesses relacionados ao problema que o workshop resolve (não ao seu nicho — pense em "o que essa pessoa busca no Google quando tem esse problema", não "quem se interessa por marketing digital").
- Lookalikes de 1% construídos a partir de: compradores > inscritos que assistiram >75% > todos os inscritos, nessa ordem de prioridade se tiver mais de uma base.
- Advantage+ Audience como conjunto separado sempre — costuma superar interesses manuais depois de ~1-2 semanas de aprendizado.

**Públicos de remarketing** (a parte que geralmente mais converte, por real menor):
- Pixel/Conversions API disparando estes eventos ao longo do funil (ver seção 4): `PageView` (página de inscrição), `Lead` (inscrição confirmada), `ViewContent` (assistiu ao menos 50% do workshop), `InitiateCheckout` (chegou na página de oferta/checkout), `Purchase` (comprou).
- Janelas de remarketing curtas (3-7 dias) — quem não converteu em uma semana de um funil de webinar geralmente não vai converter por lembrete, só por nova oferta/gatilho.
- **Exclusão obrigatória**: excluir compradores de TODAS as campanhas ativas (frias e remarketing) — evita desperdiçar verba mostrando anúncio pra quem já comprou.
- **Sequência de mensagem no remarketing**: quem não se inscreveu → reforça a promessa/prova social; quem se inscreveu e não assistiu → lembrete + FOMO do conteúdo; quem assistiu e não comprou → objeção específica + prova de resultado + urgência de prazo.

## 3. Estratégia de criativos

- **Formato**: vídeo nativo (gravado em celular, não produção estúdio) tende a converter melhor pra oferta de infoproduto/workshop — parece conteúdo, não anúncio.
- **Gancho nos primeiros 3 segundos**: sem gancho visual/verbal forte no início, o resto do criativo não importa. Teste ganchos como: pergunta direta à dor, afirmação contra-intuitiva, ou um resultado mostrado primeiro ("antes/depois").
- **Ângulos de criativo a testar** (rode pelo menos 3-4 ângulos diferentes por vez, não 1 só):
  1. Prova social/resultado de aluno.
  2. Autoridade/bastidores de como você descobriu o método.
  3. Quebra de mito ("por que [solução comum] não funciona").
  4. Convite direto e simples ao workshop gratuito (baixo atrito, funciona bem pra público frio de interesses amplos).
- **Copy do anúncio**: primeira linha tem que funcionar sozinha (é o que aparece antes do "ver mais") — repita ali o gancho do vídeo, não introduza informação nova.
- **Cadência de renovação**: monitore frequência (Ads Manager) — acima de 3-4 costuma indicar fadiga de criativo pro público frio; renove o criativo, não só o público.

## 4. Acompanhamento e otimização para geração de leads e vendas

**Métricas por estágio do funil** (acompanhe nesta ordem, de cima pra baixo — o gargalo geralmente está no primeiro estágio com número ruim):

| Estágio | Métrica | Referência inicial* |
|---|---|---|
| Anúncio → Clique | CTR (link click-through rate) | acima de 1% já é saudável pra vídeo |
| Clique → Inscrição | Taxa de conversão da página de inscrição | 30-50% é uma boa página |
| Inscrição → Assistiu | Taxa de comparecimento (live/replay) | 20-40% é comum em evergreen |
| Assistiu → Chegou na oferta | Retenção até o pitch | acima de 50% dos que assistiram >10min |
| Oferta → Compra | Taxa de conversão do checkout | 1-3% do total de inscritos é uma faixa comum de mercado |

*Esses números variam MUITO por nicho/preço/oferta — trate como ponto de partida pra saber onde investigar, não como meta fixa.

**Rotina de otimização**:
- **Diária** (primeiros 7-14 dias de uma campanha nova): CPL (custo por lead) por conjunto de anúncio, pausar o que estiver 2x+ acima da média dos outros conjuntos.
- **Semanal**: CAC (custo de aquisição de cliente = gasto total ÷ vendas) vs. o preço da oferta — se CAC > 30-40% do ticket, revisar público/criativo antes de escalar verba.
- **Ao escalar**: aumente o orçamento em incrementos de 20-30% a cada 2-3 dias (não dobre de uma vez) — evita resetar o aprendizado do algoritmo.
- **Tracking necessário no lado do produto** (ver `docs/estrategia/`, não é responsabilidade só do gestor de tráfego): Pixel + Conversions API (server-side) disparando os 5 eventos da seção 2 a partir das páginas do funil e do webhook de pagamento confirmado — sem isso, a otimização do algoritmo de anúncios fica cega para o que realmente importa (vendas), não só cliques.

---

*Este documento assume Meta Ads como canal principal. Para Google Ads/TikTok Ads, a lógica de funil (frio → remarketing → exclusão de compradores) se mantém, mas os formatos de público/criativo mudam — peça uma versão adaptada quando for expandir de canal.*
