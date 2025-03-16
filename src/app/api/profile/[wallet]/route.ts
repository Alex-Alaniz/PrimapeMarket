import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { wallet: string } }
) {
  try {
    const walletAddress = params.wallet;

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // First, check if this is a primary wallet
    let userResult = await query(
      'SELECT user_id, display_name, primary_wallet FROM users WHERE primary_wallet = $1',
      [walletAddress]
    );

    // If not found as primary wallet, check if it's a linked wallet
    if (userResult.rowCount === 0) {
      const linkedWalletResult = await query(
        'SELECT user_id FROM user_wallets WHERE wallet_address = $1',
        [walletAddress]
      );

      if (linkedWalletResult.rows && linkedWalletResult.rows.length > 0) {
        const userId = linkedWalletResult.rows[0].user_id;
        userResult = await query(
          'SELECT user_id, display_name, primary_wallet FROM users WHERE user_id = $1',
          [userId]
        );
      }
    }

    // If user not found at all
    if (userResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Get linked wallets
    const linkedWalletsResult = await query(
      'SELECT wallet_address FROM user_wallets WHERE user_id = $1',
      [user.user_id]
    );

    // Get linked emails
    const emailsResult = await query(
      'SELECT email, verified FROM user_emails WHERE user_id = $1',
      [user.user_id]
    );

    // Get user activity
    const activityResult = await query(
      `SELECT wa.*, m.question, m.resolved, m.winning_option_index 
       FROM wallet_activity wa
       JOIN markets m ON wa.market_id = m.market_id
       WHERE wa.wallet_address = $1 OR wa.wallet_address IN 
         (SELECT wallet_address FROM user_wallets WHERE user_id = $2)
       ORDER BY wa.timestamp DESC
       LIMIT 50`,
      [walletAddress, user.user_id]
    );

    // Get leaderboard stats
    const leaderboardResult = await query(
      'SELECT * FROM users_leaderboard WHERE user_id = $1',
      [user.user_id]
    );

    const leaderboardStats = leaderboardResult.rows && leaderboardResult.rows.length > 0 
      ? leaderboardResult.rows[0] 
      : {
          total_invested: 0,
          total_claimed: 0,
          total_participated: 0,
          total_won: 0,
          total_lost: 0,
          pnl: 0
        };

    return NextResponse.json({
      success: true,
      profile: {
        userId: user.user_id,
        displayName: user.display_name,
        primaryWallet: user.primary_wallet,
        linkedWallets: linkedWalletsResult.rows.map(row => row.wallet_address),
        emails: emailsResult.rows,
        stats: leaderboardStats,
        activity: activityResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, message: 'Server error fetching profile' },
      { status: 500 }
    );
  }
} 