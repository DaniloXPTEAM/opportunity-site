import type { Metadata } from "next";
import "./globals.css";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://opportunity.ia.br"),
  title: "Opportunity AI — Agente Adaptativo, Automação e Opportunity Labs",
  description:
    "Inteligência artificial, automação comercial, agentes inteligentes adaptáveis e experiências digitais. Conheça a Opportunity AI e o Opportunity Labs.",
  icons: {
    icon: asset("/assets/favicon.png"),
  },
  openGraph: {
    title: "Opportunity AI — Agente Adaptativo, Automação e Opportunity Labs",
    description: "Tecnologia que abre novas histórias: Agente Adaptativo, automação comercial e projetos do Opportunity Labs.",
    images: [asset("/assets/og-image.png")],
  },
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
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Sora:wght@400..800&family=JetBrains+Mono:wght@400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
