import { NextRequest, NextResponse } from "next/server";
import { answerShowcase } from "@/lib/showcase";

/**
 * SHOWCASES (intocáveis).
 *
 * Esta rota responde apenas às demonstrações com respostas predefinidas
 * (`context: "scenario"`). Ela NÃO chama modelo de IA, NÃO fala com o Gateway e
 * NÃO consome tokens: é uma tabela de respostas prontas por cenário — padaria,
 * pet shop, loja, RPG, WhatsApp — exatamente como foi entregue no redesign.
 *
 * O atendimento real do site (a Kirana de verdade) usa /api/kirana/chat.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, scenarioId, context = "resident" } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensagem obrigatória" }, { status: 400 });
    }

    // ==========================================
    // 1. SCENARIO MODE (Kirana in a specific demo)
    // ==========================================
    if (context !== "scenario" || !scenarioId) {
      return NextResponse.json(
        {
          error:
            "Esta rota responde apenas aos showcases demonstrativos (context: 'scenario'). O atendimento real está em /api/kirana/chat.",
        },
        { status: 400 },
      );
    }

    if (context === "scenario" && scenarioId) {
      // A tabela de respostas vive em src/lib/showcase.ts — a MESMA função que o
      // build estático usa no navegador. Aqui só embrulhamos em JSON.
      return NextResponse.json(answerShowcase(message, scenarioId));
    }

    // ==========================================
    // 2. MODO RESIDENTE: REMOVIDO DE PROPÓSITO
    // ==========================================
    // Aqui viviam frases fixas que fingiam ser a atendente. O atendimento real
    // agora é a Kirana v0.5.3, através de /api/kirana/chat (backend + Gateway).
    // Manter as frases antigas seria manter uma segunda atendente falsa
    // respondendo no mesmo site — então esta rota só aceita showcases.
    return NextResponse.json(
      {
        error:
          "Esta rota responde apenas aos showcases demonstrativos (context: 'scenario'). O atendimento real está em /api/kirana/chat.",
      },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("API Chat Error:", error);
    return NextResponse.json(
      {
        reply: "Tive uma instabilidade momentânea ao processar sua pergunta. Por favor, tente novamente ou entre em contato pelo nosso WhatsApp!",
        error: error?.message
      },
      { status: 500 }
    );
  }
}
