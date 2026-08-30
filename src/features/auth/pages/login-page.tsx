import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Building, ArrowRight, ShieldCheck, Zap, KeyRound, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/app/providers/auth-provider";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  // Mode: "user" | "api"
  const [authMode, setAuthMode] = useState<"user" | "api">("user");

  // User/Pass fields
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [customerId, setCustomerId] = useState("6a9218d05e09ae4df7465e34");

  // API Key/Secret fields for Amura Teste
  const [consumerKey, setConsumerKey] = useState("ck_8f422823b5aef2d63836c13fc0531a20624f3a50014a74f0a822c4d0d35f2de0");
  const [consumerSecret, setConsumerSecret] = useState("cs_test_amura_secret_key");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (authMode === "user") {
        if (!username || !password) {
          toast.error("Por favor, informe seu usuário e senha.");
          return;
        }
        await login({ username, password, customerId });
      } else {
        if (!consumerKey) {
          toast.error("Por favor, informe a Consumer Key.");
          return;
        }
        await login({
          username: "contato@amura.com.br",
          password: "",
          customerId: "6a9218d05e09ae4df7465e34",
          consumerKey,
          consumerSecret,
        } as any);
      }

      toast.success("Login realizado com sucesso! Conectado como Amura Teste.");
      navigate("/");
    } catch {
      toast.error("Falha na autenticação. Verifique suas credenciais.");
    }
  };

  const handleQuickLoginAmuraTeste = async () => {
    try {
      await login({
        username: "contato@amura.com.br",
        password: "admin",
        customerId: "6a9218d05e09ae4df7465e34",
        consumerKey: "ck_8f422823b5aef2d63836c13fc0531a20624f3a50014a74f0a822c4d0d35f2de0",
      } as any);

      toast.success("Conectado como Cliente Amura Teste (Mercado Livre & Vestido Mel)!");
      navigate("/");
    } catch {
      toast.error("Erro ao conectar.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-40 -right-40 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col gap-6 relative z-10">
        {/* Branding */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 mb-3">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Amura Hub Gerencial
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Painel de Gestão & Indicadores para Lojistas e Gestores
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="border-border/80 shadow-2xl backdrop-blur-md bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Acessar Painel</CardTitle>
              <Badge variant="outline" className="text-[10px] gap-1 border-primary/40 text-primary">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Aspire Online
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Cliente: <strong>Amura Teste</strong> (Mercado Livre)
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="w-full mb-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="user" className="text-xs gap-1.5">
                  <User className="size-3.5" />
                  Usuário & Senha
                </TabsTrigger>
                <TabsTrigger value="api" className="text-xs gap-1.5">
                  <KeyRound className="size-3.5" />
                  Chave API / Loja
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs mt-3">
                <TabsContent value="user" className="flex flex-col gap-3 m-0">
                  <div>
                    <label className="font-medium text-foreground">Usuário do Gerenciador</label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        className="pl-9 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-foreground">Senha</label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-9 text-xs"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="api" className="flex flex-col gap-3 m-0">
                  <div>
                    <label className="font-medium text-foreground">Consumer Key (Chave da Loja)</label>
                    <div className="relative mt-1">
                      <KeyRound className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={consumerKey}
                        onChange={(e) => setConsumerKey(e.target.value)}
                        placeholder="ck_..."
                        className="pl-9 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-foreground">Consumer Secret</label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={consumerSecret}
                        onChange={(e) => setConsumerSecret(e.target.value)}
                        placeholder="cs_..."
                        className="pl-9 text-xs font-mono"
                      />
                    </div>
                  </div>
                </TabsContent>

                <Button type="submit" disabled={isLoading} className="w-full mt-2 gap-2 text-xs cursor-pointer">
                  {isLoading ? (
                    "Autenticando..."
                  ) : (
                    <>
                      <span>Entrar como Amura Teste</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            </Tabs>

            {/* 1-Click Fast Test Customer Login */}
            <div className="border-t border-border/60 pt-3 mt-2 flex flex-col gap-2">
              <p className="text-[11px] text-muted-foreground text-center font-medium">
                Cliente Real cadastrado no Hub:
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickLoginAmuraTeste}
                className="w-full text-xs gap-1.5 border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary cursor-pointer"
              >
                <Sparkles className="size-3.5" />
                Entrar como Amura Teste (Mercado Livre & Vestido Mel)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
