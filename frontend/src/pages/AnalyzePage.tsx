import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { FinancialInput } from '../types';
import { DEMO_COMPANIES } from '../data/demoData';
import { api } from '../services/api';
import {
  Calculator,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Layers,
  HelpCircle
} from 'lucide-react';

interface AnalyzePageProps {
  onAnalysisSuccess: () => void;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({ onAnalysisSuccess }) => {
  const { currentInput, setCurrentInput, runAnalysis, isAnalyzing, error } = useAnalysis();

  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');
  const [formData, setFormData] = useState<FinancialInput>({ ...currentInput });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number>(0);

  // CSV Upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvResults, setCsvResults] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDemoSelect = (index: number) => {
    setSelectedDemoIndex(index);
    const demo = DEMO_COMPANIES[index];
    setFormData({ ...demo });
    setCurrentInput({ ...demo });
  };

  const handleInputChange = (field: keyof FinancialInput, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleNumberChange = (field: keyof FinancialInput, valStr: string) => {
    const num = parseFloat(valStr);
    setFormData((prev) => ({ ...prev, [field]: isNaN(num) ? 0 : num }));
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.company_name.trim()) errs.company_name = 'Company name is required';
    if (formData.total_assets <= 0) errs.total_assets = 'Total assets must be greater than zero';
    if (formData.current_assets > formData.total_assets * 1.05) {
      errs.current_assets = 'Current assets cannot exceed total assets';
    }
    if (formData.current_liabilities > formData.total_liabilities * 1.05) {
      errs.current_liabilities = 'Current liabilities cannot exceed total liabilities';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await runAnalysis(formData, true);
      onAnalysisSuccess();
    } catch (err) {
      // Error handled by context
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setIsUploading(true);
    setUploadError(null);

    try {
      const data = await api.uploadCSV(file);
      setCsvResults(data);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to parse CSV');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectCsvRecord = async (rec: FinancialInput) => {
    setFormData(rec);
    setCurrentInput(rec);
    try {
      await runAnalysis(rec, true);
      onAnalysisSuccess();
    } catch (err) {
      // Error handled
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Calculator className="w-6 h-6 text-sky-400" />
            Company Financial Data Entry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter audited financial figures or upload a CSV dataset to run machine learning bankruptcy risk models.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'manual'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Manual Entry</span>
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'csv'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>CSV Batch Upload</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Demo Pre-fills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Load Pre-Configured Benchmark Scenarios
          </span>
          <span className="text-[11px] text-slate-500">Instant Demo Fill</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_COMPANIES.map((demo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleDemoSelect(idx)}
              className={`p-4 rounded-2xl text-left border transition-all ${
                selectedDemoIndex === idx
                  ? 'bg-sky-500/10 border-sky-500/50 shadow-md shadow-sky-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{demo.company_name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {demo.industry}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400 line-clamp-2">{demo.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Manual Financial Entry Form */}
      {activeTab === 'manual' && (
        <form onSubmit={handleSubmitManual} className="space-y-6">
          {/* Section 1: General Company Information */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              1. Company Profile & Reporting Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
                {formErrors.company_name && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.company_name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Financial Year / Period
                </label>
                <input
                  type="text"
                  value={formData.financial_year}
                  onChange={(e) => handleInputChange('financial_year', e.target.value)}
                  placeholder="e.g. 2025"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Industry Classification
                </label>
                <input
                  type="text"
                  value={formData.industry || 'General'}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="e.g. Technology"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Income Statement */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
              2. Income Statement Metrics ($ USD)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Total Annual Revenue
                </label>
                <input
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => handleNumberChange('revenue', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Operating Income (EBIT)
                </label>
                <input
                  type="number"
                  value={formData.operating_income}
                  onChange={(e) => handleNumberChange('operating_income', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Net Income (Profit/Loss)
                </label>
                <input
                  type="number"
                  value={formData.net_income}
                  onChange={(e) => handleNumberChange('net_income', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Interest Expense
                </label>
                <input
                  type="number"
                  value={formData.interest_expense}
                  onChange={(e) => handleNumberChange('interest_expense', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Balance Sheet - Assets */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400">
              3. Balance Sheet — Assets ($ USD)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Total Assets <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.total_assets}
                  onChange={(e) => handleNumberChange('total_assets', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Assets
                </label>
                <input
                  type="number"
                  value={formData.current_assets}
                  onChange={(e) => handleNumberChange('current_assets', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cash & Equivalents
                </label>
                <input
                  type="number"
                  value={formData.cash}
                  onChange={(e) => handleNumberChange('cash', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Inventory
                </label>
                <input
                  type="number"
                  value={formData.inventory || 0}
                  onChange={(e) => handleNumberChange('inventory', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Accounts Receivable
                </label>
                <input
                  type="number"
                  value={formData.accounts_receivable || 0}
                  onChange={(e) => handleNumberChange('accounts_receivable', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Balance Sheet - Liabilities & Equity */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              4. Balance Sheet — Liabilities, Debt & Equity ($ USD)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Total Liabilities
                </label>
                <input
                  type="number"
                  value={formData.total_liabilities}
                  onChange={(e) => handleNumberChange('total_liabilities', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Liabilities
                </label>
                <input
                  type="number"
                  value={formData.current_liabilities}
                  onChange={(e) => handleNumberChange('current_liabilities', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Total Debt (Short+Long)
                </label>
                <input
                  type="number"
                  value={formData.debt}
                  onChange={(e) => handleNumberChange('debt', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Retained Earnings
                </label>
                <input
                  type="number"
                  value={formData.retained_earnings}
                  onChange={(e) => handleNumberChange('retained_earnings', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Stockholders' Equity
                </label>
                <input
                  type="number"
                  value={formData.equity}
                  onChange={(e) => handleNumberChange('equity', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Cash Flow */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
              5. Cash Flow Statement ($ USD)
            </h3>
            <div className="max-w-md">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Net Cash Flow from Operating Activities
              </label>
              <input
                type="number"
                value={formData.operating_cash_flow}
                onChange={(e) => handleNumberChange('operating_cash_flow', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-sky-500/25 transition-all flex items-center gap-2.5 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Evaluating ML Model...' : 'Run Financial Distress Analysis'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: CSV Upload View */}
      {activeTab === 'csv' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-8 space-y-6">
          <div className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-3xl p-10 text-center transition-colors">
            <FileSpreadsheet className="w-12 h-12 text-sky-400 mx-auto" />
            <h3 className="mt-4 text-base font-bold text-white">Upload Financial Statement CSV</h3>
            <p className="mt-1.5 text-xs text-slate-400 max-w-md mx-auto">
              Upload standard format CSV containing income statements, balance sheets, and cash flow items.
            </p>

            <label className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold cursor-pointer transition-all shadow-lg shadow-sky-500/20">
              <UploadCloud className="w-4 h-4" />
              <span>Choose CSV File</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {isUploading && (
            <div className="text-center text-xs text-sky-400 animate-pulse">
              Parsing and validating tabular CSV records...
            </div>
          )}

          {uploadError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {uploadError}
            </div>
          )}

          {csvResults && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Processed Records ({csvResults.valid_count} Valid, {csvResults.error_count} Errors)
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Company</th>
                      <th className="p-3">Revenue</th>
                      <th className="p-3">Assets</th>
                      <th className="p-3">Probability</th>
                      <th className="p-3">Risk Band</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                    {csvResults.results.map((item: any, idx: number) => {
                      const fin = item.financial_data;
                      const pred = item.prediction;
                      return (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-white">{fin.company_name}</td>
                          <td className="p-3 font-mono text-slate-300">${(fin.revenue / 1000000).toFixed(1)}M</td>
                          <td className="p-3 font-mono text-slate-300">${(fin.total_assets / 1000000).toFixed(1)}M</td>
                          <td className="p-3 font-mono font-bold text-white">{(pred.probability * 100).toFixed(1)}%</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                pred.risk_band === 'LOW'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : pred.risk_band === 'MEDIUM'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {pred.risk_band}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleSelectCsvRecord(fin)}
                              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-all"
                            >
                              Open Analysis
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
