import React, { useState, useEffect, useRef } from 'react';
import { Filter, X, Check, Grid, List, Star, Clock, Shield, Users } from 'lucide-react';

interface RegistrySmartFilterProps {
  isDarkMode?: boolean;
  onFilterChange?: (filterType: string, value: any) => void;
  onClose?: () => void;
  className?: string;
}

interface FilterOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
}

const RegistrySmartFilter: React.FC<RegistrySmartFilterProps> = ({
  isDarkMode = true,
  onFilterChange,
  onClose,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilters, setTypeFilters] = useState<FilterOption[]>([
    { id: 'identity', label: 'Identity', icon: <Users className="w-4 h-4" />, selected: false },
    { id: 'governance', label: 'Governance', icon: <Shield className="w-4 h-4" />, selected: false },
    { id: 'finance', label: 'Finance', icon: <Star className="w-4 h-4" />, selected: false },
    { id: 'education', label: 'Education', icon: <Clock className="w-4 h-4" />, selected: false },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" />, selected: false }
  ]);
  const [engagementFilters, setEngagementFilters] = useState<FilterOption[]>([
    { id: 'high', label: 'High Engagement', icon: <Star className="w-4 h-4" />, selected: false },
    { id: 'medium', label: 'Medium Engagement', icon: <Clock className="w-4 h-4" />, selected: false },
    { id: 'low', label: 'Low Engagement', icon: <Users className="w-4 h-4" />, selected: false }
  ]);
  const [renderTime, setRenderTime] = useState(0);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const mountTimestamp = useRef(Date.now());
  const ttsOverrideRef = useRef<boolean>(true);

  // Handle type filter toggle
  const toggleTypeFilter = (filterId: string) => {
    setTypeFilters(prev => prev.map(filter => 
      filter.id === filterId 
        ? { ...filter, selected: !filter.selected }
        : filter
    ));
    
    const filter = typeFilters.find(f => f.id === filterId);
    if (filter) {
      onFilterChange?.('type', { id: filterId, selected: !filter.selected });
      console.log(`🧭 NAV SCAFFOLD: Type filter ${filterId} ${!filter.selected ? 'enabled' : 'disabled'}`);
    }
  };

  // Handle engagement filter toggle
  const toggleEngagementFilter = (filterId: string) => {
    setEngagementFilters(prev => prev.map(filter => 
      filter.id === filterId 
        ? { ...filter, selected: !filter.selected }
        : filter
    ));
    
    const filter = engagementFilters.find(f => f.id === filterId);
    if (filter) {
      onFilterChange?.('engagement', { id: filterId, selected: !filter.selected });
      console.log(`🧭 NAV SCAFFOLD: Engagement filter ${filterId} ${!filter.selected ? 'enabled' : 'disabled'}`);
    }
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    onFilterChange?.('viewMode', mode);
    console.log(`🧭 NAV SCAFFOLD: View mode changed to ${mode}`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setTypeFilters(prev => prev.map(filter => ({ ...filter, selected: false })));
    setEngagementFilters(prev => prev.map(filter => ({ ...filter, selected: false })));
    onFilterChange?.('clear', null);
    console.log('🧭 NAV SCAFFOLD: All filters cleared');
  };

  // Handle close
  const handleClose = () => {
    onClose?.();
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return typeFilters.filter(f => f.selected).length + 
           engagementFilters.filter(f => f.selected).length;
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
      console.log('🔇 TTS disabled: "Registry smart filter initialized"');
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
      console.warn(`⚠️ RegistrySmartFilter render time: ${totalRenderTime}ms (exceeds 30ms target)`);
    }
    
    console.log('🧭 NAV SCAFFOLD: Registry Smart Filter Online');
    
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
        Registry smart filter panel
      </div>

      <div 
        ref={overlayRef}
        className={`w-full max-w-md ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'
        } border rounded-lg shadow-2xl overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <Filter className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Smart Filter
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {getActiveFilterCount()} active filters
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
              aria-label="Close filter panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="p-4 space-y-6">
          {/* View Mode Toggle */}
          <div>
            <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              View Mode
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                    : isDarkMode 
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
                <span className="text-sm">Grid</span>
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                    : isDarkMode 
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
                <span className="text-sm">List</span>
              </button>
            </div>
          </div>

          {/* Type Filters */}
          <div>
            <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Filter by Type
            </h3>
            <div className="space-y-2">
              {typeFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => toggleTypeFilter(filter.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-md transition-colors ${
                    filter.selected
                      ? isDarkMode 
                        ? 'bg-blue-900/50 border-blue-500 border' 
                        : 'bg-blue-50 border-blue-500 border'
                      : isDarkMode 
                        ? 'bg-slate-700 border-slate-600 border hover:bg-slate-600' 
                        : 'bg-gray-50 border-gray-200 border hover:bg-gray-100'
                  }`}
                  aria-label={`Filter by ${filter.label}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={filter.selected 
                      ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      : isDarkMode ? 'text-slate-400' : 'text-gray-500'
                    }>
                      {filter.icon}
                    </div>
                    <span className={`text-sm ${
                      filter.selected 
                        ? isDarkMode ? 'text-white' : 'text-gray-900'
                        : isDarkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      {filter.label}
                    </span>
                  </div>
                  {filter.selected && (
                    <Check className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Engagement Filters */}
          <div>
            <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Filter by Engagement
            </h3>
            <div className="space-y-2">
              {engagementFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => toggleEngagementFilter(filter.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-md transition-colors ${
                    filter.selected
                      ? isDarkMode 
                        ? 'bg-green-900/50 border-green-500 border' 
                        : 'bg-green-50 border-green-500 border'
                      : isDarkMode 
                        ? 'bg-slate-700 border-slate-600 border hover:bg-slate-600' 
                        : 'bg-gray-50 border-gray-200 border hover:bg-gray-100'
                  }`}
                  aria-label={`Filter by ${filter.label}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={filter.selected 
                      ? isDarkMode ? 'text-green-400' : 'text-green-600'
                      : isDarkMode ? 'text-slate-400' : 'text-gray-500'
                    }>
                      {filter.icon}
                    </div>
                    <span className={`text-sm ${
                      filter.selected 
                        ? isDarkMode ? 'text-white' : 'text-gray-900'
                        : isDarkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      {filter.label}
                    </span>
                  </div>
                  {filter.selected && (
                    <Check className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={clearAllFilters}
              disabled={getActiveFilterCount() === 0}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                getActiveFilterCount() === 0
                  ? isDarkMode 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isDarkMode 
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Clear all filters"
            >
              Clear All
            </button>
            
            <div className="flex items-center gap-4 text-xs">
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                Render: {renderTime}ms
              </span>
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                Fallback Mode
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrySmartFilter;