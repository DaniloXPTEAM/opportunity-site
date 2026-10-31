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
  accentColor: string;
  isConcept?: boolean;
  /** Natureza do projeto (agrupa o catálogo; não é filtro de vitrine). */
  grupo: GrupoProjeto;
  /** Estado real de desenvolvimento — nunca inventar "Disponível". */
  estado: EstadoProjeto;
}

export type GrupoProjeto = "empresariais" | "criacao" | "plataformas" | "jogos" | "pesquisa";
export type EstadoProjeto = "Conceito" | "Em desenvolvimento" | "Demonstração" | "Disponível";

export const LAB_PROJECTS: ProjectItem[] = [
  {
    id: "crm",
    slug: "opportunity-crm",
    title: "Opportunity CRM",
    badge: "Conceito",
    category: "Gestão Comercial & IA",
    lead: "Gestão comercial inteligente com organização de contatos, oportunidades, funil de vendas e automações.",
    desc: "Funil de vendas visual, automações inteligentes de follow-up em 24h e 72h, unificação de conversas do WhatsApp com histórico de clientes.",
    fullDesc: "O Opportunity CRM é uma solução de gestão de relacionamento com clientes em estágio de conceito estruturado, concebida para integrar canais de conversa (especialmente WhatsApp e e-mail) ao funil de vendas. Automatiza etapas críticas, qualificação de leads, lembretes de retorno e relatórios de conversão, eliminando planilhas dispersas.",
    features: [
      "Funil visual kanban com estágios personalizáveis",
      "Histórico centralizado de conversas e transações",
      "Follow-up automatizado pós-atendimento (24h/72h)",
      "Qualificação automática de oportunidades por IA",
      "Integração direta com WhatsApp e e-mail corporativo",
      "Métricas de conversão e tempo de resposta em tempo real"
    ],
    specs: [
      { label: "Status", value: "Conceito estruturado" },
      { label: "Foco", value: "PMEs e equipes comerciais" },
      { label: "Canais", value: "WhatsApp, Web, E-mail" }
    ],
    img: asset("/assets/img/opportunity-crm.jpg"),
    galleryImgs: [asset("/assets/img/opportunity-crm.jpg"), asset("/assets/img/opportunity-crm.jpg")],
    accentColor: "from-blue-600 to-indigo-700",
    grupo: "empresariais",
    estado: "Conceito",
  },
  {
    id: "cineforma",
    slug: "cineforma",
    title: "CineForma",
    badge: "Em desenvolvimento",
    category: "Criação Digital & Audiovisual",
    lead: "Estúdio que transforma histórias e referências em roteiros, storyboards, vídeos e montagem final com IA.",
    desc: "Pipeline audiovisual completo alimentado por inteligência artificial generativa, conectando premissas narrativas a storyboards e vídeos finais.",
    fullDesc: "O CineForma é um estúdio de pesquisa e desenvolvimento que transforma premissas, histórias e referências em roteiros detalhados, storyboards sequenciais, geração de tomadas de vídeo e montagem final com assistência de modelos de linguagem e difusão visual.",
    features: [
      "Geração de roteiros estruturados em formato padrão da indústria",
      "Storyboarding automatizado com consistência de personagens",
      "Geração de planos de cena e animações preliminares",
      "Curadoria de estilos visuais e referências cinematográficas"
    ],
    specs: [
      { label: "Status", value: "Em desenvolvimento ativo" },
      { label: "Área", value: "Cinema, publicidade e games" },
      { label: "Tecnologia", value: "LLMs + Diffusion + Video Gen" }
    ],
    img: asset("/assets/img/cineforma.jpg"),
    galleryImgs: [asset("/assets/img/cineforma.jpg"), asset("/images/lab-cine.jpg")],
    imgsIlustrativas: [asset("/images/lab-cine.jpg")],
    accentColor: "from-amber-500 to-rose-600",
    grupo: "criacao",
    estado: "Em desenvolvimento",
  },
  {
    id: "kirana",
    slug: "kirana",
    title: "Kirana",
    badge: "Em desenvolvimento",
    category: "Agentes Interativos & Automação",
    lead: "Transforme sites, aplicativos e plataformas em experiências interativas com agentes que entendem, orientam e executam.",
    desc: "Agente conversacional residente que ganha a identidade visual da sua marca e executa ações práticas dentro do seu ambiente digital.",
    fullDesc: "Kirana não é um mascote ou imagem estática: é o motor de agentes inteligentes adaptáveis da Opportunity AI. Ela se conecta à base de conhecimento do seu negócio, responde dúvidas de visitantes, navega pela interface, filtra produtos, agenda horários e encaminha para humanos quando necessário.",
    features: [
      "Compreensão de intenções em português natural",
      "Ações na tela (navegação guiada, abertura de catálogo, destaques)",
      "Identidade visual e tom de voz adaptáveis ao segmento",
      "Conexão com catálogo de produtos, serviços e horários",
      "Transição fluida para atendentes humanos no WhatsApp"
    ],
    specs: [
      { label: "Status", value: "Em desenvolvimento / Demos ativas" },
      { label: "Segmentos", value: "Varejo, Pet Shop, Alimentação, Saúde, SaaS" },
      { label: "Modo", value: "Agente conversacional de ação" }
    ],
    img: asset("/assets/img/kirana-1.jpg"),
    galleryImgs: [asset("/assets/img/kirana-1.jpg"), asset("/assets/img/kirana-2.jpg"), asset("/assets/img/kirana-3.jpg")],
    accentColor: "from-cyan-500 to-blue-600",
    grupo: "empresariais",
    estado: "Em desenvolvimento",
  },
  {
    id: "gabi",
    slug: "gabi",
    title: "Gabi",
    badge: "Em desenvolvimento",
    category: "Assistentes de Voz & Android",
    lead: "Assistente Android com avatar 3D, interação fluida por voz e recursos de rotina pessoal.",
    desc: "Aplicativo nativo para dispositivos Android com processamento de voz em tempo real, avatar animado e integração com clima, lembretes e notícias.",
    fullDesc: "Gabi é a assistente pessoal desenvolvida para a plataforma Android, combinando síntese e reconhecimento de voz de baixa latência a um avatar 3D interativo. Criada para demonstrar a aplicação de inteligência artificial embarcada e conectada em rotinas diárias.",
    features: [
      "Interação por comando de voz natural sem digitação",
      "Avatar tridimensional sincronizado com a fala",
      "Consulta de clima, previsão, lembretes e alarmes",
      "Integração nativa com recursos do sistema operacional Android"
    ],
    specs: [
      { label: "Plataforma", value: "Android (APK nativo)" },
      { label: "Status", value: "Em desenvolvimento / Interface oficial" },
      { label: "Entrada", value: "Voz bidirecional + toque" }
    ],
    img: asset("/assets/img/gabi-avatar.jpg"),
    galleryImgs: [asset("/assets/img/gabi-avatar.jpg"), asset("/assets/img/gabi-interface-oficial.jpg")],
    accentColor: "from-purple-500 to-pink-600",
    grupo: "empresariais",
    estado: "Em desenvolvimento",
  },
  {
    id: "mordenrpg",
    slug: "mordenrpg",
    title: "MordenRPG",
    badge: "Em desenvolvimento",
    category: "Plataformas Digitais & RPG",
    lead: "Portal de RPG, comunidade e recursos digitais para jogadores e narradores de mesa.",
    desc: "Ambiente colaborativo digital com fichas inteligentes, geradores de histórias, regras simplificadas e banco de recursos para campanhas.",
    fullDesc: "MordenRPG é um projeto de ambiente digital dedicado à comunidade brasileira de RPG de mesa. Oferece repositório de personagens, suporte a fichas digitais dinâmicas, biblioteca de regras, auxílio para mestres na criação de encontros e ferramentas de suporte narrativo.",
    features: [
      "Fichas digitais completas com cálculo automático de modificadores",
      "Gerador procedural de NPCs, ganchos narrativos e encontros",
      "Comunidade e mural de mesas para grupos de RPG",
      "Interface responsiva pensada para consulta rápida na mesa"
    ],
    specs: [
      { label: "Status", value: "Em desenvolvimento ativo" },
      { label: "Foco", value: "Comunidade de RPG e criadores narrativos" },
      { label: "Recursos", value: "Fichas, regras, geradores, campanhas" }
    ],
    img: asset("/assets/img/mordenrpg-inicio.jpg"),
    galleryImgs: [asset("/assets/img/mordenrpg-inicio.jpg"), asset("/assets/img/mordenrpg-ficha.jpg"), asset("/assets/img/mordenrpg-menu.jpg")],
    accentColor: "from-emerald-600 to-teal-700",
    grupo: "jogos",
    estado: "Em desenvolvimento",
  },
  {
    id: "mesa-vtt",
    slug: "mesa-vtt",
    title: "Armada Nexus RPG",
    badge: "Em desenvolvimento",
    category: "Games & Sistemas Interativos",
    lead: "Mesa virtual de RPG (VTT) com mapas dinâmicos, tokens, fichas, rolagens 3D e sistema de combate.",
    desc: "Ambiente imersivo de mesa virtual desenvolvido sob medida para partidas online, com grid tático, fog of war e rolagem sincronizada.",
    fullDesc: "Armada Nexus RPG é uma plataforma de mesa virtual (Virtual Tabletop) desenvolvida para permitir que grupos joguem RPG online com máxima imersão. Diferente de plataformas genéricas pesadas, foi otimizada para navegadores leves, oferecendo mapas táticos, movimentação fluida de tokens, controle de iniciativa e combate estruturado.",
    features: [
      "Grid tático customizável (quadrados, hexágonos e sem grid)",
      "Tokens de personagens e monstros com barras de vida integradas",
      "Rolador de dados 3D com física realista e histórico",
      "Controle de turnos, iniciativa e efeitos de status dinâmicos"
    ],
    specs: [
      { label: "Status", value: "Em desenvolvimento" },
      { label: "Compatibilidade", value: "Web leve (Chrome, Safari, Firefox)" },
      { label: "Diferencial", value: "Baixa latência e integração nativa" }
    ],
    img: asset("/assets/img/armada-nexus-2.jpg"),
    galleryImgs: [asset("/assets/img/armada-nexus-2.jpg"), asset("/assets/img/armada-nexus-1.jpg")],
    accentColor: "from-violet-600 to-indigo-800",
    grupo: "plataformas",
    estado: "Em desenvolvimento",
  },
  {
    id: "image-studio",
    slug: "image-studio",
    title: "AI Image Studio",
    badge: "Em desenvolvimento",
    category: "IA Generativa & Arte Digital",
    lead: "Exploração de geração de imagens por API para personagens, cenários e artes conceituais de games.",
    desc: "Laboratório interno de testes e refinamento de prompts, modelos de difusão e pipelines de consistência de estilo visual.",
    fullDesc: "O AI Image Studio é o ambiente de experimentação técnica da Opportunity AI onde são avaliadas APIs de geração de imagens, pipelines de difusão (SDXL, FLUX, Midjourney) e técnicas de controle de estilo, gerando ativos conceituais para os demais projetos do laboratório.",
    features: [
      "Testes de consistência facial e anatômica em personagens",
      "Geração de cenários isométricos e ilustrações temáticas",
      "Automação de variação de poses, roupas e iluminação",
      "Benchmark de velocidade, resolução e custos de inferência"
    ],
    specs: [
      { label: "Status", value: "Em desenvolvimento / Pesquisa" },
      { label: "Modelos", value: "Flux, SDXL, APIs especializadas" },
      { label: "Uso", value: "Ativos conceituais e prototipagem" }
    ],
    img: asset("/assets/img/studio-1.jpg"),
    galleryImgs: [asset("/assets/img/studio-1.jpg"), asset("/assets/img/studio-2.jpg")],
    accentColor: "from-fuchsia-600 to-purple-800",
    grupo: "criacao",
    estado: "Em desenvolvimento",
  },
  {
    id: "creators",
    slug: "creators",
    title: "Opportunity Creators",
    badge: "Em desenvolvimento",
    category: "Personagens & Influenciadoras IA",
    lead: "Personagens digitais, influenciadoras e produção audiovisual com inteligência artificial.",
    desc: "Criação de personas digitais consistentes para marcas, comunicação institucional e campanhas digitais com identidade preservada.",
    fullDesc: "Opportunity Creators pesquisa e implementa a criação de personagens digitais e influenciadoras virtuais com consistência de identidade, expressões e narrativas. A fotografia oficial com cinco personagens femininas representa o material autêntico do projeto, desenvolvido para manter coerência visual em múltiplos formatos e campanhas.",
    features: [
      "Consistência fotográfica rigorosa entre múltiplas tomadas",
      "Definição de biografia, tom de voz e diretrizes de marca",
      "Produção de conteúdo para redes sociais e comunicação corporativa",
      "Integração futura com vozes sintetizadas e animação labial"
    ],
    specs: [
      { label: "Status", value: "Em desenvolvimento" },
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
    estado: "Em desenvolvimento",
  },
  {
    id: "rpg-comic",
    slug: "rpg-comic-chronicles",
    title: "RPG Comic Chronicles",
    badge: "Em desenvolvimento",
    category: "Quadrinhos & Narrativa com IA",
    lead: "Transforma o roteiro de uma aventura de RPG, ou qualquer história, em revista em quadrinhos ilustrada.",
    desc: "Pipeline de conversão de transcrições de sessões de RPG e roteiros literários em páginas de quadrinhos estruturadas com requadros e balões.",
    fullDesc: "RPG Comic Chronicles é uma iniciativa do Opportunity Labs para transformar diários de campanha de RPG e narrativas escritas em páginas completas de história em quadrinhos. O sistema analisa diálogos, divide a ação em requadros cinematográficos, sugere layouts de página e gera arte ilustrativa com linguagem de graphic novel.",
    features: [
      "Segmentação automática de histórias em cenas e requadros",
      "Geração de balões de diálogo, onomatopeias e recordatórios",
      "Estilos de arte selecionáveis (HQ clássica, mangá, graphic novel)",
      "Exportação em formato PDF para impressão e leitura digital"
    ],
    specs: [
      { label: "Status", value: "Em desenvolvimento ativo" },
      { label: "Arte", value: "Ilustração conceitual recém-adicionada" },
      { label: "Entrada", value: "Sessões de RPG, contos, roteiros" }
    ],
    img: asset("/assets/img/rpg-comic-chronicles.jpg"),
    galleryImgs: [asset("/assets/img/rpg-comic-chronicles.jpg")],
    imgsIlustrativas: [asset("/assets/img/rpg-comic-chronicles.jpg")],
    accentColor: "from-amber-600 to-yellow-500",
    grupo: "pesquisa",
    estado: "Em desenvolvimento",
  }
];

export const SERVICES = [
  {
    n: "01",
    id: "agentes-personalizados",
    title: "Agentes de IA personalizados",
    desc: "Triagem de pedidos, consulta a bases de conhecimento e suporte a rotinas operacionais sem burocracia.",
    problem: "Tarefas que dependem de interpretar pedidos em linguagem natural consomem tempo excessivo da equipe humana.",
    application: "Agentes configurados com as regras e dados do seu negócio, capazes de responder com precisão e executar ações autorizadas.",
    items: ["Respostas imediatas em linguagem natural", "Conexão com base de dados do negócio", "Supervisão humana e escalonamento"],
    prazo: "Piloto em 14 dias",
    metric: "38s",
    metricLabel: "resposta média"
  },
  {
    n: "02",
    id: "atendimento-whatsapp",
    title: "Atendimento digital e WhatsApp",
    desc: "Responde dúvidas frequentes, qualifica leads e resolve solicitações no canal que o seu cliente mais utiliza.",
    problem: "Mensagens acumuladas fora do horário comercial resultam em perda de vendas e insatisfação dos clientes.",
    application: "Atendimento contínuo 24/7 com inteligência de contexto, sem menus rígidos de 'digite 1 para falar com financeiro'.",
    items: ["Disponibilidade 24 horas por dia", "Tom de voz alinhado à sua marca", "Transição transparente para humanos"],
    prazo: "10 dias",
    metric: "24/7",
    metricLabel: "cobertura contínua"
  },
  {
    n: "03",
    id: "crm-vendas",
    title: "CRM e automação de vendas",
    desc: "Cada conversa vira etapa no funil, com responsável definido e follow-up automático em 24h e 72h.",
    problem: "Contatos comerciais se perdem em conversas soltas no WhatsApp sem registro nem disciplina de retorno.",
    application: "Organização automática dos contatos em estágios claros de negociação, com disparos pontuais de lembretes.",
    items: ["Funil de vendas kanban disciplinado", "Registro automático das interações", "Follow-up pontual sem esquecimentos"],
    prazo: "Implantação guiada",
    metric: "100%",
    metricLabel: "contatos registrados"
  },
  {
    n: "04",
    id: "workflows-automacao",
    title: "Workflows e automação de processos",
    desc: "Conexão fluida entre ERP, planilhas, CRM, agenda e e-commerce via APIs REST e webhooks seguros.",
    problem: "Equipes gastam horas copiando dados manualmente entre sistemas incompatíveis e gerando retrabalho.",
    application: "Fluxos de dados automáticos que transferem informações instantaneamente entre suas ferramentas de trabalho.",
    items: ["Integração via APIs e Webhooks", "Eliminação de tarefas manuais repetitivas", "Alertas de inconsistência e logs"],
    prazo: "Mapa em 1 semana",
    metric: "-18h",
    metricLabel: "tarefas manuais/sem"
  },
  {
    n: "05",
    id: "relatorios-inteligentes",
    title: "Relatórios inteligentes",
    desc: "Transforma indicadores dispersos em resumos executivos claros, gerados semanalmente para a liderança.",
    problem: "Dados espalhados em dezenas de planilhas dificultam a tomada de decisão rápida e estratégica.",
    application: "Painéis e relatórios sintetizados por IA que destacam os pontos de atenção e oportunidades reais.",
    items: ["Consolidação de fontes múltiplas", "Destaque de anomalias e tendências", "Envio semanal pronto para diretoria"],
    prazo: "Primeiro ciclo em dias",
    metric: "1",
    metricLabel: "resumo executivo/semana"
  },
  {
    n: "06",
    id: "agentes-voz",
    title: "Agentes de voz e Android",
    desc: "Assistentes conversacionais por voz e aplicativos Android nativos com histórico unificado e baixa latência.",
    problem: "Clientes com preferência por voz ou ambientes móveis demandam experiências ágeis sem uso de teclado.",
    application: "Protótipos e sistemas operacionais de voz com síntese humanizada e integração a sistemas centrais.",
    items: ["Processamento de voz de baixa latência", "Aplicativos para ecossistema Android", "Histórico unificado multicanal"],
    prazo: "Sob consulta técnica",
    metric: "<1s",
    metricLabel: "latência de fala"
  }
];

export const WORK_PROCESS = [
  {
    step: "01",
    title: "Entender a necessidade",
    desc: "Mapeamos os gargalos operacionais da sua empresa, processos manuais que consomem tempo e oportunidades reais de aplicação de IA."
  },
  {
    step: "02",
    title: "Desenhar a solução",
    desc: "Definimos o escopo técnico exato: arquitetura do agente, integrações necessárias, canais de atendimento e critérios de supervisão humana."
  },
  {
    step: "03",
    title: "Prototipar",
    desc: "Construímos uma versão funcional e interativa em curto prazo para validação prática com a equipe da sua empresa."
  },
  {
    step: "04",
    title: "Testar e calibrar",
    desc: "Submetemos o agente e as automações a testes exaustivos com dados reais, ajustando tom de voz, regras de negócio e precisão das respostas."
  },
  {
    step: "05",
    title: "Evoluir e integrar",
    desc: "Colocamos a solução em operação assistida, acompanhando métricas reais e promovendo melhorias contínuas conforme sua empresa cresce."
  }
];

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
