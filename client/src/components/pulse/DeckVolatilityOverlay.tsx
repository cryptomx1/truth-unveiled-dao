import React, { useState, useEffect } from 'react';
import { pulseEngine, type DeckPulseData } from './PulseAggregationEngine';

interface DeckVolatilityOverlayProps {
  deckId: string;
  deckName: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const DeckVolatilityOverlay: React.FC<DeckVolatilityOverlayProps> = ({
  deckId,
  deckName,
  className = '',
  position = 'bottom'
}) => {
  const [pulseData, setPulseData] = useState<DeckPulseData | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const updatePulseData = () => {
      const data = pulseEngine.getDeckPulseData(deckId);
      setPulseData(data);
    };

    // Initial load
    updatePulseData();

    // Update every 30 seconds
    const interval = setInterval(updatePulseData, 30000);
    return () => clearInterval(interval);
  }, [deckId]);

  if (!pulseData) {
    return <div className={`h-1 bg-slate-600/20 rounded ${className}`} />;
  }

  const { trustLevel, volatilityIndex, sentimentVector } = pulseData;

  // Calculate flux percentages for 24h period
  const trustFluxUp = volatilityIndex.trend === 'increasing' ? volatilityIndex.period24h * 100 : 0;
  const trustFluxDown = volatilityIndex.trend === 'decreasing' ? volatilityIndex.period24h * 100 : 0;

  // Determine gradient colors based on trust level and volatility
  const getGradientColors = () => {
    const baseColor = trustLevel > 70 ? 'green' : trustLevel >= 30 ? 'yellow' : 'red';
    const intensity = Math.min(100, trustLevel + (volatilityIndex.period24h * 50));
    
    switch (baseColor) {
      case 'green':
        return {
          from: `rgba(34, 197, 94, ${intensity / 100})`, // green-500
          to: `rgba(21, 128, 61, ${intensity / 200})`, // green-700
          glow: 'rgba(34, 197, 94, 0.3)'
        };
      case 'yellow':
        return {
          from: `rgba(234, 179, 8, ${intensity / 100})`, // yellow-500
          to: `rgba(161, 98, 7, ${intensity / 200})`, // yellow-700
          glow: 'rgba(234, 179, 8, 0.3)'
        };
      case 'red':
        return {
          from: `rgba(239, 68, 68, ${intensity / 100})`, // red-500
          to: `rgba(185, 28, 28, ${intensity / 200})`, // red-700
          glow: 'rgba(239, 68, 68, 0.3)'
        };
      default:
        return {
          from: 'rgba(148, 163, 184, 0.5)', // slate-400
          to: 'rgba(71, 85, 105, 0.3)', // slate-600
          glow: 'rgba(148, 163, 184, 0.2)'
        };
    }
  };

  const colors = getGradientColors();
  
  // Create pulsing effect for high volatility
  const shouldPulse = volatilityIndex.riskLevel === 'high' || volatilityIndex.riskLevel === 'critical';

  const getPositionClasses = () => {
    switch (position) {
      case 'top': return 'top-0 left-0 right-0 h-1';
      case 'bottom': return 'bottom-0 left-0 right-0 h-1';
      case 'left': return 'left-0 top-0 bottom-0 w-1';
      case 'right': return 'right-0 top-0 bottom-0 w-1';
      default: return 'bottom-0 left-0 right-0 h-1';
    }
  };

  const renderTooltip = () => {
    if (!showTooltip) return null;

    const tooltipContent = (
      <div className="absolute z-50 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-lg min-w-64">
        <div className="text-sm font-medium text-white mb-2">
          {deckName} Trust Pulse
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-300">Trust Level:</span>
            <span className="text-white font-medium">{trustLevel.toFixed(1)}%</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-300">Trust Flux:</span>
            <span className="text-white font-medium">
              {trustFluxUp > 0 && `+${trustFluxUp.toFixed(1)}%`}
              {trustFluxDown > 0 && `-${trustFluxDown.toFixed(1)}%`}
              {trustFluxUp === 0 && trustFluxDown === 0 && '±0.0%'}
              <span className="text-slate-400 ml-1">| 24h</span>
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-300">Volatility:</span>
            <span className={`font-medium ${
              volatilityIndex.riskLevel === 'critical' ? 'text-red-400' :
              volatilityIndex.riskLevel === 'high' ? 'text-orange-400' :
              volatilityIndex.riskLevel === 'medium' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {volatilityIndex.riskLevel.toUpperCase()}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-300">Participants:</span>
            <span className="text-white font-medium">{pulseData.participantCount}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-300">Sentiment:</span>
            <span className={`font-medium ${
              sentimentVector.sentiment === 'positive' ? 'text-green-400' :
              sentimentVector.sentiment === 'negative' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {sentimentVector.sentiment.toUpperCase()}
            </span>
          </div>
          
          <div className="pt-2 border-t border-slate-600">
            <div className="text-slate-400">
              Trust: {sentimentVector.trustVotes} | Concern: {sentimentVector.concernVotes}
            </div>
          </div>
        </div>
      </div>
    );

    // Position tooltip based on overlay position
    const tooltipPositionClasses = {
      top: 'top-full mt-2 left-0',
      bottom: 'bottom-full mb-2 left-0',
      left: 'left-full ml-2 top-0',
      right: 'right-full mr-2 top-0'
    };

    return (
      <div className={tooltipPositionClasses[position]}>
        {tooltipContent}
      </div>
    );
  };

  return (
    <div 
      className={`absolute ${getPositionClasses()} ${className} cursor-pointer`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{
        background: `linear-gradient(90deg, ${colors.from} 0%, ${colors.to} 100%)`,
        boxShadow: shouldPulse ? `0 0 8px ${colors.glow}` : 'none',
        animation: shouldPulse ? 'pulse 2s infinite' : 'none'
      }}
    >
      {renderTooltip()}
      
      {/* Pulsing indicator for critical volatility */}
      {volatilityIndex.riskLevel === 'critical' && (
        <div 
          className="absolute inset-0 rounded animate-ping"
          style={{ backgroundColor: colors.glow }}
        />
      )}
    </div>
  );
};

export default DeckVolatilityOverlay;