import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Vote, Activity } from 'lucide-react';

interface InfluenceDynamicProps {
  userId?: string;
  onInfluenceUpdate?: (influence: number) => void;
}

interface InfluenceMetrics {
  totalInfluence: number;
  participationRate: number;
  communityImpact: number;
  governanceWeight: number;
  recentActivity: Array<{
    type: string;
    impact: number;
    timestamp: Date;
  }>;
}

export const InfluenceDynamic: React.FC<InfluenceDynamicProps> = ({
  userId = 'current-user',
  onInfluenceUpdate
}) => {
  const [metrics, setMetrics] = useState<InfluenceMetrics>({
    totalInfluence: 0,
    participationRate: 0,
    communityImpact: 0,
    governanceWeight: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ARIA announcement for component load
    const ariaRegion = document.createElement('div');
    ariaRegion.setAttribute('aria-live', 'polite');
    ariaRegion.setAttribute('aria-atomic', 'true');
    ariaRegion.style.position = 'absolute';
    ariaRegion.style.left = '-9999px';
    ariaRegion.textContent = 'Dynamic influence tracker loaded';
    document.body.appendChild(ariaRegion);
    
    setTimeout(() => document.body.removeChild(ariaRegion), 1000);

    // Simulate loading and calculate influence metrics
    const loadMetrics = async () => {
      setIsLoading(true);
      
      // Mock influence calculation based on civic participation
      const mockMetrics: InfluenceMetrics = {
        totalInfluence: Math.floor(Math.random() * 850) + 150, // 150-1000 range
        participationRate: Math.floor(Math.random() * 40) + 60, // 60-100% range
        communityImpact: Math.floor(Math.random() * 300) + 200, // 200-500 range
        governanceWeight: Math.floor(Math.random() * 25) + 15, // 15-40 range
        recentActivity: [
          {
            type: 'Governance Vote',
            impact: 45,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            type: 'Community Proposal',
            impact: 78,
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
          },
          {
            type: 'Civic Feedback',
            impact: 32,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ]
      };

      setMetrics(mockMetrics);
      onInfluenceUpdate?.(mockMetrics.totalInfluence);
      setIsLoading(false);
      
      console.log('📊 Dynamic influence metrics calculated:', mockMetrics.totalInfluence);
    };

    loadMetrics();
  }, [userId, onInfluenceUpdate]);

  const handleRecalculate = () => {
    setIsLoading(true);
    // Trigger recalculation
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        totalInfluence: prev.totalInfluence + Math.floor(Math.random() * 50) - 25,
        participationRate: Math.min(100, prev.participationRate + Math.floor(Math.random() * 10) - 5)
      }));
      setIsLoading(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            Dynamic Influence Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          Dynamic Influence Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Influence Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Influence</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metrics.totalInfluence}
            </span>
          </div>
          <Progress value={Math.min(100, (metrics.totalInfluence / 1000) * 100)} className="h-2" />
        </div>

        {/* Participation Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">Community Impact</span>
            </div>
            <div className="text-xl font-semibold">{metrics.communityImpact}</div>
            <Progress value={Math.min(100, (metrics.communityImpact / 500) * 100)} className="h-1" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Vote className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium">Governance Weight</span>
            </div>
            <div className="text-xl font-semibold">{metrics.governanceWeight}%</div>
            <Progress value={metrics.governanceWeight} className="h-1" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <h4 className="font-medium">Recent Activity</h4>
          <div className="space-y-2">
            {metrics.recentActivity.map((activity, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                  <div className="text-sm font-medium">{activity.type}</div>
                  <div className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  +{activity.impact}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleRecalculate}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Recalculate Influence
          </Button>
        </div>

        {/* Participation Rate Display */}
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Current Participation Rate
          </div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {metrics.participationRate}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluenceDynamic;