
"use client";

import { useState, useEffect } from "react";
import { useActiveAccount, useConnect, useActiveWallet } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { client } from "@/app/client";

export function useAuth() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { connect } = useConnect();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in when account changes
    if (account?.address) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [account]);

  const handleSignIn = () => {
    if (isLoggedIn) {
      // Add logout logic if needed
      setIsLoggedIn(false);
    } else {
      connect();
    }
  };

  return {
    isLoggedIn,
    account,
    wallet,
    handleSignIn,
    AuthButton: () => (
      <Button type="button" onClick={handleSignIn}>
        {isLoggedIn ? "Sign out" : "Sign in"}
      </Button>
    )
  };
}
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ThirdwebProvider, ConnectWallet, useAddress, useSigner } from "thirdweb-react";
import { defineChain } from "thirdweb/chains";
import { Button } from "@/components/ui/button";

interface AuthContextProps {
  account: { address: string } | null;
  isLoggedIn: boolean;
  AuthButton: () => JSX.Element;
}

const AuthContext = createContext<AuthContextProps>({
  account: null,
  isLoggedIn: false,
  AuthButton: () => <div>Loading...</div>,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const address = useAddress();
  const [account, setAccount] = useState<{ address: string } | null>(null);

  useEffect(() => {
    if (address) {
      setAccount({ address });
    } else {
      setAccount(null);
    }
  }, [address]);

  const AuthButton = () => {
    return (
      <ConnectWallet 
        theme="dark"
        btnTitle="Connect Wallet"
        modalTitle="Connect Your Wallet"
      />
    );
  };

  const value = {
    account,
    isLoggedIn: !!account,
    AuthButton,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthWrapper({ children }: { children: ReactNode }) {
  const apeChain = defineChain(33139);

  return (
    <ThirdwebProvider
      activeChain={apeChain}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      <AuthProvider>{children}</AuthProvider>
    </ThirdwebProvider>
  );
}
