# Primape Markets Frontend Guideline Document

This document explains the frontend architecture, design principles, and technologies used in Primape Markets in everyday language. The goal is to help anyone—whether you’re a developer, designer, or project stakeholder—understand how the frontend is set up and maintained.

## 1. Frontend Architecture

### Overview

Primape Markets uses a modern frontend built on Next.js. Next.js is a popular React framework that gives us powerful tools like API routes and server-side rendering. Our architecture also incorporates TypeScript, which adds type safety to our codebase. This combination makes the project scalable, maintainable, and performant.

### Key Technologies

*   **Next.js:** Our main framework, used to build pages and manage routing.
*   **TypeScript:** Improves code quality, reduces bugs, and makes it easier for new developers to understand the code.
*   **Radix UI & Lucide React:** Libraries for building beautiful and accessible UI components.
*   **Tailwind CSS:** A utility-first CSS framework that helps us quickly style our application with a consistent look.
*   **React Context:** Handles simple state management for global states like user authentication and theming.
*   **next-pwa:** Enables Progressive Web App (PWA) features, enhancing the mobile user experience.

### Scalability, Maintainability, and Performance

*   **Scalability:** Thanks to Next.js and modular design, the project can scale as new features are added without major overhauls.
*   **Maintainability:** The use of component-based architecture, TypeScript, and strict linting rules (using eslint and husky) means the code is well-organized and easier to maintain.
*   **Performance:** Features like lazy loading, code splitting, and optimized asset management ensure a smooth and fast user experience.

## 2. Design Principles

### Guiding Values

*   **Usability:** Every component and interaction is designed with the end user in mind. We strive for clear and intuitive interfaces.
*   **Accessibility:** We follow best practices to ensure everyone, including those with disabilities, can use our platform effectively.
*   **Responsiveness:** The application is designed to look and function well on devices of all sizes, from mobile phones to desktops.

### Application in Interfaces

All user interfaces adhere to these design principles. Whether you’re creating or participating in prediction markets, every interaction is designed to be smooth and clear. The UI elements are consistent across the application, ensuring a familiar experience for users as they navigate between features like market browsing, engagement-to-earn, and share purchases.

## 3. Styling and Theming

### Styling Approach

We use Tailwind CSS for styling our application. This utility-first framework allows for quick and consistent styling. Additionally, to ensure components are easy to work with and maintain, we follow a component-based model where each UI element has its own styling rules.

### Theming

Primape Markets supports three themes: dark, light, and ape. These themes help provide a consistent look and feel whether users prefer a light interface, a darker version for low light conditions, or a theme closer to our brand (ape theme).

### Design Style

*   **Style:** Our approach is modern with hints of glassmorphism and material design. However, the primary aesthetics lean towards a flat, modern look that is minimalistic and user-friendly.

*   **Color Palette:**

    *   Primary: #0070f3 (blue for primary actions)
    *   Secondary: #7928ca (purple for highlights or secondary actions)
    *   Background (light theme): #ffffff
    *   Background (dark theme): #1a1a1a
    *   Accent: #f0f0f0 for borders and subtle shadows

*   **Font:** We use a modern sans-serif font that’s clean and accessible. If no other font is specified, the default system font stack (e.g., -apple-system, BlinkMacSystemFont, etc.) is used.

## 4. Component Structure

### Organization

The frontend is built using reusable, modular components. Each component encapsulates its functionality and style, making it easier to test, maintain, and update. Components include specific pieces such as buttons, forms, modals (like the MarketBuyInterface), and cards for displaying market data.

### Benefits of Component-Based Architecture

*   **Reusability:** Common elements (like inputs, modals, and buttons) can be reused across different parts of the application without the need to rewrite code.
*   **Maintainability:** Updates or bug fixes in a single component are automatically applied wherever the component is used.
*   **Consistency:** It’s easier to keep a uniform design when each interactive element follows a common structure and styling.

## 5. State Management

### Approach

We use React Context to manage global states, which are simple and lightweight. For example, user authentication states (via Thirdweb’s ConnectButton) and theme settings (dark, light, ape) are managed centrally.

### Sharing State

State sharing is handled via the React Context API, ensuring that important global data is available throughout the component tree. This promotes a smooth user experience as data is passed consistently between components, without unnecessary duplication or state conflicts.

## 6. Routing and Navigation

### Routing Technologies

Next.js provides the navigation framework using file-based routing. This means every file in the pages directory corresponds to a route on the site. For dynamic navigations, especially in the prediction markets, built-in Next.js API routes and client-side routing play a crucial role.

### Navigation Structure

Users can move between different parts of the application seamlessly:

*   **Authentication:** Users log in using the Thirdweb ConnectButton, which supports wallet connections like MetaMask.
*   **Market Browsing:** Users can filter and browse different market statuses (active, pending, resolved).
*   **Engagement Bar:** Directs users to participate in engagement-to-earn activities.
*   **User Profiles & Leaderboards:** Navigation to view user profiles and ranking tables becomes intuitive with clearly defined paths.

## 7. Performance Optimization

### Strategies Employed

*   **Lazy Loading & Code Splitting:** Components not immediately required are loaded on demand, reducing the initial load time.
*   **Asset Optimization:** We use optimized images and static assets to speed up page rendering.
*   **Caching:** With next-pwa, caching strategies are implemented so that repeat visits are faster and more efficient.

### Benefits

These strategies not only improve performance metrics but also contribute to a smoother, more engaging user experience, particularly on mobile devices and slower network connections.

## 8. Testing and Quality Assurance

### Testing Strategies

A robust testing strategy is in place to ensure the quality of the frontend code.

*   **Unit Tests:** Tests for individual components and functions ensure that each part works as expected.
*   **Integration Tests:** These ensure that combined components function together smoothly, especially for user flows like share purchases or engagement interactions.
*   **End-to-End Tests:** Simulate real user scenarios to ensure that navigation, API interactions, and smart contract calls work as they should.

### Tools and Frameworks

*   **Jest:** Used for unit and integration tests.
*   **React Testing Library:** Helps test components in a way that mimics user interactions.
*   **ESLint & Husky:** Enforce code quality and style consistency across the board.

## 9. Conclusion and Overall Frontend Summary

In summary, the Primape Markets frontend is built on a robust foundation using Next.js, TypeScript, and a component-based architecture. Our guiding design principles of usability, accessibility, and responsiveness ensure that every user interaction is intuitive and engaging. The integration with modern tools like Radix UI, Tailwind CSS, and next-pwa creates a visually appealing and performant application.

Unique aspects of our setup include an integrated multi-theme support (dark, light, ape) and direct blockchain integration through Thirdweb and Viem, which set us apart from many traditional prediction market platforms.

This comprehensive approach not only lays a strong foundation for the current features but also sets us up for future growth and enhancements. Our focus remains on building a user-friendly, scalable, and secure platform that fully embraces both modern web technologies and the decentralized future.

By following these guidelines, every team member should have a clear understanding of the frontend architecture and be able to navigate and contribute to the project with confidence.
