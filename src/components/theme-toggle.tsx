
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
  const { setTheme, theme, resolvedTheme } = useTheme();

  // Add a state to keep track of the current theme
  const [currentTheme, setCurrentTheme] = React.useState<string | undefined>(undefined);
  
  // Force theme change when component mounts if theme is stored in local storage
  React.useEffect(() => {
    // Initialize currentTheme with the active theme
    setCurrentTheme(theme === 'system' ? resolvedTheme : theme);
    
    // Apply no-transition class initially to prevent flashing
    document.documentElement.classList.add('no-transition');
    
    // Clean up the no-transition class after a short delay
    const timeoutId = setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [theme, resolvedTheme]);
  
  // Update current theme whenever the theme or resolvedTheme changes
  React.useEffect(() => {
    setCurrentTheme(theme === 'system' ? resolvedTheme : theme);
  }, [theme, resolvedTheme]);
  
  // Function to safely change theme with no-transition class
  const safelySetTheme = (newTheme: string) => {
    // Add no-transition class to prevent flickering
    document.documentElement.classList.add('no-transition');
    
    // Set the theme
    setTheme(newTheme);
    
    // Update the current theme state immediately for UI consistency
    setCurrentTheme(newTheme);
    
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
