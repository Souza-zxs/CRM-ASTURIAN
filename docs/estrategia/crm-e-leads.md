# CRM Completo (Organização de Leads)

Guia para configurar o CRM como o hub central do funil do workshop — todo lead, em qualquer etapa, deve estar rastreável aqui. Este documento define a estrutura de dados e etapas; a configuração real (criação de objetos/campos) é feita dentro do próprio CRM, sem precisar de deploy (arquitetura orientada a metadados).

## Base técnica no repositório atual

O CRM já é orientado a metadados: objetos, campos e etapas de pipeline (`stage`) são configuráveis dentro do produto, sem alteração de código — o objeto padrão `Opportunity` já usa um campo `stage` desse tipo para pipeline Kanban. Isso significa que o pipeline de leads do workshop pode ser modelado como um **objeto customizado próprio** (ex.: "Inscrição de Workshop"), com um campo de etapa dedicado, em vez de forçar o funil dentro do objeto de Oportunidades — mantém o significado de "oportunidade de venda" intacto para outros usos do CRM e dá um campo de etapa com o vocabulário certo (Inscrito, Assistiu, etc., em vez de etapas genéricas de venda).

## 1. Organização automática dos leads

**Objeto recomendado**: criar um objeto customizado `Inscrição Workshop` (ou nome equivalente), com relação para o objeto padrão `Pessoa` (contato) — assim o histórico de e-mail/WhatsApp da pessoa já existente no CRM fica automaticamente ligado à inscrição, sem duplicar cadastro.

**Campos mínimos**:

| Campo | Tipo | Uso |
|---|---|---|
| Etapa | Seleção (pipeline) | Ver seção 2 |
| Origem | Seleção/texto | De qual campanha/anúncio veio (bate com UTM da inscrição) |
| Data de inscrição | Data | Timestamp de quando entrou no funil |
| Assistiu (%) | Número | Progresso no workshop, alimentado pelo evento `ViewContent` |
| Data da compra | Data | Preenchido só quando `Purchase` confirma |
| Valor da compra | Moeda | Ticket pago, se houver upsell/variação de oferta |
| WhatsApp opt-in | Booleano | Confirmação de consentimento pra automação de WhatsApp (ver `automacao-whatsapp.md`) |

**Criação automática do registro**: toda inscrição na página de inscrição (`funil-de-vendas.md`, seção 1) deve criar este registro via webhook/API no momento da submissão — nunca importação manual/em lote, que gera atraso e quebra a automação em tempo real.

## 2. Etapas personalizadas do funil

Etapas recomendadas (na ordem do pipeline), espelhando a tabela de eventos de `ecossistema-integrado.md` seção 3:

```
Inscrito → Confirmado (WhatsApp/e-mail validado) → Assistiu → Chegou na oferta
   → Iniciou checkout → Comprador
                      ↘ Não comprou (inativo) → Recuperado (se voltar a comprar depois)
```

- Cada mudança de etapa deve ser automática (disparada por evento, não movida manualmente por alguém olhando o funil) — ver `workshop-automatizado.md` para os gatilhos técnicos.
- Etapas "mortas" (Não comprou / Inativo) não devem ser tratadas como lixeira — são a lista-fonte do follow-up de recuperação (`workshop-automatizado.md`, `automacao-whatsapp.md`).
- Views recomendadas no CRM: uma view Kanban por etapa (visão geral do funil, gargalo visível de cima a baixo) e uma view em tabela filtrada por "Comprador" (visão de receita).

## 3. Identificação de inscritos, participantes e compradores

Regra: a etapa no CRM **é** a identificação — nunca manter essa distinção só na cabeça de quem opera ou em planilha paralela. Três segmentos vivos, sempre derivados da etapa atual:

- **Inscritos**: etapa ≥ "Inscrito", qualquer momento do funil.
- **Participantes**: etapa ≥ "Assistiu" (campo "Assistiu (%)" > limiar definido, ex. 50%).
- **Compradores**: etapa = "Comprador".

Esses três segmentos são a base de qualquer lista usada em remarketing pago (`estrutura-de-trafego-pago.md`, exclusão de compradores) e em disparo de WhatsApp/e-mail (`automacao-whatsapp.md`) — nunca construir essas listas direto na ferramenta de anúncios ou de disparo; sempre a partir do CRM, que é a fonte única de verdade.

## 4. Histórico e acompanhamento de cada lead

Cada registro de `Inscrição Workshop` deve mostrar, numa timeline única (recurso nativo de timeline/atividades do CRM):
- Todas as mensagens de WhatsApp/e-mail trocadas (automáticas e manuais).
- Todas as mudanças de etapa, com timestamp.
- Eventos de tracking relevantes (assistiu X%, iniciou checkout).
- Qualquer nota manual de quem estiver operando (ex.: resposta de suporte via IA escalada para humano, ver `atendimento-ia.md`).

**Teste de suficiência**: qualquer pessoa da operação deve conseguir abrir o registro de um lead e responder, sem perguntar pra ninguém, "o que já foi enviado pra essa pessoa e por quê ela ainda não comprou" — se essa pergunta exige checar outra ferramenta, falta integração (ver `ecossistema-integrado.md`, seção 2).

---

*A estrutura de objeto/campos/etapas acima é configurada dentro do próprio CRM (sem deploy). O que precisa de trabalho de engenharia é a automação que escreve nesses campos a partir de cada evento do funil — isso é o assunto de `workshop-automatizado.md`.*
