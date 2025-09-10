# Truth Unveiled Civic Genome Development Instructions

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Repository Overview

Truth Unveiled Civic Genome is a full-stack decentralized civic engagement platform featuring React 18 frontend with TypeScript/Vite, Express.js backend with PostgreSQL, and comprehensive ZKP (Zero-Knowledge Proof) privacy protection. The codebase contains 20+ modular civic engagement components with extensive build reports and documentation.

## Critical Build & Timing Information

### ⚠️ NEVER CANCEL Warnings
- **Root dependencies install**: Takes ~30 seconds. **NEVER CANCEL** - Set timeout to 90+ seconds.
- **Client dependencies install**: Takes ~10 seconds. **NEVER CANCEL** - Set timeout to 60+ seconds.
- **Server-only build**: Takes ~5 seconds. **NEVER CANCEL** - Set timeout to 60+ seconds.
- **Full build**: Currently fails due to JSX issues, use existing builds.
- **TypeScript check**: Takes ~10 seconds but has known errors. **NEVER CANCEL** - Set timeout to 60+ seconds.

## Environment Setup & Dependencies

### Prerequisites Validation
- **Node.js version**: 20+ (LTS recommended) - Verified working: v20.19.5
- **Package manager**: npm 10+ (pnpm 8+ preferred but not required) - Verified working: npm 10.8.2
- **PostgreSQL**: Required for backend (Neon Database recommended)

### Initial Setup Commands
```bash
# 1. Clone and navigate
git clone https://github.com/cryptomx1/truth-unveiled-dao.git
cd truth-unveiled-dao

# 2. Install root dependencies - NEVER CANCEL, takes ~30 seconds
npm install

# 3. Install client dependencies - NEVER CANCEL, takes ~10 seconds  
cd client
npm install
cd ..

# 4. Setup environment files
cp client/.env.example client/.env
# Edit client/.env with: VITE_API_BASE_URL=http://localhost:5001
```

## Build & Development Workflow

### Production Build Status
⚠️ **CURRENT ISSUE**: Full build currently fails due to JSX syntax in `.js` files. This is a known codebase issue.

```bash
# Current build command fails
npm run build
# Error: JSX syntax in .js files prevents Vite build

# However, existing builds are functional (see client/dist/ and dist/)
# Server-only build works:
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

### Using Existing Build
```bash
# Start production server with existing build - WORKS
npm start

# Server runs on port 5001, serves existing client/dist/ content
```

### Running Production Server
```bash
# Start production server on port 5001
npm start

# Verify server is running
curl -I http://localhost:5001
# Should return HTTP 200 OK
```

### Development Server (LIMITED FUNCTIONALITY)
⚠️ **KNOWN ISSUE**: Development server fails due to JSX syntax in `.js` files. This is a known limitation.

```bash
# Development server (backend only) - port 5001
npm run dev

# Note: Client development server has JSX parsing issues
# Use production build for testing changes
```

## Project Structure & Key Locations

### Root Level
```
├── package.json          # Main dependencies & scripts
├── server/               # Express.js backend
├── client/               # React frontend application  
├── shared/               # Shared TypeScript types
├── scripts/              # Deployment & build scripts
├── .github/workflows/    # CI/CD pipelines
└── dist/                 # Production build output
```

### Client Structure
```
client/
├── package.json          # Frontend dependencies
├── src/
│   ├── components/       # 20+ civic deck components
│   ├── pages/           # Application pages
│   ├── engines/         # Core engines (TTS, ZKP, etc.)
│   ├── zkp/             # Zero-knowledge proof modules
│   └── App.tsx          # Main application component
├── dist/                # Client build output
└── vite.config.mts      # Vite configuration
```

### Important Files to Monitor
- **client/src/App.tsx**: Main routing and component integration
- **server/index.ts**: Backend server entry point  
- **shared/**: Type definitions used across frontend/backend
- **Phase build reports**: Extensive documentation of completed modules

## Testing & Validation

### TypeScript Checking
```bash
# Run TypeScript checker - NEVER CANCEL, timeout 60+ seconds  
npm run check

# Note: Expect some TypeScript errors in legacy .js files
# Errors in .js files with JSX are known issues, not blockers
```

### Manual Validation Steps
After making changes, ALWAYS validate:

1. **Server Build Validation**:
   ```bash
   # Build server component only - NEVER CANCEL, timeout 60+ seconds
   npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
   # Verify: No fatal build errors
   ```

2. **Server Validation**: 
   ```bash
   npm start &
   sleep 5
   curl -I http://localhost:5001
   # Verify: HTTP 200 OK response
   pkill -f "npm start"
   ```

3. **Existing Client Validation**:
   - Check client/dist/ contains existing built assets
   - Verify index.html and assets/ directory exist
   - Test server serves client content correctly

### File System Validation
```bash
# Verify all key directories exist
ls -la client/src/components/decks/    # 20+ deck modules
ls -la scripts/                       # Deployment scripts  
ls -la .github/workflows/             # CI/CD configuration
```

## CI/CD & Deployment

### GitHub Actions
- **ci.yml**: Basic build validation
- **deploy-vercel-client.yml**: Vercel deployment for client

### Deployment Commands
```bash
# IPFS deployment (if configured)
cd scripts && node deploy-ipfs.js

# Vercel deployment (manual)
npm i -g vercel
cd client && vercel --prod
```

## Known Issues & Workarounds

### 1. Build System Issues
**Problem**: Full `npm run build` fails due to JSX syntax in `.js` files  
**Current Status**: Codebase has mixed `.js` and `.tsx` files with JSX in both
**Workaround**: Use server-only builds and existing client builds

### 2. Development Server JSX Issues
**Problem**: Vite fails on `.js` files containing JSX  
**Workaround**: Use production server with existing builds for testing

### 2. TypeScript Compilation Errors  
**Problem**: Mixed .js/.tsx files cause compilation errors  
**Workaround**: Errors are non-fatal, production build still works

### 3. No Linting/Formatting Scripts
**Problem**: No `npm run lint` or `npm run format` configured  
**Workaround**: Manual code review, consider adding ESLint/Prettier

### 4. Limited Test Infrastructure
**Problem**: Test files exist but no `npm test` script  
**Workaround**: Manual testing via production builds

## Performance Targets & Expectations

### Build Performance
- **Dependencies install**: 30-40 seconds total
- **Production build**: 10-15 seconds  
- **Bundle size**: ~2.5MB (normal for civic platform)
- **Server startup**: <5 seconds

### Runtime Performance  
- **Server response time**: <200ms
- **Client load time**: Varies by component complexity
- **Memory usage**: Monitor during development

## Debugging & Troubleshooting

### Build Failures
1. Verify Node.js version: `node --version` (should be 20+)
2. Clear dependencies: `rm -rf node_modules client/node_modules && npm install`
3. Check environment: Ensure client/.env exists with correct API URL

### Server Issues
1. Check port conflicts: `lsof -i :5001`
2. Verify database connection (if using PostgreSQL)  
3. Check environment variables

### Common Error Messages
- **"JSX syntax extension not enabled"**: Known issue, use production build
- **"Failed to parse source"**: JSX in .js files, expected behavior
- **Bundle size warnings**: Normal for this application size

## Validation Checklist

Before completing any development work:

- [ ] Root dependencies installed successfully
- [ ] Client dependencies installed successfully  
- [ ] Server-only build completes without fatal errors (npx esbuild...)
- [ ] Production server starts and responds to HTTP requests
- [ ] Existing client build assets are intact (client/dist/)
- [ ] No new TypeScript errors introduced (existing errors acceptable)
- [ ] Server serves client content correctly

**Note**: Full rebuild currently not possible due to JSX issues, but application runs with existing builds.

## Emergency Procedures

### If Build Completely Fails
1. **Reset dependencies**: `rm -rf node_modules client/node_modules package-lock.json client/package-lock.json`
2. **Reinstall**: `npm install && cd client && npm install && cd ..`
3. **Test minimal build**: `npm run build`

### If Server Won't Start
1. **Check dist exists**: `ls -la dist/index.js`
2. **Rebuild**: `npm run build`  
3. **Check ports**: `lsof -i :5001` and kill conflicting processes

Remember: This is a mature, complex codebase with known development workflow limitations. Focus on production build validation rather than development server debugging.