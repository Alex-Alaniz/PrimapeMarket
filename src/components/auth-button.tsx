
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface AuthButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AuthButton({ variant = "default", size = "default", className }: AuthButtonProps) {
  const { isLoggedIn, handleSignIn } = useAuth();
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className} 
      onClick={handleSignIn}
    >
      {isLoggedIn ? "Sign Out" : "Sign In"}
    </Button>
  );
}
