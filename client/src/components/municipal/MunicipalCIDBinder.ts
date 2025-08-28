import { FederationNodeRegistry } from '../federation/FederationNodeRegistry';

interface MunicipalCredential {
  nodeId: string;
  entityName: string;
  jurisdiction: string;
  cid: string;
  didHash: string;
  verificationStatus: 'pending' | 'verified' | 'expired' | 'rejected';
  issuedAt: string;
  expiresAt: string;
  zkpProof: string;
  trustedContacts: string[];
  governanceScore: number;
  lastUpdated: string;
}

interface CIDBinding {
  credentialCID: string;
  governmentDID: string;
  municipalNodeId: string;
  bindingHash: string;
  timestamp: string;
  verificationProof: string;
  federationSync: boolean;
}

export class MunicipalCIDBinder {
  private static instance: MunicipalCIDBinder | null = null;
  private credentials: Map<string, MunicipalCredential> = new Map();
  private bindings: Map<string, CIDBinding> = new Map();

  private constructor() {
    this.loadStoredCredentials();
    console.log('🔗 MunicipalCIDBinder initialized with civic credential management');
  }

  public static getInstance(): MunicipalCIDBinder {
    if (!MunicipalCIDBinder.instance) {
      MunicipalCIDBinder.instance = new MunicipalCIDBinder();
    }
    return MunicipalCIDBinder.instance;
  }

  /**
   * Generate CID for municipal entity credentials
   */
  public async generateCredentialCID(
    nodeId: string,
    entityName: string,
    jurisdiction: string,
    zkpProof: string,
    trustedContacts: string[]
  ): Promise<string> {
    try {
      const credentialData = {
        nodeId,
        entityName,
        jurisdiction,
        timestamp: new Date().toISOString(),
        zkpProof,
        trustedContacts,
        version: '1.0'
      };

      // Create a hash-based CID for the municipal credential
      const credentialString = JSON.stringify(credentialData);
      const encoder = new TextEncoder();
      const data = encoder.encode(credentialString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const cid = `cid:municipal:${nodeId}:${hashHex.substring(0, 32)}`;
      
      console.log(`🔗 Generated municipal CID: ${cid}`);
      return cid;
    } catch (error) {
      console.error('❌ CID generation failed:', error);
      throw new Error('Failed to generate municipal credential CID');
    }
  }

  /**
   * Create and store municipal credential
   */
  public async createMunicipalCredential(
    nodeId: string,
    entityName: string,
    jurisdiction: string,
    zkpProof: string,
    trustedContacts: string[] = []
  ): Promise<MunicipalCredential> {
    try {
      const cid = await this.generateCredentialCID(nodeId, entityName, jurisdiction, zkpProof, trustedContacts);
      const didHash = await this.generateDIDHash(nodeId, entityName);
      
      const credential: MunicipalCredential = {
        nodeId,
        entityName,
        jurisdiction,
        cid,
        didHash,
        verificationStatus: 'pending',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        zkpProof,
        trustedContacts,
        governanceScore: 0,
        lastUpdated: new Date().toISOString()
      };

      this.credentials.set(nodeId, credential);
      this.persistCredentials();
      
      console.log(`✅ Municipal credential created for ${entityName}`);
      return credential;
    } catch (error) {
      console.error('❌ Credential creation failed:', error);
      throw error;
    }
  }

  /**
   * Bind municipal CID to federation system
   */
  public async bindToFederation(
    nodeId: string,
    onClose?: () => void
  ): Promise<CIDBinding> {
    try {
      const credential = this.credentials.get(nodeId);
      if (!credential) {
        throw new Error(`Municipal credential not found for node: ${nodeId}`);
      }

      const federationRegistry = FederationNodeRegistry.getInstance();
      
      // Create binding data
      const bindingData = {
        credentialCID: credential.cid,
        governmentDID: credential.didHash,
        municipalNodeId: nodeId,
        timestamp: new Date().toISOString()
      };

      // Generate binding hash
      const bindingString = JSON.stringify(bindingData);
      const encoder = new TextEncoder();
      const data = encoder.encode(bindingString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const bindingHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const binding: CIDBinding = {
        ...bindingData,
        bindingHash,
        verificationProof: `proof:${bindingHash.substring(0, 16)}`,
        federationSync: true
      };

      // Sync with federation registry
      await federationRegistry.registerMunicipalNode({
        nodeId,
        entityName: credential.entityName,
        jurisdiction: credential.jurisdiction,
        cid: credential.cid,
        didHash: credential.didHash,
        tier: this.calculateTier(credential.governanceScore),
        status: 'active'
      });

      this.bindings.set(nodeId, binding);
      this.persistBindings();

      console.log(`🔗 Municipal node bound to federation: ${nodeId}`);
      
      if (onClose) {
        onClose();
      }

      return binding;
    } catch (error) {
      console.error('❌ Federation binding failed:', error);
      throw error;
    }
  }

  /**
   * Verify municipal credential integrity
   */
  public async verifyCredential(nodeId: string): Promise<boolean> {
    try {
      const credential = this.credentials.get(nodeId);
      if (!credential) {
        return false;
      }

      // Check expiration
      if (new Date(credential.expiresAt) < new Date()) {
        await this.updateCredentialStatus(nodeId, 'expired');
        return false;
      }

      // Verify ZKP proof (mock verification)
      const zkpValid = await this.verifyZKPProof(credential.zkpProof);
      if (!zkpValid) {
        await this.updateCredentialStatus(nodeId, 'rejected');
        return false;
      }

      // Verify trusted contacts
      const contactsValid = await this.verifyTrustedContacts(credential.trustedContacts);
      if (!contactsValid) {
        console.log('⚠️ Trusted contacts verification incomplete');
      }

      await this.updateCredentialStatus(nodeId, 'verified');
      console.log(`✅ Credential verified for node: ${nodeId}`);
      return true;
    } catch (error) {
      console.error('❌ Credential verification failed:', error);
      await this.updateCredentialStatus(nodeId, 'rejected');
      return false;
    }
  }

  /**
   * Update governance score and refresh credential
   */
  public async updateGovernanceScore(nodeId: string, score: number): Promise<void> {
    try {
      const credential = this.credentials.get(nodeId);
      if (!credential) {
        throw new Error(`Credential not found for node: ${nodeId}`);
      }

      credential.governanceScore = Math.max(0, Math.min(100, score));
      credential.lastUpdated = new Date().toISOString();
      
      this.credentials.set(nodeId, credential);
      this.persistCredentials();

      console.log(`📊 Governance score updated for ${nodeId}: ${score}%`);
    } catch (error) {
      console.error('❌ Governance score update failed:', error);
      throw error;
    }
  }

  /**
   * Get credential information
   */
  public getCredential(nodeId: string): MunicipalCredential | null {
    return this.credentials.get(nodeId) || null;
  }

  /**
   * Get CID binding information
   */
  public getBinding(nodeId: string): CIDBinding | null {
    return this.bindings.get(nodeId) || null;
  }

  /**
   * List all municipal credentials
   */
  public getAllCredentials(): MunicipalCredential[] {
    return Array.from(this.credentials.values());
  }

  /**
   * Get credentials by status
   */
  public getCredentialsByStatus(status: MunicipalCredential['verificationStatus']): MunicipalCredential[] {
    return Array.from(this.credentials.values()).filter(cred => cred.verificationStatus === status);
  }

  // Private helper methods
  private async generateDIDHash(nodeId: string, entityName: string): Promise<string> {
    const didData = {
      type: 'municipal',
      nodeId,
      entityName,
      timestamp: new Date().toISOString()
    };
    
    const didString = JSON.stringify(didData);
    const encoder = new TextEncoder();
    const data = encoder.encode(didString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `did:civic:municipal:${hashHex.substring(0, 32)}`;
  }

  private async verifyZKPProof(zkpProof: string): Promise<boolean> {
    // Mock ZKP verification - in real implementation would use ZKP library
    try {
      const proofData = JSON.parse(atob(zkpProof));
      return proofData.proofType === 'municipal-verification';
    } catch {
      return false;
    }
  }

  private async verifyTrustedContacts(contacts: string[]): Promise<boolean> {
    // Mock contact verification - in real implementation would verify government emails
    return contacts.length >= 1;
  }

  private calculateTier(governanceScore: number): string {
    if (governanceScore >= 80) return 'tier-1';
    if (governanceScore >= 60) return 'tier-2';
    if (governanceScore >= 40) return 'tier-3';
    return 'tier-4';
  }

  private async updateCredentialStatus(
    nodeId: string, 
    status: MunicipalCredential['verificationStatus']
  ): Promise<void> {
    const credential = this.credentials.get(nodeId);
    if (credential) {
      credential.verificationStatus = status;
      credential.lastUpdated = new Date().toISOString();
      this.credentials.set(nodeId, credential);
      this.persistCredentials();
    }
  }

  private loadStoredCredentials(): void {
    try {
      const storedCredentials = localStorage.getItem('municipal_credentials');
      if (storedCredentials) {
        const parsed = JSON.parse(storedCredentials);
        this.credentials = new Map(Object.entries(parsed));
      }

      const storedBindings = localStorage.getItem('municipal_bindings');
      if (storedBindings) {
        const parsed = JSON.parse(storedBindings);
        this.bindings = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('❌ Failed to load stored credentials:', error);
    }
  }

  private persistCredentials(): void {
    try {
      const credentialsObj = Object.fromEntries(this.credentials);
      localStorage.setItem('municipal_credentials', JSON.stringify(credentialsObj));
    } catch (error) {
      console.error('❌ Failed to persist credentials:', error);
    }
  }

  private persistBindings(): void {
    try {
      const bindingsObj = Object.fromEntries(this.bindings);
      localStorage.setItem('municipal_bindings', JSON.stringify(bindingsObj));
    } catch (error) {
      console.error('❌ Failed to persist bindings:', error);
    }
  }
}

// Export for React component integration
export default MunicipalCIDBinder;