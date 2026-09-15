# Ecossistema Integrado

Visão de como todas as peças do sistema (tráfego, funil, WhatsApp, workshop, CRM, IA) se conectam para funcionar como um fluxo praticamente automático, do primeiro clique até a venda e o pós-venda. Este documento é o mapa geral — os detalhes de cada peça estão nos outros documentos desta pasta.

## 1. O fluxo completo

```
1. TRÁFEGO PAGO ──────► docs/estrategia/estrutura-de-trafego-pago.md
      │
      │  clique no anúncio
      ▼
2. INSCRIÇÃO ──────────► docs/estrategia/funil-de-vendas.md (seção 1)
      │
      │  Lead criado no CRM (docs/estrategia/crm-e-leads.md)
      │  dispara sequência de WhatsApp/e-mail pré-workshop
      ▼
3. WHATSAPP (antes) ───► docs/estrategia/automacao-whatsapp.md (seção "antes")
      │
      │  confirmação + lembretes
      ▼
4. WORKSHOP ────────────► docs/estrategia/estrutura-do-workshop.md
      │                   docs/estrategia/workshop-automatizado.md
      │
      │  assistiu / não assistiu → muda etapa no CRM
      ▼
5. OFERTA (dentro do workshop) ► docs/estrategia/funil-de-vendas.md (seção 3)
      │
      ├──► COMPROU ──► WhatsApp/e-mail pós-compra ──► onboarding do produto
      │
      └──► NÃO COMPROU ──► docs/estrategia/workshop-automatizado.md (follow-up)
                            docs/estrategia/automacao-whatsapp.md (recuperação)
                            remarketing pago (estrutura-de-trafego-pago.md)

Em paralelo, a qualquer momento do fluxo:
   IA DE ATENDIMENTO ──► docs/estrategia/atendimento-ia.md
   (responde dúvidas, qualifica, recupera lead parado, escala pra humano)

Em paralelo, o tempo todo:
   CRM ──► docs/estrategia/crm-e-leads.md
   (registra cada evento acima, é a fonte única de verdade sobre onde cada lead está)
```

## 2. Princípio de integração

**O CRM é o hub, não uma peça a mais.** Toda página do funil, toda automação de WhatsApp, todo evento de workshop e toda conversa da IA escreve no mesmo lugar — o CRM. Isso evita o problema mais comum desse tipo de sistema: cada ferramenta (página de vendas, disparo de WhatsApp, checkout, IA) guardando sua própria versão fragmentada do lead, sem ninguém enxergando a jornada completa.

Regra prática: **nenhuma ferramenta do ecossistema deve ser a única fonte de verdade sobre um lead** — todas escrevem no CRM via webhook/API, e o CRM é o lugar onde se responde "em que pé está o Fulano?".

## 3. Eventos que amarram o sistema

Estes são os eventos que atravessam todas as peças — cada um deve, ao acontecer, (a) atualizar a etapa do lead no CRM e (b) disparar a automação de WhatsApp/e-mail correspondente, e opcionalmente (c) alimentar o pixel de tráfego pago:

| Evento | Onde acontece | Atualiza no CRM | Dispara |
|---|---|---|---|
| Inscrição confirmada | Página de inscrição | Cria lead, etapa "Inscrito" | Sequência pré-workshop |
| Assistiu >50% | Página do workshop | Etapa "Assistiu" | — |
| Iniciou checkout | Página de vendas | Etapa "Iniciou checkout" | Recuperação de checkout |
| Compra aprovada | Webhook do pagamento | Etapa "Comprador" | Sequência pós-compra, onboarding |
| Sem atividade X dias | Regra de tempo (CRM/automação) | Etapa "Inativo" | Follow-up de reativação |

Esta tabela é a espinha dorsal técnica do ecossistema — cada linha vira, na prática, um gatilho de automação (ver `workshop-automatizado.md`) e uma etapa de pipeline (ver `crm-e-leads.md`).

## 4. Por que nessa ordem de construção

A ordem recomendada de implementação não é a ordem de leitura dos documentos — é esta:

1. **CRM primeiro** (`crm-e-leads.md`) — sem etapas de pipeline definidas, não há onde as outras peças escreverem.
2. **Funil de páginas** (`funil-de-vendas.md`) — a fonte dos eventos que alimentam tudo.
3. **WhatsApp** (`automacao-whatsapp.md`) — depende do CRM (pra saber quem está em qual etapa) e do funil (pra saber quando disparar).
4. **Automação do workshop** (`workshop-automatizado.md`) — amarra funil + CRM + WhatsApp em sequências temporizadas.
5. **Tráfego pago** (`estrutura-de-trafego-pago.md`) — só escala com o funil e o tracking (pixel/CAPI) já funcionando ponta a ponta; ligar tráfego antes disso queima verba sem dados confiáveis.
6. **IA de atendimento** (`atendimento-ia.md`) — última peça porque depende de todo o resto existir pra ter contexto real (oferta, FAQ, estado do lead no CRM) pra responder bem.

**Não pule pra IA ou pra tráfego pago antes das etapas 1-4 estarem funcionando manualmente ao menos uma vez.** Automatizar um processo quebrado só quebra mais rápido e em maior escala.

## 5. Sinal de que o ecossistema está funcionando

O teste real não é "todas as ferramentas estão conectadas" — é: **um lead novo consegue passar do anúncio até a compra (ou até um follow-up de recuperação) sem nenhuma ação manual**, e a qualquer momento é possível abrir o CRM e responder, pra qualquer lead individual, "onde essa pessoa está agora e o que já foi disparado pra ela".

---

*Este documento deve ser revisado sempre que uma peça do ecossistema mudar de ferramenta (ex.: trocar de processador de pagamento, trocar de provedor de WhatsApp) — a tabela da seção 3 é o contrato entre as peças e precisa continuar válida.*
