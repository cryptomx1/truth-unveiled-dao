import React, { useState, useEffect, useRef, useCallback } from 'react';
import { History, ChevronDown, ChevronUp, Shield, Calendar, MessageSquare, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface TrustEvent {
  id: string;
  timestamp: number;
  type: 'poll_response' | 'confirmation' | 'validation' | 'feedback' | 'referral' | 'penalty';
  description: string;
  trustChange: number;
  zkpHash: string;
  verified: boolean;
  metadata?: {
    proposalId?: string;
    referralId?: string;
    validatorDid?: string;
  };
}

interface TrustHistoryOverlayProps {
  className?: string;
  userDid?: string;
  isVisible?: boolean;
  onClose?: () => void;
  onEventSelect?: (event: TrustEvent) => void;
}

const TrustHistoryOverlay: React.FC<TrustHistoryOverlayProps> = ({
  className = '',
  userDid = 'did:civic:trust_history_001',
  isVisible = false,
  onClose,
  onEventSelect
}) => {
  const [trustEvents, setTrustEvents] = useState<TrustEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TrustEvent | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [zkpValidated, setZkpValidated] = useState(false);
  const [pathBActive, setPathBActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renderTime, setRenderTime] = useState(0);
  const [filterType, setFilterType] = useState<TrustEvent['type'] | 'all'>('all');
  
  const mountTimestamp = useRef(Date.now());
  const ttsOverrideRef = useRef<boolean>(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Generate mock trust events
  const generateTrustEvents = useCallback((): TrustEvent[] => {
    const types: TrustEvent['type'][] = ['poll_response', 'confirmation', 'validation', 'feedback', 'referral', 'penalty'];
    const events: TrustEvent[] = [];
    
    for (let i = 0; i < 15; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const timestamp = Date.now() - (i * 24 * 60 * 60 * 1000); // Spread over 15 days
      
      const trustChanges = {
        poll_response: [5, 8, 12],
        confirmation: [3, 5, 8],
        validation: [10, 15, 20],
        feedback: [2, 4, 6],
        referral: [8, 12, 15],
        penalty: [-5, -10, -15]
      };
      
      const descriptions = {
        poll_response: 'Civic poll participation',
        confirmation: 'Action confirmation',
        validation: 'ZKP validation completed',
        feedback: 'Community feedback submitted',
        referral: 'Successful referral',
        penalty: 'Trust penalty applied'
      };
      
      const possibleChanges = trustChanges[type];
      const trustChange = possibleChanges[Math.floor(Math.random() * possibleChanges.length)];
      
      events.push({
        id: `event_${i}`,
        timestamp,
        type,
        description: descriptions[type],
        trustChange,
        zkpHash: `zkp_event_${Math.random().toString(36).substring(7)}`,
        verified: Math.random() > 0.1, // 90% verification rate
        metadata: {
          proposalId: type === 'poll_response' ? `prop_${Math.random().toString(36).substring(7)}` : undefined,
          referralId: type === 'referral' ? `ref_${Math.random().toString(36).substring(7)}` : undefined,
          validatorDid: type === 'validation' ? `did:civic:validator_${Math.random().toString(36).substring(7)}` : undefined
        }
      });
    }
    
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  // ZKP validation simulation
  const validateZKPHistory = useCallback(async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate validation failure for Path B testing (15% chance)
    const validationSuccess = Math.random() > 0.15;
    
    if (validationSuccess) {
      console.log('🔐 TrustHistoryOverlay: ZKP validation successful');
      return true;
    } else {
      console.log('🛑 TrustHistoryOverlay: ZKP validation failed - activating Path B');
      return false;
    }
  }, []);

  // Load trust history
  const loadTrustHistory = useCallback(async () => {
    if (!isVisible) return;
    
    setLoading(true);
    
    try {
      const isValid = await validateZKPHistory();
      setZkpValidated(isValid);
      
      if (!isValid) {
        setPathBActive(true);
        console.log('💾 TrustHistoryOverlay: Using cached history data (Path B)');
      }
      
      const events = generateTrustEvents();
      setTrustEvents(events);
      
    } catch (error) {
      console.error('❌ TrustHistoryOverlay: History load failed:', error);
      setPathBActive(true);
    } finally {
      setLoading(false);
    }
  }, [isVisible, validateZKPHistory, generateTrustEvents]);

  // Get event icon
  const getEventIcon = (type: TrustEvent['type']) => {
    switch (type) {
      case 'poll_response': return <MessageSquare className="w-4 h-4" />;
      case 'confirmation': return <CheckCircle className="w-4 h-4" />;
      case 'validation': return <Shield className="w-4 h-4" />;
      case 'feedback': return <MessageSquare className="w-4 h-4" />;
      case 'referral': return <CheckCircle className="w-4 h-4" />;
      case 'penalty': return <AlertTriangle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  // Get event color
  const getEventColor = (type: TrustEvent['type'], trustChange: number) => {
    if (trustChange > 0) return 'text-green-400';
    if (trustChange < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Handle event selection
  const handleEventSelect = (event: TrustEvent) => {
    setSelectedEvent(event);
    onEventSelect?.(event);
  };

  // Handle expand/collapse
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle close
  const handleClose = () => {
    setSelectedEvent(null);
    setIsExpanded(false);
    onClose?.();
  };

  // Filter events
  const filteredEvents = trustEvents.filter(event => 
    filterType === 'all' || event.type === filterType
  );

  // Component initialization with nuclear TTS override
  useEffect(() => {
    const startTime = Date.now();
    
    // Nuclear TTS override
    if (ttsOverrideRef.current) {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
      console.log('🔇 TTS disabled: "Trust history overlay initialized"');
    }

    // Nuclear override snippet - global enforcer
    const nuke = () => {
      const liveRegions = document.querySelectorAll('[aria-live], [role="alert"]');
      liveRegions.forEach(node => node.setAttribute('aria-live', 'off'));
      console.log('🔇 NUCLEAR TTS OVERRIDE: All aria-live regions disabled');
    };
    nuke();

    loadTrustHistory();
    
    const totalRenderTime = Date.now() - startTime;
    setRenderTime(totalRenderTime);
    
    if (totalRenderTime > 30) {
      console.warn(`⚠️ TrustHistoryOverlay render time: ${totalRenderTime}ms (exceeds 30ms target)`);
    }
    
    console.log('🧠 TRUST SYNC: History Overlay Active');
    
    // Handle outside clicks
    const handleOutsideClick = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    
    if (isVisible) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      nuke();
    };
  }, [isVisible, loadTrustHistory]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div 
        ref={overlayRef}
        className={`w-full max-w-2xl max-h-[90vh] bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden ${className}`}
      >
        {/* ARIA Live Region - TTS Suppressed */}
        <div 
          aria-live="off" 
          aria-atomic="true" 
          className="sr-only"
          aria-hidden="true"
        >
          Trust history overlay status
        </div>

        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Trust History
              </h2>
              <div className="text-sm text-slate-400 space-y-1">
                <div>Phase X-D • Step 2 • Historical Events</div>
                <div>ZKP Validated • Expandable Overlay</div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              aria-label="Close trust history overlay"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status */}
          <div className="mt-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400">ZKP Validation:</span>
              <span className={zkpValidated ? 'text-green-400' : 'text-red-400'}>
                {zkpValidated ? 'Verified' : 'Failed'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400">Events Loaded:</span>
              <span className="text-slate-300">{trustEvents.length}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Render Time:</span>
              <span className="text-slate-300">{renderTime}ms</span>
            </div>
            
            {pathBActive && (
              <div className="flex items-center gap-2 mt-2 text-xs text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                <span>Path B: Using cached data</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All ({trustEvents.length})
            </button>
            {['poll_response', 'confirmation', 'validation', 'feedback', 'referral', 'penalty'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type as TrustEvent['type'])}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {type.replace('_', ' ')} ({trustEvents.filter(e => e.type === type).length})
              </button>
            ))}
          </div>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-sm text-slate-400">Loading trust history...</div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {filteredEvents.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => handleEventSelect(event)}
                  className={`p-4 hover:bg-slate-700 cursor-pointer transition-colors ${
                    selectedEvent?.id === event.id ? 'bg-slate-700' : ''
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Trust event: ${event.description}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${getEventColor(event.type, event.trustChange)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-slate-300">{event.description}</span>
                          {event.verified && (
                            <Shield className="w-3 h-3 text-green-400" />
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mb-2">
                          {formatTimestamp(event.timestamp)}
                        </div>
                        {selectedEvent?.id === event.id && (
                          <div className="mt-2 p-2 bg-slate-600 rounded text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">ZKP Hash:</span>
                              <span className="text-slate-300 font-mono">{event.zkpHash}</span>
                            </div>
                            {event.metadata?.proposalId && (
                              <div className="flex justify-between">
                                <span className="text-slate-400">Proposal ID:</span>
                                <span className="text-slate-300 font-mono">{event.metadata.proposalId}</span>
                              </div>
                            )}
                            {event.metadata?.referralId && (
                              <div className="flex justify-between">
                                <span className="text-slate-400">Referral ID:</span>
                                <span className="text-slate-300 font-mono">{event.metadata.referralId}</span>
                              </div>
                            )}
                            {event.metadata?.validatorDid && (
                              <div className="flex justify-between">
                                <span className="text-slate-400">Validator DID:</span>
                                <span className="text-slate-300 font-mono">{event.metadata.validatorDid}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${getEventColor(event.type, event.trustChange)}`}>
                      {event.trustChange > 0 ? '+' : ''}{event.trustChange}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div className="text-sm">No trust events found</div>
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={toggleExpanded}
            className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-center gap-2"
            style={{ minHeight: '48px' }}
            aria-label={isExpanded ? 'Collapse overlay' : 'Expand overlay'}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Expand Details
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrustHistoryOverlay;