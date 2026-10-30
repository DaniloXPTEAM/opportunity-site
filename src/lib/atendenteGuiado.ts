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
  "Para valores, prazos e escopo, a equipe conversa com você diretamente: cada caso é definido na conversa, sem preço fixo no site.";

export function responderGuiado(mensagem: string): RespostaGuiada {
  const msg = normalizar(mensagem);

  // 1. Pedido de pessoa / orçamento / preço
  if (tem(msg, "pessoa", "humano", "equipe", "atendente humano", "falar com", "orcamento", "preco", "valor", "quanto custa", "prazo", "contratar")) {
    return {
      texto: `${MSG_ENCAMINHAR} Posso abrir o WhatsApp com a sua mensagem já escrita ou levar você ao formulário de contato.`,
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
        texto: `${sol.titulo}: ${sol.resumo}\n\n${sol.comoFunciona}\n\n${sol.ganho}`,
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
        "O Agente Adaptativo é um atendente digital treinado com as informações do seu negócio, que responde as perguntas frequentes e passa para uma pessoa quando o assunto exige decisão humana. A Kirana é o atendente da própria Opportunity AI. Nesta versão de avaliação você pode experimentar os cenários de demonstração (padaria, pet shop e outros), que respondem com frases prontas.",
      sugestoes: [
        { label: "Ver a demonstração", pergunta: "Quero ver a demonstração" },
        { label: "Falar com a equipe", pergunta: "Quero falar com uma pessoa" },
      ],
      secao: "agente",
    };
  }

  if (tem(msg, "demonstracao", "demo", "cenario", "exemplo")) {
    return {
      texto: "Levo você até a área de demonstração. Lá cada cenário responde com frases prontas, sem modelo de linguagem, só para mostrar como um atendente se comporta.",
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
      texto: `No Opportunity Labs estão os projetos próprios da empresa, cada um com o seu estado real de desenvolvimento:\n${lista}\n\nVeja os detalhes na seção de projetos.`,
      sugestoes: SUGESTOES_BASE,
      secao: "projetos",
    };
  }

  // 5. Visão geral das soluções
  if (tem(msg, "solucoes", "servicos", "o que", "faz", "oferece", "ajuda")) {
    const lista = SOLUCOES_NEGOCIO.map((s) => `• ${s.titulo}: ${s.resumo}`).join("\n");
    return {
      texto: `A Opportunity AI trabalha com:\n${lista}\n\nQuer detalhes de alguma delas?`,
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
      texto: "Os detalhes técnicos estão na seção de tecnologia do site. Para dúvidas específicas sobre segurança e dados do seu caso, a equipe responde diretamente.",
      sugestoes: SUGESTOES_BASE,
      secao: "processo",
    };
  }

  if (tem(msg, "quem", "empresa", "sobre", "opportunity")) {
    return {
      texto: "Você encontra a apresentação da empresa na seção Sobre. Se preferir, a equipe conta mais pelo WhatsApp.",
      sugestoes: SUGESTOES_BASE,
      secao: "sobre",
    };
  }

  // 7. Fallback honesto
  return {
    texto:
      "Esta é a versão de avaliação do site: o atendimento é guiado, sem modelo de linguagem, e só responde sobre o que está no site. Escolha uma das opções abaixo ou fale direto com a equipe.",
    sugestoes: SUGESTOES_BASE,
    link: {
      label: "Falar no WhatsApp",
      href: whatsappLink("Olá! Vim pelo site da Opportunity AI e tenho uma dúvida."),
    },
  };
}
