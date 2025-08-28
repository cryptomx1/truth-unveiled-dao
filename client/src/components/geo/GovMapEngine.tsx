/**
 * GovMapEngine.tsx - Phase XVI Step 2
 * Government District Mapping Engine with ZIP-Legislative Sync
 * Live Legislative Synchronization with LegiSyncAgent Integration
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, FileText, Vote, AlertCircle, Wifi, WifiOff, Bell, X } from 'lucide-react';
import { getDistrictByZIP } from '../../agents/LegiSyncAgent';
import { fetchBillsByDistrict, fetchBillsByZIP, checkAPIHealth, type LiveBill } from '../../services/LegiFeedService';
import { evaluatePushRules, getMockTrustLevel, getMockStreakLevel, formatAlertForARIA, type PushAlert, type PushContext } from '../../agents/PushRuleEngine';
import { FeedbackZoneEngine, type FeedbackContext } from '../feedback/FeedbackZoneEngine';

// District geometry for mock visualization
interface District {
  id: string;
  name: string;
  coordinates: { x: number; y: number; width: number; height: number };
  zipCodes: string[];
  color: string;
}

// Mock district map layout
const DISTRICT_MAP: District[] = [
  {
    id: "8B",
    name: "District 8B - Metro North",
    coordinates: { x: 20, y: 20, width: 120, height: 80 },
    zipCodes: ["20852"],
    color: "#3B82F6" // blue
  },
  {
    id: "3C", 
    name: "District 3C - Downtown",
    coordinates: { x: 160, y: 30, width: 100, height: 70 },
    zipCodes: ["20001"],
    color: "#10B981" // green
  },
  {
    id: "5A",
    name: "District 5A - Westside",
    coordinates: { x: 40, y: 120, width: 110, height: 90 },
    zipCodes: ["22102"],
    color: "#F59E0B" // amber
  },
  {
    id: "1A",
    name: "District 1A - Central",
    coordinates: { x: 170, y: 130, width: 95, height: 75 },
    zipCodes: ["10001"],
    color: "#EF4444" // red
  },
  {
    id: "2D",
    name: "District 2D - Beverly Hills",
    coordinates: { x: 290, y: 40, width: 85, height: 85 },
    zipCodes: ["90210"],
    color: "#8B5CF6" // purple
  },
  {
    id: "4F",
    name: "District 4F - Midtown",
    coordinates: { x: 280, y: 140, width: 100, height: 80 },
    zipCodes: ["30309"],
    color: "#06B6D4" // cyan
  }
];

interface GovMapEngineProps {
  className?: string;
}

export const GovMapEngine: React.FC<GovMapEngineProps> = ({ className = "" }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [searchZIP, setSearchZIP] = useState<string>("");
  const [bills, setBills] = useState<LiveBill[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [apiHealth, setApiHealth] = useState<{ congress: boolean; legiscan: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pushAlerts, setPushAlerts] = useState<PushAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const ariaLiveRef = useRef<HTMLDivElement>(null);
  const alertAriaRef = useRef<HTMLDivElement>(null);

  // Handle district selection with live legislative sync and push notifications
  const handleDistrictClick = async (district: District) => {
    setSelectedDistrict(district);
    setLoading(true);
    setError(null);
    
    try {
      // Fetch live bills using LegiFeedService
      const districtBills = await fetchBillsByDistrict(district.id);
      
      setBills(districtBills);
      const activeCount = districtBills.filter(b => 
        b.status === 'Active' || b.status === 'In Committee' || b.status === 'Passed House'
      ).length;
      setActiveCount(activeCount);
      
      // Phase XVI.3: Evaluate push notification rules
      const pushContext: PushContext = {
        zip: searchZIP || "00000",
        district: district.id,
        trustLevel: getMockTrustLevel(district.id),
        streak: getMockStreakLevel(searchZIP || "00000"),
        activeBills: districtBills,
        lastActivity: new Date(),
        engagementScore: 75 + Math.random() * 20
      };

      const alerts = evaluatePushRules(pushContext);
      setPushAlerts(alerts);
      
      if (alerts.length > 0) {
        setShowAlerts(true);
        // Announce alerts via ARIA
        if (alertAriaRef.current) {
          const alertSummary = alerts.length === 1 
            ? formatAlertForARIA(alerts[0])
            : `${alerts.length} civic alerts for your district`;
          alertAriaRef.current.textContent = alertSummary;
        }
      } else {
        console.log(`✅ No critical updates for District ${district.id}`);
        if (alertAriaRef.current) {
          alertAriaRef.current.textContent = `No critical updates for District ${district.id}`;
        }
      }
      
      // Update ARIA live region with top bill info
      if (ariaLiveRef.current && districtBills.length > 0) {
        const topBill = districtBills[0];
        ariaLiveRef.current.textContent = `District ${district.id} selected. ${districtBills.length} bills found. Top bill: ${topBill.title} by ${topBill.sponsor}, status: ${topBill.status}`;
      } else if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `District ${district.id} selected. No live bills available.`;
      }
      
    } catch (error) {
      console.error('❌ Live district sync failed:', error);
      setError('Failed to fetch live legislative data');
      setBills([]);
      setActiveCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle ZIP code search with live data
  const handleZIPSearch = async (zip: string) => {
    setSearchZIP(zip);
    
    if (zip.length === 5) {
      const district = getDistrictByZIP(zip);
      if (district) {
        const foundDistrict = DISTRICT_MAP.find(d => d.id === district);
        if (foundDistrict) {
          await handleDistrictClick(foundDistrict);
        }
      } else {
        console.log(`⚠️ ZIP ${zip} not mapped to any district`);
        // Try ZIP-based bill fetch as fallback
        setLoading(true);
        try {
          const zipBills = await fetchBillsByZIP(zip);
          setBills(zipBills);
          setActiveCount(zipBills.filter(b => 
            b.status === 'Active' || b.status === 'In Committee'
          ).length);
          setSelectedDistrict(null);
        } catch (error) {
          console.error('❌ ZIP-based bill fetch failed:', error);
          setBills([]);
          setSelectedDistrict(null);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Get bill status color
  const getBillStatusColor = (status: LiveBill['status']) => {
    switch (status) {
      case 'Active': return 'text-green-400';
      case 'In Committee': return 'text-yellow-400';
      case 'Passed House': return 'text-blue-400';
      case 'Passed Senate': return 'text-blue-300';
      case 'Enacted': return 'text-green-300';
      case 'Failed': return 'text-red-400';
      case 'Introduced': return 'text-gray-400';
      default: return 'text-slate-400';
    }
  };

  // Get bill level icon
  const getLevelIcon = (level: LiveBill['level']) => {
    switch (level) {
      case 'federal': return <Vote className="w-4 h-4" />;
      case 'state': return <MapPin className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get alert priority color
  const getAlertPriorityColor = (priority: PushAlert['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-700';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-700';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-700';
      default: return 'text-slate-400 bg-slate-900/20 border-slate-700';
    }
  };

  // Handle alert dismissal
  const dismissAlert = (index: number) => {
    setPushAlerts(prev => prev.filter((_, i) => i !== index));
    if (pushAlerts.length === 1) {
      setShowAlerts(false);
    }
  };

  // Check API health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await checkAPIHealth();
        setApiHealth(health);
      } catch (error) {
        console.error('❌ API health check failed:', error);
        setApiHealth({ congress: false, legiscan: false });
      }
    };

    checkHealth();
  }, []);

  return (
    <div className={`max-w-4xl mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">Government District Map</h2>
            <p className="text-sm text-slate-400">Live Legislative Synchronization - Phase XVII</p>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          {/* Push Notification Badge */}
          {pushAlerts.length > 0 && (
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors"
              aria-label={`${pushAlerts.length} civic alerts available`}
            >
              <Bell className="w-4 h-4" />
              <span className="text-xs">{pushAlerts.length}</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
          )}
          
          {/* API Health Indicator */}
          <div className="flex items-center gap-1 text-blue-400">
            <Wifi className="w-4 h-4" />
            <span className="text-xs">Active</span>
          </div>
        </div>
      </div>

      {/* ZIP Search */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-slate-400" />
          <label htmlFor="zip-search" className="text-sm font-medium text-slate-300">
            Search by ZIP Code
          </label>
        </div>
        <input
          id="zip-search"
          type="text"
          value={searchZIP}
          onChange={(e) => handleZIPSearch(e.target.value)}
          placeholder="Enter 5-digit ZIP code for live data..."
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          maxLength={5}
        />
      </div>

      {/* District Map Visualization */}
      <div className="mb-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-200">Interactive District Map</h3>
          <div className="text-xs text-slate-400">
            Click districts for legislative data
          </div>
        </div>
        
        <div className="relative bg-slate-900 rounded-lg overflow-hidden" style={{ height: '240px' }}>
          <svg width="100%" height="100%" viewBox="0 0 400 240" className="absolute inset-0">
            {DISTRICT_MAP.map((district) => (
              <g key={district.id}>
                <rect
                  x={district.coordinates.x}
                  y={district.coordinates.y}
                  width={district.coordinates.width}
                  height={district.coordinates.height}
                  fill={selectedDistrict?.id === district.id ? district.color : `${district.color}40`}
                  stroke={district.color}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 hover:opacity-80"
                  onClick={() => handleDistrictClick(district)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${district.name} for legislative information`}
                />
                <text
                  x={district.coordinates.x + district.coordinates.width / 2}
                  y={district.coordinates.y + district.coordinates.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {district.id}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* District Legend */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          {DISTRICT_MAP.map((district) => (
            <div key={district.id} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: district.color }}
              />
              <span className="text-slate-300 truncate">{district.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected District Info */}
      {selectedDistrict && (
        <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedDistrict.name}</h3>
              <p className="text-sm text-slate-400">
                ZIP: {selectedDistrict.zipCodes.join(', ')}
              </p>
            </div>
            {loading && (
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            )}
          </div>

          {/* Bills Summary */}
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-lg font-semibold text-white">{bills.length}</div>
              <div className="text-slate-400">Total Bills</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-400">{activeCount}</div>
              <div className="text-slate-400">Active</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-400">
                {bills.filter(b => b.status === 'In Committee' || b.status === 'Introduced').length}
              </div>
              <div className="text-slate-400">In Process</div>
            </div>
          </div>
        </div>
      )}

      {/* Push Alerts Overlay */}
      {showAlerts && pushAlerts.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Civic Alerts</h3>
            <button
              onClick={() => setShowAlerts(false)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close alerts"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {pushAlerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getAlertPriorityColor(alert.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-4 h-4" />
                    <span className="text-xs uppercase font-medium tracking-wide">
                      {alert.priority} • {alert.type.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{alert.message}</p>
                  <div className="flex items-center gap-4 text-xs opacity-75">
                    <span>District: {selectedDistrict?.id}</span>
                    <span>{alert.timestamp.toLocaleTimeString()}</span>
                    {alert.actionRequired && (
                      <span className="px-2 py-1 bg-slate-800 rounded">Action Required</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(index)}
                  className="ml-2 text-slate-400 hover:text-white transition-colors"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
          <p className="text-xs text-red-300 mt-1">🔁 API fallback engaged — no live data available</p>
        </div>
      )}

      {/* Legislative Bills List */}
      {bills.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Live Legislation Feed
            </h3>
            <div className="text-xs text-slate-400">
              Real-time from Congress.gov
            </div>
          </div>
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:border-slate-500 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 text-slate-400">
                  {getLevelIcon(bill.level)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">{bill.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full bg-slate-800 ${getBillStatusColor(bill.status)}`}>
                      {bill.status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-900 text-blue-300">
                      {bill.level}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{bill.summary}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Sponsor: {bill.sponsor}</span>
                    <span className="text-slate-500">Introduced: {bill.introduced_date}</span>
                  </div>
                  {bill.bill_number && (
                    <div className="mt-1 text-xs text-blue-400">
                      Bill #{bill.bill_number} {bill.congress_session && `• Congress ${bill.congress_session}`}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Phase XVIII: Feedback Zone Integration */}
              <div className="mt-4">
                <FeedbackZoneEngine
                  context={{
                    zip: searchZIP || selectedDistrict?.zipCodes[0] || "00000",
                    district: selectedDistrict?.id || "Unknown",
                    billId: bill.bill_number || bill.id,
                    title: bill.title,
                    sponsor: bill.sponsor,
                    status: bill.status
                  }}
                  userTier="Citizen"
                  onFeedbackSubmitted={(feedback) => {
                    console.log(`🗳️ Civic feedback submitted for ${feedback.billId}: ${feedback.vote}`);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Bills Message */}
      {selectedDistrict && bills.length === 0 && !loading && !error && (
        <div className="text-center py-8 text-slate-400">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No live bills available for {selectedDistrict.name}</p>
          <p className="text-xs mt-1">Congress.gov API may be temporarily unavailable</p>
        </div>
      )}

      {/* ARIA Live Regions */}
      <div
        ref={ariaLiveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        ref={alertAriaRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
};

export default GovMapEngine;