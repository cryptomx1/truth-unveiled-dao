import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, Shield, X, Award } from 'lucide-react';
import { useUserSession } from '@/components/system/UserSessionEngine';

interface ReferrerProfile {
  cid: string;
  name: string;
  alias: string;
  tpRank: string;
  truthCoins: number;
  reputation: number;
  isValid: boolean;
}

interface MissionReferrerOverlayProps {
  onAccept?: (referrerData: ReferrerProfile) => void;
  onDismiss?: () => void;
  onIndependentProceed?: () => void;
}

export function MissionReferrerOverlay({ 
  onAccept, 
  onDismiss, 
  onIndependentProceed 
}: MissionReferrerOverlayProps) {
  const [referrerProfile, setReferrerProfile] = useState<ReferrerProfile | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const { session, setSession } = useUserSession();

  // Mock referrer registry for validation
  const mockReferrerRegistry: Record<string, ReferrerProfile> = {
    'cid:u:ally-123': {
      cid: 'cid:u:ally-123',
      name: 'Commander Sarah',
      alias: 'CivicGuardian',
      tpRank: 'Consensus Architect',
      truthCoins: 7,
      reputation: 94,
      isValid: true
    },
    'code123': {
      cid: 'cid:u:mark-456',
      name: 'Commander Mark',
      alias: 'TruthSeeker',
      tpRank: 'Commander',
      truthCoins: 8,
      reputation: 98,
      isValid: true
    },
    'cid:u:civic-789': {
      cid: 'cid:u:civic-789',
      name: 'Delegate Elena',
      alias: 'PolicyCraft',
      tpRank: 'Civic Guide',
      truthCoins: 5,
      reputation: 87,
      isValid: true
    }
  };

  const detectReferralCode = (): string | null => {
    // Check URL query parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get('ref');
    
    if (refFromUrl) {
      console.log('🔗 Referral detected from URL:', refFromUrl);
      return refFromUrl;
    }

    // Fallback to localStorage
    const refFromStorage = localStorage.getItem('civic_referral_code');
    if (refFromStorage) {
      console.log('🔗 Referral detected from storage:', refFromStorage);
      return refFromStorage;
    }

    return null;
  };

  const validateReferralCode = (code: string): ReferrerProfile | null => {
    const profile = mockReferrerRegistry[code];
    if (profile && profile.isValid) {
      console.log('✅ Referral validated:', profile);
      return profile;
    }
    
    console.log('❌ Referral validation failed for code:', code);
    return null;
  };

  const logReferralTrace = (referrer: ReferrerProfile) => {
    const traceEntry = {
      timestamp: new Date().toISOString(),
      referrerCid: referrer.cid,
      referrerAlias: referrer.alias,
      eventType: 'mission_referral_accepted',
      sessionId: Date.now().toString(),
      metadata: {
        tpRank: referrer.tpRank,
        reputation: referrer.reputation,
        truthCoins: referrer.truthCoins
      }
    };

    // Store in localStorage for CivicMissionLedger.ts integration
    const existingTraces = JSON.parse(localStorage.getItem('civic_mission_ledger') || '[]');
    existingTraces.push(traceEntry);
    localStorage.setItem('civic_mission_ledger', JSON.stringify(existingTraces));
    
    console.log('📋 Referral trace logged to CivicMissionLedger:', traceEntry);
  };

  const handleAcceptReferral = () => {
    if (!referrerProfile) return;

    // Log referral trace
    logReferralTrace(referrerProfile);

    // Store referral acceptance in UserSessionEngine  
    setSession({
      status: 'active'
    });

    // Store for TruthAffiliateTokenBridge sync
    localStorage.setItem('pending_affiliate_sync', JSON.stringify({
      referrerCid: referrerProfile.cid,
      timestamp: new Date().toISOString(),
      status: 'pending_onboard'
    }));

    console.log('🪪 Mission invite accepted from:', referrerProfile.alias);
    
    setFadeOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onAccept?.(referrerProfile);
    }, 300);
  };

  const handleDismiss = () => {
    setFadeOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  const handleIndependentProceed = () => {
    console.log('🚶 Proceeding as independent citizen');
    
    // Still log the attempt for analytics
    const traceEntry = {
      timestamp: new Date().toISOString(),
      eventType: 'independent_citizen_proceed',
      referralCode: 'none',
      sessionId: Date.now().toString()
    };

    const existingTraces = JSON.parse(localStorage.getItem('civic_mission_ledger') || '[]');
    existingTraces.push(traceEntry);
    localStorage.setItem('civic_mission_ledger', JSON.stringify(existingTraces));

    setFadeOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onIndependentProceed?.();
    }, 300);
  };

  useEffect(() => {
    const referralCode = detectReferralCode();
    
    if (referralCode) {
      const profile = validateReferralCode(referralCode);
      
      if (profile) {
        setReferrerProfile(profile);
        setIsVisible(true);
        
        // Auto-fade after 15 seconds if no action taken
        const autoFadeTimer = setTimeout(() => {
          if (isVisible) {
            console.log('⏰ Referral overlay auto-fading after 15 seconds');
            handleDismiss();
          }
        }, 15000);

        return () => clearTimeout(autoFadeTimer);
      } else {
        // Invalid referral - show fallback briefly
        setReferrerProfile({
          cid: 'invalid',
          name: 'Unknown',
          alias: 'Unknown',
          tpRank: 'Unknown',
          truthCoins: 0,
          reputation: 0,
          isValid: false
        });
        setIsVisible(true);
        
        // Auto-dismiss invalid referral after 5 seconds
        setTimeout(() => {
          handleIndependentProceed();
        }, 5000);
      }
    }
  }, []);

  if (!isVisible || !referrerProfile) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      role="dialog"
      aria-label="Referral Invite Detected — Begin Mission"
    >
      <Card className={`w-full max-w-md bg-slate-800 border-slate-700 text-white shadow-2xl transform transition-all duration-300 ${
        fadeOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold">Mission Invite</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white"
              aria-label="Dismiss referral invite"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {referrerProfile.isValid ? (
            <>
              <div className="text-center mb-6">
                <div className="text-2xl mb-2">🪪</div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Mission Invite from {referrerProfile.name}
                </h3>
                <p className="text-slate-300">Accept your Civic Path</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Alias:</span>
                  <span className="text-blue-400 font-medium">{referrerProfile.alias}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Rank:</span>
                  <span className="text-purple-400 font-medium">{referrerProfile.tpRank}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">TruthCoins:</span>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">{referrerProfile.truthCoins}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Reputation:</span>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">{referrerProfile.reputation}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAcceptReferral}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                  aria-label="Accept mission invite and begin onboarding"
                >
                  Accept Invite & Begin Mission
                </Button>
                <Button
                  onClick={handleIndependentProceed}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  aria-label="Proceed as independent citizen"
                >
                  Proceed as Independent Citizen
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="text-2xl mb-2">⚠️</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-1">
                  Referral Not Found
                </h3>
                <p className="text-slate-300">Proceed as independent citizen</p>
              </div>

              <Button
                onClick={handleIndependentProceed}
                className="w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-3"
                aria-label="Continue to standard onboarding"
              >
                Continue to Mission Briefing
              </Button>
            </>
          )}

          <div className="text-xs text-slate-400 text-center mt-4">
            CID: {referrerProfile.cid}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}