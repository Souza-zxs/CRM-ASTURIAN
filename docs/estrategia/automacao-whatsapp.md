# Automação Oficial do WhatsApp

Guia para configurar o canal de WhatsApp (API oficial da Meta) como parte das sequências do funil — confirmação, lembretes, recuperação e pós-workshop.

## Base técnica no repositório atual

O CRM já integra com a **API oficial do WhatsApp (Meta Cloud API)** — não é biblioteca não-oficial nem gambiarra de automação via app pessoal:

- `packages/zyra-server/src/modules/whatsapp/` — conexão via fluxo OAuth de Embedded Signup da Meta e envio de mensagens de **texto livre** através da Graph API.
- `packages/zyra-server/src/modules/whatsapp-webhooks/` — recebimento de mensagens inbound (webhook assinado/verificado).
- `packages/zyra-server/src/modules/whatsapp-agent/` — respondedor automático já ligado a um modelo de IA (OpenAI) para qualificar/responder mensagens recebidas (base direta para `atendimento-ia.md`).

**Lacuna importante, já sinalizada no próprio código**: o envio hoje só suporta **mensagem de texto livre**, válida apenas dentro da janela de 24h de atendimento ao cliente (a pessoa precisa ter escrito nas últimas 24h). **Mensagens de template pré-aprovadas pela Meta — obrigatórias pra iniciar conversa fora dessa janela — ainda não estão implementadas.**

Isso é um bloqueio técnico real para boa parte deste funil: qualquer lembrete disparado horas/dias depois da inscrição (sem a pessoa ter respondido nada) precisa de template aprovado, não de texto livre. **Antes de configurar as sequências abaixo em produção, esse suporte a templates precisa ser desenvolvido** — é o primeiro item de trabalho técnico gerado por este documento, fora do escopo de "só configuração".

## 1. Integração com a API oficial do WhatsApp

- Conexão do número de WhatsApp Business ao CRM via Embedded Signup (fluxo já existente no produto) — sem depender de número pessoal ou ferramenta terceira de disparo em massa (que viola os termos da Meta e arrisca banimento do número).
- Registrar e submeter à aprovação da Meta os templates necessários para cada mensagem fora da janela de 24h (ver seção 5 — lista de templates a criar).
- Confirmar que o número está com qualidade "verde"/alta antes de escalar volume — números novos devem aquecer gradualmente (poucas mensagens por dia, crescendo), não começar disparando pra toda a base de uma vez.

## 2. Confirmação de inscrição

- Disparo: imediatamente após o evento de inscrição criar o registro no CRM (ver `crm-e-leads.md`).
- Dentro da janela de 24h na maioria dos casos (mensagem imediata) — pode usar texto livre já hoje, sem depender do suporte a template.
- Conteúdo: confirma a inscrição + entrega o link de acesso + reforça data/formato.

## 3. Lembretes automáticos

- Disparo: N horas/dias antes do horário da "sessão" da pessoa (ver `workshop-automatizado.md`, seção 1).
- **Precisa de template aprovado** na maioria dos casos, pois normalmente ultrapassa a janela de 24h desde a inscrição.
- Conteúdo: reforço de valor + urgência de horário, nunca repetir a mensagem de confirmação ipsis litteris.

## 4. Recuperação de leads

- Disparo: sequência de follow-up de quem não comprou (ver `workshop-automatizado.md`, seção 4).
- Mistura texto livre (se a pessoa respondeu algo recentemente) e template (se não há interação recente) — a automação precisa checar a última interação antes de decidir qual tipo de mensagem enviar, ou simplesmente sempre usar template pra esses disparos programados (mais simples e mais robusto do que checar janela dinamicamente).
- Cada mensagem da sequência é um template diferente (ângulos diferentes de objeção, ver `workshop-automatizado.md`) — a Meta não permite reaproveitar o mesmo template pra conteúdos diferentes, cada variação de texto precisa de aprovação própria.

## 5. Follow-ups e mensagens pós-workshop

- Confirmação de compra + instruções de acesso: dentro da janela de 24h na maioria dos casos (segue direto da interação de compra).
- Sequência de reativação de quem não assistiu: templates, mesma lógica da seção 3-4.

**Lista mínima de templates a submeter para aprovação da Meta** (nomes sugeridos, ajustar à voz da marca):
1. `confirmacao_inscricao` (fallback caso o disparo imediato escape da janela de 24h por algum atraso)
2. `lembrete_sessao`
3. `sessao_liberando`
4. `recuperacao_nao_comprou_1`, `recuperacao_nao_comprou_2`, `recuperacao_nao_comprou_3` (um por ângulo de objeção)
5. `reativacao_nao_assistiu`
6. `oferta_encerrando`

Templates de utilidade/marketing têm regras de aprovação diferentes na Meta (marketing tem restrições mais rígidas de opt-in) — confirmar a categoria correta de cada um no momento da submissão.

## 6. Consentimento (opt-in)

- O campo `WhatsApp opt-in` do CRM (`crm-e-leads.md`, seção 1) precisa ser verdadeiro antes de qualquer disparo fora da janela de 24h — a página de inscrição deve deixar claro que a pessoa receberá mensagens de WhatsApp sobre o workshop (checkbox ou texto de consentimento explícito), não só coletar o número.
- Qualquer pedido de opt-out ("pare", "sair", etc.) recebido via webhook inbound deve automaticamente marcar o registro como opt-out e encerrar a sequência — a engine de workflow (gatilho de mensagem recebida + condição de texto + `update-record`) cobre isso sem trabalho manual.

---

*Resumo do que falta construir antes de ligar este canal em produção: suporte a envio de mensagens de template (hoje só texto livre existe), e a submissão/aprovação dos templates listados na seção 5 junto à Meta. O restante é configuração das sequências sobre a infraestrutura de workflow já existente (`workshop-automatizado.md`).*
