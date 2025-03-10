
import { cn } from "@/lib/utils";

interface MarketTimeProps {
    endTime: bigint;
    className?: string;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export function MarketTime({ endTime, className }: MarketTimeProps) {
    const isEnded = new Date(Number(endTime) * 1000) < new Date();
    const formattedDate = formatDate(new Date(Number(endTime) * 1000).toISOString());

    return (
        <div
            className={cn(
                "mb-2 w-fit px-2 py-1 rounded border text-xs font-medium",
                isEnded 
                    ? "bg-red-200 border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-300 ape:bg-red-700 ape:border-red-900 ape:text-red-100" 
                    : "bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 ape:bg-blue-900/70 ape:border-blue-700 ape:text-blue-100",
                className
            )}
        >
            <span className="font-bold">{isEnded ? "Ended: " : "Ends: "}</span>{formattedDate}
        </div>
    );
}
