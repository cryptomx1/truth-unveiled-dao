// CivicImpactRing.ts - Phase X-D Step 4 Core Deliverable 3
// Full-circle visualization of trust delta loops across citizens ↔ reps ↔ DAO
// Commander Mark directive via JASMY Relay

export interface CivicNode {
  id: string;
  type: 'citizen' | 'representative' | 'dao_validator';
  trustLevel: number;
  influenceRadius: number;
  lastActivity: Date;
  connections: string[];
}

export interface TrustFlow {
  sourceId: string;
  targetId: string;
  flowStrength: number;
  deltaVelocity: number;
  flowType: 'positive' | 'negative' | 'neutral';
  timestamp: Date;
}

export interface RingVisualization {
  centerX: number;
  centerY: number;
  radius: number;
  nodes: CivicNode[];
  flows: TrustFlow[];
  colorScheme: 'trust' | 'velocity' | 'influence';
  animationSpeed: number;
}

export interface SentimentMetrics {
  overallTrust: number;
  citizenEngagement: number;
  representativeResponsiveness: number;
  daoTransparency: number;
  netSentiment: 'positive' | 'negative' | 'mixed' | 'neutral';
  velocityTrend: 'accelerating' | 'stable' | 'decelerating';
}

export class CivicImpactRing {
  private static instance: CivicImpactRing;
  private nodes: Map<string, CivicNode> = new Map();
  private trustFlows: TrustFlow[] = [];
  private visualization: RingVisualization | null = null;
  private isInitialized = false;
  private animationFrame: number | null = null;

  // Color schemes for different visualization modes
  private readonly COLOR_SCHEMES = {
    trust: {
      high: '#10B981', // Green
      medium: '#F59E0B', // Amber  
      low: '#EF4444', // Red
      flow: '#3B82F6' // Blue
    },
    velocity: {
      accelerating: '#8B5CF6', // Purple
      stable: '#6B7280', // Gray
      decelerating: '#F97316' // Orange
    },
    influence: {
      high: '#DC2626', // Strong red
      medium: '#EA580C', // Orange
      low: '#65A30D' // Green
    }
  };

  static getInstance(): CivicImpactRing {
    if (!CivicImpactRing.instance) {
      CivicImpactRing.instance = new CivicImpactRing();
    }
    return CivicImpactRing.instance;
  }

  constructor() {
    this.initializeRing();
  }

  private async initializeRing() {
    if (this.isInitialized) return;

    console.log('🔄 CivicImpactRing initializing - Trust delta visualization system');

    // Initialize civic nodes
    this.createInitialNodes();

    // Set up trust flow monitoring
    this.startFlowMonitoring();

    // Initialize visualization parameters
    this.setupVisualization();

    this.isInitialized = true;
    console.log('✅ CivicImpactRing operational - Full-circle trust visualization active');
  }

  private createInitialNodes() {
    // Create citizen nodes
    const citizenNodes: CivicNode[] = [
      {
        id: 'citizen_pool_alpha',
        type: 'citizen',
        trustLevel: 78,
        influenceRadius: 45,
        lastActivity: new Date(),
        connections: ['rep_district_1', 'dao_validator_a']
      },
      {
        id: 'citizen_pool_beta',
        type: 'citizen',
        trustLevel: 82,
        influenceRadius: 52,
        lastActivity: new Date(),
        connections: ['rep_district_2', 'dao_validator_b']
      },
      {
        id: 'citizen_pool_gamma',
        type: 'citizen',
        trustLevel: 69,
        influenceRadius: 38,
        lastActivity: new Date(),
        connections: ['rep_district_1', 'dao_validator_c']
      }
    ];

    // Create representative nodes
    const representativeNodes: CivicNode[] = [
      {
        id: 'rep_district_1',
        type: 'representative',
        trustLevel: 75,
        influenceRadius: 65,
        lastActivity: new Date(),
        connections: ['citizen_pool_alpha', 'citizen_pool_gamma', 'dao_validator_a']
      },
      {
        id: 'rep_district_2',
        type: 'representative',
        trustLevel: 88,
        influenceRadius: 72,
        lastActivity: new Date(),
        connections: ['citizen_pool_beta', 'dao_validator_b']
      }
    ];

    // Create DAO validator nodes
    const daoNodes: CivicNode[] = [
      {
        id: 'dao_validator_a',
        type: 'dao_validator',
        trustLevel: 91,
        influenceRadius: 85,
        lastActivity: new Date(),
        connections: ['rep_district_1', 'citizen_pool_alpha']
      },
      {
        id: 'dao_validator_b',
        type: 'dao_validator',
        trustLevel: 86,
        influenceRadius: 78,
        lastActivity: new Date(),
        connections: ['rep_district_2', 'citizen_pool_beta']
      },
      {
        id: 'dao_validator_c',
        type: 'dao_validator',
        trustLevel: 93,
        influenceRadius: 88,
        lastActivity: new Date(),
        connections: ['citizen_pool_gamma']
      }
    ];

    // Store all nodes
    [...citizenNodes, ...representativeNodes, ...daoNodes].forEach(node => {
      this.nodes.set(node.id, node);
    });

    console.log(`🏛️ Civic nodes initialized: ${citizenNodes.length} citizen pools, ${representativeNodes.length} representatives, ${daoNodes.length} DAO validators`);
  }

  private startFlowMonitoring() {
    // Simulate trust flows between nodes
    const generateTrustFlow = () => {
      const nodeIds = Array.from(this.nodes.keys());
      const sourceId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
      const sourceNode = this.nodes.get(sourceId);
      
      if (!sourceNode || sourceNode.connections.length === 0) return;

      const targetId = sourceNode.connections[Math.floor(Math.random() * sourceNode.connections.length)];
      const flowStrength = Math.random() * 100;
      const deltaVelocity = (Math.random() - 0.5) * 20; // -10 to +10

      const trustFlow: TrustFlow = {
        sourceId,
        targetId,
        flowStrength,
        deltaVelocity,
        flowType: deltaVelocity > 5 ? 'positive' : deltaVelocity < -5 ? 'negative' : 'neutral',
        timestamp: new Date()
      };

      this.trustFlows.push(trustFlow);

      // Limit flow history
      if (this.trustFlows.length > 50) {
        this.trustFlows = this.trustFlows.slice(-30);
      }

      // Update node trust levels based on flows
      this.updateNodeTrust(trustFlow);

      console.log(`🔄 Trust flow: ${sourceId} → ${targetId} (${flowStrength.toFixed(1)} strength, ${deltaVelocity.toFixed(1)} velocity)`);
    };

    // Generate flows every 8-12 seconds
    const scheduleNextFlow = () => {
      const delay = 8000 + Math.random() * 4000; // 8-12 seconds
      setTimeout(() => {
        generateTrustFlow();
        scheduleNextFlow();
      }, delay);
    };

    scheduleNextFlow();
  }

  private updateNodeTrust(flow: TrustFlow) {
    const sourceNode = this.nodes.get(flow.sourceId);
    const targetNode = this.nodes.get(flow.targetId);

    if (!sourceNode || !targetNode) return;

    // Apply trust transfer effect
    const transferEffect = flow.deltaVelocity * 0.1; // Moderate impact

    if (flow.flowType === 'positive') {
      targetNode.trustLevel = Math.min(100, targetNode.trustLevel + Math.abs(transferEffect));
      targetNode.influenceRadius = Math.min(100, targetNode.influenceRadius + Math.abs(transferEffect) * 0.5);
    } else if (flow.flowType === 'negative') {
      targetNode.trustLevel = Math.max(0, targetNode.trustLevel - Math.abs(transferEffect));
      targetNode.influenceRadius = Math.max(20, targetNode.influenceRadius - Math.abs(transferEffect) * 0.3);
    }

    targetNode.lastActivity = new Date();
  }

  private setupVisualization() {
    this.visualization = {
      centerX: 400,
      centerY: 300,
      radius: 200,
      nodes: Array.from(this.nodes.values()),
      flows: this.trustFlows,
      colorScheme: 'trust',
      animationSpeed: 1.0
    };
  }

  public getSentimentMetrics(): SentimentMetrics {
    const citizenNodes = Array.from(this.nodes.values()).filter(n => n.type === 'citizen');
    const repNodes = Array.from(this.nodes.values()).filter(n => n.type === 'representative');
    const daoNodes = Array.from(this.nodes.values()).filter(n => n.type === 'dao_validator');

    const citizenTrust = citizenNodes.reduce((sum, n) => sum + n.trustLevel, 0) / citizenNodes.length;
    const repTrust = repNodes.reduce((sum, n) => sum + n.trustLevel, 0) / repNodes.length;
    const daoTrust = daoNodes.reduce((sum, n) => sum + n.trustLevel, 0) / daoNodes.length;

    const overallTrust = (citizenTrust + repTrust + daoTrust) / 3;

    // Calculate velocity trend from recent flows
    const recentFlows = this.trustFlows.slice(-10);
    const avgVelocity = recentFlows.reduce((sum, f) => sum + f.deltaVelocity, 0) / recentFlows.length;

    return {
      overallTrust: Math.round(overallTrust),
      citizenEngagement: Math.round(citizenTrust),
      representativeResponsiveness: Math.round(repTrust),
      daoTransparency: Math.round(daoTrust),
      netSentiment: overallTrust > 80 ? 'positive' : overallTrust > 60 ? 'mixed' : overallTrust > 40 ? 'neutral' : 'negative',
      velocityTrend: avgVelocity > 2 ? 'accelerating' : avgVelocity < -2 ? 'decelerating' : 'stable'
    };
  }

  public getVisualizationData(): RingVisualization | null {
    if (!this.visualization) return null;

    // Update visualization with current data
    this.visualization.nodes = Array.from(this.nodes.values());
    this.visualization.flows = this.trustFlows.slice(-15); // Show last 15 flows

    return { ...this.visualization };
  }

  public setColorScheme(scheme: 'trust' | 'velocity' | 'influence') {
    if (this.visualization) {
      this.visualization.colorScheme = scheme;
      console.log(`🎨 Color scheme changed to: ${scheme}`);
    }
  }

  public getNodePosition(nodeId: string): { x: number; y: number } | null {
    if (!this.visualization) return null;

    const nodeIndex = Array.from(this.nodes.keys()).indexOf(nodeId);
    const totalNodes = this.nodes.size;
    const angle = (nodeIndex / totalNodes) * 2 * Math.PI;

    return {
      x: this.visualization.centerX + Math.cos(angle) * this.visualization.radius,
      y: this.visualization.centerY + Math.sin(angle) * this.visualization.radius
    };
  }

  public getNodeColor(node: CivicNode): string {
    if (!this.visualization) return '#6B7280';

    const scheme = this.COLOR_SCHEMES[this.visualization.colorScheme];

    switch (this.visualization.colorScheme) {
      case 'trust':
        if (node.trustLevel > 80) return scheme.high;
        if (node.trustLevel > 60) return scheme.medium;
        return scheme.low;

      case 'influence':
        if (node.influenceRadius > 70) return scheme.high;
        if (node.influenceRadius > 50) return scheme.medium;
        return scheme.low;

      case 'velocity':
        return scheme.stable; // Would be calculated from flow velocity in real implementation

      default:
        return '#6B7280';
    }
  }

  public exportRingData(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      nodes: Object.fromEntries(this.nodes),
      trustFlows: this.trustFlows.slice(-20),
      sentimentMetrics: this.getSentimentMetrics(),
      visualization: this.visualization,
      integrityHash: this.generateRingHash()
    };

    return JSON.stringify(exportData, null, 2);
  }

  private generateRingHash(): string {
    const data = Array.from(this.nodes.values()).map(n => n.trustLevel).join('');
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  public destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.isInitialized = false;
    console.log('🔄 CivicImpactRing destroyed');
  }
}

// Global instance access
if (typeof window !== 'undefined') {
  (window as any).civicImpactRing = CivicImpactRing.getInstance();
}

export default CivicImpactRing;