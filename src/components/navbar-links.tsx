
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavbarLinks() {
  const pathname = usePathname();
  
  const links = [
    { href: "/", label: "Home" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/profile", label: "Profile" },
  ];
  
  return (
    <div className="hidden md:flex space-x-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === link.href
              ? "text-black dark:text-white font-semibold"
              : "text-gray-500 dark:text-gray-400"
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
