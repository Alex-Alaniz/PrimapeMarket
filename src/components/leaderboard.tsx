"use client";

import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLeaderboardData } from "@/hooks/useLeaderboardData";
import { cn } from "@/lib/utils";
import { useActiveAccount } from "thirdweb/react";
import Link from "next/link";

export function Leaderboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { data, isLoading } = useLeaderboardData();
  const account = useActiveAccount();

  // Sort data based on realizedPnL in descending order
  const sortedData = data ? [...data].sort((a, b) => Number(b.realizedPnL) - Number(a.realizedPnL)) : [];

  // Calculate pagination
  const totalPages = Math.ceil((sortedData.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex) || [];

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Total Wagered</TableHead>
                <TableHead className="text-right">PnL</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">Current Tally</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                currentData.map((item, index) => (
                  <TableRow
                    key={index}
                    className={cn(
                      item.isHighlighted || (account && item.address === account.address) ? "bg-primary/5" : ""
                    )}
                  >
                    <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                    <TableCell>
                      {account && item.address === account.address ? <Link
                        href="/profile"
                        className="text-blue-600 hover:underline cursor-pointer font-bold text-lg">
                        You
                      </Link>
                        :
                        item.address.substring(0, 6) + "..." + item.address.substring(item.address.length - 4)}
                    </TableCell>
                    <TableCell className="text-right">{(Number(item.totalWagered) / 1e18).toFixed(2)} APE</TableCell>
                    <TableCell className={cn(
                      "text-right",
                      Number(item.realizedPnL) > 0 ? "text-green-600" : Number(item.realizedPnL) < 0 ? "text-red-600" : ""
                    )}>
                      {(Number(item.realizedPnL) / 1e18).toFixed(2)} APE
                    </TableCell>
                    <TableCell className="text-right">{(Number(item.volume) / 1e18).toFixed(2)} APE</TableCell>
                    <TableCell className="text-right">{(Number(item.currentTally) / 1e18).toFixed(2)} APE</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length || 0)} of {sortedData.length || 0} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
