
import { db, users, marketParticipations, marketResults } from './schema';
import { eq, sql, desc } from 'drizzle-orm';

// User operations
export async function getOrCreateUser(walletAddress: string) {
  // Get user if exists
  const existingUser = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
  
  if (existingUser.length > 0) {
    return existingUser[0];
  }
  
  // Create new user if not exists
  const newUser = await db.insert(users).values({
    walletAddress,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
  
  return newUser[0];
}

export async function updateUserProfile(userId: number, data: Partial<typeof users.$inferInsert>) {
  return db.update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
}

// Market participation operations
export async function recordMarketParticipation(
  userId: number, 
  marketId: number, 
  optionIndex: number, 
  amount: string, 
  transactionHash: string
) {
  return db.insert(marketParticipations).values({
    userId,
    marketId,
    optionIndex,
    amount,
    timestamp: new Date(),
    transactionHash
  }).returning();
}

export async function recordMarketResult(
  userId: number,
  marketId: number,
  participated: boolean,
  wonMarket: boolean | null,
  amountWon: string | null,
  amountInvested: string,
  winningOptionIndex: number | null,
  transactionHash: string | null = null,
  claimed: boolean = false
) {
  return db.insert(marketResults).values({
    userId,
    marketId,
    participated,
    wonMarket,
    amountWon,
    amountInvested,
    winningOptionIndex,
    transactionHash,
    claimed,
    timestamp: new Date()
  }).returning();
}

// Update user stats after market resolution
export async function updateUserStats(userId: number) {
  // Get all user results
  const userResults = await db.select().from(marketResults).where(eq(marketResults.userId, userId));
  
  // Calculate metrics
  const totalParticipation = userResults.length;
  const wonMarkets = userResults.filter(r => r.wonMarket === true).length;
  const winRate = totalParticipation > 0 ? (wonMarkets / totalParticipation) * 100 : 0;
  
  // Calculate total winnings
  const totalWinnings = userResults.reduce((sum, result) => {
    if (result.amountWon) {
      return sum + parseFloat(result.amountWon);
    }
    return sum;
  }, 0).toString();
  
  // Update user
  return db.update(users).set({
    totalWinnings,
    totalParticipation,
    winRate: winRate.toString(),
    updatedAt: new Date()
  }).where(eq(users.id, userId));
}

// Leaderboard functions
export async function getLeaderboard(limit: number = 10) {
  // Update all user ranks first
  await db.execute(sql`
    UPDATE users
    SET rank = ranks.rank
    FROM (
      SELECT 
        id, 
        ROW_NUMBER() OVER (ORDER BY CAST(total_winnings AS DECIMAL) DESC) as rank
      FROM users
    ) AS ranks
    WHERE users.id = ranks.id
  `);
  
  // Get leaderboard
  return db.select().from(users).orderBy(desc(users.totalWinnings)).limit(limit);
}

// Get user activity history
export async function getUserActivity(userId: number) {
  const participations = await db.select().from(marketParticipations)
    .where(eq(marketParticipations.userId, userId))
    .orderBy(desc(marketParticipations.timestamp));
  
  const results = await db.select().from(marketResults)
    .where(eq(marketResults.userId, userId))
    .orderBy(desc(marketResults.timestamp));
    
  return { participations, results };
}
