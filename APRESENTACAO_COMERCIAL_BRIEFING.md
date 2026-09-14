# Briefing para IA Geradora de Slides — Apresentação Comercial do Zyra

> Este documento é um **briefing de conteúdo**, não a apresentação em si. Ele foi escrito para
> ser lido por uma ferramenta de IA que gera slides (Gamma, Beautiful.ai, Tome, Canva AI, Copilot
> Designer, etc.) ou por uma pessoa montando a apresentação manualmente. Ele descreve **o que
> dizer em cada slide, por quê, e que imagem usar** — a ferramenta de slides decide o layout
> final, mas deve seguir o conteúdo, a ordem e as instruções de imagem abaixo.

---

## 1. Objetivo da apresentação

Apresentar o **Zyra**, um CRM completo, a um público empresarial (empresa que está avaliando
adotar um CRM ou trocar o que usa hoje). O objetivo é gerar **interesse e agendar uma
demonstração** — não fechar venda nem discutir comercial.

**Regra absoluta: NÃO incluir preços, planos, valores, descontos ou qualquer menção comercial
de custo.** Se a ferramenta de IA tentar inserir um slide de "planos e preços" por padrão,
remova-o ou substitua por um slide de "Próximos passos" convidando para uma conversa.

## 2. Público-alvo

Tomadores de decisão de uma empresa (dono, diretor comercial, head de operações/CS, ou head de
TI). Pessoas que já conhecem o conceito de CRM, mas talvez não conheçam profundamente questões
técnicas. Evite jargão de engenharia (não falar em "GraphQL", "workspace", "metadata-driven
schema" — traduza tudo para benefício de negócio).

## 3. Tom de voz

- Direto, confiante, sem exagero de superlativos ("líder de mercado", "o melhor CRM do mundo").
- Foco em **problema → como o Zyra resolve → resultado prático**.
- Português do Brasil, formal mas acessível (fala com um empresário, não com um desenvolvedor).
- Zyra é um **produto próprio e proprietário** (não mencionar que a base é open-source nem
  citar "Twenty CRM" — para o mercado, Zyra é um produto da Horizon, ponto final).

## 4. Identidade visual (para a IA de slides seguir)

- **Cor de destaque**: roxo `#6E56CF` (usar em títulos, ícones de destaque, botões/CTAs nos
  slides, gráficos).
- **Cor de fundo**: branco ou cinza muito claro no modo claro; grafite escuro no modo escuro.
  Escolher um dos dois modos e manter consistente em toda a apresentação (não misturar).
- **Logo**: o símbolo "Z" da marca Zyra (arquivo de referência:
  `packages/zyra-ui/src/icon/components/ZyraMark.tsx`) — usar no slide de capa e no rodapé dos
  demais slides.
- **Tipografia**: sans-serif moderna e limpa (ex.: Inter, ou equivalente disponível na
  ferramenta de slides). Títulos em peso forte (bold/semibold), corpo de texto regular.
- **Estilo geral**: visual de produto SaaS B2B moderno — bastante espaço em branco, poucos
  elementos por slide, screenshots reais do produto como protagonistas (não ícones genéricos de
  banco de imagens).

## 5. Sobre as imagens — regra mais importante deste briefing

**Sempre que possível, use capturas de tela reais do produto Zyra rodando**, não fotos de banco
de imagens nem ilustrações genéricas de "pessoas sorrindo em escritório". Zyra é um produto de
software real e funcional — a apresentação fica muito mais forte mostrando a própria interface.

Instruções para quem for tirar as capturas (rodando `npm run dev` localmente):
- Login: `http://localhost:3001/login`
- Cadastro: `http://localhost:3001/cadastro`
- Depois de logado, navegar até os objetos padrão (Pessoas, Empresas, Oportunidades) para
  capturar as visualizações em tabela e Kanban.
- Menu de criação de automações (Workflows) para capturar o editor visual.
- Configurações de canais conectados (WhatsApp, e-mail) para capturar as telas de integração.

Cada slide abaixo já indica **exatamente qual tela capturar**. Se uma tela específica ainda não
estiver pronta visualmente ou não puder ser capturada a tempo, use um mockup simplificado no
mesmo estilo visual (cor `#6E56CF`, mesma tipografia) em vez de imagem genérica — nunca deixar
o slide sem nenhum apoio visual.

## 6. Estrutura dos slides

Cada slide abaixo tem: **objetivo**, **texto sugerido** (a IA pode ajustar a redação, mas deve
manter o conteúdo e não inventar números, métricas ou depoimentos de clientes que não existem)
e **instrução de imagem**.

---

### Slide 1 — Capa

**Objetivo:** identificação imediata.
**Texto:** "Zyra" (logo) + linha de apoio: "O CRM que organiza toda a operação comercial em um
só lugar."
**Imagem:** logo Zyra (ZyraMark) centralizado, fundo em degradê sutil na cor de marca.

---

### Slide 2 — O problema

**Objetivo:** criar identificação com a dor antes de apresentar a solução.
**Texto:** times comerciais hoje perdem tempo e oportunidades porque a informação do cliente
está espalhada — planilhas, WhatsApp pessoal, e-mail, anotações soltas, sistemas que não
conversam entre si. O resultado: perda de contexto, retrabalho e negócios esquecidos.
**Imagem:** ilustração simples (não screenshot) representando "fragmentação" — vários ícones de
ferramentas desconectados (planilha, e-mail, chat, calendário) sem conexão entre si.

---

### Slide 3 — O que é o Zyra

**Objetivo:** definição em uma frase.
**Texto:** "Zyra é um CRM completo que centraliza contatos, empresas, oportunidades de venda,
tarefas e conversas em uma única plataforma — com automação e inteligência artificial
integradas."
**Imagem:** screenshot da tela inicial do Zyra logado (dashboard/visão geral de um workspace).

---

### Slide 4 — Toda a informação do cliente em um só lugar

**Objetivo:** mostrar o núcleo do produto: a base de dados relacional do CRM.
**Texto:** Zyra organiza automaticamente **Pessoas, Empresas, Oportunidades, Tarefas e Notas**
— e conecta tudo isso entre si. Uma nota ou tarefa pode estar ligada a qualquer registro; um
histórico de interações (timeline) mostra tudo que já aconteceu com aquele cliente, sem precisar
procurar em vários lugares.
**Imagem:** screenshot da visualização em tabela de "Pessoas" ou "Empresas", e/ou o painel de
detalhe de um registro mostrando a timeline de atividades.

---

### Slide 5 — Um CRM que se adapta ao seu negócio, não o contrário

**Objetivo:** diferencial de flexibilidade (customização sem código).
**Texto:** cada empresa vende de um jeito diferente. No Zyra é possível criar **campos e
objetos personalizados** — sem depender de programação — para refletir exatamente o processo
comercial da sua empresa, do zero.
**Imagem:** screenshot do menu de criação/edição de um campo customizado ou de um objeto
personalizado.

---

### Slide 6 — Visualize seu funil do seu jeito

**Objetivo:** mostrar flexibilidade de visualização de dados.
**Texto:** os mesmos dados podem ser vistos como **tabela, quadro Kanban ou calendário** —
cada equipe escolhe a visão que faz mais sentido para seu fluxo de trabalho, com filtros,
ordenação e agrupamento personalizados. Painéis (dashboards) reúnem indicadores em um só lugar.
**Imagem:** screenshot de um funil de Oportunidades em visualização Kanban (colunas por estágio
do negócio).

---

### Slide 7 — Automação que trabalha por você

**Objetivo:** apresentar o motor de Workflows.
**Texto:** Zyra automatiza tarefas repetitivas com um **editor visual de automações**: dispara
ações quando um registro é criado ou muda de status, em um horário programado, por um botão
manual ou por um webhook externo. As automações podem enviar e-mails, atualizar registros,
disparar requisições para outros sistemas, aplicar condições e até acionar um **agente de IA**
dentro do fluxo.
**Imagem:** screenshot do editor visual de Workflow (o canvas de automação com os blocos
conectados).

---

### Slide 8 — Converse com seus clientes sem sair do CRM

**Objetivo:** apresentar comunicação omnichannel — o grande diferencial recente do produto.
**Texto:** Zyra conecta diretamente o **WhatsApp Business (API oficial da Meta)**, e-mail
(Google/Microsoft) e calendário à plataforma. Toda conversa e todo compromisso ficam registrados
automaticamente no histórico do cliente — sem copiar e colar entre sistemas, sem perder
contexto.
**Imagem:** screenshot da tela de conexão do WhatsApp Business (fluxo de cadastro do número) e/ou
de uma conversa de WhatsApp integrada dentro do Zyra.

---

### Slide 9 — Inteligência artificial integrada

**Objetivo:** mostrar o diferencial de IA como parte nativa do produto, não um "plugin".
**Texto:** Zyra tem **agentes de IA configuráveis** que podem responder, qualificar leads,
resumir conversas e executar ações dentro dos fluxos de automação — com controle de permissão
sobre o que cada agente pode fazer (enviar e-mail, criar registro, consultar dados, etc.).
**Imagem:** screenshot do painel de configuração de um agente de IA ou do chat de IA dentro do
produto.

---

### Slide 10 — Segurança e controle sob medida

**Objetivo:** tranquilizar decisores de TI/segurança — barreira comum em vendas B2B.
**Texto:** cada empresa opera em um ambiente isolado (workspace próprio). Zyra tem **controle de
acesso por papéis (roles)**, com permissões granulares por objeto, por campo e até por linha de
dado — cada pessoa do time vê e faz exatamente o que deveria.
**Imagem:** screenshot da tela de gerenciamento de papéis/permissões (roles).

---

### Slide 11 — Conecta com o que sua empresa já usa

**Objetivo:** mostrar extensibilidade/ecossistema, reduzir medo de "ilha isolada".
**Texto:** além das integrações nativas, o Zyra se conecta com **milhares de outras ferramentas**
via Zapier, e expõe uma **API aberta e webhooks** para integrações sob medida com os sistemas que
sua empresa já usa.
**Imagem:** screenshot da tela de gerenciamento de chaves de API/webhooks, ou um diagrama simples
mostrando o Zyra no centro conectado a outros sistemas (WhatsApp, e-mail, Zapier, API).

---

### Slide 12 — Por que Zyra

**Objetivo:** slide-resumo dos diferenciais, para reforçar antes do fechamento.
**Texto (lista curta, sem inventar métricas):**
- Toda a operação comercial em um único lugar
- Se adapta ao processo da sua empresa, sem depender de programação
- Automação visual + IA nativa, não plugins de terceiros
- WhatsApp, e-mail e calendário integrados de verdade
- Controle de acesso robusto, pensado para empresas
**Imagem:** nenhuma obrigatória — pode usar apenas a cor de marca como fundo com os ícones de
cada ponto.

---

### Slide 13 — Próximos passos

**Objetivo:** call-to-action, sem falar de preço.
**Texto:** "Vamos mostrar o Zyra funcionando com o seu processo comercial." + convite para
agendar uma demonstração/conversa.
**Imagem:** logo Zyra + informação de contato (a definir pelo time comercial).

---

## 7. Checklist final para a IA geradora de slides

- [ ] Nenhum slide menciona preço, plano, valor ou "grátis".
- [ ] Nenhuma métrica, número de clientes ou depoimento foi inventado — só usar dados reais
      fornecidos pela Horizon.
- [ ] Nenhuma referência a "Twenty CRM" ou origem open-source — Zyra é apresentado como produto
      próprio.
- [ ] Cor de marca `#6E56CF` usada de forma consistente.
- [ ] Prioridade para screenshots reais do produto sobre imagens de banco de imagens.
- [ ] Máximo de ~5 linhas de texto por slide — o conteúdo detalhado acima é referência para a
      narrativa falada, não para lotar o slide de texto.
