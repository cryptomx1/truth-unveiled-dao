import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CreditCard, Lock, CheckCircle, AlertCircle, Volume2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WithdrawalRequest {
  amount: string;
  currency: 'TP' | 'CC';
  method: string;
}

interface WithdrawalInterfaceCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

interface ValidationError {
  amount?: string;
  method?: string;
}

const WITHDRAWAL_METHODS = [
  { value: 'dao_wallet', label: 'DAO Wallet Transfer', description: 'Instant transfer' },
  { value: 'external_wallet', label: 'External Wallet', description: '1-3 business days' },
  { value: 'bank_transfer', label: 'Bank Transfer', description: '3-5 business days' },
  { value: 'crypto_exchange', label: 'Crypto Exchange', description: '24-48 hours' }
];

const MOCK_BALANCES = {
  TP: 247,
  CC: 68
};

export const WithdrawalInterfaceCard: React.FC<WithdrawalInterfaceCardProps> = ({ className }) => {
  const [withdrawalRequest, setWithdrawalRequest] = useState<WithdrawalRequest>({
    amount: '',
    currency: 'TP',
    method: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`WithdrawalInterfaceCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`WithdrawalInterfaceCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play withdrawal message on mount
          const utterance = new SpeechSynthesisUtterance("Initiate your withdrawal.");
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          
          setTtsStatus(prev => ({ ...prev, isPlaying: true }));
          speechSynthesis.speak(utterance);
          
          utterance.onend = () => {
            setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          };
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  const validateAmount = (amount: string): string | null => {
    const validationStart = performance.now();
    
    if (!amount || amount.trim() === '') {
      return 'Amount is required';
    }
    
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
      return 'Please enter a valid number';
    }
    
    if (numAmount <= 0) {
      return 'Amount must be greater than 0';
    }
    
    // Check decimal places
    const decimalPlaces = (amount.split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return 'Maximum 2 decimal places allowed';
    }
    
    // Check against available balance
    const availableBalance = MOCK_BALANCES[withdrawalRequest.currency];
    if (numAmount > availableBalance) {
      return `Insufficient balance. Available: ${availableBalance} ${withdrawalRequest.currency}`;
    }
    
    const validationTime = performance.now() - validationStart;
    if (validationTime > 50) {
      console.warn(`Amount validation time: ${validationTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
    
    return null;
  };

  const validateMethod = (method: string): string | null => {
    if (!method || method.trim() === '') {
      return 'Withdrawal method is required';
    }
    return null;
  };

  const handleAmountChange = (value: string) => {
    const inputStart = performance.now();
    
    setWithdrawalRequest(prev => ({ ...prev, amount: value }));
    
    // Real-time validation
    const amountError = validateAmount(value);
    setValidationErrors(prev => ({
      ...prev,
      amount: amountError || undefined
    }));
    
    const inputTime = performance.now() - inputStart;
    if (inputTime > 50) {
      console.warn(`Amount input response time: ${inputTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleCurrencyChange = (currency: 'TP' | 'CC') => {
    setWithdrawalRequest(prev => ({ ...prev, currency }));
    
    // Re-validate amount with new currency
    if (withdrawalRequest.amount) {
      const amountError = validateAmount(withdrawalRequest.amount);
      setValidationErrors(prev => ({
        ...prev,
        amount: amountError || undefined
      }));
    }
  };

  const handleMethodChange = (method: string) => {
    const inputStart = performance.now();
    
    setWithdrawalRequest(prev => ({ ...prev, method }));
    
    const methodError = validateMethod(method);
    setValidationErrors(prev => ({
      ...prev,
      method: methodError || undefined
    }));
    
    const inputTime = performance.now() - inputStart;
    if (inputTime > 50) {
      console.warn(`Method input response time: ${inputTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const playConfirmationTTS = (amount: string, currency: string) => {
    if (!ttsStatus.isReady) return;
    
    const message = `${amount} ${currency} withdrawal initiated.`;
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    setTtsStatus(prev => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    };
  };

  const handleSubmit = async () => {
    const submissionStart = performance.now();
    
    // Validate all fields
    const amountError = validateAmount(withdrawalRequest.amount);
    const methodError = validateMethod(withdrawalRequest.method);
    
    const errors: ValidationError = {
      amount: amountError || undefined,
      method: methodError || undefined
    };
    
    setValidationErrors(errors);
    
    if (amountError || methodError) {
      setSubmissionStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionStatus('idle');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmissionStatus('success');
      playConfirmationTTS(withdrawalRequest.amount, withdrawalRequest.currency);
      
      // Reset form after successful submission
      setTimeout(() => {
        setWithdrawalRequest({ amount: '', currency: 'TP', method: '' });
        setSubmissionStatus('idle');
      }, 3000);
      
    } catch (error) {
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
      
      const submissionTime = performance.now() - submissionStart;
      if (submissionTime > 50) {
        console.warn(`Submission logic time: ${submissionTime.toFixed(2)}ms (exceeds 50ms target)`);
      }
    }
  };

  const selectedMethod = WITHDRAWAL_METHODS.find(method => method.value === withdrawalRequest.method);
  const availableBalance = MOCK_BALANCES[withdrawalRequest.currency];
  const hasErrors = Object.values(validationErrors).some(error => error);

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-800 border-slate-700/50',
        'dao-card-gradient',
        className
      )}
      role="region"
      aria-label="Withdrawal Interface"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-400" />
            Withdraw Funds
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-slate-700/50 text-slate-400 border-slate-600">
                  <Lock className="w-3 h-3 mr-1" />
                  ZKP
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>ZK withdrawal privacy protected in Deck #6</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Securely withdraw your earned tokens
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Balance Display */}
        <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-400">{MOCK_BALANCES.TP}</div>
              <div className="text-xs text-slate-400">Truth Points</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">{MOCK_BALANCES.CC}</div>
              <div className="text-xs text-slate-400">Contribution Credits</div>
            </div>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200 block">
            Currency Type
          </label>
          <div className="flex gap-2">
            <Button
              onClick={() => handleCurrencyChange('TP')}
              variant={withdrawalRequest.currency === 'TP' ? 'default' : 'outline'}
              className={cn(
                'flex-1 min-h-[48px]',
                withdrawalRequest.currency === 'TP' 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/70'
              )}
              aria-pressed={withdrawalRequest.currency === 'TP'}
            >
              TP
            </Button>
            <Button
              onClick={() => handleCurrencyChange('CC')}
              variant={withdrawalRequest.currency === 'CC' ? 'default' : 'outline'}
              className={cn(
                'flex-1 min-h-[48px]',
                withdrawalRequest.currency === 'CC' 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/70'
              )}
              aria-pressed={withdrawalRequest.currency === 'CC'}
            >
              CC
            </Button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="withdrawal-amount"
              className="text-sm font-medium text-slate-200"
            >
              Amount
            </label>
            <span className="text-xs text-slate-400">
              Available: {availableBalance} {withdrawalRequest.currency}
            </span>
          </div>
          <Input
            id="withdrawal-amount"
            type="number"
            value={withdrawalRequest.amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder={`Enter ${withdrawalRequest.currency} amount`}
            className={cn(
              'min-h-[48px] bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400',
              validationErrors.amount && 'border-red-500 focus:border-red-500'
            )}
            step="0.01"
            min="0"
            max={availableBalance}
            aria-invalid={!!validationErrors.amount}
            aria-describedby={validationErrors.amount ? 'amount-error' : undefined}
          />
          {validationErrors.amount && (
            <div 
              id="amount-error"
              className="flex items-center gap-1 text-xs text-red-400"
              role="alert"
            >
              <AlertCircle className="w-3 h-3" />
              {validationErrors.amount}
            </div>
          )}
        </div>

        {/* Withdrawal Method */}
        <div className="space-y-2">
          <label 
            htmlFor="withdrawal-method"
            className="text-sm font-medium text-slate-200 block"
          >
            Withdrawal Method
          </label>
          <Select value={withdrawalRequest.method} onValueChange={handleMethodChange}>
            <SelectTrigger 
              id="withdrawal-method"
              className={cn(
                'min-h-[48px] bg-slate-700/50 border-slate-600 text-slate-100',
                validationErrors.method && 'border-red-500 focus:border-red-500'
              )}
              aria-invalid={!!validationErrors.method}
              aria-describedby={validationErrors.method ? 'method-error' : undefined}
            >
              <SelectValue placeholder="Select withdrawal method" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {WITHDRAWAL_METHODS.map((method) => (
                <SelectItem 
                  key={method.value} 
                  value={method.value}
                  className="text-slate-100 focus:bg-slate-700"
                >
                  <div className="flex flex-col">
                    <span>{method.label}</span>
                    <span className="text-xs text-slate-400">{method.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.method && (
            <div 
              id="method-error"
              className="flex items-center gap-1 text-xs text-red-400"
              role="alert"
            >
              <AlertCircle className="w-3 h-3" />
              {validationErrors.method}
            </div>
          )}
        </div>

        {/* Method Details */}
        {selectedMethod && (
          <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-3">
            <div className="text-sm text-slate-200 font-medium mb-1">
              {selectedMethod.label}
            </div>
            <div className="text-xs text-slate-400">
              Processing time: {selectedMethod.description}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || hasErrors || !withdrawalRequest.amount || !withdrawalRequest.method}
          className={cn(
            'w-full min-h-[48px] font-medium',
            submissionStatus === 'success' 
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : submissionStatus === 'error'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-slate-600 disabled:text-slate-400'
          )}
          aria-label={isSubmitting ? 'Processing withdrawal' : 'Submit withdrawal request'}
        >
          {isSubmitting ? (
            'Processing...'
          ) : submissionStatus === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Withdrawal Initiated
            </>
          ) : submissionStatus === 'error' ? (
            <>
              <AlertCircle className="w-4 h-4 mr-2" />
              Try Again
            </>
          ) : (
            'Initiate Withdrawal'
          )}
        </Button>

        {/* Status Message */}
        <div 
          className="text-center"
          aria-live="polite"
          aria-atomic="true"
        >
          {submissionStatus === 'success' && (
            <p className="text-sm text-green-400">
              Withdrawal request submitted successfully
            </p>
          )}
          {submissionStatus === 'error' && hasErrors && (
            <p className="text-sm text-red-400">
              Please correct the errors above
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            All withdrawals are subject to verification
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalInterfaceCard;
