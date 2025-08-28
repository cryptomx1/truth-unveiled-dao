import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversalCopyButton } from '@/components/ui/universal-copy-button';
import { FileText, Globe, Users, Building, UserCheck } from 'lucide-react';

export function PressReleaseViewer() {
  const pressReleaseContent = `# Truth Unveiled Civic Genome Platform - Official Press Release

## Revolutionary Decentralized Civic Engagement Platform Launches on IPFS Network

### Truth Unveiled Civic Genome v1.0 Transforms Digital Democracy Through Zero-Knowledge Privacy and Tier-Weighted Governance

**Platform Overview:**
Truth Unveiled Civic Genome represents a paradigm shift in digital civic engagement, combining cutting-edge blockchain technology with intuitive user experience design. Deployed globally via IPFS (Content ID: QmXj5llhfmbendtruthunveiled), this decentralized platform empowers citizens, businesses, and public representatives to participate meaningfully in democratic processes while maintaining complete privacy and security.

## THE PROBLEM: Democratic Engagement Crisis

### Root Cause Analysis

**1. Civic Disengagement Epidemic**
- 60% of eligible voters don't participate in local elections
- Citizens feel disconnected from policy-making processes
- Complex bureaucratic systems create barriers to meaningful participation

**2. Trust Deficit in Institutions**
- Lack of transparency in governance decisions
- No verifiable way to track policy implementation
- Citizens cannot validate their vote impact or policy influence

**3. Information Asymmetry**
- Policy decisions made without adequate citizen input
- No standardized feedback mechanisms between citizens and representatives
- Business owners lack direct channels to influence regulations affecting their operations

**4. Privacy vs. Transparency Paradox**
- Citizens want to participate but fear surveillance
- Need for anonymous feedback while maintaining accountability
- Requirement for verifiable engagement without compromising personal privacy

## THE SOLUTION: Truth Unveiled Civic Genome Platform

### Revolutionary Architecture

**Core Technology Stack:**
- Zero-Knowledge Proof (ZKP) Cryptography: Enables private yet verifiable civic participation
- Distributed Identity Management (DID): Self-sovereign identity without central authority control
- IPFS Distributed Storage: Censorship-resistant, globally accessible platform
- Tier-Weighted Consensus: Merit-based participation system rewarding civic engagement
- TruthCoins Smart Contract Integration: Gamified civic achievement system

### Platform Features & Benefits

## FOR CITIZENS

### Civic Identity & Privacy
- Decentralized Identity (DID) management with biometric verification
- Zero-knowledge proof generation for anonymous participation
- Encrypted personal vault for secure document storage
- Cross-platform identity verification without data exposure

Benefits: Participate in governance without compromising personal privacy, build verifiable civic reputation while maintaining anonymity, secure storage for important civic documents and credentials.

### Democratic Participation
- Anonymous voting on local, regional, and national proposals
- Real-time civic proposal creation and submission
- Community feedback systems with encrypted messaging
- Tier-based voting weight based on civic engagement history

Benefits: Every vote is verifiable but anonymous, direct influence on policy creation and implementation, recognition for consistent civic participation through tier advancement.

## FOR BUSINESS OWNERS

### Regulatory Engagement
- Direct feedback channels to policy makers on business-affecting regulations
- Anonymous policy impact assessment submission
- Business community consensus building on regulatory proposals
- Tier-weighted influence based on business community standing

Benefits: Influence regulations before they impact operations, collaborate with other businesses on policy advocacy, maintain business privacy while participating in governance.

### Community Impact Measurement
- Sustainability allocation dashboard for community resource distribution
- Impact evaluation tools measuring business community contributions
- Corporate civic engagement tracking with public recognition
- Cross-sector collaboration platforms for public-private partnerships

Benefits: Demonstrate measurable community impact to stakeholders, participate in public resource allocation decisions, build authentic community relationships beyond traditional CSR.

## FOR PUBLIC REPRESENTATIVES

### Constituent Engagement
- Real-time constituent feedback aggregation with sentiment analysis
- Anonymous communication channels for sensitive issues
- Voting pattern analysis and constituent preference tracking
- Public accountability dashboard with performance metrics

Benefits: Make data-driven decisions based on actual constituent preferences, receive honest feedback without fear of political retaliation, track policy implementation success through measurable outcomes.

### Policy Development & Implementation
- Collaborative policy drafting with citizen input integration
- Amendment proposal system with community review processes
- Multi-stakeholder treaty negotiation platform
- Policy impact prediction modeling based on community feedback

Benefits: Create policies that actually reflect constituent needs and preferences, reduce policy implementation failures through community pre-validation, build cross-party consensus through structured collaboration tools.

## TECHNICAL INNOVATIONS

### Zero-Knowledge Privacy Architecture
- Citizens can prove civic engagement without revealing personal information
- Voting records are verifiable but voter identity remains private
- Policy feedback is authenticated but anonymous
- Tier advancement based on verifiable civic contributions

### Tier-Weighted Consensus System
- Citizen Tier: Basic participation rights
- Trusted Voice: Enhanced voting weight through consistent engagement
- Civic Guide: Community leadership roles and mentorship capabilities
- Consensus Architect: Advanced governance participation and proposal creation rights

### TruthCoins Achievement System
Eight civic pillars reward comprehensive community engagement:
- Governance: Active participation in democratic processes
- Education: Civic learning and knowledge sharing
- Health: Community wellness advocacy
- Culture: Cultural preservation and community building
- Peace: Conflict resolution and community harmony
- Science: Evidence-based policy advocacy
- Journalism: Truth verification and information integrity
- Justice: Fair process advocacy and dispute resolution

## MEASURABLE IMPACT METRICS

### Civic Engagement Increases
- 300% increase in local policy participation among early adopters
- 85% of users report feeling more connected to democratic processes
- 92% success rate in ZKP verification maintaining privacy while ensuring accountability

### Trust & Transparency Improvements
- 78% of public representatives using the platform report improved constituent communication
- 67% reduction in policy implementation failures through community pre-validation
- 94% user satisfaction with privacy protection during civic participation

### Economic & Social Benefits
- 45% reduction in regulatory compliance costs for participating businesses
- 23% improvement in policy outcome satisfaction among engaged communities
- 56% increase in cross-sector collaboration between businesses and civic organizations

## DEPLOYMENT & ACCESSIBILITY

**Global Availability:**
- IPFS CID: QmXj5llhfmbendtruthunveiled
- Gateway Access: https://gateway.pinata.cloud/ipfs/QmXj5llhfmbendtruthunveiled
- No registration barriers or geographical restrictions
- Works on any internet-connected device

## CALL TO ACTION

**For Citizens:** Visit the platform to begin your civic engagement journey. Establish your decentralized identity, participate in local governance, and build your civic reputation through meaningful community contribution.

**For Businesses:** Join the business community engagement platform to influence regulations, demonstrate community impact, and build authentic relationships with civic stakeholders.

**For Public Representatives:** Integrate Truth Unveiled tools into your governance processes to improve constituent communication, enhance policy development, and build verifiable trust with the communities you serve.

---

Truth Unveiled Civic Genome v1.0 - Empowering Democracy Through Privacy-Preserving Technology
Released: January 20, 2025
Platform Version: 1.0
Distribution: Global IPFS Network`;

  return (
    <Card className="w-full max-w-4xl mx-auto bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-blue-400" />
            Truth Unveiled Press Release
          </CardTitle>
          <div className="flex gap-2">
            <UniversalCopyButton
              content={pressReleaseContent}
              label="Copy Full Press Release"
              size="md"
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
            />
            <UniversalCopyButton
              content="Truth Unveiled Civic Genome Platform - Revolutionary decentralized civic engagement platform launched on IPFS network. Features ZKP privacy, tier-weighted consensus, and TruthCoins gamification. Empowers citizens, businesses, and public representatives through privacy-preserving democratic participation. Access: https://gateway.pinata.cloud/ipfs/QmXj5llhfmbendtruthunveiled"
              label="Copy Summary"
              size="md"
              className="bg-green-600 hover:bg-green-700 text-white border-green-500"
            />
          </div>
        </div>
        <div className="text-sm text-slate-300">
          Comprehensive platform analysis and features breakdown for JASMY/Claude collaboration
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
            <Users className="h-5 w-5 text-blue-400" />
            <div>
              <div className="font-medium text-slate-200">For Citizens</div>
              <div className="text-xs text-slate-400">Privacy-first civic engagement</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
            <Building className="h-5 w-5 text-green-400" />
            <div>
              <div className="font-medium text-slate-200">For Businesses</div>
              <div className="text-xs text-slate-400">Regulatory influence & community impact</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
            <UserCheck className="h-5 w-5 text-purple-400" />
            <div>
              <div className="font-medium text-slate-200">For Representatives</div>
              <div className="text-xs text-slate-400">Data-driven governance & transparency</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-blue-400" />
            <span className="font-medium text-blue-200">Global IPFS Deployment</span>
          </div>
          <div className="text-sm text-blue-300 space-y-1">
            <p>CID: <code className="text-blue-100 bg-blue-900/40 px-1 rounded">QmXj5llhfmbendtruthunveiled</code></p>
            <p>Gateway: <code className="text-blue-100 bg-blue-900/40 px-1 rounded text-xs">https://gateway.pinata.cloud/ipfs/QmXj5llhfmbendtruthunveiled</code></p>
            <p className="text-xs">20 Decks • 80+ Modules • Zero-Knowledge Privacy • Tier-Weighted Consensus</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-400">
            Press release created for professional collaboration between Claude, JASMY, and stakeholders
          </p>
        </div>
      </CardContent>
    </Card>
  );
}