import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Link, Shield, X, RefreshCw, AlertCircle, Copy } from 'lucide-react';
import { MunicipalCIDBinder } from './MunicipalCIDBinder';

interface MunicipalCIDBinderProps {
  nodeId: string;
  onClose: () => void;
}

interface BindingStatus {
  credentialExists: boolean;
  federationBound: boolean;
  verificationComplete: boolean;
  governanceScore: number;
  lastUpdate: string;
}

export const MunicipalCIDBinderComponent: React.FC<MunicipalCIDBinderProps> = ({
  nodeId,
  onClose
}) => {
  const [binder] = useState(() => MunicipalCIDBinder.getInstance());
  const [bindingStatus, setBindingStatus] = useState<BindingStatus>({
    credentialExists: false,
    federationBound: false,
    verificationComplete: false,
    governanceScore: 0,
    lastUpdate: ''
  });
  const [isBinding, setIsBinding] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadBindingStatus = async () => {
    try {
      const credential = binder.getCredential(nodeId);
      const binding = binder.getBinding(nodeId);

      setBindingStatus({
        credentialExists: !!credential,
        federationBound: !!binding && binding.federationSync,
        verificationComplete: credential?.verificationStatus === 'verified',
        governanceScore: credential?.governanceScore || 0,
        lastUpdate: credential?.lastUpdated || ''
      });

      console.log(`🔗 Binding status loaded for node: ${nodeId}`);
    } catch (error) {
      console.error('❌ Failed to load binding status:', error);
      setError('Failed to load binding status');
    }
  };

  const handleCreateCredential = async () => {
    try {
      setError(null);
      setIsBinding(true);

      // Mock credential creation for demo
      await binder.createMunicipalCredential(
        nodeId,
        `Municipal Node ${nodeId}`,
        'Demo Jurisdiction',
        btoa(JSON.stringify({
          proofType: 'municipal-verification',
          timestamp: new Date().toISOString(),
          nodeId
        })),
        ['demo@gov.local']
      );

      await loadBindingStatus();
      setSuccess('Municipal credential created successfully');
    } catch (error) {
      console.error('❌ Credential creation failed:', error);
      setError('Failed to create municipal credential');
    } finally {
      setIsBinding(false);
    }
  };

  const handleBindToFederation = async () => {
    try {
      setError(null);
      setIsBinding(true);

      await binder.bindToFederation(nodeId);
      await loadBindingStatus();
      setSuccess('Successfully bound to federation network');
    } catch (error) {
      console.error('❌ Federation binding failed:', error);
      setError('Failed to bind to federation network');
    } finally {
      setIsBinding(false);
    }
  };

  const handleVerifyCredential = async () => {
    try {
      setError(null);
      setIsVerifying(true);

      const verified = await binder.verifyCredential(nodeId);
      await loadBindingStatus();
      
      if (verified) {
        setSuccess('Credential verification completed');
      } else {
        setError('Credential verification failed');
      }
    } catch (error) {
      console.error('❌ Verification failed:', error);
      setError('Verification process failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyCredentialData = () => {
    const credential = binder.getCredential(nodeId);
    if (credential) {
      const credentialData = {
        cid: credential.cid,
        didHash: credential.didHash,
        status: credential.verificationStatus,
        governanceScore: credential.governanceScore
      };
      navigator.clipboard.writeText(JSON.stringify(credentialData, null, 2));
      setSuccess('Credential data copied to clipboard');
    }
  };

  const getStatusColor = (completed: boolean) => {
    return completed ? 'text-green-400' : 'text-slate-400';
  };

  const getStatusIcon = (completed: boolean) => {
    return completed ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />;
  };

  const calculateProgress = () => {
    const steps = [
      bindingStatus.credentialExists,
      bindingStatus.federationBound,
      bindingStatus.verificationComplete
    ];
    return Math.round((steps.filter(Boolean).length / steps.length) * 100);
  };

  useEffect(() => {
    loadBindingStatus();
  }, [nodeId]);

  const credential = binder.getCredential(nodeId);
  const binding = binder.getBinding(nodeId);
  const progress = calculateProgress();

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Link className="w-5 h-5 text-blue-400" />
              Municipal CID Binding
            </CardTitle>
            <CardDescription className="text-slate-400">
              Connect municipal node {nodeId} to federation network
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Overview */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Integration Progress</span>
            <span className="text-white">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Alerts */}
        {error && (
          <Alert className="border-red-500 bg-red-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-900/20">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        {/* Binding Status Steps */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg">
            <div className={getStatusColor(bindingStatus.credentialExists)}>
              {getStatusIcon(bindingStatus.credentialExists)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Municipal Credential</h3>
              <p className="text-sm text-slate-400">Generate CID and DID for municipal identity</p>
            </div>
            <div className="flex gap-2">
              <Badge className={bindingStatus.credentialExists ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                {bindingStatus.credentialExists ? 'Created' : 'Pending'}
              </Badge>
              {!bindingStatus.credentialExists && (
                <Button
                  onClick={handleCreateCredential}
                  disabled={isBinding}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isBinding ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create'}
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg">
            <div className={getStatusColor(bindingStatus.federationBound)}>
              {getStatusIcon(bindingStatus.federationBound)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Federation Binding</h3>
              <p className="text-sm text-slate-400">Connect to decentralized federation network</p>
            </div>
            <div className="flex gap-2">
              <Badge className={bindingStatus.federationBound ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                {bindingStatus.federationBound ? 'Bound' : 'Unbound'}
              </Badge>
              {bindingStatus.credentialExists && !bindingStatus.federationBound && (
                <Button
                  onClick={handleBindToFederation}
                  disabled={isBinding}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isBinding ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Bind'}
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg">
            <div className={getStatusColor(bindingStatus.verificationComplete)}>
              {getStatusIcon(bindingStatus.verificationComplete)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Verification Complete</h3>
              <p className="text-sm text-slate-400">ZKP verification and credential validation</p>
            </div>
            <div className="flex gap-2">
              <Badge className={bindingStatus.verificationComplete ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                {bindingStatus.verificationComplete ? 'Verified' : 'Pending'}
              </Badge>
              {bindingStatus.credentialExists && !bindingStatus.verificationComplete && (
                <Button
                  onClick={handleVerifyCredential}
                  disabled={isVerifying}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Credential Details */}
        {credential && (
          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Credential Details</h3>
              <Button
                onClick={handleCopyCredentialData}
                variant="outline"
                size="sm"
                className="border-slate-500 text-slate-300 hover:bg-slate-600"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Entity:</span>
                <p className="text-white font-medium">{credential.entityName}</p>
              </div>
              <div>
                <span className="text-slate-400">Jurisdiction:</span>
                <p className="text-white font-medium">{credential.jurisdiction}</p>
              </div>
              <div>
                <span className="text-slate-400">CID:</span>
                <p className="text-white font-mono text-xs break-all">{credential.cid}</p>
              </div>
              <div>
                <span className="text-slate-400">DID Hash:</span>
                <p className="text-white font-mono text-xs break-all">{credential.didHash}</p>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <Badge className={
                  credential.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                  credential.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {credential.verificationStatus}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400">Governance Score:</span>
                <p className="text-white font-medium">{credential.governanceScore}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Federation Binding Details */}
        {binding && (
          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
            <h3 className="font-semibold text-white mb-4">Federation Binding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Binding Hash:</span>
                <p className="text-white font-mono text-xs break-all">{binding.bindingHash}</p>
              </div>
              <div>
                <span className="text-slate-400">Verification Proof:</span>
                <p className="text-white font-mono text-xs">{binding.verificationProof}</p>
              </div>
              <div>
                <span className="text-slate-400">Sync Status:</span>
                <Badge className={binding.federationSync ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {binding.federationSync ? 'Synchronized' : 'Out of Sync'}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400">Bound At:</span>
                <p className="text-white">{new Date(binding.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-slate-600">
          <Button
            variant="outline"
            onClick={loadBindingStatus}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
          
          {progress === 100 && (
            <Button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};