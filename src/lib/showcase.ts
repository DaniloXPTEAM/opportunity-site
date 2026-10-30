/**
 * Respondedor dos SHOWCASES — respostas predefinidas, sem modelo.
 *
 * Esta lógica morava só em `src/app/api/chat/route.ts`. Com a publicação
 * estática no GitHub Pages não existe servidor para atender `/api/chat`, então
 * a mesma função foi extraída para cá e passou a ser chamada **também** pelo
 * navegador (`KiranaDemo`) quando o build é estático.
 *
 * Regra de ouro: as respostas são as MESMAS. É uma tabela de frases prontas por
 * cenário (`src/data/scenarios.ts`) — não chama modelo, não fala com o Gateway,
 * não consome tokens. A rota `/api/chat` continua existindo e usando esta
 * função, para que a versão dinâmica não mude de comportamento.
 */

import { DEMO_SCENARIOS } from "@/data/scenarios";

export interface ShowcaseAnswer {
  reply: string;
  agentName: string;
  agentAvatar: string;
  scenarioId: string;
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Resposta de um cenário demonstrativo.
 * @param message pergunta do visitante
 * @param scenarioId id do cenário (padaria, pet shop, …)
 * @param rawMessage texto original, usado como chave de `sampleResponses`
 */
export function answerShowcase(message: string, scenarioId: string): ShowcaseAnswer {
  const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId) || DEMO_SCENARIOS[0];
  const rawMsg = message.trim();
  const cleanMsg = normalize(rawMsg);

  // 1. Resposta pronta por chave (exata ou por contenção)
  for (const [key, answer] of Object.entries(scenario.sampleResponses)) {
    const normKey = normalize(key);
    if (cleanMsg === normKey || cleanMsg.includes(normKey) || normKey.includes(cleanMsg)) {
      return { reply: answer, agentName: scenario.agentName, agentAvatar: scenario.agentAvatar, scenarioId: scenario.id };
    }
  }

  // 2. Perguntas sugeridas do próprio cenário
  for (const q of scenario.suggestedQuestions) {
    const normQ = normalize(q);
    if (cleanMsg === normQ || cleanMsg.includes(normQ) || normQ.includes(cleanMsg)) {
      const directAns = scenario.sampleResponses[normQ] || scenario.sampleResponses[q];
      if (directAns) {
        return { reply: directAns, agentName: scenario.agentName, agentAvatar: scenario.agentAvatar, scenarioId: scenario.id };
      }
    }
  }

  // 3. Palavras-chave
  if (cleanMsg.includes("preco") || cleanMsg.includes("custa") || cleanMsg.includes("quanto") || cleanMsg.includes("valor")) {
    const item = scenario.knowledgeBase.catalogHighlights[0];
    return {
      reply: `No nosso catálogo demonstrativo de ${scenario.name}, o destaque é ${item.item} por ${item.price} (${item.desc}). Confira nossa vitrine ao lado!`,
      agentName: scenario.agentName,
      agentAvatar: scenario.agentAvatar,
      scenarioId: scenario.id,
    };
  }

  if (cleanMsg.includes("entrega") || cleanMsg.includes("frete") || cleanMsg.includes("prazo") || cleanMsg.includes("envio")) {
    return {
      reply: `${scenario.knowledgeBase.delivery} Taxa: ${scenario.knowledgeBase.deliveryFee}`,
      agentName: scenario.agentName,
      agentAvatar: scenario.agentAvatar,
      scenarioId: scenario.id,
    };
  }

  if (cleanMsg.includes("horario") || cleanMsg.includes("aberto") || cleanMsg.includes("funciona")) {
    return {
      reply: `Horário de funcionamento: ${scenario.knowledgeBase.hours}.`,
      agentName: scenario.agentName,
      agentAvatar: scenario.agentAvatar,
      scenarioId: scenario.id,
    };
  }

  // 4. Fallback do cenário
  return {
    reply: `Sou o ${scenario.agentName} do ambiente demonstrativo ${scenario.name}! Estou aqui para tirar dúvidas sobre nosso catálogo, prazos e pedidos. Como posso te atender agora?`,
    agentName: scenario.agentName,
    agentAvatar: scenario.agentAvatar,
    scenarioId: scenario.id,
  };
}
