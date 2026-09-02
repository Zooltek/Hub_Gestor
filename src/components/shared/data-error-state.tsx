import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function DataErrorState({
  title = "Não foi possível carregar os dados",
  message = "Ocorreu uma falha na comunicação com a API do Hub. Verifique sua conexão ou tente novamente.",
  onRetry,
  isRetrying = false,
}: DataErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5 my-4">
      <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
        <AlertCircle className="size-5 text-destructive" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="gap-2 text-xs"
        >
          <RefreshCw className={`size-3.5 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "Tentando novamente..." : "Tentar novamente"}
        </Button>
      )}
    </div>
  );
}
