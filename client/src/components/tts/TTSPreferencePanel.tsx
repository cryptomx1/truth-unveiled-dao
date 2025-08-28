/**
 * TTSPreferencePanel.tsx  
 * Phase TTS-CIVIC-ENHANCE Step 3: Global TTS settings panel
 * Commander Mark directive via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Volume2, VolumeX, Play, Pause, Save, RotateCcw, 
  Mic, User, Clock, Shield, TestTube 
} from 'lucide-react';
import TTSEngineAgent from '@/agents/TTSEngineAgent';
import TTSAutoNarrationAgent from '@/agents/TTSAutoNarrationAgent';
import VoiceProviderSelector from './VoiceProviderSelector';

interface TTSUserPreferences {
  voiceProvider: string;
  speechSpeed: 'slow' | 'normal' | 'fast';
  toneBias: 'formal' | 'friendly' | 'emotional';
  autoplayEnabled: boolean;
  autoplayDelay: number;
  volume: number;
  enablePrivacyFilter: boolean;
  preferredVoice?: string;
  deckSpecificSettings: Record<string, any>;
}

interface VoiceProvider {
  id: string;
  name: string;
  status: 'online' | 'degraded' | 'offline';
  premium: boolean;
  description: string;
}

const TTSPreferencePanel: React.FC = () => {
  const [ttsEngine] = useState(() => TTSEngineAgent.getInstance());
  const [autoAgent] = useState(() => TTSAutoNarrationAgent.getInstance());
  const [voiceSelector] = useState(() => VoiceProviderSelector.getInstance());

  const [preferences, setPreferences] = useState<TTSUserPreferences>({
    voiceProvider: 'auto',
    speechSpeed: 'normal',
    toneBias: 'formal',
    autoplayEnabled: true,
    autoplayDelay: 5,
    volume: 80,
    enablePrivacyFilter: true,
    deckSpecificSettings: {}
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [testText] = useState(
    'Welcome to the Truth Unveiled Civic Genome platform. This is a test of your personalized TTS configuration.'
  );

  const voiceProviders: VoiceProvider[] = [
    { id: 'auto', name: 'Auto-Select Best', status: 'online', premium: false, description: 'Intelligent provider selection' },
    { id: 'openai_gpt4o', name: 'OpenAI GPT-4o Voice', status: 'online', premium: true, description: 'Premium AI voice synthesis' },
    { id: 'google_cloud', name: 'Google Cloud TTS', status: 'online', premium: true, description: 'WaveNet neural voices' },
    { id: 'playht', name: 'Play.ht Premium', status: 'degraded', premium: true, description: 'Ultra-realistic AI voices' },
    { id: 'wellsaid', name: 'WellSaid Labs', status: 'degraded', premium: true, description: 'Human-like voice avatars' },
    { id: 'browser_native', name: 'Browser Native', status: 'online', premium: false, description: 'Built-in browser TTS' }
  ];

  useEffect(() => {
    loadUserPreferences();
  }, []);

  useEffect(() => {
    if (hasUnsavedChanges) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [hasUnsavedChanges]);

  const loadUserPreferences = () => {
    try {
      const stored = localStorage.getItem('tts_user_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(prev => ({ ...prev, ...parsed }));
      }

      // Load specific settings
      const autoplayEnabled = localStorage.getItem('tts_autoplay') !== 'false';
      setPreferences(prev => ({ ...prev, autoplayEnabled }));
      
    } catch (error) {
      console.warn('⚠️ Failed to load TTS preferences, using defaults');
    }
  };

  const saveUserPreferences = () => {
    try {
      localStorage.setItem('tts_user_preferences', JSON.stringify(preferences));
      localStorage.setItem('tts_autoplay', preferences.autoplayEnabled.toString());

      // Apply to agents
      autoAgent.setAutoplayEnabled(preferences.autoplayEnabled);
      autoAgent.setLingeDuration(preferences.autoplayDelay * 1000);

      // Apply global settings to TTS engine
      ttsEngine.updateDeckConfiguration('global', {
        tone: preferences.toneBias as any,
        speed: preferences.speechSpeed,
        enabled: true,
        qualityPreference: 'high'
      });

      setHasUnsavedChanges(false);
      console.log('✅ TTS preferences saved and applied');
      
    } catch (error) {
      console.error('❌ Failed to save TTS preferences:', error);
    }
  };

  const handlePreferenceChange = (key: keyof TTSUserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleTestVoice = async () => {
    if (isPlaying) {
      ttsEngine.stopNarration();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    try {
      // Apply current settings temporarily
      await ttsEngine.narrateContent(
        'preference-test',
        'settings',
        testText,
        'high'
      );
    } catch (error) {
      console.error('TTS test failed:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const resetToDefaults = () => {
    const defaults: TTSUserPreferences = {
      voiceProvider: 'auto',
      speechSpeed: 'normal',
      toneBias: 'formal',
      autoplayEnabled: true,
      autoplayDelay: 5,
      volume: 80,
      enablePrivacyFilter: true,
      deckSpecificSettings: {}
    };
    
    setPreferences(defaults);
    setHasUnsavedChanges(true);
  };

  const getProviderStatus = (providerId: string) => {
    const provider = voiceProviders.find(p => p.id === providerId);
    return provider?.status || 'unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'degraded': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'offline': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">TTS Preferences</h1>
        <p className="text-muted-foreground">
          Customize your text-to-speech experience across all civic decks
        </p>
        
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              You have unsaved changes
            </span>
            <Button 
              size="sm" 
              onClick={saveUserPreferences}
              className="ml-auto"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Now
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="voice">
            <Mic className="h-4 w-4 mr-2" />
            Voice & Provider
          </TabsTrigger>
          <TabsTrigger value="autoplay">
            <Play className="h-4 w-4 mr-2" />
            Auto-Narration
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Speech Settings
              </CardTitle>
              <CardDescription>
                Configure speech speed, tone, and volume preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="speech-speed">Speech Speed</Label>
                  <Select 
                    value={preferences.speechSpeed} 
                    onValueChange={(value: 'slow' | 'normal' | 'fast') => 
                      handlePreferenceChange('speechSpeed', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow (0.8x)</SelectItem>
                      <SelectItem value="normal">Normal (1.0x)</SelectItem>
                      <SelectItem value="fast">Fast (1.2x)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone-bias">Tone Preference</Label>
                  <Select 
                    value={preferences.toneBias} 
                    onValueChange={(value: 'formal' | 'friendly' | 'emotional') => 
                      handlePreferenceChange('toneBias', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal & Professional</SelectItem>
                      <SelectItem value="friendly">Friendly & Conversational</SelectItem>
                      <SelectItem value="emotional">Emotional & Expressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">Volume: {preferences.volume}%</Label>
                <Slider
                  value={[preferences.volume]}
                  onValueChange={([value]) => handlePreferenceChange('volume', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              <Separator />

              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleTestVoice}
                  variant="outline"
                  className="flex-1"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Test
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Test Voice
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Provider Selection
              </CardTitle>
              <CardDescription>
                Choose your preferred TTS provider and voice characteristics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {voiceProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      preferences.voiceProvider === provider.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => handlePreferenceChange('voiceProvider', provider.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{provider.name}</h4>
                          {provider.premium && (
                            <Badge variant="secondary" className="text-xs">Premium</Badge>
                          )}
                          <Badge className={getStatusColor(provider.status)} variant="secondary">
                            {provider.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {provider.description}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={preferences.voiceProvider === provider.id}
                          onChange={() => handlePreferenceChange('voiceProvider', provider.id)}
                          className="h-4 w-4 text-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="autoplay" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Auto-Narration Settings
              </CardTitle>
              <CardDescription>
                Configure automatic narration when hovering over civic cards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="autoplay-enabled">Enable Auto-Narration</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically read content when hovering for {preferences.autoplayDelay} seconds
                  </p>
                </div>
                <Switch
                  id="autoplay-enabled"
                  checked={preferences.autoplayEnabled}
                  onCheckedChange={(checked) => handlePreferenceChange('autoplayEnabled', checked)}
                />
              </div>

              {preferences.autoplayEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="autoplay-delay">
                    Hover Delay: {preferences.autoplayDelay} seconds
                  </Label>
                  <Slider
                    value={[preferences.autoplayDelay]}
                    onValueChange={([value]) => handlePreferenceChange('autoplayDelay', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1s (Immediate)</span>
                    <span>10s (Delayed)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Manage privacy filters and content handling for TTS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="privacy-filter">Enable Privacy Filter</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically filter CID, DID, ZKP hashes, and sensitive content
                  </p>
                </div>
                <Switch
                  id="privacy-filter"
                  checked={preferences.enablePrivacyFilter}
                  onCheckedChange={(checked) => handlePreferenceChange('enablePrivacyFilter', checked)}
                />
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Privacy Protection Active
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      All sensitive identifiers are automatically removed before speech synthesis. 
                      TTS providers never receive your personal CID or DID information.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleTestVoice}
            variant="outline"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Test Settings
          </Button>
          <Button
            onClick={saveUserPreferences}
            disabled={!hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TTSPreferencePanel;