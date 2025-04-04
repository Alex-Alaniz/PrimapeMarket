interface MarketPendingProps {
    _compact?: boolean;
}

export function _MarketPending({ _compact = false }: MarketPendingProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="mb-2 bg-yellow-100 p-3 rounded-md text-center">
                <div className="text-xs text-yellow-800 font-medium mb-1">
                    Market Ended
                </div>
                <div className="text-sm text-yellow-900">
                    Awaiting resolution by market admin
                </div>
            </div>
        </div>
    );
}
