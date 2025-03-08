
"use client";

import { ThemeProvider } from "next-themes";
import { ThirdwebProvider } from "thirdweb/react";
import { ApeChain } from "@thirdweb-dev/chains";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
      value={{
        light: "light",
        dark: "dark",
        ape: "ape",
      }}
    >
      <ThirdwebProvider
        activeChain={ApeChain}
        clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        supportedWallets={[]}
      >
        {children}
      </ThirdwebProvider>
    </ThemeProvider>
  );
}
