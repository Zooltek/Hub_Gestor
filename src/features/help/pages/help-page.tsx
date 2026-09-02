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
                placeholder="Buscar no manual (ex: Bling, KPIs, Lotes)..."
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
        <TabsList className="grid grid-cols-2 md:grid-cols-5 p-1 bg-muted/60 border border-border/80 h-auto">
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

              {/* Shopify */}
              <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-sidebar/40 p-5">
                <div className="flex items-center gap-3">
                  <ShopifyLogo className="size-8 rounded-lg shrink-0" />
                  <div>
                    <h3 className="text-base font-bold text-foreground">Shopify Cloud</h3>
                    <p className="text-xs text-muted-foreground">Sincronização estrita de variantes por SKU e inventário em tempo real</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-2 border-t border-border/50 pt-3">
                  <p className="font-semibold text-foreground">Como configurar o App Customizado no Shopify:</p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                    <li>No painel do Shopify, vá em <strong>Configurações &gt; Apps e canais de vendas &gt; Desenvolver apps</strong>.</li>
                    <li>Clique em <strong>Criar um app</strong> e dê o nome de <em>Amura Hub Sync</em>.</li>
                    <li>Na aba <strong>Configuração</strong>, configure os escopos da API Admin: <em>write_products, read_products, write_inventory, read_inventory, write_orders, read_orders</em>.</li>
                    <li>Clique em <strong>Instalar app</strong> e copie o <strong>Admin API Access Token</strong> (que começa com <code>shpat_...</code>).</li>
                    <li>No Hub Gestor, insira o domínio da loja (ex: <code>minhaloja.myshopify.com</code>) e o Token gerado.</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* SEÇÃO 4: ESTEIRA DE PRODUTOS & LOTES                         */}
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
                    Esteira de Processamento de Lotes (Pipeline)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Entenda como o Hub recebe dados do ERP, detecta divergências e permite revisão antes do despacho para os canais.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 flex flex-col gap-6">
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
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-2 mt-2">
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
        {/* SEÇÃO 5: GESTÃO DE PEDIDOS & TRAVAS DE CONCORRÊNCIA          */}
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
                    Gestão de Pedidos & Mecanismo Anti-Colisão
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Proteção contra sobrescrita simultânea de pedidos quando múltiplos operadores trabalham no mesmo painel.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 flex flex-col gap-6">
              <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-sidebar/50 p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Lock className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Como funciona a Proteção Anti-Colisão (Heartbeat Lock)?</h3>
                    <p className="text-xs text-muted-foreground">Garante consistência e integridade absoluta aos pedidos de venda</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-3 border-t border-border/50 pt-3 leading-relaxed">
                  <p>
                    Quando um operador abre o modal de edição de um pedido (seja na aba de Formulário ou no Editor JSON Bruto), o Hub registra uma <strong>trava exclusiva temporária</strong> para aquele operador.
                  </p>
                  <ul className="space-y-2 list-disc list-inside pl-1">
                    <li><strong>Banner em Tempo Real</strong>: Se outro operador tentar editar o mesmo pedido simultaneamente, o sistema exibirá um aviso informativo indicando quem está editando no momento.</li>
                    <li><strong>Expiração Automática por Inatividade</strong>: Se o operador fechar o navegador ou ficar inativo por mais de 2 minutos, a trava expira automaticamente, liberando a edição para outros membros da equipe sem travar a operação.</li>
                    <li><strong>Editor JSON com Validação Sintática</strong>: Permite correções manuais avançadas em payloads de pedidos com validação de esquema antes de salvar no MongoDB.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
