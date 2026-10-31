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
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Liga o movimento só quando o sistema permite; sem isto (ou sem JavaScript) o conteúdo aparece pronto. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.dataset.motion='on'}}catch(e){}",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Layout raiz do App Router: vale para todas as páginas, então a regra
            no-page-custom-font (pensada para pages/) não se aplica aqui. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-white text-slate-900 font-sans selection:bg-accent selection:text-ink">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
