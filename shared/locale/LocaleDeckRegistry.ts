/**
 * LocaleDeckRegistry.ts - Phase X-Z Step 2
 * 
 * Registry mapping countries/regions to default decks and modules
 * Enables override capability and schema integrity validation
 * 
 * Authority: Commander Mark via JASMY Relay System
 * Phase: X-Z Global Civic Stack Deployment - Step 2
 */

export interface DeckConfiguration {
  deckId: number;
  deckName: string;
  priority: 'essential' | 'recommended' | 'optional';
  modules: ModuleConfiguration[];
  culturalAdaptation: {
    enabled: boolean;
    adaptationLevel: 'basic' | 'moderate' | 'comprehensive';
  };
}

export interface ModuleConfiguration {
  moduleId: string;
  moduleName: string;
  enabled: boolean;
  configOverrides: Record<string, any>;
  localizedContent: {
    language: string;
    terminology: Record<string, string>;
  };
}

export interface LocalePreset {
  localeId: string;
  countryCode: string;
  region: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  defaultDecks: DeckConfiguration[];
  policyOverlays: {
    privacyCompliance: string[];
    dataLocalization: boolean;
    governanceStyle: 'federal' | 'unitary' | 'confederate';
    votingSystem: 'fptp' | 'proportional' | 'mixed' | 'ranked';
  };
  culturalProfile: {
    civicEngagementStyle: 'individual' | 'collective' | 'hybrid';
    formalityLevel: 'high' | 'medium' | 'low';
    hierarchyRespect: boolean;
    communicationStyle: 'direct' | 'indirect';
  };
  federationEligibility: {
    enabled: boolean;
    crossBorderConsensus: boolean;
    zkpVerificationRequired: boolean;
  };
}

export interface RegistryOverride {
  overrideId: string;
  targetLocale: string;
  overrideType: 'cid' | 'deploymentId' | 'custom';
  overrideData: {
    cid?: string;
    deploymentId?: string;
    customConfiguration?: Partial<LocalePreset>;
  };
  validUntil?: Date;
  authorizedBy: string;
}

export class LocaleDeckRegistry {
  private localePresets: Map<string, LocalePreset>;
  private registryOverrides: Map<string, RegistryOverride>;
  private schemaVersion: string = '2.1.0';
  
  constructor() {
    this.localePresets = new Map();
    this.registryOverrides = new Map();
    this.initializeRegistry();
    console.log('🗺️ LocaleDeckRegistry: Initialized with comprehensive locale-deck mappings');
  }
  
  /**
   * Get deck configuration for specific locale
   */
  async getLocaleConfiguration(countryCode: string, tier?: string): Promise<LocalePreset | null> {
    const startTime = Date.now();
    
    console.log(`🔍 Looking up locale configuration for ${countryCode}`);
    
    // Check for active overrides first
    const override = this.getActiveOverride(countryCode);
    if (override) {
      console.log(`⚡ Override found for ${countryCode}: ${override.overrideType}`);
      return this.applyOverride(countryCode, override);
    }
    
    // Get base configuration
    const localeKey = tier ? `${countryCode}_${tier}` : countryCode;
    const configuration = this.localePresets.get(localeKey) || this.localePresets.get(countryCode);
    
    const lookupTime = Date.now() - startTime;
    
    if (configuration) {
      console.log(`✅ Locale configuration found for ${countryCode} in ${lookupTime}ms`);
      return this.validateSchemaIntegrity(configuration);
    }
    
    console.warn(`⚠️ No configuration found for ${countryCode}`);
    return null;
  }
  
  /**
   * Register override for specific locale
   */
  async registerOverride(override: RegistryOverride): Promise<boolean> {
    console.log(`📝 Registering override for ${override.targetLocale}: ${override.overrideType}`);
    
    // Validate override data
    const isValid = await this.validateOverride(override);
    
    if (!isValid) {
      console.error(`❌ Invalid override data for ${override.targetLocale}`);
      return false;
    }
    
    this.registryOverrides.set(override.targetLocale, override);
    console.log(`✅ Override registered successfully for ${override.targetLocale}`);
    
    return true;
  }
  
  /**
   * Get all supported locales with tier information
   */
  getSupportedLocales(): { countryCode: string; tier: string; region: string }[] {
    const locales: { countryCode: string; tier: string; region: string }[] = [];
    
    for (const [key, preset] of this.localePresets.entries()) {
      locales.push({
        countryCode: preset.countryCode,
        tier: preset.tier,
        region: preset.region
      });
    }
    
    return locales.sort((a, b) => a.tier.localeCompare(b.tier) || a.countryCode.localeCompare(b.countryCode));
  }
  
  /**
   * Get deck presets for specific tier
   */
  getDeckPresetsByTier(tier: 'tier1' | 'tier2' | 'tier3'): DeckConfiguration[] {
    switch (tier) {
      case 'tier1':
        return this.getTier1DeckPresets();
      case 'tier2':
        return this.getTier2DeckPresets();
      case 'tier3':
        return this.getTier3DeckPresets();
      default:
        return this.getBasicDeckPresets();
    }
  }
  
  /**
   * Initialize comprehensive registry with locale mappings
   */
  private initializeRegistry() {
    // Tier 1 Locales (Full Feature Set)
    this.addLocalePreset('US', {
      localeId: 'us_tier1',
      countryCode: 'US',
      region: 'North America',
      tier: 'tier1',
      defaultDecks: this.getTier1DeckPresets(),
      policyOverlays: {
        privacyCompliance: ['CCPA', 'State Privacy Laws'],
        dataLocalization: false,
        governanceStyle: 'federal',
        votingSystem: 'fptp'
      },
      culturalProfile: {
        civicEngagementStyle: 'individual',
        formalityLevel: 'medium',
        hierarchyRespect: false,
        communicationStyle: 'direct'
      },
      federationEligibility: {
        enabled: true,
        crossBorderConsensus: true,
        zkpVerificationRequired: true
      }
    });
    
    this.addLocalePreset('DE', {
      localeId: 'de_tier1',
      countryCode: 'DE',
      region: 'Central Europe',
      tier: 'tier1',
      defaultDecks: this.getTier1DeckPresets(),
      policyOverlays: {
        privacyCompliance: ['GDPR', 'BDSG'],
        dataLocalization: true,
        governanceStyle: 'federal',
        votingSystem: 'mixed'
      },
      culturalProfile: {
        civicEngagementStyle: 'collective',
        formalityLevel: 'high',
        hierarchyRespect: true,
        communicationStyle: 'direct'
      },
      federationEligibility: {
        enabled: true,
        crossBorderConsensus: true,
        zkpVerificationRequired: true
      }
    });
    
    // Tier 2 Locales (Moderate Feature Set)
    this.addLocalePreset('JP', {
      localeId: 'jp_tier2',
      countryCode: 'JP',
      region: 'East Asia',
      tier: 'tier2',
      defaultDecks: this.getTier2DeckPresets(),
      policyOverlays: {
        privacyCompliance: ['APPI'],
        dataLocalization: false,
        governanceStyle: 'unitary',
        votingSystem: 'mixed'
      },
      culturalProfile: {
        civicEngagementStyle: 'collective',
        formalityLevel: 'high',
        hierarchyRespect: true,
        communicationStyle: 'indirect'
      },
      federationEligibility: {
        enabled: true,
        crossBorderConsensus: true,
        zkpVerificationRequired: true
      }
    });
    
    // Tier 3 Locales (Basic Feature Set)
    this.addLocalePreset('BR', {
      localeId: 'br_tier3',
      countryCode: 'BR',
      region: 'Latin America',
      tier: 'tier3',
      defaultDecks: this.getTier3DeckPresets(),
      policyOverlays: {
        privacyCompliance: ['LGPD'],
        dataLocalization: true,
        governanceStyle: 'federal',
        votingSystem: 'proportional'
      },
      culturalProfile: {
        civicEngagementStyle: 'hybrid',
        formalityLevel: 'medium',
        hierarchyRespect: true,
        communicationStyle: 'indirect'
      },
      federationEligibility: {
        enabled: false,
        crossBorderConsensus: false,
        zkpVerificationRequired: false
      }
    });
    
    console.log(`📊 Registry initialized: ${this.localePresets.size} locale presets loaded`);
  }
  
  /**
   * Get Tier 1 deck presets (Full feature set)
   */
  private getTier1DeckPresets(): DeckConfiguration[] {
    return [
      {
        deckId: 1,
        deckName: 'WalletOverviewDeck',
        priority: 'essential',
        modules: [
          { moduleId: 'identity-summary', moduleName: 'Identity Summary', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } },
          { moduleId: 'wallet-balance', moduleName: 'Wallet Balance', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } },
          { moduleId: 'participation-streak', moduleName: 'Participation Streak', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } },
          { moduleId: 'wallet-sync', moduleName: 'Wallet Sync', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } }
        ],
        culturalAdaptation: { enabled: true, adaptationLevel: 'comprehensive' }
      },
      {
        deckId: 2,
        deckName: 'GovernanceDeck',
        priority: 'essential',
        modules: [
          { moduleId: 'civic-swipe', moduleName: 'Civic Swipe', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } },
          { moduleId: 'vote-ledger', moduleName: 'Vote Ledger', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } },
          { moduleId: 'session-status', moduleName: 'Session Status', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } }
        ],
        culturalAdaptation: { enabled: true, adaptationLevel: 'comprehensive' }
      },
      {
        deckId: 5,
        deckName: 'PrivacyDeck',
        priority: 'essential',
        modules: [
          { moduleId: 'zkp-status', moduleName: 'ZKP Status', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } },
          { moduleId: 'session-privacy', moduleName: 'Session Privacy', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } },
          { moduleId: 'encrypted-message', moduleName: 'Encrypted Messaging', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } },
          { moduleId: 'vault-access', moduleName: 'Vault Access', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } }
        ],
        culturalAdaptation: { enabled: true, adaptationLevel: 'comprehensive' }
      }
    ];
  }
  
  /**
   * Get Tier 2 deck presets (Moderate feature set)
   */
  private getTier2DeckPresets(): DeckConfiguration[] {
    return [
      {
        deckId: 1,
        deckName: 'WalletOverviewDeck',
        priority: 'essential',
        modules: [
          { moduleId: 'identity-summary', moduleName: 'Identity Summary', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } },
          { moduleId: 'wallet-balance', moduleName: 'Wallet Balance', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } },
          { moduleId: 'participation-streak', moduleName: 'Participation Streak', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } }
        ],
        culturalAdaptation: { enabled: true, adaptationLevel: 'moderate' }
      },
      {
        deckId: 2,
        deckName: 'GovernanceDeck',
        priority: 'essential',
        modules: [
          { moduleId: 'civic-swipe', moduleName: 'Civic Swipe', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } },
          { moduleId: 'vote-ledger', moduleName: 'Vote Ledger', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } }
        ],
        culturalAdaptation: { enabled: true, adaptationLevel: 'moderate' }
      }
    ];
  }
  
  /**
   * Get Tier 3 deck presets (Basic feature set)
   */
  private getTier3DeckPresets(): DeckConfiguration[] {
    return [
      {
        deckId: 1,
        deckName: 'WalletOverviewDeck',
        priority: 'essential',
        modules: [
          { moduleId: 'identity-summary', moduleName: 'Identity Summary', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } },
          { moduleId: 'wallet-balance', moduleName: 'Wallet Balance', enabled: true, configOverrides: {}, localizedContent: { language: 'en', terminology: {} } }
        ],
        culturalAdaptation: { enabled: true, adaptationLevel: 'basic' }
      }
    ];
  }
  
  /**
   * Get basic deck presets (Fallback)
   */
  private getBasicDeckPresets(): DeckConfiguration[] {
    return this.getTier3DeckPresets();
  }
  
  /**
   * Add locale preset to registry
   */
  private addLocalePreset(countryCode: string, preset: LocalePreset) {
    this.localePresets.set(countryCode, preset);
  }
  
  /**
   * Get active override for locale
   */
  private getActiveOverride(countryCode: string): RegistryOverride | null {
    const override = this.registryOverrides.get(countryCode);
    
    if (!override) return null;
    
    // Check if override is still valid
    if (override.validUntil && override.validUntil < new Date()) {
      this.registryOverrides.delete(countryCode);
      return null;
    }
    
    return override;
  }
  
  /**
   * Apply override to base configuration
   */
  private async applyOverride(countryCode: string, override: RegistryOverride): Promise<LocalePreset | null> {
    const baseConfig = this.localePresets.get(countryCode);
    
    if (!baseConfig) return null;
    
    switch (override.overrideType) {
      case 'cid':
        // Handle CID-based override (would fetch from IPFS in real implementation)
        console.log(`🔗 Applying CID override: ${override.overrideData.cid}`);
        return baseConfig;
        
      case 'deploymentId':
        // Handle deployment ID override
        console.log(`🚀 Applying deployment override: ${override.overrideData.deploymentId}`);
        return baseConfig;
        
      case 'custom':
        // Apply custom configuration override
        if (override.overrideData.customConfiguration) {
          return { ...baseConfig, ...override.overrideData.customConfiguration };
        }
        return baseConfig;
        
      default:
        return baseConfig;
    }
  }
  
  /**
   * Validate override data
   */
  private async validateOverride(override: RegistryOverride): Promise<boolean> {
    // Basic validation
    if (!override.overrideId || !override.targetLocale || !override.overrideType) {
      return false;
    }
    
    // Validate override data based on type
    switch (override.overrideType) {
      case 'cid':
        return !!override.overrideData.cid;
      case 'deploymentId':
        return !!override.overrideData.deploymentId;
      case 'custom':
        return !!override.overrideData.customConfiguration;
      default:
        return false;
    }
  }
  
  /**
   * Validate schema integrity
   */
  private validateSchemaIntegrity(configuration: LocalePreset): LocalePreset {
    // Ensure all required fields are present
    if (!configuration.localeId || !configuration.countryCode || !configuration.defaultDecks) {
      console.warn(`⚠️ Schema integrity issue detected for ${configuration.countryCode}`);
    }
    
    return configuration;
  }
}