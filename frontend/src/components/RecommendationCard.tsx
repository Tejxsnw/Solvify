import React, { useState } from 'react';
import { RecommendationItem } from '../types';
import { CheckCircle2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: RecommendationItem;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const [expanded, setExpanded] = useState(false);

  const priorityStyles = {
    High: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    Medium: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    Low: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  }[recommendation.priority] || 'bg-slate-500/10 border-slate-500/30 text-slate-400';

  return (
    <div className="rounded-2xl bg-slate-900/60 p-5 border border-slate-800 hover:border-slate-700/80 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-md border ${priorityStyles}`}>
            {recommendation.priority} Priority
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {recommendation.category}
          </span>
        </div>

        <div className="text-xs text-slate-400">
          Metric: <span className="text-sky-400 font-mono font-medium">{recommendation.metric}</span>
        </div>
      </div>

      <h4 className="mt-3 text-base font-bold text-white tracking-tight flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
        {recommendation.title}
      </h4>

      <p className="mt-2 text-xs text-slate-300 leading-relaxed">
        {recommendation.rationale}
      </p>

      {/* Target Comparison */}
      <div className="mt-4 flex items-center gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div>
          <span className="text-slate-400">Current:</span>{' '}
          <span className="font-mono font-bold text-rose-400">{recommendation.current_value.toFixed(2)}</span>
        </div>
        <div className="text-slate-600">→</div>
        <div>
          <span className="text-slate-400">Target Benchmark:</span>{' '}
          <span className="font-mono font-bold text-emerald-400">{recommendation.target_value.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Plan Accordion */}
      <div className="mt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-xs font-medium text-sky-400 hover:text-sky-300 py-1"
        >
          <span>Actionable Implementation Steps ({recommendation.action_plan.length})</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <ul className="mt-2 space-y-2 pt-2 border-t border-slate-800">
            {recommendation.action_plan.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-normal">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
