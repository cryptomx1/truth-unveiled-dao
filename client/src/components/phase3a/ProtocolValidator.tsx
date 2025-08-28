// ProtocolValidator Component - Phase III-A React Wrapper
import { useState, useEffect } from 'react';
import { protocolValidator, ValidationResult } from '@/utils/ProtocolValidator';
import { Shield, Check, X, Clock } from 'lucide-react';

interface ProtocolValidatorProps {
  onValidationComplete?: (results: ValidationResult[]) => void;
}

export const ProtocolValidator = ({ onValidationComplete }: ProtocolValidatorProps) => {
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
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-slate-200">
            Phase III-A Protocol Validator
          </h3>
        </div>
        <div className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
          isValidating ? 'bg-amber-900 text-amber-200' :
          allPassed ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
        }`}>
          {isValidating ? (
            <>
              <Clock className="w-3 h-3 animate-spin" />
              VALIDATING
            </>
          ) : allPassed ? (
            <>
              <Check className="w-3 h-3" />
              CLEARED
            </>
          ) : (
            <>
              <X className="w-3 h-3" />
              FAILED
            </>
          )}
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
          <div key={index} className="flex items-center justify-between p-2 bg-slate-900 rounded">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                result.status === 'PASSED' ? 'bg-green-400' :
                result.status === 'FAILED' ? 'bg-red-400' : 'bg-amber-400'
              }`} />
              <span className="text-xs text-slate-300">
                Step {result.step}/{result.totalSteps}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {result.validatorThrottle}ms
            </div>
          </div>
        ))}
      </div>

      {/* Validation Summary */}
      <div className="mt-4 p-3 bg-slate-900 rounded border border-slate-600">
        <div className="text-xs text-slate-300 mb-1">
          Validation Summary
        </div>
        <div className="text-xs text-slate-400">
          {validationResults.filter(r => r.status === 'PASSED').length}/{validationResults.length} steps passed
        </div>
        <div className="text-xs text-slate-400">
          CMD: 0xA7F1-FF99-B3E3-CMD
        </div>
      </div>
    </div>
  );
};

export default ProtocolValidator;