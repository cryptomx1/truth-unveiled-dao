import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle, MinusCircle, Users, Clock } from 'lucide-react';

interface DAOBadgeholder {
  id: string;
  alias: string;
  vote: 'YES' | 'NO' | 'ABSTAIN';
  timestamp: string;
  avatar: string;
}

interface DAOReactionData {
  totalVotes: number;
  yesCount: number;
  noCount: number;
  abstainCount: number;
  lastUpdated: string;
  topBadgeholders: DAOBadgeholder[];
}

const DAOReactionTallyCard: React.FC = () => {
  const [daoData, setDaoData] = useState<DAOReactionData>({
    totalVotes: 47,
    yesCount: 32,
    noCount: 8,
    abstainCount: 7,
    lastUpdated: new Date().toISOString(),
    topBadgeholders: [
      { id: '1', alias: 'GENESIS-001', vote: 'YES', timestamp: '2h ago', avatar: 'G1' },
      { id: '2', alias: 'CIVIC-047', vote: 'YES', timestamp: '3h ago', avatar: 'C4' },
      { id: '3', alias: 'TRUTH-129', vote: 'NO', timestamp: '4h ago', avatar: 'T1' },
      { id: '4', alias: 'WISDOM-083', vote: 'YES', timestamp: '5h ago', avatar: 'W8' },
      { id: '5', alias: 'JUSTICE-156', vote: 'ABSTAIN', timestamp: '6h ago', avatar: 'J1' }
    ]
  });

  const [lastAnnouncedPercent, setLastAnnouncedPercent] = useState(0);

  useEffect(() => {
    // ARIA narration for accessibility
    const yesPercent = Math.round((daoData.yesCount / daoData.totalVotes) * 100);
    
    if (Math.abs(yesPercent - lastAnnouncedPercent) >= 5) {
      const ariaRegion = document.createElement('div');
      ariaRegion.setAttribute('aria-live', 'polite');
      ariaRegion.setAttribute('aria-atomic', 'true');
      ariaRegion.style.position = 'absolute';
      ariaRegion.style.left = '-9999px';
      ariaRegion.textContent = `DAO sentiment updated: ${yesPercent} percent YES`;
      document.body.appendChild(ariaRegion);
      
      setTimeout(() => document.body.removeChild(ariaRegion), 1000);
      setLastAnnouncedPercent(yesPercent);
    }

    // Live update simulation every 45 seconds
    const interval = setInterval(() => {
      setDaoData(prev => {
        const voteChange = Math.random() < 0.7 ? 'YES' : (Math.random() < 0.5 ? 'NO' : 'ABSTAIN');
        let newYes = prev.yesCount;
        let newNo = prev.noCount;
        let newAbstain = prev.abstainCount;
        
        switch (voteChange) {
          case 'YES':
            newYes += 1;
            break;
          case 'NO':
            newNo += 1;
            break;
          case 'ABSTAIN':
            newAbstain += 1;
            break;
        }
        
        const newTotal = newYes + newNo + newAbstain;
        console.log(`📊 DAO reaction updated: ${newYes}/${newTotal} YES votes (${Math.round((newYes/newTotal)*100)}%)`);
        
        return {
          ...prev,
          totalVotes: newTotal,
          yesCount: newYes,
          noCount: newNo,
          abstainCount: newAbstain,
          lastUpdated: new Date().toISOString()
        };
      });
    }, 45000);

    return () => clearInterval(interval);
  }, [daoData.yesCount, daoData.totalVotes, lastAnnouncedPercent]);

  const yesPercent = (daoData.yesCount / daoData.totalVotes) * 100;
  const noPercent = (daoData.noCount / daoData.totalVotes) * 100;
  const abstainPercent = (daoData.abstainCount / daoData.totalVotes) * 100;

  const getVoteIcon = (vote: string) => {
    switch (vote) {
      case 'YES':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'NO':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'ABSTAIN':
        return <MinusCircle className="h-3 w-3 text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Card className="w-full max-w-4xl bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Users className="h-5 w-5 text-purple-600" />
          DAO Reaction Tally
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Genesis badgeholder sentiment toward press release distribution
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Vote Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">Support</span>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-300">
                {Math.round(yesPercent)}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {daoData.yesCount}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-700 dark:text-red-300">Oppose</span>
              </div>
              <Badge variant="outline" className="text-red-600 border-red-300">
                {Math.round(noPercent)}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {daoData.noCount}
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MinusCircle className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-yellow-700 dark:text-yellow-300">Abstain</span>
              </div>
              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                {Math.round(abstainPercent)}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-yellow-600 mt-2">
              {daoData.abstainCount}
            </p>
          </div>
        </div>

        {/* Horizontal Progress Bars */}
        <div className="space-y-4" role="region" aria-label="DAO vote breakdown">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Support</span>
              <span className="font-medium text-green-600">
                {daoData.yesCount} ({Math.round(yesPercent)}%)
              </span>
            </div>
            <Progress value={yesPercent} className="h-3" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Opposition</span>
              <span className="font-medium text-red-600">
                {daoData.noCount} ({Math.round(noPercent)}%)
              </span>
            </div>
            <Progress value={noPercent} className="h-3 bg-red-100" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Abstained</span>
              <span className="font-medium text-yellow-600">
                {daoData.abstainCount} ({Math.round(abstainPercent)}%)
              </span>
            </div>
            <Progress value={abstainPercent} className="h-3 bg-yellow-100" />
          </div>
        </div>

        {/* Top Badgeholders */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            Recent Genesis Badgeholder Activity
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {daoData.topBadgeholders.map((badgeholder) => (
              <div
                key={badgeholder.id}
                className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                    {badgeholder.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {badgeholder.alias}
                    </p>
                    {getVoteIcon(badgeholder.vote)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {badgeholder.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Total DAO Participation
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {daoData.totalVotes} votes
              </p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Last Updated
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {formatTimestamp(daoData.lastUpdated)}
              </p>
            </div>
          </div>
        </div>

        {/* Consensus Status */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <div className={`w-2 h-2 rounded-full ${yesPercent > 66 ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {yesPercent > 66 ? 'Strong Consensus' : yesPercent > 50 ? 'Majority Support' : 'Mixed Sentiment'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DAOReactionTallyCard;