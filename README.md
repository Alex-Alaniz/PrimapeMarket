# Primape Prediction Market

A decentralized prediction market platform built on Base blockchain, allowing users to make predictions on various markets and earn rewards based on their accuracy.

## Features

- Connect wallet using Thirdweb
- View and participate in prediction markets
- Track your prediction history and performance
- Leaderboard to see top predictors
- User profiles with stats and history

## Tech Stack

- **Frontend**: Next.js 14 with App Router, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Blockchain**: Base (Ethereum L2), Thirdweb SDK, Viem
- **Authentication**: Wallet-based authentication via Thirdweb

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Base RPC URL (for blockchain interactions)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in the required values

4. Set up the database:
   ```bash
   psql -d postgres -c "CREATE DATABASE primape_market_db;"
   psql -d primape_market_db -f setup-db-combined.sql
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. (Optional) Run the blockchain event listener:
   ```bash
   npm run event-listener
   ```

## Database Schema

The application uses the following database tables:

- **users**: Stores user profiles with wallet addresses
- **markets**: Stores prediction market data
- **predictions**: Stores individual predictions made by users
- **user_stats**: Stores aggregated user statistics for the leaderboard

## API Endpoints

### User Profiles

- `GET /api/user/profile?wallet=0x...`: Get user profile by wallet address
- `POST /api/user/profile`: Create or update user profile

### Markets

- `GET /api/markets`: Get list of markets with pagination
- `GET /api/markets/[marketId]`: Get specific market details
- `POST /api/markets/create`: Create a new market
- `POST /api/markets/resolve`: Resolve a market with outcome

### Predictions

- `GET /api/predictions`: Get predictions with filtering options
- `POST /api/predictions`: Submit a new prediction

### Leaderboard

- `GET /api/leaderboard`: Get leaderboard data with sorting options

## Blockchain Integration

The application integrates with the PrimapePrediction smart contract on Base blockchain. The event listener script (`src/scripts/event-listener.ts`) listens for the following events:

- `PredictionMade`: When a user makes a prediction
- `MarketCreated`: When a new market is created
- `MarketResolved`: When a market is resolved with an outcome

These events are processed and stored in the database to keep the off-chain data in sync with the on-chain state.

## License

MIT
