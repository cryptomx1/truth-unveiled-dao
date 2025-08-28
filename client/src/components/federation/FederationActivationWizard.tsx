/**
 * FederationActivationWizard.tsx - Phase X-FED Step 1
 * 
 * Step-based activation interface for authorized Genesis Badgeholders
 * Enables federation node activation with quorum configuration and regional scope
 * 
 * Authority: Commander Mark via JASMY Relay System
 * Phase: X-FED Global Federation DAO Framework - Step 1
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Shield, Globe, Settings, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { FederationNodeRegistry, type FederationNodeRegistration } from '@shared/federation/FederationNodeRegistry';
import { RegionalProposalIndex } from '@shared/federation/RegionalProposalIndex';

interface WizardStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

interface FederationConfiguration {
  nodeId: string;
  jurisdiction: {
    country: string;
    region: string;
    locale: string;
    timezone: string;
  };
  governanceTier: 'tier1' | 'tier2' | 'tier3';
  quorumSettings: {
    minimumParticipation: number;
    decayThreshold: number;
    emergencyOverride: boolean;
  };
  regionalScope: string[];
  daoLinkage: {
    existingDAOIntegration: boolean;
    governanceDeckSync: boolean;
    crossBorderVoting: boolean;
  };
  genesisAuthorization: {
    badgeholderDID: string;
    signature: string;
  };
}

const FederationActivationWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [configuration, setConfiguration] = useState<FederationConfiguration>({
    nodeId: '',
    jurisdiction: {
      country: '',
      region: '',
      locale: '',
      timezone: ''
    },
    governanceTier: 'tier2',
    quorumSettings: {
      minimumParticipation: 15,
      decayThreshold: 7,
      emergencyOverride: false
    },
    regionalScope: [],
    daoLinkage: {
      existingDAOIntegration: true,
      governanceDeckSync: true,
      crossBorderVoting: false
    },
    genesisAuthorization: {
      badgeholderDID: '',
      signature: ''
    }
  });
  
  const [isActivating, setIsActivating] = useState(false);
  const [activationResult, setActivationResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const federationRegistry = new FederationNodeRegistry();
  const proposalIndex = new RegionalProposalIndex();

  const wizardSteps: WizardStep[] = [
    { step: 1, title: 'Node Configuration', description: 'Set up federation node identity and jurisdiction', completed: currentStep > 1 },
    { step: 2, title: 'Governance Tier', description: 'Select tier and configure quorum settings', completed: currentStep > 2 },
    { step: 3, title: 'Regional Scope', description: 'Define operational jurisdiction and cross-border capabilities', completed: currentStep > 3 },
    { step: 4, title: 'DAO Integration', description: 'Configure integration with existing governance systems', completed: currentStep > 4 },
    { step: 5, title: 'Authorization', description: 'Genesis Badgeholder verification and activation', completed: currentStep > 5 }
  ];

  const availableCountries = [
    { code: 'US', name: 'United States', regions: ['East Coast', 'West Coast', 'Central', 'South'] },
    { code: 'DE', name: 'Germany', regions: ['Central Europe', 'Northern Europe'] },
    { code: 'UK', name: 'United Kingdom', regions: ['British Isles', 'Northern Europe'] },
    { code: 'JP', name: 'Japan', regions: ['Asia Pacific', 'East Asia'] },
    { code: 'CA', name: 'Canada', regions: ['North America', 'Arctic'] },
    { code: 'BR', name: 'Brazil', regions: ['South America', 'Latin America'] }
  ];

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return configuration.nodeId.length > 0 && 
               configuration.jurisdiction.country.length > 0 && 
               configuration.jurisdiction.region.length > 0;
      case 2:
        return configuration.governanceTier.length > 0 && 
               configuration.quorumSettings.minimumParticipation > 0;
      case 3:
        return configuration.regionalScope.length > 0;
      case 4:
        return true; // DAO linkage is optional
      case 5:
        return configuration.genesisAuthorization.badgeholderDID.length > 0 && 
               configuration.genesisAuthorization.signature.length > 0;
      default:
        return true;
    }
  };

  const activateFederation = async () => {
    setIsActivating(true);
    
    try {
      console.log('🏛️ Starting federation node activation...');
      
      // Generate deployment CID (mock)
      const deploymentCID = `bafybei${Math.random().toString(36).substr(2, 46)}`;
      
      // Create registration
      const registration: FederationNodeRegistration = {
        nodeId: configuration.nodeId,
        jurisdiction: configuration.jurisdiction,
        governanceTier: configuration.governanceTier,
        deploymentCID,
        genesisAuthorization: {
          badgeholderDID: configuration.genesisAuthorization.badgeholderDID,
          signature: configuration.genesisAuthorization.signature
        }
      };
      
      // Register with federation registry
      const result = await federationRegistry.registerNode(registration);
      
      if (result.success) {
        setActivationResult({
          success: true,
          message: `Federation node ${result.nodeId} activated successfully. Regional governance framework is now operational.`
        });
        
        console.log('✅ Federation activation complete');
      } else {
        setActivationResult({
          success: false,
          message: `Activation failed: ${result.error}`
        });
      }
      
    } catch (error) {
      setActivationResult({
        success: false,
        message: `Activation error: ${error}`
      });
    } finally {
      setIsActivating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="nodeId" className="text-slate-200">Federation Node ID</Label>
                <Input
                  id="nodeId"
                  value={configuration.nodeId}
                  onChange={(e) => setConfiguration(prev => ({ ...prev, nodeId: e.target.value }))}
                  placeholder="fed_us_east_1"
                  className="bg-slate-800 border-slate-600 text-slate-200"
                />
              </div>
              
              <div>
                <Label htmlFor="country" className="text-slate-200">Country</Label>
                <Select 
                  value={configuration.jurisdiction.country}
                  onValueChange={(value) => setConfiguration(prev => ({
                    ...prev,
                    jurisdiction: { ...prev.jurisdiction, country: value, region: '', locale: `${value.toLowerCase()}-${value}`, timezone: 'UTC' }
                  }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCountries.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {configuration.jurisdiction.country && (
                <div>
                  <Label htmlFor="region" className="text-slate-200">Region</Label>
                  <Select 
                    value={configuration.jurisdiction.region}
                    onValueChange={(value) => setConfiguration(prev => ({
                      ...prev,
                      jurisdiction: { ...prev.jurisdiction, region: value }
                    }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCountries
                        .find(c => c.code === configuration.jurisdiction.country)?.regions
                        .map(region => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="tier" className="text-slate-200">Governance Tier</Label>
              <Select 
                value={configuration.governanceTier}
                onValueChange={(value: 'tier1' | 'tier2' | 'tier3') => setConfiguration(prev => ({ ...prev, governanceTier: value }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tier1">Tier 1 - Full Federation Authority</SelectItem>
                  <SelectItem value="tier2">Tier 2 - Regional Authority</SelectItem>
                  <SelectItem value="tier3">Tier 3 - Local Authority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="quorum" className="text-slate-200">
                  Minimum Participation ({configuration.quorumSettings.minimumParticipation}%)
                </Label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={configuration.quorumSettings.minimumParticipation}
                  onChange={(e) => setConfiguration(prev => ({
                    ...prev,
                    quorumSettings: { ...prev.quorumSettings, minimumParticipation: Number(e.target.value) }
                  }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="decay" className="text-slate-200">Quorum Decay Threshold (days)</Label>
                <Input
                  id="decay"
                  type="number"
                  value={configuration.quorumSettings.decayThreshold}
                  onChange={(e) => setConfiguration(prev => ({
                    ...prev,
                    quorumSettings: { ...prev.quorumSettings, decayThreshold: Number(e.target.value) }
                  }))}
                  className="bg-slate-800 border-slate-600 text-slate-200"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emergency"
                  checked={configuration.quorumSettings.emergencyOverride}
                  onCheckedChange={(checked) => setConfiguration(prev => ({
                    ...prev,
                    quorumSettings: { ...prev.quorumSettings, emergencyOverride: Boolean(checked) }
                  }))}
                />
                <Label htmlFor="emergency" className="text-slate-200">Enable Emergency Override</Label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-slate-200">Regional Scope</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {availableCountries.map(country => (
                  <div key={country.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={country.code}
                      checked={configuration.regionalScope.includes(country.code)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setConfiguration(prev => ({
                            ...prev,
                            regionalScope: [...prev.regionalScope, country.code]
                          }));
                        } else {
                          setConfiguration(prev => ({
                            ...prev,
                            regionalScope: prev.regionalScope.filter(c => c !== country.code)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={country.code} className="text-slate-200">{country.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="daoIntegration"
                  checked={configuration.daoLinkage.existingDAOIntegration}
                  onCheckedChange={(checked) => setConfiguration(prev => ({
                    ...prev,
                    daoLinkage: { ...prev.daoLinkage, existingDAOIntegration: Boolean(checked) }
                  }))}
                />
                <Label htmlFor="daoIntegration" className="text-slate-200">Integrate with Existing DAO Structure</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deckSync"
                  checked={configuration.daoLinkage.governanceDeckSync}
                  onCheckedChange={(checked) => setConfiguration(prev => ({
                    ...prev,
                    daoLinkage: { ...prev.daoLinkage, governanceDeckSync: Boolean(checked) }
                  }))}
                />
                <Label htmlFor="deckSync" className="text-slate-200">Sync with Governance Deck (/deck/2)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="crossBorder"
                  checked={configuration.daoLinkage.crossBorderVoting}
                  onCheckedChange={(checked) => setConfiguration(prev => ({
                    ...prev,
                    daoLinkage: { ...prev.daoLinkage, crossBorderVoting: Boolean(checked) }
                  }))}
                />
                <Label htmlFor="crossBorder" className="text-slate-200">Enable Cross-Border Voting</Label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="badgeholderDID" className="text-slate-200">Genesis Badgeholder DID</Label>
                <Input
                  id="badgeholderDID"
                  value={configuration.genesisAuthorization.badgeholderDID}
                  onChange={(e) => setConfiguration(prev => ({
                    ...prev,
                    genesisAuthorization: { ...prev.genesisAuthorization, badgeholderDID: e.target.value }
                  }))}
                  placeholder="did:genesis:commander_mark_authority"
                  className="bg-slate-800 border-slate-600 text-slate-200"
                />
              </div>
              
              <div>
                <Label htmlFor="signature" className="text-slate-200">Authorization Signature</Label>
                <Input
                  id="signature"
                  value={configuration.genesisAuthorization.signature}
                  onChange={(e) => setConfiguration(prev => ({
                    ...prev,
                    genesisAuthorization: { ...prev.genesisAuthorization, signature: e.target.value }
                  }))}
                  placeholder="0xfederation_signature_example"
                  className="bg-slate-800 border-slate-600 text-slate-200"
                />
              </div>
            </div>
            
            {activationResult && (
              <div className={`p-4 rounded-lg ${activationResult.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                <div className="flex items-center gap-2">
                  {activationResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  )}
                  <span className="text-slate-200">{activationResult.message}</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="bg-slate-900/50 dark:bg-slate-950/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-100">
            <Shield className="h-6 w-6 text-blue-400" />
            Federation Activation Wizard
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              Phase X-FED Step 1
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Step {currentStep} of 5</span>
              <span className="text-sm text-slate-400">{Math.round((currentStep / 5) * 100)}% Complete</span>
            </div>
            <Progress value={(currentStep / 5) * 100} className="h-2" />
          </div>

          {/* Step Timeline */}
          <div className="grid grid-cols-5 gap-2">
            {wizardSteps.map((step) => (
              <div 
                key={step.step}
                className={`text-center p-3 rounded-lg border ${
                  step.step === currentStep 
                    ? 'bg-blue-900/50 border-blue-600' 
                    : step.completed 
                    ? 'bg-green-900/50 border-green-600' 
                    : 'bg-slate-800/50 border-slate-600'
                }`}
              >
                <div className={`text-sm font-medium ${
                  step.step === currentStep 
                    ? 'text-blue-400' 
                    : step.completed 
                    ? 'text-green-400' 
                    : 'text-slate-400'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">{step.description}</div>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="bg-slate-800/50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-slate-200 mb-4">
              {wizardSteps[currentStep - 1]?.title}
            </h3>
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="outline"
              className="border-slate-600 text-slate-200"
            >
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!validateCurrentStep()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={activateFederation}
                disabled={!validateCurrentStep() || isActivating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isActivating ? 'Activating...' : 'Activate Federation'}
              </Button>
            )}
          </div>

          {/* Summary */}
          {currentStep === 5 && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-200 mb-3">Activation Summary</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>Node ID: {configuration.nodeId}</div>
                <div>Jurisdiction: {configuration.jurisdiction.country} - {configuration.jurisdiction.region}</div>
                <div>Governance Tier: {configuration.governanceTier.toUpperCase()}</div>
                <div>Regional Scope: {configuration.regionalScope.join(', ')}</div>
                <div>Quorum: {configuration.quorumSettings.minimumParticipation}% minimum participation</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FederationActivationWizard;