/**
 * CIDTierMap.ts - Truth Unveiled Platform Access Control
 * 
 * Defines the access structure of the Truth Unveiled platform using CID tiers
 * that determine which parts of the system a user or DAO may access.
 * 
 * This module serves as the base logic for assigning CID-based access control
 * to civic engagement modules and provides the foundation for future smart 
 * contract integration and cryptographic verification systems.
 * 
 * Authority: Commander Mark | Phase XXXI Step 1
 * Status: Logic scaffold implementation - no cryptographic verification yet
 */

/**
 * CIDTier enum defines the hierarchical access levels within the Truth Unveiled platform
 * Each tier grants access to specific civic engagement modules and system functionality
 */
export enum CIDTier {
  /** Public tier - Basic platform access for non-authenticated users */
  TIER_0 = 'Public',
  
  /** Identity tier - DID-authenticated users with civic identity verification */
  TIER_1 = 'Identity',
  
  /** Ballot tier - Verified civic participants with voting eligibility */
  TIER_2 = 'Ballot',
  
  /** Governance tier - Advanced civic roles with DAO participation rights */
  TIER_3 = 'Governance',
  
  /** Commander tier - Full platform access for system administration */
  TIER_X = 'Commander'
}

/**
 * CIDAccessMap defines route accessibility for each CID tier
 * Maps civic engagement functionality to appropriate access levels
 */
export const CIDAccessMap = {
  /** TIER_0: Public access routes - No authentication required */
  [CIDTier.TIER_0]: [
    '/home',
    '/about', 
    '/docs',
    '/civic-shell',        // Public civic engagement overview
    '/not-found'           // Error page access
  ],

  /** TIER_1: Identity-verified routes - DID authentication required */
  [CIDTier.TIER_1]: [
    '/identity-onboarding', // DID creation and civic identity setup
    '/vault',               // Personal evidence vault access
    '/identity-demo',       // Identity verification demonstration
    '/identity'             // Identity management interface
  ],

  /** TIER_2: Ballot-eligible routes - Civic participation verified */
  [CIDTier.TIER_2]: [
    '/ballot-test',         // Verifiable voting system access
    '/missions',            // Civic mission participation
    '/gov-map',             // Governance mapping and proposal viewing
    '/poll/create'          // Civic poll creation interface
  ],

  /** TIER_3: Governance routes - Advanced civic roles with DAO rights */
  [CIDTier.TIER_3]: [
    '/admin/outcome-export', // DAO outcome bundle export
    '/proof-vault',          // Advanced evidence management
    '/governance/proposals', // Proposal creation and management
    '/governance/audit',     // Civic audit trail access
    '/poll/create-test',     // Poll creation test interface
    '/poll/analytics',       // Poll analytics dashboard
    '/poll/analytics-test'   // Poll analytics test interface
  ],

  /** TIER_X: Commander routes - Full platform administration access */
  [CIDTier.TIER_X]: [
    '*'  // Commander has unrestricted access to all routes
  ]
} as const;

/**
 * Placeholder CID-to-tier mapping for development and testing
 * In production, this would be replaced by cryptographic verification
 * against blockchain-based identity and reputation systems
 */
const mockCIDTierMapping: Record<string, CIDTier> = {
  // Commander access - highest tier
  'commander-hash': CIDTier.TIER_X,
  'admin-master': CIDTier.TIER_X,
  
  // Governance tier - DAO participants and civic leaders
  'governance-delegate-001': CIDTier.TIER_3,
  'council-member-alpha': CIDTier.TIER_3,
  'civic-moderator-beta': CIDTier.TIER_3,
  
  // Ballot tier - verified civic participants
  'verified-voter-123': CIDTier.TIER_2,
  'civic-participant-456': CIDTier.TIER_2,
  'ballot-eligible-789': CIDTier.TIER_2,
  
  // Identity tier - DID-verified users
  'identity-verified-001': CIDTier.TIER_1,
  'did-authenticated-002': CIDTier.TIER_1,
  'civic-onboarded-003': CIDTier.TIER_1,
  
  // Public tier fallback for unrecognized CIDs
  'anonymous-visitor': CIDTier.TIER_0,
  'public-observer': CIDTier.TIER_0
};

/**
 * Determines the access tier for a given CID digest
 * 
 * @param cidDigest - The CID digest string to evaluate for tier assignment
 * @returns CIDTier - The appropriate access tier for the provided CID
 * 
 * Note: This is a placeholder implementation using mock mappings.
 * In production, this function would integrate with:
 * - ZKP-based identity verification systems
 * - Blockchain-based reputation scoring
 * - Cryptographic proof validation
 * - Cross-deck civic engagement history
 */
export function getTierForCID(cidDigest: string): CIDTier {
  // Simulate lookup logic using placeholder mapping
  const mappedTier = mockCIDTierMapping[cidDigest];
  
  if (mappedTier) {
    return mappedTier;
  }
  
  // Enhanced simulation logic for development testing
  // Check for common patterns in CID digests to assign tiers
  
  // Commander pattern detection
  if (cidDigest.toLowerCase().includes('commander') || 
      cidDigest.toLowerCase().includes('admin') ||
      cidDigest.toLowerCase().includes('master')) {
    return CIDTier.TIER_X;
  }
  
  // Governance pattern detection
  if (cidDigest.toLowerCase().includes('governance') ||
      cidDigest.toLowerCase().includes('delegate') ||
      cidDigest.toLowerCase().includes('council') ||
      cidDigest.toLowerCase().includes('moderator')) {
    return CIDTier.TIER_3;
  }
  
  // Ballot pattern detection
  if (cidDigest.toLowerCase().includes('voter') ||
      cidDigest.toLowerCase().includes('ballot') ||
      cidDigest.toLowerCase().includes('participant') ||
      cidDigest.toLowerCase().includes('verified')) {
    return CIDTier.TIER_2;
  }
  
  // Identity pattern detection
  if (cidDigest.toLowerCase().includes('identity') ||
      cidDigest.toLowerCase().includes('did') ||
      cidDigest.toLowerCase().includes('authenticated') ||
      cidDigest.toLowerCase().includes('onboarded')) {
    return CIDTier.TIER_1;
  }
  
  // Default to public tier for unrecognized patterns
  return CIDTier.TIER_0;
}

/**
 * Validates if a CID has access to a specific route
 * 
 * @param cidDigest - The CID digest to validate
 * @param route - The route path to check access for
 * @returns boolean - True if access is granted, false otherwise
 */
export function validateCIDAccess(cidDigest: string, route: string): boolean {
  const userTier = getTierForCID(cidDigest);
  const accessibleRoutes = CIDAccessMap[userTier];
  
  // Commander tier has universal access
  if (userTier === CIDTier.TIER_X) {
    return true;
  }
  
  // Check if route is explicitly allowed for this tier
  return accessibleRoutes.includes(route);
}

/**
 * Gets all accessible routes for a given CID
 * 
 * @param cidDigest - The CID digest to get routes for
 * @returns string[] - Array of accessible route paths
 */
export function getAccessibleRoutes(cidDigest: string): string[] {
  const userTier = getTierForCID(cidDigest);
  
  // Commander tier gets all routes
  if (userTier === CIDTier.TIER_X) {
    return ['*']; // Indicates universal access
  }
  
  return CIDAccessMap[userTier];
}

/**
 * Gets the display name for a CID tier
 * 
 * @param tier - The CIDTier to get display name for
 * @returns string - Human-readable tier name
 */
export function getTierDisplayName(tier: CIDTier): string {
  const displayNames: Record<CIDTier, string> = {
    [CIDTier.TIER_0]: 'Public Observer',
    [CIDTier.TIER_1]: 'Civic Identity Verified',
    [CIDTier.TIER_2]: 'Ballot Eligible Participant',
    [CIDTier.TIER_3]: 'Governance DAO Member',
    [CIDTier.TIER_X]: 'Commander Authority'
  };
  
  return displayNames[tier];
}

/**
 * Type definitions for external integration
 */
export type CIDAccessConfig = {
  cidDigest: string;
  tier: CIDTier;
  accessibleRoutes: string[];
  displayName: string;
};

/**
 * Creates a complete access configuration object for a CID
 * 
 * @param cidDigest - The CID digest to create configuration for
 * @returns CIDAccessConfig - Complete access configuration object
 */
export function createCIDAccessConfig(cidDigest: string): CIDAccessConfig {
  const tier = getTierForCID(cidDigest);
  const accessibleRoutes = getAccessibleRoutes(cidDigest);
  const displayName = getTierDisplayName(tier);
  
  return {
    cidDigest,
    tier,
    accessibleRoutes,
    displayName
  };
}

/**
 * Development utilities for testing and debugging
 */
export const CIDTierMapUtils = {
  /**
   * Gets all defined tiers
   */
  getAllTiers: (): CIDTier[] => Object.values(CIDTier),
  
  /**
   * Gets all mock CID mappings for testing
   */
  getMockMappings: (): Record<string, CIDTier> => ({ ...mockCIDTierMapping }),
  
  /**
   * Adds a mock CID mapping for testing
   */
  addMockMapping: (cidDigest: string, tier: CIDTier): void => {
    mockCIDTierMapping[cidDigest] = tier;
  },
  
  /**
   * Clears all mock mappings (useful for testing)
   */
  clearMockMappings: (): void => {
    Object.keys(mockCIDTierMapping).forEach(key => {
      delete mockCIDTierMapping[key];
    });
  }
};

// Export all types for external use
export type { CIDAccessConfig };