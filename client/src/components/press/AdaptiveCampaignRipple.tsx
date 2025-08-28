import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Target,
  Zap,
  Globe
} from "lucide-react";

interface MomentumVector {
  platform: string;
  engagement: number;
  growth: number;
  reach: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface CivicMessage {
  id: string;
  content: string;
  targetDeck: string;
  zipCode: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedReach: number;
}

interface SequenceStep {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed';
  messages: CivicMessage[];
  targetReach: number;
  actualReach: number;
}

export function AdaptiveCampaignRipple() {
  const [momentumVectors, setMomentumVectors] = useState<MomentumVector[]>([]);
  const [activeSequence, setActiveSequence] = useState<SequenceStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalReach, setTotalReach] = useState(0);

  useEffect(() => {
    // Initialize momentum vectors from /press/wave metrics
    const initializeMomentumVectors = () => {
      setMomentumVectors([
        {
          platform: "X (Twitter)",
          engagement: 78,
          growth: 12,
          reach: 24500,
          sentiment: 'positive'
        },
        {
          platform: "Threads",
          engagement: 65,
          growth: 18,
          reach: 18200,
          sentiment: 'positive'
        },
        {
          platform: "LinkedIn",
          engagement: 82,
          growth: 8,
          reach: 31000,
          sentiment: 'positive'
        }
      ]);
    };

    initializeMomentumVectors();
    
    // Auto-refresh momentum vectors every 30 seconds
    const interval = setInterval(() => {
      setMomentumVectors(prev => prev.map(vector => ({
        ...vector,
        engagement: Math.max(0, Math.min(100, vector.engagement + (Math.random() * 6 - 3))),
        growth: Math.max(-5, Math.min(25, vector.growth + (Math.random() * 4 - 2))),
        reach: Math.max(0, vector.reach + Math.floor(Math.random() * 500 - 100))
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const generateAdaptiveSequence = async () => {
    setIsGenerating(true);
    
    // Simulate LLM-synthesized civic messaging generation
    const civicMessages: CivicMessage[] = [
      {
        id: "msg_001",
        content: "Your voice matters in local governance. Join Truth Unveiled to make democracy more transparent and accessible.",
        targetDeck: "governance",
        zipCode: "90210",
        urgency: 'medium',
        estimatedReach: 2500
      },
      {
        id: "msg_002", 
        content: "Discover how your Truth Points can drive real civic change in your community.",
        targetDeck: "finance",
        zipCode: "10001",
        urgency: 'high',
        estimatedReach: 3200
      },
      {
        id: "msg_003",
        content: "Experience privacy-first voting with zero-knowledge proofs. Your ballot, your privacy.",
        targetDeck: "privacy",
        zipCode: "60601",
        urgency: 'medium',
        estimatedReach: 1800
      }
    ];

    const sequence: SequenceStep[] = [
      {
        id: "step_001",
        title: "Initial Momentum Capture",
        status: 'active',
        messages: civicMessages.slice(0, 1),
        targetReach: 2500,
        actualReach: 0
      },
      {
        id: "step_002",
        title: "High-Engagement Amplification",
        status: 'pending',
        messages: civicMessages.slice(1, 2),
        targetReach: 3200,
        actualReach: 0
      },
      {
        id: "step_003",
        title: "Privacy-Focused Expansion",
        status: 'pending',
        messages: civicMessages.slice(2, 3),
        targetReach: 1800,
        actualReach: 0
      }
    ];

    setActiveSequence(sequence);
    setTotalReach(sequence.reduce((sum, step) => sum + step.targetReach, 0));
    
    // Simulate progressive completion
    setTimeout(() => {
      setActiveSequence(prev => prev.map((step, index) => {
        if (index === 0) {
          return { ...step, status: 'completed', actualReach: step.targetReach + Math.floor(Math.random() * 500) };
        }
        if (index === 1) {
          return { ...step, status: 'active' };
        }
        return step;
      }));
    }, 3000);

    setTimeout(() => {
      setActiveSequence(prev => prev.map((step, index) => {
        if (index === 1) {
          return { ...step, status: 'completed', actualReach: step.targetReach + Math.floor(Math.random() * 800) };
        }
        if (index === 2) {
          return { ...step, status: 'active' };
        }
        return step;
      }));
    }, 6000);

    setTimeout(() => {
      setActiveSequence(prev => prev.map(step => ({
        ...step,
        status: 'completed' as const,
        actualReach: step.actualReach || step.targetReach + Math.floor(Math.random() * 300)
      })));
      setIsGenerating(false);
    }, 9000);

    console.log("🔁 Adaptive campaign ripple sequence initiated");
  };

  const getMomentumColor = (growth: number) => {
    if (growth > 10) return "text-green-600";
    if (growth > 0) return "text-blue-600";
    return "text-orange-600";
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return "✅";
      case 'active':
        return "🔄";
      default:
        return "⏳";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Phase PRESS-REPLAY Step 4: Adaptive Campaign Ripple
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Momentum Vectors */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Momentum Vectors
              </h3>
              <div className="space-y-3">
                {momentumVectors.map((vector, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{vector.platform}</span>
                      <Badge variant={vector.sentiment === 'positive' ? 'default' : 'secondary'}>
                        {vector.sentiment}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Engagement</div>
                        <div className="font-semibold">{Math.round(vector.engagement)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Growth</div>
                        <div className={`font-semibold ${getMomentumColor(vector.growth)}`}>
                          +{Math.round(vector.growth)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Reach</div>
                        <div className="font-semibold">{vector.reach.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sequence Generation */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Ripple Sequence
              </h3>
              
              {activeSequence.length === 0 ? (
                <div className="text-center py-8">
                  <Button 
                    onClick={generateAdaptiveSequence}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? "Generating Sequence..." : "Generate Adaptive Sequence"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeSequence.map((step, index) => (
                    <div 
                      key={step.id} 
                      className={`p-3 border rounded-lg ${
                        step.status === 'active' ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">
                          {getStepStatusIcon(step.status)} {step.title}
                        </span>
                        <Badge variant="outline">
                          {step.status}
                        </Badge>
                      </div>
                      
                      {step.messages.map((message) => (
                        <div key={message.id} className="text-xs text-gray-600 mb-2 p-2 bg-gray-50 rounded">
                          <div className="mb-1">{message.content}</div>
                          <div className="flex gap-4 text-xs">
                            <span>Deck: {message.targetDeck}</span>
                            <span>ZIP: {message.zipCode}</span>
                            <span>Urgency: {message.urgency}</span>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-between text-sm">
                        <span>Target: {step.targetReach.toLocaleString()}</span>
                        {step.actualReach > 0 && (
                          <span className="text-green-600">
                            Actual: {step.actualReach.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {step.status !== 'pending' && (
                        <Progress 
                          value={step.actualReach > 0 ? (step.actualReach / step.targetReach) * 100 : 0} 
                          className="mt-2"
                        />
                      )}
                    </div>
                  ))}
                  
                  {totalReach > 0 && (
                    <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 text-purple-800">
                        <Globe className="h-4 w-4" />
                        <span className="font-semibold">
                          Total Campaign Reach: {totalReach.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}