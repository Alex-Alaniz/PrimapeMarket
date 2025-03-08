"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Banana } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const resolvedTheme = theme === 'system' ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light' : theme;


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={resolvedTheme === "ape" ? "default" : "outline"} 
          size="icon"
          className={resolvedTheme === "ape" ? "bg-[hsl(290,100%,75%)] hover:bg-[hsl(290,100%,65%)]" : ""}
        >
          {resolvedTheme === "light" ? (
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          ) : resolvedTheme === "ape" ? (
            <Banana className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all animate-pulse" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
          document.documentElement.classList.add('no-transition');
          setTimeout(() => {
            setTheme("light");
            requestAnimationFrame(() => {
              document.documentElement.classList.remove('no-transition');
            });
          }, 0);
        }}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          document.documentElement.classList.add('no-transition');
          setTimeout(() => {
            setTheme("dark");
            requestAnimationFrame(() => {
              document.documentElement.classList.remove('no-transition');
            });
          }, 0);
        }}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          document.documentElement.classList.add('no-transition');
          setTimeout(() => {
            setTheme("ape");
            requestAnimationFrame(() => {
              document.documentElement.classList.remove('no-transition');
            });
          }, 0);
        }}>
          Ape
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}