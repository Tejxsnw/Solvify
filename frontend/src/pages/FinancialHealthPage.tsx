import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { RatioCard } from '../components/RatioCard';
import { Activity, ShieldCheck, DollarSign, PieChart, Scale } from 'lucide-react';

export const FinancialHealthPage: React.FC = () => {
  const { currentResult, currentAnalysis } = useAnalysis();
  const ratios = currentAnalysis?.ratios || currentResult?.ratios;

  if (!ratios) {
    return (
      <div className="p-8 text-center text-slate-400">
        No active analysis found. Please run an analysis first.
      </div>
    );
  }

  const getStatus = (val: number, goodMin: number, modMin: number): 'Safe' | 'Moderate' | 'Distress' => {
    if (val >= goodMin) return 'Safe';
    if (val >= modMin) return 'Moderate';
    return 'Distress';
  };

  const getInverseStatus = (val: number, safeMax: number, modMax: number): 'Safe' | 'Moderate' | 'Distress' => {
    if (val <= safeMax) return 'Safe';
    if (val <= modMax) return 'Moderate';
    return 'Distress';
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Activity className="w-6 h-6 text-emerald-400" />
          Comprehensive Financial Health Ratios
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed decomposition of liquidity, solvency, operating profitability, and working capital buffers.
        </p>
      </div>

      {/* 1. Liquidity Pillar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
          <DollarSign className="w-4 h-4 text-sky-400" />
          <span>1. Liquidity & Short-Term Cushion</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RatioCard
            category="Liquidity"
            name="Current Ratio"
            value={ratios.current_ratio.toFixed(2)}
            benchmark="> 1.50x"
            status={getStatus(ratios.current_ratio, 1.5, 1.1)}
            description="Measures ability to cover short-term liabilities with short-term assets."
          />
          <RatioCard
            category="Liquidity"
            name="Quick Ratio (Acid Test)"
            value={ratios.quick_ratio.toFixed(2)}
            benchmark="> 1.00x"
            status={getStatus(ratios.quick_ratio, 1.0, 0.7)}
            description="Excludes illiquid inventory from current assets to test immediate payment solvency."
          />
          <RatioCard
            category="Liquidity"
            name="Cash Ratio"
            value={ratios.cash_ratio.toFixed(2)}
            benchmark="> 0.30x"
            status={getStatus(ratios.cash_ratio, 0.3, 0.1)}
            description="Measures pure cash and liquid equivalents relative to current debt obligations."
          />
        </div>
      </div>

      {/* 2. Solvency & Leverage Pillar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
          <Scale className="w-4 h-4 text-amber-400" />
          <span>2. Solvency, Debt & Capital Structure</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <RatioCard
            category="Solvency"
            name="Debt-to-Equity"
            value={ratios.debt_to_equity.toFixed(2)}
            benchmark="< 1.50x"
            status={getInverseStatus(ratios.debt_to_equity, 1.5, 2.5)}
            description="Proportion of external debt financing relative to shareholders' equity."
          />
          <RatioCard
            category="Solvency"
            name="Debt-to-Assets"
            value={(ratios.debt_to_assets * 100).toFixed(1)}
            unit="%"
            benchmark="< 50.0%"
            status={getInverseStatus(ratios.debt_to_assets, 0.5, 0.75)}
            description="Percentage of the firm's assets funded through debt capital."
          />
          <RatioCard
            category="Solvency"
            name="Equity Ratio"
            value={(ratios.equity_ratio * 100).toFixed(1)}
            unit="%"
            benchmark="> 40.0%"
            status={getStatus(ratios.equity_ratio, 0.4, 0.2)}
            description="Proportion of total assets financed by stockholders equity."
          />
          <RatioCard
            category="Solvency"
            name="Financial Leverage"
            value={ratios.financial_leverage.toFixed(2)}
            benchmark="< 2.50x"
            status={getInverseStatus(ratios.financial_leverage, 2.5, 4.0)}
            description="Total assets divided by shareholders equity."
          />
        </div>
      </div>

      {/* 3. Profitability Pillar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
          <PieChart className="w-4 h-4 text-emerald-400" />
          <span>3. Profitability & Asset Efficiency</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <RatioCard
            category="Profitability"
            name="Net Profit Margin"
            value={ratios.net_margin_pct.toFixed(1)}
            unit="%"
            benchmark="> 8.0%"
            status={getStatus(ratios.net_margin_pct, 8.0, 1.0)}
            description="Net income generated as a percentage of total top-line revenue."
          />
          <RatioCard
            category="Profitability"
            name="Operating Margin"
            value={ratios.operating_margin_pct.toFixed(1)}
            unit="%"
            benchmark="> 12.0%"
            status={getStatus(ratios.operating_margin_pct, 12.0, 3.0)}
            description="EBIT earnings generated before interest and taxes per revenue dollar."
          />
          <RatioCard
            category="Profitability"
            name="Return on Assets (ROA)"
            value={ratios.return_on_assets_pct.toFixed(1)}
            unit="%"
            benchmark="> 5.0%"
            status={getStatus(ratios.return_on_assets_pct, 5.0, 0.0)}
            description="Efficiency of management in using assets to generate net earnings."
          />
          <RatioCard
            category="Profitability"
            name="Asset Turnover"
            value={ratios.asset_turnover.toFixed(2)}
            benchmark="> 1.00x"
            status={getStatus(ratios.asset_turnover, 1.0, 0.6)}
            description="Revenue generated per dollar of corporate assets."
          />
        </div>
      </div>

      {/* 4. Cash Flow Coverage & Composite Indexes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>4. Debt Service Coverage & Altman Z-Score</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RatioCard
            category="Coverage"
            name="Operating CF / Debt"
            value={ratios.operating_cash_flow_to_debt.toFixed(2)}
            benchmark="> 0.20x"
            status={getStatus(ratios.operating_cash_flow_to_debt, 0.2, 0.05)}
            description="Annual cash generated by operations divided by total debt principal."
          />
          <RatioCard
            category="Coverage"
            name="Interest Coverage"
            value={ratios.interest_coverage.toFixed(1)}
            unit="x"
            benchmark="> 3.00x"
            status={getStatus(ratios.interest_coverage, 3.0, 1.5)}
            description="Operating profit divided by annual gross interest obligations."
          />
          <RatioCard
            category="Composite"
            name="Altman Z-Score"
            value={ratios.altman_z_score.toFixed(2)}
            unit={`(${ratios.altman_zone})`}
            benchmark="> 2.99"
            status={ratios.altman_zone === 'Safe' ? 'Safe' : ratios.altman_zone === 'Grey' ? 'Moderate' : 'Distress'}
            description="Five-factor bankruptcy formula for predicting default within 24 months."
          />
        </div>
      </div>
    </div>
  );
};
