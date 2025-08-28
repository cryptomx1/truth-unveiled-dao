# Truth Unveiled Civic Genome IdentitySummaryCard Project

## Overview

This is a React-based web application for TruthUnveiledDAO, focusing on decentralized identity management. It features a modular architecture, with the IdentitySummaryCard as the first module. The project uses a modern TypeScript stack (React, Vite, shadcn/ui) for the frontend, an Express.js backend, and a PostgreSQL database. The application's vision is to implement a multi-agent system for civic engagement, including features like multi-language support, anonymous civic trust feedback, automated treasury distribution, and a Guardian onboarding system. It aims for global deployment with cultural adaptation and real-time legislative tracking, ultimately supporting a verifiable ballot engine and civic identity credentials for a decentralized autonomous organization (DAO).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack monorepo structure with clear separation between client, server, and shared components, emphasizing modularity and decentralized identity management.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom DAO-themed color variables
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Design Principles**: Mobile-first responsive design, ARIA-compliant accessibility, TTS integration, and performance optimization (targeting <125ms render times). Color schemes adhere to TruthUnveiled Dark Palette.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for schema management, hosted on Neon Database serverless platform
- **Authentication**: Session-based with connect-pg-simple for PostgreSQL session storage

### Build and Development
- **Development**: Hot module replacement with Vite dev server
- **Production**: Static build with Express serving bundled assets
- **TypeScript**: Strict configuration with ESNext modules
- **Code Quality**: ESLint and TypeScript compiler checks

### Core Architectural Decisions & Features
- **Modular Decks**: The application is structured around "Decks" (e.g., Wallet Overview, Education, Finance, Governance, Privacy, Civic Identity), each containing multiple modular components.
- **Multi-Agent System**: Incorporates specialized agents like TTSEngineAgent (for audio generation), LangToggleAgent (for multilingual support), TrustFeedbackEngine (for anonymous feedback), GovMapMonitorAgent (for legislative tracking), and ZKPUserMintExtension (for ZKP minting).
- **Decentralized Identity (DID) & Zero-Knowledge Proof (ZKP)**: Core to identity management, verification, and privacy across all modules, including credential issuance, biometric proofing, and secure asset management.
- **IPFS Integration**: Utilized for decentralized storage of audio, civic records, proof bundles, and general asset archival.
- **Gamification & Reward Systems**: Features TruthPoint (TP) rewards, staking, redemption, participation streaks, and a tiered civic reputation ladder to incentivize engagement.
- **DAO Integration**: Designed for direct integration with DAO governance, including real-time voting, proposal management, ratification, and anonymous civic trust feedback.
- **Global Deployment Toolkit**: Includes cultural adaptation, jurisdiction mapping, and federation synchronization capabilities for worldwide scalability.
- **Verifiable Ballot Engine**: Implements ZKP-protected ballot eligibility verification, encrypted ballot payloads, and anonymous vote token generation.
- **Civic Evidence Engine**: Provides cryptographically verifiable evidence trails and a secure proof vault.

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Query)
- Vite build tooling and plugins
- Express.js server framework
- Drizzle ORM and PostgreSQL drivers
- Wouter for routing

### UI and Styling Dependencies
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- shadcn/ui component library
- Lucide React for consistent iconography
- framer-motion for animations

### Database Dependencies
- Neon Database serverless PostgreSQL
- connect-pg-simple for session storage
- Drizzle Kit for database migrations

### API Integrations
- OpenAI API (for TTS, LLM agents)
- Pinata (for IPFS pinning service)
- Congress.gov API (for live legislative data)
- LegiScan API (for legislative data)
- Solana blockchain (for stream payments via Zebec, mock integration)

### Other Key Libraries
- Mock Crypto utilities (for ZKP simulation during development)