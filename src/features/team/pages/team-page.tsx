import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, KeyRound, Check, X, Trash2, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/app/providers/auth-provider";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: "Manager" | "Operator";
  active: boolean;
  isAdmin?: boolean;
  createdAt: string;
}

export function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (user) {
      setMembers((prev) => {
        const additionalMembers = prev.filter((m) => !m.isAdmin);
        const adminMember: TeamMember = {
          id: "admin_1",
          username: user.email || user.username || "amura@amura.com.br",
          displayName: user.displayName || user.customerName || "Amura Teste",
          email: user.email || "amura@amura.com.br",
          role: "Manager",
          active: true,
          isAdmin: true,
          createdAt: new Date().toISOString(),
        };
        return [adminMember, ...additionalMembers];
      });
    }
  }, [user]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"Manager" | "Operator">("Operator");
  const [userToDelete, setUserToDelete] = useState<TeamMember | null>(null);

  const handleCreateUser = () => {
    if (!newUsername || !newName || !newEmail || !newPassword) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (members.some((m) => m.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      toast.error("Já existe um usuário cadastrado com este login.");
      return;
    }

    const created: TeamMember = {
      id: `m_${Date.now()}`,
      username: newUsername.trim(),
      displayName: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      active: true,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };

    setMembers((prev) => [...prev, created]);
    toast.success(`Usuário ${created.displayName} (${created.username}) cadastrado com sucesso!`);
    setIsCreateOpen(false);
    setNewUsername("");
    setNewName("");
    setNewEmail("");
    setNewPassword("");
  };

  const handleToggleActive = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
    toast.info("Status do usuário alterado.");
  };

  const handleDeleteUser = (member: TeamMember) => {
    if (member.isAdmin) {
      toast.error("O usuário administrador principal não pode ser excluído.");
      return;
    }

    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    toast.success(`Usuário ${member.displayName} removido com sucesso.`);
    setUserToDelete(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Equipe e Usuários
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as credenciais e permissões de acesso ao Hub Gestor da sua empresa.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5">
          <UserPlus className="size-3.5" />
          Novo Usuário
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-foreground">Isolamento Multi-Tenant Garantido</p>
            <p className="text-muted-foreground mt-0.5">
              Todos os usuários criados aqui pertencem exclusivamente à conta <strong>{user?.customerName || "Amura Teste"}</strong> e têm acesso apenas aos seus pedidos, lotes e relatórios.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border/80">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Usuário / Login</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{member.displayName}</span>
                      {member.isAdmin && (
                        <Badge variant="outline" className="text-[9px] border-primary/40 text-primary py-0 px-1">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {member.username}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role === "Manager" ? "default" : "secondary"} className="text-[10px]">
                      {member.role === "Manager" ? "Gestor da Loja" : "Operador"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(member.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.active ? "success" : "destructive"} className="text-[10px]">
                      {member.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!member.isAdmin ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(member.id)}
                            className="h-8 text-xs"
                          >
                            {member.active ? "Desativar" : "Ativar"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setUserToDelete(member)}
                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic px-2">
                          Protegido
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <UserPlus className="size-4 text-primary" />
              Cadastrar Novo Usuário
            </DialogTitle>
            <DialogDescription className="text-xs">
              Crie credenciais de acesso para um colaborador da sua equipe.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2 text-xs">
            <div>
              <label className="font-medium text-foreground">Nome Completo</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Carlos Eduardo"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-foreground">Nome de Usuário (Login)</label>
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Ex: carlos.eduardo"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-foreground">E-mail</label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Ex: carlos@empresa.com.br"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-foreground">Senha Inicial</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-foreground">Perfil de Acesso</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Operator">Operador (Visualização e gestão de pedidos)</option>
                <option value="Manager">Gestor (Acesso total)</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleCreateUser}>
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      {userToDelete && (
        <Dialog open={Boolean(userToDelete)} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base text-destructive flex items-center gap-2">
                <Trash2 className="size-4" />
                Excluir Usuário
              </DialogTitle>
              <DialogDescription className="text-xs">
                Tem certeza de que deseja remover o usuário <strong>{userToDelete.displayName}</strong> ({userToDelete.username})? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button variant="outline" size="sm" onClick={() => setUserToDelete(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteUser(userToDelete)}
              >
                Excluir Definitivamente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
