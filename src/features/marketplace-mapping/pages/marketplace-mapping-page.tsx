import { useState, useEffect } from "react";
import {
  Store,
  Layers,
  Palette,
  Ruler,
  Search,
  Save,
  Check,
  RefreshCw,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/app/providers/auth-provider";
import { Link } from "react-router-dom";
import {
  fetchCustomerPlugins,
  fetchMarketplaceRemoteCategories,
  fetchMarketplaceCategoryMappings,
  saveMarketplaceCategoryMapping,
  fetchMarketplaceGrades,
  saveMarketplaceGrade,
  fetchProductCatalog,
  type CustomerPluginDto,
  type MarketplaceCategoryMappingDto,
  type RemoteCategoryDto,
  type GradeMappingDto,
} from "@/lib/api/hub-client";
import { getPluginLogo } from "@/components/icons/brand-icons";
import { toast } from "sonner";

export function MarketplaceMappingPage() {
  const { user } = useAuth();
  const [plugins, setPlugins] = useState<CustomerPluginDto[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<string>("Marketplace.MercadoLivre");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Categorias
  const [erpCategories, setErpCategories] = useState<string[]>([]);
  const [mappings, setMappings] = useState<MarketplaceCategoryMappingDto[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [remoteCategories, setRemoteCategories] = useState<RemoteCategoryDto[]>([]);
  const [searchingMlbCategory, setSearchingMlbCategory] = useState<string | null>(null);

  // Grades
  const [colorGrade, setColorGrade] = useState<GradeMappingDto>({ type: "cor", items: [] });
  const [sizeGrade, setSizeGrade] = useState<GradeMappingDto>({ type: "tamanho", items: [] });

  const customerId = user?.customerId || "default";

  // Carrega plugins e dados iniciais
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [plugList, catalogItems] = await Promise.all([
        fetchCustomerPlugins(customerId),
        fetchProductCatalog(customerId),
      ]);

      const marketplaceList = plugList.filter(
        (p) => p.kind === "marketplace" || p.systemName.toLowerCase().includes("mercadolivre")
      );

      // Garante que o Mercado Livre sempre esteja disponível para mapeamento
      const allMkt = marketplaceList.length > 0 ? marketplaceList : [
        {
          systemName: "Marketplace.MercadoLivre",
          friendlyName: "Mercado Livre",
          kind: "marketplace" as const,
          isEnabled: true,
          isConfigured: true,
          supportsCategoryMapping: true,
          supportsAttributes: true,
        },
      ];

      setPlugins(allMkt);
      if (!selectedPlugin && allMkt[0]) {
        setSelectedPlugin(allMkt[0].systemName);
      }

      // Extrai categorias do ERP existentes no catálogo
      const distinctCategories = Array.from(
        new Set(catalogItems.map((c) => c.category).filter(Boolean))
      );
      setErpCategories(
        distinctCategories.length > 0
          ? distinctCategories
          : ["Vestidos", "Blusas", "Calças", "Saias", "Casacos", "Geral"]
      );

      // Carrega mapeamentos e grades salvas
      const [loadedMappings, colors, sizes] = await Promise.all([
        fetchMarketplaceCategoryMappings(customerId, selectedPlugin),
        fetchMarketplaceGrades(customerId, selectedPlugin, "cor"),
        fetchMarketplaceGrades(customerId, selectedPlugin, "tamanho"),
      ]);

      setMappings(loadedMappings);
      setColorGrade(colors);
      setSizeGrade(sizes);
    } catch {
      toast.error("Erro ao carregar mapeamentos de marketplace.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [customerId, selectedPlugin]);

  // Busca categorias remotas no Mercado Livre
  const handleSearchRemoteCategories = async (query: string) => {
    try {
      const results = await fetchMarketplaceRemoteCategories(customerId, selectedPlugin, query);
      setRemoteCategories(results);
    } catch {
      // ignore
    }
  };

  const handleSelectRemoteCategory = async (erpCategory: string, remoteCat: RemoteCategoryDto) => {
    const newMapping: MarketplaceCategoryMappingDto = {
      erpCategoryId: erpCategory,
      erpCategoryName: erpCategory,
      marketplaceCategoryId: remoteCat.id,
      marketplaceCategoryName: remoteCat.name,
      marketplaceCategoryPath: remoteCat.pathFromRoot,
      isConfirmed: true,
    };

    setIsSaving(true);
    const success = await saveMarketplaceCategoryMapping(customerId, selectedPlugin, newMapping);
    setIsSaving(false);

    if (success) {
      setMappings((prev) => {
        const filtered = prev.filter((m) => m.erpCategoryId !== erpCategory);
        return [...filtered, newMapping];
      });
      setSearchingMlbCategory(null);
      toast.success(`Categoria "${erpCategory}" mapeada para "${remoteCat.name}" no Mercado Livre.`);
    } else {
      toast.error("Falha ao salvar mapeamento de categoria.");
    }
  };

  const handleSaveColorGrade = async () => {
    setIsSaving(true);
    const success = await saveMarketplaceGrade(customerId, selectedPlugin, "cor", colorGrade);
    setIsSaving(false);
    if (success) {
      toast.success("Grade de cores do Mercado Livre salva com sucesso!");
    } else {
      toast.error("Erro ao salvar grade de cores.");
    }
  };

  const handleSaveSizeGrade = async () => {
    setIsSaving(true);
    const success = await saveMarketplaceGrade(customerId, selectedPlugin, "tamanho", sizeGrade);
    setIsSaving(false);
    if (success) {
      toast.success("Grade de tamanhos do Mercado Livre salva com sucesso!");
    } else {
      toast.error("Erro ao salvar grade de tamanhos.");
    }
  };

  const currentPluginObj = plugins.find((p) => p.systemName === selectedPlugin) || plugins[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Store className="size-6 text-primary" />
            Mapeamento de Marketplaces
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure as regras de categorias, grades de cores e tamanhos para os canais de venda integrados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Marketplace */}
          {plugins.length > 0 && (
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/60 border border-border">
              {plugins.map((plugin) => (
                <button
                  key={plugin.systemName}
                  onClick={() => setSelectedPlugin(plugin.systemName)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    selectedPlugin === plugin.systemName
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="shrink-0">
                    {getPluginLogo(plugin.systemName, "size-4 rounded-xs shrink-0")}
                  </span>
                  <span>{plugin.friendlyName}</span>
                </button>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {plugins.length === 0 && !isLoading && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-6 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Nenhum plugin de marketplace instalado</p>
                <p className="text-xs text-muted-foreground">
                  Para utilizar o mapeamento de categorias e grades, instale um plugin como Mercado Livre ou Shopify no catálogo.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="shrink-0 text-xs">
              <Link to="/conexoes-erp">Ir para Catálogo de Plugins</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs Principais */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 border border-border">
          <TabsTrigger value="categories" className="gap-2 text-xs font-semibold">
            <Layers className="size-3.5" />
            Mapeamento de Categorias
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-2 text-xs font-semibold">
            <Palette className="size-3.5" />
            Grade de Cores
          </TabsTrigger>
          <TabsTrigger value="sizes" className="gap-2 text-xs font-semibold">
            <Ruler className="size-3.5" />
            Grade de Tamanhos
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CATEGORIAS */}
        <TabsContent value="categories" className="space-y-4">
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Categorias ERP &gt; {currentPluginObj?.friendlyName || "Mercado Livre"}</span>
                <Badge variant="outline" className="text-xs">
                  {mappings.length} de {erpCategories.length} categorias mapeadas
                </Badge>
              </CardTitle>
              <CardDescription>
                Associe cada categoria de produto do seu ERP à categoria oficial correspondente na árvore do marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Categoria do ERP</TableHead>
                    <TableHead className="w-1/2">Categoria no {currentPluginObj?.friendlyName || "Mercado Livre"}</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {erpCategories.map((erpCat) => {
                    const mapped = mappings.find((m) => m.erpCategoryId === erpCat);
                    const isSearchingThis = searchingMlbCategory === erpCat;

                    return (
                      <TableRow key={erpCat}>
                        <TableCell className="font-semibold text-foreground">
                          {erpCat}
                        </TableCell>

                        <TableCell>
                          {isSearchingThis ? (
                            <div className="flex flex-col gap-2 max-w-md">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                                <Input
                                  autoFocus
                                  placeholder="Digite o nome da categoria no Mercado Livre..."
                                  value={categorySearch}
                                  onChange={(e) => {
                                    setCategorySearch(e.target.value);
                                    handleSearchRemoteCategories(e.target.value);
                                  }}
                                  className="pl-8 text-xs h-8"
                                />
                              </div>

                              <div className="max-h-48 overflow-y-auto border border-border rounded-lg bg-card shadow-lg divide-y divide-border/60">
                                {remoteCategories.length === 0 ? (
                                  <div className="p-3 text-xs text-muted-foreground text-center">
                                    Nenhuma categoria encontrada. Digite um termo de busca.
                                  </div>
                                ) : (
                                  remoteCategories.map((rc) => (
                                    <button
                                      key={rc.id}
                                      onClick={() => handleSelectRemoteCategory(erpCat, rc)}
                                      className="w-full text-left p-2 hover:bg-primary/10 transition-colors text-xs flex flex-col gap-0.5 cursor-pointer"
                                    >
                                      <span className="font-bold text-foreground">{rc.name}</span>
                                      <span className="text-[10px] text-muted-foreground line-clamp-1">
                                        {rc.pathFromRoot}
                                      </span>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          ) : mapped ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                                <CheckCircle2 className="size-3.5 text-emerald-500" />
                                <span>{mapped.marketplaceCategoryName}</span>
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono">
                                  {mapped.marketplaceCategoryId}
                                </Badge>
                              </div>
                              {mapped.marketplaceCategoryPath && (
                                <span className="text-[10px] text-muted-foreground line-clamp-1">
                                  {mapped.marketplaceCategoryPath}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-amber-500 font-medium flex items-center gap-1">
                              <AlertCircle className="size-3.5" />
                              Não mapeada
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          {isSearchingThis ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSearchingMlbCategory(null)}
                              className="text-xs h-7"
                            >
                              Cancelar
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchingMlbCategory(erpCat);
                                setCategorySearch(erpCat);
                                handleSearchRemoteCategories(erpCat);
                              }}
                              className="text-xs h-7"
                            >
                              {mapped ? "Alterar" : "Mapear"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: GRADE DE CORES */}
        <TabsContent value="colors" className="space-y-4">
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="size-4 text-primary" />
                  De/Para de Cores ({currentPluginObj?.friendlyName || "Mercado Livre"})
                </CardTitle>
                <CardDescription>
                  Mapeie as variações de cores cadastradas no ERP para as cores padrão aceitas pelo marketplace.
                </CardDescription>
              </div>

              <Button size="sm" onClick={handleSaveColorGrade} disabled={isSaving} className="gap-1.5">
                <Save className="size-3.5" />
                Salvar Grade de Cores
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Cor no ERP</TableHead>
                    <TableHead className="w-1/2">Cor no Marketplace</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colorGrade.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-semibold text-foreground">{item.sourceValue}</TableCell>
                      <TableCell>
                        <Input
                          value={item.targetValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            setColorGrade((prev) => ({
                              ...prev,
                              items: prev.items.map((it, i) => (i === index ? { ...it, targetValue: val } : it)),
                            }));
                          }}
                          className="text-xs h-8 max-w-xs"
                          placeholder="Ex: Marrom, Preto, Azul..."
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: GRADE DE TAMANHOS */}
        <TabsContent value="sizes" className="space-y-4">
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Ruler className="size-4 text-primary" />
                  De/Para de Tamanhos ({currentPluginObj?.friendlyName || "Mercado Livre"})
                </CardTitle>
                <CardDescription>
                  Mapeie as grades de tamanhos do ERP para os valores compatíveis da tabela de medidas do marketplace.
                </CardDescription>
              </div>

              <Button size="sm" onClick={handleSaveSizeGrade} disabled={isSaving} className="gap-1.5">
                <Save className="size-3.5" />
                Salvar Grade de Tamanhos
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Tamanho no ERP</TableHead>
                    <TableHead className="w-1/2">Tamanho no Marketplace</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sizeGrade.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-semibold text-foreground">{item.sourceValue}</TableCell>
                      <TableCell>
                        <Input
                          value={item.targetValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSizeGrade((prev) => ({
                              ...prev,
                              items: prev.items.map((it, i) => (i === index ? { ...it, targetValue: val } : it)),
                            }));
                          }}
                          className="text-xs h-8 max-w-xs"
                          placeholder="Ex: P, M, G, GG..."
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
