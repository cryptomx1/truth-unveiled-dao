/**
 * TTSPreviewPage.tsx
 * Phase TTS-CIVIC-ENHANCE Step 4: Tutorial preview interface for GROK validation
 * Route: /tts/tutorials/preview
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  CheckCircle, 
  Clock,
  FileText,
  Settings
} from 'lucide-react';
import TTSToggle from '@/components/tts/TTSToggle';

interface TutorialData {
  schema: {
    deckId: string;
    moduleId: string;
    moduleName: string;
    tutorialType: string;
  };
  tutorialContent: {
    introductoryNarration: { title: string; content: string; duration: string; };
    navigationGuidance: { title: string; content: string; duration: string; };
    privacyNotice: { title: string; content: string; duration: string; };
    nextStepsCue: { title: string; content: string; duration: string; };
  };
  metadata: {
    version: string;
    estimatedCompletionTime: string;
    authorizedBy: string;
    qaValidation: string;
  };
}

const TTSPreviewPage: React.FC = () => {
  const [selectedTutorial, setSelectedTutorial] = useState<string>('deck1/module1');
  const [tutorialData, setTutorialData] = useState<TutorialData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('introductoryNarration');
  const [progress, setProgress] = useState(0);
  const [loadingTutorials, setLoadingTutorials] = useState(true);

  // Available tutorials for the first 5 decks
  const availableTutorials = [
    // Deck 1 - Wallet Overview
    { id: 'deck1/module1', name: 'Identity Summary Card', deck: 'Deck 1' },
    { id: 'deck1/module2', name: 'Civic Swipe Card', deck: 'Deck 1' },
    { id: 'deck1/module3', name: 'Treasury Balance Display', deck: 'Deck 1' },
    
    // Deck 2 - Governance
    { id: 'deck2/module1', name: 'Governance Proposal Interface', deck: 'Deck 2' },
    { id: 'deck2/module2', name: 'Community Discussion Forum', deck: 'Deck 2' },
    { id: 'deck2/module3', name: 'Vote Tracking Dashboard', deck: 'Deck 2' },
    
    // Deck 3 - Privacy
    { id: 'deck3/module1', name: 'Privacy Control Center', deck: 'Deck 3' },
    { id: 'deck3/module2', name: 'Data Encryption Manager', deck: 'Deck 3' },
    { id: 'deck3/module3', name: 'Anonymity Settings Panel', deck: 'Deck 3' },
    
    // Deck 4 - Civic Identity
    { id: 'deck4/module1', name: 'Civic Identity Verification', deck: 'Deck 4' },
    { id: 'deck4/module2', name: 'Reputation Builder System', deck: 'Deck 4' },
    { id: 'deck4/module3', name: 'Achievement Tracker Dashboard', deck: 'Deck 4' },
    
    // Deck 5 - Consensus Layer
    { id: 'deck5/module1', name: 'Consensus Layer Interface', deck: 'Deck 5' },
    { id: 'deck5/module2', name: 'Deliberation Tools Suite', deck: 'Deck 5' },
    { id: 'deck5/module3', name: 'Agreement Tracking System', deck: 'Deck 5' }
  ];

  useEffect(() => {
    loadTutorialData(selectedTutorial);
  }, [selectedTutorial]);

  const loadTutorialData = async (tutorialId: string) => {
    try {
      setLoadingTutorials(true);
      // Simulate loading tutorial data
      const [deckId, moduleId] = tutorialId.split('/');
      
      // In a real implementation, this would fetch from the actual tutorial files
      const mockTutorialData: TutorialData = {
        schema: {
          deckId,
          moduleId,
          moduleName: availableTutorials.find(t => t.id === tutorialId)?.name || 'Unknown Module',
          tutorialType: 'civic_engagement_guidance'
        },
        tutorialContent: {
          introductoryNarration: {
            title: '📌 Welcome to Civic Engagement',
            content: 'This is a sample tutorial introduction explaining the civic engagement features and how to use them effectively.',
            duration: '15 seconds'
          },
          navigationGuidance: {
            title: '🔍 Navigation Instructions',
            content: 'Here you will learn how to navigate through the interface, access different features, and complete civic activities.',
            duration: '25 seconds'
          },
          privacyNotice: {
            title: '🔒 Privacy Protection',
            content: 'Your privacy is protected through advanced cryptographic techniques while maintaining transparency in civic participation.',
            duration: '18 seconds'
          },
          nextStepsCue: {
            title: '➡️ Next Steps',
            content: 'Now you are ready to explore more civic features and participate in community governance activities.',
            duration: '12 seconds'
          }
        },
        metadata: {
          version: '1.0.0',
          estimatedCompletionTime: '70 seconds',
          authorizedBy: 'Commander Mark via JASMY Relay',
          qaValidation: 'pending_grok_cycle_l'
        }
      };

      setTutorialData(mockTutorialData);
      setLoadingTutorials(false);
    } catch (error) {
      console.error('Failed to load tutorial data:', error);
      setLoadingTutorials(false);
    }
  };

  const playSection = (sectionKey: string) => {
    setCurrentSection(sectionKey);
    setIsPlaying(true);
    setProgress(0);
    
    // Simulate playback progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
  };

  const resetProgress = () => {
    setProgress(0);
    setIsPlaying(false);
  };

  const getSectionIcon = (sectionKey: string) => {
    const icons = {
      introductoryNarration: '📌',
      navigationGuidance: '🔍',
      privacyNotice: '🔒',
      nextStepsCue: '➡️'
    };
    return icons[sectionKey as keyof typeof icons] || '📝';
  };

  const getTutorialStatusBadge = (status: string) => {
    const statusColors = {
      'pending_grok_cycle_l': 'secondary',
      'validated': 'default',
      'failed': 'destructive'
    };
    return statusColors[status as keyof typeof statusColors] || 'secondary';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tutorial Preview System</h1>
            <p className="text-muted-foreground">
              Phase TTS-CIVIC-ENHANCE Step 4 - GROK Validation Preview
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">15 Tutorials Available</Badge>
            <Badge variant={getTutorialStatusBadge(tutorialData?.metadata.qaValidation || 'pending')}>
              QA Status: {tutorialData?.metadata.qaValidation?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tutorial Selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Available Tutorials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableTutorials.map((tutorial) => (
                  <Button
                    key={tutorial.id}
                    onClick={() => setSelectedTutorial(tutorial.id)}
                    variant={selectedTutorial === tutorial.id ? "default" : "ghost"}
                    className="w-full justify-start h-auto p-3"
                  >
                    <div className="text-left">
                      <div className="font-medium">{tutorial.name}</div>
                      <div className="text-xs text-muted-foreground">{tutorial.deck}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tutorial Content */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Tutorial Content Preview
                {tutorialData && (
                  <TTSToggle 
                    content={`Tutorial preview for ${tutorialData.schema.moduleName}`}
                    mode="tutorial"
                  />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTutorials ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading tutorial content...</p>
                  </div>
                </div>
              ) : tutorialData ? (
                <Tabs defaultValue="content" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="content">Tutorial Content</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                    <TabsTrigger value="playback">Playback Controls</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    {Object.entries(tutorialData.tutorialContent).map(([sectionKey, section]) => (
                      <Card key={sectionKey}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium flex items-center gap-2">
                              <span>{getSectionIcon(sectionKey)}</span>
                              {section.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{section.duration}</Badge>
                              <Button
                                size="sm"
                                onClick={() => playSection(sectionKey)}
                                disabled={isPlaying && currentSection === sectionKey}
                              >
                                {isPlaying && currentSection === sectionKey ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            {section.content}
                          </p>
                          
                          {isPlaying && currentSection === sectionKey && (
                            <div className="space-y-2">
                              <Progress value={progress} className="h-2" />
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Playing...</span>
                                <span>{progress.toFixed(0)}%</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="metadata" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tutorial Metadata</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Module:</span>
                            <p className="text-muted-foreground">{tutorialData.schema.moduleName}</p>
                          </div>
                          <div>
                            <span className="font-medium">Type:</span>
                            <p className="text-muted-foreground">{tutorialData.schema.tutorialType}</p>
                          </div>
                          <div>
                            <span className="font-medium">Version:</span>
                            <p className="text-muted-foreground">{tutorialData.metadata.version}</p>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <p className="text-muted-foreground">{tutorialData.metadata.estimatedCompletionTime}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Authorized By:</span>
                            <p className="text-muted-foreground">{tutorialData.metadata.authorizedBy}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="playback" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Playback Controls
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => playSection(currentSection)}
                            disabled={isPlaying}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Play Current
                          </Button>
                          <Button
                            onClick={pausePlayback}
                            variant="outline"
                            disabled={!isPlaying}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </Button>
                          <Button
                            onClick={resetProgress}
                            variant="outline"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Overall Progress</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-3" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">15</div>
                            <div className="text-sm text-muted-foreground">Tutorials Created</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">5</div>
                            <div className="text-sm text-muted-foreground">Decks Covered</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Failed to load tutorial data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Phase TTS-CIVIC-ENHANCE Step 4 Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">✅ Complete</div>
                <div className="text-sm text-muted-foreground">First 5 Decks</div>
                <div className="text-xs text-muted-foreground mt-1">15 tutorials generated</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">🎯 Ready</div>
                <div className="text-sm text-muted-foreground">GROK Validation</div>
                <div className="text-xs text-muted-foreground mt-1">QA Cycle L+ pending</div>
              </div>
              <div className="text-2xl font-bold text-orange-600 text-center p-4 border rounded-lg">
                <div>⏳ Pending</div>
                <div className="text-sm text-muted-foreground">Remaining Decks</div>
                <div className="text-xs text-muted-foreground mt-1">Decks 6-20 (45 tutorials)</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">🔊 Active</div>
                <div className="text-sm text-muted-foreground">TTS Engine</div>
                <div className="text-xs text-muted-foreground mt-1">Agent system operational</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accessibility live region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="tutorial-preview-status"
      >
        {isPlaying && `Playing ${currentSection} section, ${progress.toFixed(0)}% complete`}
      </div>
    </div>
  );
};

export default TTSPreviewPage;