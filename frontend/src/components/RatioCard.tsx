import React from 'react';

interface RatioCardProps {
  category: string;
  name: string;
  value: number | string;
  unit?: string;
  benchmark: string;
  status: 'Safe' | 'Moderate' | 'Distress';
  description: string;
}

export const RatioCard: React.FC<RatioCardProps> = ({
  category,
  name,
  value,
  unit = 'x',
  benchmark,
  status,
  description,
}) => {
  const badgeStyle = {
    Safe: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Distress: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  }[status];

  return (
    <div className="rounded-xl bg-slate-900/50 p-4 border border-slate-800/80 hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400/80">
          {category}
        </span>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badgeStyle}`}>
          {status}
        </span>
      </div>

      <div className="mt-2 text-sm font-medium text-slate-200">{name}</div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono text-white">{value}</span>
        {unit && <span className="text-xs text-slate-400 font-mono">{unit}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
        <span>Benchmark: <span className="text-slate-300 font-medium">{benchmark}</span></span>
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
