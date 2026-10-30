/**
 * Soluções para empresas — a oferta comercial principal do site.
 *
 * Cada item é escrito na ordem em que um dono de pequeno negócio reconhece o
 * problema:
 *
 *   1. `problema`  — o que acontece hoje na rotina dele (linguagem do dia a dia);
 *   2. `comoFunciona` — a solução explicada sem jargão;
 *   3. `ganho`     — o benefício esperado, **sem prometer resultado garantido**;
 *   4. `detalhes`  — termos técnicos para quem quiser aprofundar (fica recolhido).
 *
 * Regra editorial: nada de métrica inventada ("resposta em 38s", "-18h/semana"),
 * nada de prazo prometido no cartão. Escopo e prazo são definidos na conversa.
 */

export interface SolucaoNegocio {
  id: string;
  icone: "atendimento" | "clientes" | "automacao" | "sites" | "relatorios";
  titulo: string;
  resumo: string;
  problema: string;
  comoFunciona: string;
  ganho: string;
  detalhes: string[];
}

export const SOLUCOES_NEGOCIO: SolucaoNegocio[] = [
  {
    id: "atendimento",
    icone: "atendimento",
    titulo: "Atendimento ao cliente",
    resumo: "Ninguém fica sem resposta, nem fora do horário comercial.",
    problema:
      "As mensagens se acumulam no WhatsApp, as mesmas dúvidas chegam dez vezes por dia e, quando alguém da equipe está ocupado, o cliente simplesmente vai embora.",
    comoFunciona:
      "Um atendente digital treinado com as informações do seu negócio responde as perguntas frequentes (preço, horário, disponibilidade, endereço), organiza os pedidos que chegam e passa para uma pessoa quando o assunto precisa de decisão humana.",
    ganho:
      "Menos tempo respondendo o que se repete e mais tempo cuidando do que realmente exige atenção. O cliente recebe resposta na hora em que procurou você.",
    detalhes: [
      "Agente conectado à base de conhecimento do negócio (catálogo, preços, horários e regras)",
      "Atendimento no site e no WhatsApp, com o mesmo histórico de conversa",
      "Encaminhamento para atendente humano quando o caso foge do script",
      "Registro das conversas para você revisar o que mais é perguntado",
    ],
  },
  {
    id: "clientes-vendas",
    icone: "clientes",
    titulo: "Organização de clientes e vendas",
    resumo: "Cada contato com nome, histórico e próximo passo.",
    problema:
      "Os contatos ficam espalhados em conversas, cadernos e planilhas. O orçamento enviado semana passada ninguém lembra se foi respondido, e a venda esfria sem que ninguém perceba.",
    comoFunciona:
      "Um painel simples organiza contatos e negociações por etapa (novo contato, em conversa, orçamento enviado, fechado). Cada pessoa tem um responsável, um histórico e um lembrete de retorno.",
    ganho:
      "Você passa a saber quantas oportunidades estão abertas, quem está esperando resposta e o que precisa ser retomado hoje — sem depender da memória de alguém.",
    detalhes: [
      "Funil visual por etapas, com responsável e data do próximo contato",
      "Histórico unificado das conversas (WhatsApp, e-mail, site)",
      "Lembretes de retorno automáticos em prazos que você define",
      "Relatórios de conversão por etapa e por origem do contato",
    ],
  },
  {
    id: "automacao",
    icone: "automacao",
    titulo: "Automação de tarefas",
    resumo: "O trabalho repetitivo deixa de ser feito à mão.",
    problema:
      "A mesma informação é digitada em três lugares, a planilha é atualizada manualmente todo dia e alguém precisa copiar dados de um sistema para outro no fim do expediente.",
    comoFunciona:
      "As ferramentas que você já usa passam a conversar entre si: o pedido que entra no site chega na planilha, o pagamento aprovado atualiza o cadastro, o lembrete é enviado sozinho na data certa.",
    ganho:
      "Menos retrabalho e menos erro de digitação. As horas gastas em tarefas mecânicas voltam para o atendimento e para a venda.",
    detalhes: [
      "Integrações por API, webhooks e rotinas agendadas",
      "Validação de dados para evitar duplicidade e inconsistência",
      "Alertas quando algo falha, para ninguém descobrir o problema no fim do mês",
      "Funciona com as ferramentas que a empresa já usa, sem trocar tudo de uma vez",
    ],
  },
  {
    id: "sites-sistemas",
    icone: "sites",
    titulo: "Sites e sistemas personalizados",
    resumo: "A ferramenta que o seu negócio precisa e não existe pronta.",
    problema:
      "O negócio precisa de presença digital, de um catálogo próprio ou de um controle que nenhum sistema de prateleira resolve do jeito que a operação funciona.",
    comoFunciona:
      "Desenvolvemos o site institucional, o catálogo, o agendamento ou o sistema interno sob medida para o seu processo — começando pelo que resolve o problema mais urgente.",
    ganho:
      "Uma solução que acompanha o seu jeito de trabalhar, em vez de obrigar a equipe a se adaptar a um sistema genérico.",
    detalhes: [
      "Site institucional, catálogo, agendamento e área restrita",
      "Sistemas internos de controle (estoque, pedidos, clientes, financeiro)",
      "Integração com WhatsApp, meios de pagamento e sistemas já existentes",
      "Publicação, domínio e orientação de uso incluídos no escopo",
    ],
  },
  {
    id: "relatorios",
    icone: "relatorios",
    titulo: "Relatórios e informações",
    resumo: "Os números do mês explicados em uma página.",
    problema:
      "Os dados estão em planilhas e sistemas diferentes. Na hora de decidir, ninguém sabe qual número está certo nem onde está o problema.",
    comoFunciona:
      "As informações são reunidas em um painel e resumidas em linguagem clara: o que vendeu, o que ficou parado, o que mudou em relação ao período anterior.",
    ganho:
      "Decisão com base no que aconteceu de fato, sem passar horas montando planilha no fim do mês.",
    detalhes: [
      "Consolidação de planilhas, sistemas e canais de venda",
      "Resumo periódico com os pontos de atenção destacados",
      "Indicadores definidos junto com você (não um painel genérico)",
      "Envio automático por e-mail ou consulta no navegador",
    ],
  },
];
