import React, { useEffect, useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { GitCompare, Building2, ArrowLeft, Trophy, ShieldCheck } from 'lucide-react';

interface ComparePageProps {
  selectedIds?: string[];
  onBack: () => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ selectedIds = [], onBack }) => {
  const { history } = useAnalysis();
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // If no specific IDs were passed, compare the latest 2 from history
  const targetIds = selectedIds.length >= 2 ? selectedIds : history.slice(0, 2).map((h) => h.id);

  useEffect(() => {
    const fetchComparison = async () => {
      if (targetIds.length < 2) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.compareAnalyses(targetIds);
        setComparisonData(res);
      } catch (err) {
        console.error('Comparison error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [targetIds.join(',')]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-sky-400">Loading multi-company comparison...</div>;
  }

  if (!comparisonData || comparisonData.analyses.length < 2) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-slate-400 text-xs">
          Select at least 2 saved analyses from the History tab to view side-by-side metric comparison.
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
        >
          Return to Saved History
        </button>
      </div>
    );
  }

  const { analyses, metrics_summary } = comparisonData;

  const metricsRow = [
    { label: 'Risk Probability', key: 'risk_probability', format: (v: number) => `${(v * 100).toFixed(1)}%`, lowerBetter: true },
    { label: 'Health Score', key: 'health_score', format: (v: number) => `${v.toFixed(1)} / 100`, lowerBetter: false },
    { label: 'Altman Z-Score', key: 'altman_z_score', format: (v: number) => v.toFixed(2), lowerBetter: false },
    { label: 'Current Ratio', key: 'current_ratio', format: (v: number) => `${v.toFixed(2)}x`, lowerBetter: false },
    { label: 'Quick Ratio', key: 'quick_ratio', format: (v: number) => `${v.toFixed(2)}x`, lowerBetter: false },
    { label: 'Debt to Equity', key: 'debt_to_equity', format: (v: number) => `${v.toFixed(2)}x`, lowerBetter: true },
    { label: 'Net Margin %', key: 'net_margin_pct', format: (v: number) => `${v.toFixed(1)}%`, lowerBetter: false },
    { label: 'Return on Assets %', key: 'return_on_assets_pct', format: (v: number) => `${v.toFixed(1)}%`, lowerBetter: false },
    { label: 'Operating CF to Debt', key: 'operating_cash_flow_to_debt', format: (v: number) => `${v.toFixed(2)}x`, lowerBetter: false },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <GitCompare className="w-6 h-6 text-sky-400" />
              Side-by-Side Corporate Comparison
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative benchmark across {analyses.length} corporate profiles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>Highest Health: <b>{metrics_summary.highest_health}</b></span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4 w-60">Comparative Dimension</th>
              {analyses.map((a: any) => (
                <th key={a.analysis_id} className="p-4 text-center">
                  <div className="font-bold text-white text-sm">{a.company_name}</div>
                  <div className="text-[11px] text-slate-400 font-normal">FY {a.financial_year}</div>
                  <div className="mt-2">
                    <RiskBadge band={a.risk_band} size="sm" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {metricsRow.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30">
                <td className="p-4 font-semibold text-slate-300 bg-slate-950/40">{row.label}</td>
                {analyses.map((a: any) => {
                  const val = a[row.key];
                  return (
                    <td key={a.analysis_id} className="p-4 text-center font-mono text-sm font-bold text-white">
                      {row.format(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
