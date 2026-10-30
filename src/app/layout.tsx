import type { Metadata, Viewport } from "next";
import "./globals.css";
import { asset } from "@/lib/asset";

const TITULO = "Opportunity AI — Agente Adaptativo, Automação e Opportunity Labs";
const DESCRICAO =
  "Inteligência artificial, automação comercial, agentes inteligentes adaptáveis e experiências digitais. Conheça a Opportunity AI e o Opportunity Labs.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://opportunity.ia.br"),
  title: TITULO,
  description: DESCRICAO,
  applicationName: "Opportunity AI",
  alternates: { canonical: asset("/") },
  icons: {
    icon: asset("/assets/favicon.png"),
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Opportunity AI",
    title: TITULO,
    description: "Tecnologia que abre novas histórias: Agente Adaptativo, automação comercial e projetos do Opportunity Labs.",
    images: [asset("/assets/og-image.png")],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRICAO,
    images: [asset("/assets/og-image.png")],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Layout raiz do App Router: vale para todas as páginas, então a regra
            no-page-custom-font (pensada para pages/) não se aplica aqui. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Sora:wght@400..800&family=JetBrains+Mono:wght@400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
