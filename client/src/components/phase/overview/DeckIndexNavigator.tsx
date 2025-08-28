// Phase X-B Step 1: DeckIndexNavigator.tsx (REVISED)
// Commander Mark authorization via JASMY Relay System
// Categorized search, backlink system, federated AI search, ARIA navigation, Path B fallback

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { protocolValidator } from '@/utils/ProtocolValidator';
import { 
  Search, 
  Filter, 
  ArrowLeft, 
  Home, 
  SkipForward, 
  Brain, 
  Users, 
  Shield, 
  Zap, 
  Globe, 
  Eye, 
  MapPin, 
  Database,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export interface DeckEntry {
  id: number;
  name: string;
  pillar: string;
  civicFunction: string;
  userType: string;
  description: string;
  modules: number;
  status: 'complete' | 'partial' | 'pending';
  lastUpdated: string;
}

export interface DeckIndexNavigatorProps {
  decks?: DeckEntry[];
  onDeckSelect?: (deckId: number) => void;
  onPillarJump?: (pillar: string) => void;
  onLatestJump?: () => void;
  onReturn?: () => void;
}

export default function DeckIndexNavigator({
  decks = [],
  onDeckSelect,
  onPillarJump,
  onLatestJump,
  onReturn
}: DeckIndexNavigatorProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [selectedPillar, setSelectedPillar] = useState<string>('All');
  const [selectedCivicFunction, setSelectedCivicFunction] = useState<string>('All');
  const [selectedUserType, setSelectedUserType] = useState<string>('All');
  const [filteredDecks, setFilteredDecks] = useState<DeckEntry[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [federatedSearchActive, setFederatedSearchActive] = useState(false);
  const [pathBTriggered, setPathBTriggered] = useState(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');
  
  const mountTimestamp = useRef<number>(Date.now());
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Generate default deck data if none provided
  const getDefaultDecks = (): DeckEntry[] => {
    return [
      {
        id: 1,
        name: 'WalletOverviewDeck',
        pillar: 'Civic Identity',
        civicFunction: 'Identity Management',
        userType: 'All Users',
        description: 'Decentralized identity and wallet overview',
        modules: 4,
        status: 'complete',
        lastUpdated: '2025-07-18'
      },
      {
        id: 2,
        name: 'GovernanceDeck',
        pillar: 'Governance',
        civicFunction: 'Voting & Proposals',
        userType: 'Citizens',
        description: 'Civic proposal voting and governance',
        modules: 3,
        status: 'complete',
        lastUpdated: '2025-07-17'
      },
      {
        id: 3,
        name: 'EducationDeck',
        pillar: 'Education',
        civicFunction: 'Learning & Assessment',
        userType: 'Students',
        description: 'Civic education and knowledge sharing',
        modules: 4,
        status: 'complete',
        lastUpdated: '2025-07-16'
      },
      {
        id: 4,
        name: 'FinanceDeck',
        pillar: 'Finance',
        civicFunction: 'Rewards & Transactions',
        userType: 'Contributors',
        description: 'Truth Points and financial management',
        modules: 4,
        status: 'complete',
        lastUpdated: '2025-07-15'
      },
      {
        id: 5,
        name: 'PrivacyDeck',
        pillar: 'Privacy',
        civicFunction: 'Data Protection',
        userType: 'Privacy-Conscious',
        description: 'Zero-knowledge privacy and encryption',
        modules: 4,
        status: 'complete',
        lastUpdated: '2025-07-14'
      },
      {
        id: 6,
        name: 'SecureAssetsDeck',
        pillar: 'Security',
        civicFunction: 'Asset Management',
        userType: 'Asset Holders',
        description: 'Secure asset storage and transfer',
        modules: 4,
        status: 'complete',
        lastUpdated: '2025-07-13'
      },
      {
        id: 7,
        name: 'CivicAuditDeck',
        pillar: 'Security',
        civicFunction: 'Audit & Verification',
        userType: 'Auditors',
        description: 'Civic audit and verification systems',
        modules: 4,
        status: 'complete',
        lastUpdated: '2025-07-12'
      },
      {
        id: 8,
        name: 'ConsensusLayerDeck',
        pillar: 'Governance',
        civicFunction: 'Consensus Building',
        userType: 'Delegates',
        description: 'Consensus mechanisms and deliberation',
        modules: 4,
        status: 'complete',
        lastUpdated: '2025-07-11'
      },
      {
        id: 9,
        name: 'GovernanceFeedbackDeck',
        pillar: 'Governance',
        civicFunction: 'Feedback & Sentiment',
        userType: 'Citizens',
        description: 'Governance feedback and sentiment analysis',
        modules: 3,
        status: 'partial',
        lastUpdated: '2025-07-10'
      },
      {
        id: 10,
        name: 'CivicEngagementDeck',
        pillar: 'Education',
        civicFunction: 'Engagement Tracking',
        userType: 'Active Citizens',
        description: 'Civic engagement and reputation tracking',
        modules: 4,
        status: 'complete',
        lastUpdated: '2025-07-09'
      }
    ];
  };

  const activeDecks = decks.length > 0 ? decks : getDefaultDecks();

  const pillars = ['All', 'Civic Identity', 'Governance', 'Education', 'Finance', 'Privacy', 'Security'];
  const civicFunctions = [
    'All', 'Identity Management', 'Voting & Proposals', 'Learning & Assessment', 
    'Rewards & Transactions', 'Data Protection', 'Asset Management', 'Audit & Verification',
    'Consensus Building', 'Feedback & Sentiment', 'Engagement Tracking'
  ];
  const userTypes = ['All', 'All Users', 'Citizens', 'Students', 'Contributors', 'Privacy-Conscious', 'Asset Holders', 'Auditors', 'Delegates', 'Active Citizens'];

  // Announce messages (TTS simulation)
  const announce = useCallback((message: string) => {
    setAriaAnnouncement(message);
    console.log(`🔇 EMERGENCY TTS KILLER ACTIVATED - MESSAGE BLOCKED: "${message}"`);
  }, []);

  // Debounced search implementation
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Filter decks based on search and filters
  useEffect(() => {
    let filtered = activeDecks;

    // Apply search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(deck =>
        deck.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        deck.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        deck.pillar.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Apply pillar filter
    if (selectedPillar !== 'All') {
      filtered = filtered.filter(deck => deck.pillar === selectedPillar);
    }

    // Apply civic function filter
    if (selectedCivicFunction !== 'All') {
      filtered = filtered.filter(deck => deck.civicFunction === selectedCivicFunction);
    }

    // Apply user type filter
    if (selectedUserType !== 'All') {
      filtered = filtered.filter(deck => deck.userType === selectedUserType);
    }

    setFilteredDecks(filtered);
    setFocusedIndex(-1); // Reset focus when filters change

    // Check for Path B trigger (empty results)
    if (filtered.length === 0 && (debouncedSearchTerm || selectedPillar !== 'All' || selectedCivicFunction !== 'All' || selectedUserType !== 'All')) {
      setPathBTriggered(true);
      setFederatedSearchActive(true);
      console.log('⚠️ DeckIndexNavigator: Path B triggered - no results found, activating federated search');
      announce('No decks found, activating federated search');
    } else {
      setPathBTriggered(false);
      setFederatedSearchActive(false);
    }

    // Announce filter results
    if (filtered.length !== activeDecks.length) {
      announce(`${filtered.length} decks found`);
    }
  }, [debouncedSearchTerm, selectedPillar, selectedCivicFunction, selectedUserType, activeDecks, announce]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setSearchTerm('');
      setSelectedPillar('All');
      setSelectedCivicFunction('All');
      setSelectedUserType('All');
      setFocusedIndex(-1);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Toggle TTS system
  const toggleTTS = () => {
    const newState = !ttsEnabled;
    setTtsEnabled(newState);
    
    const message = newState ? 'TTS system enabled' : 'TTS system disabled';
    announce(message);
    
    console.log(`🔇 DeckIndexNavigator: TTS toggle - ${message}`);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredDecks.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredDecks.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredDecks.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleDeckSelect(filteredDecks[focusedIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setFocusedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Handle deck selection
  const handleDeckSelect = (deckId: number) => {
    const deck = filteredDecks.find(d => d.id === deckId);
    if (deck) {
      announce(`Selected ${deck.name}`);
      console.log(`📋 DeckIndexNavigator: Deck selected - ${deck.name} (ID: ${deckId})`);
      onDeckSelect?.(deckId);
    }
  };

  // Handle backlink actions
  const handleReturn = () => {
    announce('Returning to previous view');
    console.log('🔙 DeckIndexNavigator: Return action triggered');
    onReturn?.();
  };

  const handlePillarJump = (pillar: string) => {
    announce(`Jumping to ${pillar} pillar`);
    console.log(`🎯 DeckIndexNavigator: Pillar jump - ${pillar}`);
    onPillarJump?.(pillar);
  };

  const handleLatestJump = () => {
    announce('Jumping to latest updates');
    console.log('⚡ DeckIndexNavigator: Latest jump triggered');
    onLatestJump?.();
  };

  // Get pillar icon
  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'Civic Identity': return <Users className="w-4 h-4" />;
      case 'Governance': return <Brain className="w-4 h-4" />;
      case 'Education': return <Database className="w-4 h-4" />;
      case 'Finance': return <Zap className="w-4 h-4" />;
      case 'Privacy': return <Shield className="w-4 h-4" />;
      case 'Security': return <Eye className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
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

  // Component initialization
  useEffect(() => {
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 150) {
      console.warn(`⚠️ DeckIndexNavigator render time: ${renderTime}ms (exceeds 150ms target)`);
    }

    // Nuclear TTS override
    console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
    announce('Deck index navigator ready');
    
    console.log('🔄 DeckIndexNavigator: Component initialized and ready');
    console.log(`📦 DeckIndexNavigator: QA Envelope UUID: UUID-DIN-20250718-001`);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* ARIA Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {ariaAnnouncement}
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Deck Index Navigator
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase X-B • Step 1 • Categorized Search</div>
          <div>Decks: {activeDecks.length} • Filtered: {filteredDecks.length}</div>
        </div>
      </div>

      {/* Backlink System */}
      <div className="mb-6 space-y-3">
        <h3 className="text-sm font-medium text-slate-300">Navigation</h3>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleReturn}
            className="py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors duration-200 flex items-center justify-center gap-1"
            style={{ minHeight: '48px' }}
            aria-label="Return to previous view"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">Return</span>
          </button>
          
          <button
            onClick={() => handlePillarJump(selectedPillar)}
            className="py-2 px-3 bg-purple-700 hover:bg-purple-600 text-white rounded-md transition-colors duration-200 flex items-center justify-center gap-1"
            style={{ minHeight: '48px' }}
            aria-label="Jump to pillar root"
          >
            <Home className="w-4 h-4" />
            <span className="text-xs">Pillar</span>
          </button>
          
          <button
            onClick={handleLatestJump}
            className="py-2 px-3 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors duration-200 flex items-center justify-center gap-1"
            style={{ minHeight: '48px' }}
            aria-label="Jump to latest updates"
          >
            <SkipForward className="w-4 h-4" />
            <span className="text-xs">Latest</span>
          </button>
        </div>
      </div>

      {/* TTS Control */}
      <div className="mb-6 p-3 bg-slate-700 border border-slate-600 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {ttsEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="text-sm text-slate-300">TTS System</span>
          </div>
          <button
            onClick={toggleTTS}
            className={`py-1 px-3 rounded text-xs font-medium transition-colors duration-200 ${
              ttsEnabled ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300'
            }`}
            style={{ minHeight: '32px' }}
            aria-label={`${ttsEnabled ? 'Disable' : 'Enable'} TTS`}
          >
            {ttsEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6 space-y-3">
        <h3 className="text-sm font-medium text-slate-300">Search & Filters</h3>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search decks..."
            className="w-full pl-10 pr-4 py-3 bg-slate-600 border border-slate-500 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ minHeight: '48px' }}
            onKeyDown={handleKeyDown}
            aria-label="Search decks"
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <select
            value={selectedPillar}
            onChange={(e) => setSelectedPillar(e.target.value)}
            className="w-full p-3 bg-slate-600 border border-slate-500 rounded-md text-white"
            style={{ minHeight: '48px' }}
            aria-label="Filter by pillar"
          >
            {pillars.map(pillar => (
              <option key={pillar} value={pillar}>Pillar: {pillar}</option>
            ))}
          </select>
          
          <select
            value={selectedCivicFunction}
            onChange={(e) => setSelectedCivicFunction(e.target.value)}
            className="w-full p-3 bg-slate-600 border border-slate-500 rounded-md text-white"
            style={{ minHeight: '48px' }}
            aria-label="Filter by civic function"
          >
            {civicFunctions.map(func => (
              <option key={func} value={func}>Function: {func}</option>
            ))}
          </select>
          
          <select
            value={selectedUserType}
            onChange={(e) => setSelectedUserType(e.target.value)}
            className="w-full p-3 bg-slate-600 border border-slate-500 rounded-md text-white"
            style={{ minHeight: '48px' }}
            aria-label="Filter by user type"
          >
            {userTypes.map(type => (
              <option key={type} value={type}>User: {type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Federated Search Status */}
      {federatedSearchActive && (
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-blue-400">Federated AI Search</h3>
          </div>
          <div className="text-xs text-blue-300">
            Fallback to KnowledgeAtlasPanel.tsx - searching external knowledge sources
          </div>
        </div>
      )}

      {/* Path B Alert */}
      {pathBTriggered && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-medium text-red-400">Path B Triggered</h3>
          </div>
          <div className="text-xs text-red-300">
            No matching decks found. Activating federated search fallback.
          </div>
        </div>
      )}

      {/* Deck List */}
      <div className="mb-6 bg-slate-700 border border-slate-600 rounded-md">
        <div className="p-3 border-b border-slate-600 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">
            Available Decks ({filteredDecks.length})
          </h3>
          {filteredDecks.length > 0 && (
            <div className="text-xs text-slate-400">
              Use ↑↓ keys to navigate
            </div>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredDecks.length > 0 ? (
            <ul 
              ref={listRef}
              role="list" 
              aria-live="polite"
              className="divide-y divide-slate-600"
            >
              {filteredDecks.map((deck, index) => {
                const pillarIcon = getPillarIcon(deck.pillar);
                const statusColor = getStatusColor(deck.status);
                const isFocused = index === focusedIndex;
                
                return (
                  <li 
                    key={deck.id} 
                    role="listitem"
                    className={`p-3 cursor-pointer transition-colors duration-200 ${
                      isFocused ? 'bg-blue-600/20 ring-2 ring-blue-500' : 'hover:bg-slate-600'
                    }`}
                    onClick={() => handleDeckSelect(deck.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDeckSelect(deck.id);
                      }
                    }}
                    aria-label={`${deck.name} - ${deck.description}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {pillarIcon}
                        <span className="text-sm font-medium text-slate-200">
                          {deck.name}
                        </span>
                        <span className={`text-xs font-medium ${statusColor}`}>
                          {deck.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        {deck.modules} modules
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="text-slate-400">{deck.description}</div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pillar:</span>
                        <span className="text-slate-300">{deck.pillar}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-500">Function:</span>
                        <span className="text-slate-300">{deck.civicFunction}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-500">User Type:</span>
                        <span className="text-slate-300">{deck.userType}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-500">Updated:</span>
                        <span className="text-slate-300">{deck.lastUpdated}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <div className="text-sm text-slate-400 mb-2">No decks found</div>
              <div className="text-xs text-slate-500">
                Try adjusting your search terms or filters
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="p-4 bg-slate-900 border border-slate-600 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Navigator Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">TTS System:</span>
            <span className={ttsEnabled ? 'text-blue-400' : 'text-slate-400'}>
              {ttsEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Active Pillar:</span>
            <span className="text-white">{selectedPillar}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Search Term:</span>
            <span className="text-white">{debouncedSearchTerm || 'None'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Total Decks:</span>
            <span className="text-white">{activeDecks.length}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Filtered Results:</span>
            <span className="text-white">{filteredDecks.length}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Federated Search:</span>
            <span className={federatedSearchActive ? 'text-blue-400' : 'text-slate-400'}>
              {federatedSearchActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Path B Status:</span>
            <span className={pathBTriggered ? 'text-red-400' : 'text-green-400'}>
              {pathBTriggered ? 'Triggered' : 'Normal'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}