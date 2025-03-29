# Primape Markets - Project Requirements Document

## Project Overview

Primape Markets is a decentralized prediction market platform built on the ApeChain that lets users predict outcomes of various events. By wagering $APE tokens on their chosen outcomes, users have the opportunity to earn tokens, exclusive NFTs, and special platform features. In addition to prediction markets, the platform integrates an engagement-to-earn system – a mechanism where users earn rewards for interacting with top creators by listening, reading, commenting, sharing, and promoting content.

This project is being built to bring an innovative, Web3-powered betting experience into the decentralized world. The key objectives include offering a secure, transparent, and user-friendly environment that merges traditional prediction market concepts with gamified social engagement. Success will be measured by the seamless integration of smart contracts, a smooth user journey from wallet connection to claiming winnings, and a robust, scalable system that incentivizes continuous engagement.

## In-Scope vs. Out-of-Scope

**In-Scope:**

*   Decentralized Prediction Markets: Enabling users to create markets, buy shares in outcomes, and resolve markets through smart contracts.
*   Engagement-to-Earn System: Awarding points for user interactions (such as listening, reading, commenting, sharing, and promoting) with integrated rate limiting and bonus calculations.
*   User Profiles & Leaderboards: Displaying user-specific details including wallet balances, portfolio information, and ranking metrics based on overall platform activity.
*   Wallet Integration & Authentication: Allowing users to connect through popular wallets (e.g., MetaMask, InAppWallet) using Thirdweb’s ConnectButton.
*   API Endpoints: Implementing API routes like `/api/creators` and `/api/engage` to support engagement validation and creator listings.
*   UI & UX: Building the frontend using Next.js integrated with Radix UI, Tailwind CSS, and Lucide React for a responsive and themed user experience (supporting dark, light, and ape themes).

**Out-of-Scope:**

*   Advanced Database Integration: For now, data such as creator and market details are managed in-memory with plans to integrate a robust database (like Redis) in a future phase.
*   Mobile Application Development: The first version is targeted at the web with potential future enhancement for mobile support/React Native.
*   Community Governance Features: Although planned as a future enhancement, decentralized governance and advanced community moderation are not included in the initial rollout.
*   Deep Analytics & Reporting: Detailed analytical dashboards and advanced reporting tools are deferred to subsequent releases.

## User Flow

A new user visiting Primape Markets is immediately greeted with a prompt to connect their digital wallet using Thirdweb’s ConnectButton. Once the wallet is successfully connected, the user is taken to the main dashboard where active, pending, and resolved prediction markets are clearly displayed. The layout features a left sidebar for quick navigation between market browsing, engagement activities, and profile views, while the main area dynamically shows market data pulled directly from the blockchain through the PrimapePrediction.sol smart contract.

After browsing the available markets, the user may decide to participate by engaging with content or purchasing shares in a market outcome. In the engagement section, interactions with top creators are captured and sent to an API endpoint for verification and reward calculation. When purchasing shares, the user selects an outcome, specifies the amount of $APE tokens, and reviews fee calculations in a modal interface before confirming the purchase. Post market resolution, the user easily claims their winnings, concluding the prediction cycle and preparing them for future engagements.

## Core Features

*   **Prediction Markets**

    *   Allows creation and participation in decentralized prediction markets on the ApeChain.
    *   Enables users to buy and sell shares, resolve markets, and claim winnings through smart contract calls.

*   **Engagement-to-Earn Mechanism**

    *   Rewards users for interacting with top creators by listening, reading, commenting, sharing, and promoting content.
    *   Integrates an API route to validate engagements, enforce rate limits, and calculate bonus points.

*   **User Profiles & Leaderboards**

    *   Displays user information such as wallet balance, portfolio, and engagement history.
    *   Provides a leaderboard that ranks users based on criteria like total wagered, profit/loss, and engagement volume.

*   **Tiered Reward System**

    *   Implements a tier-based reward system that incentivizes deeper user engagement across the platform.

*   **Wallet Authentication & Web3 Integration**

    *   Utilizes Thirdweb’s ConnectButton to allow seamless wallet connections and interactions with the blockchain.
    *   Integrates smart contracts (PrimapePrediction.sol and EngageToEarn.sol) for market operations and rewards distribution.

*   **Fee Calculation & Share Buying Interface**

    *   Offers an interactive interface where users can calculate fees and multipliers before confirming their trades.
    *   Uses modal dialogs like MarketBuyInterface to manage transactions securely.

## Tech Stack & Tools

*   **Frontend:**

    *   Framework: Next.js for both the user interface and API routes.
    *   UI Components: Radix UI, Tailwind CSS, and Lucide React for building accessible and responsive components.
    *   State Management: React Context for managing application state.

*   **Web3 Integration:**

    *   Wallet Connection & Smart Contract Interactions: Thirdweb to integrate wallet authentication and trigger smart contract functions.

*   **Smart Contracts:**

    *   Languages & Frameworks: Solidity to develop smart contracts such as PrimapePrediction.sol and EngageToEarn.sol.
    *   Libraries: OpenZeppelin libraries for secure and robust contract development.

*   **Other Libraries & Tools:**

    *   Utility Libraries: clsx and tailwind-merge for CSS class handling, jsonwebtoken for security tokens, and axios for API requests.
    *   Additional Tools: TypeScript for type safety, next-pwa for Progressive Web App support, and viem for smart contract interactions.

*   **Development Environments:**

    *   Preferred IDEs/Tools: Cursor (for AI-powered coding suggestions), Replit for online collaboration, and VS Code as the primary code editor.

## Non-Functional Requirements

*   **Performance:**

    *   The application should load pages swiftly with a target load time under 2 seconds under normal network conditions.
    *   Smart contract interactions need to be efficient and cost-effective, minimizing gas fees and transaction delays.

*   **Security:**

    *   Secure wallet integrations and thorough smart contract audits are essential.
    *   API endpoints should enforce strict rate limiting and request validations to prevent abuse.

*   **Reliability & Usability:**

    *   The platform is designed with a robust and user-friendly interface and should maintain high availability even under heavy usage.
    *   Ensure consistent experiences across dark, light, and ape themes.

*   **Compliance:**

    *   While operating on a decentralized blockchain, ensure adherence to common Web3 security standards and best practices.

## Constraints & Assumptions

*   The environment assumes the availability of Web3 wallets and that users are familiar with connecting digital wallets via Thirdweb.
*   Key functionalities rely on the availability and performance of smart contracts; any delays or issues with the blockchain network can impact the user experience.
*   In its initial version, data persistence is managed in memory with the assumption that it will be transitioned to a robust solution like Redis or a database in later phases.
*   The project assumes that third-party libraries and tools such as OpenZeppelin, axios, and next-pwa are compatible with the overall application architecture.

## Known Issues & Potential Pitfalls

*   **API Rate Limits:**

    *   The engagement validation API is initially configured with in-memory rate limits. This could cause issues in production if not scaled properly; migration to a persistent store like Redis is essential for long-term stability.

*   **Blockchain Delays & Gas Fees:**

    *   Interactions with smart contracts can be subject to network delays or higher gas fees during peak times, affecting user experience during market transactions.

*   **Smart Contract Security:**

    *   Potential vulnerabilities in the smart contract code could lead to breaches or loss of funds. A thorough security audit is necessary before production deployment.

*   **Data Persistence:**

    *   Reliance on in-memory storage for certain data points in the early build might lead to data loss or inconsistencies; planning for a robust data storage strategy is crucial for future releases.

*   **Integration Complexities:**

    *   Coordinating real-time updates between API routes, frontend state management, and blockchain interactions might introduce synchronization issues. Clear communication between each part of the system and ample testing are recommended to mitigate these risks.

This PRD provides a detailed and unambiguous blueprint for Primape Markets, ensuring that all subsequent technical documents—covering the tech stack, frontend guidelines, backend structure, and more—can be generated with crystal clear reference points.
