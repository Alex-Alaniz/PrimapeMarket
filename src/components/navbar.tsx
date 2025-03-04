import Link from "next/link";
import Image from "next/image";
import { WalletConectWidget } from "./wallet-connect-widget";
import { NavbarLinks } from "./navbar-links";
import { MobileNav } from "./mobile-nav";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/Powered by ApeCoin.png" 
            alt="Primape Logo" 
            width={150} 
            height={32} 
            className="h-8 w-auto" 
          />
        </Link>
        <div className="flex-1"></div>
        <NavbarLinks />
        <div className="ml-4">
          <WalletConectWidget />
        </div>
        <MobileNav />
      </div>
    </header>
  );
}