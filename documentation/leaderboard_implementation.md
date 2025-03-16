## Overview

The leaderboard of Primape Markets is a key feature designed to motivate users by publicly ranking their performance. It tracks user activity based on metrics such as profitability (Profit and Loss, or PnL), total predictions participated in, and the number of predictions won or lost. The leaderboard aggregates data across all wallets linked to a user’s profile, offering a comprehensive view of each participant's success within the platform.

## Database Schema

To effectively manage and display the leaderboard data, the following schema is proposed for storing relevant user metrics:

### Users Leaderboard Table

*   **user_id**: Primary key referencing users(user_id) (INTEGER, NOT NULL).
*   **total_invested**: The total amount invested by the user across all prediction markets (BIGINT, DEFAULT 0).
*   **total_claimed**: The total amount claimed from market winnings (BIGINT, DEFAULT 0).
*   **total_participated**: The number of different markets the user has participated in (INTEGER, DEFAULT 0).
*   **total_won**: The number of markets where the user correctly predicted the outcome (INTEGER, DEFAULT 0).
*   **total_lost**: The number of markets where the user's predictions were incorrect (INTEGER, DEFAULT 0).
*   **pnl**: A computed field representing the user's profit and loss, calculated as total_claimed - total_invested (BIGINT, GENERATED ALWAYS AS (total_claimed - total_invested) STORED).

## Indices for Optimization

Indexes are crucial for optimizing queries that will read from the leaderboard table frequently:

`CREATE INDEX idx_leaderboard_pnl ON users_leaderboard(pnl DESC); CREATE INDEX idx_leaderboard_won ON users_leaderboard(total_won DESC);`

These indices help quickly retrieve top performers based on profitability and predictions won, respectively.

## Data Aggregation

The application listens to critical on-chain events via a Node.js backend service using ethers.js. These events are crucial for real-time updates of leaderboard statistics:

*   **SharesPurchased**: When a user purchases shares in a market, this event increments their total_invested and, if it's their first buy in that particular market, increment total_participated.
*   **MarketResolved**: Upon market resolution, the total_won count is incremented if the user had shares in the winning option. Conversely, the total_lost count is incremented if they participated but did not win.
*   **Claimed**: Adds the claimed winnings to total_claimed whenever the user collects their rewards.

## Leaderboard Query

To display the top users on the leaderboard, the following SQL query is utilized:

`SELECT user_id, display_name, pnl, total_participated, total_won, total_lost FROM users_leaderboard JOIN users USING (user_id) ORDER BY pnl DESC LIMIT 100;`

This query selects the top 100 users based on their profitability, showcasing their investment success and active engagement within the platform.

This leaderboard implementation not only encourages competitive participation but also drives continuous platform engagement by incentivizing users with visibility and recognition among their peers.
