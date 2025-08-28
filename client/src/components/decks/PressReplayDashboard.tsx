/**
 * PressReplayDashboard.tsx
 * Phase PRESS-REPLAY Step 4: Ripple Campaign Management Interface
 * Commander Mark directive via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, BarChart3, Globe, MessageSquare, Play, Pause, Target, TrendingUp, Users, Zap } from 'lucide-react';
import { RippleCampaignEngine, type Campaign, type CampaignMetrics } from '@/agents/RippleCampaignEngine';
import { LLMPromptEmitter, type CivicMessage } from '@/agents/LLMPromptEmitter';

const PressReplayDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [recentMessages, setRecentMessages] = useState<CivicMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Campaign creation form
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('healthcare');
  const [selectedZips, setSelectedZips] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  
  // LLM generation form
  const [llmTopic, setLlmTopic] = useState<string>('healthcare');
  const [llmTone, setLlmTone] = useState<string>('informative');
  const [llmZip, setLlmZip] = useState<string>('78701');

  const campaignEngine = RippleCampaignEngine.getInstance();
  const llmEmitter = LLMPromptEmitter.getInstance();

  const availableZips = [
    { code: '78701', city: 'Austin, TX', population: 315000 },
    { code: '97201', city: 'Portland, OR', population: 295000 },
    { code: '05401', city: 'Burlington, VT', population: 42000 },
    { code: '95110', city: 'San Jose, CA', population: 345000 },
    { code: '48104', city: 'Ann Arbor, MI', population: 52000 }
  ];

  useEffect(() => {
    updateDashboardData();
    
    // Refresh data every 3 seconds for real-time updates
    const interval = setInterval(updateDashboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateDashboardData = () => {
    setCampaigns(campaignEngine.getCampaigns());
    setMetrics(campaignEngine.getMetrics());
    setRecentMessages(llmEmitter.getRecentMessages(5));
  };

  const handleCreateCampaign = () => {
    if (!newCampaignName || selectedZips.length === 0) return;

    const messageTemplate = customMessage || `${selectedTopic} policy update for your community.`;
    
    campaignEngine.createCampaign(
      newCampaignName,
      selectedZips,
      selectedTopic as any,
      messageTemplate
    );

    console.log(`📢 Campaign created: ${newCampaignName} targeting ${selectedZips.join(', ')}`);
    
    // Reset form
    setNewCampaignName('');
    setSelectedZips([]);
    setCustomMessage('');
    
    updateDashboardData();
  };

  const handleGenerateLLMMessage = async () => {
    setIsGenerating(true);
    
    try {
      const message = await llmEmitter.generateCivicMessage({
        topic: llmTopic as any,
        tone: llmTone as any,
        targetZip: llmZip,
        maxLength: 280
      });
      
      console.log(`🧠 LLM message generated: ${message.topic} (${message.tone}) - ${message.content}`);
      
      updateDashboardData();
    } catch (error) {
      console.error('LLM generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCampaignAction = (campaignId: string, action: 'pause' | 'resume') => {
    if (action === 'pause') {
      campaignEngine.pauseCampaign(campaignId);
    } else {
      campaignEngine.resumeCampaign(campaignId);
    }
    updateDashboardData();
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getReachProgress = (campaign: Campaign) => {
    return campaign.reach_target > 0 ? (campaign.actual_reach / campaign.reach_target) * 100 : 0;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold">{metrics?.total_campaigns || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics?.active_campaigns || 0}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reach</p>
                <p className="text-2xl font-bold">{metrics?.total_reach.toLocaleString() || '0'}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold">{((metrics?.avg_engagement || 0) * 100).toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
          <TabsTrigger value="creation">Campaign Creation</TabsTrigger>
          <TabsTrigger value="analytics">ZIP Analytics</TabsTrigger>
        </TabsList>

        {/* Active Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Campaign Overview
              </CardTitle>
              <CardDescription>
                Monitor active civic engagement campaigns across pilot ZIP zones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status.toUpperCase()}
                        </Badge>
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <Badge variant="outline">{campaign.topic}</Badge>
                      </div>
                      <div className="flex gap-2">
                        {campaign.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCampaignAction(campaign.id, 'pause')}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {campaign.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCampaignAction(campaign.id, 'resume')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Target ZIP(s)</p>
                        <p className="font-medium">{campaign.target_zips.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reach Progress</p>
                        <div className="flex items-center gap-2">
                          <Progress value={getReachProgress(campaign)} className="flex-1" />
                          <span className="text-sm">{Math.round(getReachProgress(campaign))}%</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {campaign.actual_reach.toLocaleString()} / {campaign.reach_target.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Engagement Rate</p>
                        <p className="font-medium">{(campaign.engagement_rate * 100).toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">
                          Pushback: {(campaign.pushback_percentage * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium">Message Template:</p>
                      <p className="text-sm text-gray-700">{campaign.message_template}</p>
                    </div>
                  </div>
                ))}
                
                {campaigns.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No campaigns active. Create a new campaign to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Creation Tab */}
        <TabsContent value="creation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Creation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Create New Campaign
                </CardTitle>
                <CardDescription>
                  Launch targeted civic engagement campaigns with ZIP-specific messaging
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Campaign Name</label>
                  <Input
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="Healthcare Access Initiative"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Topic</label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="taxation">Taxation</SelectItem>
                      <SelectItem value="climate">Climate</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Target ZIP Codes</label>
                  <div className="mt-2 space-y-2">
                    {availableZips.map((zip) => (
                      <label key={zip.code} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedZips.includes(zip.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedZips([...selectedZips, zip.code]);
                            } else {
                              setSelectedZips(selectedZips.filter(z => z !== zip.code));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">
                          {zip.code} - {zip.city} ({zip.population.toLocaleString()})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Custom Message (optional)</label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Override the default message template..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleCreateCampaign}
                  disabled={!newCampaignName || selectedZips.length === 0}
                  className="w-full"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>

            {/* LLM Message Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  ✨ AI Message Generator
                </CardTitle>
                <CardDescription>
                  Generate civic messages using GPT-4o with privacy-first redaction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Topic</label>
                  <Select value={llmTopic} onValueChange={setLlmTopic}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="taxation">Taxation</SelectItem>
                      <SelectItem value="climate">Climate</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tone</label>
                  <Select value={llmTone} onValueChange={setLlmTone}>
                    <SelectTrigger className="mt-1">
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
                  <label className="text-sm font-medium">Target ZIP</label>
                  <Select value={llmZip} onValueChange={setLlmZip}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableZips.map((zip) => (
                        <SelectItem key={zip.code} value={zip.code}>
                          {zip.code} - {zip.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleGenerateLLMMessage}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      ✨ AI Generate
                    </>
                  )}
                </Button>
                
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {llmEmitter.isGPTAvailable() ? 
                    'GPT-4o available with privacy redaction' : 
                    'Using local templates (no API key)'
                  }
                </div>
                
                {/* Recent Messages */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Messages:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {recentMessages.map((msg) => (
                      <div key={msg.id} className="text-xs p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {msg.topic}
                          </Badge>
                          <Badge variant={msg.aiGenerated ? "default" : "secondary"} className="text-xs">
                            {msg.aiGenerated ? 'AI' : 'Template'}
                          </Badge>
                          <span className="text-gray-500">
                            {msg.confidence.toFixed(1)} confidence
                          </span>
                        </div>
                        <p className="text-gray-700">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ZIP Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                ZIP Code Analytics
              </CardTitle>
              <CardDescription>
                Civic engagement metrics across pilot zones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableZips.map((zip) => {
                  const campaignsInZip = campaigns.filter(c => c.target_zips.includes(zip.code));
                  const activeCampaigns = campaignsInZip.filter(c => c.status === 'active').length;
                  const totalReach = campaignsInZip.reduce((sum, c) => sum + c.actual_reach, 0);
                  const avgEngagement = campaignsInZip.length > 0 ?
                    campaignsInZip.reduce((sum, c) => sum + c.engagement_rate, 0) / campaignsInZip.length : 0;
                  
                  return (
                    <Card key={zip.code}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{zip.city}</h3>
                            <Badge variant="outline">{zip.code}</Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            Population: {zip.population.toLocaleString()}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <p className="text-xs text-gray-500">Active Campaigns</p>
                              <p className="font-medium">{activeCampaigns}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Total Reach</p>
                              <p className="font-medium">{totalReach.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Avg Engagement</p>
                              <p className="font-medium">{(avgEngagement * 100).toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Penetration</p>
                              <p className="font-medium">{((totalReach / zip.population) * 100).toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PressReplayDashboard;