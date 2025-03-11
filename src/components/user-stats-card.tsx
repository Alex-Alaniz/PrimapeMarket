
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPerformanceData } from "@/hooks/useUserBalance";
import { Trophy, TrendingUp, AlertTriangle, Target } from "lucide-react";

export function UserStatsCard({ performance }: { performance: UserPerformanceData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Win Rate Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Win Rate</CardDescription>
          <CardTitle className="text-2xl flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            {performance.winPercentage}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {performance.totalWins} wins out of {performance.totalParticipations} predictions
          </p>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Best Category</CardDescription>
          <CardTitle className="text-2xl flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-500" />
            {performance.mostSuccessfulCategory}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your most successful prediction category
          </p>
        </CardContent>
      </Card>

      {/* Highest Stake */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Highest Stake</CardDescription>
          <CardTitle className="text-2xl flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            {performance.highestStake} APE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your largest prediction amount
          </p>
        </CardContent>
      </Card>

      {/* Active Predictions */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Active Predictions</CardDescription>
          <CardTitle className="text-2xl flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            {performance.activePredictions}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Predictions awaiting resolution
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
