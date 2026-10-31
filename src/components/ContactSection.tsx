"use client";

import { useState } from "react";
import { Send, CheckCircle2, ArrowRight, MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui";

/** Build estático (GitHub Pages): sem servidor, o lead vai pelo WhatsApp. */
const STATIC_SITE = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
const WHATSAPP_NUMERO = "5585999462763";

/** Áreas de interesse do formulário (valor enviado → rótulo mostrado e usado no WhatsApp). */
const INTERESSES = [
  { value: "atendimento", label: "Atendimento ao cliente" },
  { value: "agentes", label: "Agentes de IA personalizados" },
  { value: "clientes", label: "Organizar clientes e vendas" },
  { value: "automacao", label: "Automatizar tarefas do dia a dia" },
  { value: "sites", label: "Site ou sistema personalizado" },
  { value: "relatorios", label: "Relatórios e informações" },
  { value: "voz", label: "Agentes de voz e Android" },
  { value: "nao-sei", label: "Não sei ainda — quero orientação" },
  { value: "labs", label: "Projetos e laboratório (parceria)" },
];

/** Monta a mensagem do WhatsApp com o que o visitante já digitou. */
function whatsappComFormulario(form: { nome: string; email: string; whatsapp: string; empresa: string; interesse: string; mensagem: string }) {
  const linhas = [
    "Olá! Vim pelo site da Opportunity AI.",
    `Nome: ${form.nome}`,
    `E-mail: ${form.email}`,
    form.whatsapp ? `WhatsApp: ${form.whatsapp}` : "",
    form.empresa ? `Empresa: ${form.empresa}` : "",
    `Interesse: ${INTERESSES.find((i) => i.value === form.interesse)?.label ?? form.interesse}`,
    "",
    form.mensagem,
  ].filter(Boolean);
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(linhas.join("\n"))}`;
}

export function ContactSection() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    empresa: "",
    interesse: "atendimento",
    mensagem: ""
  });
  const [consentimento, setConsentimento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [deliveryNotice, setDeliveryNotice] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.mensagem) {
      setErrorMsg("Por favor, preencha nome, e-mail e a descrição do seu desafio.");
      return;
    }

    if (!consentimento) {
      setErrorMsg("Para enviar, marque a caixa de consentimento sobre o uso dos seus dados.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // Versão estática: não existe backend para gravar o lead. O formulário abre
    // o WhatsApp (mesmo número oficial) com a mensagem já preenchida — nenhum
    // dado é perdido nem prometemos registro que não aconteceu.
    if (STATIC_SITE) {
      window.open(whatsappComFormulario(form), "_blank", "noopener,noreferrer");
      setDeliveryNotice(
        "Esta é a versão de avaliação do site: o envio abre o WhatsApp da Opportunity AI com sua mensagem já preenchida.",
      );
      setSent(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok || res.status === 202) {
        // Só dizemos "recebido" quando o servidor realmente registrou.
        setDeliveryNotice(
          typeof data.message === "string" && data.delivery !== "sent" ? data.message : "",
        );
        setSent(true);
      } else {
        setErrorMsg("Erro ao enviar mensagem. Tente novamente ou use nosso WhatsApp.");
      }
    } catch (err) {
      setErrorMsg("Falha na conexão. Por favor, tente pelo canal direto no WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contato" className="section bg-slate-50">
      <div className="wrap">
        <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <SectionHeader
              eyebrow="Contato"
              title="Conte o desafio da sua empresa."
              lead="Não precisa entender de inteligência artificial para conversar conosco. Explique o que gostaria de melhorar no seu negócio e vamos avaliar as possibilidades."
            />

            <dl className="mt-10 divide-y divide-slate-300 border-y border-slate-300">
              <div className="py-5">
                <dt className="text-sm font-semibold text-ink">WhatsApp comercial</dt>
                <dd className="mt-1 text-[0.9375rem] text-slate-600">Conversa direta com quem desenvolve o projeto.</dd>
                <dd className="mt-3">
                  <a
                    href="https://wa.me/5585999462763?text=Ol%C3%A1%2C%20gostaria%20de%20conversar%20sobre%20as%20solu%C3%A7%C3%B5es%20da%20Opportunity%20AI"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-dark !py-2.5"
                  >
                    <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    <span>Iniciar conversa no WhatsApp</span>
                  </a>
                </dd>
              </div>
              <div className="py-5">
                <dt className="text-sm font-semibold text-ink">E-mail</dt>
                <dd className="mt-1 text-[0.9375rem] text-slate-600">Para solicitações de propostas e parcerias.</dd>
                <dd className="mt-2">
                  <a
                    href="mailto:rafael@opportunity.ia.br"
                    className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-[6px] hover:text-blue-700"
                  >
                    rafael@opportunity.ia.br
                  </a>
                </dd>
              </div>
              <div className="py-5">
                <dt className="text-sm font-semibold text-ink">Atuação nacional</dt>
                <dd className="mt-1 text-[0.9375rem] text-slate-600">Desenvolvido no Brasil, com alcance em todo o território nacional.</dd>
              </div>
            </dl>
          </div>

          {/* Right Column: Contact Form */}
          <div className="border border-slate-200 bg-white p-6 sm:p-10 lg:col-span-7">
            {sent ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 font-display">
                  {STATIC_SITE ? "Mensagem preparada no WhatsApp!" : "Mensagem Recebida!"}
                </h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  {STATIC_SITE
                    ? "Abrimos o WhatsApp da Opportunity AI com o que você escreveu. Se a janela não abriu, use o botão do WhatsApp ao lado — nada do seu texto foi enviado a um servidor deste site."
                    : "Agradecemos o contato. Nossa equipe analisará sua necessidade e retornará pelo e-mail ou WhatsApp informado."}
                </p>
                {deliveryNotice && (
                  <p className="text-amber-700 text-xs max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-md p-3">
                    {deliveryNotice}
                  </p>
                )}
                <button
                  onClick={() => {
                    setSent(false);
                    setDeliveryNotice("");
                    setForm({
                      nome: "",
                      email: "",
                      whatsapp: "",
                      empresa: "",
                      interesse: "atendimento",
                      mensagem: ""
                    });
                    setConsentimento(false);
                  }}
                  className="btn btn-dark !py-2.5"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="t-h3 mb-2">Formulário de contato</h3>

                {errorMsg && (
                  <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      Nome completo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      placeholder="Ex: Carlos Mendes"
                      className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:border-ink focus:ring-1 focus:ring-ink text-sm text-slate-900 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      E-mail corporativo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="carlos@empresa.com.br"
                      className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:border-ink focus:ring-1 focus:ring-ink text-sm text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      WhatsApp com DDD (opcional)
                    </label>
                    <input
                      type="text"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:border-ink focus:ring-1 focus:ring-ink text-sm text-slate-900 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      Nome da Empresa (opcional)
                    </label>
                    <input
                      type="text"
                      value={form.empresa}
                      onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                      placeholder="Sua Empresa Ltda"
                      className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:border-ink focus:ring-1 focus:ring-ink text-sm text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Área de Interesse Principal</label>
                  <select
                    value={form.interesse}
                    onChange={(e) => setForm({ ...form, interesse: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:border-ink focus:ring-1 focus:ring-ink text-sm text-slate-900 outline-hidden bg-white"
                  >
                    {INTERESSES.map((i) => (
                      <option key={i.value} value={i.value}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Descreva seu desafio operacional <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.mensagem}
                    onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                    placeholder="Ex.: recebo muitas mensagens no WhatsApp e não dou conta de responder; ou: anoto os pedidos em um caderno e perco o controle..."
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:border-ink focus:ring-1 focus:ring-ink text-sm text-slate-900 outline-hidden"
                  />
                </div>

                <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
                  <input
                    type="checkbox"
                    required
                    checked={consentimento}
                    onChange={(e) => setConsentimento(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span>
                    Concordo em enviar estes dados para que a Opportunity AI responda ao meu contato. Eles não são
                    vendidos nem usados para publicidade (veja a Política de Privacidade na seção Sobre).{" "}
                    <span className="text-rose-500">*</span>
                  </span>
                </label>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Preparando mensagem...</span>
                    ) : STATIC_SITE ? (
                      <>
                        <span>Continuar no WhatsApp</span>
                        <Send className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Enviar mensagem</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
