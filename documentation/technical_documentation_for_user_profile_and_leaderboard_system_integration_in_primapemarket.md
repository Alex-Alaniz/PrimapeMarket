# Technical Documentation for User Profile and Leaderboard System Integration in PrimapeMarket

## Introduction

This document provides a comprehensive guide for implementing the backend integration of the user profile and leaderboard systems in PrimapeMarket, a decentralized prediction market platform built on ApeChain. Aimed at autonomous agents executing tasks using LLMs like Cursor, Windsurf, and Replit, the documentation details backend integration with existing frontend UX/UI components, leveraging Thirdweb for authentication, PostgreSQL on Replit for data storage, and on-chain event indexing from the PrimapePrediction smart contract. Importantly, modifications to the existing smart contract are unnecessary, as all essential data is accessible through events and view functions.

## Prerequisites

### Dependencies and Setup

*   **Node.js**: Required for developing the backend APIs and listening to on-chain events.
*   **PostgreSQL**: For data storage, set up on Replit for ease of access.
*   **Thirdweb SDK**: Utilized for wallet-based authentication and blockchain interactions.

Ensure these tools are installed and configured correctly before proceeding with implementation.

## Implementation Sections

### 1. Authentication

Steps:

1.  **Wallet-based Authentication**:

    *   Implement Thirdweb's `ConnectButton` for enabling users to connect their wallets effortlessly.
    *   Use Thirdweb SDK to handle user authentication seamlessly.

Code Snippet for Login and Profile Retrieval:

`import { ConnectButton, ThirdwebProvider } from '@3rd/web'; <ThirdwebProvider> <ConnectButton /> </ThirdwebProvider>`

### 2. Database Schema

PostgreSQL Tables Definition

Create the necessary tables to manage user profiles and leaderboard data. Below are the SQL `CREATE TABLE` statements:

`CREATE TABLE users ( user_id SERIAL PRIMARY KEY, primary_wallet VARCHAR(42) NOT NULL, display_name VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ); CREATE TABLE user_emails ( user_id INT REFERENCES users(user_id), email VARCHAR(255) UNIQUE NOT NULL, verified BOOLEAN DEFAULT FALSE ); CREATE TABLE user_wallets ( user_id INT REFERENCES users(user_id), wallet_address VARCHAR(42) UNIQUE NOT NULL ); CREATE TABLE markets ( market_id SERIAL PRIMARY KEY, question TEXT, end_time TIMESTAMP, resolved BOOLEAN DEFAULT FALSE, winning_option_index INT, total_pool NUMERIC ); CREATE TABLE wallet_activity ( id SERIAL PRIMARY KEY, wallet_address VARCHAR(42), market_id INT REFERENCES markets(market_id), option_index INT, shares INT, amount_spent NUMERIC, amount_claimed NUMERIC, event_type VARCHAR(50), timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ); CREATE TABLE users_leaderboard ( user_id INT REFERENCES users(user_id), total_invested NUMERIC, total_claimed NUMERIC, total_participated INT, total_won INT, total_lost INT, pnl AS (total_claimed - total_invested) STORED );`

Optimization Indices

`CREATE INDEX idx_wallet_activity_wallet ON wallet_activity (wallet_address); CREATE INDEX idx_leaderboard_pnl ON users_leaderboard (pnl);`

### 3. Profile Management

Linking Additional Wallets and Emails

*   Utilize Thirdweb's profile linking capabilities.
*   Allow users to add or manage their display names.

Example Endpoint:

`app.post('/profile/:userId/edit', async (req, res) => { const { displayName } = req.body; await db.query('UPDATE users SET display_name = $1 WHERE user_id = $2', [displayName, req.params.userId]); res.sendStatus(200); });`

### 4. Activity Tracking

Event Listening Using Ethers.js

*   Set up a Node.js service to listen for on-chain events.

Example Listener:

``const { ethers } = require('ethers'); // Connect to contract and listen to events contract.on('MarketCreated', (event) => { // Index the event into `markets` and `wallet_activity` tables });``

### 5. Leaderboard Data Aggregation

*   Periodically update leaderboard based on event outcomes and track user performance metrics.

SQL Query:

`SELECT user_id, total_invested, total_claimed, pnl FROM users_leaderboard ORDER BY pnl DESC LIMIT 100;`

### 6. API Endpoints

Implement RESTful APIs

*   **/profile/:wallet**: Fetches user profile data.
*   **/leaderboard**: Returns the top users by PNL.

### 7. Integration with Existing Frontend

Instructions for API Integration

*   Example React fetch implementation to display data in existing components.

### 8. Testing and Validation

Steps:

*   Simulate buying shares and claiming winnings.
*   Verify database updates for accuracy using sample test cases.

### Additional Requirements

*   **Format**: Document is in Markdown to allow easy conversion to Word/Google Docs.
*   **Placeholders**: Use placeholders for values like `[DB_PASSWORD]`, `[CONTRACT_ADDRESS]`.
*   **Clarity**: Structured with clear instructions and examples in TypeScript, SQL, Node.js.

### Conclusion

This documentation outlines the steps necessary for implementing seamless backend integration for PrimapeMarket's user profile and leaderboard systems, utilizing existing frontend and blockchain-based data sources.
