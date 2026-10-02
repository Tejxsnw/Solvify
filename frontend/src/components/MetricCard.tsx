import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  status?: 'safe' | 'warning' | 'danger' | 'neutral';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status = 'neutral',
  badge,
}) => {
  const statusBorder = {
    safe: 'border-emerald-500/20 group-hover:border-emerald-500/40',
    warning: 'border-amber-500/20 group-hover:border-amber-500/40',
    danger: 'border-rose-500/20 group-hover:border-rose-500/40',
    neutral: 'border-slate-800 group-hover:border-slate-700',
  }[status];

  const iconColor = {
    safe: 'text-emerald-400 bg-emerald-500/10',
    warning: 'text-amber-400 bg-amber-500/10',
    danger: 'text-rose-400 bg-rose-500/10',
    neutral: 'text-sky-400 bg-sky-500/10',
  }[status];

  return (
    <div
      className={`group relative rounded-2xl bg-slate-900/60 p-5 backdrop-blur-xl border ${statusBorder} transition-all duration-300 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-white">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl border border-white/5 ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {subtitle && <span className="text-slate-400">{subtitle}</span>}
        {badge && (
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px] border border-slate-700">
            {badge}
          </span>
        )}
        {trend && (
          <span className={`font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
