'use client'

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useActiveAccount } from 'thirdweb/react';
import { 
  Copy, 
  ExternalLink, 
  Check, 
  Twitter as TwitterIcon
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useUserBalance } from '@/hooks/useUserBalance';

export function UserProfileCard() {
  const account = useActiveAccount();
  const [copied, setCopied] = useState(false);
  const { balance, portfolio, pnl } = useUserBalance();

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/40"></div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="h-24 w-24 rounded-full border-4 border-background bg-background overflow-hidden">
            {account ? (
              <Image 
                src={`https://api.dicebear.com/7.x/personas/svg?seed=${account.address}`}
                alt="Profile"
                width={96}
                height={96}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <span className="text-2xl">?</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="pt-16 pb-6 text-center">
        <h2 className="text-xl font-bold">
          {account ? shortenAddress(account.address) : 'Not Connected'}
        </h2>

        {account && (
          <>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>{shortenAddress(account.address)}</span>
              <button
                onClick={() => copyToClipboard(account.address)}
                className="rounded-full p-1 hover:bg-muted"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-3 divide-x">
                <div className="flex flex-col p-2">
                  <span className="text-muted-foreground text-xs">Balance</span>
                  <span className="font-semibold text-sm">{balance} APE</span>
                </div>
                <div className="flex flex-col p-2">
                  <span className="text-muted-foreground text-xs">Portfolio</span>
                  <span className="font-semibold text-sm">{portfolio} APE</span>
                </div>
                <div className="flex flex-col p-2">
                  <span className="text-muted-foreground text-xs">Profit/Loss</span>
                  <span className={cn(
                    "font-semibold text-sm",
                    pnl.startsWith('+') ? "text-green-600" : 
                    pnl.startsWith('-') ? "text-red-600" : ""
                  )}>
                    {pnl} APE
                  </span>
                </div>
              </div>

              <Button size="sm" variant="outline" className="w-full">
                Edit Profile
              </Button>
            </div>

            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium text-sm">Connections</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TwitterIcon className="h-4 w-4 text-[#1D9BF0]" />
                    <span>Not connected</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 px-2">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}