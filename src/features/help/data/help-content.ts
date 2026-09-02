export interface HelpSection {
  id: string;
  title: string;
  subtitle: string;
  category: "dashboard" | "pedidos" | "erps" | "marketplaces" | "equipe" | "faq";
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Com que frequência meus pedidos são buscados nos marketplaces?",
    answer: "A busca automática opera em ciclos contínuos (padrão a cada 5 minutos, ou 2 minutos em horários de pico). Você também pode forçar a sincronização instantânea clicando no botão 'Sincronizar Pedidos' na página de Pedidos.",
    category: "Pedidos",
  },
  {
    question: "O que significa um pedido com status 'Não baixado / Pendente'?",
    answer: "Significa que o Hub já recebeu a venda do canal com sucesso, mas o conector do seu ERP ainda não executou a rotina de download para emitir a Nota Fiscal.",
    category: "Integrações",
  },
  {
    question: "Como funciona a proteção anti-colisão (Heartbeat Lock)?",
    answer: "Quando um operador abre um pedido para correção ou edição de dados, o Hub bloqueia temporariamente a edição concorrente por outros usuários, evitando que duas pessoas alterem o mesmo pedido ao mesmo tempo.",
    category: "Segurança",
  },
  {
    question: "Como os produtos com erros na esteira são tratados?",
    answer: "Produtos com divergências cadastrais são marcados com status 'Erro' ou 'Pendente'. O gestor pode inspecionar os detalhes do lote, corrigir campos e reenviar para despacho com um clique.",
    category: "Esteira",
  },
];
