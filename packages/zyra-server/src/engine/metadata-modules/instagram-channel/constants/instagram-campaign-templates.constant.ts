import { InstagramCampaignTemplateDTO } from 'src/engine/metadata-modules/instagram-channel/dtos/instagram-campaign-template.dto';

// Hardcoded starting points for the campaign builder (built in the
// front-end). Deliberately not stored in the database — these are just
// pre-fill values for the "create automation rule" form, never referenced
// again after a rule is created from one.
export const INSTAGRAM_CAMPAIGN_TEMPLATES: InstagramCampaignTemplateDTO[] = [
  {
    key: 'LINK_IN_BIO',
    name: 'Link na bio',
    description:
      'Quem comentar a palavra-chave recebe o link do seu site ou produto na DM.',
    suggestedKeywords: ['link', 'site'],
    suggestedReplyMessage:
      'Oi! Aqui está o link que você pediu: [cole seu link aqui] 🔗',
    suggestedPublicReplyVariations: [
      'Te mandei uma DM! 📩',
      'Olha sua caixa de mensagens! 💌',
      'Chequei sua DM 😉',
    ],
    suggestedFollowUpMessage: null,
  },
  {
    key: 'GIVEAWAY',
    name: 'Sorteio / giveaway',
    description:
      'Confirma a participação de quem comentar a palavra-chave do sorteio e explica as regras por DM.',
    suggestedKeywords: ['sorteio', 'participar', 'eu quero'],
    suggestedReplyMessage:
      'Você está participando do sorteio! 🎉 As regras completas estão aqui: [link/regras]',
    suggestedPublicReplyVariations: [
      'Inscrição confirmada, olha a DM! 🎉',
      'Boa sorte! Te mandei os detalhes na DM 🍀',
    ],
    suggestedFollowUpMessage:
      'Lembrete: o sorteio termina em breve — não esquece de seguir as regras para valer! 🎁',
  },
  {
    key: 'WAITLIST',
    name: 'Lista de espera',
    description:
      'Adiciona quem comentar a palavra-chave a uma lista de espera e confirma por DM.',
    suggestedKeywords: ['lista', 'quero entrar', 'avisa'],
    suggestedReplyMessage:
      'Você entrou na lista de espera! Vamos te avisar assim que abrir 🙌',
    suggestedPublicReplyVariations: ['Anotado! Vem DM 📝', 'Te chamei na DM! 👋'],
    suggestedFollowUpMessage:
      'Ainda por aqui? Responde essa mensagem pra confirmar seu interesse e não perder a vaga.',
  },
  {
    key: 'PRODUCT_CATALOG',
    name: 'Catálogo de produtos',
    description:
      'Envia o catálogo ou uma lista de produtos por DM para quem comentar a palavra-chave.',
    suggestedKeywords: ['catalogo', 'preço', 'quero comprar'],
    suggestedReplyMessage:
      'Aqui está nosso catálogo atualizado: [link do catálogo] 🛍️',
    suggestedPublicReplyVariations: [
      'Catálogo te esperando na DM! 🛒',
      'Te mandei tudo na DM 📦',
    ],
    suggestedFollowUpMessage: null,
  },
  {
    key: 'FREEBIE',
    name: 'Material gratuito',
    description:
      'Entrega um e-book, planilha ou material gratuito por DM para quem comentar a palavra-chave.',
    suggestedKeywords: ['quero', 'me manda', 'gratis'],
    suggestedReplyMessage: 'Segue o material gratuito que você pediu: [link] 🎁',
    suggestedPublicReplyVariations: ['Já te mandei! Olha a DM 📬', 'Chega na DM! ✨'],
    suggestedFollowUpMessage:
      'Conseguiu acessar o material? Qualquer dúvida é só responder aqui 🙂',
  },
  {
    key: 'EVENT_RSVP',
    name: 'Confirmação de evento',
    description:
      'Confirma presença em um evento ou live para quem comentar a palavra-chave e envia os detalhes por DM.',
    suggestedKeywords: ['presença', 'vou', 'confirmar'],
    suggestedReplyMessage:
      'Presença confirmada! Aqui estão os detalhes do evento: [data/local/link] 📅',
    suggestedPublicReplyVariations: [
      'Te vejo lá! Detalhes na DM 📅',
      'Presença anotada, olha a DM! ✅',
    ],
    suggestedFollowUpMessage:
      'Faltam poucos dias para o evento — já colocou na agenda? 😉',
  },
];
