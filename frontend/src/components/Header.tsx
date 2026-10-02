import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { Building2, Calendar, RefreshCw, Sparkles, Download, Bot } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

interface HeaderProps {
  onOpenAiChat: () => void;
  onExportPdf: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAiChat, onExportPdf }) => {
  const { currentAnalysis, currentResult, currentInput, isAnalyzing, runAnalysis } = useAnalysis();

  const companyName = currentAnalysis?.company_name || currentInput.company_name;
  const financialYear = currentAnalysis?.financial_year || currentInput.financial_year || '2025';
  const riskBand = currentAnalysis?.risk_band || currentResult?.risk_band || 'LOW';

  return (
    <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sky-400">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-tight">{companyName}</h2>
            <RiskBadge band={riskBand} size="sm" />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> FY {financialYear}
            </span>
            <span>•</span>
            <span className="font-mono text-slate-400">
              Model: {currentAnalysis?.model_name || 'solvify-ensemble-v1'} (v{currentAnalysis?.model_version || '1.0.0'})
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => runAnalysis(currentInput, true)}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-sky-400' : ''}`} />
          <span>{isAnalyzing ? 'Evaluating...' : 'Re-evaluate'}</span>
        </button>

        <button
          onClick={onExportPdf}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-all"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span>Export PDF</span>
        </button>

        <button
          onClick={onOpenAiChat}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/20 transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>Ask AI</span>
        </button>
      </div>
    </header>
  );
};
