"use client";

import { useState, useRef, useEffect } from "react";
import { DEMO_SCENARIOS, DemoScenario } from "@/data/scenarios";
import { novoId } from "@/lib/ids";
import {
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Info
} from "lucide-react";
import { asset } from "@/lib/asset";
import { answerShowcase } from "@/lib/showcase";

/** Build estático (GitHub Pages): sem servidor, os showcases rodam no cliente. */
const STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

interface KiranaDemoProps {
  onOpenResidentKirana: () => void;
  onNavigate: (sectionId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  time: string;
}

/**
 * Demonstração do Agente Adaptativo.
 *
 * Antes: "Kirana em Ação", com selo verde de "Atendimento Aberto Agora" e a
 * promessa de adaptação "em menos de duas semanas". Os dois davam a entender
 * que o serviço estava em operação e disponível para contratação imediata.
 *
 * Agora a seção é uma DEMONSTRAÇÃO explícita: título, legenda de estados e
 * avisos dizem o que é simulação, o que existe na versão dinâmica e o que é
 * contato comercial. O comportamento técnico não mudou.
 */

function boasVindas(sc: (typeof DEMO_SCENARIOS)[number]): ChatMessage {
  return {
    id: "welcome-1",
    sender: "agent",
    text: `Olá! Sou o ${sc.agentName}, agente interativo da ${sc.name}. Como posso te ajudar com nosso catálogo e serviços hoje?`,
    time: "Agora",
  };
}

export function AgentDemo({ onOpenResidentKirana, onNavigate }: KiranaDemoProps) {
  const [activeScenarioId, setActiveScenarioId] = useState<string>("padaria");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeScenario = DEMO_SCENARIOS.find((s) => s.id === activeScenarioId) || DEMO_SCENARIOS[0];
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Rola só o corpo do chat até a última mensagem. `scrollIntoView` no fim da lista
  // arrastava a página inteira até esta seção logo na abertura do site.
  useEffect(() => {
    const corpo = chatBodyRef.current;
    if (corpo) corpo.scrollTo({ top: corpo.scrollHeight, behavior: "smooth" });
  }, [messages, activeScenarioId]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: novoId("u"),
      sender: "user",
      text: text.trim(),
      time: "Agora"
    };

    setMessages((prev) => ({
      ...prev,
      [activeScenario.id]: [...(prev[activeScenario.id] || [boasVindas(activeScenario)]), userMsg]
    }));

    setInputText("");
    setIsLoading(true);

    try {
      // Versão estática (GitHub Pages): não existe servidor para atender
      // /api/chat, então a MESMA tabela de respostas é consultada no navegador
      // (src/lib/showcase.ts). Nenhuma resposta muda — é o mesmo dado de
      // src/data/scenarios.ts, sem chamar modelo e sem gastar token.
      // Versão dinâmica: continua indo para a rota /api/chat.
      const data = STATIC_DEMO
        ? answerShowcase(text, activeScenario.id)
        : await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: text,
              context: "scenario",
              scenarioId: activeScenario.id
            })
          }).then((r) => r.json());
      const agentMsg: ChatMessage = {
        id: novoId("a"),
        sender: "agent",
        text: data.reply || "Desculpe, estou recalculando a resposta. Pode tentar novamente?",
        time: "Agora"
      };

      setMessages((prev) => ({
        ...prev,
        [activeScenario.id]: [...(prev[activeScenario.id] || [boasVindas(activeScenario)]), agentMsg]
      }));
    } catch (err) {
      const agentMsg: ChatMessage = {
        id: novoId("a"),
        sender: "agent",
        text: "Desculpe, ocorreu uma instabilidade na conexão demonstrativa. Tente reenviar!",
        time: "Agora"
      };
      setMessages((prev) => ({
        ...prev,
        [activeScenario.id]: [...(prev[activeScenario.id] || [boasVindas(activeScenario)]), agentMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages((prev) => ({
      ...prev,
      [activeScenario.id]: [
        {
          id: "welcome-reset",
          sender: "agent",
          text: `Conversa reiniciada! Sou o ${activeScenario.agentName}. Selecione uma pergunta ou escreva o que deseja consultar.`,
          time: "Agora"
        }
      ]
    }));
  };

  const currentMessages = messages[activeScenario.id] || [boasVindas(activeScenario)];

  return (
    <section id="agente" className="py-20 bg-slate-50 relative overflow-hidden border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Demonstração · empresas fictícias
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-display tracking-tight">
            Imagine um atendente digital que conhece o seu negócio.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Veja como um agente pode orientar clientes, consultar informações e ajudar a executar tarefas. A
            demonstração apresenta possibilidades de aplicação em diferentes empresas.
          </p>
          <p className="text-sm text-slate-500">
            Os negócios abaixo são fictícios e servem só para você experimentar a conversa. Nenhum dado real é usado.
          </p>
        </div>

        {/* Legenda de estados: separa demonstração, implementação e contato comercial */}
        <div className="mx-auto mb-10 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              titulo: "Simulação interativa",
              texto: "Esta seção. A conversa usa respostas preparadas para um negócio fictício.",
              cor: "border-amber-300 bg-amber-50 text-amber-900",
            },
            {
              titulo: "Integração funcional",
              texto: "O atendente do site (botão flutuante) é a implementação real, com backend e agente conectado.",
              cor: "border-blue-300 bg-blue-50 text-blue-900",
            },
            {
              titulo: "Projetos ativos",
              texto: "Os projetos do catálogo estão ativos e em evolução: recursos e telas podem mudar.",
              cor: "border-slate-300 bg-white text-slate-700",
            },
            {
              titulo: "Atendimento comercial",
              texto: "Só existe de fato pelo WhatsApp (85) 99946-2763, com uma pessoa respondendo.",
              cor: "border-emerald-300 bg-emerald-50 text-emerald-900",
            },
          ].map((l) => (
            <div key={l.titulo} className={`rounded-xl border p-3.5 ${l.cor}`}>
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider">{l.titulo}</p>
              <p className="mt-1 text-xs leading-relaxed opacity-90">{l.texto}</p>
            </div>
          ))}
        </div>

        {/* Seletor de cenários de exemplo */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {DEMO_SCENARIOS.map((s) => {
            const isActive = s.id === activeScenario.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveScenarioId(s.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-all focus:outline-hidden ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span className="text-base">{s.agentEmoji}</span>
                <span>{s.name}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>}
              </button>
            );
          })}
        </div>

        {/* Interactive Dual-Panel Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Panel: Simulated Business Environment / Mini-Application */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col justify-between">
            {/* Mock Web Browser Top Bar */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <div className="ml-3 bg-white border border-slate-200 px-3 py-1 rounded-md text-[11px] font-mono text-slate-600 flex items-center gap-2 w-48 sm:w-64 truncate">
                  <span className="text-emerald-500 font-bold">https://</span>
                  <span>demo.{activeScenario.id}.exemplo.com.br</span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-500 hidden sm:inline">
                {activeScenario.badge}
              </span>
            </div>

            {/* Business Hero Banner */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 mb-2">
                    {activeScenario.mockUI.statusBadge}
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 font-display">
                    {activeScenario.mockUI.bannerTitle}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">{activeScenario.mockUI.bannerSubtitle}</p>
                </div>
                <div className="text-right sm:text-right text-xs text-slate-500 font-mono">
                  <p>{activeScenario.mockUI.locationInfo}</p>
                  <p className="text-slate-500 font-semibold mt-0.5">Ambiente de demonstração</p>
                </div>
              </div>
            </div>

            {/* Business Product / Service Catalog Preview */}
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Catálogo / Serviços Disponíveis no Sistema
                </h4>
                <span className="text-xs text-blue-600 font-medium">A Kirana conhece todos estes itens</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {activeScenario.mockUI.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-sm font-bold text-slate-900">{item.title}</h5>
                      {item.tag && (
                        <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{item.note}</p>
                    <p className="text-xs font-extrabold text-slate-800 mt-2 font-mono">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Application Footer Banner */}
            <div className="p-4 bg-slate-100/70 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Simulação: o agente ao lado responde com base neste negócio fictício. Não é atendimento real de uma empresa.
                </span>
              </div>
              <button
                onClick={handleResetChat}
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-semibold text-xs py-2.5 sm:py-1 px-2.5 rounded-md hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar conversa</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Embedded Kirana Live Chat Window */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col h-[580px] overflow-hidden">
            {/* Chat Agent Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl shadow-xs">
                  {activeScenario.agentEmoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white font-display">{activeScenario.agentName}</h4>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  </div>
                  <p className="text-xs text-slate-400">{activeScenario.agentRole}</p>
                </div>
              </div>
              <button
                onClick={handleResetChat}
                title="Reiniciar conversa"
                className="p-3 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 chat-bg text-sm">
              {currentMessages.map((msg) => {
                const isAgent = msg.sender === "agent";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isAgent ? "justify-start" : "justify-end"}`}
                  >
                    {isAgent && (
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {activeScenario.agentEmoji}
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] p-3.5 rounded-2xl shadow-xs leading-relaxed text-xs sm:text-sm ${
                        isAgent
                          ? "bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs"
                          : "bg-blue-600 text-white rounded-tr-xs"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic bg-white p-2.5 rounded-xl border border-slate-200 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                  <span>{activeScenario.agentName} está respondendo...</span>
                </div>
              )}
            </div>

            {/* Suggested Quick Prompt Chips */}
            <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Sugestões:
              </span>
              {activeScenario.suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="px-3 py-2.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs sm:text-[11px] whitespace-nowrap font-medium transition-colors border border-slate-200 shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={`Pergunte algo ao ${activeScenario.agentName}...`}
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-hidden transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors shrink-0 shadow-xs"
                aria-label="Enviar"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Commercial Bridge Banner: "Gostei de você. Quero uma igual no meu site." */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider">
              Da demonstração para o seu negócio
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display">
              Quer um agente assim atendendo a sua empresa?
            </h3>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              O agente é adaptado à identidade, ao catálogo e às regras do seu negócio. O escopo é definido depois de
              entender o seu atendimento — sem promessa de prazo antes disso.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenResidentKirana}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shadow-md transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Ver o atendente do site</span>
            </button>
            <button
              onClick={() => onNavigate("contato")}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all"
            >
              <span>Falar sobre meu projeto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
