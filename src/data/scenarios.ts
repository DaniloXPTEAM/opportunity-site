export interface DemoScenario {
  id: string;
  name: string;
  category: string;
  badge: string;
  agentName: string;
  agentRole: string;
  agentAvatar: string;
  agentEmoji: string;
  brandColor: string;
  accentBg: string;
  tagline: string;
  mockUI: {
    bannerTitle: string;
    bannerSubtitle: string;
    items: { title: string; price: string; note: string; tag?: string }[];
    statusBadge: string;
    locationInfo: string;
  };
  suggestedQuestions: string[];
  knowledgeBase: {
    businessName: string;
    hours: string;
    delivery: string;
    deliveryFee: string;
    catalogHighlights: { item: string; price: string; desc: string }[];
    fallbackMessage: string;
  };
  sampleResponses: Record<string, string>;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "padaria",
    name: "Padaria Artesanal",
    category: "Alimentação & Varejo Local",
    badge: "Pão D'Ouro",
    agentName: "Padeirinho Kirana",
    agentRole: "Atendente Virtual & Pedidos",
    agentAvatar: "🥖",
    agentEmoji: "🥖",
    brandColor: "#d97706",
    accentBg: "bg-amber-500",
    tagline: "Pães quentinhos saindo a cada 30 minutos e encomendas direto no chat.",
    mockUI: {
      bannerTitle: "Padaria Artesanal Pão D'Ouro",
      bannerSubtitle: "Fornadas frescas desde as 06h00 da manhã no seu bairro",
      statusBadge: "🟢 Fornada quente agora!",
      locationInfo: "Rua das Flores, 142 · Entregas em até 40 min",
      items: [
        { title: "Pão Francês Tradicional", price: "R$ 18,90 / kg", note: "Crocante por fora, macio por dentro", tag: "Mais pedido" },
        { title: "Bolo Caseiro de Chocolate", price: "R$ 32,00 a unidade", note: "Cobertura cremosa de brigadeiro", tag: "Fornada da tarde" },
        { title: "Croissant Folhado Francês", price: "R$ 12,50 a unidade", note: "Com manteiga de verdade", tag: "Especial" },
        { title: "Café Especial Coado", price: "R$ 7,00 copo 200ml", note: "Grãos 100% arábica selecionados" }
      ]
    },
    suggestedQuestions: [
      "Quanto custa o pão francês?",
      "Vocês entregam? Qual é a taxa?",
      "Tem bolo de chocolate hoje?",
      "Quero pedir 10 pães franceses"
    ],
    knowledgeBase: {
      businessName: "Padaria Pão D'Ouro (Demonstração)",
      hours: "Segunda a sábado das 06h00 às 20h00, domingos até as 13h00",
      delivery: "Sim, entregamos em um raio de até 4km via motoboy parceiro.",
      deliveryFee: "Taxa fixa de R$ 6,00 para pedidos até 3km; acima disso, sob consulta.",
      catalogHighlights: [
        { item: "Pão Francês", price: "R$ 18,90/kg (aprox. R$ 0,95 por unidade média)", desc: "Fornadas a cada 30 minutos" },
        { item: "Bolo de Chocolate", price: "R$ 32,00", desc: "Com cobertura artesanal de brigadeiro" },
        { item: "Croissant", price: "R$ 12,50", desc: "Massa folhada autêntica com manteiga" }
      ],
      fallbackMessage: "Essa informação não consta no catálogo demonstrativo da Padaria Pão D'Ouro."
    },
    sampleResponses: {
      // Direct exact match for suggested question 1
      "quanto custa o pão francês?": "Nosso pão francês tradicional custa R$ 18,90 o quilo (cada unidade de 50g sai em média por apenas R$ 0,95). Nossas fornadas saem quentinhas e estalando a cada 30 minutos!",
      // Direct exact match for suggested question 2
      "vocês entregam? qual é a taxa?": "Sim, entregamos em até 40 minutos em um raio de até 4km! A taxa de entrega é fixa em R$ 6,00 para o bairro. Se preferir, pode retirar quentinho no balcão sem fila.",
      // Direct exact match for suggested question 3
      "tem bolo de chocolate hoje?": "Temos sim! Nosso famoso Bolo Caseiro de Chocolate com cobertura cremosa de brigadeiro saiu na fornada da tarde. A unidade inteira custa R$ 32,00. Quer que reserve um para você?",
      // Direct exact match for suggested question 4
      "quero pedir 10 pães franceses": "Perfeito! Anotei seu pedido de 10 pães franceses quentinhos (aproximadamente R$ 9,50). Deseja que envie via motoboy (taxa R$ 6,00) ou prefere retirar aqui no balcão da Rua das Flores, 142?",
      // Keyword fallbacks
      "pao": "Nosso pão francês tradicional custa R$ 18,90 o quilo (cada unidade de 50g sai em média por R$ 0,95). As fornadas saem quentinhas a cada 30 minutos!",
      "entrega": "Sim! Entregamos em até 40 minutos em um raio de 4km. A taxa de entrega é fixa em R$ 6,00 para o bairro.",
      "taxa": "A taxa de entrega é fixa em R$ 6,00 para um raio de até 3km no bairro.",
      "bolo": "Temos sim! O Bolo Caseiro de Chocolate com cobertura cremosa de brigadeiro está disponível na fornada da tarde por R$ 32,00.",
      "pedir": "Perfeito! Anotei 10 pães franceses (aproximadamente R$ 9,50). Deseja adicionar mais algum item, como nosso café especial ou bolo?"
    }
  },
  {
    id: "petshop",
    name: "Pet Shop & Clínica",
    category: "Serviços & Cuidados Animais",
    badge: "Amigo Fiel",
    agentName: "Toby Kirana",
    agentRole: "Consultor Pet & Agendamentos",
    agentAvatar: "🐾",
    agentEmoji: "🐶",
    brandColor: "#059669",
    accentBg: "bg-emerald-600",
    tagline: "Banho, tosa com carinho, consultas veterinárias e rações premium.",
    mockUI: {
      bannerTitle: "Pet Shop & Estética Amigo Fiel",
      bannerSubtitle: "Cuidado humanizado e carinho para cães e gatos",
      statusBadge: "✂️ Horários disponíveis hoje",
      locationInfo: "Av. Brasil, 850 · Transporte Pet Táxi disponível",
      items: [
        { title: "Banho & Tosa Higiênica", price: "A partir de R$ 65,00", note: "Inclui corte de unhas e limpeza de ouvidos", tag: "Popular" },
        { title: "Ração Premium Filhotes 10kg", price: "R$ 189,90", note: "Rica em DHA, sem corantes artificiais", tag: "Estoque garantido" },
        { title: "Consulta Veterinária Geral", price: "R$ 140,00", note: "Com agendamento prévio ou encaixe", tag: "Clínica" },
        { title: "Tosa na Tesoura Específica", price: "A partir de R$ 95,00", note: "Especial para Spitz, Poodle e Shih-tzu" }
      ]
    },
    suggestedQuestions: [
      "Vocês fazem banho e tosa?",
      "Tem ração para filhotes?",
      "Quero agendar um horário para sábado",
      "Vocês têm serviço de táxi pet?"
    ],
    knowledgeBase: {
      businessName: "Pet Shop Amigo Fiel (Demonstração)",
      hours: "Segunda a sábado das 08h00 às 19h00",
      delivery: "Sim, entregamos rações e medicamentos no mesmo dia para compras até 15h.",
      deliveryFee: "Grátis para compras acima de R$ 120,00 na região.",
      catalogHighlights: [
        { item: "Banho & Tosa", price: "R$ 65,00 (porte pequeno) / R$ 85,00 (porte médio)", desc: "Inclui corte de unha e limpeza de ouvido" },
        { item: "Ração Filhotes 10kg", price: "R$ 189,90", desc: "Super Premium com ômega 3 e 6" },
        { item: "Consulta Veterinária", price: "R$ 140,00", desc: "Atendimento clínico preventivo" }
      ],
      fallbackMessage: "Essa informação não está no catálogo demonstrativo da clínica Amigo Fiel."
    },
    sampleResponses: {
      // Direct exact match for suggested question 1
      "vocês fazem banho e tosa?": "Fazemos sim com muito carinho! Nosso Banho & Tosa Higiênica custa a partir de R$ 65,00 para porte pequeno (e R$ 85,00 médio), já incluindo corte de unhas, limpeza de ouvidos e perfume hipoalergênico. Temos tosa na tesoura específica também!",
      // Direct exact match for suggested question 2
      "tem ração para filhotes?": "Temos sim! Temos em estoque a Ração Premium para Filhotes (pacote de 10kg) por R$ 189,90, rica em DHA e sem corantes. Se pedir até às 15h, entregamos hoje mesmo na sua residência!",
      // Direct exact match for suggested question 3
      "quero agendar um horário para sábado": "Excelente! Para este sábado temos os seguintes horários disponíveis na estética: 09h30, 11h00 e 14h30. Qual é o nome do seu pet, a raça e o horário de sua preferência?",
      // Direct exact match for suggested question 4
      "vocês têm serviço de táxi pet?": "Temos sim o serviço de Pet Táxi climatizado! Buscamos seu cãozinho ou gatinho em casa com caixa de transporte segura e devolvemos cheiroso após o banho. A taxa é calculada pela distância até a Av. Brasil, 850.",
      // Keyword fallbacks
      "banho": "Fazemos sim! Nosso banho e tosa higiênica custa a partir de R$ 65,00 para porte pequeno e inclui corte de unhas, limpeza de ouvidos e perfume hipoalergênico.",
      "racao": "Temos sim! Temos a Ração Premium para Filhotes (10kg) por R$ 189,90, rica em DHA e sem corantes. Entregamos na sua casa hoje mesmo se pedir até às 15h!",
      "agendar": "Ótimo! Para sábado temos horários de banho e tosa às 09h30, 11h00 e 14h30. Qual é o nome, raça e peso aproximado do seu pet?",
      "taxi": "Temos sim o serviço de Pet Táxi climatizado! Buscamos e levamos com toda a segurança com taxa calculada pela distância."
    }
  },
  {
    id: "loja",
    name: "Loja Virtual Tech",
    category: "E-commerce & Varejo",
    badge: "NextGadget",
    agentName: "Kirana Tech",
    agentRole: "Especialista em Produtos & Carrinho",
    agentAvatar: "⚡",
    agentEmoji: "⚡",
    brandColor: "#2563eb",
    accentBg: "bg-blue-600",
    tagline: "Eletrônicos, gadgets e periféricos com garantia oficial e envio full.",
    mockUI: {
      bannerTitle: "NextGadget Store",
      bannerSubtitle: "Equipamentos profissionais para produtividade e criatividade",
      statusBadge: "🚀 Frete Grátis acima de R$ 199",
      locationInfo: "Envio para todo o Brasil em 24h úteis",
      items: [
        { title: "Headphone Bluetooth ANC Pro", price: "R$ 449,90", note: "Cancelamento de ruído ativo de 40dB, 35h bateria", tag: "Destaque" },
        { title: "Teclado Mecânico Wireless RGB", price: "R$ 389,00", note: "Switches hot-swap, layout ABNT2 compacto", tag: "Novo" },
        { title: "Mouse Ergonômico de Precisão", price: "R$ 219,00", note: "Sensor óptico 16.000 DPI, bateria recarregável" },
        { title: "Hub USB-C 8 em 1 4K 60Hz", price: "R$ 179,00", note: "HDMI 4K, Power Delivery 100W, leitor SD" }
      ]
    },
    suggestedQuestions: [
      "O fone tem cancelamento de ruído?",
      "Qual o prazo de entrega para SP?",
      "Tem garantia no teclado mecânico?",
      "Quais as formas de pagamento aceitas?"
    ],
    knowledgeBase: {
      businessName: "NextGadget Store (Demonstração)",
      hours: "E-commerce 24/7 com suporte automatizado e envio diário",
      delivery: "Envio full para todo o Brasil. Capitais do Sudeste recebem em 1 a 2 dias úteis.",
      deliveryFee: "Frete grátis para todo o Brasil em pedidos a partir de R$ 199,00.",
      catalogHighlights: [
        { item: "Headphone ANC Pro", price: "R$ 449,90", desc: "Cancelamento de ruído ativo 40dB, bateria 35h" },
        { item: "Teclado Mecânico RGB", price: "R$ 389,00", desc: "Switches táteis, conexão sem fio e Bluetooth" },
        { item: "Mouse Ergonômico", price: "R$ 219,00", desc: "Design vertical anatômico contra LER" }
      ],
      fallbackMessage: "Esse detalhe técnico não consta no manual de demonstração da NextGadget."
    },
    sampleResponses: {
      // Direct exact match for suggested question 1
      "o fone tem cancelamento de ruído?": "Sim! O Headphone Bluetooth ANC Pro possui cancelamento ativo de ruído híbrido (ANC) de até 40dB, bloqueando ruídos de trânsito, aviões e escritórios. Ele conta também com modo ambiente transparente e bateria de 35 horas!",
      // Direct exact match for suggested question 2
      "qual o prazo de entrega para sp?": "Para o estado de São Paulo e região metropolitana, pedidos finalizados em dias úteis até o meio-dia são enviados por modalidade expressa com entrega em 24 a 48 horas úteis! E como o valor supera R$ 199, o frete é 100% grátis.",
      // Direct exact match for suggested question 3
      "tem garantia no teclado mecânico?": "Sim, todos os nossos teclados mecânicos contam com 12 meses de garantia oficial direta de fábrica contra qualquer defeito de fabricação, com suporte e troca rápida no Brasil.",
      // Direct exact match for suggested question 4
      "quais as formas de pagamento aceitas?": "Aceitamos PIX (com 5% de desconto imediato no valor total), cartão de crédito em até 10x sem juros (todas as bandeiras) e boleto bancário à vista.",
      // Keyword fallbacks
      "fone": "Sim! O Headphone Bluetooth ANC Pro possui cancelamento de ruído ativo híbrido de 40dB, bateria para 35 horas contínuas e modo ambiente para ouvir vozes externas.",
      "prazo": "Para a capital de SP e região metropolitana, pedidos efetuados até o meio-dia são entregues em até 24 horas úteis via envio expresso full!",
      "garantia": "Todos os nossos teclados contam com 12 meses de garantia integral de fábrica contra defeitos de fabricação e suporte no Brasil.",
      "pagamento": "Aceitamos PIX com 5% de desconto imediato, cartão de crédito em até 10x sem juros e boleto bancário."
    }
  },
  {
    id: "whatsapp",
    name: "Canal WhatsApp Business",
    category: "Triagem & Atendimento Rápido",
    badge: "WhatsApp IA",
    agentName: "Kirana WhatsApp",
    agentRole: "Atendente Comercial Multitarefa",
    agentAvatar: "💬",
    agentEmoji: "💬",
    brandColor: "#10b981",
    accentBg: "bg-emerald-500",
    tagline: "Demonstração da experiência do cliente conversando pelo mensageiro sem menus rígidos.",
    mockUI: {
      bannerTitle: "Canal Oficial de Atendimento",
      bannerSubtitle: "Simulação de tela WhatsApp com triagem e transição humana",
      statusBadge: "🔒 Criptografia de ponta a ponta (Simulação)",
      locationInfo: "Atendimento comercial e suporte unificados",
      items: [
        { title: "Triagem Instantânea", price: "Tempo médio: 3s", note: "Identifica se é compra, suporte ou financeiro", tag: "Automático" },
        { title: "Segunda Via de Boleto", price: "Disponível 24/7", note: "Gera código de barras e chave PIX", tag: "Self-service" },
        { title: "Escalonamento Humano", price: "1 clique", note: "Transfere todo o histórico para o consultor", tag: "Híbrido" }
      ]
    },
    suggestedQuestions: [
      "Quero falar com um atendente humano",
      "Preciso da 2ª via da minha fatura",
      "Como vocês funcionam fora do horário comercial?",
      "Vocês conseguem enviar chave PIX direta?"
    ],
    knowledgeBase: {
      businessName: "Simulação de Canal WhatsApp (Demonstração)",
      hours: "Agente IA 24/7 | Consultores humanos: Seg-Sex 09h às 18h",
      delivery: "Atendimento imediato via API oficial do WhatsApp",
      deliveryFee: "Não aplicável",
      catalogHighlights: [
        { item: "Triagem de Leads", price: "Gratuito", desc: "Qualifica interesse antes de repassar ao vendedor" },
        { item: "Segunda via PIX", price: "Gratuito", desc: "Emissão instantânea sem fila" }
      ],
      fallbackMessage: "Solicitação recebida. Em uma operação real, transferiríamos para a fila humana."
    },
    sampleResponses: {
      // Direct exact match for suggested question 1
      "quero falar com um atendente humano": "Com certeza! Em nosso fluxo oficial no WhatsApp, vou transferir sua conversa agora mesmo para um especialista humano da equipe de atendimento, mantendo todo o histórico já conversado para você não precisar repetir nada.",
      // Direct exact match for suggested question 2
      "preciso da 2ª via da minha fatura": "Sem problemas! No fluxo automatizado, a Kirana solicita seu CPF ou CNPJ cadastrado, localiza a fatura em aberto no seu ERP/financeiro e gera na mesma hora o código de barras digitável e o código PIX Copia-e-Cola.",
      // Direct exact match for suggested question 3
      "como vocês funcionam fora do horário comercial?": "Fora do horário comercial a Kirana continua respondendo 24 horas por dia! Ela esclarece dúvidas sobre produtos, recebe pedidos, agenda contatos e qualifica leads para que a equipe comercial retome logo no início da manhã seguinte.",
      // Direct exact match for suggested question 4
      "vocês conseguem enviar chave pix direta?": "Sim! A Kirana conecta-se aos gateways de pagamento (como Asaas, Mercado Pago ou bancos via API) e envia o QR Code dinâmico e a chave PIX copia-e-cola diretamente na conversa em menos de 3 segundos.",
      // Keyword fallbacks
      "humano": "Com certeza! Em nosso fluxo oficial, vou transferir sua conversa agora mesmo para um especialista humano da equipe comercial, mantendo todo o seu histórico.",
      "fatura": "Sem problemas! O agente no WhatsApp solicita o CPF ou CNPJ cadastrado e gera instantaneamente o código de barras digitável e a chave PIX copia-e-cola.",
      "horario": "A Kirana continua ativa 24 horas por dia, tirando dúvidas, anotando pedidos e qualificando leads para a equipe comercial retomar no primeiro horário útil.",
      "pix": "Sim! A Kirana pode gerar cobranças PIX dinâmicas e enviar o comprovante de liquidação direto na janela da conversa."
    }
  },
  {
    id: "rpg",
    name: "Mesa Virtual de RPG",
    category: "Games & Entretenimento Interativo",
    badge: "Armada Nexus & Morden",
    agentName: "Oráculo Kirana",
    agentRole: "Assistente de Regras & Narrador Auxiliar",
    agentAvatar: "🎲",
    agentEmoji: "🎲",
    brandColor: "#7c3aed",
    accentBg: "bg-purple-600",
    tagline: "Explicação de regras, criação de NPCs e orientação de fichas para jogadores e mestres.",
    mockUI: {
      bannerTitle: "Armada Nexus RPG & Morden",
      bannerSubtitle: "Ambiente imersivo para campanhas épicas de RPG de mesa",
      statusBadge: "⚔️ Turno do Grupo: Iniciativa 18",
      locationInfo: "Masmorra de Thar-Khos · Andar 2",
      items: [
        { title: "Ficha Digital Automatizada", price: "D&D 5e / Tormenta20", note: "Modificadores, magias e rolagens calculadas", tag: "Ativo" },
        { title: "Gerador de Encontros", price: "IA Narrativa", note: "Balanceado pelo nível do grupo de heróis", tag: "Novo" },
        { title: "Grid Tático Dinâmico", price: "Tokens com HP", note: "Iluminação dinâmica e névoa de guerra" }
      ]
    },
    suggestedQuestions: [
      "Como calculo a classe de armadura?",
      "Crie um NPC taverneiro suspeito para a vila",
      "Quais dados devo rolar para ataque furtivo?",
      "Como funciona a mesa virtual Armada Nexus?"
    ],
    knowledgeBase: {
      businessName: "Armada Nexus & MordenRPG (Demonstração)",
      hours: "Acesso aos servidores e fichas 24 horas por dia",
      delivery: "Acesso via navegador web, sem necessidade de instalação pesada",
      deliveryFee: "Não aplicável",
      catalogHighlights: [
        { item: "Fichas Inteligentes", price: "Integrado", desc: "Cálculos matemáticos em tempo real" },
        { item: "Mesa VTT Armada", price: "Integrado", desc: "Mapas em alta resolução e rolagens 3D" }
      ],
      fallbackMessage: "Regra ou criatura não encontrada no compêndio aberto de demonstração."
    },
    sampleResponses: {
      // Direct exact match for suggested question 1
      "como calculo a classe de armadura?": "No sistema D&D 5e padrão, a Classe de Armadura (CA) base sem armadura é 10 + Modificador de Destreza. Com armadura leve: CA da armadura + Destreza total. Com média: CA + Destreza (máximo +2). Com armadura pesada: valor fixo sem somar Destreza. Escudos adicionam +2!",
      // Direct exact match for suggested question 2
      "crie um npc taverneiro suspeito para a vila": "Aqui está: 'Gromm Olho-Torto', um taverneiro corpulento de meia-idade com uma cicatriz profunda na bochecha e um avental de couro manchado. Ele limpa as canecas devagar enquanto ouve tudo o que os aventureiros sussurram e esconde sob o balcão um mapa das ruínas proibidas.",
      // Direct exact match for suggested question 3
      "quais dados devo rolar para ataque furtivo?": "Primeiro você rola o d20 tradicional somando seu bônus de acerto. Se acertar e tiver vantagem (ou um aliado a 1,5m do alvo sem desvantagem), você soma o dano normal da sua arma aos dados extras de furtivo do Ladino (ex: 1d6 no nível 1, 2d6 no nível 3, etc.)!",
      // Direct exact match for suggested question 4
      "como funciona a mesa virtual armada nexus?": "A Armada Nexus RPG é nossa plataforma de mesa virtual (VTT): funciona direto no navegador com baixa latência. Ela oferece grid tático com alinhamento rápido, iluminação dinâmica, fichas digitais que calculam tudo sozinhas e rolador de dados 3D sincronizado entre todos os jogadores!",
      // Keyword fallbacks
      "armadura": "Na 5ª edição tradicional, a Classe de Armadura (CA) base sem armadura é 10 + seu modificador de Destreza. Se usar armadura leve, soma Destreza total; armadura média soma no máximo +2; e armadura pesada não utiliza Destreza.",
      "npc": "Aqui está: 'Gromm Olho-Torto', um ex-marinheiro robusto com um medalhão de prata escondido sob o avental manchado de cerveja. Ele fala baixo, sempre vigiando a porta dos fundos e conhece segredos sobre os contrabandistas das docas.",
      "furtivo": "Você rola o d20 tradicional adicionando seu bônus de ataque. Se acertar tendo vantagem ou um aliado a 1,5m do alvo, adiciona os dados extras de dano furtivo (ex: 2d6 no nível 3) do ladino!",
      "mesa": "A Armada Nexus RPG é nossa plataforma de mesa virtual: você carrega mapas, movimenta tokens com grid preciso, rola dados em 3D e tudo sincroniza na hora entre os participantes."
    }
  },
  {
    id: "social",
    name: "Instagram & Redes Sociais",
    category: "Engajamento & Redes Sociais",
    badge: "Direct IA",
    agentName: "Kirana Social",
    agentRole: "Atendimento no Direct & Comentários",
    agentAvatar: "📸",
    agentEmoji: "📱",
    brandColor: "#ec4899",
    accentBg: "bg-pink-600",
    tagline: "Respostas imediatas em mensagens diretas de campanhas e posts de conversão.",
    mockUI: {
      bannerTitle: "Instagram Direct & Comentários",
      bannerSubtitle: "Engajamento inteligente que transforma curtidas e comentários em vendas",
      statusBadge: "✨ Respostas em < 5 segundos",
      locationInfo: "Integração via API autorizada Meta",
      items: [
        { title: "Comente 'EU QUERO'", price: "Disparo automático", note: "Envia cupom e link no direct em 3 segundos", tag: "Campanhas" },
        { title: "Dúvidas de Stories", price: "Triagem imediata", note: "Responde links de produtos divulgados no dia", tag: "Stories" },
        { title: "Qualificação de Parcerias", price: "Filtro de mídia kit", note: "Separa propostas comerciais de criadores" }
      ]
    },
    suggestedQuestions: [
      "Como a Kirana atende quem comenta nos posts?",
      "É seguro integrar com a conta da marca?",
      "Qual a diferença entre simulação e integração real?",
      "Ela consegue enviar links com cupom de desconto?"
    ],
    knowledgeBase: {
      businessName: "Demonstração Social Direct (Meta API)",
      hours: "Monitoramento contínuo das publicações da marca",
      delivery: "Envio instantâneo na caixa de entrada do seguidor",
      deliveryFee: "Não aplicável",
      catalogHighlights: [
        { item: "Gatilho de Comentário", price: "Configurável", desc: "Detecta palavras-chave específicas no feed" },
        { item: "Links Trackeados", price: "Configurável", desc: "Mapeia ROI exato de cada post ou anúncio" }
      ],
      fallbackMessage: "Parâmetro social sob validação técnica."
    },
    sampleResponses: {
      // Direct exact match for suggested question 1
      "como a kirana atende quem comenta nos posts?": "Quando um seguidor comenta a palavra-chave da campanha (por exemplo, 'QUERO' ou 'PREÇO'), a Kirana responde ao comentário no feed para gerar prova social e envia na mesma hora uma mensagem no Direct privado com o link direto e instruções de compra!",
      // Direct exact match for suggested question 2
      "é seguro integrar com a conta da marca?": "Totalmente seguro! A integração é realizada via API oficial da Meta (Instagram Graph API). Não utilizamos scraping nem métodos proibidos, preservando a segurança, reputação e conformidade da conta empresarial da sua marca.",
      // Direct exact match for suggested question 3
      "qual a diferença entre simulação e integração real?": "Aqui nesta página você está interagindo com uma simulação demonstrativa das regras e respostas. Em um projeto real para a sua empresa, configuramos a ponte via webhooks oficiais da Meta conectados ao seu sistema e ao seu catálogo comercial.",
      // Direct exact match for suggested question 4
      "ela consegue enviar links com cupom de desconto?": "Sim! Ela pode gerar links trackeados e individualizados com cupons promocionais (ex: BEMVINDO10), permitindo que você saiba com exatidão qual post ou story gerou cada venda no seu dashboard comercial.",
      // Keyword fallbacks
      "comenta": "Quando um seguidor comenta a palavra-chave configurada (ex: 'QUERO'), a Kirana envia na mesma hora uma mensagem no Direct dele com o link direto e o cupom de desconto, sem deixar ele esperando!",
      "seguro": "Totalmente! As integrações são feitas exclusivamente pelas APIs oficiais da Meta (Graph API), com tokens protegidos e respeito às diretrizes de privacidade e termos da plataforma.",
      "diferenca": "Aqui nesta página você está experimentando uma simulação interativa completa. Em um projeto real para a sua empresa, configuramos a ponte via webhooks oficiais com a sua página empresarial.",
      "cupom": "Sim! Ela pode gerar ou enviar links trackeados com cupons personalizados, identificando exatamente qual post originou a venda no seu e-commerce."
    }
  }
];
