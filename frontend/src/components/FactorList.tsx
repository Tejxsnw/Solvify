import React from 'react';
import { FactorContribution } from '../types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface FactorListProps {
  factors: FactorContribution[];
  maxDisplay?: number;
}

export const FactorList: React.FC<FactorListProps> = ({ factors, maxDisplay = 6 }) => {
  const displayFactors = factors.slice(0, maxDisplay);

  return (
    <div className="space-y-3">
      {displayFactors.map((factor, index) => {
        const isRisk = factor.impact === 'INCREASES_RISK';
        return (
          <div
            key={index}
            className={`flex items-start justify-between p-3.5 rounded-xl border backdrop-blur-sm transition-all ${
              isRisk
                ? 'bg-rose-500/[0.04] border-rose-500/20 hover:border-rose-500/40'
                : 'bg-emerald-500/[0.04] border-emerald-500/20 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 p-1.5 rounded-lg ${
                  isRisk ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {isRisk ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{factor.feature_label}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      isRisk
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {isRisk ? 'Increases Risk' : 'Reduces Risk'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{factor.explanation}</p>
              </div>
            </div>

            <div className="text-right pl-3">
              <span className="text-xs text-slate-400">Weight</span>
              <div className="text-sm font-bold font-mono text-white">
                {(factor.importance * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
