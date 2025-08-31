# Truth Unveiled Civic Genome

**Platform Version**: v1.0.0  
**A fully decentralized civic engagement platform with zero-knowledge proof protection and verifiable voting systems.**

## Overview

The Truth Unveiled Civic Genome is a comprehensive decentralized application (DApp) that provides civic engagement tools with complete privacy protection through zero-knowledge proofs (ZKP), decentralized identity management (DID), and verifiable voting systems. Built with modern web technologies, it offers 20+ modular UI/UX components for democratic participation.

### Core Features

- 🏛️ **Civic Engagement Decks**: 20+ modular components for democratic participation
- 🗳️ **Verifiable Voting System**: End-to-end ZK privacy protection with encrypted ballots
- 🔐 **Zero-Knowledge Proofs**: Complete anonymization and privacy protection
- 📱 **Responsive Design**: Mobile-optimized with accessibility compliance
- 🌐 **Decentralized Storage**: IPFS integration for content management

## Architecture

- **Frontend**: React 18 with TypeScript, Vite build system, shadcn/ui components
- **Backend**: Express.js with PostgreSQL (Neon Database), session-based authentication
- **Cryptography**: Zero-Knowledge Proofs, encrypted ballot systems, anonymous identity verification
- **Storage**: IPFS integration with Piñata for decentralized content management
- **Privacy**: Complete CID/wallet anonymization, encrypted vote storage, biometric ZKP verification

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 8+ (preferred) or npm
- PostgreSQL database (or Neon Database account)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/cryptomx1/truth-unveiled-dao.git
cd truth-unveiled-dao
```

2. Install dependencies:
```bash
# Root dependencies
npm install

# Client dependencies
cd client
npm install
cd ..
```

3. Set up environment variables:
```bash
# Copy example environment file
cp client/.env.example client/.env

# Edit client/.env with your configuration
VITE_API_BASE_URL=http://localhost:5001
```

4. Start development server:
```bash
# Start both client and server
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) to view the client application.

### Building for Production

```bash
# Build the client
cd client
npm run build

# Build the entire application
cd ..
npm run build
```

## Vercel GitHub Deployment (client/)

This repository is configured for automated deployment to Vercel using GitHub Actions. The client application will be deployed automatically when changes are pushed to the `main` branch.

### Setup Instructions

1. **Connect your Vercel project** to this GitHub repository
2. **Add the following secrets** to your GitHub repository settings (`Settings` → `Secrets and variables` → `Actions`):

   - `VERCEL_TOKEN`: Your Vercel personal access token
     - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
     - Create a new token and copy it
   
   - `VERCEL_ORG_ID`: Your Vercel organization/team ID
     - Found in your [Vercel team settings](https://vercel.com/teams) or account settings
   
   - `VERCEL_PROJECT_ID`: Your Vercel project ID
     - Found in your project settings on Vercel dashboard

3. **Automatic Deployment**: Once secrets are configured, every push to `main` will trigger a deployment

### Manual Deployment

You can also deploy manually using the Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel --prod
```

## Project Structure

```
├── client/                     # React frontend application
│   ├── src/
│   │   ├── components/         # Civic deck components
│   │   ├── pages/             # Application pages
│   │   └── lib/               # Utilities and helpers
│   ├── public/                # Static assets
│   └── dist/                  # Build output (generated)
├── server/                    # Express.js backend
├── shared/                    # Shared TypeScript types
└── docs/                      # Documentation files
```

## Key Demo Routes

- **Command Center**: `/command`
- **Vault Analyzer**: `/vault/analyzer`  
- **Governance Feedback**: `/deck/10`

## Documentation

For comprehensive documentation, see:
- [FinalizationKit.md](./FinalizationKit.md) - Complete platform overview
- [DEPLOYMENT_BUNDLE_MANIFEST.md](./DEPLOYMENT_BUNDLE_MANIFEST.md) - Complete bundle inventory
- [IPFSDeploymentSummary.md](./IPFSDeploymentSummary.md) - IPFS deployment guide

## Contributing

This platform represents a complete civic genome ready for DAO forking and community deployment. All components are fully implemented with privacy protection and accessibility compliance.

## License

MIT License - See [LICENSE](./LICENSE) for details.