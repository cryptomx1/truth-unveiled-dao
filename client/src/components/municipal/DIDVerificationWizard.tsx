import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Shield, Users, FileText, MapPin, ArrowRight, ArrowLeft, X } from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
}

interface MunicipalEntity {
  name: string;
  jurisdiction: string;
  entityType: string;
  populationSize: string;
  officialEmail: string;
  publicKey: string;
  verificationDocuments: string[];
  trustedContacts: TrustedContact[];
  zkpStub: string;
}

interface TrustedContact {
  name: string;
  role: string;
  email: string;
  verified: boolean;
}

interface DIDVerificationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const DIDVerificationWizard: React.FC<DIDVerificationWizardProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<MunicipalEntity>({
    name: '',
    jurisdiction: '',
    entityType: '',
    populationSize: '',
    officialEmail: '',
    publicKey: '',
    verificationDocuments: [],
    trustedContacts: [],
    zkpStub: ''
  });

  const wizardSteps: WizardStep[] = [
    {
      id: 'entity-info',
      title: 'Entity Information',
      description: 'Basic municipal entity identification and jurisdiction details',
      required: true,
      completed: false
    },
    {
      id: 'official-verification',
      title: 'Official Verification',
      description: 'Government documentation and official contact verification',
      required: true,
      completed: false
    },
    {
      id: 'trusted-network',
      title: 'Trusted Network',
      description: 'Establish trusted contacts and cross-verification relationships',
      required: true,
      completed: false
    },
    {
      id: 'zkp-generation',
      title: 'ZKP Generation',
      description: 'Generate zero-knowledge proofs for privacy-preserving verification',
      required: true,
      completed: false
    },
    {
      id: 'final-review',
      title: 'Final Review',
      description: 'Review and confirm all municipal DID information before submission',
      required: true,
      completed: false
    }
  ];

  const [steps, setSteps] = useState(wizardSteps);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateFormData = (field: keyof MunicipalEntity, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    console.log(`🏛️ Form updated: ${field} = ${typeof value === 'string' ? value : JSON.stringify(value)}`);
  };

  const addTrustedContact = () => {
    const newContact: TrustedContact = {
      name: '',
      role: '',
      email: '',
      verified: false
    };
    updateFormData('trustedContacts', [...formData.trustedContacts, newContact]);
  };

  const updateTrustedContact = (index: number, field: keyof TrustedContact, value: any) => {
    const updated = formData.trustedContacts.map((contact, i) => 
      i === index ? { ...contact, [field]: value } : contact
    );
    updateFormData('trustedContacts', updated);
  };

  const removeTrustedContact = (index: number) => {
    const updated = formData.trustedContacts.filter((_, i) => i !== index);
    updateFormData('trustedContacts', updated);
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Entity Info
        return !!(formData.name && formData.jurisdiction && formData.entityType && formData.populationSize);
      case 1: // Official Verification
        return !!(formData.officialEmail && formData.verificationDocuments.length > 0);
      case 2: // Trusted Network
        return formData.trustedContacts.length >= 1;
      case 3: // ZKP Generation
        return !!formData.zkpStub;
      case 4: // Final Review
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      const updatedSteps = steps.map((step, index) =>
        index === currentStep ? { ...step, completed: true } : step
      );
      setSteps(updatedSteps);
      setCurrentStep(currentStep + 1);
      console.log(`➡️ DID Wizard: Advanced to step ${currentStep + 2}`);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      console.log(`⬅️ DID Wizard: Returned to step ${currentStep}`);
    }
  };

  const generateZKPStub = () => {
    // Mock ZKP generation - in real implementation would interface with ZKP system
    const stubData = {
      entityHash: `did:civic:municipal:${Date.now()}`,
      proofType: 'municipal-verification',
      timestamp: new Date().toISOString(),
      jurisdiction: formData.jurisdiction,
      entityType: formData.entityType
    };
    const zkpStub = btoa(JSON.stringify(stubData));
    updateFormData('zkpStub', zkpStub);
    console.log('🔐 ZKP stub generated for municipal entity');
  };

  const submitVerification = async () => {
    setIsSubmitting(true);
    console.log('🏛️ Municipal DID verification submission initiated');
    
    // Mock submission delay
    setTimeout(() => {
      console.log('✅ Municipal DID verification completed successfully');
      setIsSubmitting(false);
      onComplete();
    }, 3000);
  };

  useEffect(() => {
    console.log('🧙‍♂️ DID Verification Wizard initialized for municipal onboarding');
    
    // Mock pre-fill some data for testing
    if (process.env.NODE_ENV === 'development') {
      setFormData(prev => ({
        ...prev,
        name: 'Burlington Township Authority',
        jurisdiction: 'Burlington, Vermont, USA',
        entityType: 'township-council'
      }));
    }
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Entity Information
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="entity-name" className="text-white">Municipal Entity Name *</Label>
              <Input
                id="entity-name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., Austin City Council, Portland Township Authority"
                className="mt-2 bg-slate-700 border-slate-600 text-white"
                aria-required="true"
              />
            </div>
            
            <div>
              <Label htmlFor="jurisdiction" className="text-white">Jurisdiction *</Label>
              <Input
                id="jurisdiction"
                value={formData.jurisdiction}
                onChange={(e) => updateFormData('jurisdiction', e.target.value)}
                placeholder="e.g., Austin, Texas, USA"
                className="mt-2 bg-slate-700 border-slate-600 text-white"
                aria-required="true"
              />
            </div>

            <div>
              <Label htmlFor="entity-type" className="text-white">Entity Type *</Label>
              <Select onValueChange={(value) => updateFormData('entityType', value)}>
                <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select municipal entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="city-council">City Council</SelectItem>
                  <SelectItem value="township-authority">Township Authority</SelectItem>
                  <SelectItem value="municipal-district">Municipal District</SelectItem>
                  <SelectItem value="county-administration">County Administration</SelectItem>
                  <SelectItem value="regional-authority">Regional Authority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="population" className="text-white">Population Size *</Label>
              <Select onValueChange={(value) => updateFormData('populationSize', value)}>
                <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select population range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (&lt; 50,000)</SelectItem>
                  <SelectItem value="medium">Medium (50,000 - 250,000)</SelectItem>
                  <SelectItem value="large">Large (250,000 - 1M)</SelectItem>
                  <SelectItem value="metropolitan">Metropolitan (&gt; 1M)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1: // Official Verification
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="official-email" className="text-white">Official Government Email *</Label>
              <Input
                id="official-email"
                type="email"
                value={formData.officialEmail}
                onChange={(e) => updateFormData('officialEmail', e.target.value)}
                placeholder="clerk@cityname.gov"
                className="mt-2 bg-slate-700 border-slate-600 text-white"
                aria-required="true"
              />
            </div>

            <div>
              <Label className="text-white">Verification Documents *</Label>
              <div className="mt-2 space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => {
                    const docs = [...formData.verificationDocuments, 'Official Charter Document'];
                    updateFormData('verificationDocuments', docs);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Add Charter Document
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => {
                    const docs = [...formData.verificationDocuments, 'Government Seal Certificate'];
                    updateFormData('verificationDocuments', docs);
                  }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Add Seal Certificate
                </Button>
                {formData.verificationDocuments.map((doc, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800">
                    {doc}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="public-key" className="text-white">Public Key (Optional)</Label>
              <Textarea
                id="public-key"
                value={formData.publicKey}
                onChange={(e) => updateFormData('publicKey', e.target.value)}
                placeholder="-----BEGIN PUBLIC KEY-----"
                className="mt-2 bg-slate-700 border-slate-600 text-white"
                rows={4}
              />
            </div>
          </div>
        );

      case 2: // Trusted Network
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-white">Trusted Municipal Contacts</Label>
                <Button
                  onClick={addTrustedContact}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>
              
              {formData.trustedContacts.map((contact, index) => (
                <Card key={index} className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white text-sm">Name</Label>
                        <Input
                          value={contact.name}
                          onChange={(e) => updateTrustedContact(index, 'name', e.target.value)}
                          className="mt-1 bg-slate-600 border-slate-500 text-white"
                          placeholder="Official Name"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Role</Label>
                        <Input
                          value={contact.role}
                          onChange={(e) => updateTrustedContact(index, 'role', e.target.value)}
                          className="mt-1 bg-slate-600 border-slate-500 text-white"
                          placeholder="e.g., Mayor, Clerk"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label className="text-white text-sm">Email</Label>
                          <Input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateTrustedContact(index, 'email', e.target.value)}
                            className="mt-1 bg-slate-600 border-slate-500 text-white"
                            placeholder="official@gov.domain"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTrustedContact(index)}
                          className="border-red-500 text-red-400 hover:bg-red-900"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {formData.trustedContacts.length === 0 && (
                <p className="text-slate-400 text-center py-8">
                  Add at least one trusted municipal contact to continue
                </p>
              )}
            </div>
          </div>
        );

      case 3: // ZKP Generation
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Generate ZKP Credentials</h3>
              <p className="text-slate-400 mb-6">
                Create privacy-preserving verification proofs for your municipal identity
              </p>
              
              {!formData.zkpStub ? (
                <Button
                  onClick={generateZKPStub}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Generate ZKP Stub
                </Button>
              ) : (
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400 mr-2" />
                    <span className="text-green-400 font-semibold">ZKP Generated</span>
                  </div>
                  <div className="text-left">
                    <Label className="text-white text-sm">ZKP Stub (Truncated)</Label>
                    <div className="mt-2 p-3 bg-slate-800 border border-slate-500 rounded font-mono text-xs text-slate-300 break-all">
                      {formData.zkpStub.substring(0, 100)}...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4: // Final Review
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Review Municipal DID Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Entity Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-slate-400">Name: </span>
                    <span className="text-white">{formData.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Jurisdiction: </span>
                    <span className="text-white">{formData.jurisdiction}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Type: </span>
                    <span className="text-white">{formData.entityType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Population: </span>
                    <span className="text-white">{formData.populationSize}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Verification Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-white">Official Email Verified</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-white">{formData.verificationDocuments.length} Documents</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-white">{formData.trustedContacts.length} Trusted Contacts</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-white">ZKP Generated</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Municipal DID Verification</h1>
              <p className="text-slate-400 mt-2">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              aria-label="Cancel verification wizard"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Progress</span>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-blue-400' : 'text-slate-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step.completed
                      ? 'bg-green-600 border-green-600 text-white'
                      : index === currentStep
                      ? 'border-blue-400 bg-blue-400 text-white'
                      : 'border-slate-500 text-slate-500'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
                <span className="text-xs mt-2 text-center max-w-20">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">{steps[currentStep].title}</CardTitle>
            <CardDescription className="text-slate-400">
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 0}
            className="border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={submitVerification}
              disabled={!validateCurrentStep() || isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Verification'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!validateCurrentStep()}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};