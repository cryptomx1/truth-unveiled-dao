import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Mic, Play, Pause, AlertTriangle, Users, MapPin, Clock, CheckCircle, XCircle, Hash, User } from 'lucide-react';

interface TestimonyEntry {
  id: string;
  title: string;
  content: string;
  format: 'audio' | 'text';
  theme: 'justice' | 'policy' | 'community' | 'family';
  contributor: {
    name: string;
    role: 'citizen' | 'delegate' | 'council_member' | 'mayor' | 'governor';
    did: string;
    location: string;
  };
  lifecycle: 'submitted' | 'reviewed' | 'published' | 'memorialized';
  emotion: 'hopeful' | 'concerned' | 'grateful' | 'urgent' | 'reflective';
  timestamp: string;
  zkpHash: string;
  verified: boolean;
  reviewCount: number;
}

const CivicTestimonyCard: React.FC = () => {
  const [testimonies, setTestimonies] = useState<TestimonyEntry[]>([
    {
      id: 'test_001',
      title: 'Housing for All Initiative',
      content: 'As a mother of three, I witnessed how the city housing program transformed our neighborhood. My children now have a safe place to play and study. The local council listened to our concerns and acted with compassion.',
      format: 'text',
      theme: 'community',
      contributor: {
        name: 'Maria Santos',
        role: 'citizen',
        did: 'did:civic:testimony_contributor_001',
        location: 'District 4, North Bay'
      },
      lifecycle: 'memorialized',
      emotion: 'grateful',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      zkpHash: 'zkp_testimony_a7f2e9d8c1b4',
      verified: true,
      reviewCount: 8
    },
    {
      id: 'test_002',
      title: 'Justice System Reform',
      content: 'I have seen the impact of bias in our courts. As a legal advocate, I testify that reforming our justice system requires community input and transparent processes. Every voice matters in creating fair outcomes.',
      format: 'audio',
      theme: 'justice',
      contributor: {
        name: 'Dr. James Rodriguez',
        role: 'delegate',
        did: 'did:civic:testimony_contributor_002',
        location: 'Central District'
      },
      lifecycle: 'published',
      emotion: 'urgent',
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      zkpHash: 'zkp_testimony_c3e8f1a9b2d7',
      verified: true,
      reviewCount: 12
    },
    {
      id: 'test_003',
      title: 'Education Policy Impact',
      content: 'Our new education policy has been life-changing for families. The after-school programs keep children engaged while parents work. This testimony reflects the positive change we have seen in our community.',
      format: 'text',
      theme: 'policy',
      contributor: {
        name: 'Sarah Chen',
        role: 'council_member',
        did: 'did:civic:testimony_contributor_003',
        location: 'East Valley'
      },
      lifecycle: 'reviewed',
      emotion: 'hopeful',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      zkpHash: 'zkp_testimony_e1d9f4c2a8b5',
      verified: true,
      reviewCount: 5
    },
    {
      id: 'test_004',
      title: 'Family Support Services',
      content: 'When my husband lost his job, the city\'s family support program helped us stay afloat. The childcare assistance allowed me to work and keep our family together. Government programs can work when they focus on people.',
      format: 'audio',
      theme: 'family',
      contributor: {
        name: 'Elena Vasquez',
        role: 'citizen',
        did: 'did:civic:testimony_contributor_004',
        location: 'South Ridge'
      },
      lifecycle: 'submitted',
      emotion: 'grateful',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      zkpHash: 'zkp_testimony_f7a3e2d1c9b8',
      verified: false,
      reviewCount: 2
    },
    {
      id: 'test_005',
      title: 'Climate Action Testimony',
      content: 'The flooding last year showed us the reality of climate change. Our community came together to demand better infrastructure and flood prevention. This testimony documents our collective voice for environmental action.',
      format: 'text',
      theme: 'community',
      contributor: {
        name: 'Prof. Michael Thompson',
        role: 'mayor',
        did: 'did:civic:testimony_contributor_005',
        location: 'Riverside District'
      },
      lifecycle: 'published',
      emotion: 'concerned',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      zkpHash: 'zkp_testimony_b8c4f1e7a3d2',
      verified: true,
      reviewCount: 18
    }
  ]);

  const [newTestimony, setNewTestimony] = useState({
    title: '',
    content: '',
    format: 'text' as 'audio' | 'text',
    theme: 'community' as 'justice' | 'policy' | 'community' | 'family',
    emotion: 'hopeful' as 'hopeful' | 'concerned' | 'grateful' | 'urgent' | 'reflective'
  });

  const [selectedTestimony, setSelectedTestimony] = useState<TestimonyEntry | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [unverifiableRate, setUnverifiableRate] = useState(16.7); // 1 out of 6 unverified
  const [showPushbackAlert, setShowPushbackAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testimonyStats, setTestimonyStats] = useState({
    total: 5,
    verified: 4,
    reviewed: 1,
    published: 2,
    memorialized: 1,
    averageReviewTime: '2.3 days'
  });

  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize TTS
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // TTS Mount Announcement
      const timer = setTimeout(() => {
        speakText("Civic testimony interface ready. Community voices archived with verification.");
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  // Monitor unverifiable rate for pushback alerts
  useEffect(() => {
    const pushbackTimer = setInterval(() => {
      const rate = Math.random() * 40 + 10; // 10-50% simulation
      setUnverifiableRate(rate);
      
      if (rate > 25) {
        setShowPushbackAlert(true);
        console.log(`⚠️ Testimony verification failure: ${rate.toFixed(1)}% (exceeds 25% threshold)`);
        
        setTimeout(() => {
          setShowPushbackAlert(false);
        }, 3500);
      }
    }, 8000);

    return () => clearInterval(pushbackTimer);
  }, []);

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

  const generateZKPHash = (contributorDID: string, content: string): string => {
    const timestamp = Date.now();
    const hashInput = `${contributorDID}_${content.substring(0, 20)}_${timestamp}`;
    return `zkp_testimony_${hashInput.slice(-12)}`;
  };

  const getLifecycleColor = (lifecycle: TestimonyEntry['lifecycle']) => {
    switch (lifecycle) {
      case 'submitted': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'memorialized': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getThemeIcon = (theme: TestimonyEntry['theme']) => {
    switch (theme) {
      case 'justice': return <User className="w-3 h-3" />;
      case 'policy': return <FileText className="w-3 h-3" />;
      case 'community': return <Users className="w-3 h-3" />;
      case 'family': return <User className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role: TestimonyEntry['contributor']['role']) => {
    switch (role) {
      case 'citizen': return 'text-slate-600';
      case 'delegate': return 'text-blue-600';
      case 'council_member': return 'text-green-600';
      case 'mayor': return 'text-purple-600';
      case 'governor': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const handleTestimonySubmit = () => {
    if (!newTestimony.title.trim() || !newTestimony.content.trim()) return;

    setIsSubmitting(true);
    
    // Simulate submission processing
    setTimeout(() => {
      const contributorDID = 'did:civic:current_contributor';
      const zkpHash = generateZKPHash(contributorDID, newTestimony.content);
      
      const testimony: TestimonyEntry = {
        id: `test_${Date.now()}`,
        title: newTestimony.title,
        content: newTestimony.content,
        format: newTestimony.format,
        theme: newTestimony.theme,
        contributor: {
          name: 'Current User',
          role: 'citizen',
          did: contributorDID,
          location: 'Local District'
        },
        lifecycle: 'submitted',
        emotion: newTestimony.emotion,
        timestamp: new Date().toISOString(),
        zkpHash,
        verified: false,
        reviewCount: 0
      };

      setTestimonies(prev => [testimony, ...prev]);
      setTestimonyStats(prev => ({
        ...prev,
        total: prev.total + 1
      }));

      // TTS confirmation
      speakText("Testimony submitted for community review");
      
      // Reset form
      setNewTestimony({
        title: '',
        content: '',
        format: 'text',
        theme: 'community',
        emotion: 'hopeful'
      });
      
      setIsSubmitting(false);
    }, 2000);
  };

  const handlePlayTestimony = (testimony: TestimonyEntry) => {
    if (isPlaying === testimony.id) {
      // Stop playing
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      setIsPlaying(null);
    } else {
      // Start playing
      setIsPlaying(testimony.id);
      
      if (testimony.format === 'audio') {
        speakText(`Audio testimony: ${testimony.title}. ${testimony.content}`);
      } else {
        speakText(`Text testimony: ${testimony.content}`);
      }
      
      // Simulate audio duration
      setTimeout(() => {
        setIsPlaying(null);
      }, Math.min(testimony.content.length * 50, 15000));
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  return (
    <Card className="w-full max-w-sm mx-auto bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-400" />
            Civic Testimony
          </CardTitle>
          {showPushbackAlert && (
            <div className="flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">Alert</span>
            </div>
          )}
        </div>
        
        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-slate-900 rounded-lg p-2">
            <div className="text-xs text-slate-400">Total</div>
            <div className="text-sm font-medium">{testimonyStats.total}</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-2">
            <div className="text-xs text-slate-400">Verified</div>
            <div className="text-sm font-medium text-green-400">
              {testimonyStats.verified}/{testimonyStats.total}
            </div>
          </div>
        </div>
        
        {/* Unverifiable Rate Monitor */}
        {unverifiableRate > 25 && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-2 mt-2 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">
                {unverifiableRate.toFixed(1)}% unverified (exceeds 25% threshold)
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4" role="main" aria-live="polite">
        {/* Testimony Submission Form */}
        <div className="bg-slate-900 rounded-lg p-3 space-y-3">
          <div className="text-sm font-medium text-slate-300 mb-2">Submit Testimony</div>
          
          <Input
            placeholder="Testimony title (max 100 chars)"
            value={newTestimony.title}
            onChange={(e) => setNewTestimony(prev => ({ ...prev, title: e.target.value.slice(0, 100) }))}
            className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
            maxLength={100}
          />
          
          <Textarea
            placeholder="Share your civic testimony (max 500 chars)"
            value={newTestimony.content}
            onChange={(e) => setNewTestimony(prev => ({ ...prev, content: e.target.value.slice(0, 500) }))}
            className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 min-h-[80px]"
            maxLength={500}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <Select value={newTestimony.format} onValueChange={(value: 'audio' | 'text') => setNewTestimony(prev => ({ ...prev, format: value }))}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={newTestimony.theme} onValueChange={(value: 'justice' | 'policy' | 'community' | 'family') => setNewTestimony(prev => ({ ...prev, theme: value }))}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="justice">Justice</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="family">Family</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={newTestimony.emotion} onValueChange={(value: 'hopeful' | 'concerned' | 'grateful' | 'urgent' | 'reflective') => setNewTestimony(prev => ({ ...prev, emotion: value }))}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="hopeful">Hopeful</SelectItem>
              <SelectItem value="concerned">Concerned</SelectItem>
              <SelectItem value="grateful">Grateful</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="reflective">Reflective</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-slate-400">
              {newTestimony.content.length}/500 chars
            </span>
            <Button
              onClick={handleTestimonySubmit}
              disabled={!newTestimony.title.trim() || !newTestimony.content.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-sm"
              style={{ minHeight: '48px' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Testimony Archive */}
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {testimonies.map((testimony) => (
              <div
                key={testimony.id}
                className="bg-slate-900 rounded-lg p-3 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => setSelectedTestimony(selectedTestimony?.id === testimony.id ? null : testimony)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedTestimony(selectedTestimony?.id === testimony.id ? null : testimony);
                  }
                }}
                aria-expanded={selectedTestimony?.id === testimony.id}
                aria-label={`Testimony: ${testimony.title}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {testimony.format === 'audio' ? <Mic className="w-4 h-4 text-blue-400" /> : <FileText className="w-4 h-4 text-slate-400" />}
                    <div className="text-sm font-medium text-white truncate">{testimony.title}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {testimony.verified ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getLifecycleColor(testimony.lifecycle)} text-xs px-2 py-0.5`}>
                    {testimony.lifecycle}
                  </Badge>
                  <Badge className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 flex items-center gap-1">
                    {getThemeIcon(testimony.theme)}
                    {testimony.theme}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className={getRoleColor(testimony.contributor.role)}>
                    {testimony.contributor.name} ({testimony.contributor.role})
                  </span>
                  <span>•</span>
                  <span>{formatTimeAgo(testimony.timestamp)}</span>
                </div>
                
                {selectedTestimony?.id === testimony.id && (
                  <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                    <div className="text-sm text-slate-300 leading-relaxed">
                      {testimony.content}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      <span>{testimony.contributor.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono">ZKP: {testimony.zkpHash}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Users className="w-3 h-3" />
                      <span>{testimony.reviewCount} community reviews</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayTestimony(testimony);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs flex items-center gap-1"
                        style={{ minHeight: '32px' }}
                      >
                        {isPlaying === testimony.id ? (
                          <>
                            <Pause className="w-3 h-3" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            Play
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Archive Statistics */}
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-sm font-medium text-slate-300 mb-2">Archive Status</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Published:</span>
              <span className="text-green-400">{testimonyStats.published}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Memorialized:</span>
              <span className="text-purple-400">{testimonyStats.memorialized}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Review:</span>
              <span className="text-blue-400">{testimonyStats.averageReviewTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Unverified:</span>
              <span className={unverifiableRate > 25 ? "text-red-400" : "text-slate-400"}>
                {unverifiableRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CivicTestimonyCard;