
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
