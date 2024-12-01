import { Badge } from "./ui/badge";
import { toEther } from "thirdweb";
import { useEffect, useState } from "react";
import { toFixed } from "@/lib/utils";

interface MarketSharesDisplayProps {
    market: {
        optionA: string;
        optionB: string;
        totalOptionAShares: bigint;
        totalOptionBShares: bigint;
    };
    sharesBalance?: {
        optionAShares: bigint;
        optionBShares: bigint;
    };
}

export function MarketSharesDisplay({
    market,
    sharesBalance,
}: MarketSharesDisplayProps) {
    const [winnings, setWinnings] = useState({
        A: BigInt(0),
        B: BigInt(0)
    });

    useEffect(() => {
        if (!sharesBalance || !market) return;

        const calculateCurrentWinnings = (option: 'A' | 'B') => {
            if (!sharesBalance || !market) return BigInt(0);
            const totalShares = Number(market.totalOptionAShares) + Number(market.totalOptionBShares);
            if (totalShares === 0) return BigInt(0);
            
            const shares = option === 'A' ? sharesBalance.optionAShares : sharesBalance.optionBShares;
            return shares;
        };

        const newWinnings = {
            A: calculateCurrentWinnings('A'),
            B: calculateCurrentWinnings('B')
        };

        setWinnings(newWinnings);
    }, [sharesBalance, market?.totalOptionAShares, market?.totalOptionBShares, market]);

    const displayWinningsA = toFixed(Number(toEther(winnings.A)), 2);
    const displayWinningsB = toFixed(Number(toEther(winnings.B)), 2);

    return (
        <div className="flex flex-col gap-2">
            <div className="w-full text-sm text-muted-foreground">
                Your shares: {market.optionA} - {Math.floor(parseInt(toEther(sharesBalance?.optionAShares ?? BigInt(0))))}, {market.optionB} - {Math.floor(parseInt(toEther(sharesBalance?.optionBShares ?? BigInt(0))))}
            </div>
            {(winnings.A > 0 || winnings.B > 0) && (
                <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">Winnings:</div>
                    <div className="flex gap-2">
                        <Badge variant="secondary">{market.optionA}: {displayWinningsA} shares</Badge>
                        <Badge variant="secondary">{market.optionB}: {displayWinningsB} shares</Badge>
                    </div>
                </div>
            )}
        </div>
    );
}
