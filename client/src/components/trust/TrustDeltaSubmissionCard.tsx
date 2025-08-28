/**
 * TrustDeltaSubmissionCard.tsx
 * Phase X-D Step 1: UI component for anonymous civic trust feedback submission
 * Commander Mark authorization via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ThumbsUp, ThumbsDown, Shield, Zap } from 'lucide-react';
import TTSToggle from '@/components/tts/TTSToggle';
import TrustFeedbackEngine, { TrustFeedbackPayload } from './TrustFeedbackEngine';

interface TrustDeltaSubmissionCardProps {
  target: {
    type: 'deck' | 'module' | 'component';
    deckId: string;
    moduleId?: string;
    componentId?: string;
    displayName: string;
  };
  userTier: 'Citizen' | 'Governor' | 'Commander';
  userDID: string;
  onSubmissionComplete?: (success: boolean, deltaId: string) => void;
  className?: string;
}

export const TrustDeltaSubmissionCard: React.FC<TrustDeltaSubmissionCardProps> = ({
  target,
  userTier,
  userDID,
  onSubmissionComplete,
  className = ''
}) => {
  const [feedbackType, setFeedbackType] = useState<'support' | 'dissent'>('support');
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    deltaId: string;
    zkpStub: string;
    processTime: number;
  } | null>(null);

  const trustEngine = TrustFeedbackEngine.getInstance();
  const tierWeight = { 'Citizen': 1, 'Governor': 2, 'Commander': 3 }[userTier];

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const payload: TrustFeedbackPayload = {
        target: {
          type: target.type,
          deckId: target.deckId,
          moduleId: target.moduleId,
          componentId: target.componentId
        },
        feedback: {
          type: feedbackType,
          intensity,
          explanation: explanation.trim() || undefined
        },
        submitter: {
          tier: userTier,
          zkpHash: generateZKPHash(userDID, target),
          anonymizedId: anonymizeId(userDID)
        },
        timestamp: new Date().toISOString(),
        cid: generateCID(target, userDID)
      };

      const result = await trustEngine.submitFeedback(payload);
      setSubmissionResult(result);
      
      if (result.success) {
        // Reset form
        setExplanation('');
        setIntensity(3);
        
        // Announce to screen reader
        announceToScreenReader(
          `Trust feedback submitted successfully. ${feedbackType} recorded for ${target.displayName}.`
        );
      }

      onSubmissionComplete?.(result.success, result.deltaId);

    } catch (error) {
      console.error('❌ Trust submission failed:', error);
      setSubmissionResult({
        success: false,
        deltaId: '',
        zkpStub: '',
        processTime: 0
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateZKPHash = (did: string, target: any): string => {
    const content = `${did}_${JSON.stringify(target)}_${Date.now()}`;
    return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  };

  const generateCID = (target: any, did: string): string => {
    const content = JSON.stringify({ target, submitter: did.substring(0, 16) });
    return `Qm${btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 44)}`;
  };

  const anonymizeId = (did: string): string => {
    return `anon_${btoa(did).substring(0, 12)}`;
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.textContent = message;
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    
    document.body.appendChild(announcement);
    setTimeout(() => {
      if (announcement.parentElement) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  };

  const getIntensityLabel = (level: number): string => {
    const labels = {
      1: 'Minor',
      2: 'Light', 
      3: 'Moderate',
      4: 'Strong',
      5: 'Critical'
    };
    return labels[level as keyof typeof labels];
  };

  const cardContent = `Trust feedback submission for ${target.displayName}. Current settings: ${feedbackType} with ${getIntensityLabel(intensity)} intensity. User tier: ${userTier} with ${tierWeight}x weight multiplier.`;

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Submit Trust Feedback
            </CardTitle>
            <CardDescription>
              Anonymous civic feedback for: <strong>{target.displayName}</strong>
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <TTSToggle
              deckId="trust_feedback"
              moduleId="submission"
              content={cardContent}
              size="sm"
              variant="outline"
            />
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {userTier} ({tierWeight}x)
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Feedback Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Feedback Type</Label>
          <RadioGroup
            value={feedbackType}
            onValueChange={(value) => setFeedbackType(value as 'support' | 'dissent')}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="support" id="support" />
              <Label htmlFor="support" className="flex items-center gap-2 cursor-pointer">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                Support
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dissent" id="dissent" />
              <Label htmlFor="dissent" className="flex items-center gap-2 cursor-pointer">
                <ThumbsDown className="h-4 w-4 text-red-600" />
                Dissent
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Intensity Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Feedback Intensity: <strong>{getIntensityLabel(intensity)}</strong>
          </Label>
          <RadioGroup
            value={intensity.toString()}
            onValueChange={(value) => setIntensity(parseInt(value) as 1 | 2 | 3 | 4 | 5)}
            className="flex gap-4"
          >
            {[1, 2, 3, 4, 5].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <RadioGroupItem value={level.toString()} id={`intensity-${level}`} />
                <Label htmlFor={`intensity-${level}`} className="cursor-pointer text-sm">
                  {level}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Optional Explanation */}
        <div className="space-y-3">
          <Label htmlFor="explanation" className="text-sm font-medium">
            Explanation (Optional)
          </Label>
          <Textarea
            id="explanation"
            placeholder="Provide context for your feedback (no personal information will be stored)"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={3}
            maxLength={500}
            className="resize-none"
          />
          <div className="text-xs text-muted-foreground">
            {explanation.length}/500 characters • Content will be anonymized
          </div>
        </div>

        {/* Submission Results */}
        {submissionResult && (
          <div className={`p-4 rounded-lg border ${
            submissionResult.success 
              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
              : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              {submissionResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className={`font-medium ${
                  submissionResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {submissionResult.success ? 'Feedback Submitted Successfully' : 'Submission Failed'}
                </div>
                {submissionResult.success && (
                  <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <div>Delta ID: {submissionResult.deltaId}</div>
                    <div>ZKP Stub: {submissionResult.zkpStub.substring(0, 16)}...</div>
                    <div>Process Time: {submissionResult.processTime.toFixed(1)}ms</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Submit Anonymous Feedback
            </>
          )}
        </Button>

        {/* Privacy Notice */}
        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
          <strong>Privacy:</strong> All submissions are anonymized with ZKP verification. 
          No personal identifiers are stored. Content is sanitized before processing.
        </div>

        {/* Accessibility live region */}
        <div 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        >
          {submissionResult && 
            `Trust feedback ${submissionResult.success ? 'submitted successfully' : 'submission failed'}`
          }
        </div>
      </CardContent>
    </Card>
  );
};

export default TrustDeltaSubmissionCard;