import React from 'react';

interface RiskGaugeProps {
  probability: number;
  riskBand: 'LOW' | 'MEDIUM' | 'HIGH';
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ probability, riskBand, size = 200 }) => {
  const percentage = Math.round(probability * 100);
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  // Semi-circle arc
  const arcCircumference = circumference * 0.75;
  const strokeDashoffset = arcCircumference - (arcCircumference * percentage) / 100;

  const getColor = () => {
    if (riskBand === 'LOW') return '#10b981'; // emerald-500
    if (riskBand === 'MEDIUM') return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const getGlow = () => {
    if (riskBand === 'LOW') return 'rgba(16, 185, 129, 0.35)';
    if (riskBand === 'MEDIUM') return 'rgba(245, 158, 11, 0.35)';
    return 'rgba(239, 68, 68, 0.35)';
  };

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${arcCircumference} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Value Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${arcCircumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 10px ${getGlow()})`,
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-extrabold tracking-tight font-mono text-white">
          {percentage}%
        </span>
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mt-1">
          Distress Probability
        </span>
      </div>
    </div>
  );
};
