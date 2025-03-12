
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export function EngagementHistory({ walletAddress }: { walletAddress: string }) {
  type EngagementHistoryItem = {
    id: string;
    creatorName: string;
    creatorHandle: string;
    engagementType: string;
    pointsEarned: number;
    timestamp: string;
    status: string;
  };

  const [history, setHistory] = useState<EngagementHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEngagementHistory = async () => {
      try {
        // In production, this would fetch from your API
        // const response = await fetch(`/api/engagement-history?wallet=${walletAddress}`);
        // const data = await response.json();
        // setHistory(data);
        
        // Simulated data for development
        setTimeout(() => {
          setHistory([
            {
              id: '1',
              creatorName: 'Coffee with Captain',
              creatorHandle: '@CoffeeWCaptain',
              engagementType: 'listen',
              pointsEarned: 500,
              timestamp: '2023-04-05T10:23:45Z',
              status: 'verified'
            },
            {
              id: '2',
              creatorName: 'Bodoggos Podcast',
              creatorHandle: '@BodoggosPod',
              engagementType: 'comment',
              pointsEarned: 450,
              timestamp: '2023-04-03T14:12:30Z',
              status: 'verified'
            },
            {
              id: '3',
              creatorName: 'ApeChain Daily',
              creatorHandle: '@ApeChainDaily',
              engagementType: 'share',
              pointsEarned: 400,
              timestamp: '2023-04-02T09:45:00Z',
              status: 'verified'
            },
            {
              id: '4',
              creatorName: 'Coffee with Captain',
              creatorHandle: '@CoffeeWCaptain',
              engagementType: 'promote',
              pointsEarned: 1000,
              timestamp: '2023-03-30T16:20:15Z',
              status: 'verified'
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch engagement history:", error);
        setIsLoading(false);
      }
    };
    
    if (walletAddress) {
      fetchEngagementHistory();
    }
  }, [walletAddress]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getEngagementTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'listen': 'Listened to Space',
      'read': 'Read Article',
      'question': 'Asked Question',
      'comment': 'Left Comment',
      'share': 'Shared Content',
      'promote': 'Promoted Content'
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex justify-center items-center h-40 text-muted-foreground">
            No engagement activity found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{formatDate(item.timestamp)}</TableCell>
                  <TableCell>
                    <div>
                      <div>{item.creatorName}</div>
                      <div className="text-sm text-muted-foreground">{item.creatorHandle}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getEngagementTypeLabel(item.engagementType)}</TableCell>
                  <TableCell className="text-right font-medium">+{item.pointsEarned}</TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${item.status === 'verified' ? 'bg-green-500/10 text-green-500' : 
                        item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                        'bg-red-500/10 text-red-500'}`}>
                      {item.status === 'verified' ? 'Verified' : 
                        item.status === 'pending' ? 'Pending' : 'Rejected'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
