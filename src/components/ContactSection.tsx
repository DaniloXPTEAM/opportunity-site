"use client";

import { useState } from "react";
import Image from "next/image";
import { Send, CheckCircle2, MessageSquare, Mail, MapPin, Sparkles, Building, ArrowRight } from "lucide-react";

/** Build estático (GitHub Pages): sem servidor, o lead vai pelo WhatsApp. */
const STATIC_SITE = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
const WHATSAPP_NUMERO = "5585999462763";

/** Monta a mensagem do WhatsApp com o que o visitante já digitou. */
function whatsappComFormulario(form: { nome: string; email: string; whatsapp: string; empresa: string; interesse: string; mensagem: string }) {
  const linhas = [
    "Olá! Vim pelo site da Opportunity AI.",
    `Nome: ${form.nome}`,
    `E-mail: ${form.email}`,
    form.whatsapp ? `WhatsApp: ${form.whatsapp}` : "",
    form.empresa ? `Empresa: ${form.empresa}` : "",
    `Interesse: ${form.interesse}`,
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
    <section id="contato" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Info & Institutional Pitch */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-semibold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" />
              Contato
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
              Conte o desafio da sua empresa.
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Não precisa entender de inteligência artificial para conversar conosco. Explique o que gostaria de
              melhorar no seu negócio e vamos avaliar as possibilidades.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-200 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">WhatsApp Comercial</h4>
                  <p className="text-xs text-slate-500">Conversa direta com quem desenvolve o projeto</p>
                  <a
                    href="https://wa.me/5585999462763?text=Ol%C3%A1%2C%20gostaria%20de%20conversar%20sobre%20as%20solu%C3%A7%C3%B5es%20da%20Opportunity%20AI"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    <span>Iniciar conversa no WhatsApp</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">E-mail Institucional</h4>
                  <p className="text-xs text-slate-500">Para solicitações de propostas e parcerias</p>
                  <a
                    href="mailto:rafael@opportunity.ia.br"
                    className="text-xs text-blue-600 font-mono font-medium hover:underline inline-block mt-1"
                  >
                    rafael@opportunity.ia.br
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Atuação Nacional</h4>
                  <p className="text-xs text-slate-500">Desenvolvido no Brasil com alcance em todo o território nacional</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl">
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
                    : "Agradecemos o contato. Nossa equipe técnica analisará sua necessidade e retornará em até 24 horas úteis."}
                </p>
                {deliveryNotice && (
                  <p className="text-amber-700 text-xs max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-xl p-3">
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
                  }}
                  className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 font-display mb-2">Formulário de Contato</h3>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome completo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      placeholder="Ex: Carlos Mendes"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      E-mail corporativo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="carlos@empresa.com.br"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp com DDD (opcional)
                    </label>
                    <input
                      type="text"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome da Empresa (opcional)
                    </label>
                    <input
                      type="text"
                      value={form.empresa}
                      onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                      placeholder="Sua Empresa Ltda"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Área de Interesse Principal</label>
                  <select
                    value={form.interesse}
                    onChange={(e) => setForm({ ...form, interesse: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 outline-hidden bg-white"
                  >
                    <option value="atendimento">Atendimento ao cliente</option>
                    <option value="clientes">Organizar clientes e vendas</option>
                    <option value="automacao">Automatizar tarefas do dia a dia</option>
                    <option value="sites">Site ou sistema personalizado</option>
                    <option value="relatorios">Relatórios e informações</option>
                    <option value="nao-sei">Não sei ainda — quero orientação</option>
                    <option value="labs">Projetos e laboratório (parceria)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descreva seu desafio operacional <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.mensagem}
                    onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                    placeholder="Ex.: recebo muitas mensagens no WhatsApp e não dou conta de responder; ou: anoto os pedidos em um caderno e perco o controle..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-slate-900 outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
