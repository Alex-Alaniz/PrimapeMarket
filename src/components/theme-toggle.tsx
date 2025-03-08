
"use client";

import * as React from "react";
import { Moon, Sun, Banana } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = React.useState<string | undefined>(undefined);
  const [themeChanging, setThemeChanging] = React.useState(false);

  // Initialize the theme on mount
  React.useEffect(() => {
    // Set the current theme based on what's active
    setCurrentTheme(theme === 'system' ? resolvedTheme : theme);
  }, [theme, resolvedTheme]);

  // Function to handle theme changes with improved transition handling
  const handleThemeChange = (newTheme: string) => {
    // Mark that we're changing themes to prevent flickering
    setThemeChanging(true);
    
    // Apply no-transition class to prevent jarring transitions
    document.documentElement.classList.add('no-transition');
    
    // Force a browser reflow to ensure the no-transition class takes effect
    // This is critical for transitions from Ape mode
    void document.documentElement.offsetHeight;
    
    // Set the theme
    setTheme(newTheme);
    
    // Update the current theme state immediately for UI consistency
    setCurrentTheme(newTheme);
    
    // Remove the no-transition class after a delay to allow the DOM to update
    setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
      setThemeChanging(false);
      
      // If switching from Ape mode, force a class list refresh
      if (theme === 'ape') {
        document.documentElement.classList.remove('ape');
        void document.documentElement.offsetHeight; // Force reflow
        document.documentElement.classList.add(newTheme);
      }
    }, 100);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={currentTheme === "ape" ? "default" : "outline"} 
          size="icon"
          className={currentTheme === "ape" ? "bg-[hsl(290,100%,75%)] hover:bg-[hsl(290,100%,65%)]" : ""}
          disabled={themeChanging}
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
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("ape")}>
          Ape
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
