import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Leaf, Zap, Home, Heart, Utensils, Hash, AlertTriangle, CheckCircle2, Sparkles, DollarSign } from "lucide-react";

interface AllocationCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  allocation: number;
  baseline: number;
  maxAllocation: number;
  priority: "critical" | "high" | "medium" | "low";
  description: string;
}

interface EquityMetrics {
  overall: number;
  energy: number;
  housing: number;
  food: number;
  health: number;
  education: number;
}

interface AllocationHistory {
  id: string;
  timestamp: string;
  totalBudget: number;
  allocations: Record<string, number>;
  equityScore: number;
  zkpHash: string;
  submittedBy: string;
}

const mockCategories: AllocationCategory[] = [
  {
    id: "energy",
    name: "Renewable Energy",
    icon: <Zap className="h-4 w-4" />,
    color: "bg-yellow-600",
    allocation: 25,
    baseline: 20,
    maxAllocation: 40,
    priority: "critical",
    description: "Solar, wind, and grid infrastructure"
  },
  {
    id: "housing",
    name: "Affordable Housing",
    icon: <Home className="h-4 w-4" />,
    color: "bg-blue-600",
    allocation: 20,
    baseline: 25,
    maxAllocation: 35,
    priority: "critical",
    description: "Public housing and shelter programs"
  },
  {
    id: "food",
    name: "Food Security",
    icon: <Utensils className="h-4 w-4" />,
    color: "bg-green-600",
    allocation: 15,
    baseline: 15,
    maxAllocation: 25,
    priority: "high",
    description: "Community gardens and food assistance"
  },
  {
    id: "health",
    name: "Public Health",
    icon: <Heart className="h-4 w-4" />,
    color: "bg-red-600",
    allocation: 25,
    baseline: 30,
    maxAllocation: 40,
    priority: "critical",
    description: "Healthcare access and mental health"
  },
  {
    id: "education",
    name: "Civic Education",
    icon: <Leaf className="h-4 w-4" />,
    color: "bg-purple-600",
    allocation: 15,
    baseline: 10,
    maxAllocation: 20,
    priority: "medium",
    description: "Environmental and civic literacy"
  }
];

const mockHistory: AllocationHistory[] = [
  {
    id: "alloc_001",
    timestamp: "2025-07-16T19:45:00Z",
    totalBudget: 100,
    allocations: { energy: 28, housing: 22, food: 18, health: 22, education: 10 },
    equityScore: 87.3,
    zkpHash: "0x9f2a...7d1c",
    submittedBy: "did:civic:community_member_001"
  },
  {
    id: "alloc_002",
    timestamp: "2025-07-16T18:30:00Z",
    totalBudget: 100,
    allocations: { energy: 25, housing: 20, food: 15, health: 25, education: 15 },
    equityScore: 92.1,
    zkpHash: "0x4e8b...3a9f",
    submittedBy: "did:civic:community_member_002"
  },
  {
    id: "alloc_003",
    timestamp: "2025-07-16T17:15:00Z",
    totalBudget: 100,
    allocations: { energy: 30, housing: 15, food: 20, health: 25, education: 10 },
    equityScore: 78.9,
    zkpHash: "0x1c5d...8e2f",
    submittedBy: "did:civic:community_member_003"
  }
];

export default function SustainabilityAllocationCard() {
  const [categories, setCategories] = useState<AllocationCategory[]>(mockCategories);
  const [totalBudget] = useState<number>(100);
  const [isAllocating, setIsAllocating] = useState<boolean>(false);
  const [allocationHistory, setAllocationHistory] = useState<AllocationHistory[]>(mockHistory);
  const [equityMetrics, setEquityMetrics] = useState<EquityMetrics>({
    overall: 85.7,
    energy: 88.2,
    housing: 76.4,
    food: 89.1,
    health: 82.5,
    education: 91.3
  });
  const [showPathB, setShowPathB] = useState<boolean>(false);
  const [equityMismatch, setEquityMismatch] = useState<number>(0);
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
      speak("Sustainability allocation interface ready");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate current allocation total
  const currentTotal = categories.reduce((sum, cat) => sum + cat.allocation, 0);
  const remainingBudget = totalBudget - currentTotal;

  // Calculate equity score based on baseline deviations
  const calculateEquityScore = (cats: AllocationCategory[]): number => {
    const deviations = cats.map(cat => {
      const deviation = Math.abs(cat.allocation - cat.baseline) / cat.baseline;
      return deviation;
    });
    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
    return Math.max(0, 100 - (avgDeviation * 100));
  };

  // Equity mismatch simulation (>15% threshold)
  useEffect(() => {
    const equityTimer = setInterval(() => {
      const currentEquity = calculateEquityScore(categories);
      const baselineEquity = 85.0; // Expected baseline
      const mismatchRate = Math.abs(currentEquity - baselineEquity) / baselineEquity * 100;
      
      // Add random variance for testing
      const variance = (Math.random() - 0.5) * 30; // ±15% variance
      const testMismatch = Math.max(0, Math.min(100, mismatchRate + variance));
      setEquityMismatch(testMismatch);
      
      if (testMismatch > 15) {
        setShowPathB(true);
        console.log(`⚠️ Sustainability equity mismatch: ${testMismatch.toFixed(1)}% (exceeds 15% threshold)`);
        setTimeout(() => setShowPathB(false), 3000);
      }
    }, 8000);

    return () => clearInterval(equityTimer);
  }, [categories]);

  // Update allocation for a category
  const updateAllocation = (categoryId: string, newValue: number[]) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, allocation: newValue[0] }
        : cat
    ));
  };

  // Generate ZKP hash
  const generateZKPHash = (): string => {
    const timestamp = Date.now();
    const allocString = categories.map(c => `${c.id}:${c.allocation}`).join('|');
    const randomHex = Math.random().toString(16).substr(2, 8);
    return `0x${randomHex}...${timestamp.toString(16).substr(-4)}`;
  };

  // Handle allocation submission
  const handleAllocateResources = async () => {
    if (currentTotal !== totalBudget) {
      return;
    }

    setIsAllocating(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newAllocation: AllocationHistory = {
      id: `alloc_${String(allocationHistory.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      totalBudget,
      allocations: categories.reduce((acc, cat) => {
        acc[cat.id] = cat.allocation;
        return acc;
      }, {} as Record<string, number>),
      equityScore: calculateEquityScore(categories),
      zkpHash: generateZKPHash(),
      submittedBy: "did:civic:current_user"
    };

    setAllocationHistory(prev => [newAllocation, ...prev]);

    // Update equity metrics
    setEquityMetrics(prev => ({
      overall: newAllocation.equityScore,
      energy: Math.max(70, Math.min(95, prev.energy + (Math.random() - 0.5) * 10)),
      housing: Math.max(70, Math.min(95, prev.housing + (Math.random() - 0.5) * 10)),
      food: Math.max(70, Math.min(95, prev.food + (Math.random() - 0.5) * 10)),
      health: Math.max(70, Math.min(95, prev.health + (Math.random() - 0.5) * 10)),
      education: Math.max(70, Math.min(95, prev.education + (Math.random() - 0.5) * 10))
    }));

    speak("Resources allocated");
    console.log(`✅ Resource allocation confirmed: ${newAllocation.zkpHash}`);
    console.log(`📊 Equity score: ${newAllocation.equityScore.toFixed(1)}%`);

    setIsAllocating(false);
  };

  // Get category color based on allocation vs baseline
  const getCategoryStatus = (category: AllocationCategory): string => {
    const deviation = Math.abs(category.allocation - category.baseline) / category.baseline;
    if (deviation > 0.3) return "bg-red-600"; // High deviation
    if (deviation > 0.15) return "bg-amber-600"; // Moderate deviation
    return "bg-green-600"; // Good allocation
  };

  // Get priority color
  const getPriorityColor = (priority: AllocationCategory["priority"]): string => {
    switch (priority) {
      case "critical": return "bg-red-600";
      case "high": return "bg-orange-600";
      case "medium": return "bg-yellow-600";
      case "low": return "bg-green-600";
      default: return "bg-slate-600";
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

  const canAllocate = currentTotal === totalBudget;
  const currentEquityScore = calculateEquityScore(categories);

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Leaf className="h-5 w-5 text-green-400" />
          Sustainability Allocation
          {showPathB && (
            <div className="ml-auto animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <DollarSign className="h-3 w-3" />
          <span>Budget: {currentTotal}/{totalBudget}%</span>
          <span>•</span>
          <span>Equity: {currentEquityScore.toFixed(1)}%</span>
          <span>•</span>
          <span className={remainingBudget === 0 ? "text-green-400" : remainingBudget < 0 ? "text-red-400" : "text-amber-400"}>
            {remainingBudget === 0 ? "Balanced" : remainingBudget > 0 ? `+${remainingBudget}%` : `${remainingBudget}%`}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Resource Allocation Sliders */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Resource Categories</span>
          </div>

          <ScrollArea className="h-48">
            <div className="space-y-3 pr-2">
              {categories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${category.color} text-white`}>
                        {category.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-white">{category.name}</span>
                        <span className="text-xs text-slate-400">{category.description}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getPriorityColor(category.priority)} text-white`}>
                        {category.priority}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getCategoryStatus(category)}`} />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[category.allocation]}
                      onValueChange={(value) => updateAllocation(category.id, value)}
                      max={category.maxAllocation}
                      min={0}
                      step={1}
                      className="flex-1"
                      aria-label={`${category.name} allocation slider`}
                    />
                    <div className="text-sm text-white min-w-[3rem] text-right">
                      {category.allocation}%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Baseline: {category.baseline}%</span>
                    <span>Max: {category.maxAllocation}%</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Equity Metrics */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Equity Distribution</span>
            <Badge variant="secondary" className={`text-xs ${
              currentEquityScore >= 90 ? "bg-green-700" :
              currentEquityScore >= 80 ? "bg-yellow-700" :
              currentEquityScore >= 70 ? "bg-orange-700" : "bg-red-700"
            } text-white`}>
              {currentEquityScore.toFixed(1)}%
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(equityMetrics).filter(([key]) => key !== 'overall').map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-2 rounded bg-slate-700/50">
                <span className="text-slate-300 capitalize">{key}</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={value} 
                    className="w-12 h-2"
                    aria-label={`${key} equity progress`}
                  />
                  <span className="text-white">{value.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation Action */}
        <div className="space-y-2">
          <Button
            onClick={handleAllocateResources}
            disabled={!canAllocate || isAllocating}
            className="w-full h-10 bg-green-600 hover:bg-green-700 disabled:bg-slate-600"
            aria-label="Allocate resources"
          >
            {isAllocating ? (
              <>
                <Leaf className="h-4 w-4 mr-2 animate-spin" />
                Allocating Resources...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Allocate Resources
              </>
            )}
          </Button>
          
          {!canAllocate && (
            <div className="text-xs text-amber-400 text-center" role="alert" aria-live="polite">
              {remainingBudget > 0 
                ? `Allocate remaining ${remainingBudget}% to proceed`
                : `Reduce allocation by ${Math.abs(remainingBudget)}% to proceed`
              }
            </div>
          )}
        </div>

        <Separator className="bg-slate-600" />

        {/* Allocation History */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Recent Allocations</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {allocationHistory.length}
            </Badge>
          </div>

          <ScrollArea className="h-24">
            <div className="space-y-1">
              {allocationHistory.slice(0, 3).map((allocation) => (
                <div key={allocation.id} className="p-2 rounded-md bg-slate-700/50 border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        allocation.equityScore >= 90 ? "bg-green-500" :
                        allocation.equityScore >= 80 ? "bg-yellow-500" :
                        allocation.equityScore >= 70 ? "bg-orange-500" : "bg-red-500"
                      }`} />
                      <Badge className={`text-xs ${
                        allocation.equityScore >= 90 ? "bg-green-600" :
                        allocation.equityScore >= 80 ? "bg-yellow-600" :
                        allocation.equityScore >= 70 ? "bg-orange-600" : "bg-red-600"
                      } text-white`}>
                        {allocation.equityScore.toFixed(1)}%
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDate(allocation.timestamp)}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-xs text-slate-300">
                    <div className="truncate">ZKP: {allocation.zkpHash}</div>
                    <div className="text-slate-500">
                      By: {allocation.submittedBy.split(':').pop()}
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
                Path B: Equity mismatch {equityMismatch.toFixed(1)}% exceeds 15% threshold
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}