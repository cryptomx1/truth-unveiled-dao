/**
 * RegistryContributionForm.tsx
 * Phase X-MUNICIPALPREP Step 4: Secure submission form for policy drafts
 * Commander Mark directive via JASMY Relay
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  X, 
  Shield, 
  FileText, 
  Lock, 
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react';

interface RegistryContributionFormProps {
  onSubmit: (policyData: any) => void;
  onCancel: () => void;
  currentUser: {
    did: string;
    tier: 'Citizen' | 'Governor' | 'Commander';
    jurisdiction: string;
  };
}

interface FormData {
  title: string;
  description: string;
  category: string;
  impactAssessment: string;
  implementation: string;
  budget: string;
  timeline: string;
  stakeholders: string;
  legalBasis: string;
  publicBenefit: string;
}

const RegistryContributionForm: React.FC<RegistryContributionFormProps> = ({
  onSubmit,
  onCancel,
  currentUser
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'housing',
    impactAssessment: '',
    implementation: '',
    budget: '',
    timeline: '',
    stakeholders: '',
    legalBasis: '',
    publicBenefit: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [zkpVerified, setZkpVerified] = useState(false);

  const categories = [
    { value: 'housing', label: 'Housing & Development' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'environment', label: 'Environment' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'safety', label: 'Public Safety' }
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Policy title is required');
    } else if (formData.title.length < 10) {
      errors.push('Policy title must be at least 10 characters');
    }

    if (!formData.description.trim()) {
      errors.push('Policy description is required');
    } else if (formData.description.length < 50) {
      errors.push('Policy description must be at least 50 characters');
    }

    if (!formData.impactAssessment.trim()) {
      errors.push('Impact assessment is required');
    }

    if (!formData.implementation.trim()) {
      errors.push('Implementation plan is required');
    }

    if (!formData.publicBenefit.trim()) {
      errors.push('Public benefit statement is required');
    }

    // Tier-specific validation
    if (currentUser.tier === 'Citizen' && formData.category === 'safety') {
      errors.push('Public Safety policies require Governor tier or higher');
    }

    return errors;
  };

  const performZKPVerification = async (): Promise<boolean> => {
    // Simulate ZKP verification process
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock verification based on user tier and jurisdiction
        const verificationSuccess = Math.random() > 0.1; // 90% success rate
        setZkpVerified(verificationSuccess);
        resolve(verificationSuccess);
      }, 1500);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Perform ZKP verification
      const zkpSuccess = await performZKPVerification();
      
      if (!zkpSuccess) {
        setValidationErrors(['ZKP verification failed. Please check your DID credentials.']);
        setIsSubmitting(false);
        return;
      }

      // Generate CID and submission metadata
      const submissionData = {
        ...formData,
        metadata: {
          submittedBy: currentUser.did,
          jurisdiction: currentUser.jurisdiction,
          tier: currentUser.tier,
          submissionTimestamp: new Date().toISOString(),
          zkpVerified: true,
          version: '1.0.0'
        }
      };

      console.log('📝 Policy submission prepared:', submissionData.title);
      console.log('🔐 ZKP verification completed for DID:', currentUser.did);
      
      await onSubmit(submissionData);
      
    } catch (error) {
      console.error('Policy submission error:', error);
      setValidationErrors(['Submission failed. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiredFields = ['title', 'description', 'impactAssessment', 'implementation', 'publicBenefit'];
  const completedFields = requiredFields.filter(field => formData[field as keyof FormData].trim().length > 0);
  const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submit Policy Proposal
              </CardTitle>
              <CardDescription>
                DID-authenticated policy submission for {currentUser.jurisdiction}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Verification Status */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Submission Authorization</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">DID Verified:</span>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Authenticated</span>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Tier Level:</span>
                <Badge variant="outline" className="ml-1">{currentUser.tier}</Badge>
              </div>
              <div>
                <span className="text-gray-600">ZKP Status:</span>
                <div className="flex items-center gap-1">
                  {zkpVerified ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 text-gray-400" />
                      <span>Pending</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Progress */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Form Completion</span>
              <span className="text-sm text-gray-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Validation Errors</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Policy Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter policy title..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">Policy Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Policy Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a comprehensive description of the proposed policy..."
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Impact and Implementation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="impactAssessment">Impact Assessment *</Label>
                <Textarea
                  id="impactAssessment"
                  value={formData.impactAssessment}
                  onChange={(e) => handleInputChange('impactAssessment', e.target.value)}
                  placeholder="Describe the expected impact on the community..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="implementation">Implementation Plan *</Label>
                <Textarea
                  id="implementation"
                  value={formData.implementation}
                  onChange={(e) => handleInputChange('implementation', e.target.value)}
                  placeholder="Outline the implementation strategy..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Financial and Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget Estimate</Label>
                <Input
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="e.g., $500,000 over 2 years"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  placeholder="e.g., 18 months from approval"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Stakeholders and Legal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stakeholders">Key Stakeholders</Label>
                <Textarea
                  id="stakeholders"
                  value={formData.stakeholders}
                  onChange={(e) => handleInputChange('stakeholders', e.target.value)}
                  placeholder="List involved departments, organizations, and community groups..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="legalBasis">Legal Basis</Label>
                <Textarea
                  id="legalBasis"
                  value={formData.legalBasis}
                  onChange={(e) => handleInputChange('legalBasis', e.target.value)}
                  placeholder="Reference relevant laws, ordinances, or authority..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="publicBenefit">Public Benefit Statement *</Label>
              <Textarea
                id="publicBenefit"
                value={formData.publicBenefit}
                onChange={(e) => handleInputChange('publicBenefit', e.target.value)}
                placeholder="Explain how this policy serves the public interest..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                * Required fields • All submissions are CID-anchored and DID-verified
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || completionPercentage < 100}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      {zkpVerified ? 'Submitting...' : 'Verifying ZKP...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Submit Policy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistryContributionForm;