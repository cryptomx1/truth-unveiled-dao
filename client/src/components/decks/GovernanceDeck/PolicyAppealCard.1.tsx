import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  Scale,
  AlertTriangle,
  Send,
  FileText,
  User,
  MessageSquare,
  Clock
} from 'lucide-react';

type AppealReason = 'disproportionate' | 'incorrect-enforcement' | 'jurisdiction-error' | 'procedural-violation';

interface AppealFormData {
  appealReason: AppealReason;
  justification: string;
  linkedEnforcementId: string;
  userRole: string;
  didReference: string;
}

interface AppealFormProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Initial appeal form data
const INITIAL_FORM_DATA: AppealFormData = {
  appealReason: 'disproportionate',
  justification: '',
  linkedEnforcementId: 'policy_001',
  userRole: 'citizen',
  didReference: 'did:civic:abc123def456'
};

// Get appeal reason display info
const getAppealReasonInfo = (reason: AppealReason) => {
  switch (reason) {
    case 'disproportionate':
      return {
        label: 'Disproportionate Response',
        description: 'The enforcement action was excessive for the violation',
        icon: Scale,
        color: 'text-yellow-400'
      };
    case 'incorrect-enforcement':
      return {
        label: 'Incorrect Enforcement',
        description: 'The policy was misapplied or misinterpreted',
        icon: AlertTriangle,
        color: 'text-red-400'
      };
    case 'jurisdiction-error':
      return {
        label: 'Jurisdiction Error',
        description: 'The enforcing authority lacked proper jurisdiction',
        icon: FileText,
        color: 'text-blue-400'
      };
    case 'procedural-violation':
      return {
        label: 'Procedural Violation',
        description: 'Proper procedures were not followed during enforcement',
        icon: User,
        color: 'text-purple-400'
      };
    default:
      return {
        label: 'Unknown Reason',
        description: 'Appeal reason not specified',
        icon: AlertTriangle,
        color: 'text-gray-400'
      };
  }
};

export const AppealForm: React.FC<AppealFormProps> = ({ className }) => {
  const [formData, setFormData] = useState<AppealFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [characterCount, setCharacterCount] = useState<number>(0);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`AppealForm render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`AppealForm render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // Initialize TTS
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setTtsStatus(prev => ({ ...prev, isReady: true }));
    }
  }, []);

  // Update character count
  useEffect(() => {
    setCharacterCount(formData.justification.length);
  }, [formData.justification]);

  // TTS Integration
  const speakMessage = (message: string, force = false) => {
    const now = Date.now();
    
    if (!force && now - ttsStatus.lastTrigger < 3000) {
      return;
    }
    
    if (!ttsStatus.isReady) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        setTtsStatus(prev => ({ 
          ...prev, 
          isPlaying: true, 
          lastTrigger: now 
        }));
        
        utterance.onend = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
        };
        
        utterance.onerror = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
        };
        
        window.speechSynthesis.speak(utterance);
      }, 40);
    } catch (error) {
      console.error('TTS speak failed:', error);
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.justification.trim() || formData.justification.length > 500) {
      speakMessage("Please provide a valid justification between 1 and 500 characters");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      speakMessage("Appeal submitted for review");
      
      // Reset form after successful submission
      setFormData(INITIAL_FORM_DATA);
      
    } catch (error) {
      speakMessage("Appeal submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle appeal reason change
  const handleReasonChange = (reason: AppealReason) => {
    setFormData(prev => ({ ...prev, appealReason: reason }));
    const reasonInfo = getAppealReasonInfo(reason);
    speakMessage(`Appeal reason selected: ${reasonInfo.label}`);
  };

  // Handle justification change
  const handleJustificationChange = (value: string) => {
    if (value.length <= 500) {
      setFormData(prev => ({ ...prev, justification: value }));
    }
  };

  const reasonInfo = getAppealReasonInfo(formData.appealReason);
  const ReasonIcon = reasonInfo.icon;
  const isFormValid = formData.justification.trim().length > 0 && formData.justification.length <= 500;

  return (
    <Card 
      className={cn(
        'bg-slate-800 border-slate-700 shadow-xl max-h-[600px] w-full overflow-hidden',
        className
      )}
      role="region"
      aria-label="Appeal Form"
      data-testid="appeal-form"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-white">Appeal Form</CardTitle>
              <CardDescription className="text-slate-400">Submit a policy enforcement appeal</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            DRAFT
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Appeal Reason Selection */}
        <div className="space-y-3">
          <label htmlFor="appeal-reason" className="text-sm font-medium text-white">
            Appeal Reason
          </label>
          <Select value={formData.appealReason} onValueChange={handleReasonChange}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Select appeal reason..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="disproportionate" className="text-white hover:bg-slate-800">
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-yellow-400" />
                  <span>Disproportionate Response</span>
                </div>
              </SelectItem>
              <SelectItem value="incorrect-enforcement" className="text-white hover:bg-slate-800">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Incorrect Enforcement</span>
                </div>
              </SelectItem>
              <SelectItem value="jurisdiction-error" className="text-white hover:bg-slate-800">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Jurisdiction Error</span>
                </div>
              </SelectItem>
              <SelectItem value="procedural-violation" className="text-white hover:bg-slate-800">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span>Procedural Violation</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {/* Reason Description */}
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
            <div className="flex items-start space-x-2">
              <ReasonIcon className={cn('w-4 h-4 mt-0.5', reasonInfo.color)} />
              <div>
                <p className="text-sm font-medium text-white">{reasonInfo.label}</p>
                <p className="text-xs text-slate-400 mt-1">{reasonInfo.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Justification Text Area */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label htmlFor="justification" className="text-sm font-medium text-white">
              Appeal Justification
            </label>
            <span className={cn(
              'text-xs',
              characterCount > 450 ? 'text-red-400' : characterCount > 400 ? 'text-yellow-400' : 'text-slate-400'
            )}>
              {characterCount}/500
            </span>
          </div>
          <Textarea
            id="justification"
            value={formData.justification}
            onChange={(e) => handleJustificationChange(e.target.value)}
            placeholder="Provide detailed justification for your appeal..."
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px] resize-none"
            maxLength={500}
            aria-describedby="character-count"
          />
          <p id="character-count" className="text-xs text-slate-400">
            Explain why you believe the enforcement action should be reviewed or reversed.
          </p>
        </div>

        {/* Linked Enforcement Details */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Linked Enforcement</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Enforcement ID:</span>
              <span className="text-sm font-mono text-slate-300">{formData.linkedEnforcementId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">User Role:</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {formData.userRole.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">DID Reference:</span>
              <span className="text-sm font-mono text-slate-300 truncate max-w-[120px]">
                {formData.didReference}
              </span>
            </div>
          </div>
        </div>

        {/* Cross-Deck Validation Notice */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-400">
              Cross-deck validation with PolicyAppealCard and CredentialClaimCard (Deck #12)
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            style={{ minHeight: '40px', minWidth: '120px' }}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Submitting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Submit Appeal</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppealForm;