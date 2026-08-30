import { ShieldAlert, UserCheck, Lock } from "lucide-react";
import type { ConcurrencyLock } from "@/hooks/use-concurrency-lock";
import { formatDateTime } from "@/lib/utils";

interface ConcurrencyBannerProps {
  lock: ConcurrencyLock | null;
  isLockedByMe: boolean;
}

export function ConcurrencyBanner({ lock, isLockedByMe }: ConcurrencyBannerProps) {
  if (!lock) return null;

  if (isLockedByMe) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary font-medium animate-pulse">
        <Lock className="size-4 shrink-0" />
        <span>
          Você está com o bloqueio exclusivo de edição deste registro. Outros operadores verão aviso caso acessem.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
      <ShieldAlert className="size-5 shrink-0 text-amber-400 mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-amber-300">
          Atenção: Registro em edição por outro usuário
        </span>
        <span className="text-xs text-amber-200/80">
          <strong>{lock.lockedBy.displayName}</strong> ({lock.lockedBy.username}) iniciou uma edição às {formatDateTime(lock.lockedAt)}. Alterações simultâneas podem causar conflitos.
        </span>
      </div>
    </div>
  );
}
