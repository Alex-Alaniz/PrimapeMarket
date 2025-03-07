import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserData {
  rank: number;
  address: string;
  totalWagered: bigint;
  realizedPnL: bigint;
  volume: bigint;
  currentTally: bigint;
  isHighlighted?: boolean;
}

interface LeaderboardProps {
  season: string;
  activeUser?: string;
}

const formatApe = (amount: bigint): string => {
  return (Number(amount) / 1e18).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

export function Leaderboard({ season, activeUser }: LeaderboardProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalUsers, setTotalUsers] = useState(417678); // Mocked total users
  const [isLoading, setIsLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<UserData[]>([]);
  const [activeUserData, setActiveUserData] = useState<UserData | null>(null);

  // Mock function to fetch leaderboard data
  // In a real implementation, this would call your smart contract
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true);

      // This is mock data - in production you would:
      // 1. Fetch user stats from your contract
      // 2. Sort them by appropriate metric
      // 3. Paginate as needed

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate mock leaderboard data
        const mockData: UserData[] = [];

        const startRank = (page - 1) * rowsPerPage + 1;
        const addressSeed = season === 'szn1' ? 1000 : 2000;

        // Create mock entries
        for (let i = 0; i < rowsPerPage; i++) {
          const rank = startRank + i;
          if (rank > totalUsers) break;

          // Create decreasing values based on rank
          const factor = 1 - (rank / totalUsers);
          const baseAmount = BigInt(Math.floor(1000000000000000 * factor));

          mockData.push({
            rank,
            address: `0x${(addressSeed + rank).toString(16).padStart(40, '0')}`,
            totalWagered: baseAmount * BigInt(2) * BigInt(1e10),
            realizedPnL: baseAmount * BigInt(1e11),
            volume: BigInt(0),
            currentTally: baseAmount * BigInt(3) * BigInt(1e10)
          });
        }

        // If we have an active user, add their data with highlighted flag
        if (activeUser) {
          const userRank = Math.floor(Math.random() * 50000) + 1;
          const factor = 1 - (userRank / totalUsers);
          const baseAmount = BigInt(Math.floor(1000000000000000 * factor));

          const userData: UserData = {
            rank: userRank,
            address: activeUser,
            totalWagered: baseAmount * BigInt(2) * BigInt(1e10),
            realizedPnL: baseAmount * BigInt(1e11),
            volume: BigInt(0),
            currentTally: baseAmount * BigInt(3) * BigInt(1e10),
            isHighlighted: true
          };

          setActiveUserData(userData);
        }

        setLeaderboardData(mockData);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [season, page, rowsPerPage, activeUser]);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(totalUsers / rowsPerPage);
    if (page < maxPage) setPage(page + 1);
  };

  const goToPage = (pageNum: number) => {
    const maxPage = Math.ceil(totalUsers / rowsPerPage);
    if (pageNum > 0 && pageNum <= maxPage) {
      setPage(pageNum);
    }
  };

  // Calculate pagination controls
  const totalPages = Math.ceil(totalUsers / rowsPerPage);
  const displayPages = [];

  // Always include first page
  displayPages.push(1);

  // Calculate range of pages to display around current page
  let rangeStart = Math.max(2, page - 1);
  let rangeEnd = Math.min(totalPages - 1, page + 1);

  // Ensure we show at least 3 pages in the middle if possible
  if (rangeEnd - rangeStart < 2 && totalPages > 4) {
    if (page < totalPages / 2) {
      rangeEnd = Math.min(rangeStart + 2, totalPages - 1);
    } else {
      rangeStart = Math.max(rangeEnd - 2, 2);
    }
  }

  // Add ellipsis before middle range if needed
  if (rangeStart > 2) {
    displayPages.push(-1); // -1 represents ellipsis
  }

  // Add middle range
  for (let i = rangeStart; i <= rangeEnd; i++) {
    displayPages.push(i);
  }

  // Add ellipsis after middle range if needed
  if (rangeEnd < totalPages - 1) {
    displayPages.push(-2); // -2 represents ellipsis
  }

  // Always include last page if there's more than one page
  if (totalPages > 1) {
    displayPages.push(totalPages);
  }

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="w-full">
      {/* User Position Card (if active user) */}
      {activeUserData && (
        <div className="mb-6 rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Your Position</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-mono text-sm">
                #{activeUserData.rank.toLocaleString()}
              </div>
              <div>
                <div className="font-medium">{shortenAddress(activeUserData.address)}</div>
                <div className="text-sm text-muted-foreground">Total: {formatApe(activeUserData.currentTally)} APE</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatApe(activeUserData.realizedPnL)} APE</div>
              <div className="text-sm text-muted-foreground">Realized P&L</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Total Wagered</TableHead>
              <TableHead className="text-right">Realized P&L</TableHead>
              <TableHead className="text-right">Current Tally</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array(10).fill(0).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (
              // Actual data rows
              leaderboardData.map((user) => (
                <TableRow 
                  key={user.address} 
                  className={user.isHighlighted ? "bg-primary/10" : undefined}
                >
                  <TableCell className="font-mono">{user.rank.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{shortenAddress(user.address)}</TableCell>
                  <TableCell className="text-right">{formatApe(user.totalWagered)} APE</TableCell>
                  <TableCell 
                    className={cn(
                      "text-right",
                      user.realizedPnL > 0 ? "text-green-600" : user.realizedPnL < 0 ? "text-red-600" : ""
                    )}
                  >
                    {formatApe(user.realizedPnL)} APE
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatApe(user.currentTally)} APE</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, totalUsers)} of {totalUsers.toLocaleString()} users
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {displayPages.map((pageNum, idx) => {
            if (pageNum < 0) {
              // Render ellipsis
              return <span key={`ellipsis-${idx}`} className="px-2">...</span>;
            }

            return (
              <Button
                key={`page-${pageNum}`}
                variant={page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(pageNum)}
                className="h-8 w-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page === Math.ceil(totalUsers / rowsPerPage)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}