// RoleBasedOverlay Stack - Phase III-A Step 5/6 Exports
export { default as RoleBasedOverlay } from './RoleBasedOverlay';
export type { DIDRole, OverlayConfig } from './RoleBasedOverlay';

export { default as UrgencyTag } from './UrgencyTag';
export type { UrgencyLevel } from './UrgencyTag';
export { getGlobalUrgencyMetrics, getUrgencyRegistry, resetUrgencyState } from './UrgencyTag';

export { default as OverlayAuditTrail } from './OverlayAuditTrail';

export { default as TTSOptimizer } from '../../utils/TTSOptimizer';
export { ttsOptimizer, optimizeTTS, runTTSStressTest, getTTSMetrics, activateEmergencyKiller, deactivateEmergencyKiller } from '../../utils/TTSOptimizer';