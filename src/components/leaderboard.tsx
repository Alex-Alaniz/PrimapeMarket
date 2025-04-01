"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { useLeaderboardData } from "@/hooks/useLeaderboardData";
import { cn } from "@/lib/utils";
import { useActiveAccount } from "thirdweb/react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileData {
  address: string;
  username?: string;
  display_name?: string;
  profile_img_url?: string;
}

export function Leaderboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { data, isLoading } = useLeaderboardData();
  const account = useActiveAccount();
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfileData>>({});

  // Sort data based on realizedPnL in descending order
  const sortedData = data ? [...data].sort((a, b) => Number(b.realizedPnL) - Number(a.realizedPnL)) : [];

  // Fetch profile data for users in the current page
  useEffect(() => {
    if (!sortedData.length) return;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, sortedData.length);
    const addressesToFetch = sortedData.slice(start, end).map(item => item.address);
    
    // Only fetch profiles we don't already have
    const missingAddresses = addressesToFetch.filter(addr => !userProfiles[addr]);
    
    if (missingAddresses.length === 0) return;
    
    const fetchProfiles = async () => {
      try {
        const profiles: Record<string, UserProfileData> = {};
        
        await Promise.all(missingAddresses.map(async (address) => {
          const response = await fetch(`/api/userProfile?wallet_address=${address}`);
          if (response.ok) {
            const userData = await response.json();
            profiles[address] = {
              address,
              username: userData.username,
              display_name: userData.display_name,
              profile_img_url: userData.profile_img_url
            };
          } else {
            profiles[address] = { address };
          }
        }));
        
        setUserProfiles(prev => ({ ...prev, ...profiles }));
      } catch (error) {
        console.error("Error fetching user profiles:", error);
      }
    };
    
    fetchProfiles();
  }, [sortedData, currentPage]);

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
                <TableHead>User</TableHead>
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
                      <Link
                        href={account && item.address === account.address ? "/profile" : `/profile/${item.address}`}
                        className="flex items-center gap-2 hover:underline cursor-pointer"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={userProfiles[item.address]?.profile_img_url || "/images/pm.PNG"} 
                            alt="Profile" 
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <span className={account && item.address === account.address ? "text-blue-600 font-bold" : ""}>
                          {account && item.address === account.address
                            ? "You"
                            : userProfiles[item.address]?.display_name || 
                              userProfiles[item.address]?.username || 
                              `${item.address.substring(0, 6)}...${item.address.substring(item.address.length - 4)}`
                          }
                        </span>
                      </Link>
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
