import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, BarChart3, CheckCircle2, AlertTriangle, Hash, Target, Sparkles, Clock } from "lucide-react";

interface ImpactMetric {
  id: string;
  category: string;
  name: string;
  currentValue: number;
  baseline: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
  confidence: number;
}

interface ImpactEvaluation {
  id: string;
  timestamp: string;
  sourceAllocation: string;
  evaluatedMetrics: string[];
  overallImpact: number;
  deviationRate: number;
  zkpHash: string;
  evaluatedBy: string;
  status: "validated" | "flagged" | "pending";
}

interface AllocationSource {
  id: string;
  name: string;
  category: string;
  allocation: number;
  lastEvaluation: string;
}

const mockMetrics: ImpactMetric[] = [
  {
    id: "carbon_reduction",
    category: "Environment",
    name: "Carbon Emissions Reduction",
    currentValue: 18.2,
    baseline: 15.0,
    target: 25.0,
    unit: "%",
    trend: "up",
    lastUpdated: "2025-07-16T20:15:00Z",
    confidence: 87.3
  },
  {
    id: "housing_units",
    category: "Housing",
    name: "Affordable Housing Units",
    currentValue: 142,
    baseline: 120,
    target: 180,
    unit: "units",
    trend: "up",
    lastUpdated: "2025-07-16T19:45:00Z",
    confidence: 92.1
  },
  {
    id: "food_access",
    category: "Food Security",
    name: "Food Access Index",
    currentValue: 78.5,
    baseline: 75.0,
    target: 85.0,
    unit: "score",
    trend: "up",
    lastUpdated: "2025-07-16T20:00:00Z",
    confidence: 84.7
  },
  {
    id: "health_coverage",
    category: "Health",
    name: "Healthcare Coverage",
    currentValue: 91.3,
    baseline: 88.0,
    target: 95.0,
    unit: "%",
    trend: "up",
    lastUpdated: "2025-07-16T19:30:00Z",
    confidence: 96.2
  },
  {
    id: "education_enrollment",
    category: "Education",
    name: "Civic Education Enrollment",
    currentValue: 67.8,
    baseline: 65.0,
    target: 80.0,
    unit: "%",
    trend: "up",
    lastUpdated: "2025-07-16T18:45:00Z",
    confidence: 89.4
  }
];

const mockAllocations: AllocationSource[] = [
  {
    id: "energy_allocation",
    name: "Renewable Energy",
    category: "Environment",
    allocation: 25,
    lastEvaluation: "2025-07-16T19:45:00Z"
  },
  {
    id: "housing_allocation",
    name: "Affordable Housing",
    category: "Housing",
    allocation: 20,
    lastEvaluation: "2025-07-16T19:30:00Z"
  },
  {
    id: "food_allocation",
    name: "Food Security",
    category: "Food Security",
    allocation: 15,
    lastEvaluation: "2025-07-16T19:15:00Z"
  },
  {
    id: "health_allocation",
    name: "Public Health",
    category: "Health",
    allocation: 25,
    lastEvaluation: "2025-07-16T19:00:00Z"
  },
  {
    id: "education_allocation",
    name: "Civic Education",
    category: "Education",
    allocation: 15,
    lastEvaluation: "2025-07-16T18:45:00Z"
  }
];

const mockEvaluations: ImpactEvaluation[] = [
  {
    id: "eval_001",
    timestamp: "2025-07-16T20:15:00Z",
    sourceAllocation: "energy_allocation",
    evaluatedMetrics: ["carbon_reduction"],
    overallImpact: 87.3,
    deviationRate: 12.1,
    zkpHash: "0x8c4d...3f7a",
    evaluatedBy: "did:civic:impact_assessor_001",
    status: "validated"
  },
  {
    id: "eval_002",
    timestamp: "2025-07-16T19:45:00Z",
    sourceAllocation: "housing_allocation",
    evaluatedMetrics: ["housing_units"],
    overallImpact: 92.1,
    deviationRate: 8.3,
    zkpHash: "0x5f2a...9b8c",
    evaluatedBy: "did:civic:impact_assessor_002",
    status: "validated"
  },
  {
    id: "eval_003",
    timestamp: "2025-07-16T19:30:00Z",
    sourceAllocation: "health_allocation",
    evaluatedMetrics: ["health_coverage"],
    overallImpact: 76.4,
    deviationRate: 23.7,
    zkpHash: "0x2e9d...4a1f",
    evaluatedBy: "did:civic:impact_assessor_003",
    status: "flagged"
  }
];

export default function ImpactEvaluationCard() {
  const [metrics, setMetrics] = useState<ImpactMetric[]>(mockMetrics);
  const [allocations] = useState<AllocationSource[]>(mockAllocations);
  const [evaluations, setEvaluations] = useState<ImpactEvaluation[]>(mockEvaluations);
  const [selectedAllocation, setSelectedAllocation] = useState<string>("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showPathB, setShowPathB] = useState<boolean>(false);
  const [deviationRate, setDeviationRate] = useState<number>(0);
  const [lastSpeech, setLastSpeech] = useState<number>(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // TTS function with proper cancellation
  const speak = (text: string) => {
    const now = Date.now();
    if (now - lastSpeech < 2000) return; // Throttle TTS calls
    
    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.7;
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setLastSpeech(now);
    }
  };

  // Component mount TTS
  useEffect(() => {
    const timer = setTimeout(() => {
      speak("Impact evaluation panel ready");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Deviation monitoring simulation (>20% threshold)
  useEffect(() => {
    const deviationTimer = setInterval(() => {
      // Calculate average deviation from current evaluations
      const avgDeviation = evaluations.reduce((sum, evaluation) => sum + evaluation.deviationRate, 0) / evaluations.length;
      
      // Add random variance for testing
      const variance = (Math.random() - 0.5) * 40; // ±20% variance
      const testDeviation = Math.max(0, Math.min(100, avgDeviation + variance));
      setDeviationRate(testDeviation);
      
      if (testDeviation > 20) {
        setShowPathB(true);
        console.log(`⚠️ Impact evaluation deviation: ${testDeviation.toFixed(1)}% (exceeds 20% threshold)`);
        setTimeout(() => setShowPathB(false), 3000);
      }
    }, 10000);

    return () => clearInterval(deviationTimer);
  }, [evaluations]);

  // Update metrics with simulated changes
  useEffect(() => {
    const metricsTimer = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        const variance = (Math.random() - 0.5) * 2; // Small variance for realism
        const newValue = Math.max(0, metric.currentValue + variance);
        const newTrend = newValue > metric.currentValue ? "up" : 
                        newValue < metric.currentValue ? "down" : "stable";
        
        return {
          ...metric,
          currentValue: newValue,
          trend: newTrend,
          lastUpdated: new Date().toISOString(),
          confidence: Math.max(70, Math.min(98, metric.confidence + (Math.random() - 0.5) * 5))
        };
      }));
    }, 15000);

    return () => clearInterval(metricsTimer);
  }, []);

  // Generate ZKP hash
  const generateZKPHash = (): string => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substr(2, 8);
    return `0x${randomHex}...${timestamp.toString(16).substr(-4)}`;
  };

  // Calculate impact score based on metric performance
  const calculateImpactScore = (metricIds: string[]): number => {
    const relevantMetrics = metrics.filter(m => metricIds.includes(m.id));
    const scores = relevantMetrics.map(metric => {
      const progress = (metric.currentValue - metric.baseline) / (metric.target - metric.baseline);
      return Math.max(0, Math.min(100, progress * 100));
    });
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  // Calculate deviation rate
  const calculateDeviationRate = (impactScore: number): number => {
    const expectedImpact = 85.0; // Expected baseline impact
    return Math.abs(impactScore - expectedImpact) / expectedImpact * 100;
  };

  // Handle impact evaluation
  const handleEvaluateImpact = async () => {
    if (!selectedAllocation || selectedMetrics.length === 0) {
      return;
    }

    setIsEvaluating(true);

    // Simulate evaluation processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    const impactScore = calculateImpactScore(selectedMetrics);
    const devRate = calculateDeviationRate(impactScore);

    const newEvaluation: ImpactEvaluation = {
      id: `eval_${String(evaluations.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      sourceAllocation: selectedAllocation,
      evaluatedMetrics: [...selectedMetrics],
      overallImpact: impactScore,
      deviationRate: devRate,
      zkpHash: generateZKPHash(),
      evaluatedBy: "did:civic:current_evaluator",
      status: devRate > 20 ? "flagged" : "validated"
    };

    setEvaluations(prev => [newEvaluation, ...prev]);

    speak("Impact validated");
    console.log(`✅ Impact evaluation completed: ${newEvaluation.zkpHash}`);
    console.log(`📊 Overall impact: ${impactScore.toFixed(1)}% | Deviation: ${devRate.toFixed(1)}%`);

    setIsEvaluating(false);
    setSelectedAllocation("");
    setSelectedMetrics([]);
  };

  // Toggle metric selection
  const toggleMetricSelection = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  // Get trend icon
  const getTrendIcon = (trend: ImpactMetric["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-400" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-400" />;
      case "stable":
      default:
        return <BarChart3 className="h-3 w-3 text-slate-400" />;
    }
  };

  // Get status color
  const getStatusColor = (status: ImpactEvaluation["status"]) => {
    switch (status) {
      case "validated":
        return "bg-green-500";
      case "flagged":
        return "bg-red-500";
      case "pending":
        return "bg-amber-500";
      default:
        return "bg-slate-500";
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get progress color based on performance
  const getProgressColor = (metric: ImpactMetric): string => {
    const progress = (metric.currentValue - metric.baseline) / (metric.target - metric.baseline);
    if (progress >= 0.8) return "bg-green-600";
    if (progress >= 0.5) return "bg-yellow-600";
    if (progress >= 0.2) return "bg-orange-600";
    return "bg-red-600";
  };

  const canEvaluate = selectedAllocation && selectedMetrics.length > 0;
  const selectedAllocationData = allocations.find(a => a.id === selectedAllocation);

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-blue-400" />
          Impact Evaluation
          {showPathB && (
            <div className="ml-auto animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <BarChart3 className="h-3 w-3" />
          <span>Metrics: {metrics.length}</span>
          <span>•</span>
          <span>Evaluations: {evaluations.length}</span>
          <span>•</span>
          <span className={deviationRate > 20 ? "text-red-400" : deviationRate > 10 ? "text-amber-400" : "text-green-400"}>
            Deviation: {deviationRate.toFixed(1)}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Allocation Source Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Allocation Source</label>
          <Select value={selectedAllocation} onValueChange={setSelectedAllocation}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Allocation source selector">
              <SelectValue placeholder="Select allocation to evaluate..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {allocations.map(allocation => (
                <SelectItem key={allocation.id} value={allocation.id} className="text-white hover:bg-slate-600">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{allocation.name}</span>
                      <Badge variant="secondary" className="text-xs bg-slate-600 text-slate-300">
                        {allocation.allocation}%
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">{allocation.category}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Metric Selection */}
        {selectedAllocationData && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Impact Metrics</label>
            <ScrollArea className="h-32">
              <div className="space-y-1 pr-2">
                {metrics.filter(m => m.category === selectedAllocationData.category).map((metric) => (
                  <div
                    key={metric.id}
                    onClick={() => toggleMetricSelection(metric.id)}
                    className={`p-2 rounded-md border cursor-pointer transition-colors ${
                      selectedMetrics.includes(metric.id)
                        ? "bg-blue-900/50 border-blue-600"
                        : "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Toggle ${metric.name} metric`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(metric.trend)}
                          <span className="text-sm text-white">{metric.name}</span>
                        </div>
                        {selectedMetrics.includes(metric.id) && (
                          <CheckCircle2 className="h-4 w-4 text-blue-400" />
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white">
                          {metric.currentValue.toFixed(1)}{metric.unit}
                        </div>
                        <div className="text-xs text-slate-400">
                          Target: {metric.target}{metric.unit}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-2">
                      <Progress 
                        value={(metric.currentValue / metric.target) * 100} 
                        className="flex-1 h-1"
                        aria-label={`${metric.name} progress`}
                      />
                      <Badge variant="secondary" className="text-xs bg-slate-600 text-slate-300">
                        {metric.confidence.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Evaluation Action */}
        <div className="space-y-2">
          <Button
            onClick={handleEvaluateImpact}
            disabled={!canEvaluate || isEvaluating}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600"
            aria-label="Evaluate impact"
          >
            {isEvaluating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Evaluating Impact...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Evaluate Impact
              </>
            )}
          </Button>
          
          {!canEvaluate && (
            <div className="text-xs text-amber-400 text-center" role="alert" aria-live="polite">
              Select allocation source and metrics to evaluate
            </div>
          )}
        </div>

        <Separator className="bg-slate-600" />

        {/* Evaluation History */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Recent Evaluations</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {evaluations.length}
            </Badge>
          </div>

          <ScrollArea className="h-32">
            <div className="space-y-1">
              {evaluations.slice(0, 4).map((evaluation) => (
                <div key={evaluation.id} className="p-2 rounded-md bg-slate-700/50 border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(evaluation.status)}`} />
                      <Badge className={`text-xs ${
                        evaluation.status === "validated" ? "bg-green-600" :
                        evaluation.status === "flagged" ? "bg-red-600" : "bg-amber-600"
                      } text-white`}>
                        {evaluation.overallImpact.toFixed(1)}%
                      </Badge>
                      {evaluation.deviationRate > 20 && (
                        <AlertTriangle className="h-3 w-3 text-red-400" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDate(evaluation.timestamp)}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-xs text-slate-300">
                    <div className="truncate">
                      Source: {allocations.find(a => a.id === evaluation.sourceAllocation)?.name}
                    </div>
                    <div className="text-slate-500">
                      ZKP: {evaluation.zkpHash} | Dev: {evaluation.deviationRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Pushback Alert */}
        {showPathB && (
          <div className="p-2 bg-amber-900/50 border border-amber-600 rounded-md animate-pulse" role="alert" aria-live="polite">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-amber-300">
                Path B: Impact deviation {deviationRate.toFixed(1)}% exceeds 20% threshold
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}