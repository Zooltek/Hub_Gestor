import { useState } from "react";
import {
  HelpCircle,
  Search,
  LayoutDashboard,
  Plug,
  Store,
  Layers,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  BookOpen,
  DollarSign,
  TrendingUp,
  Activity,
  Award,
  Clock,
  Calendar,
  Lock,
  Boxes,
  Database,
  RefreshCw,
  Copy,
  Check,
  ShoppingCart,
  Users,
  UserPlus,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BlingLogo,
  TinyLogo,
  OmieLogo,
  ContaAzulLogo,
  MercadoLivreLogo,
  ShopifyLogo,
  TrayLogo,
  RestApiLogo,
  ShopeeLogo,
  AmazonLogo,
  LojaIntegradaLogo,
} from "@/components/icons/brand-icons";
import { toast } from "sonner";

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard-kpis");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success("Código copiado para a área de transferência!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-sidebar-accent/50 to-background border border-primary/20 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
              <BookOpen className="size-3.5" />
              Manual do Usuário & Base de Conhecimento
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Central de Ajuda do Hub Gestor
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Guia completo de operação do portal, explicação detalhada dos KPIs para tomada de decisão gerencial e manuais passo a passo para integração com ERPs e Marketplaces.
            </p>
          </div>

          <div className="w-full md:w-80 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar no manual (ex: Usuários, Bling, KPIs)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs bg-background/80 backdrop-blur-xs border-primary/30 focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 p-1 bg-muted/60 border border-border/80 h-auto">
          <TabsTrigger value="dashboard-kpis" className="text-xs py-2.5 flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-xs">
            <LayoutDashboard className="size-3.5 text-primary" />
            <span>1. KPIs & 4 Perguntas</span>
          </TabsTrigger>
          <TabsTrigger value="erp-connections" className="text-xs py-2.5 flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-xs">
            <Plug className="size-3.5 text-emerald-400" />
            <span>2. Conectar ERPs</span>
          </TabsTrigger>
          <TabsTrigger value="marketplace-plugins" className="text-xs py-2.5 flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-xs">
            <Store className="size-3.5 text-amber-400" />
            <span>3. Marketplaces</span>
          </TabsTrigger>
          <TabsTrigger value="products-pipeline" className="text-xs py-2.5 flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-xs">
            <Layers className="size-3.5 text-indigo-400" />
            <span>4. Esteira & Lotes</span>
          </TabsTrigger>
          <TabsTrigger value="orders-concurrency" className="text-xs py-2.5 flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-xs">
            <ShieldCheck className="size-3.5 text-purple-400" />
            <span>5. Pedidos & Travas</span>
          </TabsTrigger>
          <TabsTrigger value="team-management" className="text-xs py-2.5 flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-xs">
            <Users className="size-3.5 text-sky-400" />
            <span>6. Equipe & Usuários</span>
          </TabsTrigger>
        </TabsList>

        {/* ------------------------------------------------------------- */}
        {/* SEÇÃO 1: DASHBOARD & AS 4 PERGUNTAS ESTRATÉGICAS DO GESTOR    */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="dashboard-kpis" className="m-0 flex flex-col gap-6">
          <Card className="border-border/80 bg-card">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <LayoutDashboard className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    Dashboard Executivo: A Metodologia das 4 Perguntas
                  </CardTitle>
                  <CardDescription className="text-xs">
                    O painel foi projetado para eliminar ruídos e responder de forma instantânea às 4 perguntas essenciais do lojista.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 flex flex-col gap-8">
              {/* Pergunta 1 */}
              <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-sidebar/50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                    1
                  </span>
                  <h3 className="text-base font-bold text-foreground">
                    Quanto estou vendendo? (Cards de Faturamento e Volume)
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Localizado no topo do dashboard, este conjunto de 4 cards calcula o desempenho financeiro em tempo real comparando diretamente com o período imediatamente anterior (ex: últimos 30 dias vs 30 dias anteriores):
                </p>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-2">
                  <div className="p-3 rounded-lg border border-border bg-card flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Faturamento Total</span>
                      <DollarSign className="size-4 text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Soma do valor bruto de todos os pedidos aprovados ou faturados no período filtrado.
                    </p>
                    <Badge variant="outline" className="text-[10px] w-fit mt-2 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                      Fórmula: ∑ TotalPedido
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Pedidos Realizados</span>
                      <TrendingUp className="size-4 text-primary" />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Quantidade total de transações registradas por todos os marketplaces integrados.
                    </p>
                    <Badge variant="outline" className="text-[10px] w-fit mt-2 border-primary/30 text-primary bg-primary/10">
                      Fórmula: Count(Pedidos)
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Itens Vendidos</span>
                      <Boxes className="size-4 text-indigo-400" />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Volume físico total de peças/unidades que precisam ser separadas e expedidas pelo estoque.
                    </p>
                    <Badge variant="outline" className="text-[10px] w-fit mt-2 border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
                      Fórmula: ∑ QtdItens
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Ticket Médio</span>
                      <Zap className="size-4 text-amber-400" />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Valor médio gasto por cada cliente em cada compra realizada.
                    </p>
                    <Badge variant="outline" className="text-[10px] w-fit mt-2 border-amber-500/30 text-amber-400 bg-amber-500/10">
                      Fórmula: Faturamento ÷ Pedidos
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Pergunta 2 */}
              <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-sidebar/50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                    2
                  </span>
                  <h3 className="text-base font-bold text-foreground">
                    Como minhas vendas estão evoluindo? (Gráfico Histórico Comparativo)
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Permite identificar tendências de crescimento, sazonalidades e quedas abruptas de receita através de gráficos de área suavizada.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 mt-2">
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-primary" /> Filtros Rápidos de Janela Temporal
                    </p>
                    <ul className="text-[11px] text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li><strong>Hoje (24h)</strong>: Vendas hora a hora no dia atual.</li>
                      <li><strong>7 Dias & 15 Dias</strong>: Acompanhamento de curto prazo e campanhas promocionais.</li>
                      <li><strong>30 Dias & 90 Dias</strong>: Visão de fechamento mensal e trimestral.</li>
                      <li><strong>Ano Atual (YTD)</strong>: Visão acumulada do ano calendário.</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <DollarSign className="size-3.5 text-emerald-400" /> Alternância Métrica
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                      O botão seletor permite alternar entre visualizar o gráfico em <strong>Faturamento (R$)</strong> ou em <strong>Volume de Pedidos (Unidades)</strong>, permitindo distinguir se o crescimento veio de aumento de preço ou aumento de tração de vendas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pergunta 3 */}
              <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-sidebar/50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                    3
                  </span>
                  <h3 className="text-base font-bold text-foreground">
                    Está tudo funcionando? (Central de Saúde das Integrações)
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Monitoramento proativo que alerta se algum canal de venda parou de responder antes que você perca vendas:
                </p>
                <div className="grid gap-3 sm:grid-cols-3 mt-2">
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Activity className="size-3.5 text-emerald-400" /> Status Geral do Hub
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Indica se os microsserviços de mensageria, sincronização e banco MongoDB estão operacionais.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Zap className="size-3.5 text-primary" /> Latência Média (Ping)
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Tempo de resposta da API dos marketplaces em milissegundos (ideal abaixo de 350ms).
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-indigo-400" /> Taxa de Sucesso 24h
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Percentual de lotes de produtos e pedidos despachados sem falhas cadastrais ou de rede.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pergunta 4 */}
              <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-sidebar/50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                    4
                  </span>
                  <h3 className="text-base font-bold text-foreground">
                    O que está se destacando? (Ranking de Campeões & Canais)
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 mt-2">
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Award className="size-3.5 text-amber-400" /> Produto Campeão & Top 5
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Identifica o SKU com maior faturamento e unidades vendidas, exibindo estoque disponível e share percentual sobre o faturamento total da loja.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="size-3.5 text-purple-400" /> Inteligência de Picos de Venda
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Calcula automaticamente o <strong>Melhor Dia da Semana</strong> e o <strong>Horário de Pico</strong> para que seu time planeje campanhas e atendimento nos momentos de maior conversão.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* SEÇÃO 2: COMO CONECTAR CADA ERP DE MERCADO                   */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="erp-connections" className="m-0 flex flex-col gap-6">
          <Card className="border-border/80 bg-card">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Plug className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    Manual de Integração com ERPs Online de Mercado
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Instruções passo a passo para gerar as credenciais e autorizar a comunicação direta entre o seu ERP e o Hub.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 flex flex-col gap-8">
              {/* Bling ERP */}
              <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-sidebar/40 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BlingLogo className="size-8 rounded-lg shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-foreground">Bling ERP (API v2 / v3)</h3>
                      <p className="text-xs text-muted-foreground">Sincronização de catálogo, saldos de estoque e pedidos</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs">
                    Recomendado
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground space-y-2 border-t border-border/50 pt-3">
                  <p className="font-semibold text-foreground">Como obter a chave de API no Bling:</p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                    <li>Acesse o painel do Bling com usuário administrador e vá em <strong>Preferências (ícone de engrenagem) &gt; Sistema &gt; Usuários e Usuário API</strong>.</li>
                    <li>Clique em <strong>Incluir Usuário</strong> e selecione o tipo <strong>Usuário API</strong>.</li>
                    <li>Preencha o nome (ex: <em>Amura Hub Integration</em>) e o e-mail de contato.</li>
                    <li>Clique em <strong>Gerar nova API Key</strong> e copie o código gerado.</li>
                    <li>Na seção de <strong>Permissões</strong>, habilite permissões de Leitura e Escrita em <em>Produtos, Estoques, Pedidos de Venda e Clientes</em>.</li>
                    <li>No Hub Gestor, acerte a aba <strong>Conexão ERP Online &gt; ERPs de Mercado &gt; Bling</strong>, cole a API Key e clique em <strong>Conectar e Testar</strong>.</li>
                  </ol>
                </div>
              </div>

              {/* Tiny ERP */}
              <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-sidebar/40 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TinyLogo className="size-8 rounded-lg shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-foreground">Tiny ERP</h3>
                      <p className="text-xs text-muted-foreground">Integração nativa via Token de API e Webhooks</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-teal-500/30 text-teal-400 bg-teal-500/10 text-xs">
                    Popular
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground space-y-2 border-t border-border/50 pt-3">
                  <p className="font-semibold text-foreground">Como obter o Token de API no Tiny:</p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                    <li>No Tiny ERP, acesse o <strong>Menu &gt; Configurações &gt; Aba Geral &gt; Informações da Empresa &gt; API</strong>.</li>
                    <li>Localize o campo <strong>Token de API</strong> (ou clique em <em>Gerar Token</em> caso ainda não exista).</li>
                    <li>Copie o Token gerado.</li>
                    <li>No Hub Gestor, vá em <strong>Conexão ERP Online &gt; ERPs de Mercado &gt; Tiny</strong>, insira o Token e clique em <strong>Salvar e Testar</strong>.</li>
                    <li>O Hub validará imediatamente a latência e o catálogo de produtos disponíveis.</li>
                  </ol>
                </div>
              </div>

              {/* Omie ERP */}
              <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-sidebar/40 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <OmieLogo className="size-8 rounded-lg shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-foreground">Omie ERP</h3>
                      <p className="text-xs text-muted-foreground">Integração corporativa via App Key e App Secret</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs">
                    Enterprise
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground space-y-2 border-t border-border/50 pt-3">
                  <p className="font-semibold text-foreground">Como obter App Key e App Secret no Omie:</p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                    <li>Faça login no portal do Omie e entre na sua empresa.</li>
                    <li>Acesse o <strong>Menu Superior (Engrenagem) &gt; Configurações do Aplicativo &gt; Integrações &gt; API / Webhooks</strong>.</li>
                    <li>Copie o valor de <strong>App Key</strong> e de <strong>App Secret</strong>.</li>
                    <li>Cole ambas as chaves nos respectivos campos da aba <em>Omie</em> no Hub Gestor.</li>
                  </ol>
                </div>
              </div>

              {/* ContaAzul */}
              <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-sidebar/40 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ContaAzulLogo className="size-8 rounded-lg shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-foreground">ContaAzul</h3>
                      <p className="text-xs text-muted-foreground">Autorização 100% Cloud via protocolo OAuth 2.0</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-xs">
                    OAuth 2.0
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground space-y-2 border-t border-border/50 pt-3">
                  <p className="font-semibold text-foreground">Como conectar a ContaAzul:</p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                    <li>No Hub Gestor, acesse <strong>Conexão ERP Online &gt; ERPs de Mercado &gt; ContaAzul</strong>.</li>
                    <li>Clique em <strong>Conectar via ContaAzul</strong> para abrir a janela de autorização oficial da ContaAzul.</li>
                    <li>Faça login com seu usuário e autorize as permissões de acesso ao catálogo fiscal e faturamento.</li>
                    <li>Após a autorização, a conexão ficará com status <strong>Conectado</strong> automaticamente.</li>
                  </ol>
                </div>
              </div>

              {/* API REST & Webhook Custom */}
              <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-sidebar/40 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RestApiLogo className="size-8 rounded-lg shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-foreground">API REST Customizada (Seu Próprio ERP)</h3>
                      <p className="text-xs text-muted-foreground">Endpoints REST e Webhooks para sistemas internos e ERPs proprietários</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-xs">
                    Personalizado
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground space-y-3 border-t border-border/50 pt-3">
                  <p className="font-semibold text-foreground">Exemplo de Payload para Envio de Lotes de Produtos:</p>
                  
                  <div className="relative rounded-lg bg-black/80 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto border border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(`POST /api/products/import
Headers:
  Authorization: Bearer <SEU_TOKEN>
  Content-Type: application/json

{
  "reference": "REF-10020",
  "descricaoProduto": "Vestido Midi Floral",
  "precoVenda": 189.90,
  "categoria": "Vestidos",
  "variations": [
    { "sku": "VEST-FLORAL-P", "tamanho": "P", "cor": "Azul", "estoque": 15, "codigoBarras": "7891234567890" },
    { "sku": "VEST-FLORAL-M", "tamanho": "M", "cor": "Azul", "estoque": 22, "codigoBarras": "7891234567891" }
  ]
}`, "rest-code")}
                      className="absolute right-2 top-2 size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {copiedCode === "rest-code" ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    </Button>
                    <pre>{`POST /api/products/import
Headers:
  Authorization: Bearer <SEU_TOKEN>
  Content-Type: application/json

{
  "reference": "REF-10020",
  "descricaoProduto": "Vestido Midi Floral",
  "precoVenda": 189.90,
  "categoria": "Vestidos",
  "variations": [
    { "sku": "VEST-FLORAL-P", "tamanho": "P", "cor": "Azul", "estoque": 15, "codigoBarras": "7891234567890" },
    { "sku": "VEST-FLORAL-M", "tamanho": "M", "cor": "Azul", "estoque": 22, "codigoBarras": "7891234567891" }
  ]
}`}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* SEÇÃO 3: MARKETPLACES & MAPEAMENTO DE CANAIS                  */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="marketplace-plugins" className="m-0 flex flex-col gap-6">
          <Card className="border-border/80 bg-card">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Store className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    Integração & Mapeamento de Marketplaces
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Como conectar o Mercado Livre, Shopify e outros canais, mapeando categorias, grades e atributos obrigatórios.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 flex flex-col gap-8">
              {/* Mercado Livre */}
              <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-sidebar/40 p-5">
                <div className="flex items-center gap-3">
                  <MercadoLivreLogo className="size-8 rounded-lg shrink-0" />
                  <div>
                    <h3 className="text-base font-bold text-foreground">Mercado Livre (MLB)</h3>
                    <p className="text-xs text-muted-foreground">Automação de categorias em 8 níveis, Guia de Medidas e Cores Oficiais</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-3 border-t border-border/50 pt-3">
                  <p className="font-semibold text-foreground">Regras e Boas Práticas do Mercado Livre no Hub:</p>
                  <ul className="space-y-2 pl-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Mapeamento de Categorias de Folha</strong>: O Mercado Livre exige que todo anúncio seja associado a uma categoria folha (que não possui subcategorias). O Hub permite buscar pelo nome da categoria ou código MLB (ex: <em>MLB108865</em> para Blusas) na aba <strong>Mapeamento Canais</strong>.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Cores Oficiais (MAIN_COLOR)</strong>: O Mercado Livre exige o envio do ID oficial da cor (ex: Preto = 52049, Branco = 52055). O Hub converte automaticamente nomes comuns do ERP (ex: "Preto Fosco", "Off White") para a cor oficial correspondente do marketplace.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Guia de Tamanhos (SIZE_GRID_ID)</strong>: Em categorias de vestuário e calçados, o Hub vincula automaticamente as variações de P, M, G, GG ou numerações às linhas corretas da tabela de medidas oficial.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Tratamento de Marca Própria</strong>: Caso sua marca ainda não esteja homologada no catálogo geral do Mercado Livre, o Hub aplica o fallback automático para "Marca Própria" ou "Generica", evitando rejeições no despacho.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Loja Integrada */}
              <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-sidebar/40 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LojaIntegradaLogo className="size-8 rounded-lg shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-foreground">Loja Integrada</h3>
                      <p className="text-xs text-muted-foreground">Sincronização de produtos, estoque e captura de pedidos em tempo real</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-teal-500/30 text-teal-400 bg-teal-500/10 text-xs">
                    E-commerce
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground space-y-2 border-t border-border/50 pt-3">
                  <p className="font-semibold text-foreground">Como configurar a Loja Integrada no Hub:</p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                    <li>No painel da Loja Integrada, acesse <strong>Configurações &gt; Chave para API</strong>.</li>
                    <li>Gere ou copie a <strong>Chave de API</strong> e a <strong>Chave de Aplicação (App Key)</strong>.</li>
                    <li>No Hub Gestor, acesse <strong>Conexão ERP Online &gt; Catálogo de Plugins &gt; Loja Integrada</strong>.</li>
                    <li>Cole as credenciais e ative o plugin para iniciar a esteira automática de produtos e pedidos.</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* SEÇÃO 4: ESTEIRA DE PRODUTOS, LOTES & FREQUÊNCIA DE BUSCA     */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="products-pipeline" className="m-0 flex flex-col gap-6">
          <Card className="border-border/80 bg-card">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Layers className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    Esteira de Produtos, Lotes & Frequência de Busca Automática
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Como funciona o motor de sincronização em segundo plano, cron de busca e curadoria de alterações de catálogo.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 flex flex-col gap-6">
              {/* Frequência de Sincronização e Busca Automática */}
              <div className="flex flex-col gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <RefreshCw className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Frequência de Sincronização & Motor de Busca Automática</h3>
                    <p className="text-xs text-muted-foreground">Execução em nuvem via Hangfire Recurring Jobs com travas distribuídas</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-3 border-t border-border/50 pt-3 leading-relaxed">
                  <p>
                    O Hub conta com um motor autônomo em nuvem (Engine de Background Workers) que executa consultas periódicas aos ERPs e Marketplaces de forma transparente:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 mt-2">
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Clock className="size-3.5 text-primary" /> Frequência de Pedidos
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Padrão: <strong>a cada 1 minuto (<code>* * * * *</code>)</strong>. O motor varre todos os canais integrados para capturar vendas assim que o cliente conclui o checkout.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Boxes className="size-3.5 text-indigo-400" /> Frequência de Produtos
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Padrão: <strong>a cada 15 ou 60 minutos</strong>. Atualiza novos produtos cadastrados, alterações de descrição e tabelas de preço.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Zap className="size-3.5 text-amber-400" /> Travas Anti-Duplicidade
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Se uma consulta demorar mais que o habitual, o Hub ativa um <em>Distributed Lock</em> impedindo que o próximo ciclo sobreponha a execução anterior.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-border/70 bg-card/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-1">
                    <div>
                      <p className="font-semibold text-foreground text-xs">Precisa atualizar imediatamente sem esperar o ciclo do Cron?</p>
                      <p className="text-[11px] text-muted-foreground">Utilize o botão <strong>"Sincronizar Agora"</strong> na aba <em>Frequência de Busca</em> para forçar a execução instantânea.</p>
                    </div>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs shrink-0 gap-1">
                      <Zap className="size-3" /> Disparo Sob Demanda
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Etapas da Esteira */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-xl border border-border bg-sidebar/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-xs">1</span>
                    Recepção & Diff
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ao receber um lote de produtos do ERP (via CSV ou API REST), o Hub compara os dados novos com o snapshot anterior, identificando se houve apenas alteração de preço, estoque ou cadastro.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-sidebar/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                    <span className="flex size-6 items-center justify-center rounded-full bg-amber-500/20 text-xs">2</span>
                    Aprovação & Curadoria
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Se um produto tiver alteração crítica (ex: reajuste de preço acima do limite ou nova categoria sem mapeamento), ele entra em estado <strong>Pendente</strong> para aprovação com 1 clique pelo gestor.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-sidebar/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs">3</span>
                    Despacho Seguro
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Após aprovação, os dados são transmitidos em paralelo aos canais com retry automático resiliente caso haja indisponibilidade momentânea nos marketplaces.
                  </p>
                </div>
              </div>

              {/* Edição em Massa */}
              <div className="p-4 rounded-xl border border-border/80 bg-sidebar/50 flex flex-col gap-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Zap className="size-4 text-primary" /> Edição em Massa de Catálogo & Preços
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Na tela de <strong>Catálogo & Estoque</strong>, você pode selecionar múltiplos produtos e aplicar um reajuste percentual simultâneo (ex: +10% para Black Friday ou -5% para queima de estoque). O Hub recalcula todas as variações e envia para a esteira automaticamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* SEÇÃO 5: GESTÃO DE PEDIDOS, STATUS & FORÇAR SINCRONIZAÇÃO     */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="orders-concurrency" className="m-0 flex flex-col gap-6">
          <Card className="border-border/80 bg-card">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    Gestão de Pedidos, Ciclo de Status & Sincronização
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Entenda todos os status do ciclo de vida dos pedidos, como forçar a sincronização imediata e a proteção contra concorrência simultânea.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 flex flex-col gap-8">
              {/* Botão de Forçar Sincronização de Pedidos */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                    <RefreshCw className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Como Forçar a Sincronização Imediata de Pedidos?</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Em <strong>Pedidos (/pedidos)</strong> ou no <strong>Dashboard</strong>, clique no botão <strong>"Atualizar / Sincronizar"</strong> no topo da página. O Hub enviará um comando de trigger para todos os canais (Mercado Livre, Shopify, Shopee, etc.) para buscar pedidos recentes sem esperar o próximo minuto do cron.
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs shrink-0 py-1 px-3">
                  Atalho Rápido no Topo
                </Badge>
              </div>

              {/* Tabela de Status dos Pedidos */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShoppingCart className="size-4 text-primary" /> Significado de Todos os Status do Pedido
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cada pedido possui dois indicadores: o <strong>Status Comercial da Venda</strong> e o <strong>Status de Integração com o ERP</strong>:
                </p>

                <div className="grid gap-4 md:grid-cols-2 mt-2">
                  {/* Status da Venda */}
                  <div className="rounded-xl border border-border bg-sidebar/50 p-4 flex flex-col gap-3">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider text-primary border-b border-border/60 pb-2">
                      1. Status Comercial (Venda no Canal)
                    </span>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="success" className="text-[10px] shrink-0">Pagamento recebido</Badge>
                        <span className="text-muted-foreground text-[11px] text-right">Venda paga e confirmada. Pronta para emissão de nota.</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="warning" className="text-[10px] shrink-0">Aguardando pagamento</Badge>
                        <span className="text-muted-foreground text-[11px] text-right">Boleto gerado ou Pix pendente de liquidação.</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="secondary" className="text-[10px] shrink-0">Pedido em separação</Badge>
                        <span className="text-muted-foreground text-[11px] text-right">Itens sendo coletados no estoque físico (Picking).</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="success" className="text-[10px] shrink-0">Pedido faturado</Badge>
                        <span className="text-muted-foreground text-[11px] text-right">Nota Fiscal (NFe) autorizada na SEFAZ pelo ERP.</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="success" className="text-[10px] shrink-0">Pedido enviado</Badge>
                        <span className="text-muted-foreground text-[11px] text-right">Despachado com código de rastreamento ativo.</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="success" className="text-[10px] shrink-0">Pedido entregue</Badge>
                        <span className="text-muted-foreground text-[11px] text-right">Concluído com entrega comprovada ao comprador.</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="destructive" className="text-[10px] shrink-0">Pedido cancelado</Badge>
                        <span className="text-muted-foreground text-[11px] text-right">Venda cancelada por falta de pagamento ou pelo cliente.</span>
                      </div>
                    </div>
                  </div>

                  {/* Status de Integração ERP */}
                  <div className="rounded-xl border border-border bg-sidebar/50 p-4 flex flex-col gap-3">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider text-emerald-400 border-b border-border/60 pb-2">
                      2. Status de Download / Envio ao ERP
                    </span>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] shrink-0">
                          Importado / Baixado
                        </Badge>
                        <span className="text-muted-foreground text-[11px] text-right">Pedido transmitido e gravado com sucesso no seu ERP.</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[10px] shrink-0">
                          Não baixado / Pendente
                        </Badge>
                        <span className="text-muted-foreground text-[11px] text-right">Aguardando o próximo ciclo de busca do ERP.</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10 text-[10px] shrink-0">
                          Falha na importação
                        </Badge>
                        <span className="text-muted-foreground text-[11px] text-right">Divergência (ex: SKU não cadastrado no ERP). Requer ajuste.</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className="border-sky-500/30 text-sky-400 bg-sky-500/10 text-[10px] shrink-0">
                          Corrigido
                        </Badge>
                        <span className="text-muted-foreground text-[11px] text-right">Editado no modal e pronto para reenvio automático.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Anti-Colisão Heartbeat Lock */}
              <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-sidebar/50 p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Lock className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Proteção Anti-Colisão em Tempo Real (Heartbeat Lock)</h3>
                    <p className="text-xs text-muted-foreground">Garante integridade quando múltiplos operadores atendem a mesma loja</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-3 border-t border-border/50 pt-3 leading-relaxed">
                  <p>
                    Ao abrir um pedido para edição (aba Formulário ou Editor JSON Bruto), o Hub assume uma <strong>trava temporária exclusiva</strong>:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside pl-1">
                    <li><strong>Aviso em Tempo Real</strong>: Outros usuários verão um banner indicando quem está com o pedido aberto.</li>
                    <li><strong>Auto-liberação por Inatividade</strong>: Se o operador fechar a janela ou ficar inativo por 2 minutos, o pedido é liberado automaticamente.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* SEÇÃO 6: GESTÃO DE EQUIPE, USUÁRIOS & PERFIS DE ACESSO        */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="team-management" className="m-0 flex flex-col gap-6">
          <Card className="border-border/80 bg-card">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                  <Users className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    Gestão de Equipe, Criação de Usuários & Níveis de Acesso
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Como criar contas para seus colaboradores, definir permissões de Gestor vs Operador e garantir segurança operacional.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 flex flex-col gap-6">
              {/* Passo a Passo de Criação */}
              <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-sidebar/40 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <UserPlus className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">Como Cadastrar um Novo Usuário no Hub Gestor</h3>
                      <p className="text-xs text-muted-foreground">Adicione membros do seu time com credenciais de login e senhas individuais</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-xs">
                    Menu /equipe
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground space-y-2 border-t border-border/50 pt-3">
                  <ol className="list-decimal list-inside space-y-2 pl-1 leading-relaxed">
                    <li>No menu lateral, clique em <strong>Equipe &amp; Usuários</strong> (ou acesse a rota <code>/equipe</code>).</li>
                    <li>No topo da tela, clique no botão <strong>"Novo Usuário"</strong> para abrir o modal de cadastro.</li>
                    <li>
                      Preencha os dados do colaborador:
                      <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-foreground/90">
                        <li><strong>Nome Completo</strong>: Identificação visual no cabeçalho e histórico de edição.</li>
                        <li><strong>Nome de Usuário (Login)</strong>: Login único (ex: <code>joao.silva</code> ou <code>joao@empresa.com.br</code>).</li>
                        <li><strong>E-mail</strong>: E-mail corporativo do usuário para comunicações do sistema.</li>
                        <li><strong>Senha Inicial</strong>: Senha de acesso com a qual o usuário fará o primeiro login.</li>
                        <li><strong>Perfil de Acesso</strong>: Selecione <em>Gestor da Loja</em> ou <em>Operador</em>.</li>
                      </ul>
                    </li>
                    <li>Clique em <strong>"Criar Usuário"</strong>. O acesso é liberado instantaneamente.</li>
                  </ol>
                </div>
              </div>

              {/* Comparativo de Perfis de Acesso */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Shield className="size-4 text-primary" /> Perfil: Gestor da Loja (Manager)
                    </span>
                    <Badge variant="default" className="text-[10px]">Acesso Total</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ideal para sócios, diretores e gerentes de e-commerce. Permite:
                  </p>
                  <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Visualização completa do <strong>Dashboard &amp; KPIs Financeiros</strong>;</li>
                    <li>Configuração de <strong>Conexões ERP, Chaves de API e Webhooks</strong>;</li>
                    <li>Instalação e ativação de <strong>Plugins de Marketplace</strong>;</li>
                    <li>Ajuste das <strong>Frequências de Busca Automática (Cron)</strong>;</li>
                    <li>Criação, ativação e exclusão de outros <strong>Usuários da Equipe</strong>.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-border bg-sidebar/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Users className="size-4 text-sky-400" /> Perfil: Operador (Operator)
                    </span>
                    <Badge variant="secondary" className="text-[10px]">Operacional</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ideal para operadores de estoque, SAC e faturamento. Permite:
                  </p>
                  <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Consulta e acompanhamento da <strong>Fila de Pedidos (/pedidos)</strong>;</li>
                    <li>Abertura e correção de pedidos pendentes no <strong>Formulário e JSON</strong>;</li>
                    <li>Consulta ao <strong>Catálogo de Produtos &amp; Saldos de Estoque</strong>;</li>
                    <li>Visualização da <strong>Esteira de Lotes de Produtos</strong>;</li>
                    <li><em>(Bloqueado para alterar credenciais de ERPs e configurações do Hub)</em>.</li>
                  </ul>
                </div>
              </div>

              {/* Boas Práticas & Segurança */}
              <div className="p-4 rounded-xl border border-border bg-card flex flex-col gap-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-400" /> Isolamento Multi-Tenant &amp; Desativação Rápida
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Todos os usuários criados ficam estritamente vinculados ao identificador exclusivo da sua empresa (<strong>Tenant ID</strong>). Em caso de desligamento de colaborador ou troca de função, o gestor pode clicar em <strong>"Desativar"</strong> na tabela para bloquear imediatamente o acesso à conta sem perder o histórico dos pedidos atendidos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
