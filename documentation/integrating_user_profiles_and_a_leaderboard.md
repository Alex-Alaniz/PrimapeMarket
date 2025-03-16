Please address the request for integrating user profiles and a leaderboard into our existing PrimapePrediction contract on ApeChain, leveraging thirdweb auth, a PostgreSQL database on Replit, and on-chain data from your markets, I’ve analyzed the contract and requirements. Below is a comprehensive approach to implement the user profile page and leaderboard page without necessitating changes to your current smart contract. The solution focuses on off-chain data management and indexing, aligning with the priority to build these features first, with plans for future additions like engage-to-earn mechanics, NFTFi, raffles, lotteries, and giveaways.

## Overview of Requirements

### User Profile Page

**Features:**

*   Display current predictions (unresolved markets).
*   Show past predictions (resolved markets with outcomes).
*   List activity history (e.g., share purchases, claims).
*   Allow users to edit their profile name.
*   Enable connection of additional emails and wallets to an existing profile.

**Authentication:** Via thirdweb auth using wallet addresses.

### Leaderboard Page

**Metrics:**

*   Profitability (PNL).
*   Total predictions participated.
*   Total predictions won.
*   Total predictions lost.

**Purpose:** A separate page ranking users based on performance.

## Technical Stack

*   **Thirdweb Auth:** For wallet-based authentication.
*   **PostgreSQL on Replit:** For storing off-chain user data (e.g., profile names, emails, linked wallets).
*   **On-chain Data:** Market participation and outcomes from the PrimapePrediction contract.
*   **Front-end:** Integration with your existing codebase (e.g., PrimapeMarket GitHub).

## Evaluation of the Existing Contract

Your PrimapePrediction contract is feature-rich, supporting multiple outcomes, pari-mutuel betting, early resolution, adjustable fees, role-based access control, and ApeChain’s native yield features. It emits events and provides view functions that are sufficient for tracking user activities and market states off-chain:

**Relevant Events:**

*   `MarketCreated`: Tracks new markets.
*   `SharesPurchased`: Records user investments in specific options.
*   `MarketResolved`: Indicates market resolution and winning option.
*   `Claimed`: Confirms when users claim winnings.

**Useful View Functions:**

*   `getMarketInfo`: Retrieves market details (question, end time, resolved status, winning option).
*   `getMarketOptions`: Lists options per market.
*   `getMarketTotalShares`: Shows total shares per option.
*   `getUserShares`: Returns a user’s shares per option in a market.

These elements provide all necessary on-chain data for user profiles and leaderboards, meaning no revisions to the contract are required for this implementation.

## Proposed Approach

The best approach is to handle user profiles and leaderboards off-chain by:

*   Using thirdweb auth for wallet-based login.
*   Storing off-chain user data (e.g., profile names, emails, linked wallets) in a PostgreSQL database.
*   Indexing on-chain data (e.g., user shares, market resolutions) into the database via event listeners.
*   Aggregating data across linked wallets for a unified user view.

### 1. User Authentication and Profile Management

Authentication:

Use thirdweb auth to authenticate users via their wallet addresses. When a user logs in, their wallet address is mapped to a profile in the PostgreSQL database.

Database Schema:

*   **Users Table:** Stores primary user data and wallet addresses.
*   **User Emails Table:** For multiple email connections and verification status.
*   **User Wallets Table:** For linking additional wallets to a single user account.

Profiles can be created and updated smoothly as users connect wallets and add details, ensuring data consistency and easy management.

### 2. Tracking Predictions and Activity (Profile Page)

On-chain Data Indexing:

Implement a service that listens to blockchain events and updates a PostgreSQL database with relevant information.

Database Tables:

*   **Markets Table:** Maintains details about each market.
*   **Wallet Activity Table:** Records user activities related to market interactions.

Query these tables to generate user-specific pages showing historical and real-time data.

### 3. Leaderboard Implementation

Using indexed data, calculate and maintain leaderboard metrics in a dedicated database table for efficient querying.

### 4. Integration with Front-end

The front-end will engage users with real-time updates from the database, facilitated via API endpoints that return processed data on-demand.

### 5. Future Features

Plan for future enhancements like engage-to-earn mechanics, allowing integration with current data structures and contract flexibility.

## Conclusion

By implementing these changes, we maintain system flexibility and enable advanced user features without modifying the underlying smart contract. This strategy ensures that Primape Markets remains agile, able to adopt new functionalities as user needs grow.
