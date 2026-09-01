import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Building, ArrowRight, ShieldCheck, Zap, KeyRound, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
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

  // Mode: "api" (padrão do Hub Desktop) | "user"
  const [authMode, setAuthMode] = useState<"api" | "user">("api");

  // API Key/Secret fields (Padrão Hub Desktop)
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");

  // User/Pass fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (authMode === "api") {
        if (!consumerKey?.trim() || !consumerSecret?.trim()) {
          toast.error("Por favor, informe a Consumer Key e o Consumer Secret.");
          return;
        }

        await login({
          consumerKey: consumerKey.trim(),
          consumerSecret: consumerSecret.trim(),
        } as any);
      } else {
        if (!username?.trim() || !password) {
          toast.error("Por favor, informe seu e-mail/usuário e senha.");
          return;
        }

        await login({
          username: username.trim(),
          password,
        });
      }

      toast.success("Autenticado com sucesso no Hub!");
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      const serverMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        (err?.response?.status === 401
          ? "Credenciais inválidas. Verifique se a Consumer Key e Secret correspondem exatamente ao Cliente cadastrado no Hub."
          : "Falha na comunicação com o Hub de Produção.");
      toast.error(serverMessage);
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
          <div className="flex items-center justify-center size-12 rounded-xl overflow-hidden shadow-lg shadow-primary/30 mb-3 bg-primary/10">
            <img src="/ICONE.png" alt="Hub Gestor" className="size-12 object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Hub Gestor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Painel Unificado de Gestão, Catálogo & Vendas
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="border-border/80 shadow-2xl backdrop-blur-md bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Acesso ao Painel</CardTitle>
              <Badge variant="outline" className="text-[10px] gap-1 border-primary/40 text-primary">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Hub Cloud Ativo
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Autentique-se utilizando as chaves de API do seu Cliente ou usuário do sistema.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="w-full mb-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="api" className="text-xs gap-1.5">
                  <KeyRound className="size-3.5" />
                  Chaves de API (Cliente / ERP)
                </TabsTrigger>
                <TabsTrigger value="user" className="text-xs gap-1.5">
                  <User className="size-3.5" />
                  Usuário Admin
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs mt-3">
                {/* API Keys Mode (Same as Hub Desktop) */}
                <TabsContent value="api" className="flex flex-col gap-3 m-0">
                  <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-primary flex items-start gap-2">
                    <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                    <span>
                      Copie a <strong>Consumer Key</strong> e o <strong>Consumer Secret</strong> gerados no cadastro do <strong>Cliente</strong> no Hub Admin.
                    </span>
                  </div>

                  <div>
                    <label className="font-medium text-foreground">Consumer Key</label>
                    <div className="relative mt-1">
                      <KeyRound className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={consumerKey}
                        onChange={(e) => setConsumerKey(e.target.value)}
                        placeholder="Ex: ck_8f422823b5aef2d6..."
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
                        placeholder="Ex: cs_..."
                        className="pl-9 text-xs font-mono"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Email / Password Mode */}
                <TabsContent value="user" className="flex flex-col gap-3 m-0">
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground flex items-start gap-2">
                    <User className="size-4 shrink-0 mt-0.5 text-foreground" />
                    <span>
                      Para usuários cadastrados diretamente na seção <strong>Usuários</strong> do Hub Admin.
                    </span>
                  </div>

                  <div>
                    <label className="font-medium text-foreground">E-mail ou Login</label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin@empresa.com.br"
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

                <Button type="submit" disabled={isLoading} className="w-full mt-2 gap-2 text-xs cursor-pointer">
                  {isLoading ? (
                    "Autenticando..."
                  ) : (
                    <>
                      <span>Entrar no Hub Gestor</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
