import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { FactorList } from '../components/FactorList';
import { ShieldCheck, Info, BarChart2, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const ExplainabilityPage: React.FC = () => {
  const { currentResult, currentAnalysis } = useAnalysis();
  const factors = currentAnalysis?.explanation || currentResult?.top_factors || [];

  if (factors.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No explainability factor data available. Please evaluate a company first.
      </div>
    );
  }

  // Chart data formatted for horizontal waterfall/bar view
  const chartData = factors.map((f) => ({
    name: f.feature_label.split('(')[0].trim(),
    weight: f.impact === 'INCREASES_RISK' ? Math.round(f.importance * 100) : -Math.round(f.importance * 100),
    rawImportance: Math.round(f.importance * 100),
    impact: f.impact,
  }));

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-sky-400" />
          Model Explainability & Factor Attribution
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Understanding feature importance, directional impacts, and balance-sheet drivers behind the machine learning prediction.
        </p>
      </div>

      {/* Model Integrity Notice */}
      <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <b>Explainability Note:</b> Factor attributions reflect statistically significant feature weights computed across corporate distress patterns. A high positive weight indicates that the corresponding metric contributed upward pressure to the model's estimated default probability.
        </p>
      </div>

      {/* Waterfall / Directional Bar Chart */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            Relative Factor Attribution Spectrum
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400" /> Protective (Reduces Risk)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-400" /> Vulnerability (Increases Risk)
            </span>
          </div>
        </div>

        <div className="w-full h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 140, bottom: 10 }}
            >
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={130} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white shadow-xl">
                        <p className="font-bold">{data.name}</p>
                        <p className="mt-1 text-slate-300">
                          Direction: <span className={data.impact === 'INCREASES_RISK' ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>{data.impact}</span>
                        </p>
                        <p className="text-slate-300">
                          Weight: <span className="font-mono">{data.rawImportance}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="weight" radius={[4, 4, 4, 4]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.impact === 'INCREASES_RISK' ? '#ef4444' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Factor Breakdown List */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Individual Metric Contributions & Plain-Language Rationales
        </h3>
        <FactorList factors={factors} maxDisplay={10} />
      </div>
    </div>
  );
};
