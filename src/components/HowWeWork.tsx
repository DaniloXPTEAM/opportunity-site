"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, Cpu, HelpCircle } from "lucide-react";

interface HowWeWorkProps {
  onNavigate: (sectionId: string) => void;
}

/** As quatro etapas do processo — consolidação de metodologia, arquitetura e engenharia. */
const ETAPAS = [
  {
    numero: "01",
    titulo: "Entendemos o problema",
    texto:
      "Conversamos sobre a rotina da empresa: onde o tempo é perdido, o que se repete todo dia e o que trava a venda. Nada é proposto antes disso.",
  },
  {
    numero: "02",
    titulo: "Propomos uma solução",
    texto:
      "Apresentamos o que faz sentido para o seu caso, com possibilidades, requisitos e limitações claras — inclusive quando a resposta é “isso não precisa de tecnologia”.",
  },
  {
    numero: "03",
    titulo: "Desenvolvemos e testamos",
    texto:
      "Construímos a solução e validamos com você, usando situações reais do negócio antes de colocar em uso.",
  },
  {
    numero: "04",
    titulo: "Entregamos e orientamos",
    texto:
      "Explicamos como usar no dia a dia, o que ficou pronto e quais etapas futuras podem ser necessárias.",
  },
];

/** Assuntos técnicos, agora recolhidos — quem não é técnico não precisa passar por eles. */
const DETALHES_TECNICOS = [
  {
    titulo: "Agentes e modelos de linguagem",
    texto:
      "Usamos modelos de linguagem (nacionais e internacionais, conforme custo e precisão) com instruções específicas do seu negócio. O comportamento é definido e revisado antes de ir ao ar.",
  },
  {
    titulo: "Base de conhecimento do negócio",
    texto:
      "Catálogo, preços, horários e regras ficam em uma base consultada pelo agente, em vez de embutidos na conversa. Quando o preço muda, muda em um lugar só.",
  },
  {
    titulo: "Integrações e APIs",
    texto:
      "A solução conversa com o que a empresa já usa: WhatsApp, planilhas, CRM, ERP, agenda e meios de pagamento — por integrações oficiais ou webhooks.",
  },
  {
    titulo: "Arquitetura modular",
    texto:
      "A solução é montada em peças: dá para trocar o modelo de linguagem ou acrescentar uma integração sem refazer o resto. Os registros das ações do agente ficam disponíveis para acompanhamento e melhoria.",
  },
  {
    titulo: "Supervisão humana",
    texto:
      "Toda automação tem um ponto de saída para uma pessoa. Assuntos sensíveis, exceções e reclamações chegam a um atendente, nunca a uma resposta automática sem revisão.",
  },
  {
    titulo: "Dados e privacidade",
    texto:
      "Coletamos apenas o necessário para responder ao contato. As chaves de acesso ficam no servidor, nunca no navegador do visitante. Detalhes na Política de Privacidade, na seção Sobre.",
  },
];

/** Dúvidas que um pequeno empresário realmente faz — respostas honestas, sem promessa. */
const DUVIDAS = [
  {
    pergunta: "Preciso entender de inteligência artificial para contratar?",
    resposta:
      "Não. Você explica o problema com as palavras do seu dia a dia. O trabalho de traduzir isso em tecnologia é nosso.",
  },
  {
    pergunta: "Isso serve para uma empresa pequena?",
    resposta:
      "Serve principalmente para quem tem tarefa repetitiva, atendimento acumulado ou informação espalhada. Se a empresa é muito pequena e o volume é baixo, dizemos com franqueza quando não vale o investimento.",
  },
  {
    pergunta: "Preciso trocar meus sistemas atuais?",
    resposta:
      "Não necessariamente. Na maioria dos casos a solução se conecta ao que já existe (WhatsApp, planilha, sistema de gestão). Trocar tudo é a última opção, não a primeira.",
  },
  {
    pergunta: "Quanto custa e em quanto tempo fica pronto?",
    resposta:
      "Depende do que precisa ser resolvido. Depois de entender o caso, você recebe uma proposta com escopo, prazo e valor definidos antes de qualquer compromisso.",
  },
  {
    pergunta: "Os projetos do laboratório estão ativos? Posso usar algum?",
    resposta:
      "Sim, todos os projetos do catálogo estão ativos. Se algum deles combina com o seu negócio, ou se você precisa de algo parecido, conte o caso: as soluções para empresas são feitas sob medida, com escopo, prazo e valor combinados na conversa.",
  },
  {
    pergunta: "O atendimento funciona pelo WhatsApp?",
    resposta:
      "Sim. A integração com o WhatsApp é feita pela API oficial, quando configurada e aprovada, e o conteúdo das respostas é cadastrado e atualizado por você junto conosco.",
  },
  {
    pergunta: "O atendente digital substitui a minha equipe?",
    resposta:
      "Não. Ele cobre o que se repete e o que chega fora do horário, e passa para uma pessoa quando o assunto pede julgamento humano.",
  },
];

/**
 * Como trabalhamos — consolida processo, arquitetura e engenharia em uma seção só.
 *
 * O que estava espalhado em três seções ("Metodologia", "Arquitetura & Engenharia",
 * "Processo em 5 etapas") virou: 4 etapas visíveis + detalhes técnicos recolhidos
 * + dúvidas comuns em linguagem simples.
 */
export function HowWeWork({ onNavigate }: HowWeWorkProps) {
  const [duvidaAberta, setDuvidaAberta] = useState<number | null>(0);

  return (
    <section id="processo" className="relative py-20 sm:py-24 bg-slate-50 border-b border-slate-200 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Coluna esquerda: etapas */}
          <div className="lg:col-span-7">
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-slate-500">Como trabalhamos</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
              Quatro passos, do problema à entrega.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Sem projeto gigante de uma vez. Começamos pelo que mais incomoda hoje e evoluímos a partir do que
              funcionar.
            </p>

            <ol className="mt-10 space-y-4">
              {ETAPAS.map((e, i) => (
                <li key={e.numero} className="relative flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col items-center">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 font-mono text-xs font-bold text-white">
                      {e.numero}
                    </span>
                    {i < ETAPAS.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-slate-200" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">{e.titulo}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{e.texto}</p>
                  </div>
                </li>
              ))}
            </ol>

            <button
              onClick={() => onNavigate("contato")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
            >
              <span>Começar pela primeira conversa</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Coluna direita: detalhes técnicos + dúvidas */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Como a solução é construída por dentro</h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">Para quem quiser entender a parte técnica — não é obrigatório.</p>

              <div className="mt-4 divide-y divide-slate-100">
                {DETALHES_TECNICOS.map((d) => (
                  <details key={d.titulo} className="group py-2.5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-slate-700 hover:text-blue-700">
                      <span>{d.titulo}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{d.texto}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Dúvidas comuns</h3>
              </div>

              <div className="mt-3 divide-y divide-slate-100">
                {DUVIDAS.map((d, i) => {
                  const aberta = duvidaAberta === i;
                  return (
                    <div key={d.pergunta} className="py-2">
                      <button
                        onClick={() => setDuvidaAberta(aberta ? null : i)}
                        className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-slate-700 hover:text-blue-700"
                        aria-expanded={aberta}
                      >
                        <span>{d.pergunta}</span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${aberta ? "rotate-180" : ""}`}
                        />
                      </button>
                      {aberta && <p className="mt-2 text-xs leading-relaxed text-slate-600">{d.resposta}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
