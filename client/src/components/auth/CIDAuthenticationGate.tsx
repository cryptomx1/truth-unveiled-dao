import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Lock } from 'lucide-react';

interface CIDAuthenticationGateProps {
  onValidate: (cid: string) => Promise<boolean>;
  title?: string;
  description?: string;
}

export const CIDAuthenticationGate: React.FC<CIDAuthenticationGateProps> = ({
  onValidate,
  title = "CID Authentication Required",
  description = "Please provide your Civic Identity Decentralized ID (CID) to access this protected content."
}) => {
  const [cid, setCid] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (!cid.trim()) {
      setError('Please enter a valid CID');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const isValid = await onValidate(cid);
      if (!isValid) {
        setError('Invalid CID or authentication failed');
      }
    } catch (error) {
      setError('Authentication error occurred');
    } finally {
      setIsValidating(false);
    }
  };

  const handleQuickAuth = (testCid: string) => {
    setCid(testCid);
    setError('');
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            {title}
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {description}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Enter your CID (e.g., cid:civic:...)"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              className="w-full"
              disabled={isValidating}
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                {error}
              </p>
            )}
          </div>
          
          <Button 
            onClick={handleValidate}
            disabled={isValidating || !cid.trim()}
            className="w-full"
          >
            {isValidating ? 'Validating...' : 'Authenticate'}
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Quick test authentication:</p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleQuickAuth('cid:civic:test123')}
                disabled={isValidating}
              >
                Test CID
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleQuickAuth('cid:wallet:demo456')}
                disabled={isValidating}
              >
                Demo CID
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};