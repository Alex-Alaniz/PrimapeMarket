import { Github } from "lucide-react"
import Link from "next/link"
import Image from 'next/image'; // Added import for Next.js Image component

// Custom X (Twitter) logo component
const XLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

// Custom Discord logo component
const DiscordLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

export function Footer() {
    return (
        <footer className="w-full border-t bg-background">
            <div className="container px-4 mx-auto py-16">
                {/* Main footer content */}
                <div className="flex justify-between mb-16">
                    {/* Left side - Brand and Built on */}
                    <div className="flex flex-col gap-8">
                        {/* Brand section */}
                        <div className="flex items-center gap-2">
                            <Image src="/images/pm.PNG" alt="Primape Logo" width={24} height={24} className="h-8 w-auto" /> {/* Replaced img with Image */}
                            <h2 className="text-2xl font-bold">Primape Markets</h2>
                        </div>
                        <p className="text-muted-foreground">Prime Markets for Ape Predictions.</p>

                        {/* Built on section */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Built on</span>
                            <Link href="https://apechain.com/" target="_blank" rel="noreferrer">
                                <Image
                                    src="/Powered by ApeCoin.png"
                                    alt="ApeChain Logo"
                                    width={64} // Added width and height
                                    height={64}
                                    className="h-16 w-auto"
                                />
                            </Link>
                        </div>
                    </div>

                    {/* Right side - Links */}
                    <div className="flex gap-16">
                        {/* Resources column */}
                        <div>
                            <h3 className="font-semibold mb-4">Resources</h3>
                            <ul className="space-y-2">
                                <li><Link href="https://discord.gg/kKuKNAHwNd" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                                <li><Link href="https://x.com/primapemarkets" className="text-muted-foreground hover:text-foreground">Press</Link></li>
                                <li><Link href="https://docs.primape.markets/" className="text-muted-foreground hover:text-foreground">Learn</Link></li>
                                <li><Link href="/" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
                            </ul>
                        </div>

                        {/* Join the community column */}
                        <div>
                            <h3 className="font-semibold mb-4">Join the community</h3>
                            <div className="flex gap-4">
                                <Link href="https://x.com/primapemarkets" target="_blank" rel="noreferrer">
                                    <XLogo />
                                </Link>
                                <Link href="https://discord.gg/kKuKNAHwNd" target="_blank" rel="noreferrer">
                                    <DiscordLogo />
                                </Link>
                                <Link href="https://github.com/Primape/PrimapeMarketsV1" target="_blank" rel="noreferrer">
                                    <Github className="h-6 w-6" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom footer */}
                <div className="flex justify-between items-center pt-8 border-t">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Built by</span>
                        <Link
                            href="https://x.com/primapemarkets"
                            className="text-sm hover:text-foreground"
                        >
                            Primape Markets | BearifiedCo LLC
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}