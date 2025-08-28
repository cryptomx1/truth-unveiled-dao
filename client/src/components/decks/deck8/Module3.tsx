import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCIDAuthentication } from '@/hooks/useCIDAuthentication';
import { CIDAuthenticationGate } from '@/components/auth/CIDAuthenticationGate';
import { FileCheck, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface AuditComplianceProps {
  moduleId?: string;
  restrictedContent?: boolean;
}

export const Deck8Module3: React.FC<AuditComplianceProps> = ({ 
  moduleId = 'audit-compliance',
  restrictedContent = true 
}) => {
  const { isAuthenticated, cidStatus, validateCID } = useCIDAuthentication();

  if (restrictedContent && !isAuthenticated) {
    return (
      <CIDAuthenticationGate 
        onValidate={validateCID}
        title="Audit Compliance Module"
        description="Access to audit compliance data requires CID authentication for regulatory compliance."
      />
    );
  }

  const auditMetrics = {
    complianceScore: 94,
    completedAudits: 15,
    pendingReviews: 3,
    criticalIssues: 0,
    resolvedIssues: 28,
    lastAuditDate: '2025-01-20'
  };

  const complianceAreas = [
    { name: 'Data Privacy', score: 96, status: 'compliant', color: 'bg-green-500' },
    { name: 'Financial Reporting', score: 93, status: 'compliant', color: 'bg-green-500' },
    { name: 'Security Standards', score: 98, status: 'compliant', color: 'bg-green-500' },
    { name: 'Governance Process', score: 89, status: 'review', color: 'bg-yellow-500' },
    { name: 'Operational Transparency', score: 92, status: 'compliant', color: 'bg-green-500' }
  ];

  const recentAudits = [
    { id: 1, type: 'Security Audit', date: '2025-01-20', status: 'Completed', findings: 2 },
    { id: 2, type: 'Privacy Compliance', date: '2025-01-15', status: 'Completed', findings: 0 },
    { id: 3, type: 'Governance Review', date: '2025-01-10', status: 'In Progress', findings: 3 },
    { id: 4, type: 'Financial Audit', date: '2025-01-05', status: 'Completed', findings: 1 }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Deck 8 Module 3: Audit Compliance
            <Badge variant="outline" className="ml-auto">
              Authenticated Access
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {auditMetrics.complianceScore}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Overall Compliance
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {auditMetrics.completedAudits}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Completed Audits
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {auditMetrics.pendingReviews}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Pending Reviews
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {auditMetrics.criticalIssues}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Critical Issues
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceAreas.map((area, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{area.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{area.score}%</span>
                    {area.status === 'compliant' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                </div>
                <Progress value={area.score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Audits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAudits.map((audit) => (
              <div key={audit.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                  <div className="font-medium">{audit.type}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{audit.date}</div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={audit.status === 'Completed' ? 'default' : 'secondary'}
                    className="mb-1"
                  >
                    {audit.status}
                  </Badge>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {audit.findings} findings
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CID Status Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Authentication Status:</span>
            <Badge variant={cidStatus === 'valid' ? 'default' : 'secondary'}>
              CID {cidStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deck8Module3;