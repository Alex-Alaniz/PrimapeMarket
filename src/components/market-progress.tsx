
import { Market } from "@/types/prediction-market";

interface MarketProgressProps {
    market: Market;
    compact?: boolean;
}

export function MarketProgress({ market, compact = false }: MarketProgressProps) {
    // Safely calculate total pool with null check
    const totalShares = market.totalSharesPerOption || [];
    const totalPool = totalShares.reduce((sum, shares) => sum + shares, BigInt(0));

    // Get color based on option index - Polymarket inspired
    const getOptionColor = (index: number) => {
        const colors = [
            'bg-emerald-500', // Yes/Green
            'bg-red-500',     // No/Red
            'bg-blue-500',    // Option 3
            'bg-purple-500',  // Option 4
            'bg-amber-500'    // Option 5
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="space-y-2">
            {market.options.map((option, index) => {
                // Calculate percentage
                let percentage = 0;
                if (totalPool > BigInt(0)) {
                    percentage = Math.round(Number(totalShares[index] * BigInt(100)) / Number(totalPool));
                }

                return (
                    <div key={index} className="polymarket-option">
                        <div className="polymarket-option-text">
                            {option}
                        </div>
                        <div className="polymarket-option-right">
                            <span className="text-xs font-medium">
                                {percentage}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                    className={`${getOptionColor(index)} h-2 rounded-full`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
