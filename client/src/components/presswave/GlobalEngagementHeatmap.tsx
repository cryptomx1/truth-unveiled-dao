import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, QrCode, Activity } from 'lucide-react';

interface RegionData {
  id: string;
  name: string;
  code: string;
  hits: number;
  qrScans: number;
  intensity: number;
  coordinates: { x: number; y: number };
  color: string;
}

const GlobalEngagementHeatmap: React.FC = () => {
  const [regionData, setRegionData] = useState<RegionData[]>([
    { id: 'us', name: 'United States', code: 'US', hits: 1247, qrScans: 89, intensity: 85, coordinates: { x: 25, y: 40 }, color: '#ef4444' },
    { id: 'eu', name: 'European Union', code: 'EU', hits: 934, qrScans: 67, intensity: 72, coordinates: { x: 55, y: 35 }, color: '#f97316' },
    { id: 'asia', name: 'Asia Pacific', code: 'APAC', hits: 678, qrScans: 45, intensity: 58, coordinates: { x: 80, y: 45 }, color: '#eab308' },
    { id: 'africa', name: 'Africa', code: 'AFR', hits: 234, qrScans: 23, intensity: 28, coordinates: { x: 55, y: 65 }, color: '#84cc16' },
    { id: 'latam', name: 'Latin America', code: 'LATAM', hits: 156, qrScans: 12, intensity: 18, coordinates: { x: 35, y: 70 }, color: '#06b6d4' }
  ]);

  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);
  const [totalHits, setTotalHits] = useState(0);
  const [activeRegions, setActiveRegions] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate totals and announce via ARIA
    const hits = regionData.reduce((sum, region) => sum + region.hits, 0);
    const active = regionData.filter(region => region.hits > 0).length;
    
    setTotalHits(hits);
    setActiveRegions(active);

    // ARIA announcement for accessibility
    const ariaRegion = document.createElement('div');
    ariaRegion.setAttribute('aria-live', 'polite');
    ariaRegion.setAttribute('aria-atomic', 'true');
    ariaRegion.style.position = 'absolute';
    ariaRegion.style.left = '-9999px';
    ariaRegion.textContent = `Engagement heatmap loaded with ${active} regions active`;
    document.body.appendChild(ariaRegion);
    
    setTimeout(() => document.body.removeChild(ariaRegion), 1000);

    // Live update simulation every 30 seconds
    const interval = setInterval(() => {
      setRegionData(prev => prev.map(region => {
        const hitIncrease = Math.floor(Math.random() * 15) + 1;
        const qrIncrease = Math.floor(Math.random() * 3);
        const newHits = region.hits + hitIncrease;
        const newQrScans = region.qrScans + qrIncrease;
        
        console.log(`🌐 Global engagement updated — ${region.code}: ${newHits} hits, ${newQrScans} QR scans`);
        
        return {
          ...region,
          hits: newHits,
          qrScans: newQrScans,
          intensity: Math.min(100, Math.max(10, (newHits / 20) + (newQrScans * 2)))
        };
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return '#dc2626'; // red-600
    if (intensity >= 60) return '#ea580c'; // orange-600  
    if (intensity >= 40) return '#ca8a04'; // yellow-600
    if (intensity >= 20) return '#65a30d'; // lime-600
    return '#0891b2'; // cyan-600
  };

  const handleRegionHover = (region: RegionData, event: React.MouseEvent) => {
    setHoveredRegion(region);
    
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${event.clientX + 10}px`;
      tooltipRef.current.style.top = `${event.clientY - 10}px`;
      tooltipRef.current.style.display = 'block';
    }
  };

  const handleRegionLeave = () => {
    setHoveredRegion(null);
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  };

  return (
    <Card className="w-full max-w-6xl bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Globe className="h-5 w-5 text-blue-600" />
          Global Engagement Heatmap
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Worldwide civic platform access patterns and QR code scanning activity
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalHits.toLocaleString()}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Hits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {regionData.reduce((sum, region) => sum + region.qrScans, 0)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">QR Scans</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{activeRegions}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Active Regions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(regionData.reduce((sum, region) => sum + region.intensity, 0) / regionData.length)}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Avg Intensity</div>
          </div>
        </div>

        {/* World Map Visualization */}
        <div className="relative bg-slate-100 dark:bg-slate-800 rounded-lg p-6 min-h-[400px]">
          <div 
            className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-700 dark:to-slate-600 rounded-lg border-2 border-slate-200 dark:border-slate-600 overflow-hidden"
            role="img"
            aria-label="World map showing global engagement intensity"
          >
            {/* Mock World Map Background */}
            <svg 
              className="absolute inset-0 w-full h-full opacity-20" 
              viewBox="0 0 100 60"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Simplified continent outlines */}
              <path 
                d="M10,20 L35,15 L40,25 L35,35 L15,40 Z" 
                fill="currentColor" 
                className="text-slate-400"
              />
              <path 
                d="M45,15 L65,10 L70,20 L65,30 L50,35 Z" 
                fill="currentColor" 
                className="text-slate-400"
              />
              <path 
                d="M70,20 L90,25 L85,45 L75,40 Z" 
                fill="currentColor" 
                className="text-slate-400"
              />
            </svg>

            {/* Region Markers */}
            {regionData.map((region) => (
              <div
                key={region.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${region.coordinates.x}%`,
                  top: `${region.coordinates.y}%`,
                }}
                onMouseEnter={(e) => handleRegionHover(region, e)}
                onMouseMove={(e) => handleRegionHover(region, e)}
                onMouseLeave={handleRegionLeave}
              >
                {/* Pulse Effect */}
                <div 
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    backgroundColor: getIntensityColor(region.intensity),
                    width: `${Math.max(20, region.intensity / 2)}px`,
                    height: `${Math.max(20, region.intensity / 2)}px`,
                  }}
                ></div>
                
                {/* Main Marker */}
                <div
                  className="relative rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                  style={{
                    backgroundColor: getIntensityColor(region.intensity),
                    width: `${Math.max(24, region.intensity / 2)}px`,
                    height: `${Math.max(24, region.intensity / 2)}px`,
                  }}
                >
                  <span className="text-white text-xs font-bold">
                    {region.code}
                  </span>
                </div>
              </div>
            ))}

            {/* Activity Waves */}
            <div className="absolute inset-0 pointer-events-none">
              {regionData.filter(r => r.intensity > 70).map((region, index) => (
                <div
                  key={`wave-${region.id}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${region.coordinates.x}%`,
                    top: `${region.coordinates.y}%`,
                    animationDelay: `${index * 0.5}s`,
                  }}
                >
                  <div className="w-16 h-16 border-2 border-blue-400 rounded-full animate-pulse opacity-30"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className="fixed z-50 bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none hidden"
            style={{ display: 'none' }}
          >
            {hoveredRegion && (
              <div className="text-sm">
                <div className="font-medium">{hoveredRegion.name}</div>
                <div className="text-slate-300">
                  {hoveredRegion.hits.toLocaleString()} hits • {hoveredRegion.qrScans} QR scans
                </div>
                <div className="text-slate-400 text-xs">
                  Intensity: {hoveredRegion.intensity}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Regional Activity Breakdown
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {regionData
              .sort((a, b) => b.hits - a.hits)
              .map((region) => (
                <div
                  key={region.id}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border border-white"
                        style={{ backgroundColor: getIntensityColor(region.intensity) }}
                      />
                      <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                        {region.name}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {region.code}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-blue-500" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {region.hits.toLocaleString()} hits
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <QrCode className="h-3 w-3 text-green-500" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {region.qrScans} scans
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Intensity: {region.intensity}%
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Intensity Legend */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Engagement Intensity Scale
            </span>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Updates every 30 seconds
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400">Low</span>
            <div className="flex-1 h-2 bg-gradient-to-r from-cyan-600 via-lime-600 via-yellow-600 via-orange-600 to-red-600 rounded-full"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">High</span>
          </div>
        </div>

        {/* Live Status */}
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live global tracking active</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalEngagementHeatmap;