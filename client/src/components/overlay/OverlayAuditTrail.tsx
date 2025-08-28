// OverlayAuditTrail.tsx - Phase III-A Step 5/6
// Audit log of all overlay render events, access violations, pushback states
// Confirm DID-role alignment with ZKP proofs with timestamped audit and hash verification

import { useState, useEffect } from 'react';
import { FileText, Shield, AlertTriangle, CheckCircle, Clock, Hash } from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: Date;
  type: 'render' | 'violation' | 'pushback' | 'zkp_sync' | 'role_change';
  overlayId: string;
  userId: string;
  userRole: string;
  zkpHash: string;
  zkpVerified: boolean;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

interface AuditMetrics {
  totalEvents: number;
  renderEvents: number;
  violations: number;
  pushbackEvents: number;
  zkpFailures: number;
  successRate: number;
  lastAuditTime: Date;
}

interface OverlayAuditTrailProps {
  maxEvents?: number;
  autoRefresh?: boolean;
  showZkpDetails?: boolean;
  onAuditEvent?: (event: AuditEvent) => void;
}

export const OverlayAuditTrail = ({ 
  maxEvents = 100, 
  autoRefresh = true,
  showZkpDetails = true,
  onAuditEvent 
}: OverlayAuditTrailProps) => {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [metrics, setMetrics] = useState<AuditMetrics>({
    totalEvents: 0,
    renderEvents: 0,
    violations: 0,
    pushbackEvents: 0,
    zkpFailures: 0,
    successRate: 100,
    lastAuditTime: new Date()
  });
  const [renderTime, setRenderTime] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [filterType, setFilterType] = useState<AuditEvent['type'] | 'all'>('all');

  useEffect(() => {
    const startTime = performance.now();
    
    // Initialize with mock audit events
    initializeAuditTrail();
    
    // Auto-refresh if enabled
    if (autoRefresh) {
      const refreshInterval = setInterval(() => {
        generateMockAuditEvent();
      }, 5000);
      
      return () => clearInterval(refreshInterval);
    }

    console.log('🔇 TTS disabled: "Audit trail initialized"');

    const endTime = performance.now();
    const latency = endTime - startTime;
    setRenderTime(latency);
    
    if (latency > 125) {
      console.log(`OverlayAuditTrail render time: ${latency.toFixed(2)}ms (exceeds 125ms target)`);
    }
  }, [autoRefresh]);

  const initializeAuditTrail = () => {
    const mockEvents: AuditEvent[] = [
      {
        id: 'audit_001',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        type: 'render',
        overlayId: 'wallet_overview',
        userId: 'did:civic:0x7f3e2d1a8c9b5f2e',
        userRole: 'Citizen',
        zkpHash: '0x4f3e2d1a8c9b5f2e7d4a6b8c',
        zkpVerified: true,
        details: 'Wallet overview overlay rendered successfully',
        severity: 'info'
      },
      {
        id: 'audit_002',
        timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3 minutes ago
        type: 'violation',
        overlayId: 'governor_panel',
        userId: 'did:civic:0x7f3e2d1a8c9b5f2e',
        userRole: 'Citizen',
        zkpHash: '0x4f3e2d1a8c9b5f2e7d4a6b8c',
        zkpVerified: true,
        details: 'Access denied: Governor role required',
        severity: 'warning'
      },
      {
        id: 'audit_003',
        timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
        type: 'pushback',
        overlayId: 'urgency_system',
        userId: 'system',
        userRole: 'System',
        zkpHash: '0x9c3e5f7a1b4d6e8f0a2c4e6f',
        zkpVerified: true,
        details: 'Critical urgency threshold exceeded: 35% critical alerts',
        severity: 'critical'
      },
      {
        id: 'audit_004',
        timestamp: new Date(Date.now() - 1000 * 60 * 1), // 1 minute ago
        type: 'zkp_sync',
        overlayId: 'cold_storage',
        userId: 'did:civic:0x2b4f6a8c0e2d5f7a',
        userRole: 'Delegate',
        zkpHash: '0x2b4f6a8c0e2d5f7a9c1e3b6d',
        zkpVerified: false,
        details: 'ZKP verification failed during overlay access',
        severity: 'error'
      },
      {
        id: 'audit_005',
        timestamp: new Date(Date.now() - 1000 * 30), // 30 seconds ago
        type: 'role_change',
        overlayId: 'role_system',
        userId: 'did:civic:0x7f3e2d1a8c9b5f2e',
        userRole: 'Delegate',
        zkpHash: '0x4f3e2d1a8c9b5f2e7d4a6b8c',
        zkpVerified: true,
        details: 'User role upgraded from Citizen to Delegate',
        severity: 'info'
      }
    ];

    setAuditEvents(mockEvents);
    updateMetrics(mockEvents);
  };

  const generateMockAuditEvent = () => {
    const eventTypes: AuditEvent['type'][] = ['render', 'violation', 'pushback', 'zkp_sync', 'role_change'];
    const roles = ['Citizen', 'Delegate', 'Governor'];
    const overlayIds = ['wallet_overview', 'cold_storage', 'transaction_stability', 'governor_panel', 'urgency_system'];
    
    const newEvent: AuditEvent = {
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      overlayId: overlayIds[Math.floor(Math.random() * overlayIds.length)],
      userId: `did:civic:0x${Math.random().toString(16).substring(2, 18)}`,
      userRole: roles[Math.floor(Math.random() * roles.length)],
      zkpHash: `0x${Math.random().toString(16).substring(2, 34)}`,
      zkpVerified: Math.random() > 0.1, // 90% success rate
      details: generateEventDetails(),
      severity: Math.random() > 0.8 ? 'critical' : 
                Math.random() > 0.6 ? 'error' : 
                Math.random() > 0.4 ? 'warning' : 'info'
    };

    setAuditEvents(prev => {
      const updated = [newEvent, ...prev].slice(0, maxEvents);
      updateMetrics(updated);
      onAuditEvent?.(newEvent);
      return updated;
    });
  };

  const generateEventDetails = (): string => {
    const details = [
      'Overlay access granted with valid credentials',
      'Render cycle completed within performance targets',
      'ZKP verification successful for user session',
      'Role hierarchy validation passed',
      'Emergency fallback activated due to system load',
      'Access denied: insufficient permissions',
      'Pushback triggered: critical threshold exceeded',
      'ZKP sync timeout, using cached credentials',
      'User role elevation request processed'
    ];
    
    return details[Math.floor(Math.random() * details.length)];
  };

  const updateMetrics = (events: AuditEvent[]) => {
    const newMetrics: AuditMetrics = {
      totalEvents: events.length,
      renderEvents: events.filter(e => e.type === 'render').length,
      violations: events.filter(e => e.type === 'violation').length,
      pushbackEvents: events.filter(e => e.type === 'pushback').length,
      zkpFailures: events.filter(e => !e.zkpVerified).length,
      successRate: events.length > 0 ? 
        ((events.filter(e => e.zkpVerified && e.severity !== 'error').length / events.length) * 100) : 100,
      lastAuditTime: new Date()
    };

    setMetrics(newMetrics);
  };

  const getEventIcon = (type: AuditEvent['type']) => {
    switch (type) {
      case 'render': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'violation': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'pushback': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'zkp_sync': return <Shield className="w-4 h-4 text-green-400" />;
      case 'role_change': return <CheckCircle className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSeverityColor = (severity: AuditEvent['severity']) => {
    switch (severity) {
      case 'info': return 'text-blue-400';
      case 'warning': return 'text-amber-400';
      case 'error': return 'text-red-400';
      case 'critical': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getFilteredEvents = () => {
    if (filterType === 'all') return auditEvents;
    return auditEvents.filter(event => event.type === filterType);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg">
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Overlay Audit Trail</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">{renderTime.toFixed(1)}ms</div>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Total Events</div>
          <div className="text-lg font-semibold text-slate-100">{metrics.totalEvents}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Violations</div>
          <div className="text-lg font-semibold text-red-400">{metrics.violations}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">ZKP Failures</div>
          <div className="text-lg font-semibold text-amber-400">{metrics.zkpFailures}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Success Rate</div>
          <div className="text-lg font-semibold text-green-400">{metrics.successRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          All ({auditEvents.length})
        </button>
        <button
          onClick={() => setFilterType('render')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            filterType === 'render' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Renders ({metrics.renderEvents})
        </button>
        <button
          onClick={() => setFilterType('violation')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            filterType === 'violation' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Violations ({metrics.violations})
        </button>
        <button
          onClick={() => setFilterType('pushback')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            filterType === 'pushback' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Pushbacks ({metrics.pushbackEvents})
        </button>
        <button
          onClick={() => setFilterType('zkp_sync')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            filterType === 'zkp_sync' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          ZKP Sync ({auditEvents.filter(e => e.type === 'zkp_sync').length})
        </button>
      </div>

      {/* Event List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {getFilteredEvents().map((event) => (
          <div
            key={event.id}
            className={`bg-slate-800 rounded-lg p-3 border ${
              selectedEvent?.id === event.id ? 'border-blue-500' : 'border-slate-700'
            } cursor-pointer transition-colors`}
            onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getEventIcon(event.type)}
                <span className="text-sm font-medium text-slate-200 capitalize">
                  {event.type.replace('_', ' ')}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(event.severity)}`}>
                  {event.severity.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{formatTimestamp(event.timestamp)}</span>
                {event.zkpVerified ? (
                  <Shield className="w-3 h-3 text-green-400" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                )}
              </div>
            </div>

            <div className="text-sm text-slate-300 mb-2">{event.details}</div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Overlay: {event.overlayId}</span>
              <span>Role: {event.userRole}</span>
            </div>

            {/* Expanded Details */}
            {selectedEvent?.id === event.id && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Event ID:</span>
                    <span className="text-xs text-slate-300 font-mono">{event.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">User ID:</span>
                    <span className="text-xs text-slate-300 font-mono">{event.userId}</span>
                  </div>
                  {showZkpDetails && (
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">ZKP Hash:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-300 font-mono">{event.zkpHash.slice(0, 16)}...</span>
                        <Hash className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Timestamp:</span>
                    <span className="text-xs text-slate-300">{event.timestamp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">ZKP Status:</span>
                    <span className={`text-xs ${event.zkpVerified ? 'text-green-400' : 'text-red-400'}`}>
                      {event.zkpVerified ? 'Verified' : 'Failed'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Last updated: {metrics.lastAuditTime.toLocaleTimeString()}</span>
        <span>Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
      </div>
    </div>
  );
};

export default OverlayAuditTrail;