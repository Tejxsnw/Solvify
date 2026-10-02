import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { RecommendationCard } from '../components/RecommendationCard';
import { Lightbulb, Filter, ShieldAlert, Sparkles } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { currentResult, currentAnalysis } = useAnalysis();
  const recommendations = currentAnalysis?.recommendations || currentResult?.recommendations || [];
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  if (recommendations.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No active recommendations. Please evaluate a company analysis first.
      </div>
    );
  }

  const filtered = recommendations.filter((r) => {
    if (filterPriority === 'ALL') return true;
    return r.priority.toUpperCase() === filterPriority;
  });

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Lightbulb className="w-6 h-6 text-amber-400" />
            Prioritized Financial Action Plans
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data-driven strategic recommendations tailored to identified liquidity deficits, solvency strain, or operational inefficiencies.
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterPriority === p
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p === 'ALL' ? 'All Priorities' : `${p}`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
};
