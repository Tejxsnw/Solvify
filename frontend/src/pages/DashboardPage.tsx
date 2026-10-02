import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { RiskGauge } from '../components/RiskGauge';
import { MetricCard } from '../components/MetricCard';
import { FactorList } from '../components/FactorList';
import { RecommendationCard } from '../components/RecommendationCard';
import {
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Percent,
  Activity,
  ArrowRight,
  PieChart as PieIcon,
  BarChart3,
  Sliders,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { currentResult, currentAnalysis, currentInput, isAnalyzing } = useAnalysis();

  const ratios = currentAnalysis?.ratios || currentResult?.ratios;
  const riskBand = currentAnalysis?.risk_band || currentResult?.risk_band || 'LOW';
  const probability = currentAnalysis?.risk_probability ?? currentResult?.probability ?? 0.12;
  const healthScore = currentAnalysis?.health_score ?? currentResult?.health_score ?? 85.0;
  const factors = currentAnalysis?.explanation || currentResult?.top_factors || [];
  const recommendations = currentAnalysis?.recommendations || currentResult?.recommendations || [];

  if (!ratios) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800">
          <Activity className="w-12 h-12 text-sky-400 mx-auto animate-pulse" />
          <h3 className="mt-4 text-lg font-bold text-white">No Active Analysis</h3>
          <p className="mt-2 text-xs text-slate-400">
            Select a demo company or submit financial statements to evaluate distress probability.
          </p>
          <button
            onClick={() => onNavigate('analyze')}
            className="mt-6 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-lg shadow-sky-500/20"
          >
            Start Analysis Form
          </button>
        </div>
      </div>
    );
  }

  // Radar chart data for 5 health pillars
  const radarData = [
    {
      pillar: 'Liquidity',
      score: Math.min(Math.max((ratios.current_ratio / 2.0) * 100, 10), 100),
    },
    {
      pillar: 'Solvency',
      score: Math.min(Math.max((1 - ratios.debt_to_assets) * 100, 10), 100),
    },
    {
      pillar: 'Profitability',
      score: Math.min(Math.max((ratios.return_on_assets_pct + 5) * 5, 10), 100),
    },
    {
      pillar: 'Cash Flow',
      score: Math.min(Math.max(ratios.operating_cash_flow_to_debt * 250, 10), 100),
    },
    {
      pillar: 'Altman Z',
      score: Math.min(Math.max((ratios.altman_z_score / 4.0) * 100, 10), 100),
    },
  ];

  // Benchmark comparison bar chart
  const benchmarkData = [
    { name: 'Current Ratio', actual: ratios.current_ratio, benchmark: 1.5 },
    { name: 'Quick Ratio', actual: ratios.quick_ratio, benchmark: 1.0 },
    { name: 'Debt/Equity', actual: ratios.debt_to_equity, benchmark: 1.5 },
    { name: 'Net Margin %', actual: ratios.net_margin_pct, benchmark: 8.0 },
    { name: 'Altman Z', actual: ratios.altman_z_score, benchmark: 2.99 },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Top Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Probability Gauge Card */}
        <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 flex flex-col items-center justify-between shadow-xl">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Calibrated Risk Gauge
            </span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
              Ensemble ML
            </span>
          </div>

          <div className="my-3">
            <RiskGauge probability={probability} riskBand={riskBand} size={190} />
          </div>

          <div className="w-full text-center pt-3 border-t border-slate-800/80">
            <p className="text-xs text-slate-300">
              {riskBand === 'LOW'
                ? 'Model indicates resilient financial structure with low default risk.'
                : riskBand === 'MEDIUM'
                ? 'Model estimates moderate vulnerability requiring working capital discipline.'
                : 'Model detects elevated distress probability driven by high leverage or negative cash flow.'}
            </p>
          </div>
        </div>

        {/* Corporate Health Score & Vital Signs */}
        <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Financial Health Score
              </span>
              <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20 font-mono">
                Index: 100 max
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-extrabold font-mono text-white">{healthScore}</span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>

            {/* Health Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 mt-3 overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-all duration-1000"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Altman Zone</span>
              <p
                className={`text-sm font-bold font-mono mt-0.5 ${
                  ratios.altman_zone === 'Safe'
                    ? 'text-emerald-400'
                    : ratios.altman_zone === 'Grey'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {ratios.altman_zone} ({ratios.altman_z_score.toFixed(2)})
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Working Capital</span>
              <p className="text-sm font-bold font-mono text-white mt-0.5">
                ${(ratios.working_capital / 1000000).toFixed(2)}M
              </p>
            </div>
          </div>
        </div>

        {/* Financial Resilience Radar */}
        <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              5-Pillar Health Radar
            </span>
            <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-mono">
              Structural View
            </span>
          </div>

          <div className="w-full h-44 -my-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="pillar" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Radar name="Company" dataKey="score" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Scores normalized against empirical distress boundaries
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Current Ratio (Liquidity)"
          value={`${ratios.current_ratio.toFixed(2)}x`}
          subtitle="Target: > 1.50x"
          status={ratios.current_ratio >= 1.5 ? 'safe' : ratios.current_ratio >= 1.1 ? 'warning' : 'danger'}
          badge={ratios.current_ratio >= 1.5 ? 'Adequate' : 'Deficit'}
        />
        <MetricCard
          title="Debt to Equity"
          value={`${ratios.debt_to_equity.toFixed(2)}x`}
          subtitle="Target: < 1.50x"
          status={ratios.debt_to_equity <= 1.5 ? 'safe' : ratios.debt_to_equity <= 2.5 ? 'warning' : 'danger'}
          badge={ratios.debt_to_equity <= 1.5 ? 'Sound' : 'Leveraged'}
        />
        <MetricCard
          title="Net Profit Margin"
          value={`${ratios.net_margin_pct.toFixed(1)}%`}
          subtitle="Target: > 8.0%"
          status={ratios.net_margin_pct >= 8.0 ? 'safe' : ratios.net_margin_pct > 0 ? 'warning' : 'danger'}
          badge={ratios.net_margin_pct > 0 ? 'Profitable' : 'Loss'}
        />
        <MetricCard
          title="Operating CF to Debt"
          value={`${ratios.operating_cash_flow_to_debt.toFixed(2)}x`}
          subtitle="Target: > 0.20x"
          status={ratios.operating_cash_flow_to_debt >= 0.2 ? 'safe' : ratios.operating_cash_flow_to_debt >= 0.05 ? 'warning' : 'danger'}
          badge={ratios.operating_cash_flow_to_debt >= 0.2 ? 'Secure' : 'Tight'}
        />
      </div>

      {/* Mid Section: Benchmarks Chart & Top Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Actual vs Benchmark Chart */}
        <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              Actual Ratios vs Distress Benchmarks
            </h3>
            <span className="text-xs text-slate-400">Target Comparison</span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="actual" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Actual Ratio" />
                <Bar dataKey="benchmark" fill="#64748b" opacity={0.4} radius={[4, 4, 0, 0]} name="Benchmark Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explainability / Top Factors Card */}
        <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                Key Model Risk Drivers
              </h3>
              <button
                onClick={() => onNavigate('explainability')}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                Full Waterfall <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <FactorList factors={factors} maxDisplay={4} />
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Statistical associations from trained classifier</span>
            <span className="font-mono text-slate-500">v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations Teaser */}
      <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Prioritized Strategic Interventions
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Data-driven action plans to de-risk balance sheet and optimize cash liquidity.
            </p>
          </div>
          <button
            onClick={() => onNavigate('recommendations')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <span>View All ({recommendations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.slice(0, 2).map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </div>

      {/* Quick Scenario Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-sky-950/80 via-indigo-950/60 to-purple-950/80 border border-sky-500/20 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Simulate What-If Financial Scenarios</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Test debt reduction, margin expansion, or revenue shocks in real time without mutating baseline data.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('whatif')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
        >
          <span>Open Simulator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
