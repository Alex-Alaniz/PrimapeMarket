import { ConnectButton, lightTheme, useActiveAccount } from "thirdweb/react";
import { client } from "@/app/client";
import { defineChain } from "thirdweb/chains";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import Image from 'next/image';
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "./ui/button";

// Define wallets array outside the component
const wallets = [
    inAppWallet({
        auth: {
            options: [
                "google",
                "discord",
                "telegram",
                "farcaster",
                "email",
                "x",
                "passkey",
                "phone",
                "github",
                "twitch",
                "coinbase",
                "apple",
                "line",
                "facebook",
            ],
        },
    }),
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("io.zerion.wallet"),
];

export function Navbar() {
    const account = useActiveAccount();
    
    return (
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <Image
                    src="/images/pm.PNG"
                    alt="Primape Logo"
                    width={32}
                    height={32}
                    className="h-8 w-auto"
                />
                <h1 className="text-2xl font-bold">Primape Markets</h1>
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-semibold">BETA</span>
            </div>
            <div className="flex items-center space-x-4">
                <ThemeToggle />
                
                <Link href="/leaderboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <span>Leaderboard</span>
                    </Button>
                </Link>
                
                {account && (
                    <Link href="/profile">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                        </Button>
                    </Link>
                )}
                
                <ConnectButton 
                    client={client} 
                    theme={lightTheme()}
                    chain={defineChain(33139)}
                    wallets={wallets}
                    connectModal={{
                        size: "compact",
                        title: "Primapes Markets",
                        showThirdwebBranding: false,
                    }}
                    connectButton={{
                        style: {
                            fontSize: '0.75rem !important',
                            height: '2.5rem !important',
                        },
                        label: 'Sign In',
                    }}
                    accountAbstraction={{
                        chain: defineChain(33139),
                        sponsorGas: true,
                    }}
                />
            </div>
        </div>
    );
}