
"use client";

import { useState, useEffect } from "react";
import { useActiveAccount, useConnect, useActiveWallet } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { client } from "@/app/client";
import { LogOut, LogIn } from "lucide-react";

interface AuthUser {
  address: string;
  displayName?: string;
  profiles?: any[];
}

export function useAuth() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { connect } = useConnect();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in when account changes
    if (account?.address) {
      setIsLoggedIn(true);
      setUser({
        address: account.address
      });
      fetchUserProfile(account.address);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [account]);

  const fetchUserProfile = async (address: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/profile?wallet=${address}`);
      
      if (response.ok) {
        const profile = await response.json();
        setUser({
          address,
          displayName: profile.display_name,
          profiles: profile.linked_profiles
        });
      } else if (response.status !== 404) {
        // Don't handle 404 as an error, the user just doesn't have a profile yet
        console.error('Error fetching profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    if (isLoggedIn) {
      // Add logout logic if needed
      wallet?.disconnect();
      setIsLoggedIn(false);
      setUser(null);
    } else {
      connect();
    }
  };

  return {
    isLoggedIn,
    isLoading,
    account,
    wallet,
    user,
    handleSignIn,
    AuthButton: () => (
      <Button 
        type="button" 
        onClick={handleSignIn}
        variant={isLoggedIn ? "outline" : "default"}
        className="gap-2"
      >
        {isLoggedIn ? (
          <>
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            <span>Sign in</span>
          </>
        )}
      </Button>
    )
  };
}
