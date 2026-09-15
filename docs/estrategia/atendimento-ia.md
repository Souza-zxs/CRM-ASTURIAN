# Atendimento e Suporte com IA

Guia para configurar a IA que responde dúvidas, qualifica leads e decide quando escalar para atendimento humano — dentro do fluxo do WhatsApp do funil.

## Base técnica no repositório atual

O CRM já tem a peça central pronta: `packages/zyra-server/src/modules/whatsapp-agent/` é um respondedor automático de mensagens de WhatsApp recebidas, já conectado a um modelo de IA (OpenAI). A engine de workflow (`packages/zyra-server/src/modules/workflow/`) também tem uma ação nativa de tipo `ai-agent`, disponível pra usar dentro de qualquer sequência, não só no WhatsApp.

Isso significa que a peça técnica que falta não é "construir um agente de IA do zero" — é **configurar o comportamento** (prompt, base de conhecimento, regras de qualificação e de escalonamento) sobre a infraestrutura que já existe.

## 1. IA treinada com informações do negócio e da oferta

**Base de conhecimento mínima que a IA precisa receber** (via prompt de sistema/contexto, não "treino" de modelo — mais rápido e mais fácil de manter atualizado):
- A promessa central do workshop e pra quem é / não é (ver `estrutura-do-workshop.md`).
- Estrutura da oferta completa: produto principal, bônus, garantia, preço, prazo/escassez (ver `estrutura-do-workshop.md`, seção 4).
- FAQ completo (mesma base da seção de FAQ da página de vendas, `funil-de-vendas.md` seção 3) — a IA deve responder de forma consistente com o que já está escrito na página, nunca inventar uma resposta diferente.
- Tom de voz da marca (mesmo princípio de `PRODUCT.md`/`DESIGN.md` aplicado a texto, não a visual) — a IA deve soar como a mesma pessoa/marca que fala no workshop, não como um bot genérico de suporte.

**Manutenção**: qualquer mudança de preço, prazo ou oferta precisa atualizar essa base de conhecimento no mesmo momento — uma IA respondendo com preço antigo é pior do que não ter IA nenhuma (quebra confiança na hora da compra).

## 2. Respostas automáticas às principais dúvidas

Categorias de dúvida esperadas num funil de workshop (usar como checklist da base de conhecimento):
- Dúvida sobre conteúdo/pra quem é ("isso serve pra mim que sou iniciante?").
- Dúvida sobre logística (quando libera, quanto tempo fica disponível, como acessar).
- Dúvida comercial (preço, forma de pagamento, parcelamento).
- Objeção de confiança ("isso funciona mesmo?", "e se eu não gostar?").
- Problema técnico (não recebeu o link, não conseguiu acessar) — este tipo deve ter prioridade de resposta rápida, é o que mais gera frustração e abandono.

## 3. Qualificação de potenciais clientes

Se o volume justificar (funil com ticket mais alto ou oferta com etapa de venda consultiva), a IA pode, durante a conversa, coletar sinais de qualificação e gravar no CRM (ação de `update-record` na engine de workflow):
- Nível de urgência/intenção declarada ("quando você pretende começar?").
- Orçamento/capacidade de investimento, se a oferta exigir esse filtro.
- Principal objeção identificada na conversa — vira dado valioso pra melhorar a página de vendas e o próprio workshop (`funil-de-vendas.md`, `estrutura-do-workshop.md`), não só pra fechar aquela venda específica.

Esses sinais viram campos no objeto `Inscrição Workshop` (`crm-e-leads.md`) — a qualificação feita pela IA fica visível no histórico do lead, junto com o resto da jornada.

## 4. Encaminhamento para atendimento humano quando necessário

**Critérios de escalonamento** (a IA deve reconhecer e agir, não deixar a pessoa presa num loop de bot):
- Pedido explícito de falar com humano.
- Pergunta fora da base de conhecimento (a IA não deve "chutar" resposta sobre algo que não está na sua base — melhor admitir e escalar).
- Sinal de frustração/reclamação (tom da mensagem, repetição da mesma pergunta sem resposta satisfatória).
- Qualquer menção a reembolso/cancelamento — sempre trata com humano, nunca resolve automaticamente via IA.
- Lead já qualificado como alta intenção de compra em oferta de ticket alto, se a operação preferir fechar essas conversas com uma pessoa real.

**Mecânica de escalonamento**: a ação de IA dentro da engine de workflow pode, ao detectar um desses critérios, disparar uma notificação (e-mail/Slack/o que a operação usar) e marcar o registro do lead no CRM com uma tag/campo "aguardando humano" — a conversa não desaparece, só muda de responsável, e todo o histórico já está no CRM pra quem assumir continuar sem pedir pra pessoa repetir o que já disse.

---

*A peça técnica (`whatsapp-agent` + ação `ai-agent` do workflow) já existe no produto. O trabalho real aqui é escrever e manter a base de conhecimento (seção 1) e definir com precisão os critérios de escalonamento (seção 4) — isso é decisão de negócio, não engenharia.*
