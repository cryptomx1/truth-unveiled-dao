import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Users, FileText, Mic, Image, AlertTriangle, CheckCircle, XCircle, Hash, User, MapPin, Clock, Archive } from 'lucide-react';

interface LegacyEntry {
  id: string;
  title: string;
  content: string;
  type: 'contribution' | 'testimony';
  format: 'text' | 'audio' | 'image' | 'citation';
  theme: 'justice' | 'policy' | 'community' | 'family';
  contributor: {
    name: string;
    role: 'citizen' | 'delegate' | 'council_member' | 'mayor' | 'governor';
    did: string;
    location: string;
  };
  lifecycle: 'saved' | 'verified' | 'indexed' | 'archived' | 'submitted' | 'reviewed' | 'published' | 'memorialized';
  timestamp: string;
  zkpHash: string;
  verified: boolean;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  tags: string[];
  sourceModule: 'vault' | 'testimony';
}

const CivicLegacyIndexCard: React.FC = () => {
  const [legacyEntries, setLegacyEntries] = useState<LegacyEntry[]>([
    // From CivicMemoryVaultCard (Module #1)
    {
      id: 'vault_001',
      title: 'Housing First Policy Draft',
      content: 'Comprehensive policy framework ensuring housing as a fundamental civic right with community oversight and sustainable funding mechanisms.',
      type: 'contribution',
      format: 'text',
      theme: 'policy',
      contributor: {
        name: 'Dr. Elena Rodriguez',
        role: 'council_member',
        did: 'did:civic:vault_contributor_001',
        location: 'District 3, South Bay'
      },
      lifecycle: 'archived',
      timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      zkpHash: 'zkp_vault_a7f2e9d8c1b4',
      verified: true,
      riskLevel: 'none',
      tags: ['housing', 'policy', 'rights', 'community'],
      sourceModule: 'vault'
    },
    {
      id: 'vault_002',
      title: 'Community Town Hall Audio',
      content: 'Recording of public forum discussion on environmental justice initiatives with citizen testimony and council responses.',
      type: 'contribution',
      format: 'audio',
      theme: 'community',
      contributor: {
        name: 'James Park',
        role: 'citizen',
        did: 'did:civic:vault_contributor_002',
        location: 'Environmental District'
      },
      lifecycle: 'verified',
      timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      zkpHash: 'zkp_vault_c3e8f1a9b2d7',
      verified: true,
      riskLevel: 'low',
      tags: ['environment', 'justice', 'townhall', 'audio'],
      sourceModule: 'vault'
    },
    {
      id: 'vault_003',
      title: 'Constitutional Amendment Proposal',
      content: 'Detailed constitutional amendment text expanding civic participation rights and establishing direct democracy mechanisms.',
      type: 'contribution',
      format: 'citation',
      theme: 'justice',
      contributor: {
        name: 'Prof. Michael Chen',
        role: 'governor',
        did: 'did:civic:vault_contributor_003',
        location: 'State Capitol'
      },
      lifecycle: 'indexed',
      timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      zkpHash: 'zkp_vault_e1d9f4c2a8b5',
      verified: false,
      riskLevel: 'high',
      tags: ['constitution', 'amendment', 'democracy', 'participation'],
      sourceModule: 'vault'
    },
    // From CivicTestimonyCard (Module #2)
    {
      id: 'testimony_001',
      title: 'Housing for All Initiative',
      content: 'As a mother of three, I witnessed how the city housing program transformed our neighborhood. My children now have a safe place to play and study.',
      type: 'testimony',
      format: 'text',
      theme: 'community',
      contributor: {
        name: 'Maria Santos',
        role: 'citizen',
        did: 'did:civic:testimony_contributor_001',
        location: 'District 4, North Bay'
      },
      lifecycle: 'memorialized',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      zkpHash: 'zkp_testimony_a7f2e9d8c1b4',
      verified: true,
      riskLevel: 'none',
      tags: ['housing', 'family', 'transformation', 'safety'],
      sourceModule: 'testimony'
    },
    {
      id: 'testimony_002',
      title: 'Justice System Reform',
      content: 'I have seen the impact of bias in our courts. As a legal advocate, I testify that reforming our justice system requires community input.',
      type: 'testimony',
      format: 'audio',
      theme: 'justice',
      contributor: {
        name: 'Dr. James Rodriguez',
        role: 'delegate',
        did: 'did:civic:testimony_contributor_002',
        location: 'Central District'
      },
      lifecycle: 'published',
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      zkpHash: 'zkp_testimony_c3e8f1a9b2d7',
      verified: true,
      riskLevel: 'none',
      tags: ['justice', 'reform', 'bias', 'courts'],
      sourceModule: 'testimony'
    },
    {
      id: 'testimony_003',
      title: 'Education Policy Impact',
      content: 'Our new education policy has been life-changing for families. The after-school programs keep children engaged while parents work.',
      type: 'testimony',
      format: 'text',
      theme: 'policy',
      contributor: {
        name: 'Sarah Chen',
        role: 'council_member',
        did: 'did:civic:testimony_contributor_003',
        location: 'East Valley'
      },
      lifecycle: 'reviewed',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      zkpHash: 'zkp_testimony_e1d9f4c2a8b5',
      verified: false,
      riskLevel: 'medium',
      tags: ['education', 'policy', 'family', 'afterschool'],
      sourceModule: 'testimony'
    }
  ]);

  const [filteredEntries, setFilteredEntries] = useState<LegacyEntry[]>(legacyEntries);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedLifecycle, setSelectedLifecycle] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<LegacyEntry | null>(null);
  const [unverifiableRate, setUnverifiableRate] = useState(33.3); // 2 out of 6 unverified
  const [indexStats, setIndexStats] = useState({
    totalEntries: 6,
    verified: 4,
    unverified: 2,
    contributions: 3,
    testimonies: 3,
    riskHigh: 1,
    riskMedium: 1,
    riskLow: 1,
    riskNone: 3
  });

  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize TTS
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // TTS Mount Announcement
      const timer = setTimeout(() => {
        speakText(`Legacy index panel ready. Displaying ${legacyEntries.length} entries across ${getUniqueRoles().length} roles.`);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  // Filter entries based on search and filters
  useEffect(() => {
    let filtered = legacyEntries;

    if (searchQuery.trim()) {
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.contributor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(entry => entry.type === selectedType);
    }

    if (selectedFormat !== 'all') {
      filtered = filtered.filter(entry => entry.format === selectedFormat);
    }

    if (selectedTheme !== 'all') {
      filtered = filtered.filter(entry => entry.theme === selectedTheme);
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(entry => entry.contributor.role === selectedRole);
    }

    if (selectedLifecycle !== 'all') {
      filtered = filtered.filter(entry => entry.lifecycle === selectedLifecycle);
    }

    setFilteredEntries(filtered);
  }, [searchQuery, selectedType, selectedFormat, selectedTheme, selectedRole, selectedLifecycle, legacyEntries]);

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

  const getUniqueRoles = () => {
    return Array.from(new Set(legacyEntries.map(entry => entry.contributor.role)));
  };

  const getLifecycleColor = (lifecycle: LegacyEntry['lifecycle']) => {
    switch (lifecycle) {
      case 'saved':
      case 'submitted': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'verified':
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'indexed':
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived':
      case 'memorialized': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: LegacyEntry['type']) => {
    return type === 'contribution' ? <Archive className="w-3 h-3" /> : <Mic className="w-3 h-3" />;
  };

  const getFormatIcon = (format: LegacyEntry['format']) => {
    switch (format) {
      case 'text': return <FileText className="w-3 h-3" />;
      case 'audio': return <Mic className="w-3 h-3" />;
      case 'image': return <Image className="w-3 h-3" />;
      case 'citation': return <FileText className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getThemeIcon = (theme: LegacyEntry['theme']) => {
    switch (theme) {
      case 'justice': return <User className="w-3 h-3" />;
      case 'policy': return <FileText className="w-3 h-3" />;
      case 'community': return <Users className="w-3 h-3" />;
      case 'family': return <User className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role: LegacyEntry['contributor']['role']) => {
    switch (role) {
      case 'citizen': return 'text-slate-600';
      case 'delegate': return 'text-blue-600';
      case 'council_member': return 'text-green-600';
      case 'mayor': return 'text-purple-600';
      case 'governor': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getRiskColor = (riskLevel: LegacyEntry['riskLevel']) => {
    switch (riskLevel) {
      case 'none': return 'text-green-400';
      case 'low': return 'text-yellow-400';
      case 'medium': return 'text-orange-400';
      case 'high': return 'text-red-400';
      default: return 'text-slate-400';
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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedFormat('all');
    setSelectedTheme('all');
    setSelectedRole('all');
    setSelectedLifecycle('all');
    speakText("Filters cleared. Showing all legacy entries.");
  };

  return (
    <Card className="w-full max-w-sm mx-auto bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Archive className="w-5 h-5 text-blue-400" />
            Legacy Index
          </CardTitle>
          {unverifiableRate > 20 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">Risk</span>
            </div>
          )}
        </div>
        
        {/* Stats Dashboard */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-slate-900 rounded-lg p-2">
            <div className="text-xs text-slate-400">Total</div>
            <div className="text-sm font-medium">{indexStats.totalEntries}</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-2">
            <div className="text-xs text-slate-400">Verified</div>
            <div className="text-sm font-medium text-green-400">
              {indexStats.verified}/{indexStats.totalEntries}
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg p-2">
            <div className="text-xs text-slate-400">Risk</div>
            <div className="text-sm font-medium text-red-400">
              {indexStats.riskHigh + indexStats.riskMedium}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4" role="main" aria-live="polite">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search entries, contributors, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border-slate-600 text-white placeholder-slate-400 pl-10"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="contribution">Contributions</SelectItem>
                <SelectItem value="testimony">Testimonies</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="citation">Citation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Themes</SelectItem>
                <SelectItem value="justice">Justice</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="family">Family</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="citizen">Citizen</SelectItem>
                <SelectItem value="delegate">Delegate</SelectItem>
                <SelectItem value="council_member">Council Member</SelectItem>
                <SelectItem value="mayor">Mayor</SelectItem>
                <SelectItem value="governor">Governor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedLifecycle} onValueChange={setSelectedLifecycle}>
              <SelectTrigger className="bg-slate-900 border-slate-600 text-white flex-1">
                <SelectValue placeholder="Lifecycle" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="saved">Saved</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="indexed">Indexed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="memorialized">Memorialized</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              style={{ minHeight: '40px' }}
            >
              <Filter className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Results Count */}
        <div className="text-sm text-slate-400">
          Showing {filteredEntries.length} of {legacyEntries.length} entries
        </div>

        {/* Legacy Entries List */}
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-900 rounded-lg p-3 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedEntry(selectedEntry?.id === entry.id ? null : entry);
                  }
                }}
                aria-expanded={selectedEntry?.id === entry.id}
                aria-label={`Legacy entry: ${entry.title}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(entry.type)}
                    <div className="text-sm font-medium text-white truncate">{entry.title}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.verified ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <div className={`w-2 h-2 rounded-full ${getRiskColor(entry.riskLevel)}`} />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getLifecycleColor(entry.lifecycle)} text-xs px-2 py-0.5`}>
                    {entry.lifecycle}
                  </Badge>
                  <Badge className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 flex items-center gap-1">
                    {getFormatIcon(entry.format)}
                    {entry.format}
                  </Badge>
                  <Badge className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 flex items-center gap-1">
                    {getThemeIcon(entry.theme)}
                    {entry.theme}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className={getRoleColor(entry.contributor.role)}>
                    {entry.contributor.name} ({entry.contributor.role})
                  </span>
                  <span>•</span>
                  <span>{formatTimeAgo(entry.timestamp)}</span>
                  <span>•</span>
                  <span className="capitalize">{entry.sourceModule}</span>
                </div>
                
                {selectedEntry?.id === entry.id && (
                  <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                    <div className="text-sm text-slate-300 leading-relaxed">
                      {entry.content}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      <span>{entry.contributor.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono">ZKP: {entry.zkpHash}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <User className="w-3 h-3" />
                      <span className="font-mono">DID: {entry.contributor.did}</span>
                    </div>
                    
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs px-1 py-0 bg-slate-800 border-slate-600 text-slate-400"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {entry.riskLevel !== 'none' && (
                      <div className="flex items-center gap-2 text-xs">
                        <AlertTriangle className="w-3 h-3 text-orange-400" />
                        <span className={getRiskColor(entry.riskLevel)}>
                          Risk Level: {entry.riskLevel.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* ZKP Chain Status */}
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-sm font-medium text-slate-300 mb-2">ZKP Verification Chain</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Verified:</span>
              <span className="text-green-400">{indexStats.verified}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Unverified:</span>
              <span className="text-red-400">{indexStats.unverified}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">High Risk:</span>
              <span className="text-red-400">{indexStats.riskHigh}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Integrity:</span>
              <span className={unverifiableRate > 20 ? "text-red-400" : "text-green-400"}>
                {(100 - unverifiableRate).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CivicLegacyIndexCard;