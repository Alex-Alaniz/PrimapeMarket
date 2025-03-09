
"use client";

import { ThemeProvider as ThemeProviderNextThemes } from "next-themes";
import { ThirdwebProvider } from "thirdweb/react";
import { useState, useEffect } from 'react';
import { client } from "@/app/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Force apply theme immediately on page load to avoid flashing
    const currentTheme = localStorage.getItem('theme')
    if (currentTheme) {
      document.documentElement.classList.add('no-transition')
      document.documentElement.classList.remove('light', 'dark', 'ape')
      document.documentElement.classList.add(currentTheme)
      setTimeout(() => {
        document.documentElement.classList.remove('no-transition')
      }, 100)
    }
  }, [])

  if (!mounted) return <>{children}</>

  return (
    <ThemeProviderNextThemes 
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme={false}
      themes={['light', 'dark', 'ape']}
      value={{ "light": "light", "dark": "dark", "ape": "ape" }}
      forcedTheme={typeof window !== "undefined" && window.localStorage.getItem("theme") === "ape" ? "ape" : undefined}
    >
      <ThirdwebProvider
        client={client}
      >
        {children}
      </ThirdwebProvider>
    </ThemeProviderNextThemes>
  )
}
