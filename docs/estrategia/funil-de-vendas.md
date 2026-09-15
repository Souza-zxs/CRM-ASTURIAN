# Funil de Vendas Completo

Guia/template para estruturar cada página do funil, do primeiro clique até a compra. Preencha cada seção com a copy real antes de montar as páginas — isso vira o briefing final de conteúdo e layout.

Este funil pressupõe formato de workshop evergreen (ver `estrutura-do-workshop.md`): o lead se inscreve, assiste (ao vivo ou gravado) e recebe a oferta no final. Todas as páginas abaixo compõem essa jornada.

## 1. Página de inscrição

**Objetivo único**: converter tráfego pago/orgânico em inscrição (nome + e-mail + WhatsApp). Nada além disso — sem menu de navegação, sem links de saída, sem distração.

**Estrutura recomendada**:

| Bloco | Conteúdo |
|---|---|
| Headline | A promessa central do workshop, na forma de resultado específico ("Como [resultado] em [prazo/condição], mesmo que [objeção comum]") |
| Subheadline | Reforça pra quem é / o que vai aprender, em 1 frase |
| Data/formato | Se for ao vivo: data e hora reais. Se for evergreen (sob demanda): "Assista agora" ou seletor de horário simulado — nunca minta dizendo que é ao vivo se não for |
| Formulário | Nome + e-mail + WhatsApp (com DDI). Cada campo a mais reduz conversão — só peça o que for realmente usado nas automações |
| Bullets do conteúdo | 3-5 bullets do que a pessoa vai aprender, cada um como resultado ("como fazer X" não "sobre X") |
| Prova social | Se existir: número de alunos/resultados, não elogios genéricos |
| CTA | Verbo de ação único, repetido no botão (ex.: "Garantir minha vaga") |

**Meta de conversão**: 30-50% dos cliques (ver `estrutura-de-trafego-pago.md`, seção 4).

**Tracking obrigatório nesta página**: dispara `PageView` no carregamento e `Lead` na submissão confirmada do formulário (Pixel + Conversions API, server-side — ver seção 5 abaixo).

## 2. Página do workshop

**Objetivo único**: manter a pessoa assistindo até o pitch. Zero navegação pra fora.

**Estrutura**:
- Player de vídeo centralizado, sem controles de avanço rápido se o formato exigir sensação de "ao vivo" (evergreen com chat simulado).
- Chat lateral (real ou simulado com timestamps fixos) — ver seção de retenção em `estrutura-do-workshop.md`.
- Contador/indicador de que o conteúdo é por tempo limitado, se essa for a estratégia de escassez.
- Sem menu, sem rodapé com links, sem forma de sair da página sem querer.
- No mobile: player em destaque total, chat pode colapsar em aba.

**Tracking obrigatório**: dispara `ViewContent` quando a pessoa atinge 50% do vídeo assistido (via evento de progresso do player, não só carregamento da página).

## 3. Página de vendas/checkout

**Objetivo único**: converter quem chegou até a oferta. Esta página existe tanto como destino do CTA dentro do workshop quanto como página separada pra remarketing de quem "assistiu, não comprou".

**Estrutura recomendada** (carta de vendas longa, formato padrão de infoproduto):
1. Headline reforçando a transformação (não o produto).
2. Reafirmação de para quem é / para quem não é (qualifica e desqualifica ao mesmo tempo — reduz reembolso).
3. Stack de valor completo (produto + bônus, ver `estrutura-do-workshop.md` seção 4), cada item com nome, descrição e valor percebido.
4. Prova social (depoimentos reais, com resultado específico — nunca inventar).
5. Preço com âncora de valor total vs. preço real.
6. Garantia, explicada sem letra miúda.
7. FAQ — responda objeções reais antes que a pessoa precise perguntar (preço, tempo, nível de experiência necessário, suporte, prazo de acesso).
8. CTA final, repetido pelo menos 3x ao longo da página (topo, meio, fim).
9. Escassez visível (contador real de prazo/vagas, não decorativo).

**Checkout**: integração com o processador de pagamento escolhido (definir plataforma — Stripe, Hotmart, Kiwify, Eduzz, etc.). O checkout deve:
- Capturar o mesmo WhatsApp/e-mail já coletado na inscrição sempre que possível (evita re-digitação e permite casar o registro de compra com o lead existente no CRM).
- Disparar `InitiateCheckout` ao carregar e `Purchase` no webhook de confirmação de pagamento (nunca no clique do botão — só na confirmação real).

**Meta de conversão**: 1-3% do total de inscritos (ver `estrutura-de-trafego-pago.md`, seção 4).

## 4. Páginas de confirmação e redirecionamento

| Página | Quando aparece | Conteúdo mínimo |
|---|---|---|
| **Confirmação de inscrição** | Logo após submeter o formulário de inscrição | "Inscrição confirmada" + instrução do próximo passo (ex.: "confira seu WhatsApp/e-mail") + reforço da data/link de acesso |
| **Obrigado pela compra** | Após pagamento aprovado | Confirmação da compra + próximo passo imediato (onde acessar o produto, quando chega o acesso) + reduz ansiedade pós-compra ("você vai receber um e-mail/WhatsApp em até X minutos com...") |
| **Pagamento recusado/pendente** | Retorno do checkout em caso de falha | Reduz atrito pra tentar de novo: motivo provável + botão direto de volta ao checkout, sem precisar re-preencher tudo |
| **Redirecionamento pós-workshop** | Quem termina de assistir sem comprar na hora | Leva de volta à página de vendas ou a uma página de "última chance" com a oferta ainda visível por um prazo curto |

Essas páginas raramente têm tráfego pago direto, mas são onde a automação (WhatsApp/e-mail, ver `automacao-whatsapp.md`) se conecta ao que a pessoa acabou de fazer — a mensagem que ela recebe em seguida deve bater com o que a página confirmou.

## 5. Jornada completa do lead até a compra

```
Anúncio (tráfego pago)
   │  PageView
   ▼
Página de inscrição ──────────────► [Lead perdido — não converteu]
   │  Lead
   ▼
Confirmação de inscrição → dispara sequência de WhatsApp/e-mail pré-workshop
   │
   ▼
Página do workshop ────────────────► [Assistiu parcialmente, não chegou no pitch]
   │  ViewContent (>50%)
   ▼
Oferta apresentada dentro do workshop
   │
   ▼
Página de vendas/checkout ─────────► [Iniciou checkout, abandonou → remarketing + recuperação WhatsApp]
   │  InitiateCheckout
   ▼
Pagamento confirmado (webhook)
   │  Purchase
   ▼
Página de obrigado → acesso liberado → entra na sequência pós-compra
```

Cada seta de "saída" desse funil é uma etapa do CRM (ver `crm-e-leads.md`) e um gatilho de automação (ver `workshop-automatizado.md` e `automacao-whatsapp.md`) — ninguém deveria sair desse funil sem receber pelo menos uma tentativa de recuperação, exceto quem já comprou.

---

*Cada página acima precisa da copy real preenchida antes de virar briefing de design. Layout e sistema visual seguem os princípios de `DESIGN.md`/`PRODUCT.md` do projeto, adaptados para páginas de conversão (menos editorial, mais foco em CTA único por página).*
