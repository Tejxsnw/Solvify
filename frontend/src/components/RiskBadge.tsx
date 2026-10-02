import React from 'react';

interface RiskBadgeProps {
  band: 'LOW' | 'MEDIUM' | 'HIGH';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ band, className = '', size = 'md' }) => {
  const styles = {
    LOW: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
      label: 'LOW RISK',
    },
    MEDIUM: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400',
      label: 'MODERATE RISK',
    },
    HIGH: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      dot: 'bg-rose-400 animate-pulse',
      label: 'HIGH DISTRESS',
    },
  }[band] || {
    bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
    dot: 'bg-slate-400',
    label: 'UNKNOWN',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2 font-medium',
    lg: 'text-sm px-4 py-1.5 gap-2.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase ${styles.bg} ${sizeClasses} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
      {styles.label}
    </span>
  );
};
