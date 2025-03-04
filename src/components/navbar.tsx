import { ConnectButton, lightTheme } from "thirdweb/react";
import { client } from "@/app/client";
import { defineChain } from "thirdweb/chains";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import Image from 'next/image'; // Added import for Next.js Image component
import { ThemeToggle } from "./theme-toggle";
import { NavbarLinks } from "./navbar-links"; // Added import for NavbarLinks

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
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                    <Image src="/Powered by ApeCoin.png" alt="PrimapeMarket" width={120} height={45} />
                </div>
                <NavbarLinks />
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
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
        </header>
    );
}