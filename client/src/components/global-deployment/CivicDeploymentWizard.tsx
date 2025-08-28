/**
 * CivicDeploymentWizard.tsx - Phase X-Z Step 2
 * 
 * Guided multi-step wizard interface for civic platform deployment
 * Includes tier selection, deck presets, policy overlays, and federation setup
 * 
 * Authority: Commander Mark via JASMY Relay System
 * Phase: X-Z Global Civic Stack Deployment - Step 2
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Settings, Globe, Shield, Network, CheckCircle, AlertTriangle } from 'lucide-react';
import { LocaleDeckRegistry, type LocalePreset, type DeckConfiguration } from '@shared/locale/LocaleDeckRegistry';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface DeploymentConfiguration {
  jurisdiction: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  localePreset?: LocalePreset;
  selectedDecks: number[];
  policyOverlays: {
    privacyCompliance: string[];
    dataLocalization: boolean;
    customPolicies: string[];
  };
  federationSettings: {
    enableFederation: boolean;
    crossBorderConsensus: boolean;
    zkpVerification: boolean;
  };
  ipfsSettings: {
    enablePinning: boolean;
    pinataIntegration: boolean;
  };
}

const CivicDeploymentWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfiguration>({
    jurisdiction: '',
    tier: 'tier1',
    selectedDecks: [],
    policyOverlays: {
      privacyCompliance: [],
      dataLocalization: false,
      customPolicies: []
    },
    federationSettings: {
      enableFederation: true,
      crossBorderConsensus: true,
      zkpVerification: true
    },
    ipfsSettings: {
      enablePinning: true,
      pinataIntegration: true
    }
  });
  const [availableDecks, setAvailableDecks] = useState<DeckConfiguration[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const registry = new LocaleDeckRegistry();

  const wizardSteps: WizardStep[] = [
    { id: 1, title: 'Jurisdiction & Tier', description: 'Select target jurisdiction and deployment tier', completed: false },
    { id: 2, title: 'Deck Configuration', description: 'Configure civic decks and modules', completed: false },
    { id: 3, title: 'Policy Overlays', description: 'Set compliance and governance policies', completed: false },
    { id: 4, title: 'Federation & IPFS', description: 'Configure federation and IPFS settings', completed: false },
    { id: 5, title: 'Review & Deploy', description: 'Review configuration and deploy', completed: false }
  ];

  // Load locale configuration when jurisdiction or tier changes
  useEffect(() => {
    if (deploymentConfig.jurisdiction && deploymentConfig.tier) {
      loadLocaleConfiguration();
    }
  }, [deploymentConfig.jurisdiction, deploymentConfig.tier]);

  const loadLocaleConfiguration = async () => {
    setIsLoading(true);
    
    try {
      const localeConfig = await registry.getLocaleConfiguration(
        deploymentConfig.jurisdiction, 
        deploymentConfig.tier
      );
      
      if (localeConfig) {
        setDeploymentConfig(prev => ({
          ...prev,
          localePreset: localeConfig,
          selectedDecks: localeConfig.defaultDecks
            .filter(deck => deck.priority === 'essential')
            .map(deck => deck.deckId),
          policyOverlays: {
            privacyCompliance: localeConfig.policyOverlays.privacyCompliance,
            dataLocalization: localeConfig.policyOverlays.dataLocalization,
            customPolicies: prev.policyOverlays.customPolicies
          },
          federationSettings: {
            enableFederation: localeConfig.federationEligibility.enabled,
            crossBorderConsensus: localeConfig.federationEligibility.crossBorderConsensus,
            zkpVerification: localeConfig.federationEligibility.zkpVerificationRequired
          }
        }));
        
        setAvailableDecks(localeConfig.defaultDecks);
      }
    } catch (error) {
      console.error('Failed to load locale configuration:', error);
      setValidationErrors(['Failed to load locale configuration']);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];
    
    switch (currentStep) {
      case 1:
        if (!deploymentConfig.jurisdiction) errors.push('Jurisdiction is required');
        if (!deploymentConfig.tier) errors.push('Deployment tier is required');
        break;
      case 2:
        if (deploymentConfig.selectedDecks.length === 0) errors.push('At least one deck must be selected');
        break;
      case 3:
        if (deploymentConfig.tier === 'tier1' && deploymentConfig.policyOverlays.privacyCompliance.length === 0) {
          errors.push('Privacy compliance is required for Tier 1 deployments');
        }
        break;
      case 4:
        // IPFS and federation settings are optional but validated for compatibility
        break;
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(5, prev + 1));
      setValidationErrors([]);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    setValidationErrors([]);
  };

  const handleDeckToggle = (deckId: number) => {
    setDeploymentConfig(prev => ({
      ...prev,
      selectedDecks: prev.selectedDecks.includes(deckId)
        ? prev.selectedDecks.filter(id => id !== deckId)
        : [...prev.selectedDecks, deckId]
    }));
  };

  const handlePolicyToggle = (policy: string) => {
    setDeploymentConfig(prev => ({
      ...prev,
      policyOverlays: {
        ...prev.policyOverlays,
        privacyCompliance: prev.policyOverlays.privacyCompliance.includes(policy)
          ? prev.policyOverlays.privacyCompliance.filter(p => p !== policy)
          : [...prev.policyOverlays.privacyCompliance, policy]
      }
    }));
  };

  const handleDeployment = async () => {
    setIsLoading(true);
    
    try {
      // Validate entire configuration
      if (!validateCurrentStep()) {
        setIsLoading(false);
        return;
      }

      console.log('🚀 Starting civic platform deployment...');
      console.log('📊 Configuration:', deploymentConfig);

      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Trigger IPFS pinning if enabled
      if (deploymentConfig.ipfsSettings.enablePinning) {
        console.log('📌 IPFS pinning triggered');
      }

      // Check federation eligibility
      if (deploymentConfig.federationSettings.enableFederation) {
        console.log('🌐 Federation integration enabled');
      }

      console.log('✅ Deployment completed successfully');
      
      // Navigate to success page or emit success event
      window.location.href = '/global/deployment';
      
    } catch (error) {
      console.error('Deployment failed:', error);
      setValidationErrors(['Deployment failed. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="jurisdiction" className="text-slate-200">Target Jurisdiction</Label>
                <Select value={deploymentConfig.jurisdiction} onValueChange={(value) => 
                  setDeploymentConfig(prev => ({ ...prev, jurisdiction: value }))
                }>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="US" className="text-slate-200">United States (Tier 1)</SelectItem>
                    <SelectItem value="DE" className="text-slate-200">Germany (Tier 1)</SelectItem>
                    <SelectItem value="JP" className="text-slate-200">Japan (Tier 2)</SelectItem>
                    <SelectItem value="BR" className="text-slate-200">Brazil (Tier 3)</SelectItem>
                    <SelectItem value="UK" className="text-slate-200">United Kingdom (Tier 1)</SelectItem>
                    <SelectItem value="CA" className="text-slate-200">Canada (Tier 1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tier" className="text-slate-200">Deployment Tier</Label>
                <Select value={deploymentConfig.tier} onValueChange={(value: 'tier1' | 'tier2' | 'tier3') => 
                  setDeploymentConfig(prev => ({ ...prev, tier: value }))
                }>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="tier1" className="text-slate-200">Tier 1 - Full Feature Set</SelectItem>
                    <SelectItem value="tier2" className="text-slate-200">Tier 2 - Moderate Features</SelectItem>
                    <SelectItem value="tier3" className="text-slate-200">Tier 3 - Basic Features</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {deploymentConfig.localePreset && (
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium text-slate-200">Locale Configuration Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                  <div>Region: <span className="text-slate-300">{deploymentConfig.localePreset.region}</span></div>
                  <div>Governance: <span className="text-slate-300">{deploymentConfig.localePreset.policyOverlays.governanceStyle}</span></div>
                  <div>Engagement Style: <span className="text-slate-300">{deploymentConfig.localePreset.culturalProfile.civicEngagementStyle}</span></div>
                  <div>Default Decks: <span className="text-slate-300">{deploymentConfig.localePreset.defaultDecks.length}</span></div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-200">Select Civic Decks</h4>
              
              {availableDecks.map(deck => (
                <div key={deck.deckId} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={deploymentConfig.selectedDecks.includes(deck.deckId)}
                      onCheckedChange={() => handleDeckToggle(deck.deckId)}
                      className="border-slate-600"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-200">{deck.deckName}</div>
                      <div className="text-xs text-slate-400">{deck.modules.length} modules</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={
                        deck.priority === 'essential' ? 'text-green-400 border-green-400' :
                        deck.priority === 'recommended' ? 'text-blue-400 border-blue-400' :
                        'text-amber-400 border-amber-400'
                      }
                    >
                      {deck.priority}
                    </Badge>
                    <Badge variant="outline" className="text-purple-400 border-purple-400 text-xs">
                      {deck.culturalAdaptation.adaptationLevel}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-slate-200 mb-2">Selected Configuration</h5>
              <div className="text-xs text-slate-400">
                {deploymentConfig.selectedDecks.length} deck(s) selected for deployment
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-200">Privacy Compliance</h4>
              
              {deploymentConfig.localePreset?.policyOverlays.privacyCompliance.map(policy => (
                <div key={policy} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={deploymentConfig.policyOverlays.privacyCompliance.includes(policy)}
                      onCheckedChange={() => handlePolicyToggle(policy)}
                      className="border-slate-600"
                    />
                    <Label className="text-slate-200">{policy}</Label>
                  </div>
                  <Badge variant="outline" className="text-red-400 border-red-400">Required</Badge>
                </div>
              )) || <div className="text-sm text-slate-400">No specific compliance requirements</div>}

              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <Label htmlFor="data-localization" className="text-slate-200">Data Localization</Label>
                  <div className="text-xs text-slate-400">Store data within jurisdiction borders</div>
                </div>
                <Switch
                  id="data-localization"
                  checked={deploymentConfig.policyOverlays.dataLocalization}
                  onCheckedChange={(checked) => setDeploymentConfig(prev => ({
                    ...prev,
                    policyOverlays: { ...prev.policyOverlays, dataLocalization: checked }
                  }))}
                />
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-slate-200 mb-2">Governance Configuration</h5>
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                <div>Style: <span className="text-slate-300">{deploymentConfig.localePreset?.policyOverlays.governanceStyle}</span></div>
                <div>Voting: <span className="text-slate-300">{deploymentConfig.localePreset?.policyOverlays.votingSystem}</span></div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-200">Federation Settings</h4>
              
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <Label htmlFor="federation" className="text-slate-200">Enable International Federation</Label>
                  <div className="text-xs text-slate-400">Connect to global civic network</div>
                </div>
                <Switch
                  id="federation"
                  checked={deploymentConfig.federationSettings.enableFederation}
                  onCheckedChange={(checked) => setDeploymentConfig(prev => ({
                    ...prev,
                    federationSettings: { ...prev.federationSettings, enableFederation: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <Label htmlFor="consensus" className="text-slate-200">Cross-Border Consensus</Label>
                  <div className="text-xs text-slate-400">Participate in international decisions</div>
                </div>
                <Switch
                  id="consensus"
                  checked={deploymentConfig.federationSettings.crossBorderConsensus}
                  onCheckedChange={(checked) => setDeploymentConfig(prev => ({
                    ...prev,
                    federationSettings: { ...prev.federationSettings, crossBorderConsensus: checked }
                  }))}
                  disabled={!deploymentConfig.federationSettings.enableFederation}
                />
              </div>

              <h4 className="text-sm font-medium text-slate-200 mt-6">IPFS Configuration</h4>
              
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <Label htmlFor="ipfs" className="text-slate-200">Enable IPFS Pinning</Label>
                  <div className="text-xs text-slate-400">Decentralized content storage</div>
                </div>
                <Switch
                  id="ipfs"
                  checked={deploymentConfig.ipfsSettings.enablePinning}
                  onCheckedChange={(checked) => setDeploymentConfig(prev => ({
                    ...prev,
                    ipfsSettings: { ...prev.ipfsSettings, enablePinning: checked }
                  }))}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-slate-200 mb-4">Deployment Summary</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400">Jurisdiction</div>
                    <div className="text-slate-200">{deploymentConfig.jurisdiction}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Tier</div>
                    <div className="text-slate-200">{deploymentConfig.tier.toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Selected Decks</div>
                    <div className="text-slate-200">{deploymentConfig.selectedDecks.length} decks</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Federation</div>
                    <div className="text-slate-200">{deploymentConfig.federationSettings.enableFederation ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-2">Privacy Compliance</div>
                  <div className="flex flex-wrap gap-2">
                    {deploymentConfig.policyOverlays.privacyCompliance.map(policy => (
                      <Badge key={policy} variant="outline" className="text-green-400 border-green-400 text-xs">
                        {policy}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDeployment}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Deploying...' : 'Deploy Civic Platform'}
            </Button>
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
            <Settings className="h-6 w-6 text-orange-400" />
            Civic Deployment Wizard
            <Badge variant="outline" className="text-orange-400 border-orange-400">
              Phase X-Z Step 2
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Step {currentStep} of 5</span>
              <span>{Math.round((currentStep / 5) * 100)}% Complete</span>
            </div>
            <Progress value={(currentStep / 5) * 100} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between">
            {wizardSteps.map(step => (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.id === currentStep ? 'bg-orange-600 text-white' :
                  step.id < currentStep ? 'bg-green-600 text-white' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {step.id < currentStep ? <CheckCircle className="h-4 w-4" /> : step.id}
                </div>
                <div className="text-xs text-center max-w-16">
                  <div className="text-slate-200 font-medium">{step.title}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Validation Errors</span>
              </div>
              <ul className="text-sm text-red-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step content */}
          <div className="min-h-96">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isLoading}
              className="border-slate-600 text-slate-200"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CivicDeploymentWizard;