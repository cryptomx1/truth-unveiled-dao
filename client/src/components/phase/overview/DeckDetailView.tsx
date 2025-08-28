// Phase X-B Step 2: DeckDetailView.tsx
// Commander Mark authorization via JASMY Relay System
// Dynamic deck rendering, ZKP metadata validation, access control, responsive UX

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { protocolValidator } from '@/utils/ProtocolValidator';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Shield, 
  Eye, 
  Flag, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Key, 
  Database, 
  Globe, 
  Zap, 
  Brain, 
  MapPin, 
  FileText, 
  Settings,
  Loader2,
  ExternalLink,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

export interface DeckModule {
  id: number;
  name: string;
  description: string;
  status: 'complete' | 'partial' | 'pending';
  lastUpdated: string;
  zkpHash: string;
}

export interface DeckMetadata {
  id: number;
  name: string;
  pillar: string;
  civicFunction: string;
  userType: string;
  description: string;
  modules: DeckModule[];
  status: 'complete' | 'partial' | 'pending';
  lastUpdated: string;
  cid: string;
  zkpHash: string;
  authorDid: string;
  version: string;
  accessLevel: 'public' | 'restricted' | 'private';
}

export interface UserRole {
  type: 'citizen' | 'moderator' | 'governor';
  permissions: string[];
  did: string;
}

export interface DeckDetailViewProps {
  deckId?: number;
  onBack?: () => void;
  onNavigate?: (deckId: number) => void;
  userRole?: UserRole;
}

const DeckDetailView = React.memo(function DeckDetailView({
  deckId = 1,
  onBack,
  onNavigate,
  userRole = { type: 'citizen', permissions: ['view'], did: 'did:civic:citizen_001' }
}: DeckDetailViewProps) {
  const [deckMetadata, setDeckMetadata] = useState<DeckMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [zkpValidating, setZkpValidating] = useState<boolean>(false);
  const [zkpStatus, setZkpStatus] = useState<'pending' | 'valid' | 'invalid' | 'mismatch'>('pending');
  const [accessGranted, setAccessGranted] = useState<boolean>(false);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const [contentAction, setContentAction] = useState<'none' | 'flagging' | 'approving'>('none');
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');
  const [renderTime, setRenderTime] = useState<number>(0);
  
  const mountTimestamp = useRef<number>(Date.now());
  const validationStartTime = useRef<number>(0);

  // Generate mock deck metadata based on deckId
  const generateDeckMetadata = (id: number): DeckMetadata => {
    const deckTemplates = [
      {
        name: 'WalletOverviewDeck',
        pillar: 'Civic Identity',
        civicFunction: 'Identity Management',
        userType: 'All Users',
        description: 'Comprehensive decentralized identity and wallet overview system',
        accessLevel: 'public' as const
      },
      {
        name: 'GovernanceDeck',
        pillar: 'Governance',
        civicFunction: 'Voting & Proposals',
        userType: 'Citizens',
        description: 'Civic proposal voting and governance participation framework',
        accessLevel: 'public' as const
      },
      {
        name: 'EducationDeck',
        pillar: 'Education',
        civicFunction: 'Learning & Assessment',
        userType: 'Students',
        description: 'Civic education and knowledge sharing platform',
        accessLevel: 'public' as const
      },
      {
        name: 'FinanceDeck',
        pillar: 'Finance',
        civicFunction: 'Rewards & Transactions',
        userType: 'Contributors',
        description: 'Truth Points and decentralized financial management',
        accessLevel: 'restricted' as const
      },
      {
        name: 'PrivacyDeck',
        pillar: 'Privacy',
        civicFunction: 'Data Protection',
        userType: 'Privacy-Conscious',
        description: 'Zero-knowledge privacy and encryption protocols',
        accessLevel: 'private' as const
      }
    ];

    const template = deckTemplates[(id - 1) % deckTemplates.length];
    
    const modules: DeckModule[] = Array.from({ length: 4 }, (_, index) => ({
      id: index + 1,
      name: `${template.name.replace('Deck', '')}Module${index + 1}`,
      description: `Module ${index + 1} for ${template.civicFunction.toLowerCase()}`,
      status: index < 3 ? 'complete' : Math.random() > 0.3 ? 'complete' : 'partial',
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      zkpHash: `zkp_${template.name.toLowerCase()}_mod${index + 1}_${Math.random().toString(36).substring(7)}`
    }));

    return {
      id,
      name: template.name,
      pillar: template.pillar,
      civicFunction: template.civicFunction,
      userType: template.userType,
      description: template.description,
      modules,
      status: modules.every(m => m.status === 'complete') ? 'complete' : 'partial',
      lastUpdated: new Date().toISOString().split('T')[0],
      cid: `Qm${Math.random().toString(36).substring(2, 44)}`,
      zkpHash: `zkp_${template.name.toLowerCase()}_${Math.random().toString(36).substring(7)}`,
      authorDid: `did:civic:author_${Math.random().toString(36).substring(7)}`,
      version: '1.0.0',
      accessLevel: template.accessLevel
    };
  };

  // Simulate ZKP metadata validation
  const validateZKPMetadata = useCallback(async (metadata: DeckMetadata): Promise<boolean> => {
    validationStartTime.current = Date.now();
    setZkpValidating(true);
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 80));
    
    // Simulate 15% mismatch rate for Path B trigger
    const validationSuccess = Math.random() > 0.15;
    const validationTime = Date.now() - validationStartTime.current;
    
    console.log(`🔐 DeckDetailView: ZKP validation for ${metadata.name} - ${validationSuccess ? 'VALID' : 'MISMATCH'} (${validationTime}ms)`);
    
    if (!validationSuccess) {
      console.log('⚠️ DeckDetailView: ZKP mismatch detected - activating LocalSaveLayer fallback (isMock=true)');
      setFallbackMode(true);
      setZkpStatus('mismatch');
      announce(`ZKP validation failed for ${metadata.name}, using local fallback`);
    } else {
      setZkpStatus('valid');
      announce(`ZKP validation successful for ${metadata.name}`);
    }
    
    setZkpValidating(false);
    return validationSuccess;
  }, []);

  // Check access control based on user role and deck access level
  const checkAccessControl = useCallback((metadata: DeckMetadata, role: UserRole): boolean => {
    const { type, permissions } = role;
    const { accessLevel } = metadata;
    
    // Role-based access logic
    switch (accessLevel) {
      case 'public':
        return true;
      case 'restricted':
        return type === 'moderator' || type === 'governor' || permissions.includes('restricted_access');
      case 'private':
        return type === 'governor' || permissions.includes('private_access');
      default:
        return false;
    }
  }, []);

  // Get role capabilities
  const getRoleCapabilities = useCallback((role: UserRole) => {
    switch (role.type) {
      case 'citizen':
        return {
          canView: true,
          canFlag: false,
          canApprove: false,
          canEdit: false,
          label: 'Citizen (View Only)'
        };
      case 'moderator':
        return {
          canView: true,
          canFlag: true,
          canApprove: false,
          canEdit: false,
          label: 'Moderator (Flag Content)'
        };
      case 'governor':
        return {
          canView: true,
          canFlag: true,
          canApprove: true,
          canEdit: true,
          label: 'Governor (Full Access)'
        };
      default:
        return {
          canView: false,
          canFlag: false,
          canApprove: false,
          canEdit: false,
          label: 'Unknown Role'
        };
    }
  }, []);

  // Load deck data and perform validation
  useEffect(() => {
    const loadDeckData = async () => {
      setLoading(true);
      
      try {
        // Simulate API/vault.history.json fetch delay
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const metadata = generateDeckMetadata(deckId);
        setDeckMetadata(metadata);
        
        // Check access control
        const hasAccess = checkAccessControl(metadata, userRole);
        setAccessGranted(hasAccess);
        
        if (hasAccess) {
          // Perform ZKP validation
          await validateZKPMetadata(metadata);
          announce(`${metadata.name} loaded successfully`);
        } else {
          console.log(`🚫 DeckDetailView: Access denied for ${metadata.name} - user role: ${userRole.type}, required: ${metadata.accessLevel}`);
          announce(`Access denied to ${metadata.name}`);
        }
        
      } catch (error) {
        console.error('❌ DeckDetailView: Error loading deck data:', error);
        setFallbackMode(true);
        announce('Error loading deck data, using fallback mode');
      } finally {
        setLoading(false);
        const totalRenderTime = Date.now() - mountTimestamp.current;
        setRenderTime(totalRenderTime);
        
        if (totalRenderTime > 150) {
          console.warn(`⚠️ DeckDetailView render time: ${totalRenderTime}ms (exceeds 150ms target)`);
        }
      }
    };

    loadDeckData();
  }, [deckId, userRole, validateZKPMetadata, checkAccessControl]);

  // Announce messages for accessibility
  const announce = useCallback((message: string) => {
    setAriaAnnouncement(message);
    console.log(`🔇 EMERGENCY TTS KILLER ACTIVATED - MESSAGE BLOCKED: "${message}"`);
  }, []);

  // Handle content actions (flag/approve)
  const handleContentAction = async (action: 'flag' | 'approve') => {
    if (!deckMetadata) return;
    
    setContentAction(action === 'flag' ? 'flagging' : 'approving');
    
    // Simulate action processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const actionMessage = action === 'flag' 
      ? `${deckMetadata.name} flagged for review`
      : `${deckMetadata.name} approved for publication`;
    
    console.log(`🎯 DeckDetailView: ${actionMessage} by ${userRole.type} (${userRole.did})`);
    announce(actionMessage);
    
    setContentAction('none');
  };

  // Handle back navigation
  const handleBack = () => {
    announce('Returning to deck index');
    console.log('🔙 DeckDetailView: Back navigation triggered');
    onBack?.();
  };

  // Get pillar icon
  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'Civic Identity': return <Users className="w-5 h-5" />;
      case 'Governance': return <Brain className="w-5 h-5" />;
      case 'Education': return <Database className="w-5 h-5" />;
      case 'Finance': return <Zap className="w-5 h-5" />;
      case 'Privacy': return <Shield className="w-5 h-5" />;
      case 'Security': return <Eye className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-400';
      case 'partial': return 'text-yellow-400';
      case 'pending': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  // Get access level color
  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'text-green-400';
      case 'restricted': return 'text-yellow-400';
      case 'private': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  // Component initialization
  useEffect(() => {
    console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
    console.log('🔄 DeckDetailView: Component initialized and ready');
    console.log(`📦 DeckDetailView: QA Envelope UUID: UUID-DDV-20250718-002`);
  }, []);

  if (loading) {
    return (
      <div className="min-w-[300px] max-w-[460px] h-auto mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6 overflow-y-auto">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <div className="text-white mb-2">Loading Deck Details</div>
          <div className="text-sm text-slate-400">
            Fetching metadata and validating ZKP...
          </div>
        </div>
      </div>
    );
  }

  if (!deckMetadata) {
    return (
      <div className="min-w-[300px] max-w-[460px] h-auto mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6 overflow-y-auto">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-400" />
          <div className="text-white mb-2">Deck Not Found</div>
          <div className="text-sm text-slate-400 mb-4">
            Unable to load deck metadata for ID: {deckId}
          </div>
          <button
            onClick={handleBack}
            className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors duration-200"
            style={{ minHeight: '48px' }}
          >
            Back to Index
          </button>
        </div>
      </div>
    );
  }

  const capabilities = getRoleCapabilities(userRole);

  return (
    <div className="min-w-[300px] max-w-[460px] h-auto mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6 overflow-y-auto">
      {/* ARIA Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {ariaAnnouncement}
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors duration-200"
            style={{ minHeight: '48px' }}
            aria-label="Back to deck index"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          
          <div className="text-xs text-slate-400">
            Phase X-B • Step 2
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-2">
            {deckMetadata.name}
          </h1>
          <div className="text-sm text-slate-400">
            Deck ID: {deckMetadata.id} • Version: {deckMetadata.version}
          </div>
        </div>
      </div>

      {/* Access Control Status */}
      {!accessGranted && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <X className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-medium text-red-400">Access Denied</h3>
          </div>
          <div className="text-xs text-red-300 mb-2">
            Insufficient permissions for {deckMetadata.accessLevel} content
          </div>
          <div className="text-xs text-red-200">
            Current role: {capabilities.label}
          </div>
        </div>
      )}

      {/* ZKP Validation Status */}
      <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">ZKP Validation</h3>
          {zkpValidating ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          ) : (
            <div className="flex items-center gap-1">
              {zkpStatus === 'valid' && <CheckCircle className="w-4 h-4 text-green-400" />}
              {zkpStatus === 'mismatch' && <AlertTriangle className="w-4 h-4 text-red-400" />}
              {zkpStatus === 'pending' && <Clock className="w-4 h-4 text-yellow-400" />}
            </div>
          )}
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className={
              zkpStatus === 'valid' ? 'text-green-400' :
              zkpStatus === 'mismatch' ? 'text-red-400' :
              'text-yellow-400'
            }>
              {zkpStatus === 'valid' ? 'Verified' :
               zkpStatus === 'mismatch' ? 'Mismatch' :
               zkpValidating ? 'Validating...' : 'Pending'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">CID:</span>
            <span className="text-white font-mono text-[10px]">
              {deckMetadata.cid.substring(0, 12)}...
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">ZKP Hash:</span>
            <span className="text-white font-mono text-[10px]">
              {deckMetadata.zkpHash.substring(0, 12)}...
            </span>
          </div>
        </div>
        
        {fallbackMode && (
          <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-600 rounded">
            <div className="text-xs text-yellow-300">
              LocalSaveLayer active (isMock=true)
            </div>
          </div>
        )}
      </div>

      {/* Deck Summary */}
      {accessGranted && (
        <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Deck Summary</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getPillarIcon(deckMetadata.pillar)}
              <span className="text-sm text-white">{deckMetadata.pillar}</span>
            </div>
            
            <div className="text-sm text-slate-300">
              {deckMetadata.description}
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-slate-400">Function:</div>
                <div className="text-white">{deckMetadata.civicFunction}</div>
              </div>
              
              <div>
                <div className="text-slate-400">User Type:</div>
                <div className="text-white">{deckMetadata.userType}</div>
              </div>
              
              <div>
                <div className="text-slate-400">Status:</div>
                <div className={getStatusColor(deckMetadata.status)}>
                  {deckMetadata.status}
                </div>
              </div>
              
              <div>
                <div className="text-slate-400">Access Level:</div>
                <div className={getAccessLevelColor(deckMetadata.accessLevel)}>
                  {deckMetadata.accessLevel}
                </div>
              </div>
              
              <div>
                <div className="text-slate-400">Updated:</div>
                <div className="text-white">{deckMetadata.lastUpdated}</div>
              </div>
              
              <div>
                <div className="text-slate-400">Author:</div>
                <div className="text-white font-mono text-[10px]">
                  {deckMetadata.authorDid.substring(0, 16)}...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module List */}
      {accessGranted && deckMetadata.modules.length > 0 && (
        <div className="mb-6 bg-slate-700 border border-slate-600 rounded-md">
          <div className="p-3 border-b border-slate-600">
            <h3 className="text-sm font-medium text-slate-300">
              Modules ({deckMetadata.modules.length})
            </h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            <ul role="list" className="divide-y divide-slate-600">
              {deckMetadata.modules.map((module) => (
                <li key={module.id} role="listitem" className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-slate-200">
                      {module.name}
                    </span>
                    <span className={`text-xs font-medium ${getStatusColor(module.status)}`}>
                      {module.status}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-400 mb-2">
                    {module.description}
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Updated:</span>
                    <span className="text-slate-300">{module.lastUpdated}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* User Role and Actions */}
      <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-3">User Access</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Current Role:</span>
            <span className="text-xs text-white">{capabilities.label}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">DID:</span>
            <span className="text-xs text-white font-mono">
              {userRole.did.substring(0, 20)}...
            </span>
          </div>
          
          {accessGranted && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {capabilities.canFlag && (
                <button
                  onClick={() => handleContentAction('flag')}
                  disabled={contentAction === 'flagging'}
                  className="flex items-center justify-center gap-1 py-2 px-3 bg-yellow-700 hover:bg-yellow-600 disabled:bg-yellow-800 text-white rounded-md transition-colors duration-200"
                  style={{ minHeight: '48px' }}
                  aria-label="Flag content for review"
                >
                  {contentAction === 'flagging' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Flag className="w-4 h-4" />
                  )}
                  <span className="text-xs">Flag</span>
                </button>
              )}
              
              {capabilities.canApprove && (
                <button
                  onClick={() => handleContentAction('approve')}
                  disabled={contentAction === 'approving'}
                  className="flex items-center justify-center gap-1 py-2 px-3 bg-green-700 hover:bg-green-600 disabled:bg-green-800 text-white rounded-md transition-colors duration-200"
                  style={{ minHeight: '48px' }}
                  aria-label="Approve content for publication"
                >
                  {contentAction === 'approving' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span className="text-xs">Approve</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="p-4 bg-slate-900 border border-slate-600 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Detail View Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Render Time:</span>
            <span className={renderTime > 150 ? 'text-red-400' : 'text-green-400'}>
              {renderTime}ms
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">ZKP Status:</span>
            <span className={
              zkpStatus === 'valid' ? 'text-green-400' :
              zkpStatus === 'mismatch' ? 'text-red-400' :
              'text-yellow-400'
            }>
              {zkpStatus}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Access Granted:</span>
            <span className={accessGranted ? 'text-green-400' : 'text-red-400'}>
              {accessGranted ? 'Yes' : 'No'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Fallback Mode:</span>
            <span className={fallbackMode ? 'text-yellow-400' : 'text-green-400'}>
              {fallbackMode ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">User Role:</span>
            <span className="text-white">{userRole.type}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Phase:</span>
            <span className="text-white">X-B Step 2</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DeckDetailView;