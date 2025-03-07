import { Twitter, Github } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/pm.PNG"
              alt="Primape Logo"
              width={24}
              height={24}
              className="h-6 w-auto"
            />
            <p className="text-sm text-muted-foreground">
              © 2025 Primape Markets. All rights reserved.
            </p>
          </div>

          <div className="flex items-center">
            <Image
              src="/Powered by ApeCoin.png"
              alt="Powered by ApeCoin"
              width={180}
              height={32}
              className="h-8 w-auto"
            />
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}