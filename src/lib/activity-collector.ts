
import { contract } from "@/constants/contract";
import { getOrCreateUser, recordMarketParticipation, recordMarketResult, updateUserStats } from "./db/utils";
import { getContract } from "thirdweb";
import { client } from "@/app/client";
import { readContract } from "thirdweb/actions";
import { defineChain } from "thirdweb/chains";

// ApeChain configuration
const apeChain = defineChain(33139);

// Process market events
export async function processSharesPurchased(event: any) {
  try {
    const { marketId, buyer, optionIndex, amount } = event.args;
    
    // Get or create user
    const user = await getOrCreateUser(buyer);
    
    // Record participation
    await recordMarketParticipation(
      user.id,
      Number(marketId),
      Number(optionIndex),
      amount.toString(),
      event.transactionHash
    );
    
    // Update user stats
    await updateUserStats(user.id);
    
    return true;
  } catch (error) {
    console.error('Error processing shares purchased event:', error);
    return false;
  }
}

export async function processMarketResolved(event: any) {
  try {
    const { marketId, winningOptionIndex } = event.args;
    
    // Get market participants
    const marketData = await readContract({
      contract,
      method: "function getMarketTotalShares(uint256) view returns (uint256[])",
      params: [marketId]
    });
    
    // Process results for participants
    // This would typically be a more complex operation involving querying 
    // the blockchain for all user participations in this market
    
    return true;
  } catch (error) {
    console.error('Error processing market resolved event:', error);
    return false;
  }
}

export async function processClaimed(event: any) {
  try {
    const { marketId, user, amount } = event.args;
    
    // Get user from DB
    const dbUser = await getOrCreateUser(user);
    
    // Get the market data
    const [marketInfo, userShares] = await Promise.all([
      readContract({
        contract,
        method: "function getMarketInfo(uint256) view returns (string, uint256, bool, uint256)",
        params: [marketId]
      }),
      readContract({
        contract,
        method: "function getUserShares(uint256, address) view returns (uint256[])",
        params: [marketId, user]
      })
    ]);
    
    const [, , , winningOptionIndex] = marketInfo;
    
    // Record result
    await recordMarketResult(
      dbUser.id,
      Number(marketId),
      true, // participated
      true, // won the market
      amount.toString(),
      userShares[Number(winningOptionIndex)].toString(),
      Number(winningOptionIndex),
      event.transactionHash,
      true // claimed
    );
    
    // Update user stats
    await updateUserStats(dbUser.id);
    
    return true;
  } catch (error) {
    console.error('Error processing claimed event:', error);
    return false;
  }
}
