
import { NextResponse } from 'next/server';
import { verifyTwitterEngagement } from '@/lib/twitter-verification';

// In production, you would store this in a database
const engagementLimits = {
  listen: { dailyLimit: 5, cooldown: 3600 }, // seconds (1 hour)
  question: { dailyLimit: 3, cooldown: 7200 }, // seconds (2 hours)
  comment: { dailyLimit: 10, cooldown: 1800 }, // seconds (30 min)
  share: { dailyLimit: 5, cooldown: 3600 }, // seconds (1 hour)
  promote: { dailyLimit: 2, cooldown: 86400 }, // seconds (24 hours)
  read: { dailyLimit: 10, cooldown: 1800 }, // seconds (30 min)
};

// In-memory storage for rate limiting (would use Redis in production)
const userEngagements = new Map();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { creatorId, engagementType, walletAddress, timestamp } = data;
    
    // Validate required fields
    if (!creatorId || !engagementType || !walletAddress) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if wallet is connected to Twitter (ThirdWeb Auth)
    // In production, you'd verify this with your auth system
    const isTwitterLinked = true; // Simplified for this example
    
    if (!isTwitterLinked) {
      return NextResponse.json(
        { success: false, message: 'Twitter account not linked to wallet' },
        { status: 403 }
      );
    }
    
    // Anti-gaming checks
    const userKey = `${walletAddress}:${engagementType}`;
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    
    // Get user's engagement history
    if (!userEngagements.has(userKey)) {
      userEngagements.set(userKey, []);
    }
    
    const userHistory = userEngagements.get(userKey);
    
    // Clean up old entries (older than 24 hours)
    const oneDayAgo = now - 86400;
    const recentEngagements = userHistory.filter(entry => entry.timestamp >= oneDayAgo);
    userEngagements.set(userKey, recentEngagements);
    
    // Check daily limit
    const dailyLimit = engagementLimits[engagementType]?.dailyLimit || 5;
    if (recentEngagements.length >= dailyLimit) {
      return NextResponse.json(
        { success: false, message: `Daily limit reached for ${engagementType} engagements` },
        { status: 429 }
      );
    }
    
    // Check cooldown period
    const cooldown = engagementLimits[engagementType]?.cooldown || 3600;
    const lastEngagement = recentEngagements[recentEngagements.length - 1];
    
    if (lastEngagement && (now - lastEngagement.timestamp) < cooldown) {
      const waitTime = cooldown - (now - lastEngagement.timestamp);
      const minutes = Math.ceil(waitTime / 60);
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before engaging again` 
        },
        { status: 429 }
      );
    }
    
    // In production: Verify the engagement actually happened on Twitter
    // This would involve checking Twitter API for proof of engagement
    // For this example, we'll simulate verification
    try {
      // This would be a real function in production that checks Twitter API
      const verificationResult = await verifyTwitterEngagement(
        engagementType, 
        data.twitterAuthToken, 
        creatorId
      );
      
      if (!verificationResult.verified) {
        return NextResponse.json(
          { success: false, message: verificationResult.message || 'Engagement could not be verified' },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error('Twitter verification error:', error);
      // For demo purposes, we'll continue as if verification succeeded
      // In production, you would return an error here
    }
    
    // Record this engagement
    userEngagements.get(userKey).push({ 
      timestamp: now, 
      creatorId 
    });
    
    // Calculate points (in production would be more complex)
    const basePoints = {
      listen: 500,
      question: 750,
      comment: 450,
      share: 600,
      promote: 1000,
      read: 400
    };
    
    // Apply position bonus (early engagers get more points)
    const dailyEngagements = userEngagements.get(userKey).filter(
      e => e.creatorId === creatorId && e.timestamp >= oneDayAgo
    ).length;
    
    const positionMultiplier = dailyEngagements === 1 ? 1.2 : // First engagement of the day
                              dailyEngagements === 2 ? 1.1 : // Second engagement
                              1.0; // Standard multiplier
    
    const pointsEarned = Math.floor(basePoints[engagementType] * positionMultiplier);
    
    // In production: Record points to user's account in database
    
    return NextResponse.json({
      success: true,
      pointsEarned,
      message: 'Engagement recorded successfully'
    });
    
  } catch (error) {
    console.error('Engagement processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing engagement' },
      { status: 500 }
    );
  }
}
