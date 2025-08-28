import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ExternalLink, Download, Lock, BookOpen, Building, GraduationCap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CivicResource {
  id: string;
  title: string;
  description: string;
  url: string;
  source: 'government' | 'educational' | 'civic_org';
  category: string;
}

interface CivicResourceCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

const MOCK_CIVIC_RESOURCES: CivicResource[] = [
  {
    id: 'res1',
    title: 'Voter Registration Guide',
    description: 'Official guide to registering to vote, requirements, and deadlines.',
    url: 'https://www.vote.gov/register/state/',
    source: 'government',
    category: 'Voting Rights'
  },
  {
    id: 'res2',
    title: 'Understanding Democracy',
    description: 'Educational resource on democratic principles and civic engagement.',
    url: 'https://www.civics101.org/democracy-basics',
    source: 'educational',
    category: 'Civic Education'
  },
  {
    id: 'res3',
    title: 'Local Government Structure',
    description: 'Learn how local government works and how to get involved.',
    url: 'https://www.usa.gov/local-government',
    source: 'government',
    category: 'Government'
  },
  {
    id: 'res4',
    title: 'Citizen Participation Toolkit',
    description: 'Tools and strategies for effective civic engagement.',
    url: 'https://www.civicengagement.edu/toolkit',
    source: 'educational',
    category: 'Civic Action'
  },
  {
    id: 'res5',
    title: 'Constitutional Rights Overview',
    description: 'Comprehensive guide to your constitutional rights and freedoms.',
    url: 'https://www.constitution.org/rights-guide',
    source: 'civic_org',
    category: 'Rights & Freedoms'
  }
];

const getSourceIcon = (source: CivicResource['source']) => {
  switch (source) {
    case 'government':
      return <Building className="w-4 h-4" />;
    case 'educational':
      return <GraduationCap className="w-4 h-4" />;
    case 'civic_org':
      return <BookOpen className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

const getSourceColor = (source: CivicResource['source']) => {
  switch (source) {
    case 'government':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'educational':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'civic_org':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

const getSourceLabel = (source: CivicResource['source']) => {
  switch (source) {
    case 'government':
      return 'Government';
    case 'educational':
      return 'Educational';
    case 'civic_org':
      return 'Civic Org';
    default:
      return 'Resource';
  }
};

export const CivicResourceCard: React.FC<CivicResourceCardProps> = ({ className }) => {
  const [hoveredResource, setHoveredResource] = useState<string | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`CivicResourceCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`CivicResourceCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play motivational message on mount
          const utterance = new SpeechSynthesisUtterance("Explore civic resources curated for you.");
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          
          setTtsStatus(prev => ({ ...prev, isPlaying: true }));
          speechSynthesis.speak(utterance);
          
          utterance.onend = () => {
            setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          };
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  const handleResourceHover = (resourceId: string | null) => {
    const hoverStart = performance.now();
    setHoveredResource(resourceId);
    
    const hoverTime = performance.now() - hoverStart;
    if (hoverTime > 50) {
      console.warn(`Hover response time: ${hoverTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleResourceClick = (url: string, title: string) => {
    // In a real implementation, this would open the external link
    // For demo purposes, we'll just log the action
    console.log(`Would open external link: ${url} for "${title}"`);
  };

  const handlePDFDownload = () => {
    // Mock PDF download simulation
    console.log('Mock PDF download initiated');
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-800 border-slate-700/50',
        'dao-card-gradient',
        className
      )}
      role="region"
      aria-label="Civic Resources Library"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-400" />
            Civic Resources
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-slate-700/50 text-slate-400 border-slate-600">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Resource Tracking in Deck #6</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Curated resources for civic engagement
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Resource Links */}
        <div className="space-y-2">
          {MOCK_CIVIC_RESOURCES.slice(0, 3).map((resource) => (
            <div
              key={resource.id}
              className={cn(
                'bg-slate-700/30 rounded-lg border border-slate-600/50 p-3',
                'transition-all duration-200 hover:bg-slate-600/40 hover:border-slate-500',
                hoveredResource === resource.id && 'bg-slate-600/40 border-slate-500'
              )}
              onMouseEnter={() => handleResourceHover(resource.id)}
              onMouseLeave={() => handleResourceHover(null)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs',
                      getSourceColor(resource.source)
                    )}
                  >
                    {getSourceIcon(resource.source)}
                    <span className="ml-1">{getSourceLabel(resource.source)}</span>
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handleResourceClick(resource.url, resource.title)}
                    className={cn(
                      'w-full text-left group min-h-[48px] p-2 -m-2 rounded',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                      'hover:bg-slate-600/20 transition-colors duration-200'
                    )}
                    aria-label={`Open ${resource.title} - ${resource.description}`}
                    role="link"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-slate-100 group-hover:text-blue-300 transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {resource.description}
                        </p>
                        <div className="text-xs text-slate-500 mt-1">
                          {resource.category}
                        </div>
                      </div>
                      <ExternalLink 
                        className={cn(
                          'w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5',
                          'group-hover:text-blue-400 transition-colors'
                        )} 
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PDF Download Section */}
        <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-100 mb-1">
                Civic Engagement Handbook
              </h3>
              <p className="text-xs text-slate-400">
                Complete guide to democratic participation
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePDFDownload}
              className={cn(
                'bg-slate-600/50 border-slate-500 text-slate-200',
                'hover:bg-slate-500/50 hover:border-slate-400',
                'min-h-[48px] px-3'
              )}
              aria-label="Download Civic Engagement Handbook PDF"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="space-y-2">
          {MOCK_CIVIC_RESOURCES.slice(3).map((resource) => (
            <div
              key={resource.id}
              className={cn(
                'bg-slate-700/30 rounded-lg border border-slate-600/50 p-3',
                'transition-all duration-200 hover:bg-slate-600/40 hover:border-slate-500',
                hoveredResource === resource.id && 'bg-slate-600/40 border-slate-500'
              )}
              onMouseEnter={() => handleResourceHover(resource.id)}
              onMouseLeave={() => handleResourceHover(null)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs',
                      getSourceColor(resource.source)
                    )}
                  >
                    {getSourceIcon(resource.source)}
                    <span className="ml-1">{getSourceLabel(resource.source)}</span>
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handleResourceClick(resource.url, resource.title)}
                    className={cn(
                      'w-full text-left group min-h-[48px] p-2 -m-2 rounded',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                      'hover:bg-slate-600/20 transition-colors duration-200'
                    )}
                    aria-label={`Open ${resource.title} - ${resource.description}`}
                    role="link"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-slate-100 group-hover:text-blue-300 transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {resource.description}
                        </p>
                        <div className="text-xs text-slate-500 mt-1">
                          {resource.category}
                        </div>
                      </div>
                      <ExternalLink 
                        className={cn(
                          'w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5',
                          'group-hover:text-blue-400 transition-colors'
                        )} 
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resource Count */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            {MOCK_CIVIC_RESOURCES.length} trusted resources available
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CivicResourceCard;
