import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Award, Unlock, ArrowRight } from 'lucide-react';
import { useZKPFeedbackNode } from './ZKPFeedbackNode';

interface ImpactEvent {
  id: string;
  type: 'tier_upgrade' | 'mission_unlock' | 'streak_bonus' | 'feature_access';
  description: string;
  triggeredBy: {
    feedbackCount: number;
    trustThreshold: number;
    timeframe: string;
  };
  timestamp: Date;
  benefitDescription: string;
}

interface FeedbackImpactAnalyzerCardProps {
  userId?: string;
}

export const FeedbackImpactAnalyzerCard: React.FC<FeedbackImpactAnalyzerCardProps> = ({
  userId = 'current_user'
}) => {
  const [impactEvents, setImpactEvents] = useState<ImpactEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ImpactEvent | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { getVaultStats } = useZKPFeedbackNode();

  // Nuclear TTS override system
  useEffect(() => {
    const originalSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
    const originalCancel = window.speechSynthesis.cancel.bind(window.speechSynthesis);
    
    window.speechSynthesis.speak = () => {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
    };
    window.speechSynthesis.cancel = originalCancel;
    console.log('TTS override applied');
    
    return () => {
      window.speechSynthesis.speak = originalSpeak;
      window.speechSynthesis.cancel = originalCancel;
    };
  }, []);

  // Generate mock impact events based on feedback data
  useEffect(() => {
    const generateImpactEvents = () => {
      const stats = getVaultStats();
      const events: ImpactEvent[] = [];

      // Tier upgrade based on trust feedback
      if (stats.trustVotes >= 3) {
        events.push({
          id: 'tier_upgrade_1',
          type: 'tier_upgrade',
          description: 'Advanced to Trusted Civic Participant',
          triggeredBy: {
            feedbackCount: stats.trustVotes,
            trustThreshold: 75,
            timeframe: 'last 7 days'
          },
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          benefitDescription: 'Unlocked advanced governance features and proposal submission rights'
        });
      }

      // Mission unlock based on engagement
      if (stats.totalEntries >= 2) {
        events.push({
          id: 'mission_unlock_1',
          type: 'mission_unlock',
          description: 'Unlocked Privacy Protection Missions',
          triggeredBy: {
            feedbackCount: stats.totalEntries,
            trustThreshold: 60,
            timeframe: 'last 14 days'
          },
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          benefitDescription: 'Access to ZKP-enhanced privacy tools and anonymous communication channels'
        });
      }

      // Streak bonus based on consistent feedback
      if (stats.trustRatio >= 70) {
        events.push({
          id: 'streak_bonus_1',
          type: 'streak_bonus',
          description: 'Civic Engagement Streak Multiplier Activated',
          triggeredBy: {
            feedbackCount: stats.trustVotes,
            trustThreshold: 70,
            timeframe: 'last 30 days'
          },
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          benefitDescription: '1.5x multiplier on all civic participation rewards and truth points'
        });
      }

      // Feature access based on community trust
      if (stats.totalEntries >= 5) {
        events.push({
          id: 'feature_access_1',
          type: 'feature_access',
          description: 'Truth Trace Export Access Granted',
          triggeredBy: {
            feedbackCount: stats.totalEntries,
            trustThreshold: 80,
            timeframe: 'last 21 days'
          },
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          benefitDescription: 'Export and audit complete civic interaction history with ZKP verification'
        });
      }

      return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    setImpactEvents(generateImpactEvents());
  }, [getVaultStats]);

  const analyzeImpact = async (event: ImpactEvent) => {
    setIsAnalyzing(true);
    setSelectedEvent(event);

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // ARIA announcement
    const announcement = `This trust signal helped unlock ${event.description}. ${event.benefitDescription}`;
    console.log(`📣 ARIA: ${announcement}`);

    setIsAnalyzing(false);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'tier_upgrade':
        return <Award className="w-4 h-4 text-yellow-400" />;
      case 'mission_unlock':
        return <Unlock className="w-4 h-4 text-green-400" />;
      case 'streak_bonus':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'feature_access':
        return <ArrowRight className="w-4 h-4 text-purple-400" />;
      default:
        return <TrendingUp className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'tier_upgrade':
        return 'border-yellow-500/30 bg-yellow-600/10';
      case 'mission_unlock':
        return 'border-green-500/30 bg-green-600/10';
      case 'streak_bonus':
        return 'border-blue-500/30 bg-blue-600/10';
      case 'feature_access':
        return 'border-purple-500/30 bg-purple-600/10';
      default:
        return 'border-slate-500/30 bg-slate-600/10';
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <div>
          <h3 className="text-base font-semibold text-white">Feedback Impact Analyzer</h3>
          <p className="text-xs text-slate-400">How trust signals unlock opportunities</p>
        </div>
      </div>

      {/* Impact Overview */}
      <div className="mb-4 p-3 bg-slate-700/20 rounded-lg">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-lg font-semibold text-green-400">
              {impactEvents.filter(e => e.type === 'tier_upgrade' || e.type === 'mission_unlock').length}
            </div>
            <div className="text-xs text-slate-400">Unlocks</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-400">
              {impactEvents.filter(e => e.type === 'streak_bonus' || e.type === 'feature_access').length}
            </div>
            <div className="text-xs text-slate-400">Bonuses</div>
          </div>
        </div>
      </div>

      {/* Impact Events */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {impactEvents.length === 0 ? (
          <div className="text-center p-4 text-slate-400">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Continue providing feedback to see impact analysis</div>
            <div className="text-xs mt-1">Trust signals unlock new civic opportunities</div>
          </div>
        ) : (
          impactEvents.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:border-opacity-50 ${getEventColor(event.type)} ${
                selectedEvent?.id === event.id ? 'ring-2 ring-blue-500/50' : ''
              }`}
              onClick={() => analyzeImpact(event)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white mb-1">
                    {event.description}
                  </div>
                  <div className="text-xs text-slate-400 mb-2">
                    Triggered by {event.triggeredBy.feedbackCount} votes reaching {event.triggeredBy.trustThreshold}% trust
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatTimestamp(event.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Event Analysis */}
      {selectedEvent && (
        <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-blue-300">Impact Analysis</span>
            {isAnalyzing && (
              <div className="animate-spin w-3 h-3 border border-blue-400 border-t-transparent rounded-full"></div>
            )}
          </div>
          
          {!isAnalyzing && (
            <div className="text-sm text-slate-300">
              {selectedEvent.benefitDescription}
            </div>
          )}
          
          {isAnalyzing && (
            <div className="text-sm text-slate-400">
              Analyzing causal relationship between feedback and outcome...
            </div>
          )}
        </div>
      )}

      {/* ARIA Live Region */}
      <div 
        aria-live="polite" 
        aria-label="Impact analysis announcements"
        className="sr-only"
      >
        {selectedEvent && !isAnalyzing && 
          `This trust signal helped unlock ${selectedEvent.description}. ${selectedEvent.benefitDescription}`
        }
      </div>

      {/* Instructions */}
      <div className="mt-4 p-2 bg-slate-700/20 rounded text-xs text-slate-400">
        <div className="mb-1">• Trust feedback directly influences civic tier advancement</div>
        <div>• Click events above to hear detailed impact explanations</div>
      </div>
    </div>
  );
};

export default FeedbackImpactAnalyzerCard;