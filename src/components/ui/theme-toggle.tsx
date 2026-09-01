import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/providers/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="size-8 text-muted-foreground hover:text-foreground cursor-pointer transition-transform duration-200 active:scale-95"
      title={resolvedTheme === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-4 text-amber-400 transition-all hover:rotate-45" />
      ) : (
        <Moon className="size-4 text-indigo-500 transition-all hover:-rotate-12" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
