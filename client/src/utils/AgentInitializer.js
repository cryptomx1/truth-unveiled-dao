/**
 * AgentInitializer.ts
 * Phase AGENT-OPS Step 1 - Agent System Initialization
 * Authority: Commander Mark via JASMY Relay
 */
import LinkSentryAgent from '../agents/LinkSentryAgent';
import PostFusionAuditor from '../agents/PostFusionAuditor';
import GovMapMonitorAgent from '../agents/GovMapMonitorAgent';
import ProtocolValidator from '../agents/ProtocolValidator';
import { engagementNudgeAgent } from '../components/agents/EngagementNudgeAgent';
class AgentInitializer {
    linkSentry;
    fusionAuditor;
    mapMonitor;
    protocolValidator;
    initialized = false;
    constructor() {
        this.initializeAgents();
    }
    initializeAgents() {
        if (this.initialized)
            return;
        console.log('🤖 Agent System Initialization — Phase AGENT-OPS Step 1');
        try {
            // Initialize LinkSentryAgent
            this.linkSentry = new LinkSentryAgent();
            console.log('✅ LinkSentryAgent initialized');
            // Initialize PostFusionAuditor
            this.fusionAuditor = new PostFusionAuditor();
            console.log('✅ PostFusionAuditor initialized');
            // Initialize GovMapMonitorAgent
            this.mapMonitor = new GovMapMonitorAgent();
            console.log('✅ GovMapMonitorAgent initialized');
            // Initialize ProtocolValidator
            this.protocolValidator = new ProtocolValidator();
            console.log('✅ ProtocolValidator initialized');
            // Initialize EngagementNudgeAgent (Phase PRESS-REPLAY Step 2)
            engagementNudgeAgent.initialize();
            console.log('✅ EngagementNudgeAgent initialized');
            // Run initial diagnostics
            this.runInitialDiagnostics();
            this.initialized = true;
            console.log('🟢 Agent System Online — All diagnostic agents operational');
        }
        catch (error) {
            console.error('❌ Agent initialization failed:', error);
        }
    }
    runInitialDiagnostics() {
        // Initial route validation
        const healthStatus = this.linkSentry.getHealthStatus();
        console.log(`📊 Initial Route Health: ${healthStatus.healthy}/${healthStatus.healthy + healthStatus.broken} routes operational`);
        // Initial fusion audit
        const auditSummary = this.fusionAuditor.runFullAudit();
        console.log(`📊 Initial Fusion Audit: ${auditSummary.overallStatus} — ${auditSummary.passed}/${auditSummary.totalChecks} checks passed`);
        // Initial map monitoring
        const mapHealth = this.mapMonitor.getHealthStatus();
        if (mapHealth) {
            console.log(`📊 Initial Map Health: ${mapHealth.overallStatus.toUpperCase()} — ${mapHealth.onlineCount}/${mapHealth.endpointCount} endpoints online`);
        }
        // Initial protocol validation
        const pressReleaseValidation = this.protocolValidator.validateRelease('truthunveiled/releases/launch/final');
        console.log(`📊 Press Release v1.0 Validation: ${pressReleaseValidation.passed ? 'PASSED' : 'FAILED'} — Score: ${pressReleaseValidation.score}/100`);
    }
    validateRoute(route) {
        return this.linkSentry.validateRoute(route);
    }
    auditFusion() {
        return this.fusionAuditor.runFullAudit();
    }
    auditBadgeExport(badgeId, exportData) {
        return this.fusionAuditor.auditBadgeExport(badgeId, exportData);
    }
    getSystemStatus() {
        const routeHealth = this.linkSentry.getHealthStatus();
        const auditTrail = this.fusionAuditor.getAuditTrail();
        const mapHealth = this.mapMonitor.getHealthStatus();
        const pressReleases = this.protocolValidator.getPublishedReleases();
        return {
            initialized: this.initialized,
            routeHealth,
            auditTrail,
            mapHealth,
            pressReleases,
            timestamp: new Date().toISOString()
        };
    }
    validateMapIntegrity() {
        return this.mapMonitor.validateMapComponent();
    }
    getMapHealth() {
        return this.mapMonitor.getHealthStatus();
    }
    validatePressRelease(releaseId) {
        return this.protocolValidator.validateRelease(releaseId);
    }
    getPressReleaseDigest(releaseId) {
        return this.protocolValidator.generateDigest(releaseId);
    }
}
// Global agent instance
export const agentSystem = new AgentInitializer();
// Auto-initialize on module load
if (typeof window !== 'undefined') {
    // Make agent system available globally for debugging
    window.agentSystem = agentSystem;
    console.log('🔧 Agent system available at window.agentSystem');
}
