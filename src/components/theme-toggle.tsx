
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0 ape:rotate-90 ape:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 ape:rotate-90 ape:scale-0" />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all ape:rotate-0 ape:scale-100" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5"></path>
            <path d="M5.15 17.89c5.52-1.52 8.65-6.89 7-12C18.39 7.92 19.65 6.47 21 6c-1.35 6.95-6.35 11.74-13.3 13.5-2.75.7-5.7.7-8.5 0 1.55-1.5 3.75-2.17 5.95-1.6Z"></path>
          </svg>
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
