/**
 * Atendente GUIADO — usado só na versão estática (GitHub Pages).
 *
 * Não é modelo de linguagem: é um roteador de intenções por palavras-chave que
 * responde com texto já presente no site (`src/data/solucoes.ts`,
 * `src/data/portfolio.ts`) e encaminha ao WhatsApp quando o assunto pede uma
 * pessoa. Nada aqui é inventado: sem preço, sem prazo, sem promessa de resultado.
 * Escopo e prazo são definidos em conversa com a equipe.
 */

import { SOLUCOES_NEGOCIO } from "@/data/solucoes";
import { LAB_PROJECTS } from "@/data/portfolio";

export const WHATSAPP_NUMERO = "5585999462763";

export function whatsappLink(texto: string): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
}

export interface RespostaGuiada {
  texto: string;
  /** Sugestões de próxima pergunta (viram botões). */
  sugestoes: { label: string; pergunta: string }[];
  /** Seção do site a rolar, quando fizer sentido. */
  /** Ids reais das seções em src/app/page.tsx. */
  secao?: "solucoes" | "agente" | "projetos" | "processo" | "sobre" | "contato";
  /** Link externo (WhatsApp) para exibir como botão. */
  link?: { label: string; href: string };
}

const SUGESTOES_BASE = [
  { label: "O que vocês fazem?", pergunta: "O que a Opportunity AI faz?" },
  { label: "Quero um agente no meu site", pergunta: "Quero um agente adaptativo no meu site" },
  { label: "Falar com a equipe", pergunta: "Quero falar com uma pessoa" },
];

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function tem(msg: string, ...termos: string[]): boolean {
  return termos.some((t) => msg.includes(t));
}

const GATILHOS_SOLUCAO: Record<string, string[]> = {
  atendimento: ["atendimento", "whatsapp", "mensagens", "responder", "chatbot", "atendente"],
  "clientes-vendas": ["crm", "vendas", "funil", "orcamento enviado", "contatos", "clientes"],
  automacao: ["automacao", "automatizar", "planilha", "integracao", "tarefas repetitivas"],
  "sites-sistemas": ["site", "sistema", "catalogo", "agendamento", "loja", "pagina"],
  relatorios: ["relatorio", "indicador", "dashboard", "painel", "numeros"],
};

const MSG_ENCAMINHAR =
  "Essa parte merece uma conversa de verdade. Valores, prazos e escopo dependem do seu caso, por isso a equipe define junto com você, sem preço fixo no site.";

export function responderGuiado(mensagem: string): RespostaGuiada {
  const msg = normalizar(mensagem);

  // 0. Cumprimento e agradecimento
  if (/\b(oi|ola|bom dia|boa tarde|boa noite)\b/.test(msg) && msg.length < 40) {
    return {
      texto:
        "Olá, que bom ter você por aqui! 🙂 Eu sou a Kirana, da Opportunity AI. Me conte o que você gostaria de melhorar no seu negócio, ou escolha um dos caminhos abaixo, e eu levo você ao ponto certo do site.",
      sugestoes: SUGESTOES_BASE,
    };
  }
  if (/\bobrigad[oa]\b/.test(msg) && msg.length < 40) {
    return {
      texto: "Eu que agradeço pela conversa. Se surgir mais alguma dúvida, é só me chamar; e, quando quiser tratar do seu caso, a equipe está pelo WhatsApp.",
      sugestoes: SUGESTOES_BASE,
    };
  }

  // 1. Pedido de pessoa / orçamento / preço
  if (tem(msg, "pessoa", "humano", "equipe", "atendente humano", "falar com", "orcamento", "preco", "valor", "quanto custa", "prazo", "contratar")) {
    return {
      texto: `${MSG_ENCAMINHAR} Posso abrir o WhatsApp com a sua mensagem já escrita ou levar você ao formulário de contato. Combinado?`,
      sugestoes: [{ label: "Ver soluções", pergunta: "Quais soluções vocês oferecem?" }],
      secao: "contato",
      link: {
        label: "Falar no WhatsApp",
        href: whatsappLink("Olá! Vim pelo site da Opportunity AI e gostaria de conversar sobre uma solução para o meu negócio."),
      },
    };
  }

  // 2. Solução específica
  for (const sol of SOLUCOES_NEGOCIO) {
    const gatilhos = GATILHOS_SOLUCAO[sol.id] || [];
    if (tem(msg, ...gatilhos)) {
      return {
        texto: `Boa escolha! Sobre ${sol.titulo.toLowerCase()}: ${sol.resumo}\n\n${sol.comoFunciona}\n\n${sol.ganho}\n\nSe quiser, me conte como isso acontece hoje no seu negócio e eu indico o melhor ponto de partida.`,
        sugestoes: [
          { label: "Ver todas as soluções", pergunta: "Quais soluções vocês oferecem?" },
          { label: "Falar com a equipe", pergunta: "Quero falar com uma pessoa" },
        ],
        secao: "solucoes",
      };
    }
  }

  // 3. Agente adaptativo / Kirana
  if (tem(msg, "agente", "kirana", "adaptativo", "inteligencia artificial", " ia ")) {
    return {
      texto:
        "O Agente Adaptativo é um atendente digital que aprende o seu negócio: responde as perguntas frequentes, orienta o cliente e passa para uma pessoa quando o assunto pede uma decisão humana. Aqui no site eu sou a Kirana, uma das identidades dele. Na seção de demonstração você vê como ele se comporta em outros negócios, como padaria e pet shop.",
      sugestoes: [
        { label: "Ver a demonstração", pergunta: "Quero ver a demonstração" },
        { label: "Falar com a equipe", pergunta: "Quero falar com uma pessoa" },
      ],
      secao: "agente",
    };
  }

  if (tem(msg, "demonstracao", "demo", "cenario", "exemplo")) {
    return {
      texto: "Vamos lá! São negócios de exemplo, pensados para mostrar como um atendente se adapta a cada segmento. Fique à vontade para experimentar.",
      sugestoes: SUGESTOES_BASE,
      secao: "agente",
    };
  }

  // 4. Projetos do Labs
  if (tem(msg, "labs", "projeto", "rpg", "cineforma", "crm", "jogo")) {
    const lista = LAB_PROJECTS.slice(0, 6)
      .map((p) => `• ${p.title} (${p.estado})`)
      .join("\n");
    return {
      texto: `Vamos lá! No Opportunity Labs estão os projetos próprios da empresa, todos em andamento:\n${lista}\n\nNa seção de projetos você vê cada um com mais detalhes. Algum deles chamou a sua atenção?`,
      sugestoes: SUGESTOES_BASE,
      secao: "projetos",
    };
  }

  // 5. Visão geral das soluções
  if (tem(msg, "solucoes", "servicos", "o que", "faz", "oferece", "ajuda")) {
    const lista = SOLUCOES_NEGOCIO.map((s) => `• ${s.titulo}: ${s.resumo}`).join("\n");
    return {
      texto: `A Opportunity AI trabalha com:\n${lista}\n\nQual dessas áreas se parece mais com o seu dia a dia? Posso detalhar a que você escolher.`,
      sugestoes: [
        { label: "Atendimento ao cliente", pergunta: "Como funciona o atendimento ao cliente?" },
        { label: "Organização de vendas", pergunta: "Como funciona a organização de clientes e vendas?" },
        { label: "Falar com a equipe", pergunta: "Quero falar com uma pessoa" },
      ],
      secao: "solucoes",
    };
  }

  // 6. Tecnologia / sobre
  if (tem(msg, "tecnologia", "como funciona", "seguranca", "dados")) {
    return {
      texto: "Os detalhes de como as soluções são construídas estão na seção Como trabalhamos. Para dúvidas sobre segurança e dados do seu caso, a equipe responde com todo o cuidado, direto pelo WhatsApp.",
      sugestoes: SUGESTOES_BASE,
      secao: "processo",
    };
  }

  if (tem(msg, "quem", "empresa", "sobre", "opportunity")) {
    return {
      texto: "Levo você até a seção Sobre, onde a empresa e quem está por trás dela são apresentados. Se preferir conhecer a história de perto, a equipe conta mais pelo WhatsApp.",
      sugestoes: SUGESTOES_BASE,
      secao: "sobre",
    };
  }

  // 7. Quando não sei: sem inventar, com cuidado e com um caminho
  return {
    texto:
      "Essa eu prefiro não responder no improviso, para não passar uma informação errada. Posso mostrar o que a Opportunity AI faz, apresentar os projetos ou chamar alguém da equipe, que cuida do seu caso com atenção. O que fica melhor para você?",
    sugestoes: SUGESTOES_BASE,
    link: {
      label: "Falar no WhatsApp",
      href: whatsappLink("Olá! Vim pelo site da Opportunity AI e tenho uma dúvida."),
    },
  };
}
