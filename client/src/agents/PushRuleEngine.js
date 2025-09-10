/**
 * PushRuleEngine.ts - Phase XVI.3
 * Civic Push Notification Ruleset System
 * Trust-based civic alerting with ZIP-linked notification logic
 * Authority: Commander Mark via JASMY Relay
 */
// Trust volatility thresholds
const TRUST_THRESHOLDS = {
    CRITICAL_DROP: 45,
    WARNING_LEVEL: 65,
    STABLE_MINIMUM: 75,
    VOLATILITY_RANGE: 15
};
// Engagement scoring factors
const ENGAGEMENT_FACTORS = {
    MIN_STREAK: 3,
    HEALTHY_STREAK: 7,
    ACTIVITY_WINDOW_HOURS: 48,
    CRITICAL_BILLS_THRESHOLD: 2
};
/**
 * Evaluate push notification rules based on civic context
 */
export const evaluatePushRules = (context) => {
    const alerts = [];
    const now = new Date();
    console.log(`📬 Evaluating push rules for District ${context.district}, ZIP ${context.zip}`);
    console.log(`📊 Context: Trust=${context.trustLevel}, Streak=${context.streak}, Bills=${context.activeBills.length}`);
    // Rule 1: Trust Drop Alert
    if (context.trustLevel < TRUST_THRESHOLDS.WARNING_LEVEL) {
        const severity = context.trustLevel < TRUST_THRESHOLDS.CRITICAL_DROP ? 'critical' : 'high';
        const trustAlert = {
            type: 'trust-drop',
            message: context.trustLevel < TRUST_THRESHOLDS.CRITICAL_DROP
                ? `🚨 Critical trust volatility in District ${context.district} (${context.trustLevel}%)`
                : `⚠️ Trust volatility detected in District ${context.district} (${context.trustLevel}%)`,
            priority: severity,
            actionRequired: true,
            districtSpecific: true,
            timestamp: now,
            metadata: {
                trustChange: TRUST_THRESHOLDS.WARNING_LEVEL - context.trustLevel,
                requiresResponse: context.trustLevel < TRUST_THRESHOLDS.CRITICAL_DROP
            }
        };
        alerts.push(trustAlert);
        console.log(`📬 Push Alert: ${trustAlert.message}`);
    }
    // Rule 2: Bill Watch Alerts (recently introduced bills)
    const recentBills = context.activeBills.filter(bill => {
        const billDate = new Date(bill.introduced_date);
        const hoursDiff = (now.getTime() - billDate.getTime()) / (1000 * 3600);
        return hoursDiff <= ENGAGEMENT_FACTORS.ACTIVITY_WINDOW_HOURS;
    });
    recentBills.forEach(bill => {
        const billAlert = {
            type: 'bill-watch',
            message: `📜 New ${bill.level} bill "${bill.title}" needs your attention`,
            priority: bill.status === 'In Committee' ? 'high' : 'medium',
            actionRequired: true,
            districtSpecific: true,
            timestamp: now,
            metadata: {
                billId: bill.id,
                requiresResponse: bill.status === 'In Committee'
            }
        };
        alerts.push(billAlert);
        console.log(`📬 Push Alert: ${billAlert.message}`);
    });
    // Rule 3: Engagement Drop Alert
    if (context.streak < ENGAGEMENT_FACTORS.MIN_STREAK) {
        const engagementAlert = {
            type: 'engagement-low',
            message: `🔔 Your civic engagement streak is low (${context.streak} days) - stay connected!`,
            priority: 'medium',
            actionRequired: false,
            districtSpecific: false,
            timestamp: now,
            metadata: {
                daysAffected: ENGAGEMENT_FACTORS.MIN_STREAK - context.streak
            }
        };
        alerts.push(engagementAlert);
        console.log(`📬 Push Alert: ${engagementAlert.message}`);
    }
    // Rule 4: Critical Bill Count Alert
    const criticalBills = context.activeBills.filter(bill => bill.status === 'In Committee' || bill.status === 'Passed House');
    if (criticalBills.length >= ENGAGEMENT_FACTORS.CRITICAL_BILLS_THRESHOLD) {
        const urgentAlert = {
            type: 'urgent-vote',
            message: `🗳️ ${criticalBills.length} critical bills require immediate attention in your district`,
            priority: 'critical',
            actionRequired: true,
            districtSpecific: true,
            timestamp: now,
            metadata: {
                requiresResponse: true,
                daysAffected: 1
            }
        };
        alerts.push(urgentAlert);
        console.log(`📬 Push Alert: ${urgentAlert.message}`);
    }
    // Rule 5: District Update Alert (generic)
    if (context.activeBills.length > 0 && alerts.length === 0) {
        const updateAlert = {
            type: 'district-update',
            message: `📍 District ${context.district} has ${context.activeBills.length} active bills - stay informed`,
            priority: 'low',
            actionRequired: false,
            districtSpecific: true,
            timestamp: now
        };
        alerts.push(updateAlert);
        console.log(`📬 Push Alert: ${updateAlert.message}`);
    }
    // Fallback: No critical updates
    if (alerts.length === 0) {
        console.log(`✅ No critical updates for District ${context.district}`);
    }
    return alerts;
};
/**
 * Get mock trust level for district simulation
 */
export const getMockTrustLevel = (districtId) => {
    // Generate consistent but varied trust levels per district
    const districtHash = districtId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const baseTrust = 50 + (districtHash % 40); // 50-90 range
    // Add some volatility simulation
    const volatility = Math.sin(Date.now() / 10000) * 15;
    return Math.max(30, Math.min(95, Math.round(baseTrust + volatility)));
};
/**
 * Get mock civic engagement streak
 */
export const getMockStreakLevel = (zip) => {
    // Generate consistent streak based on ZIP
    const zipHash = parseInt(zip) % 21; // 0-20 day range
    return Math.max(0, zipHash);
};
/**
 * Format alert for ARIA live region
 */
export const formatAlertForARIA = (alert) => {
    const priorityPrefix = alert.priority === 'critical' ? 'URGENT: ' : '';
    return `${priorityPrefix}${alert.message.replace(/[📬🚨⚠️📜🔔🗳️📍]/g, '')}`;
};
/**
 * Filter alerts by priority level
 */
export const filterAlertsByPriority = (alerts, minPriority) => {
    const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    const threshold = priorityOrder[minPriority];
    return alerts.filter(alert => priorityOrder[alert.priority] >= threshold);
};
/**
 * Get alert statistics for dashboard display
 */
export const getAlertStats = (alerts) => {
    return {
        total: alerts.length,
        critical: alerts.filter(a => a.priority === 'critical').length,
        high: alerts.filter(a => a.priority === 'high').length,
        medium: alerts.filter(a => a.priority === 'medium').length,
        low: alerts.filter(a => a.priority === 'low').length,
        actionRequired: alerts.filter(a => a.actionRequired).length,
        districtSpecific: alerts.filter(a => a.districtSpecific).length
    };
};
