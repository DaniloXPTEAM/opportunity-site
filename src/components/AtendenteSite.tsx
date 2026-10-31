"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ResidentKirana, type ResidentKiranaProps } from "@/components/ResidentKirana";
import { KiranaRemotoPanel } from "@/components/KiranaRemotoPanel";
import {
  KIRANA_REMOTA_CONFIGURADA,
  avisoDoMotivo,
  verificarKirana,
  type VerificacaoKirana,
} from "@/lib/kiranaRemota";

/**
 * Atendente do site: escolhe, a cada abertura do painel, entre
 *
 *  - a Kirana online (agente real, com modelo), quando há endereço configurado e
 *    ela está de pé, e
 *  - o atendimento guiado (sem modelo, sem rede externa), em qualquer outro caso.
 *
 * O visitante nunca fica sem resposta: se o PC que hospeda a Kirana estiver
 * desligado ou no horário de descanso, o painel guiado abre com um aviso claro e
 * os caminhos para a equipe (WhatsApp e formulário).
 */
export function AtendenteSite(props: ResidentKiranaProps) {
  const { isOpen, onClose } = props;
  const [verificacao, setVerificacao] = useState<VerificacaoKirana | null>(null);
  const [remotoMontado, setRemotoMontado] = useState(false);
  const [remotoFalhou, setRemotoFalhou] = useState(false);

  useEffect(() => {
    if (!isOpen || !KIRANA_REMOTA_CONFIGURADA) return;
    let vivo = true;
    verificarKirana().then((resultado) => {
      if (!vivo) return;
      setVerificacao(resultado);
      if (resultado.online) {
        setRemotoFalhou(false);
        setRemotoMontado(true);
      }
    });
    return () => {
      vivo = false;
    };
  }, [isOpen]);

  // Sem endereço da Kirana: comportamento de sempre (atendimento guiado).
  if (!KIRANA_REMOTA_CONFIGURADA) return <ResidentKirana {...props} />;

  const fechar = () => {
    setVerificacao(null); // a próxima abertura verifica de novo
    onClose();
  };

  const online = verificacao?.online === true && !remotoFalhou;
  const verificando = isOpen && verificacao === null;

  return (
    <>
      {remotoMontado && (
        <KiranaRemotoPanel
          visivel={isOpen && online}
          onClose={fechar}
          onNavigate={props.onNavigate}
          currentSection={props.currentSection ?? "inicio"}
          onFalha={() => setRemotoFalhou(true)}
        />
      )}

      {verificando && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] max-w-[440px] bg-white rounded-lg border border-slate-200 shadow-xl p-5 flex items-center justify-between"
          role="status"
        >
          <p className="text-sm text-slate-600">Conectando à Kirana…</p>
          <button onClick={fechar} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {isOpen && !verificando && !online && (
        <ResidentKirana
          {...props}
          onClose={fechar}
          aviso={avisoDoMotivo(remotoFalhou ? "fora-do-ar" : (verificacao?.motivo ?? "fora-do-ar"))}
        />
      )}
    </>
  );
}
