import { ConnectButton, lightTheme, useActiveAccount, AccountName, AccountProvider } from "thirdweb/react";
import { client } from "@/app/client";
import { defineChain } from "thirdweb/chains";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import Image from 'next/image';
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Award } from "lucide-react"; // Added import for Award icon


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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="flex justify-between items-center mb-8 py-3 px-4 -mx-4 backdrop-blur-sm bg-background/80 border-b border-border/30 sticky top-0 z-10">
            <div className="flex items-center gap-2 md:gap-3">
                <Image
                    src="/images/pm.PNG"
                    alt="Primape Logo"
                    width={36}
                    height={36}
                    className="h-8 md:h-9 w-auto"
                />
                <h1 className="text-lg md:text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Primape</h1>
                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-bold border border-primary/30 hidden sm:inline-block">BETA</span>
            </div>

            {/* Mobile menu button */}
            <button 
                className="md:hidden p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
                <ThemeToggle />
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <span>Markets</span>
                    </Button>
                </Link>
                <Link href="/leaderboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <span>Leaderboard</span>
                    </Button>
                </Link>
                <Link href="/earn" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"> {/* Added Earn link */}
                    <Award className="h-4 w-4" />
                    <span>Earn</span>
                </Link> {/* Added Earn link */}
                {account && (
                    <Link href="/profile">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <User className="h-4 w-4" />
                            {account && (
                                <AccountProvider address={account.address} client={client}>
                                    <AccountName 
                                        socialType="ens"
                                        loadingComponent={<span>Profile</span>} 
                                        fallbackComponent={<span>Profile</span>}
                                    />
                                </AccountProvider>
                            )}
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

            {/* Mobile navigation */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-background border-b border-border/30 py-2 px-4 md:hidden z-20">
                    <div className="flex flex-col space-y-3">
                        <Link href="/" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="ghost" size="sm" className="w-full justify-start">
                                <span>Markets</span>
                            </Button>
                        </Link>
                        <Link href="/leaderboard" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="ghost" size="sm" className="w-full justify-start">
                                <span>Leaderboard</span>
                            </Button>
                        </Link>
                        <Link href="/earn" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"> {/* Added Earn link for mobile */}
                            <Award className="h-4 w-4" />
                            <span>Earn</span>
                        </Link> {/* Added Earn link for mobile */}
                        {account && (
                            <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                                    <User className="h-4 w-4" />
                                    {account && (
                                        <AccountProvider address={account.address} client={client}>
                                            <AccountName 
                                                socialType="ens"
                                                loadingComponent={<span>Profile</span>} 
                                                fallbackComponent={<span>Profile</span>}
                                            />
                                        </AccountProvider>
                                    )}
                                </Button>
                            </Link>
                        )}

                        <div className="flex justify-between items-center">
                            <ThemeToggle />
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
                </div>
            )}
        </div>
    );
}