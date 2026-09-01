import { Badge } from "@/components/ui/badge";
import type { StatusTone } from "@/lib/status";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  tone: StatusTone;
  children: React.ReactNode;
  indicator?: React.ReactNode;
  className?: string;
}

export function StatusBadge({ tone, children, indicator, className }: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors inline-flex items-center",
        tone === "danger" && "bg-destructive/10 text-destructive border-destructive/20",
        tone === "warning" && "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20",
        tone === "pending" && "bg-sky-500/10 text-sky-500 dark:text-sky-400 border-sky-500/20",
        tone === "success" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        tone === "default" && "bg-muted text-muted-foreground border-border",
        className
      )}
      variant="outline"
    >
      {indicator ?? (
        <span
          className={cn(
            "size-1.5 rounded-full shrink-0",
            tone === "danger" && "bg-destructive",
            tone === "pending" && "bg-sky-500",
            tone === "warning" && "bg-amber-500",
            tone === "success" && "bg-emerald-500",
            tone === "default" && "bg-muted-foreground",
          )}
        />
      )}
      <span>{children}</span>
    </Badge>
  );
}
