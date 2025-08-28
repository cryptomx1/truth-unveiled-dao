import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Hash, Users, MessageSquare, Share } from 'lucide-react';

interface SocialMetrics {
  platform: string;
  likes: number;
  reposts: number;
  quotes: number;
  delta24h: {
    likes: number;
    reposts: number;
    quotes: number;
  };
  hashtags: {
    tag: string;
    performance: number;
    trend: 'up' | 'down';
  }[];
}

const SocialMomentumCard: React.FC = () => {
  const [socialData, setSocialData] = useState<SocialMetrics[]>([
    {
      platform: 'X',
      likes: 1247,
      reposts: 89,
      quotes: 34,
      delta24h: { likes: +156, reposts: +12, quotes: +7 },
      hashtags: [
        { tag: '#TruthUnveiled', performance: 87, trend: 'up' },
        { tag: '#CivicGenome', performance: 72, trend: 'up' },
        { tag: '#DecentralizedDemocracy', performance: 45, trend: 'down' }
      ]
    },
    {
      platform: 'Threads',
      likes: 892,
      reposts: 67,
      quotes: 23,
      delta24h: { likes: +89, reposts: +8, quotes: +4 },
      hashtags: [
        { tag: '#TruthUnveiled', performance: 76, trend: 'up' },
        { tag: '#CivicGenome', performance: 58, trend: 'up' },
        { tag: '#ZKPrivacy', performance: 41, trend: 'up' }
      ]
    },
    {
      platform: 'LinkedIn',
      likes: 543,
      reposts: 45,
      quotes: 18,
      delta24h: { likes: +67, reposts: +6, quotes: +3 },
      hashtags: [
        { tag: '#CivicTech', performance: 82, trend: 'up' },
        { tag: '#TruthUnveiled', performance: 69, trend: 'up' },
        { tag: '#PublicSector', performance: 38, trend: 'down' }
      ]
    }
  ]);

  const [selectedPlatform, setSelectedPlatform] = useState('X');

  useEffect(() => {
    // Live update simulation every 30 seconds
    const interval = setInterval(() => {
      setSocialData(prev => prev.map(platform => {
        const likesIncrease = Math.floor(Math.random() * 25) + 5;
        const repostsIncrease = Math.floor(Math.random() * 8) + 1;
        const quotesIncrease = Math.floor(Math.random() * 4) + 1;
        
        console.log(`📡 Social momentum updated — ${platform.platform}: +${likesIncrease}/+${repostsIncrease}`);
        
        return {
          ...platform,
          likes: platform.likes + likesIncrease,
          reposts: platform.reposts + repostsIncrease,
          quotes: platform.quotes + quotesIncrease,
          delta24h: {
            likes: platform.delta24h.likes + likesIncrease,
            reposts: platform.delta24h.reposts + repostsIncrease,
            quotes: platform.delta24h.quotes + quotesIncrease
          },
          hashtags: platform.hashtags.map(hashtag => ({
            ...hashtag,
            performance: Math.min(100, Math.max(0, hashtag.performance + (Math.random() * 6 - 3)))
          }))
        };
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const currentPlatformData = socialData.find(p => p.platform === selectedPlatform);

  const MetricCard = ({ 
    icon: Icon, 
    label, 
    value, 
    delta, 
    color = "text-blue-600" 
  }: { 
    icon: any, 
    label: string, 
    value: number, 
    delta: number, 
    color?: string 
  }) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          {delta > 0 ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={delta > 0 ? "text-green-600" : "text-red-600"}>
            {delta > 0 ? '+' : ''}{delta}
          </span>
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value.toLocaleString()}
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Share className="h-5 w-5 text-blue-600" />
          Social Momentum Tracker
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Real-time social propagation metrics across platforms
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {socialData.map((platform) => (
              <TabsTrigger 
                key={platform.platform} 
                value={platform.platform}
                className="text-slate-700 dark:text-slate-300"
              >
                {platform.platform}
              </TabsTrigger>
            ))}
          </TabsList>

          {socialData.map((platform) => (
            <TabsContent key={platform.platform} value={platform.platform} className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  icon={Users}
                  label="Likes"
                  value={platform.likes}
                  delta={platform.delta24h.likes}
                  color="text-red-500"
                />
                <MetricCard
                  icon={Share}
                  label="Reposts"
                  value={platform.reposts}
                  delta={platform.delta24h.reposts}
                  color="text-green-500"
                />
                <MetricCard
                  icon={MessageSquare}
                  label="Quote Posts"
                  value={platform.quotes}
                  delta={platform.delta24h.quotes}
                  color="text-blue-500"
                />
              </div>

              {/* Hashtag Performance */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Hashtag Performance
                  </h3>
                </div>
                
                <div className="space-y-3" role="region" aria-label="Hashtag performance metrics">
                  {platform.hashtags.map((hashtag, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {hashtag.tag}
                          </Badge>
                          {hashtag.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-green-500" aria-label="Trending up" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" aria-label="Trending down" />
                          )}
                        </div>
                        <span 
                          className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          aria-label={`Performance score: ${Math.round(hashtag.performance)} percent`}
                        >
                          {Math.round(hashtag.performance)}%
                        </span>
                      </div>
                      <Progress 
                        value={hashtag.performance} 
                        className="h-2"
                        aria-label={`${hashtag.tag} performance: ${Math.round(hashtag.performance)}%`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">24h Growth</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      +{((platform.delta24h.likes + platform.delta24h.reposts + platform.delta24h.quotes) / 
                        (platform.likes + platform.reposts + platform.quotes) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Engagement</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {(platform.likes + platform.reposts + platform.quotes).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Live Status Indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates every 30 seconds</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialMomentumCard;