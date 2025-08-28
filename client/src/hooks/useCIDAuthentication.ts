import { useState, useEffect } from 'react';

export interface CIDAuthenticationResult {
  isAuthenticated: boolean;
  cidStatus: 'checking' | 'valid' | 'invalid' | 'expired';
  userTier: string;
  validateCID: (cid?: string) => Promise<boolean>;
  logout: () => void;
}

export const useCIDAuthentication = (): CIDAuthenticationResult => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cidStatus, setCidStatus] = useState<'checking' | 'valid' | 'invalid' | 'expired'>('checking');
  const [userTier, setUserTier] = useState('Citizen');

  useEffect(() => {
    // Check for existing authentication on mount
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    setCidStatus('checking');
    
    try {
      // Check localStorage for existing CID
      const storedCID = localStorage.getItem('civic_cid');
      const storedTier = localStorage.getItem('civic_tier');
      const authExpiry = localStorage.getItem('civic_auth_expiry');

      if (!storedCID) {
        setCidStatus('invalid');
        setIsAuthenticated(false);
        return false;
      }

      // Check expiry
      if (authExpiry && Date.now() > parseInt(authExpiry)) {
        setCidStatus('expired');
        setIsAuthenticated(false);
        localStorage.removeItem('civic_cid');
        localStorage.removeItem('civic_tier');
        localStorage.removeItem('civic_auth_expiry');
        return false;
      }

      // Validate CID format and authenticity
      const isValid = await validateCIDFormat(storedCID);
      
      if (isValid) {
        setCidStatus('valid');
        setIsAuthenticated(true);
        setUserTier(storedTier || 'Citizen');
        console.log('🔐 CID authentication restored:', storedCID.substring(0, 12) + '...');
        return true;
      } else {
        setCidStatus('invalid');
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('CID authentication check failed:', error);
      setCidStatus('invalid');
      setIsAuthenticated(false);
      return false;
    }
  };

  const validateCID = async (cid?: string): Promise<boolean> => {
    setCidStatus('checking');
    
    try {
      // Use provided CID or try to get from localStorage
      const cidToValidate = cid || localStorage.getItem('civic_cid');
      
      if (!cidToValidate) {
        setCidStatus('invalid');
        setIsAuthenticated(false);
        return false;
      }

      // Validate CID format and authenticity
      const isValid = await validateCIDFormat(cidToValidate);
      
      if (isValid) {
        // Store authentication
        const authExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        localStorage.setItem('civic_cid', cidToValidate);
        localStorage.setItem('civic_tier', userTier);
        localStorage.setItem('civic_auth_expiry', authExpiry.toString());
        
        setCidStatus('valid');
        setIsAuthenticated(true);
        
        console.log('✅ CID authentication successful:', cidToValidate.substring(0, 12) + '...');
        return true;
      } else {
        setCidStatus('invalid');
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('CID validation failed:', error);
      setCidStatus('invalid');
      setIsAuthenticated(false);
      return false;
    }
  };

  const validateCIDFormat = async (cid: string): Promise<boolean> => {
    // Basic CID format validation
    if (!cid || cid.length < 20) {
      return false;
    }

    // Check for valid CID prefixes (both v0 and v1)
    if (!cid.startsWith('Qm') && !cid.startsWith('bafy') && !cid.startsWith('baf2') && !cid.startsWith('cid:')) {
      return false;
    }

    // For mock/development purposes, accept test CIDs
    const testCIDs = [
      'cid:civic:test123',
      'cid:wallet:test456',
      'QmTestCID123456789',
      'bafybeigtest123456789'
    ];

    if (testCIDs.some(testCID => cid.includes(testCID))) {
      return true;
    }

    // Simulate network validation with random success
    // In production, this would make an actual API call to validate the CID
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    // 90% success rate for valid-looking CIDs
    return Math.random() > 0.1;
  };

  const logout = () => {
    localStorage.removeItem('civic_cid');
    localStorage.removeItem('civic_tier');
    localStorage.removeItem('civic_auth_expiry');
    setIsAuthenticated(false);
    setCidStatus('invalid');
    setUserTier('Citizen');
    console.log('🔒 CID authentication cleared');
  };

  return {
    isAuthenticated,
    cidStatus,
    userTier,
    validateCID,
    logout
  };
};

// Export additional components
export default useCIDAuthentication;