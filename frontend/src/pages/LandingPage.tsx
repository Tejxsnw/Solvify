import React from 'react';
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  Cpu,
  FileText,
  Sliders,
  ArrowRight,
  Sparkles,
  Lock,
  ChevronRight,
  Layers
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-slate-800/60 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
              SOLVIFY <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono">AI</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onLogin}
            className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center space-y-8">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Enterprise AI Bankruptcy & Financial Distress Intelligence</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Quantify Corporate Distress Before It Impacts Your Balance Sheet.
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
          Combining calibrated ensemble machine learning, Altman Z-Score decomposition, SHAP explainability, and dynamic What-If simulations into one authoritative financial risk workflow.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-2xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Start Financial Analysis</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition-all"
          >
            Explore Pre-Loaded Demo Companies
          </button>
        </div>

        {/* 3 Core Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 w-full text-left">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Calibrated ML Risk Model</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Trained across multi-decade corporate distress distributions with isotonic probability calibration and Altman Z-score benchmarks.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Explainability & Drivers</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Understand the exact weight and directional contribution of liquidity, leverage, profit margins, and cash flows without black-box opacity.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Interactive What-If Simulation</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Dynamically model revenue shocks, debt restructuring, or margin expansion with real-time recalculation of risk bands and financial ratios.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        Solvify Analytics Platform • Designed for Analysts, Founders, and Risk Officers • Strictly Informational Model Output
      </footer>
    </div>
  );
};
