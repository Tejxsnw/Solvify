import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { api } from '../services/api';
import { FileText, Download, Sparkles, CheckCircle, RefreshCw, Eye } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { currentAnalysis, history } = useAnalysis();
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [reportDetails, setReportDetails] = useState<any>(null);

  const targetAnalysis = currentAnalysis || history[0];

  const handleGenerate = async () => {
    if (!targetAnalysis) return;
    setIsGenerating(true);
    setDownloadUrl(null);
    try {
      const res = await api.generateReport(targetAnalysis.id);
      setReportDetails(res);
      setDownloadUrl(api.getDownloadReportUrl(res.report_id));
    } catch (e) {
      console.error('Report error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!targetAnalysis) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        No analyses found to generate reports for. Please create an analysis first.
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-sky-400" />
          Executive Financial Dossiers & PDF Exports
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Server-side ReportLab document synthesis including statement snapshots, calibrated ML probabilities, factor spectrums, and action plans.
        </p>
      </div>

      {/* Generation Card */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Active Corporate Dossier
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              {targetAnalysis.company_name} (FY {targetAnalysis.financial_year})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Risk: <span className="font-bold text-white">{(targetAnalysis.risk_probability * 100).toFixed(1)}%</span> | Band: <span className="font-bold text-white">{targetAnalysis.risk_band}</span>
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2.5 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Compiling Vector PDF...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Executive PDF</span>
              </>
            )}
          </button>
        </div>

        {downloadUrl && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Executive PDF Ready for Download</p>
                <p className="text-xs text-slate-400">
                  Size: {reportDetails?.file_size_kb || 24} KB • Generated successfully
                </p>
              </div>
            </div>

            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF File</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
