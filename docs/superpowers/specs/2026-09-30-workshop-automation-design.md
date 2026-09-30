# Automação do workshop no Zyra — design

Data: 2026-09-30
Origem: auditoria dos 7 itens do workshop (estado real do código) e decisão do usuário de fechar o que estava parcial.

## Objetivo

Fazer funcionar de ponta a ponta: tráfego → inscrição → WhatsApp → workshop → oferta → follow-up → venda, sem depender de montagem manual de workflows.

## Fora de escopo

- Checkout dentro do produto (a página de vendas continua com link externo `checkoutUrl`).
- Teste A/B de páginas.
- Estrutura e gestão de campanhas de anúncio (o produto entrega o rastreamento, não o gerenciador de anúncios).

## Decomposição

Cada parte tem spec, plano e verificação próprios. Ordem: A, C, B, D, E.

| Parte | Entrega | Depende de |
|---|---|---|
| A. Automações do workshop | Confirmação de inscrição por WhatsApp, lembretes da sessão, follow-up pós-workshop, recuperação de quem não comprou | Motor de workflow e templates de WhatsApp existentes |
| C. CRM | Estágio "Comprou", segmentos inscrito / participante / comprador, UTMs na Person e na Opportunity | Sync do funil existente |
| B. Pagamento | Webhook de compra e reembolso para todas as plataformas | C (estágio "Comprou") |
| D. Meta Conversions API | Envio server-side de Lead e Purchase, captura de fbclid, fbp e fbc | B (evento de compra) |
| E. IA | Base de conhecimento do negócio, qualificação movendo a Opportunity | Agente de WhatsApp existente |

## Parte B — Pagamento (design aprovado)

Um endpoint público `POST /payments/:workspaceId/:provider`. Cada plataforma tem um adaptador que valida a assinatura e converte o payload em um evento normalizado.

Plataformas: Hotmart, Kiwify, Stripe e um adaptador genérico (Zapier, Make ou qualquer outra). Novas plataformas entram como um adaptador novo, sem mexer no núcleo.

Evento normalizado:

- `type`: `purchase` ou `refund`
- `externalId`: id da transação na plataforma, usado para idempotência
- `buyer`: e-mail, telefone, nome
- `product`: nome e id
- `amount`: valor e moeda
- `occurredAt`

Segredos ficam por workspace e por plataforma. Uma tela em Configurações liga e desliga cada plataforma e mostra a URL do webhook para copiar.

Casamento do comprador: primeiro por e-mail, depois por telefone normalizado (mesma normalização do WhatsApp). Sem casamento, cria a Person com origem "Compra direta".

Efeitos:

- `purchase`: Opportunity vai para "Comprou", compra entra na timeline com valor e produto, e o evento fica disponível para a parte D.
- `refund`: Opportunity volta ao estágio anterior e o reembolso é registrado na timeline.
- O mesmo `externalId` processado duas vezes não gera efeito duplicado.

Erros: assinatura inválida devolve 401 e não grava nada. Plataforma desligada devolve 404. Falha ao processar devolve 500 para a plataforma reenviar.

## Parte A — Automações do workshop

Fluxos entregues prontos, criados no motor de workflow existente, ativáveis por workspace:

1. Confirmação de inscrição por template de WhatsApp, disparada quando o lead do funil é criado.
2. Lembretes relativos ao horário da sessão do lead (véspera, uma hora antes, na hora).
3. Follow-up pós-workshop para quem participou e não comprou.
4. Recuperação de quem se inscreveu e não participou.

Cada envio exige template de WhatsApp aprovado. Se não houver, o fluxo fica desativado e a interface diz qual template falta. Detalhes de gatilho e atraso ficam no spec da parte A.

## Parte C — CRM

- Estágio "Comprou" na Opportunity.
- Segmentos derivados: inscrito (lead criado), participante (`attended`), comprador (estágio "Comprou").
- UTMs (`utm_source`, `utm_medium`, `utm_campaign`) copiadas do FunnelLead para a Person e a Opportunity. A auditoria não verificou se isso já acontece; o spec da parte C começa por confirmar.

## Parte D — Meta Conversions API

Envio server-side de Lead e Purchase usando `eventId` igual ao id do lead para deduplicar com o Pixel. Captura de `fbclid`, `fbp` e `fbc` no envio do formulário. Só ativa com token e Pixel ID configurados.

## Parte E — IA

- Base de conhecimento por workspace, injetada nas instruções do agente.
- O resultado de qualificação (`isQualified`, `score`, `stage`) passa a atualizar o estágio da Opportunity, além de ser salvo na conversa.

## Testes

Comportamento, não implementação. Adaptadores de pagamento têm teste com payloads reais de exemplo de cada plataforma, incluindo assinatura inválida e reenvio duplicado. Casamento de comprador e idempotência têm testes próprios.
