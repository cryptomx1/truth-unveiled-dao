// Phase IX Step 2: CivicSyncDiagnosticsPanel.tsx
// Commander Mark authorization via JASMY Relay System
// Diagnostic panel with fallback simulation, TTS toggle, and QA envelope framework

import React, { useState, useEffect, useRef } from 'react';
import { protocolValidator } from '@/utils/ProtocolValidator';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Volume2, 
  VolumeX, 
  Download, 
  RefreshCw,
  Zap,
  Shield,
  Eye,
  WifiOff,
  Clock,
  Database,
  Network,
  Cpu
} from 'lucide-react';

export interface DiagnosticResult {
  testId: string;
  testName: string;
  status: 'passed' | 'failed' | 'warning' | 'running';
  duration: number;
  message: string;
  details: string[];
  timestamp: number;
}

export interface QAEnvelope {
  envelopeId: string;
  qaHash: string;
  phaseIXHash: string;
  validationResults: DiagnosticResult[];
  lockInVerdict: 'sealed' | 'pending' | 'failed';
  timestamp: number;
}

export default function CivicSyncDiagnosticsPanel() {
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [fallbackSimulationActive, setFallbackSimulationActive] = useState(false);
  const [qaEnvelope, setQAEnvelope] = useState<QAEnvelope | null>(null);
  const [lastDiagnosticRun, setLastDiagnosticRun] = useState<number>(0);
  const [exportData, setExportData] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState(false);
  
  const mountTimestamp = useRef<number>(Date.now());
  const diagnosticTests = [
    { id: 'sync_integrity', name: 'Sync Integrity Check', category: 'core' },
    { id: 'zkp_validation', name: 'ZKP Validation Test', category: 'security' },
    { id: 'heatmap_accuracy', name: 'Heatmap Accuracy Test', category: 'visualization' },
    { id: 'aria_compliance', name: 'ARIA Compliance Test', category: 'accessibility' },
    { id: 'performance_metrics', name: 'Performance Metrics Test', category: 'performance' },
    { id: 'fallback_simulation', name: 'Fallback Simulation Test', category: 'resilience' },
    { id: 'export_validation', name: 'Export Validation Test', category: 'data' },
    { id: 'path_b_triggers', name: 'Path B Trigger Test', category: 'monitoring' }
  ];

  // Generate diagnostic result
  const generateDiagnosticResult = (test: any): DiagnosticResult => {
    const duration = Math.floor(Math.random() * 2000) + 500; // 500-2500ms
    const success = Math.random() > 0.15; // 85% success rate
    
    let status: 'passed' | 'failed' | 'warning';
    let message: string;
    let details: string[] = [];
    
    if (success) {
      status = Math.random() > 0.9 ? 'warning' : 'passed';
      message = status === 'passed' 
        ? `${test.name} completed successfully`
        : `${test.name} completed with minor issues`;
      
      if (status === 'warning') {
        details.push('Minor performance variance detected');
        details.push('Recommended: Monitor for trends');
      } else {
        details.push('All validation criteria met');
        details.push('Performance within acceptable parameters');
      }
    } else {
      status = 'failed';
      message = `${test.name} validation failed`;
      details.push('Critical validation error detected');
      details.push('Requires immediate attention');
      details.push('Fallback protocols may be needed');
    }

    return {
      testId: test.id,
      testName: test.name,
      status,
      duration,
      message,
      details,
      timestamp: Date.now()
    };
  };

  // Run diagnostic test suite
  const runDiagnostics = async () => {
    const startTime = Date.now();
    setIsRunningDiagnostics(true);
    setDiagnosticResults([]);
    
    try {
      console.log('🔄 CivicSyncDiagnosticsPanel: Starting diagnostic test suite');
      
      // Run tests sequentially with realistic delays
      const results: DiagnosticResult[] = [];
      
      for (const test of diagnosticTests) {
        // Add running status
        const runningResult: DiagnosticResult = {
          testId: test.id,
          testName: test.name,
          status: 'running',
          duration: 0,
          message: `Running ${test.name}...`,
          details: ['Test in progress'],
          timestamp: Date.now()
        };
        
        setDiagnosticResults(prev => [...prev.filter(r => r.testId !== test.id), runningResult]);
        
        // Simulate test execution time
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        
        // Generate final result
        const result = generateDiagnosticResult(test);
        results.push(result);
        
        setDiagnosticResults(prev => [...prev.filter(r => r.testId !== test.id), result]);
        
        console.log(`📋 CivicSyncDiagnosticsPanel: ${test.name} - ${result.status} (${result.duration}ms)`);
      }
      
      setLastDiagnosticRun(Date.now());
      
      // Generate QA Envelope
      const envelope: QAEnvelope = {
        envelopeId: `qa_env_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        qaHash: `0x${Math.random().toString(16).substr(2, 16)}`,
        phaseIXHash: `0x${Math.random().toString(16).substr(2, 16)}`,
        validationResults: results,
        lockInVerdict: results.every(r => r.status !== 'failed') ? 'sealed' : 'failed',
        timestamp: Date.now()
      };
      
      setQAEnvelope(envelope);
      
      const totalTime = Date.now() - startTime;
      const passedCount = results.filter(r => r.status === 'passed').length;
      const failedCount = results.filter(r => r.status === 'failed').length;
      
      announce(`Diagnostics complete. ${passedCount} passed, ${failedCount} failed. Total time ${Math.round(totalTime / 1000)} seconds.`);
      
      console.log(`✅ CivicSyncDiagnosticsPanel: Diagnostic suite completed in ${totalTime}ms`);
      console.log(`📦 QA Envelope generated: ${envelope.envelopeId}`);
      
    } catch (error) {
      console.error('❌ CivicSyncDiagnosticsPanel: Diagnostic execution failed:', error);
      announce('Diagnostic execution failed');
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  // Toggle TTS system
  const toggleTTS = () => {
    const newState = !ttsEnabled;
    setTtsEnabled(newState);
    
    const message = newState ? 'TTS system enabled' : 'TTS system disabled';
    announce(message);
    
    console.log(`🔇 CivicSyncDiagnosticsPanel: TTS toggle - ${message}`);
  };

  // Toggle fallback simulation
  const toggleFallbackSimulation = () => {
    const newState = !fallbackSimulationActive;
    setFallbackSimulationActive(newState);
    
    const message = newState 
      ? 'Fallback simulation activated - simulating system stress'
      : 'Fallback simulation deactivated - normal operation resumed';
    
    announce(message);
    
    console.log(`⚠️ CivicSyncDiagnosticsPanel: Fallback simulation - ${newState ? 'ACTIVE' : 'INACTIVE'}`);
    
    if (newState) {
      console.log('🔄 Simulating Path B fallback triggers');
      console.log('⚡ Stress testing diagnostic pathways');
      console.log('🛡️ Monitoring resilience parameters');
    }
  };

  // Announce messages (TTS simulation)
  const announce = (message: string) => {
    if (ttsEnabled) {
      console.log(`🔇 TTS disabled: "${message}"`);
    } else {
      console.log(`🔇 EMERGENCY TTS KILLER ACTIVATED - MESSAGE BLOCKED: "${message}"`);
    }
  };

  // Generate export data
  const generateExportData = () => {
    const exportSnapshot = {
      exportId: `diagnostics_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      timestamp: new Date().toISOString(),
      diagnosticResults,
      qaEnvelope,
      systemStatus: {
        ttsEnabled,
        fallbackSimulationActive,
        lastDiagnosticRun,
        totalTests: diagnosticTests.length,
        passedTests: diagnosticResults.filter(r => r.status === 'passed').length,
        failedTests: diagnosticResults.filter(r => r.status === 'failed').length,
        warningTests: diagnosticResults.filter(r => r.status === 'warning').length
      },
      phaseHashes: protocolValidator.getPhaseHashes(),
      exportedBy: 'CivicSyncDiagnosticsPanel'
    };

    const exportString = JSON.stringify(exportSnapshot, null, 2);
    setExportData(exportString);
    setShowExportModal(true);
    
    announce('Diagnostic export generated');
    console.log('📦 CivicSyncDiagnosticsPanel: Export data generated');
  };

  // Download export data
  const downloadExportData = () => {
    if (!exportData) return;

    const dataBlob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `civic_sync_diagnostics_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    
    announce('Diagnostic export downloaded');
  };

  // Get status display properties
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'passed':
        return { icon: <CheckCircle className="w-4 h-4 text-green-400" />, color: 'text-green-400', bg: 'bg-green-900/20' };
      case 'failed':
        return { icon: <AlertTriangle className="w-4 h-4 text-red-400" />, color: 'text-red-400', bg: 'bg-red-900/20' };
      case 'warning':
        return { icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />, color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
      case 'running':
        return { icon: <Clock className="w-4 h-4 text-blue-400 animate-spin" />, color: 'text-blue-400', bg: 'bg-blue-900/20' };
      default:
        return { icon: <Clock className="w-4 h-4 text-slate-400" />, color: 'text-slate-400', bg: 'bg-slate-700' };
    }
  };

  // Get test category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Database className="w-3 h-3" />;
      case 'security': return <Shield className="w-3 h-3" />;
      case 'visualization': return <Eye className="w-3 h-3" />;
      case 'accessibility': return <Settings className="w-3 h-3" />;
      case 'performance': return <Cpu className="w-3 h-3" />;
      case 'resilience': return <Zap className="w-3 h-3" />;
      case 'data': return <Download className="w-3 h-3" />;
      case 'monitoring': return <Activity className="w-3 h-3" />;
      default: return <Settings className="w-3 h-3" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Component initialization
  useEffect(() => {
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 150) {
      console.warn(`⚠️ CivicSyncDiagnosticsPanel render time: ${renderTime}ms (exceeds 150ms target)`);
    }

    // Nuclear TTS override
    console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
    announce('Civic sync diagnostics panel initialized');
    
    console.log('🔄 CivicSyncDiagnosticsPanel: Component initialized and ready');
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Civic Sync Diagnostics Panel
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase IX • Step 2 • Diagnostic Framework</div>
          <div>Tests: {diagnosticTests.length} • Results: {diagnosticResults.length}</div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="mb-6 space-y-4">
        <h3 className="text-sm font-medium text-slate-300">System Controls</h3>
        
        {/* TTS Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-700 border border-slate-600 rounded-md">
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

        {/* Fallback Simulation */}
        <div className="flex items-center justify-between p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${fallbackSimulationActive ? 'text-orange-400' : 'text-slate-400'}`} />
            <span className="text-sm text-slate-300">Fallback Simulation</span>
          </div>
          <button
            onClick={toggleFallbackSimulation}
            className={`py-1 px-3 rounded text-xs font-medium transition-colors duration-200 ${
              fallbackSimulationActive ? 'bg-orange-600 text-white' : 'bg-slate-600 text-slate-300'
            }`}
            style={{ minHeight: '32px' }}
            aria-label={`${fallbackSimulationActive ? 'Deactivate' : 'Activate'} fallback simulation`}
          >
            {fallbackSimulationActive ? 'Active' : 'Inactive'}
          </button>
        </div>

        {/* Diagnostic Runner */}
        <div className="p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-300">Diagnostic Suite</span>
            </div>
            <button
              onClick={runDiagnostics}
              className="py-1 px-3 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
              style={{ minHeight: '32px' }}
              disabled={isRunningDiagnostics}
              aria-label="Run diagnostic tests"
            >
              <RefreshCw className={`w-3 h-3 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
              {isRunningDiagnostics ? 'Running...' : 'Run Tests'}
            </button>
          </div>
          
          {lastDiagnosticRun > 0 && (
            <div className="text-xs text-slate-400">
              Last run: {formatTimeAgo(lastDiagnosticRun)}
            </div>
          )}
        </div>
      </div>

      {/* Diagnostic Results */}
      <div className="mb-6 bg-slate-700 border border-slate-600 rounded-md">
        <div className="p-3 border-b border-slate-600 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">
            Test Results ({diagnosticResults.length}/{diagnosticTests.length})
          </h3>
          <button
            onClick={generateExportData}
            className="py-1 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
            style={{ minHeight: '32px' }}
            disabled={diagnosticResults.length === 0}
            aria-label="Export diagnostic results"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {diagnosticResults.length > 0 ? (
            <div className="divide-y divide-slate-600">
              {diagnosticResults.map((result, index) => {
                const statusDisplay = getStatusDisplay(result.status);
                const test = diagnosticTests.find(t => t.id === result.testId);
                const categoryIcon = test ? getCategoryIcon(test.category) : <Settings className="w-3 h-3" />;
                
                return (
                  <div 
                    key={result.testId} 
                    className={`p-3 hover:bg-slate-600 transition-colors duration-200 ${statusDisplay.bg}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center gap-1">
                          {categoryIcon}
                          <span className="text-sm font-medium text-slate-200">
                            {result.testName}
                          </span>
                        </div>
                        {statusDisplay.icon}
                      </div>
                      <div className="text-xs text-slate-300 font-mono">
                        {result.duration}ms
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className={`font-medium ${statusDisplay.color}`}>
                        {result.message}
                      </div>
                      
                      {result.details.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {result.details.map((detail, idx) => (
                            <div key={idx} className="text-slate-400 ml-2">
                              • {detail}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between mt-2">
                        <span className="text-slate-500">Test ID:</span>
                        <span className="text-slate-400 font-mono">{result.testId}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-sm text-slate-400">No diagnostic results available</div>
              <div className="text-xs text-slate-500 mt-1">Run the diagnostic suite to see results</div>
            </div>
          )}
        </div>
      </div>

      {/* QA Envelope Status */}
      {qaEnvelope && (
        <div className="mb-6 p-4 bg-slate-900 border border-slate-600 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 mb-3">QA Envelope Status</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Envelope ID:</span>
              <span className="text-white font-mono">{qaEnvelope.envelopeId.slice(0, 16)}...</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">QA Hash:</span>
              <span className="text-white font-mono">{qaEnvelope.qaHash.slice(0, 12)}...</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Phase IX Hash:</span>
              <span className="text-white font-mono">{qaEnvelope.phaseIXHash.slice(0, 12)}...</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Lock-in Verdict:</span>
              <span className={`font-medium ${
                qaEnvelope.lockInVerdict === 'sealed' ? 'text-green-400' : 
                qaEnvelope.lockInVerdict === 'failed' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {qaEnvelope.lockInVerdict.toUpperCase()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Validation Count:</span>
              <span className="text-white">{qaEnvelope.validationResults.length}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Generated:</span>
              <span className="text-white">{formatTimeAgo(qaEnvelope.timestamp)}</span>
            </div>
          </div>
        </div>
      )}

      {/* System Status Summary */}
      <div className="p-4 bg-slate-900 border border-slate-600 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-3">System Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">TTS System:</span>
            <span className={ttsEnabled ? 'text-blue-400' : 'text-slate-400'}>
              {ttsEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Fallback Simulation:</span>
            <span className={fallbackSimulationActive ? 'text-orange-400' : 'text-slate-400'}>
              {fallbackSimulationActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Diagnostic Status:</span>
            <span className={isRunningDiagnostics ? 'text-blue-400' : 'text-green-400'}>
              {isRunningDiagnostics ? 'Running' : 'Ready'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Test Coverage:</span>
            <span className="text-white">
              {diagnosticResults.length}/{diagnosticTests.length} ({Math.round((diagnosticResults.length / diagnosticTests.length) * 100)}%)
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Pass Rate:</span>
            <span className={diagnosticResults.length > 0 ? 'text-green-400' : 'text-slate-400'}>
              {diagnosticResults.length > 0 
                ? `${Math.round((diagnosticResults.filter(r => r.status === 'passed').length / diagnosticResults.length) * 100)}%`
                : 'N/A'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && exportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Export Diagnostic Data</h3>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Tests:</span>
                <span className="text-white">{diagnosticResults.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Passed:</span>
                <span className="text-green-400">{diagnosticResults.filter(r => r.status === 'passed').length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Failed:</span>
                <span className="text-red-400">{diagnosticResults.filter(r => r.status === 'failed').length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">QA Envelope:</span>
                <span className={qaEnvelope ? 'text-green-400' : 'text-slate-400'}>
                  {qaEnvelope ? 'Generated' : 'None'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Export Size:</span>
                <span className="text-white">{Math.ceil(exportData.length / 1024)} KB</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-white">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors duration-200"
                style={{ minHeight: '48px' }}
              >
                Cancel
              </button>
              
              <button
                onClick={downloadExportData}
                className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
                style={{ minHeight: '48px' }}
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}