import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Archive, Users, FileText, Mic, ChevronLeft, ChevronRight, AlertTriangle, Shield, Hash, CheckCircle, XCircle, Sparkles } from 'lucide-react';

interface SummitEntry {
  id: string;
  title: string;
  contributor: string;
  role: 'citizen' | 'delegate' | 'council_member' | 'mayor' | 'governor';
  lifecycle: string;
  verified: boolean;
  zkpHash: string;
  source: 'vault' | 'testimony';
  type: 'contribution' | 'testimony';
}

interface CommunityVoice {
  id: string;
  quote: string;
  contributor: string;
  emotion: 'hopeful' | 'concerned' | 'grateful' | 'urgent' | 'reflective';
  source: 'vault' | 'testimony';
}

interface PreservationFile {
  title: string;
  fileType: 'document' | 'audio' | 'image' | 'data';
  sourceLinks: string;
  civicUseTag: string;
}

const CivicLegacySummitCard: React.FC = () => {
  const [summitEntries] = useState<SummitEntry[]>([
    {
      id: 'summit_001',
      title: 'Housing First Policy Draft',
      contributor: 'Dr. Elena Rodriguez',
      role: 'council_member',
      lifecycle: 'archived',
      verified: true,
      zkpHash: 'zkp_vault_a7f2e9d8c1b4',
      source: 'vault',
      type: 'contribution'
    },
    {
      id: 'summit_002',
      title: 'Justice System Reform Testimony',
      contributor: 'Dr. James Rodriguez',
      role: 'delegate',
      lifecycle: 'published',
      verified: true,
      zkpHash: 'zkp_testimony_c3e8f1a9b2d7',
      source: 'testimony',
      type: 'testimony'
    },
    {
      id: 'summit_003',
      title: 'Constitutional Amendment Proposal',
      contributor: 'Prof. Michael Chen',
      role: 'governor',
      lifecycle: 'indexed',
      verified: false,
      zkpHash: 'zkp_vault_e1d9f4c2a8b5',
      source: 'vault',
      type: 'contribution'
    },
    {
      id: 'summit_004',
      title: 'Housing for All Initiative',
      contributor: 'Maria Santos',
      role: 'citizen',
      lifecycle: 'memorialized',
      verified: true,
      zkpHash: 'zkp_testimony_a7f2e9d8c1b4',
      source: 'testimony',
      type: 'testimony'
    },
    {
      id: 'summit_005',
      title: 'Community Town Hall Archive',
      contributor: 'James Park',
      role: 'citizen',
      lifecycle: 'verified',
      verified: true,
      zkpHash: 'zkp_vault_c3e8f1a9b2d7',
      source: 'vault',
      type: 'contribution'
    },
    {
      id: 'summit_006',
      title: 'Education Policy Impact',
      contributor: 'Sarah Chen',
      role: 'council_member',
      lifecycle: 'reviewed',
      verified: false,
      zkpHash: 'zkp_testimony_e1d9f4c2a8b5',
      source: 'testimony',
      type: 'testimony'
    }
  ]);

  const [communityVoices] = useState<CommunityVoice[]>([
    {
      id: 'voice_001',
      quote: 'My children now have a safe place to play and study thanks to community housing initiatives.',
      contributor: 'Maria Santos',
      emotion: 'grateful',
      source: 'testimony'
    },
    {
      id: 'voice_002',
      quote: 'Reforming our justice system requires community input and transparent processes for fair outcomes.',
      contributor: 'Dr. James Rodriguez',
      emotion: 'urgent',
      source: 'testimony'
    },
    {
      id: 'voice_003',
      quote: 'Environmental justice initiatives show how government and community can work together effectively.',
      contributor: 'James Park',
      emotion: 'hopeful',
      source: 'vault'
    },
    {
      id: 'voice_004',
      quote: 'Constitutional amendments must expand civic participation and establish direct democracy mechanisms.',
      contributor: 'Prof. Michael Chen',
      emotion: 'reflective',
      source: 'vault'
    },
    {
      id: 'voice_005',
      quote: 'After-school programs demonstrate how policy can directly improve families and communities.',
      contributor: 'Sarah Chen',
      emotion: 'hopeful',
      source: 'testimony'
    }
  ]);

  const [currentVoiceIndex, setCurrentVoiceIndex] = useState(0);
  const [preservationFile, setPreservationFile] = useState<PreservationFile>({
    title: '',
    fileType: 'document',
    sourceLinks: '',
    civicUseTag: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unverifiableRate, setUnverifiableRate] = useState(33.3); // 2 out of 6 unverified
  const [showPushbackAlert, setShowPushbackAlert] = useState(false);
  const [summitMetrics, setSummitMetrics] = useState({
    totalArchived: 6,
    totalVerified: 4,
    totalContributors: 5,
    verificationScore: 66.7,
    preservationFiles: 12
  });

  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize TTS
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // TTS Mount Announcement
      const timer = setTimeout(() => {
        speakText("Legacy summit interface ready. Civic preservation capsule prepared for community archive.");
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  // Monitor unverifiable rate for pushback alerts
  useEffect(() => {
    const pushbackTimer = setInterval(() => {
      const rate = Math.random() * 50 + 20; // 20-70% simulation
      setUnverifiableRate(rate);
      
      if (rate >= 30) {
        setShowPushbackAlert(true);
        console.log(`⚠️ Preservation file unverifiable: ${rate.toFixed(1)}% (exceeds 30% threshold)`);
        
        setTimeout(() => {
          setShowPushbackAlert(false);
        }, 4000);
      }
    }, 8000);

    return () => clearInterval(pushbackTimer);
  }, []);

  // Community voice carousel rotation
  useEffect(() => {
    const carouselTimer = setInterval(() => {
      setCurrentVoiceIndex(prev => (prev + 1) % communityVoices.length);
    }, 6000);

    return () => clearInterval(carouselTimer);
  }, [communityVoices.length]);

  const speakText = (text: string) => {
    if (speechSynthesisRef.current) {
      // Cancel any ongoing speech
      speechSynthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      currentUtteranceRef.current = utterance;
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const generateZKPHash = (title: string, fileType: string): string => {
    const timestamp = Date.now();
    const hashInput = `${title}_${fileType}_${timestamp}`;
    return `zkp_summit_${hashInput.slice(-12)}`;
  };

  const getRoleColor = (role: SummitEntry['role']) => {
    switch (role) {
      case 'citizen': return 'text-slate-600';
      case 'delegate': return 'text-blue-600';
      case 'council_member': return 'text-green-600';
      case 'mayor': return 'text-purple-600';
      case 'governor': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getEmotionColor = (emotion: CommunityVoice['emotion']) => {
    switch (emotion) {
      case 'hopeful': return 'text-green-400';
      case 'grateful': return 'text-blue-400';
      case 'concerned': return 'text-orange-400';
      case 'urgent': return 'text-red-400';
      case 'reflective': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  const getSourceIcon = (source: 'vault' | 'testimony') => {
    return source === 'vault' ? <Archive className="w-3 h-3" /> : <Mic className="w-3 h-3" />;
  };

  const getFileTypeIcon = (fileType: PreservationFile['fileType']) => {
    switch (fileType) {
      case 'document': return <FileText className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      case 'image': return <FileText className="w-4 h-4" />;
      case 'data': return <Archive className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handlePreservationSubmit = () => {
    if (!preservationFile.title.trim() || !preservationFile.civicUseTag.trim()) return;

    setIsSubmitting(true);
    
    // Simulate preservation upload processing
    setTimeout(() => {
      const zkpHash = generateZKPHash(preservationFile.title, preservationFile.fileType);
      
      // TTS confirmation
      speakText("Preservation capsule submitted for civic archive verification");
      
      // Update metrics
      setSummitMetrics(prev => ({
        ...prev,
        preservationFiles: prev.preservationFiles + 1
      }));

      // Reset form
      setPreservationFile({
        title: '',
        fileType: 'document',
        sourceLinks: '',
        civicUseTag: ''
      });
      
      setIsSubmitting(false);
    }, 2500);
  };

  const navigateVoice = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentVoiceIndex(prev => prev === 0 ? communityVoices.length - 1 : prev - 1);
    } else {
      setCurrentVoiceIndex(prev => (prev + 1) % communityVoices.length);
    }
  };

  const currentVoice = communityVoices[currentVoiceIndex];

  return (
    <Card className="w-full max-w-sm mx-auto bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Legacy Summit
          </CardTitle>
          {showPushbackAlert && (
            <div className="flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">Alert</span>
            </div>
          )}
        </div>
        
        {/* Metrics Panel */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-slate-900 rounded-lg p-2">
            <div className="text-xs text-slate-400">Archived</div>
            <div className="text-sm font-medium">{summitMetrics.totalArchived}</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-2">
            <div className="text-xs text-slate-400">Verified</div>
            <div className="text-sm font-medium text-green-400">
              {summitMetrics.totalVerified}/{summitMetrics.totalArchived}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-900 rounded-lg p-2">
            <div className="text-xs text-slate-400">Contributors</div>
            <div className="text-sm font-medium text-blue-400">{summitMetrics.totalContributors}</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-2">
            <div className="text-xs text-slate-400">Score</div>
            <div className={`text-sm font-medium ${summitMetrics.verificationScore >= 85 ? 'text-green-400' : 'text-orange-400'}`}>
              {summitMetrics.verificationScore.toFixed(1)}%
            </div>
          </div>
        </div>
        
        {/* Pushback Alert */}
        {unverifiableRate >= 30 && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-2 mt-2 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">
                {unverifiableRate.toFixed(1)}% unverifiable files (exceeds 30% threshold)
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4" role="main" aria-live="polite">
        {/* Summit Archive Rollup */}
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Summit Archive Capsule
          </div>
          
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {summitEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-slate-800 rounded-lg p-2 border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getSourceIcon(entry.source)}
                      <div className="text-xs font-medium text-white truncate">{entry.title}</div>
                    </div>
                    {entry.verified ? (
                      <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <span className={getRoleColor(entry.role)}>{entry.contributor}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{entry.lifecycle}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1">
                    <Hash className="w-2 h-2 text-slate-500" />
                    <span className="text-xs font-mono text-slate-500 truncate">{entry.zkpHash}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator className="bg-slate-700" />

        {/* Community Voice Display */}
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Community Voices
          </div>
          
          <div className="relative">
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 min-h-[100px]">
              <div className="text-sm text-slate-300 leading-relaxed mb-3">
                "{currentVoice.quote}"
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">{currentVoice.contributor}</span>
                  <Badge className={`text-xs px-1 py-0 ${getEmotionColor(currentVoice.emotion)} bg-transparent border border-slate-600`}>
                    {currentVoice.emotion}
                  </Badge>
                  {getSourceIcon(currentVoice.source)}
                </div>
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateVoice('prev')}
                className="text-slate-400 hover:text-white hover:bg-slate-700 p-1"
                style={{ minHeight: '32px', minWidth: '32px' }}
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              
              <div className="flex gap-1">
                {communityVoices.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentVoiceIndex ? 'bg-blue-400' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateVoice('next')}
                className="text-slate-400 hover:text-white hover:bg-slate-700 p-1"
                style={{ minHeight: '32px', minWidth: '32px' }}
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Preservation Capsule Upload */}
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Preservation Capsule
          </div>
          
          <div className="space-y-3">
            <Input
              placeholder="Preservation title (max 100 chars)"
              value={preservationFile.title}
              onChange={(e) => setPreservationFile(prev => ({ ...prev, title: e.target.value.slice(0, 100) }))}
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
              maxLength={100}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <Select value={preservationFile.fileType} onValueChange={(value: 'document' | 'audio' | 'image' | 'data') => setPreservationFile(prev => ({ ...prev, fileType: value }))}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Civic use tag"
                value={preservationFile.civicUseTag}
                onChange={(e) => setPreservationFile(prev => ({ ...prev, civicUseTag: e.target.value.slice(0, 50) }))}
                className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                maxLength={50}
              />
            </div>
            
            <Textarea
              placeholder="Source links and references (optional)"
              value={preservationFile.sourceLinks}
              onChange={(e) => setPreservationFile(prev => ({ ...prev, sourceLinks: e.target.value.slice(0, 200) }))}
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 min-h-[60px]"
              maxLength={200}
            />
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">
                {preservationFile.title.length}/100 chars
              </span>
              <Button
                onClick={handlePreservationSubmit}
                disabled={!preservationFile.title.trim() || !preservationFile.civicUseTag.trim() || isSubmitting}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1 text-sm flex items-center gap-2"
                style={{ minHeight: '40px' }}
              >
                {getFileTypeIcon(preservationFile.fileType)}
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>

        {/* ZKP Security Panel */}
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            ZKP Security Chain
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Chain Valid:</span>
              <span className="text-green-400">{summitMetrics.totalVerified}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Chain Failed:</span>
              <span className="text-red-400">{summitMetrics.totalArchived - summitMetrics.totalVerified}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Files:</span>
              <span className="text-blue-400">{summitMetrics.preservationFiles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Integrity:</span>
              <span className={unverifiableRate >= 30 ? "text-red-400" : "text-green-400"}>
                {(100 - unverifiableRate).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CivicLegacySummitCard;