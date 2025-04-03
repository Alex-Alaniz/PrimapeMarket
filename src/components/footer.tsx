
"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { Discord } from "lucide-react";

export function Footer() {
  const { theme } = useTheme();
  
  // Determine which ApeChain logo to use based on the current theme
  const getApechainLogo = () => {
    if (theme === "light") {
      return "/apechain-branding/apechain-blue.png";
    } else {
      return "/apechain-branding/apechain-white.png";
    }
  };

  return (
    <footer className="border-t bg-card">
      <div className="container py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/pm.PNG"
                alt="Primape Logo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <h3 className="text-xl font-bold">Primape Markets</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Prime ape predictions on ApeChain.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="X (Twitter)"
              >
                <span className="text-xl">𝕏</span>
              </a>
              <a
                href="https://discord.gg/kKuKNAHwNd"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Discord"
              >
                <Discord className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-4">Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">
                    Markets
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="hover:text-foreground transition-colors">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="/earn" className="hover:text-foreground transition-colors">
                    Earn
                  </Link>
                </li>
                <li>
                  <Link href="/spaces" className="hover:text-foreground transition-colors">
                    Spaces
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-foreground transition-colors">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms of Use
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Powered by Section */}
          <div className="flex flex-col items-start md:items-end justify-between">
            <div className="flex flex-col items-start md:items-end gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Powered by</span>
                <Image
                  src={getApechainLogo()}
                  alt="ApeChain"
                  width={120}
                  height={24}
                  className="h-6 w-auto"
                />
              </div>
              <div>
                <Image
                  src="/Powered by ApeCoin.png"
                  alt="Powered by ApeCoin"
                  width={160}
                  height={32}
                  className="h-8 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            BearifiedCo | ApeForge © 2025
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Use</a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">Careers</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
