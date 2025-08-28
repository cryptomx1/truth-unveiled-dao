import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Activity, MessageCircle, Target, Zap, MapPin, Users, TrendingUp, AlertTriangle } from 'lucide-react';

import { RippleCampaignEngine, RippleCampaign, ZIPTargetZone } from './RippleCampaignEngine';
import { LLMPromptEmitter, LLMPromptRequest } from './LLMPromptEmitter';
import { Deck10FeedbackSync } from './Deck10FeedbackSync';

interface CampaignFormData {
  name: string;
  targetZIPs: string[];
  focusArea: 'healthcare' | 'infrastructure' | 'climate' | 'taxation' | 'governance';
  tone: 'urgent' | 'informative' | 'encouraging' | 'formal';
  useAIGeneration: boolean;
}

export const PressReplayDashboard: React.FC = () => {
  const [engine] = useState(() => RippleCampaignEngine.getInstance());
  const [llmEmitter] = useState(() => LLMPromptEmitter.getInstance());
  const [feedbackSync] = useState(() => Deck10FeedbackSync.getInstance());
  
  const [campaigns, setCampaigns] = useState<RippleCampaign[]>([]);
  const [zipZones, setZipZones] = useState<ZIPTargetZone[]>([]);
  const [metrics, setMetrics] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalReach: 0,
    avgEngagement: 0
  });

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    targetZIPs: [],
    focusArea: 'healthcare',
    tone: 'informative',
    useAIGeneration: false
  });

  const [selectedZIP, setSelectedZIP] = useState<string>('');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // ARIA live region for announcements
  const [ariaMessage, setAriaMessage] = useState<string>('');

  useEffect(() => {
    // Initialize data
    setCampaigns(engine.getCampaigns());
    setZipZones(engine.getZIPZones());
    setMetrics(engine.getCampaignMetrics());

    // Set up refresh interval
    const interval = setInterval(() => {
      setCampaigns(engine.getCampaigns());
      setMetrics(engine.getCampaignMetrics());
    }, 3000);

    return () => clearInterval(interval);
  }, [engine]);

  const handleZIPSelection = (zipCode: string) => {
    if (!formData.targetZIPs.includes(zipCode)) {
      setFormData(prev => ({
        ...prev,
        targetZIPs: [...prev.targetZIPs, zipCode]
      }));
      announceToScreenReader(`ZIP code ${zipCode} added to campaign targets`);
    }
  };

  const removeZIP = (zipCode: string) => {
    setFormData(prev => ({
      ...prev,
      targetZIPs: prev.targetZIPs.filter(zip => zip !== zipCode)
    }));
    announceToScreenReader(`ZIP code ${zipCode} removed from campaign targets`);
  };

  const announceToScreenReader = (message: string) => {
    setAriaMessage(message);
    setTimeout(() => setAriaMessage(''), 1000);
  };

  const generateAIMessage = async () => {
    if (formData.targetZIPs.length === 0) return;

    setIsGenerating(true);
    announceToScreenReader('AI message generation started');

    try {
      const zipZone = zipZones.find(z => z.zipCode === formData.targetZIPs[0]);
      const request: LLMPromptRequest = {
        campaignType: formData.focusArea,
        tone: formData.tone,
        targetZIP: formData.targetZIPs[0],
        representativeAlignment: zipZone?.representativeAlignment || 70
      };

      const response = await llmEmitter.generateCampaignMessage(request);
      setGeneratedMessage(response.content);
      announceToScreenReader(`AI message generated with ${Math.round(response.confidence * 100)}% confidence`);
      
      console.log('✨ AI message generated:', response.source, response.confidence);
    } catch (error) {
      console.error('AI generation failed:', error);
      announceToScreenReader('AI generation failed, using local fallback');
    }

    setIsGenerating(false);
  };

  const createCampaign = async () => {
    if (!formData.name || formData.targetZIPs.length === 0) return;

    const message = formData.useAIGeneration && generatedMessage ? generatedMessage : 
                   `Civic engagement needed for ${formData.focusArea} initiatives in your area.`;

    const campaign = engine.createCampaign({
      name: formData.name,
      targetZIPs: formData.targetZIPs,
      message,
      tone: formData.tone,
      focusArea: formData.focusArea
    });

    // Activate campaign immediately
    engine.activateCampaign(campaign.id);

    // Update displays
    setCampaigns(engine.getCampaigns());
    setMetrics(engine.getCampaignMetrics());

    // Reset form
    setFormData({
      name: '',
      targetZIPs: [],
      focusArea: 'healthcare',
      tone: 'informative',
      useAIGeneration: false
    });
    setGeneratedMessage('');

    announceToScreenReader(`Campaign ${formData.name} created and activated`);
    console.log('📡 Campaign created and activated:', campaign.name);

    // Log to NudgeExecutionLog.json
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'campaign_created',
      campaignId: campaign.id,
      targetZIPs: formData.targetZIPs,
      expectedReach: campaign.metrics.totalReach,
      aiGenerated: formData.useAIGeneration
    };
    console.log('📝 Nudge execution logged:', logEntry);
  };

  const pauseResumeCampaign = (campaignId: string, currentStatus: string) => {
    if (currentStatus === 'active') {
      engine.pauseCampaign(campaignId);
      announceToScreenReader('Campaign paused');
    } else if (currentStatus === 'paused') {
      engine.activateCampaign(campaignId);
      announceToScreenReader('Campaign resumed');
    }
    setCampaigns(engine.getCampaigns());
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlignmentColor = (alignment: number): string => {
    if (alignment >= 80) return 'text-green-600';
    if (alignment >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl" role="main">
      {/* ARIA Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {ariaMessage}
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Press Replay Campaign Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          ZIP-targeted civic engagement campaigns with LLM-enhanced messaging
        </p>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCampaigns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.activeCampaigns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalReach.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgEngagement}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
          <TabsTrigger value="create">Create Campaign</TabsTrigger>
          <TabsTrigger value="targets">ZIP Targets</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Monitor and manage ongoing civic engagement campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No campaigns created yet</p>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          {(campaign.status === 'active' || campaign.status === 'paused') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => pauseResumeCampaign(campaign.id, campaign.status)}
                            >
                              {campaign.status === 'active' ? 'Pause' : 'Resume'}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Focus Area</p>
                          <p className="font-medium capitalize">{campaign.focusArea}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Target ZIPs</p>
                          <p className="font-medium">{campaign.targetZIPs.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Reach</p>
                          <p className="font-medium">{campaign.metrics.totalReach.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Engagement</p>
                          <p className="font-medium">{campaign.metrics.engagement.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                        <p className="text-sm"><strong>Message:</strong> {campaign.message}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {campaign.targetZIPs.map(zip => {
                          const zone = zipZones.find(z => z.zipCode === zip);
                          return (
                            <Badge key={zip} variant="secondary">
                              {zip} {zone && `(${zone.city}, ${zone.state})`}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>Design a targeted civic engagement campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Healthcare Access Initiative"
                  />
                </div>

                <div>
                  <Label htmlFor="focus-area">Focus Area</Label>
                  <Select value={formData.focusArea} onValueChange={(value: any) => 
                    setFormData(prev => ({ ...prev, focusArea: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="climate">Climate</SelectItem>
                      <SelectItem value="taxation">Taxation</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={formData.tone} onValueChange={(value: any) => 
                    setFormData(prev => ({ ...prev, tone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="informative">Informative</SelectItem>
                      <SelectItem value="encouraging">Encouraging</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="zip-select">Add Target ZIP</Label>
                  <Select value={selectedZIP} onValueChange={setSelectedZIP}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ZIP code" />
                    </SelectTrigger>
                    <SelectContent>
                      {zipZones.filter(zone => !formData.targetZIPs.includes(zone.zipCode)).map(zone => (
                        <SelectItem key={zone.zipCode} value={zone.zipCode}>
                          {zone.zipCode} - {zone.city}, {zone.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedZIP && (
                <Button onClick={() => handleZIPSelection(selectedZIP)} className="w-full">
                  Add {selectedZIP} to Campaign
                </Button>
              )}

              {formData.targetZIPs.length > 0 && (
                <div>
                  <Label>Selected Target ZIPs</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.targetZIPs.map(zip => {
                      const zone = zipZones.find(z => z.zipCode === zip);
                      return (
                        <Badge key={zip} variant="secondary" className="cursor-pointer" 
                               onClick={() => removeZIP(zip)}>
                          {zip} {zone && `(${zone.city})`} ×
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>AI Message Generation</Label>
                  <Button 
                    variant="outline" 
                    onClick={generateAIMessage}
                    disabled={isGenerating || formData.targetZIPs.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    {isGenerating ? 'Generating...' : '✨ AI Generate'}
                  </Button>
                </div>

                {generatedMessage && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
                    <p className="text-sm font-medium mb-2">AI-Generated Message:</p>
                    <p className="text-sm">{generatedMessage}</p>
                    <div className="mt-2">
                      <input
                        type="checkbox"
                        id="use-ai"
                        checked={formData.useAIGeneration}
                        onChange={(e) => setFormData(prev => ({ ...prev, useAIGeneration: e.target.checked }))}
                        className="mr-2"
                      />
                      <Label htmlFor="use-ai" className="text-sm">Use this AI-generated message</Label>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={createCampaign} 
                className="w-full" 
                disabled={!formData.name || formData.targetZIPs.length === 0}
              >
                Create & Activate Campaign
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ZIP Target Management</CardTitle>
              <CardDescription>Monitor target zones and representative alignment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zipZones.map((zone) => (
                  <div key={zone.zipCode} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{zone.zipCode}</h3>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">{zone.city}, {zone.state}</p>
                      <p className="text-sm">Population: {zone.population.toLocaleString()}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Representative Alignment</span>
                        <span className={getAlignmentColor(zone.representativeAlignment)}>
                          {zone.representativeAlignment}%
                        </span>
                      </div>
                      <Progress value={zone.representativeAlignment} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg Engagement</span>
                        <span>{zone.avgEngagement}%</span>
                      </div>
                      <Progress value={zone.avgEngagement} className="h-2" />
                    </div>

                    {zone.representativeAlignment < 70 && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs">Low alignment detected</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};