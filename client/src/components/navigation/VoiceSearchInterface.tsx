import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Search, Volume2 } from 'lucide-react';

interface VoiceSearchInterfaceProps {
  isDarkMode?: boolean;
  onResult?: (query: string) => void;
  onClose?: () => void;
  className?: string;
}

interface SearchResult {
  id: string;
  title: string;
  category: string;
  description: string;
  relevance: number;
}

const VoiceSearchInterface: React.FC<VoiceSearchInterfaceProps> = ({
  isDarkMode = true,
  onResult,
  onClose,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'results'>('idle');
  const [renderTime, setRenderTime] = useState(0);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const mountTimestamp = useRef(Date.now());
  const ttsOverrideRef = useRef<boolean>(true);

  // Mock search results for scaffolding
  const mockSearchResults: SearchResult[] = [
    {
      id: 'identity-overview',
      title: 'Identity Overview',
      category: 'Identity Management',
      description: 'View and manage your decentralized identity credentials',
      relevance: 95
    },
    {
      id: 'governance-proposals',
      title: 'Active Proposals',
      category: 'Governance',
      description: 'Review and vote on current civic proposals',
      relevance: 88
    },
    {
      id: 'trust-points',
      title: 'Trust Points Balance',
      category: 'Finance',
      description: 'Check your current trust points and earnings',
      relevance: 82
    },
    {
      id: 'security-audit',
      title: 'Security Audit',
      category: 'Security',
      description: 'Review your privacy and security settings',
      relevance: 76
    }
  ];

  // Handle microphone toggle
  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      setStatus('processing');
      
      // Mock processing delay
      setTimeout(() => {
        if (transcript) {
          performMockSearch(transcript);
        } else {
          setStatus('idle');
        }
      }, 1000);
    } else {
      // Start listening
      setIsListening(true);
      setStatus('listening');
      setTranscript('');
      setSearchResults([]);
      
      // Mock voice input simulation
      setTimeout(() => {
        const mockQueries = [
          'show me my identity',
          'what are my trust points',
          'governance proposals',
          'security settings'
        ];
        const randomQuery = mockQueries[Math.floor(Math.random() * mockQueries.length)];
        setTranscript(randomQuery);
      }, 2000);
    }
  };

  // Mock search function
  const performMockSearch = (query: string) => {
    const filtered = mockSearchResults.filter(result =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.category.toLowerCase().includes(query.toLowerCase()) ||
      result.description.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
    setStatus('results');
    console.log(`🧭 NAV SCAFFOLD: Voice search completed - "${query}"`);
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    onResult?.(result.title);
    console.log(`🧭 NAV SCAFFOLD: Voice result selected - ${result.title}`);
  };

  // Handle close
  const handleClose = () => {
    if (isListening) {
      setIsListening(false);
    }
    onClose?.();
  };

  // Handle manual text search
  const handleTextSearch = (query: string) => {
    setTranscript(query);
    performMockSearch(query);
  };

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Component initialization with nuclear TTS override
  useEffect(() => {
    const startTime = Date.now();
    
    // Nuclear TTS override
    if (ttsOverrideRef.current) {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
      console.log('🔇 TTS disabled: "Voice search interface initialized"');
    }

    // Nuclear override snippet - global enforcer
    const nuke = () => {
      const liveRegions = document.querySelectorAll('[aria-live], [role="alert"]');
      liveRegions.forEach(node => node.setAttribute('aria-live', 'off'));
      console.log('🔇 NUCLEAR TTS OVERRIDE: All aria-live regions disabled');
    };
    nuke();

    const totalRenderTime = Date.now() - startTime;
    setRenderTime(totalRenderTime);
    
    if (totalRenderTime > 30) {
      console.warn(`⚠️ VoiceSearchInterface render time: ${totalRenderTime}ms (exceeds 30ms target)`);
    }
    
    console.log('🧭 NAV SCAFFOLD: Voice Search Interface Online');
    
    // Cleanup on unmount
    return () => nuke();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      {/* ARIA Live Region - TTS Suppressed */}
      <div 
        aria-live="off" 
        aria-atomic="true" 
        className="sr-only"
        aria-hidden="true"
      >
        Voice search interface
      </div>

      <div 
        ref={overlayRef}
        className={`w-full max-w-lg ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'
        } border rounded-lg shadow-2xl overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                isListening 
                  ? 'bg-red-500 animate-pulse' 
                  : isDarkMode 
                    ? 'bg-slate-700' 
                    : 'bg-gray-100'
              }`}>
                <Volume2 className={`w-6 h-6 ${
                  isListening 
                    ? 'text-white' 
                    : isDarkMode 
                      ? 'text-blue-400' 
                      : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Voice Search
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Speak or type to search
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-md transition-colors ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Close voice search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voice Input Section */}
        <div className="p-6">
          {/* Microphone Button */}
          <div className="text-center mb-6">
            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full border-4 transition-all duration-300 flex items-center justify-center ${
                isListening 
                  ? 'bg-red-500 border-red-400 hover:bg-red-600 scale-110' 
                  : isDarkMode 
                    ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' 
                    : 'bg-blue-500 border-blue-400 hover:bg-blue-600'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
            
            <div className="mt-2">
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                {status === 'idle' && 'Click to start voice search'}
                {status === 'listening' && 'Listening...'}
                {status === 'processing' && 'Processing...'}
                {status === 'results' && 'Search complete'}
              </p>
            </div>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className={`p-4 rounded-lg mb-4 ${
              isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-300'
            } border`}>
              <div className="flex items-center gap-2 mb-2">
                <Search className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Transcript:
                </span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                "{transcript}"
              </p>
            </div>
          )}

          {/* Manual Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Or type your search..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && transcript.trim()) {
                  handleTextSearch(transcript.trim());
                }
              }}
              className={`w-full px-4 py-2 rounded-md border transition-colors ${
                isDarkMode 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              aria-label="Manual search input"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                Search Results
              </h3>
              
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultSelect(result)}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    isDarkMode 
                      ? 'bg-slate-700 hover:bg-slate-600 border border-slate-600' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Search result: ${result.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleResultSelect(result);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {result.title}
                      </h4>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'} mt-1`}>
                        {result.category}
                      </p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      isDarkMode ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {result.relevance}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {status === 'results' && searchResults.length === 0 && (
            <div className="text-center py-8">
              <Search className={`w-12 h-12 mx-auto mb-4 ${
                isDarkMode ? 'text-slate-500' : 'text-gray-400'
              }`} />
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                No results found for "{transcript}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between text-xs">
            <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
              Scaffolding: No API connection
            </span>
            <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
              Render: {renderTime}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSearchInterface;