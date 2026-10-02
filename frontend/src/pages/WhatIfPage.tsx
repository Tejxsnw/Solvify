import React, { useState, useEffect } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { api } from '../services/api';
import { ScenarioResponse, MetricDelta } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { RiskBadge } from '../components/RiskBadge';
import {
  Sliders,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const WhatIfPage: React.FC = () => {
  const { currentInput, currentAnalysis, currentResult } = useAnalysis();

  const baselineId = currentAnalysis?.id || 'baseline-temp';
  const baselineProb = currentAnalysis?.risk_probability ?? currentResult?.probability ?? 0.15;
  const baselineBand = currentAnalysis?.risk_band || currentResult?.risk_band || 'LOW';

  // Slider adjustments
  const [revenueChangePct, setRevenueChangePct] = useState<number>(0);
  const [operatingIncomeChangePct, setOperatingIncomeChangePct] = useState<number>(0);
  const [debtChangePct, setDebtChangePct] = useState<number>(0);
  const [cashChangePct, setCashChangePct] = useState<number>(0);

  const [simulationResult, setSimulationResult] = useState<ScenarioResponse | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Run simulation whenever sliders change
  useEffect(() => {
    const runSimulation = async () => {
      setIsSimulating(true);
      try {
        const changes: Record<string, number> = {
          revenue: Math.max(0, currentInput.revenue * (1 + revenueChangePct / 100)),
          operating_income: currentInput.operating_income * (1 + operatingIncomeChangePct / 100),
          net_income: currentInput.net_income * (1 + operatingIncomeChangePct / 100),
          debt: Math.max(0, currentInput.debt * (1 + debtChangePct / 100)),
          cash: Math.max(0, currentInput.cash * (1 + cashChangePct / 100)),
          current_assets: Math.max(
            0,
            currentInput.current_assets + currentInput.cash * (cashChangePct / 100)
          ),
          total_assets: Math.max(
            1,
            currentInput.total_assets + currentInput.cash * (cashChangePct / 100)
          ),
          operating_cash_flow: currentInput.operating_cash_flow * (1 + operatingIncomeChangePct / 100),
        };

        const res = await api.simulateScenario(baselineId, changes, 'Interactive Scenario', false);
        setSimulationResult(res);
      } catch (e) {
        console.error('Simulation error:', e);
      } finally {
        setIsSimulating(false);
      }
    };

    const timer = setTimeout(runSimulation, 250);
    return () => clearTimeout(timer);
  }, [revenueChangePct, operatingIncomeChangePct, debtChangePct, cashChangePct, currentInput]);

  const handleReset = () => {
    setRevenueChangePct(0);
    setOperatingIncomeChangePct(0);
    setDebtChangePct(0);
    setCashChangePct(0);
  };

  const handleSaveScenario = async () => {
    if (!simulationResult) return;
    try {
      await api.simulateScenario(
        baselineId,
        simulationResult.modified_inputs,
        `Scenario (${new Date().toLocaleTimeString()})`,
        true
      );
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save scenario:', e);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-sky-400" />
            What-If Scenario Stress Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate operational adjustments, debt reductions, or revenue shocks. The baseline analysis is never mutated.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
          <button
            onClick={handleSaveScenario}
            disabled={!simulationResult}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 hover:opacity-95 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedSuccess ? 'Saved Scenario!' : 'Save as Scenario'}</span>
          </button>
        </div>
      </div>

      {/* Main Simulation View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Sliders (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Strategic Assumption Sliders
          </h3>

          {/* Slider 1: Revenue Change */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Annual Revenue Adjustment</span>
              <span className={`font-mono font-bold ${revenueChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {revenueChangePct > 0 ? `+${revenueChangePct}%` : `${revenueChangePct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={revenueChangePct}
              onChange={(e) => setRevenueChangePct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-50% (Shock)</span>
              <span>Baseline (${(currentInput.revenue / 1000000).toFixed(1)}M)</span>
              <span>+50% (Expansion)</span>
            </div>
          </div>

          {/* Slider 2: Operating Income Change */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Operating Profit / Margin Shift</span>
              <span className={`font-mono font-bold ${operatingIncomeChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {operatingIncomeChangePct > 0 ? `+${operatingIncomeChangePct}%` : `${operatingIncomeChangePct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              step="5"
              value={operatingIncomeChangePct}
              onChange={(e) => setOperatingIncomeChangePct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-60%</span>
              <span>Baseline (${(currentInput.operating_income / 1000000).toFixed(2)}M)</span>
              <span>+60%</span>
            </div>
          </div>

          {/* Slider 3: Total Debt Principal */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Total Outstanding Debt</span>
              <span className={`font-mono font-bold ${debtChangePct <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {debtChangePct > 0 ? `+${debtChangePct}%` : `${debtChangePct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={debtChangePct}
              onChange={(e) => setDebtChangePct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-50% (De-leverage)</span>
              <span>Baseline (${(currentInput.debt / 1000000).toFixed(1)}M)</span>
              <span>+50% (New Borrowing)</span>
            </div>
          </div>

          {/* Slider 4: Cash Liquidity Injection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Cash Reserves & Liquidity Buffer</span>
              <span className={`font-mono font-bold ${cashChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {cashChangePct > 0 ? `+${cashChangePct}%` : `${cashChangePct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="10"
              value={cashChangePct}
              onChange={(e) => setCashChangePct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-50%</span>
              <span>Baseline (${(currentInput.cash / 1000000).toFixed(2)}M)</span>
              <span>+100% (Capital Raise)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Probability Comparison Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Baseline vs Simulated Prediction
              </span>
              {simulationResult && (
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    simulationResult.improved
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {simulationResult.improved
                    ? `Risk Reduced by ${(Math.abs(simulationResult.risk_delta) * 100).toFixed(1)}%`
                    : `Risk Increased by ${(Math.abs(simulationResult.risk_delta) * 100).toFixed(1)}%`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Baseline Box */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase">Original Baseline</span>
                <div className="text-3xl font-extrabold font-mono text-white mt-2">
                  {(baselineProb * 100).toFixed(1)}%
                </div>
                <div className="mt-2">
                  <RiskBadge band={baselineBand} size="sm" />
                </div>
              </div>

              {/* Scenario Box */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase">Simulated Scenario</span>
                <div
                  className={`text-3xl font-extrabold font-mono mt-2 ${
                    simulationResult && simulationResult.improved
                      ? 'text-emerald-400'
                      : simulationResult && simulationResult.scenario_probability > baselineProb
                      ? 'text-rose-400'
                      : 'text-white'
                  }`}
                >
                  {simulationResult ? `${(simulationResult.scenario_probability * 100).toFixed(1)}%` : '...'}
                </div>
                <div className="mt-2">
                  {simulationResult && <RiskBadge band={simulationResult.scenario_risk_band} size="sm" />}
                </div>
              </div>
            </div>
          </div>

          {/* Metric Deltas Table */}
          {simulationResult && (
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Financial Ratio Impact Delta
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Financial Metric</th>
                      <th className="p-3 text-right">Baseline</th>
                      <th className="p-3 text-right">Simulated</th>
                      <th className="p-3 text-right">Net Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                    {simulationResult.metric_deltas.map((delta, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-slate-200">{delta.label}</td>
                        <td className="p-3 text-right font-mono text-slate-400">{delta.baseline_value}</td>
                        <td className="p-3 text-right font-mono font-bold text-white">{delta.scenario_value}</td>
                        <td
                          className={`p-3 text-right font-mono font-bold ${
                            delta.improved ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {delta.delta_value > 0 ? `+${delta.delta_value}` : `${delta.delta_value}`} ({delta.delta_pct > 0 ? `+${delta.delta_pct}%` : `${delta.delta_pct}%`})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
