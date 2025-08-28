/**
 * IdentityCard - Phase XI-E Translation Integration
 * Using useTranslation hook for multilingual support
 * Authority: Commander Mark | JASMY Relay authorization
 */

import React, { useState, useEffect } from 'react';
import { Shield, User, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../../translation/useTranslation';
import { useLangContext } from '../../../context/LanguageContext';

interface IdentityCardProps {
  did?: string;
  verificationLevel?: 'basic' | 'enhanced' | 'civic-grade';
  credentialCount?: number;
  className?: string;
  onVerify?: () => void;
}

interface Credential {
  id: string;
  type: string;
  issuer: string;
  status: 'active' | 'pending' | 'expired';
  issuedAt: Date;
}

export const IdentityCard: React.FC<IdentityCardProps> = ({
  did = "did:civic:user_abc123",
  verificationLevel = 'enhanced',
  credentialCount = 3,
  className = '',
  onVerify
}) => {
  const { t } = useTranslation();
  const { language } = useLangContext();
  const [credentials] = useState<Credential[]>([
    {
      id: 'cred_1',
      type: 'Civic ID',
      issuer: 'Truth Unveiled DAO',
      status: 'active',
      issuedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    {
      id: 'cred_2', 
      type: 'Voting Credential',
      issuer: 'Regional Authority',
      status: 'active',
      issuedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
    },
    {
      id: 'cred_3',
      type: 'Trust Badge',
      issuer: 'Community Council',
      status: 'pending',
      issuedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
  ]);
  const [showCredentials, setShowCredentials] = useState(false);

  // Console log when component re-renders in different language
  useEffect(() => {
    console.log(`🈳 IdentityCard re-rendered in: ${language.toUpperCase()}`);
  }, [language]);

  const getVerificationColor = (level: string) => {
    switch (level) {
      case 'civic-grade':
        return 'text-emerald-400 bg-emerald-600/20 border-emerald-500/50';
      case 'enhanced':
        return 'text-blue-400 bg-blue-600/20 border-blue-500/50';
      case 'basic':
        return 'text-yellow-400 bg-yellow-600/20 border-yellow-500/50';
      default:
        return 'text-slate-400 bg-slate-600/20 border-slate-500/50';
    }
  };

  const getCredentialStatusIcon = (status: Credential['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'pending':
        return <AlertCircle className="w-3 h-3 text-yellow-400" />;
      case 'expired':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return '1 day ago';
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <div className={`bg-slate-800 rounded-lg p-4 max-w-md mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-5 h-5 text-emerald-400" />
        <div>
          <h3 className="text-base font-semibold text-white">
            {t('card.identity.title')}
          </h3>
          <p className="text-xs text-slate-400">
            {t('card.identity.description')}
          </p>
        </div>
      </div>

      {/* DID Display */}
      <div className="mb-4 p-3 bg-slate-700/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">{t('card.identity.did')}</span>
          <div className={`px-2 py-1 rounded border text-xs ${getVerificationColor(verificationLevel)}`}>
            {verificationLevel.charAt(0).toUpperCase() + verificationLevel.slice(1).replace('-', ' ')}
          </div>
        </div>
        <div className="text-xs text-emerald-400 font-mono break-all">
          {did}
        </div>
      </div>

      {/* Identity Stats */}
      <div className="mb-4 p-3 bg-slate-700/20 rounded-lg">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="text-center">
            <div className="text-blue-400 font-semibold">{credentials.length}</div>
            <div className="text-slate-400">Credentials</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-semibold">
              {credentials.filter(c => c.status === 'active').length}
            </div>
            <div className="text-slate-400">Active</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-semibold">
              {credentials.filter(c => c.status === 'pending').length}
            </div>
            <div className="text-slate-400">Pending</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mb-4">
        <button
          onClick={onVerify}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-300 transition-colors"
          aria-label={t('aria.identity.verify')}
        >
          <Key className="w-4 h-4" />
          <span className="text-sm">{t('card.identity.verify')}</span>
        </button>
        <button
          onClick={() => setShowCredentials(!showCredentials)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-300 transition-colors"
          aria-label={t('card.identity.credentials')}
        >
          <User className="w-4 h-4" />
          <span className="text-sm">{t('card.identity.credentials')}</span>
        </button>
      </div>

      {/* Credentials List */}
      {showCredentials && (
        <div className="mb-4 p-3 bg-slate-700/20 rounded-lg">
          <h4 className="text-sm text-slate-300 mb-2">Your Credentials</h4>
          <div className="space-y-2">
            {credentials.map((credential) => (
              <div key={credential.id} className="flex items-center justify-between p-2 bg-slate-600/30 rounded">
                <div className="flex items-center gap-2">
                  {getCredentialStatusIcon(credential.status)}
                  <div>
                    <div className="text-xs text-white font-medium">{credential.type}</div>
                    <div className="text-xs text-slate-400">by {credential.issuer}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  {formatTimeAgo(credential.issuedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="p-2 bg-slate-700/20 rounded text-xs text-slate-400">
        <div className="mb-1">• Your identity is secured with zero-knowledge proofs</div>
        <div>• Credentials are verified through decentralized consensus</div>
      </div>
    </div>
  );
};

export default IdentityCard;