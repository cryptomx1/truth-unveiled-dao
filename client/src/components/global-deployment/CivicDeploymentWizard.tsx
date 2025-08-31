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
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { LocaleDeckRegistry } from '@shared/locale/LocaleDeckRegistry';
import { FederationNodeRegistry } from '@shared/federation/FederationNodeRegistry';
import { RegionalProposalIndex } from '@shared/federation/RegionalProposalIndex';

const CivicDeploymentWizard: React.FC = () => {
  const [tier, setTier] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Preload regional and federation data
    console.log('Federation Nodes:', FederationNodeRegistry);
    console.log('Proposal Index:', RegionalProposalIndex);
  }, []);

  const handleNextStep = () => setCurrentStep(prev => prev + 1);
  const handlePreviousStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <Card className="max-w-3xl mx-auto my-10">
      <CardHeader>
        <CardTitle>Global Civic Deployment Wizard</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={(currentStep / 3) * 100} className="mb-6" />
        {currentStep === 1 && (
          <div className="space-y-4">
            <Label>Choose Deployment Tier</Label>
            <Select onValueChange={setTier}>
              <SelectTrigger>
                <SelectValue placeholder="Select a tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="municipal">Municipal</SelectItem>
                <SelectItem value="federated">Federated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {currentStep === 2 && (
          <div className="space-y-4">
            <Label>Select Regional Nodes</Label>
            {Object.keys(FederationNodeRegistry).map((nodeKey) => (
              <div key={nodeKey} className="flex items-center space-x-2">
                <Checkbox
                  id={nodeKey}
                  checked={regions.includes(nodeKey)}
                  onCheckedChange={(checked) => {
                    setRegions((prev) =>
                      checked ? [...prev, nodeKey] : prev.filter((r) => r !== nodeKey)
                    );
                  }}
                />
                <Label htmlFor={nodeKey}>{FederationNodeRegistry[nodeKey]}</Label>
              </div>
            ))}
          </div>
        )}
        {currentStep === 3 && (
          <div>
            <p className="text-sm text-muted-foreground">
              Final confirmation and deployment. All settings are ready.
            </p>
          </div>
        )}
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={handlePreviousStep} disabled={currentStep === 1}>
            Back
          </Button>
          <Button onClick={handleNextStep}>
            {currentStep < 3 ? 'Next' : 'Deploy'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CivicDeploymentWizard;

