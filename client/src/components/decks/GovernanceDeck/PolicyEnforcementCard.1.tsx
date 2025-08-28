import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  Shield,
  AlertTriangle,
  FileText,
  Scale,
  Volume2,
  Clock,
  Crown,
  Users
} from 'lucide-react';

type PolicyType = 'curfew' | 'permit-rules' | 'public-space-access' | 'noise-ordinance';
type UserRole = 'governor' | 'citizen' | 'delegate';

interface PolicyOverviewData {
  id: string;
  policyType: PolicyType;
  title: string;
  description: string;
  scope: 'local' | 'regional' | 'national';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  userRole: UserRole;
  effectiveDate: Date;
  lastUpdated: Date;
}

interface PolicyOverviewProps {
  className?: string;
}

// Mock policy overview data
const MOCK_POLICY_OVERVIEW: Record<PolicyType, PolicyOverviewData> = {
  'curfew': {
    id: 'policy_001',
    policyType: 'curfew',
    title: 'Civic Curfew Enforcement',
    description: 'Enforces curfew regulations for public safety zones between 10 PM and 6 AM',
    scope: 'local',
    urgency: 'high',
    userRole: 'governor',
    effectiveDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  'permit-rules': {
    id: 'policy_002',
    policyType: 'permit-rules',
    title: 'Construction Permit Rules',
    description: 'Validates construction permits and compliance with safety regulations',
    scope: 'regional',
    urgency: 'medium',
    userRole: 'delegate',
    effectiveDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  'public-space-access': {
    id: 'policy_003',
    policyType: 'public-space-access',
    title: 'Public Space Access Control',
    description: 'Manages access to public spaces and facilities during events',
    scope: 'local',
    urgency: 'medium',
    userRole: 'citizen',
    effectiveDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  'noise-ordinance': {
    id: 'policy_004',
    policyType: 'noise-ordinance',
    title: 'Noise Ordinance Regulations',
    description: 'Controls noise levels in residential and commercial areas',
    scope: 'local',
    urgency: 'low',
    userRole: 'citizen',
    effectiveDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  }
};

// Get policy type display info
const getPolicyTypeInfo = (policyType: PolicyType) => {
  switch (policyType) {
    case 'curfew':
      return { 
        label: 'Curfew Enforcement', 
        icon: Clock, 
        color: 'bg-red-500' 
      };
    case 'permit-rules':
      return { 
        label: 'Permit Rules', 
        icon: FileText, 
        color: 'bg-blue-500' 
      };
    case 'public-space-access':
      return { 
        label: 'Public Space Access', 
        icon: Users, 
        color: 'bg-green-500' 
      };
    case 'noise-ordinance':
      return { 
        label: 'Noise Ordinance', 
        icon: Volume2, 
        color: 'bg-purple-500' 
      };
    default:
      return { 
        label: 'Unknown Policy', 
        icon: AlertTriangle, 
        color: 'bg-gray-500' 
      };
  }
};

// Get user role display info
const getUserRoleInfo = (role: UserRole) => {
  switch (role) {
    case 'governor':
      return { 
        label: 'Governor', 
        icon: Crown, 
        color: 'text-yellow-400' 
      };
    case 'delegate':
      return { 
        label: 'Delegate', 
        icon: Users, 
        color: 'text-blue-400' 
      };
    case 'citizen':
      return { 
        label: 'Citizen', 
        icon: Users, 
        color: 'text-green-400' 
      };
    default:
      return { 
        label: 'Unknown', 
        icon: AlertTriangle, 
        color: 'text-gray-400' 
      };
  }
};

// Get urgency color
const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'critical':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export const PolicyOverview: React.FC<PolicyOverviewProps> = ({ className }) => {
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType>('curfew');
  const [currentPolicy, setCurrentPolicy] = useState<PolicyOverviewData>(MOCK_POLICY_OVERVIEW.curfew);
  const [renderStartTime] = useState(performance.now());

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`PolicyOverview render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`PolicyOverview render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // Handle policy selection change
  const handlePolicyChange = (policyType: PolicyType) => {
    setSelectedPolicy(policyType);
    setCurrentPolicy(MOCK_POLICY_OVERVIEW[policyType]);
  };

  const policyInfo = getPolicyTypeInfo(currentPolicy.policyType);
  const roleInfo = getUserRoleInfo(currentPolicy.userRole);
  const PolicyIcon = policyInfo.icon;
  const RoleIcon = roleInfo.icon;

  return (
    <Card 
      className={cn(
        'bg-slate-800 border-slate-700 shadow-xl max-h-[600px] w-full overflow-hidden',
        className
      )}
      role="region"
      aria-label="Policy Overview"
      data-testid="policy-overview"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', policyInfo.color)}>
              <PolicyIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-white">Policy Overview</CardTitle>
              <CardDescription className="text-slate-400">Select and review policy details</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <RoleIcon className={cn('w-4 h-4', roleInfo.color)} />
            <span className={cn('text-sm font-medium', roleInfo.color)}>{roleInfo.label}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Policy Selection */}
        <div className="space-y-2">
          <label htmlFor="policy-select" className="text-sm font-medium text-white">
            Select Policy Type
          </label>
          <Select value={selectedPolicy} onValueChange={handlePolicyChange}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Choose a policy..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="curfew" className="text-white hover:bg-slate-800">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Curfew Enforcement</span>
                </div>
              </SelectItem>
              <SelectItem value="permit-rules" className="text-white hover:bg-slate-800">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Permit Rules</span>
                </div>
              </SelectItem>
              <SelectItem value="public-space-access" className="text-white hover:bg-slate-800">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Public Space Access</span>
                </div>
              </SelectItem>
              <SelectItem value="noise-ordinance" className="text-white hover:bg-slate-800">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4" />
                  <span>Noise Ordinance</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Policy Details */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 space-y-4">
          {/* Policy Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">{currentPolicy.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{currentPolicy.description}</p>
            </div>
            <Badge className={cn('text-white', getUrgencyColor(currentPolicy.urgency))}>
              {currentPolicy.urgency.toUpperCase()}
            </Badge>
          </div>

          {/* Policy Metadata */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Policy ID:</span>
              <span className="text-sm font-mono text-slate-300">{currentPolicy.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Scope:</span>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                {currentPolicy.scope.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Effective Date:</span>
              <span className="text-sm text-slate-300">
                {currentPolicy.effectiveDate.toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Last Updated:</span>
              <span className="text-sm text-slate-300">
                {currentPolicy.lastUpdated.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Policy Status Indicator */}
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Policy Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Active</span>
            </div>
          </div>
        </div>

        {/* Cross-Deck Integration Notice */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-400">
              Cross-deck verification with Deck #11 (credentials), Deck #12 (DID), and ZKP signatures
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PolicyOverview;