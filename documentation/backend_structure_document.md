# Backend Structure Document

This document outlines the backend setup for the Primape Markets project. It covers the architecture, database management, API design, hosting solutions, security measures, and more. The explanations use everyday language so that anyone can grasp how the backend works without needing a technical background.

## 1. Backend Architecture

The backend is built on a serverless model using Next.js API routes, which means that our server code runs in response to web requests in a cloud environment. This approach supports scalability and maintainability in the following ways:

*   **Modern Design Patterns:**

    *   Uses RESTful design principles for API endpoints.
    *   Incorporates middleware for tasks like authentication, logging, and error handling.

*   **Frameworks and Tools:**

    *   Node.js with Next.js API routes forms the base of the backend.
    *   TypeScript helps improve code readability and reduces errors.

*   **Scalability and Performance:**

    *   The use of serverless functions means the backend scales automatically to meet demand.
    *   Decoupled components (APIs, database connections, smart contract interactions) allow for easier updates and maintenance over time.

## 2. Database Management

The project uses both blockchain-based storage and traditional persistence methods to manage different types of data:

*   **Blockchain Data:**

    *   Critical user data such as wallet addresses, rewards, and points is stored on the blockchain via smart contracts (PrimapePrediction.sol and EngageToEarn.sol).

*   **Persistent Database:**

    *   Currently, some market and creator data is held in memory. To improve reliability and scalability, this data will be transferred to a persistent database.

    *   **Redis** is planned to be used as a persistent store for:

        *   Caching market and creator data.
        *   Managing rate limiting for engagement actions.

*   **Data Management Practices:**

    *   Regular backups and monitoring of the persistent store.
    *   Use of in-memory caching (Redis) to provide quick access to frequently-used data, reducing load times.

## 3. Database Schema

Since the persistent data store will be Redis (a NoSQL database), it doesn’t follow a fixed schema like an SQL database. However, here's an overview of how the data will be organized:

*   **Redis Data Structures:**

    *   **Market Data:** Stored as hash maps where the key is a unique market identifier and the value is a set of fields (e.g., status, creator, active participants).
    *   **Creator Data:** Similar hash maps for creator profiles including wallet information and stats for the leaderboard.
    *   **Engagement Rate Limits:** Keys with user identifiers to track timestamps and counts of recent engagements, ensuring that rate limits are enforced.

*Note: As requirements evolve, a formal schema can be adopted using a relational database if structured queries become more necessary.*

## 4. API Design and Endpoints

The backend API is designed to support direct, clear communication between the frontend and the blockchain services. It separates concerns into distinct endpoints:

*   **API Type:**

    *   RESTful API endpoints are used to handle backend actions.

*   **Key Endpoints:**

    *   **/api/creators**: Returns a list of creators, including details needed to populate the marketplace and leaderboard.

    *   **/api/engage**:

        *   Handles engagement actions including listening, commenting, sharing, etc.
        *   Verifies engagements (such as confirming a valid Twitter handle).
        *   Enforces rate limits (transitioning from in-memory to persistent Redis-based tracking).
        *   Awards points and calculates position bonuses for users.

*   **Communication Flow:**

    *   The frontend calls these APIs as users interact (engage, purchase shares, claim rewards) with the platform.
    *   Responses are sent back in JSON format for easy integration with the frontend interface.

## 5. Hosting Solutions

The backend is hosted on cloud-based platforms that offer reliability and scalability, helping the project to grow without being limited by physical servers:

*   **Cloud Provider:**

    *   The project is likely to be hosted on providers like Vercel which is ideal for Next.js applications, ensuring global delivery and high availability.

*   **Benefits:**

    *   **Reliability:** Serverless functions have built-in redundancy and high uptime.
    *   **Scalability:** Automatically handles traffic spikes by scaling up resources as needed.
    *   **Cost-Effectiveness:** Pay-per-use pricing means you only pay for the computing power needed when a function is executed.

## 6. Infrastructure Components

Several key components work together to form the robust infrastructure of the backend:

*   **Load Balancers:** Automatically distribute incoming web traffic to ensure no single server gets overwhelmed.

*   **Caching Mechanisms:**

    *   **Redis:** Caches frequently accessed data (creator and market information) and manages rate limiting to improve performance.

*   **Content Delivery Network (CDN):**

    *   Integrated through the cloud provider (for example, Vercel automatically provides a CDN) to ensure fast delivery of API responses globally.

*   **Smart Contract Interactions:**

    *   Direct integrations with blockchain nodes to call functions in smart contracts.
    *   Use of Thirdweb and Viem to handle wallet connections and smart contract interactions seamlessly.

## 7. Security Measures

Security is a top priority to protect both user data and the integrity of blockchain operations:

*   **Authentication & Authorization:**

    *   Uses Web3 wallet authentication along with JSON Web Tokens (JWT) for session management.
    *   API endpoints validate user credentials, ensuring only authorized actions are processed.

*   **Rate Limiting & Data Encryption:**

    *   Persistent rate limiting (using Redis) prevents abuse of the engagement API.
    *   Data is transmitted securely, with encryption applied to sensitive information where appropriate.

*   **Smart Contract Security:**

    *   Prior to production deployment, smart contracts (such as PrimapePrediction.sol and EngageToEarn.sol) will undergo thorough security audits to ensure they are free from vulnerabilities.

## 8. Monitoring and Maintenance

Maintaining backend health is crucial. The following tools and practices are in place:

*   **Monitoring Tools:**

    *   Cloud provider monitoring (e.g., Vercel’s analytics and log management) to track performance and detect anomalies.
    *   Third-party services (such as Sentry) can be integrated to monitor errors and performance issues.

*   **Maintenance Strategies:**

    *   Regular updates to dependencies and patches for security vulnerabilities.
    *   Implementation of an automated CI/CD pipeline to test and deploy backend changes quickly and safely.
    *   Scheduled backup routines for Redis data and smart contract audits after significant updates.

## 9. Conclusion and Overall Backend Summary

The Primape Markets backend is designed to support a decentralized prediction market platform by integrating blockchain functionality with a robust, cloud-based serverless infrastructure. Key components include:

*   RESTful API endpoints for engagements and creator data retrieval.
*   Use of Redis for persistent storage, caching, and rate limiting.
*   Secure interactions with blockchain through Thirdweb and Viem.
*   Cloud hosting (likely via Vercel) for global, scalable deployment.
*   Comprehensive security measures including authentication, rate limiting, and data encryption.
*   Monitoring systems that ensure performance and the health of the backend throughout its lifecycle.

This setup not only supports the core functionalities of prediction markets and engagement rewards but also ensures that as user demand grows, the backend will remain responsive, secure, and maintainable.

By aligning with these principles, Primape Markets is well-positioned to deliver a seamless and secure experience to its users, setting it apart as a reliable platform in the decentralized ecosystem.
