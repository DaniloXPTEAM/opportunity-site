"use client";

import { ArrowRight, Minus, Plus } from "lucide-react";
import { SectionHeader } from "@/components/ui";

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

/** Lista de itens que abrem e fecham: o mesmo estilo para os detalhes técnicos e as dúvidas. */
function Item({ titulo, texto, aberto = false }: { titulo: string; texto: string; aberto?: boolean }) {
  return (
    <details className="group border-b border-slate-300 py-4" open={aberto}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-semibold text-ink hover:text-blue-700">
        <span>{titulo}</span>
        <Plus className="h-5 w-5 shrink-0 group-open:hidden" aria-hidden="true" />
        <Minus className="hidden h-5 w-5 shrink-0 group-open:block" aria-hidden="true" />
      </summary>
      <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-slate-600">{texto}</p>
    </details>
  );
}

/**
 * Como trabalhamos: quatro passos em linha, detalhes técnicos recolhidos e dúvidas comuns em
 * linguagem simples. Mesmo cabeçalho, mesmos espaços e mesmas listas do resto do site.
 */
export function HowWeWork({ onNavigate }: HowWeWorkProps) {
  return (
    <section id="processo" className="section border-y border-slate-200 bg-slate-50">
      <div className="wrap">
        <SectionHeader
          eyebrow="Como trabalhamos"
          title="Quatro passos, do problema à entrega."
          lead="Sem projeto gigante de uma vez. Começamos pelo que mais incomoda hoje e evoluímos a partir do que funcionar."
        />

        <ol className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
          {ETAPAS.map((e) => (
            <li key={e.numero} className="border-t-2 border-ink pt-6">
              <span className="font-display text-5xl font-semibold leading-none text-accent">{e.numero}</span>
              <h3 className="t-h3 mt-5">{e.titulo}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-600">{e.texto}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <button onClick={() => onNavigate("contato")} className="btn btn-primary">
            <span>Começar pela primeira conversa</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-24 grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <h3 className="t-h3">Como a solução é construída por dentro</h3>
            <p className="mt-1.5 text-sm text-slate-500">Para quem quiser entender a parte técnica. Não é obrigatório.</p>
            <div className="mt-6 border-t border-slate-300">
              {DETALHES_TECNICOS.map((d) => (
                <Item key={d.titulo} titulo={d.titulo} texto={d.texto} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="t-h3">Dúvidas comuns</h3>
            <p className="mt-1.5 text-sm text-slate-500">Respostas honestas, sem promessa.</p>
            <div className="mt-6 border-t border-slate-300">
              {DUVIDAS.map((d, i) => (
                <Item key={d.pergunta} titulo={d.pergunta} texto={d.resposta} aberto={i === 0} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
