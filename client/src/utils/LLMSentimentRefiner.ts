/**
 * LLMSentimentRefiner.ts
 * Phase PRESS-REPLAY Step 3 - LLM-Enhanced Sentiment Analysis with Rep Optimization
 * Authority: Commander Mark via JASMY Relay System
 */

import { LLMAgentCore } from './LLMAgentCore';

interface SentimentData {
  source: 'social' | 'press_wave' | 'deck_feedback';
  content: string;
  sentiment: number; // -100 to 100
  confidence: number; // 0 to 1
  timestamp: Date;
  metadata: Record<string, any>;
}

interface RepOptimizedSnippet {
  id: string;
  representativeId: string;
  representativeName: string;
  snippet: string;
  actionType: 'reply' | 'acknowledge' | 'explain';
  urgencyLevel: 'low' | 'medium' | 'high';
  expectedEngagement: number;
  trustCoinPotential: number;
  sourceIssues: string[];
  actionUrl: string;
}

interface LLMSentimentAnalysis {
  overallSentiment: number;
  keyTopics: string[];
  urgentIssues: string[];
  representativeActions: RepOptimizedSnippet[];
  confidenceScore: number;
}

class LLMSentimentRefiner {
  private sentimentHistory: SentimentData[] = [];
  private llmCore: LLMAgentCore;
  
  constructor() {
    this.llmCore = new LLMAgentCore();
    this.initializeSentimentSystem();
  }

  /**
   * Initialize sentiment refinement system
   */
  private initializeSentimentSystem(): void {
    console.log('🧠 LLMSentimentRefiner: System initialized');
    console.log('🔗 Cross-integration: social data → press wave → deck feedback');
    
    // Load historical sentiment data
    const stored = localStorage.getItem('llmSentimentHistory');
    if (stored) {
      this.sentimentHistory = JSON.parse(stored).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    }
  }

  /**
   * Pull insights from social data, press wave traffic, and deck feedback
   */
  async pullMultiSourceInsights(): Promise<SentimentData[]> {
    const insights: SentimentData[] = [];
    
    // Mock social data (would integrate with real social APIs)
    const socialData = [
      {
        source: 'social' as const,
        content: 'Rep Chen needs to address healthcare concerns in District 01. Citizens are frustrated with lack of response.',
        sentiment: -65,
        confidence: 0.89,
        timestamp: new Date(),
        metadata: { platform: 'twitter', mentions: 247, district: '01' }
      },
      {
        source: 'social' as const,
        content: 'Grateful for Rep Rodriguez\'s consistent support of veterans affairs. She truly represents our values.',
        sentiment: 78,
        confidence: 0.94,
        timestamp: new Date(),
        metadata: { platform: 'facebook', likes: 1847, district: '03' }
      }
    ];

    // Mock press wave traffic data
    const pressWaveData = [
      {
        source: 'press_wave' as const,
        content: 'High engagement on infrastructure QR codes suggests strong public interest in District 02 improvements.',
        sentiment: 45,
        confidence: 0.76,
        timestamp: new Date(),
        metadata: { qr_scans: 1247, route: '/press/wave', district: '02' }
      }
    ];

    // Mock deck feedback data (from /deck/10)
    const deckFeedbackData = [
      {
        source: 'deck_feedback' as const,
        content: 'Governance feedback shows 73% dissatisfaction with representative responsiveness on climate issues.',
        sentiment: -58,
        confidence: 0.82,
        timestamp: new Date(),
        metadata: { deck: 10, feedback_count: 347, category: 'climate' }
      }
    ];

    insights.push(...socialData, ...pressWaveData, ...deckFeedbackData);
    
    // Store sentiment history
    this.sentimentHistory.push(...insights);
    this.persistSentimentHistory();
    
    console.log(`📊 Pulled insights from ${insights.length} sources:`, {
      social: socialData.length,
      press_wave: pressWaveData.length,
      deck_feedback: deckFeedbackData.length
    });
    
    return insights;
  }

  /**
   * Generate rep-optimized follow-up snippets using LLM
   */
  async generateRepOptimizedSnippets(
    representativeId: string,
    representativeName: string,
    sentimentData: SentimentData[]
  ): Promise<RepOptimizedSnippet[]> {
    try {
      // Prepare LLM prompt with sentiment context
      const sentimentContext = sentimentData
        .map(data => `[${data.source}] ${data.content} (sentiment: ${data.sentiment})`)
        .join('\n');

      const prompt = `
        Analyze the following sentiment data for ${representativeName} and generate 3 actionable engagement snippets:
        
        ${sentimentContext}
        
        Generate JSON response with 3 snippets containing:
        - snippet: Brief, professional response suggestion
        - actionType: reply/acknowledge/explain
        - urgencyLevel: low/medium/high
        - sourceIssues: key issues mentioned
        - expectedEngagement: estimated citizen response (1-100)
        
        Focus on practical, immediate actions the representative can take.
      `;

      const llmResult = await LLMAgentCore.makeLLMRequest({
        prompt: prompt,
        maxTokens: 800,
        temperature: 0.4
      });
      
      const llmResponse = llmResult.content;
      
      // Parse LLM response and create structured snippets
      const snippets = this.parseAndStructureSnippets(
        representativeId,
        representativeName,
        llmResponse,
        sentimentData
      );
      
      console.log(`🧠 Generated ${snippets.length} rep-optimized snippets for ${representativeName}`);
      
      return snippets;
      
    } catch (error) {
      console.warn('⚠️ LLM unavailable, using rule-based snippet generation');
      return this.generateFallbackSnippets(representativeId, representativeName, sentimentData);
    }
  }

  /**
   * Parse LLM response and structure as snippets
   */
  private parseAndStructureSnippets(
    representativeId: string,
    representativeName: string,
    llmResponse: string,
    sentimentData: SentimentData[]
  ): RepOptimizedSnippet[] {
    const snippets: RepOptimizedSnippet[] = [];
    
    try {
      // Attempt to parse JSON response
      const parsed = JSON.parse(llmResponse);
      
      parsed.forEach((item: any, index: number) => {
        const snippet: RepOptimizedSnippet = {
          id: `snippet_${Date.now()}_${index}`,
          representativeId,
          representativeName,
          snippet: item.snippet || 'Engage with constituents on key issues',
          actionType: item.actionType || 'reply',
          urgencyLevel: item.urgencyLevel || 'medium',
          expectedEngagement: item.expectedEngagement || 50,
          trustCoinPotential: this.calculateTrustCoinPotential(item.urgencyLevel, item.expectedEngagement),
          sourceIssues: item.sourceIssues || ['general'],
          actionUrl: `/command?action=engage&rep=${representativeId}&issue=${encodeURIComponent(item.sourceIssues?.[0] || 'general')}`
        };
        
        snippets.push(snippet);
      });
      
    } catch (error) {
      console.warn('⚠️ Failed to parse LLM response, using fallback');
      return this.generateFallbackSnippets(representativeId, representativeName, sentimentData);
    }
    
    return snippets.slice(0, 3); // Ensure exactly 3 snippets
  }

  /**
   * Generate fallback snippets when LLM is unavailable
   */
  private generateFallbackSnippets(
    representativeId: string,
    representativeName: string,
    sentimentData: SentimentData[]
  ): RepOptimizedSnippet[] {
    const issues = this.extractKeyIssues(sentimentData);
    const avgSentiment = sentimentData.reduce((sum, data) => sum + data.sentiment, 0) / sentimentData.length;
    
    const templates = [
      {
        snippet: `Show you've read this — reply to your constituents here: /command`,
        actionType: 'reply' as const,
        urgencyLevel: avgSentiment < -50 ? 'high' as const : 'medium' as const
      },
      {
        snippet: `Address key concerns about ${issues[0] || 'policy matters'} with a public statement`,
        actionType: 'acknowledge' as const,
        urgencyLevel: 'medium' as const
      },
      {
        snippet: `Schedule town hall to explain your position on ${issues[1] || 'recent votes'}`,
        actionType: 'explain' as const,
        urgencyLevel: avgSentiment < -30 ? 'high' as const : 'low' as const
      }
    ];

    return templates.map((template, index) => ({
      id: `fallback_snippet_${Date.now()}_${index}`,
      representativeId,
      representativeName,
      snippet: template.snippet,
      actionType: template.actionType,
      urgencyLevel: template.urgencyLevel,
      expectedEngagement: Math.round(60 + (Math.random() * 30)),
      trustCoinPotential: this.calculateTrustCoinPotential(template.urgencyLevel, 75),
      sourceIssues: issues,
      actionUrl: `/command?action=engage&rep=${representativeId}&issue=${encodeURIComponent(issues[0] || 'general')}`
    }));
  }

  /**
   * Extract key issues from sentiment data
   */
  private extractKeyIssues(sentimentData: SentimentData[]): string[] {
    const issues = new Set<string>();
    
    sentimentData.forEach(data => {
      // Simple keyword extraction (would be enhanced with NLP)
      const keywords = ['healthcare', 'climate', 'infrastructure', 'education', 'veterans', 'tax', 'immigration'];
      keywords.forEach(keyword => {
        if (data.content.toLowerCase().includes(keyword)) {
          issues.add(keyword);
        }
      });
      
      // Add metadata categories
      if (data.metadata.category) {
        issues.add(data.metadata.category);
      }
    });
    
    return Array.from(issues).slice(0, 3);
  }

  /**
   * Calculate TrustCoin potential for snippets
   */
  private calculateTrustCoinPotential(urgencyLevel: string, expectedEngagement: number): number {
    const urgencyMultipliers = {
      low: 1.0,
      medium: 1.5,
      high: 2.0
    };
    
    const baseReward = 100;
    const urgencyMultiplier = urgencyMultipliers[urgencyLevel as keyof typeof urgencyMultipliers] || 1.0;
    const engagementMultiplier = expectedEngagement / 100;
    
    return Math.round(baseReward * urgencyMultiplier * engagementMultiplier);
  }

  /**
   * Perform comprehensive sentiment analysis
   */
  async performComprehensiveAnalysis(representativeId: string): Promise<LLMSentimentAnalysis> {
    // Pull multi-source insights
    const insights = await this.pullMultiSourceInsights();
    
    // Filter for specific representative
    const repInsights = insights.filter(insight => 
      insight.metadata.district === representativeId.replace('rep_district_', '') ||
      insight.content.toLowerCase().includes(representativeId)
    );
    
    // Generate rep-optimized snippets
    const repName = this.getRepresentativeName(representativeId);
    const snippets = await this.generateRepOptimizedSnippets(representativeId, repName, repInsights);
    
    // Calculate overall metrics
    const overallSentiment = repInsights.reduce((sum, insight) => sum + insight.sentiment, 0) / repInsights.length || 0;
    const keyTopics = this.extractKeyIssues(repInsights);
    const urgentIssues = repInsights
      .filter(insight => insight.sentiment < -40)
      .map(insight => insight.metadata.category || 'general')
      .filter((issue, index, arr) => arr.indexOf(issue) === index);
    
    const analysis: LLMSentimentAnalysis = {
      overallSentiment,
      keyTopics,
      urgentIssues,
      representativeActions: snippets,
      confidenceScore: repInsights.reduce((sum, insight) => sum + insight.confidence, 0) / repInsights.length || 0
    };
    
    console.log(`🎯 Comprehensive analysis complete for ${repName}:`, {
      sentiment: overallSentiment.toFixed(1),
      topics: keyTopics.length,
      actions: snippets.length,
      confidence: analysis.confidenceScore.toFixed(2)
    });
    
    return analysis;
  }

  /**
   * Get representative name from ID
   */
  private getRepresentativeName(representativeId: string): string {
    const repNames: Record<string, string> = {
      'rep_district_01': 'Rep. Sarah Chen',
      'rep_district_02': 'Rep. Michael Torres',
      'rep_district_03': 'Rep. Lisa Rodriguez'
    };
    
    return repNames[representativeId] || 'Representative';
  }

  /**
   * Get sentiment analysis history
   */
  getSentimentHistory(): SentimentData[] {
    return this.sentimentHistory;
  }

  /**
   * Get recent analysis summary
   */
  getRecentAnalysisSummary(hours: number = 24): any {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentData = this.sentimentHistory.filter(data => data.timestamp > cutoff);
    
    return {
      totalSentiments: recentData.length,
      avgSentiment: recentData.reduce((sum, data) => sum + data.sentiment, 0) / recentData.length || 0,
      sources: {
        social: recentData.filter(d => d.source === 'social').length,
        press_wave: recentData.filter(d => d.source === 'press_wave').length,
        deck_feedback: recentData.filter(d => d.source === 'deck_feedback').length
      },
      avgConfidence: recentData.reduce((sum, data) => sum + data.confidence, 0) / recentData.length || 0
    };
  }

  /**
   * Persist sentiment history to storage
   */
  private persistSentimentHistory(): void {
    // Keep only last 1000 entries to prevent storage bloat
    if (this.sentimentHistory.length > 1000) {
      this.sentimentHistory = this.sentimentHistory.slice(-1000);
    }
    
    localStorage.setItem('llmSentimentHistory', JSON.stringify(this.sentimentHistory));
  }
}

// Export singleton instance
export const llmSentimentRefiner = new LLMSentimentRefiner();
export type { SentimentData, RepOptimizedSnippet, LLMSentimentAnalysis };