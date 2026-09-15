# Workshop 100% Automatizado

Guia para configurar o workshop como um evento evergreen — a pessoa se inscreve a qualquer momento, assiste, recebe a oferta e entra em sequências de acompanhamento, tudo sem intervenção manual.

## Base técnica no repositório atual

O CRM já traz uma engine de automação completa (`packages/zyra-server/src/modules/workflow/`), herdada da base do CRM, com:
- **Gatilhos**: evento de banco de dados (registro criado/atualizado/apagado — ex.: mudança de etapa no objeto `Inscrição Workshop`), agendamento (`CRON`, incluindo intervalos em dias/horas/minutos), webhook externo (GET/POST autenticado por API key) e disparo manual.
- **Ações**: enviar/rascunhar e-mail, requisição HTTP, criar/atualizar/apagar/buscar registros, execução de código customizado, condicionais (`if-else`), filtro, iterador, agente de IA, formulário e **`delay`** (etapa de espera com fila própria) — essencial pra sequências espaçadas no tempo.
- Isso cobre a base técnica necessária pra tudo abaixo: nenhuma dessas sequências exige ferramenta externa de automação — o motor já existe dentro do produto.

## 1. Configuração para funcionar como evento automático

**Formato evergreen recomendado**: a data/hora do workshop não é fixa — cada pessoa vê "seu" workshop a partir do momento em que se inscreve (ex.: "sua sessão libera em 10 minutos" ou acesso imediato com chat simulado, ver `estrutura-do-workshop.md`, seção 2).

**Configuração**:
- Gatilho: `DATABASE_EVENT` — registro criado no objeto `Inscrição Workshop` (ver `crm-e-leads.md`).
- Ação inicial: gera o horário de "sessão" da pessoa (ex.: agora + N minutos) e grava no registro — é esse campo que a página do workshop usa pra decidir o que mostrar.
- Todo o restante do fluxo (lembretes, liberação de acesso, follow-up) é amarrado a esse timestamp individual, não a um horário global de evento.

## 2. Entrada e gestão automática dos leads

- A criação do registro no CRM (webhook da página de inscrição) é o único ponto de entrada no fluxo — nenhuma inscrição deve depender de alguém importar uma lista depois.
- Gestão de etapa: cada evento do funil (ver `ecossistema-integrado.md`, seção 3) dispara uma ação de `update-record` que move a etapa no CRM — isso substitui qualquer "gestão manual de planilha de inscritos".
- Duplicidade: antes de criar um novo registro, checar (ação de busca) se já existe inscrição do mesmo e-mail/WhatsApp em uma janela recente (ex.: mesma turma evergreen) — evita disparar a sequência inteira de novo pra quem já está nela.

## 3. Sequências antes, durante e depois do workshop

**Antes** (entre inscrição e "sessão" da pessoa):

| Quando (relativo ao horário da sessão) | Canal | Conteúdo |
|---|---|---|
| Imediato | WhatsApp + e-mail | Confirmação de inscrição + link de acesso |
| N horas/dias antes (se aplicável ao formato) | WhatsApp | Lembrete + reforço de valor ("o que você vai aprender") |
| Pouco antes do horário da sessão | WhatsApp | "Está quase liberando" — aumenta comparecimento |

**Durante** (só se houver interação em tempo real possível, ex. sessão ao vivo real ou chat com IA):
- Mensagens de chat simuladas cronometradas (ver `estrutura-do-workshop.md`, seção 3) não são responsabilidade da engine de workflow — ficam no player/página do workshop.
- Se houver dúvidas reais recebidas (WhatsApp durante a sessão), roteiam pra IA de atendimento (`atendimento-ia.md`).

**Depois** (pós-workshop, dividido por resultado):

| Segmento | Sequência |
|---|---|
| Comprou | Confirmação de compra → instruções de acesso → onboarding do produto (fora do escopo deste funil, mas deve iniciar automaticamente) |
| Assistiu, não comprou | Ver seção 4 — follow-up de recuperação |
| Não assistiu | Sequência de "você perdeu, mas ainda dá tempo" com novo prazo/reforço, antes de cair pra recuperação padrão |

Cada linha de "quando" acima é, na prática: gatilho `DATABASE_EVENT` (mudança de etapa) → ação `delay` (espera o intervalo) → ação de envio (e-mail nativo; WhatsApp via `http-request` até existir ação nativa, ver `automacao-whatsapp.md`) → ação `update-record` (marca que foi enviado, evita duplicar).

## 4. Follow-up automático para quem não comprou

**Princípio**: ninguém que chegou até a oferta sai do funil sem pelo menos 2-3 tentativas de recuperação, espaçadas, cada uma com um ângulo diferente (não repetir a mesma mensagem).

**Sequência recomendada** (gatilho: etapa = "Assistiu" ou "Iniciou checkout" E "Comprador" != true, após um prazo sem `Purchase`):

1. **+poucas horas**: lembrete direto — "ainda dá tempo, aqui está o link".
2. **+1 dia**: quebra de objeção específica (preço, tempo, "funciona pra mim?") — usar a etapa exata (assistiu vs. iniciou checkout) pra escolher a objeção mais provável.
3. **+2-3 dias**: urgência real de prazo/vagas encerrando, ou oferta final reduzida — só se for verdade (ver `estrutura-do-workshop.md`, "escassez real").
4. **Encerramento do prazo**: mensagem final "está encerrando" +, opcionalmente, muda a pessoa pra um segmento de remarketing pago de longo prazo (`estrutura-de-trafego-pago.md`) em vez de continuar tentando por WhatsApp/e-mail indefinidamente.

**Corte automático**: toda a sequência de follow-up deve verificar `Comprador = true` como condição de saída antes de cada envio (`if-else`) — nunca mandar mensagem de recuperação pra quem já comprou.

---

*A engine de workflow já suporta tudo isso nativamente, exceto envio de WhatsApp como ação de primeira classe (hoje seria via `http-request` chamando o módulo de WhatsApp — ver gap técnico em `automacao-whatsapp.md`). Construir essas sequências é configuração dentro do produto, não desenvolvimento novo, com essa única ressalva.*
