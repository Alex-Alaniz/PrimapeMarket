
'use client'

import { useState, useEffect } from 'react';
import { useReadContract } from 'thirdweb/react';
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { shortenAddress } from 'thirdweb/utils';
import { Button } from '@/components/ui/button';
import { AccountAvatar, AccountBlobbie, AccountProvider } from 'thirdweb/react';
import { client } from '@/app/client';
import { cn } from '@/lib/utils';

// Types
interface UserData {
  rank: number;
  address: string;
  displayName?: string;
  totalWagered: bigint;
  realizedPnL: bigint;
  volume: bigint;
  currentTally: bigint;
  isHighlighted?: boolean;
}

interface LeaderboardProps {
  season: 'szn1' | 'pre-szn';
  activeUser?: string;
}

// Helper function to format $APE amounts
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
  
  // Logic to show first page, last page, and a few pages around current page
  const pageNumbers = [];
  if (page <= 4) {
    // Show first 5 pages
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
      pageNumbers.push(i);
    }
    if (totalPages > 5) {
      pageNumbers.push(-1); // Ellipsis
      pageNumbers.push(totalPages);
    }
  } else if (page >= totalPages - 3) {
    // Show last 5 pages
    pageNumbers.push(1);
    pageNumbers.push(-1); // Ellipsis
    for (let i = Math.max(1, totalPages - 4); i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Show pages around current page
    pageNumbers.push(1);
    pageNumbers.push(-1); // Ellipsis
    for (let i = page - 1; i <= page + 1; i++) {
      pageNumbers.push(i);
    }
    pageNumbers.push(-1); // Ellipsis
    pageNumbers.push(totalPages);
  }

  return (
    <div className="w-full">
      {/* Table header */}
      <div className="grid grid-cols-6 gap-4 px-6 py-3 border-b border-zinc-800 text-gray-400 text-sm">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <span>Rank</span>
            <span>User</span>
          </div>
        </div>
        <div className="text-right">$APE Earned</div>
        <div className="text-right">Realized PnL</div>
        <div className="text-right">$APE Volume</div>
        <div className="text-right">Current Tally</div>
      </div>
      
      {/* User position (if logged in) */}
      {activeUserData && (
        <div className={cn(
          "grid grid-cols-6 gap-4 px-6 py-4 text-white bg-zinc-800 border-b border-zinc-700",
        )}>
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <span className="w-12 text-right">{activeUserData.rank.toLocaleString()}</span>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full overflow-hidden bg-zinc-700">
                  {activeUser && (
                    <AccountProvider address={activeUser} client={client}>
                      <AccountAvatar 
                        className="h-full w-full" 
                        loadingComponent={<AccountBlobbie className="h-full w-full" />}
                        fallbackComponent={<AccountBlobbie className="h-full w-full" />}
                      />
                    </AccountProvider>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{activeUserData.displayName || shortenAddress(activeUserData.address)}</span>
                  <span className="text-xs text-gray-400">Your position</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right flex items-center justify-end">
            {formatApe(activeUserData.totalWagered)}
          </div>
          <div className="text-right flex items-center justify-end">
            {formatApe(activeUserData.realizedPnL)}
          </div>
          <div className="text-right flex items-center justify-end">
            {formatApe(activeUserData.volume)}
          </div>
          <div className="text-right flex items-center justify-end font-semibold">
            {formatApe(activeUserData.currentTally)}
          </div>
        </div>
      )}
      
      {/* Table rows */}
      {isLoading ? (
        <div className="p-12 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      ) : (
        <>
          {leaderboardData.map((user, index) => (
            <div key={index} className={cn(
              "grid grid-cols-6 gap-4 px-6 py-4 text-white border-b border-zinc-800",
              user.rank % 2 === 0 ? "bg-zinc-900" : "bg-zinc-950",
              user.isHighlighted && "bg-blue-950"
            )}>
              <div className="col-span-2">
                <div className="flex items-center gap-3">
                  <span className="w-12 text-right">{user.rank}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-zinc-700">
                      <AccountProvider address={user.address} client={client}>
                        <AccountAvatar 
                          className="h-full w-full" 
                          loadingComponent={<AccountBlobbie className="h-full w-full" />}
                          fallbackComponent={<AccountBlobbie className="h-full w-full" />}
                        />
                      </AccountProvider>
                    </div>
                    <span className="font-medium">{user.displayName || shortenAddress(user.address)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">{formatApe(user.totalWagered)}</div>
              <div className="text-right">{formatApe(user.realizedPnL)}</div>
              <div className="text-right">{formatApe(user.volume)}</div>
              <div className="text-right font-semibold">{formatApe(user.currentTally)}</div>
            </div>
          ))}
        </>
      )}
      
      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-zinc-800">
        <div className="text-sm text-gray-400">
          Showing {(page - 1) * rowsPerPage + 1} - {Math.min(page * rowsPerPage, totalUsers)} out of {totalUsers.toLocaleString()}
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-md border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
            onClick={handlePreviousPage}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {pageNumbers.map((pageNum, index) => (
            pageNum === -1 ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
            ) : (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-md",
                  pageNum === page 
                    ? "bg-white text-black hover:bg-white" 
                    : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                )}
                onClick={() => goToPage(pageNum)}
              >
                {pageNum}
              </Button>
            )
          ))}
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-md border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
            onClick={handleNextPage}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Rows</span>
          <select 
            className="h-8 px-2 rounded bg-zinc-800 border border-zinc-700 text-white"
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>
  );
}
