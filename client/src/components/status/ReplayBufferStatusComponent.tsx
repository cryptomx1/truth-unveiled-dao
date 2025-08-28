import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Clock, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useOfflineReplayBuffer } from '../../hooks/useOfflineReplayBuffer';

interface ReplayBufferStatusComponentProps {
  className?: string;
}

export const ReplayBufferStatusComponent: React.FC<ReplayBufferStatusComponentProps> = ({
  className = ''
}) => {
  const { 
    isOnline, 
    queueLength, 
    isProcessing, 
    getQueueStatus, 
    flushQueue, 
    clearQueue 
  } = useOfflineReplayBuffer();
  
  const [showDetails, setShowDetails] = useState(false);
  const [lastAnnouncedStatus, setLastAnnouncedStatus] = useState('');
  const { pending, failed } = getQueueStatus();

  // Determine status and styling
  const hasQueuedActions = queueLength > 0;
  const statusColor = isOnline ? 
    (hasQueuedActions ? 'text-amber-400' : 'text-green-400') : 
    'text-red-400';
  
  const bgColor = isOnline ?
    (hasQueuedActions ? 'bg-amber-900/20' : 'bg-green-900/20') :
    'bg-red-900/20';

  const borderColor = isOnline ?
    (hasQueuedActions ? 'border-amber-500/30' : 'border-green-500/30') :
    'border-red-500/30';

  // Status message
  const getStatusMessage = () => {
    if (!isOnline) {
      return `Offline - ${queueLength} Actions Queued`;
    }
    if (isProcessing) {
      return 'Syncing Actions...';
    }
    if (hasQueuedActions) {
      return `${queueLength} Actions Pending Sync`;
    }
    return 'All Actions Synced';
  };

  // Status icon
  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="w-4 h-4" />;
    }
    if (isProcessing) {
      return <Clock className="w-4 h-4 animate-spin" />;
    }
    if (hasQueuedActions) {
      return <AlertCircle className="w-4 h-4" />;
    }
    return <CheckCircle className="w-4 h-4" />;
  };

  // ARIA live region announcements
  useEffect(() => {
    const currentStatus = getStatusMessage();
    if (currentStatus !== lastAnnouncedStatus) {
      setLastAnnouncedStatus(currentStatus);
      
      // Key status changes to announce
      if (!isOnline && queueLength > 0) {
        console.log('📣 ARIA: Replay queue activation detected');
      } else if (isOnline && queueLength === 0 && lastAnnouncedStatus.includes('Queued')) {
        console.log('📣 ARIA: Queue flush on reconnect completed');
      }
    }
  }, [isOnline, queueLength, isProcessing, lastAnnouncedStatus]);

  // Handle manual flush
  const handleFlush = async () => {
    if (isOnline && queueLength > 0) {
      await flushQueue();
    }
  };

  // Main status indicator
  const statusIndicator = (
    <div 
      className={`
        fixed bottom-4 left-4 z-50 
        ${bgColor} ${borderColor} border
        text-white rounded-lg px-3 py-2 text-xs font-medium
        cursor-pointer transition-all duration-200 hover:scale-105
        ${hasQueuedActions ? 'animate-pulse' : ''}
        ${className}
      `}
      onClick={() => setShowDetails(!showDetails)}
      role="button"
      tabIndex={0}
      aria-label={`Replay buffer status: ${getStatusMessage()}`}
      aria-live="polite"
      aria-expanded={showDetails}
    >
      <div className="flex items-center space-x-2">
        <span className={statusColor}>
          {getStatusIcon()}
        </span>
        <span className={statusColor}>
          {hasQueuedActions ? `🔴 ${getStatusMessage()}` : '🟢 All Actions Synced'}
        </span>
      </div>
    </div>
  );

  // Detailed view overlay
  const detailsOverlay = showDetails && (
    <div className="fixed bottom-16 left-4 z-50 bg-slate-800 border border-slate-700 rounded-lg p-4 text-white text-xs min-w-72 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Replay Buffer Status</h3>
        <button
          onClick={() => setShowDetails(false)}
          className="text-slate-400 hover:text-white"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Connection:</span>
          <div className="flex items-center space-x-1">
            {isOnline ? <Wifi className="w-3 h-3 text-green-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
            <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Queue Statistics */}
        <div className="border-t border-slate-700 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Total Queued:</span>
            <span className="text-white font-medium">{queueLength}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Pending:</span>
            <span className="text-amber-400">{pending}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Failed/Retry:</span>
            <span className="text-red-400">{failed}</span>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="border-t border-slate-700 pt-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-blue-400 animate-spin" />
              <span className="text-blue-400">Processing queue...</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {queueLength > 0 && (
          <div className="border-t border-slate-700 pt-2 flex space-x-2">
            {isOnline && (
              <button
                onClick={handleFlush}
                disabled={isProcessing}
                className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded text-xs transition-colors"
              >
                {isProcessing ? 'Syncing...' : 'Flush Now'}
              </button>
            )}
            <button
              onClick={clearQueue}
              className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
            >
              Clear Queue
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ARIA Live Region for Status Announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {getStatusMessage()}
      </div>
      
      {statusIndicator}
      {detailsOverlay}
    </>
  );
};