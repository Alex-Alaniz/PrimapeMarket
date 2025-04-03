"use client";

import { Github, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Discord } from "./ui/icons"; // We'll create this icon component

// Custom Discord icon component
const DiscordIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 127.14 96.36"
    fill="currentColor"
  >
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
  </svg>
);

export function Footer() {
  const { theme } = useTheme();

  // Determine which ApeChain logo to use based on theme
  const getApeChainLogo = () => {
    if (theme === "light") {
      return "/apechain-branding/apechain-blk.png";
    } else {
      // dark or ape mode
      return "/apechain-branding/apechain-blue.png";
    }
  };

  return (
    <footer className="border-t bg-card">
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/images/pm.PNG"
                alt="Primape Logo"
                width={28}
                height={28}
                className="h-7 w-auto"
              />
              <span className="text-lg font-semibold">Primape Markets</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Prime ape predictions on ApeChain.
            </p>
            <div className="flex items-center mt-4">
              <Image
                src={getApeChainLogo()}
                alt="Powered by ApeChain"
                width={120}
                height={24}
                className="h-6 w-auto"
              />
            </div>
          </div>

          {/* Links section */}
          <div className="md:col-span-2 grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-medium mb-3 uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Markets
                  </Link>
                </li>
                <li>
                  <Link
                    href="/leaderboard"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/earn"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Earn
                  </Link>
                </li>
                <li>
                  <Link
                    href="/spaces"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Spaces
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Use
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Docs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social links */}
          <div className="md:col-span-1">
            <h4 className="text-sm font-medium mb-3 uppercase tracking-wider">
              Connect
            </h4>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted"
                aria-label="X (formerly Twitter)"
              >
                <span className="text-xl font-medium">𝕏</span>
              </a>
              <a
                href="https://discord.gg/kKuKNAHwNd"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted"
                aria-label="Discord"
              >
                <DiscordIcon />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright section */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            BearifiedCo | ApeForge © 2025
          </p>
        </div>
      </div>
    </footer>
  );
}
