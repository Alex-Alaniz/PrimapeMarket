
"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Banana, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  // Add a state to keep track of the current theme to avoid any resolution issues
  const [currentTheme, setCurrentTheme] = React.useState<string | undefined>(undefined);
  
  // Sync the current theme with the resolved theme
  React.useEffect(() => {
    setCurrentTheme(resolvedTheme);
  }, [resolvedTheme]);
  
  // Function to safely change theme with no-transition class
  const safelySetTheme = (theme: string) => {
    // Add no-transition class to prevent flickering
    document.documentElement.classList.add('no-transition');
    
    // Set the theme
    setTheme(theme);
    
    // Update the current theme state
    setCurrentTheme(theme);
    
    // Remove the no-transition class after a small delay
    setTimeout(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('no-transition');
      });
    }, 100);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={currentTheme === "ape" ? "default" : "outline"} 
          size="icon"
          className={currentTheme === "ape" ? "bg-[hsl(290,100%,75%)] hover:bg-[hsl(290,100%,65%)]" : ""}
        >
          {currentTheme === "light" ? (
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          ) : currentTheme === "ape" ? (
            <Banana className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all animate-pulse" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => safelySetTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => safelySetTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => safelySetTheme("ape")}>
          Ape
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
