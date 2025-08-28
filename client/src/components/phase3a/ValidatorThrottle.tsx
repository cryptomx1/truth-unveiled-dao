// ValidatorThrottle Component - Phase III-A Latency Monitor
import { useState, useEffect } from 'react';
import { protocolValidator, ValidationResult } from '@/utils/ProtocolValidator';

interface ValidatorThrottleProps {
  onValidationComplete?: (results: ValidationResult[]) => void;
}

export const ValidatorThrottle = ({ onValidationComplete }: ValidatorThrottleProps) => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [latencyTest, setLatencyTest] = useState<number>(0);

  useEffect(() => {
    const runValidation = async () => {
      setIsValidating(true);
      const startTime = Date.now();
      
      try {
        const results = await protocolValidator.executeFullValidation();
        const endTime = Date.now();
        const totalLatency = endTime - startTime;
        
        setLatencyTest(totalLatency);
        setValidationResults(results);
        
        if (onValidationComplete) {
          onValidationComplete(results);
        }
        
        // Log validation report for JASMY/GROK monitoring
        const report = protocolValidator.generateValidationReport(results);
        console.log('🔐 Phase III-A Validation:', report);
        
      } catch (error) {
        console.error('❌ Validation failed:', error);
      } finally {
        setIsValidating(false);
      }
    };

    runValidation();
  }, [onValidationComplete]);

  const allPassed = validationResults.every(r => r.status === 'PASSED');
  const latencyStatus = latencyTest < 143 ? 'PASSED' : latencyTest < 500 ? 'WARNING' : 'FAILED';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-200">
          🔐 Phase III-A Validator
        </h3>
        <div className={`text-xs px-2 py-1 rounded ${
          isValidating ? 'bg-amber-900 text-amber-200' :
          allPassed ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
        }`}>
          {isValidating ? 'VALIDATING' : allPassed ? 'CLEARED' : 'FAILED'}
        </div>
      </div>

      {/* Latency Test Display */}
      <div className="mb-4 p-3 bg-slate-900 rounded border border-slate-600">
        <div className="flex justify-between text-xs text-slate-300 mb-2">
          <span>Latency Test</span>
          <span className={
            latencyStatus === 'PASSED' ? 'text-green-400' :
            latencyStatus === 'WARNING' ? 'text-amber-400' : 'text-red-400'
          }>
            {latencyTest}ms {latencyStatus}
          </span>
        </div>
        <div className="text-xs text-slate-400">
          Target: &lt;143ms | Max: &lt;500ms
        </div>
      </div>

      {/* Validation Steps */}
      <div className="space-y-2">
        {validationResults.map((result, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Step {result.step}/6: {result.message.split(':')[0].replace(/[✅❌]/g, '').trim()}
            </span>
            <div className={`px-2 py-1 rounded text-xs ${
              result.status === 'PASSED' ? 'bg-green-900 text-green-200' :
              result.status === 'FAILED' ? 'bg-red-900 text-red-200' :
              'bg-amber-900 text-amber-200'
            }`}>
              {result.status}
            </div>
          </div>
        ))}
      </div>

      {/* Authority Signatures */}
      <div className="mt-4 pt-3 border-t border-slate-700">
        <div className="text-xs text-slate-400 space-y-1">
          <div>CMD: 0xA7F1-FF99-B3E3-CMD</div>
          <div>QA: 0x47C9-A2FF-0A32-ENV</div>
          <div>JSM: TS-2025-07-17T07:35:00Z</div>
        </div>
      </div>

      {allPassed && !isValidating && (
        <div className="mt-4 p-3 bg-green-900 border border-green-700 rounded">
          <div className="text-xs text-green-200 font-medium">
            🚀 Phase III-A Launch Authorized
          </div>
          <div className="text-xs text-green-300 mt-1">
            Proceed to Eight Pillars implementation
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidatorThrottle;