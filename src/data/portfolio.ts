import { asset } from "@/lib/asset";

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  badge: string;
  category: string;
  lead: string;
  desc: string;
  fullDesc: string;
  features: string[];
  specs: { label: string; value: string }[];
  img: string;
  galleryImgs?: string[];
  /** Imagens deste projeto geradas por IA (ilustração/conceito, não captura real). Recebem etiqueta no site. */
  imgsIlustrativas?: string[];
  /** Imagens conceituais (não são captura real do produto), como no site anterior. Recebem a etiqueta "Ilustração conceitual". */
  imgsConceituais?: string[];
  /** Endereço do projeto no ar, quando existe (vem do site antigo, opportunity.ia.br/labs/<projeto>). */
  acessoUrl?: string;
  /** Aviso exibido no detalhe do projeto (ex.: direitos de terceiros). */
  aviso?: string;
  accentColor: string;
  isConcept?: boolean;
  /** Natureza do projeto (agrupa o catálogo; não é filtro de vitrine). */
  grupo: GrupoProjeto;
  /** Estado real do projeto — "Ativo" = em andamento e mantido pela equipe; nunca usar "Disponível" sem validação em produção. */
  estado: EstadoProjeto;
}

export type GrupoProjeto = "empresariais" | "criacao" | "plataformas" | "jogos" | "pesquisa";
export type EstadoProjeto = "Ativo" | "Conceito" | "Em desenvolvimento" | "Demonstração" | "Disponível";

const PROJETOS: ProjectItem[] = [
  {
    id: "crm",
    slug: "opportunity-crm",
    title: "Opportunity CRM",
    badge: "Ativo",
    category: "Gestão Comercial & IA",
    lead: "Gestão comercial inteligente com organização de contatos, oportunidades, funil de vendas e automações.",
    desc: "Funil de vendas visual, automações inteligentes de follow-up em 24h e 72h, unificação de conversas do WhatsApp com histórico de clientes.",
    fullDesc: "O Opportunity CRM é uma solução de gestão de relacionamento com clientes ativa no Opportunity Labs, concebida para integrar canais de conversa (especialmente WhatsApp e e-mail) ao funil de vendas. Automatiza etapas críticas, qualificação de leads, lembretes de retorno e relatórios de conversão, eliminando planilhas dispersas.",
    features: [
      "Funil visual kanban com estágios personalizáveis",
      "Histórico centralizado de conversas e transações",
      "Follow-up automatizado pós-atendimento (24h/72h)",
      "Qualificação automática de oportunidades por IA",
      "Integração direta com WhatsApp e e-mail corporativo",
      "Métricas de conversão e tempo de resposta em tempo real",
      "Cadastro e organização de clientes e gerenciamento de leads",
      "Tarefas e lembretes comerciais",
      "Integração planejada com agentes de IA"
    ],
    specs: [
      { label: "Status", value: "Ativo" },
      { label: "Foco", value: "PMEs e equipes comerciais" },
      { label: "Canais", value: "WhatsApp, Web, E-mail" }
    ],
    img: asset("/assets/img/opportunity-crm.jpg"),
    galleryImgs: [asset("/assets/img/opportunity-crm.jpg")],
    imgsConceituais: [asset("/assets/img/opportunity-crm.jpg")],
    accentColor: "from-blue-600 to-indigo-700",
    grupo: "empresariais",
    estado: "Ativo",
  },
  {
    id: "cineforma",
    slug: "cineforma",
    title: "CineForma",
    badge: "Ativo",
    category: "Criação Digital & Audiovisual",
    lead: "Estúdio que transforma histórias e referências em roteiros, storyboards, vídeos e montagem final com IA.",
    desc: "Pipeline audiovisual completo alimentado por inteligência artificial generativa, conectando premissas narrativas a storyboards e vídeos finais.",
    fullDesc: "O CineForma é um estúdio de pesquisa e desenvolvimento que transforma premissas, histórias e referências em roteiros detalhados, storyboards sequenciais, geração de tomadas de vídeo e montagem final com assistência de modelos de linguagem e difusão visual.",
    features: [
      "Geração de roteiros estruturados em formato padrão da indústria",
      "Storyboarding automatizado com consistência de personagens",
      "Geração de planos de cena e animações preliminares",
      "Curadoria de estilos visuais e referências cinematográficas",
      "Geração de vídeos por provedores (Google Flow no navegador ou API Google)",
      "Supervisão de continuidade e de qualidade antes da montagem final"
    ],
    specs: [
      { label: "Status", value: "Ativo" },
      { label: "Área", value: "Cinema, publicidade e games" },
      { label: "Tecnologia", value: "LLMs + Diffusion + Video Gen" }
    ],
    img: asset("/assets/img/cineforma.jpg"),
    galleryImgs: [asset("/assets/img/cineforma.jpg"), asset("/images/lab-cine.jpg")],
    imgsIlustrativas: [asset("/images/lab-cine.jpg")],
    accentColor: "from-amber-500 to-rose-600",
    grupo: "criacao",
    estado: "Ativo",
  },
  {
    id: "agente-adaptativo",
    slug: "agente-adaptativo",
    title: "Agente Adaptativo",
    badge: "Ativo",
    category: "Agentes Interativos & Automação",
    lead: "Agentes de IA que assumem a identidade da sua marca e atuam em sites, aplicativos, atendimento e jogos: entendem, orientam e executam.",
    desc: "Agente conversacional residente que ganha a identidade visual da sua marca e executa ações práticas dentro do seu ambiente digital.",
    fullDesc: "O Agente Adaptativo é o motor de agentes inteligentes adaptáveis da Opportunity AI: um mesmo agente que assume diferentes identidades, personalidades e funções conforme o ambiente em que atua. Ele se conecta à base de conhecimento do seu negócio, responde dúvidas de visitantes, navega pela interface, filtra produtos, agenda horários e encaminha para pessoas quando necessário. Aqui, neste site, ele atende como Kirana, a atendente principal.",
    features: [
      "Compreensão de intenções em português natural",
      "Ações na tela (navegação guiada, abertura de catálogo, destaques)",
      "Identidade visual e tom de voz adaptáveis ao segmento",
      "Conexão com catálogo de produtos, serviços e horários",
      "Transição fluida para atendentes humanos no WhatsApp",
      "Navegação assistida e localização de páginas e funcionalidades",
      "Execução de ações autorizadas por ferramentas e APIs, com confirmação quando necessário",
      "Integração com sites, WhatsApp, Telegram, aplicativos e jogos",
      "Identidades personalizáveis (Kirana, a atendente deste site; Rafael, Ruby e novas personas)",
      "Autonomia controlada por permissões: ações sensíveis exigem autorização"
    ],
    specs: [
      { label: "Status", value: "Ativo" },
      { label: "Segmentos", value: "Varejo, Pet Shop, Alimentação, Saúde, SaaS" },
      { label: "Modo", value: "Agente conversacional de ação" }
    ],
    img: asset("/assets/img/hero-agent-adaptive.jpg"),
    galleryImgs: [
      asset("/assets/img/hero-agent-adaptive.jpg"),
      asset("/assets/img/kirana-1.jpg"),
      asset("/assets/img/kirana-2.jpg"),
      asset("/assets/img/kirana-3.jpg")
    ],
    accentColor: "from-cyan-500 to-blue-600",
    grupo: "empresariais",
    estado: "Ativo",
  },
  {
    id: "gabi",
    slug: "gabi",
    title: "Gabi",
    badge: "Ativo",
    category: "Assistentes de Voz & Android",
    lead: "Assistente Android com avatar 3D, interação fluida por voz e recursos de rotina pessoal.",
    desc: "Aplicativo nativo para dispositivos Android com processamento de voz em tempo real, avatar animado e integração com clima, lembretes e notícias.",
    fullDesc: "Gabi é a assistente pessoal desenvolvida para a plataforma Android, combinando síntese e reconhecimento de voz de baixa latência a um avatar 3D interativo. Criada para demonstrar a aplicação de inteligência artificial embarcada e conectada em rotinas diárias.",
    features: [
      "Interação por comando de voz natural sem digitação",
      "Avatar tridimensional sincronizado com a fala",
      "Consulta de clima, previsão, lembretes e alarmes",
      "Integração nativa com recursos do sistema operacional Android",
      "Reconhecimento de comandos e respostas faladas",
      "Área de notificações e avisos e recursos de memória",
      "Área interativa “Quarto da Gabi”",
      "Pesquisa de voz natural em português brasileiro e de processamento local com baixa latência"
    ],
    specs: [
      { label: "Plataforma", value: "Android (APK nativo)" },
      { label: "Status", value: "Ativo" },
      { label: "Entrada", value: "Voz bidirecional + toque" }
    ],
    img: asset("/assets/img/gabi-interface-oficial.jpg"),
    galleryImgs: [asset("/assets/img/gabi-interface-oficial.jpg"), asset("/assets/img/gabi-avatar.jpg")],
    accentColor: "from-purple-500 to-pink-600",
    grupo: "empresariais",
    estado: "Ativo",
  },
  {
    id: "mordenrpg",
    slug: "mordenrpg",
    title: "MordenRPG",
    badge: "Ativo",
    category: "Plataformas Digitais & RPG",
    lead: "Portal de RPG, comunidade e recursos digitais para jogadores e narradores de mesa.",
    desc: "Ambiente colaborativo digital com fichas inteligentes, geradores de histórias, regras simplificadas e banco de recursos para campanhas.",
    fullDesc: "MordenRPG é um projeto de ambiente digital dedicado à comunidade brasileira de RPG de mesa. Oferece repositório de personagens, suporte a fichas digitais dinâmicas, biblioteca de regras, auxílio para mestres na criação de encontros e ferramentas de suporte narrativo.",
    features: [
      "Fichas digitais completas com cálculo automático de modificadores",
      "Gerador procedural de NPCs, ganchos narrativos e encontros",
      "Comunidade e mural de mesas para grupos de RPG",
      "Interface responsiva pensada para consulta rápida na mesa",
      "Portal digital de RPG com organização de informações e conteúdos",
      "Recursos para jogadores e narradores e apoio à organização de campanhas",
      "Acesso a sistemas e ferramentas complementares",
      "Compêndio do Tormenta 20: raças, classes e distinções, equipamentos, magias e monstros",
      "Oficina de Heróis para criar e guardar personagens, com homebrew e criador de magias",
      "Mesa online com campanhas, one-shots e mesas privativas por código ou link"
    ],
    acessoUrl: "https://xpteamrpg.github.io/mesaonline/",
    aviso: "Projeto de fãs, sem fins comerciais. O conteúdo oficial do Tormenta 20 pertence aos seus respectivos autores.",
    specs: [
      { label: "Status", value: "Ativo" },
      { label: "Foco", value: "Comunidade de RPG e criadores narrativos" },
      { label: "Recursos", value: "Fichas, regras, geradores, campanhas" }
    ],
    img: asset("/assets/img/mordenrpg-inicio.jpg"),
    galleryImgs: [asset("/assets/img/mordenrpg-inicio.jpg"), asset("/assets/img/mordenrpg-ficha.jpg"), asset("/assets/img/mordenrpg-menu.jpg")],
    accentColor: "from-emerald-600 to-teal-700",
    grupo: "jogos",
    estado: "Ativo",
  },
  {
    id: "mesa-vtt",
    slug: "mesa-vtt",
    title: "Armada Nexus RPG",
    badge: "Ativo",
    category: "Games & Sistemas Interativos",
    lead: "Mesa virtual de RPG (VTT) com mapas dinâmicos, tokens, fichas, rolagens 3D e sistema de combate.",
    desc: "Ambiente imersivo de mesa virtual desenvolvido sob medida para partidas online, com grid tático, fog of war e rolagem sincronizada.",
    fullDesc: "Armada Nexus RPG é uma plataforma de mesa virtual (Virtual Tabletop) desenvolvida para permitir que grupos joguem RPG online com máxima imersão. Diferente de plataformas genéricas pesadas, foi otimizada para navegadores leves, oferecendo mapas táticos, movimentação fluida de tokens, controle de iniciativa e combate estruturado.",
    features: [
      "Grid tático customizável (quadrados, hexágonos e sem grid)",
      "Tokens de personagens e monstros com barras de vida integradas",
      "Rolador de dados 3D com física realista e histórico",
      "Controle de turnos, iniciativa e efeitos de status dinâmicos",
      "Mapas de batalha e fichas digitais",
      "Gerenciamento de pontos de vida e recursos",
      "Automação de regras e cálculos",
      "Fog of war (névoa de guerra), modo tático com combate e modo explorador",
      "Projeto independente: funciona sozinho ou integrado ao portal MordenRPG, com a ficha ligada diretamente à mesa e importando os mesmos dados",
      "Uso, customização e arremesso de armas, com poderes e magias aplicados na mesa",
      "Magias, poderes e bestiário do Tormenta 20 disponíveis na mesa",
      "Campanhas oficiais para clonar e editar, com painel do mestre"
    ],
    acessoUrl: "https://xpteamrpg.github.io/mesaonline/mesa/",
    aviso: "Projeto de fãs, sem fins comerciais. O conteúdo oficial do Tormenta 20 pertence aos seus respectivos autores.",
    specs: [
      { label: "Status", value: "Ativo" },
      { label: "Compatibilidade", value: "Web leve (Chrome, Safari, Firefox)" },
      { label: "Diferencial", value: "Baixa latência e integração nativa" }
    ],
    img: asset("/assets/img/armada-nexus-2.jpg"),
    galleryImgs: [asset("/assets/img/armada-nexus-2.jpg"), asset("/assets/img/armada-nexus-1.jpg")],
    accentColor: "from-violet-600 to-indigo-800",
    grupo: "plataformas",
    estado: "Ativo",
  },
  {
    id: "image-studio",
    slug: "image-studio",
    title: "AI Image Studio",
    badge: "Ativo",
    category: "IA Generativa & Arte Digital",
    lead: "Exploração de geração de imagens por API para personagens, cenários e artes conceituais de games.",
    desc: "Laboratório interno de testes e refinamento de prompts, modelos de difusão e pipelines de consistência de estilo visual.",
    fullDesc: "O AI Image Studio é o ambiente de experimentação técnica da Opportunity AI onde são avaliadas APIs de geração de imagens, pipelines de difusão (SDXL, FLUX, Midjourney) e técnicas de controle de estilo, gerando ativos conceituais para os demais projetos do laboratório.",
    features: [
      "Testes de consistência facial e anatômica em personagens",
      "Geração de cenários isométricos e ilustrações temáticas",
      "Automação de variação de poses, roupas e iluminação",
      "Benchmark de velocidade, resolução e custos de inferência",
      "Integração com APIs de geração de imagens e seleção de modelos, conforme disponibilidade",
      "Gerador de imagens local (LongCat), que roda no próprio computador",
      "Concept art para games, com pré-visualização e organização das imagens geradas"
    ],
    specs: [
      { label: "Status", value: "Ativo" },
      { label: "Modelos", value: "Flux, SDXL, APIs especializadas" },
      { label: "Uso", value: "Ativos conceituais e prototipagem" }
    ],
    img: asset("/assets/img/studio-1.jpg"),
    galleryImgs: [asset("/assets/img/studio-1.jpg"), asset("/assets/img/studio-2.jpg")],
    accentColor: "from-fuchsia-600 to-purple-800",
    grupo: "criacao",
    estado: "Ativo",
  },
  {
    id: "creators",
    slug: "creators",
    title: "Opportunity Creators",
    badge: "Ativo",
    category: "Personagens & Influenciadoras IA",
    lead: "Personagens digitais, influenciadoras e produção audiovisual com inteligência artificial.",
    desc: "Criação de personas digitais consistentes para marcas, comunicação institucional e campanhas digitais com identidade preservada.",
    fullDesc: "Opportunity Creators pesquisa e implementa a criação de personagens digitais e influenciadoras virtuais com consistência de identidade, expressões e narrativas. A fotografia oficial com cinco personagens femininas representa o material autêntico do projeto, desenvolvido para manter coerência visual em múltiplos formatos e campanhas.",
    features: [
      "Consistência fotográfica rigorosa entre múltiplas tomadas",
      "Definição de biografia, tom de voz e diretrizes de marca",
      "Produção de conteúdo para redes sociais e comunicação corporativa",
      "Integração futura com vozes sintetizadas e animação labial",
      "Desenvolvimento de influenciadoras digitais e personagens virtuais",
      "Produção de imagens, roteiros e vídeos",
      "Campanhas publicitárias e conteúdo para TikTok e Instagram",
      "Conteúdo das personagens produzido no AI Image Studio, a partir da imagem do produto e da referência"
    ],
    specs: [
      { label: "Status", value: "Ativo" },
      { label: "Material", value: "Fotografia e personas originais preservadas" },
      { label: "Aplicações", value: "Marcas, redes sociais, storytelling" }
    ],
    img: asset("/assets/img/creators-cinco-personagens.jpg"),
    galleryImgs: [
      asset("/assets/img/creators-cinco-personagens.jpg"),
      asset("/assets/img/creators-tres-personagens.jpg"),
      asset("/assets/img/creators-quatro-personagens.jpg")
    ],
    accentColor: "from-rose-500 to-orange-600",
    grupo: "pesquisa",
    estado: "Ativo",
  },
  {
    id: "rpg-comic",
    slug: "rpg-comic-chronicles",
    title: "RPG Comic Chronicles",
    badge: "Ativo",
    category: "Quadrinhos & Narrativa com IA",
    lead: "Transforma o roteiro de uma aventura de RPG, ou qualquer história, em revista em quadrinhos ilustrada.",
    desc: "Pipeline de conversão de transcrições de sessões de RPG e roteiros literários em páginas de quadrinhos estruturadas com requadros e balões.",
    fullDesc: "RPG Comic Chronicles é uma iniciativa do Opportunity Labs para transformar diários de campanha de RPG e narrativas escritas em páginas completas de história em quadrinhos. O sistema analisa diálogos, divide a ação em requadros cinematográficos, sugere layouts de página e gera arte ilustrativa com linguagem de graphic novel.",
    features: [
      "Segmentação automática de histórias em cenas e requadros",
      "Geração de balões de diálogo, onomatopeias e recordatórios",
      "Estilos de arte selecionáveis (HQ clássica, mangá, graphic novel)",
      "Exportação em formato PDF para impressão e leitura digital",
      "Roteiro da missão, personagens e ambientes com imagens de referência",
      "Verificação de consistência dos personagens no storyboard antes de gerar as cenas"
    ],
    specs: [
      { label: "Status", value: "Ativo" },
      { label: "Arte", value: "Ilustração gerada por IA" },
      { label: "Entrada", value: "Sessões de RPG, contos, roteiros" }
    ],
    img: asset("/assets/img/rpg-comic-chronicles.jpg"),
    galleryImgs: [asset("/assets/img/rpg-comic-chronicles.jpg")],
    imgsIlustrativas: [asset("/assets/img/rpg-comic-chronicles.jpg")],
    accentColor: "from-amber-600 to-yellow-500",
    grupo: "pesquisa",
    estado: "Ativo",
  }
];

/**
 * Ordem da vitrine: primeiro o que tem mais apelo comercial para empresas (agente, CRM, vídeo, voz,
 * personagens, imagens) e só depois os projetos de comunidade e jogos.
 */
const ORDEM_COMERCIAL = [
  "agente-adaptativo",
  "crm",
  "cineforma",
  "gabi",
  "creators",
  "image-studio",
  "mordenrpg",
  "mesa-vtt",
  "rpg-comic",
];

export const LAB_PROJECTS: ProjectItem[] = ORDEM_COMERCIAL.map((id) => PROJETOS.find((p) => p.id === id)!).concat(
  PROJETOS.filter((p) => !ORDEM_COMERCIAL.includes(p.id)),
);

export const TECH_STACK = [
  {
    title: "Modelos de Linguagem (LLMs)",
    desc: "Conexão com os melhores modelos globais (OpenAI, Anthropic, Google, open-source), selecionados conforme custo e precisão."
  },
  {
    title: "Contexto e Regras de Negócio",
    desc: "Bases de conhecimento estruturadas com vetores (RAG) para garantir que as respostas sigam as diretrizes e preços reais da sua marca."
  },
  {
    title: "APIs e Integrações de Sistemas",
    desc: "Conexão bidirecional com CRM, ERPs, sistemas de cobrança, agendamento de consultas e bancos de dados corporativos."
  },
  {
    title: "Multicanal Unificado",
    desc: "Presença simultânea no WhatsApp, Web, Instagram, e-mail e interfaces de voz, mantendo o histórico do cliente sincronizado."
  },
  {
    title: "Supervisão Humana (Human-in-the-loop)",
    desc: "Painel de controle com transição transparente: quando um assunto exige julgamento humano, o atendente assume com 1 clique."
  },
  {
    title: "Segurança e Governança",
    desc: "Proteção de dados em conformidade com a LGPD, criptografia de chaves, logs de auditoria e limitação estrita de permissões."
  }
];
