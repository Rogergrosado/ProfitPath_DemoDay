import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)] hover:bg-slate-700"
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4 text-[hsl(20,90%,54%)]" />
      ) : (
        <Sun className="h-4 w-4 text-[hsl(20,90%,54%)]" />
      )}
    </Button>
  );
}
