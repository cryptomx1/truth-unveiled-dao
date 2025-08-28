/**
 * LightOfTruthBadge.tsx
 * Phase X-M Step 2: "Light of Truth" 3D Badge Preview Component
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LightOfTruthBadgeProps {
  isUnlocked?: boolean;
  size?: 'small' | 'medium' | 'large';
  showAnimation?: boolean;
  badgeData?: {
    did: string;
    pillars: any[];
    totalTp: number;
    unlockTimestamp: string;
  };
}

export const LightOfTruthBadge: React.FC<LightOfTruthBadgeProps> = ({
  isUnlocked = false,
  size = 'medium',
  showAnimation = true,
  badgeData
}) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0.5);

  useEffect(() => {
    if (!showAnimation) return;

    const rotationInterval = setInterval(() => {
      setRotationAngle(prev => (prev + 2) % 360);
    }, 50);

    const glowInterval = setInterval(() => {
      setGlowIntensity(prev => {
        const newIntensity = prev + 0.02;
        return newIntensity > 1 ? 0.3 : newIntensity;
      });
    }, 100);

    return () => {
      clearInterval(rotationInterval);
      clearInterval(glowInterval);
    };
  }, [showAnimation]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'w-24 h-24';
      case 'large': return 'w-64 h-64';
      default: return 'w-40 h-40';
    }
  };

  const badgeStyle = {
    transform: `rotateY(${rotationAngle}deg) rotateX(${Math.sin(rotationAngle * 0.01) * 10}deg)`,
    transformStyle: 'preserve-3d' as const,
    filter: isUnlocked 
      ? `drop-shadow(0 0 ${20 * glowIntensity}px rgba(255, 215, 0, ${glowIntensity})) 
         drop-shadow(0 0 ${40 * glowIntensity}px rgba(255, 255, 255, ${glowIntensity * 0.5}))`
      : 'grayscale(100%) opacity(0.4)',
    background: isUnlocked
      ? `conic-gradient(from ${rotationAngle}deg, 
         #FFD700, #FFA500, #FF8C00, #FFD700, #FFFF00, #FFD700)`
      : '#666666',
  };

  const renderBadgeContent = () => (
    <div 
      className={`${getSizeClasses()} relative mx-auto rounded-full border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden`}
      style={badgeStyle}
      role="img"
      aria-label={isUnlocked ? "Light of Truth Guardian Badge - Unlocked" : "Light of Truth Guardian Badge - Locked"}
    >
      {/* Inner Badge Design */}
      <div className="absolute inset-2 bg-gradient-to-br from-blue-600 to-purple-800 rounded-full flex items-center justify-center">
        {/* Central Light Beam */}
        <div className="absolute inset-4 bg-gradient-radial from-yellow-300 via-transparent to-transparent rounded-full opacity-80" />
        
        {/* Truth Symbol */}
        <div className="text-white text-4xl font-bold z-10">
          {isUnlocked ? '🌟' : '🔒'}
        </div>
        
        {/* Pillar Indicators */}
        {isUnlocked && badgeData && (
          <div className="absolute inset-0">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
              <div
                key={index}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  top: '10%',
                  left: '50%',
                  transform: `translateX(-50%) rotate(${angle}deg) translateY(${size === 'large' ? '80px' : '50px'})`,
                  transformOrigin: '50% 0',
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Outer Ring Text */}
      {isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
              <path
                id="circle-text-path"
                d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
              />
            </defs>
            <text className="text-xs fill-white font-bold" fontSize="6">
              <textPath href="#circle-text-path" startOffset="0%">
                TRUTH UNVEILED • GUARDIAN OF LIGHT • CIVIC PILLAR MASTER •
              </textPath>
            </text>
          </svg>
        </div>
      )}
    </div>
  );

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardContent className="p-6 text-center space-y-4">
        {renderBadgeContent()}
        
        {/* Badge Information */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-center">
            Light of Truth Guardian Badge
          </h3>
          
          {isUnlocked ? (
            <div className="text-sm text-green-600 space-y-1">
              <div>✅ All 8 Pillars Mastered</div>
              {badgeData && (
                <>
                  <div>🏆 {badgeData.totalTp} Truth Points Earned</div>
                  <div className="text-xs text-gray-500">
                    Unlocked: {new Date(badgeData.unlockTimestamp).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-sm text-amber-600">
              🔒 Complete all 8 Civic Pillars to unlock
            </div>
          )}
        </div>
        
        {/* ARIA Live Region for Screen Readers */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        >
          {isUnlocked 
            ? "Light of Truth Guardian Badge is unlocked and active with golden animation"
            : "Light of Truth Guardian Badge is locked, complete civic pillars to unlock"
          }
        </div>
      </CardContent>
    </Card>
  );
};