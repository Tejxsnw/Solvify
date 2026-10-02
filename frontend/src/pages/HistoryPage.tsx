import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { AnalysisRecord } from '../types';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  ExternalLink,
  GitCompare,
  Calendar,
  Building2,
  Download
} from 'lucide-react';

interface HistoryPageProps {
  onSelectAnalysis: (record: AnalysisRecord) => void;
  onCompareSelect: (selectedIds: string[]) => void;
  onDownloadReport: (analysisId: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onSelectAnalysis,
  onCompareSelect,
  onDownloadReport,
}) => {
  const { history, refreshHistory } = useAnalysis();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = history.filter((item) =>
    item.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this saved analysis?')) return;

    setDeletingId(id);
    try {
      await api.deleteAnalysis(id);
      await refreshHistory();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <HistoryIcon className="w-6 h-6 text-sky-400" />
            Saved Analysis History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access past company distress evaluations, compare metrics, and export executive PDF dossiers.
          </p>
        </div>

        {selectedIds.length >= 2 && (
          <button
            onClick={() => onCompareSelect(selectedIds)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 hover:opacity-90 transition-all"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Selected ({selectedIds.length})</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by company name..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Analyses Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
          No saved analyses matching your criteria.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4 w-10">
                  <span className="sr-only">Select</span>
                </th>
                <th className="p-4">Company</th>
                <th className="p-4">Period</th>
                <th className="p-4">Health Score</th>
                <th className="p-4">Risk Probability</th>
                <th className="p-4">Risk Band</th>
                <th className="p-4">Date Evaluated</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((record) => {
                const isSelected = selectedIds.includes(record.id);
                return (
                  <tr
                    key={record.id}
                    onClick={() => onSelectAnalysis(record)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(record.id)}
                        className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500"
                      />
                    </td>
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-sky-400" />
                      {record.company_name}
                    </td>
                    <td className="p-4 text-slate-300 font-mono">FY {record.financial_year}</td>
                    <td className="p-4 font-mono font-bold text-sky-400">{record.health_score} / 100</td>
                    <td className="p-4 font-mono font-bold text-white">
                      {(record.risk_probability * 100).toFixed(1)}%
                    </td>
                    <td className="p-4">
                      <RiskBadge band={record.risk_band} size="sm" />
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(record.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onDownloadReport(record.id)}
                          title="Generate PDF Report"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(record.id, e)}
                          disabled={deletingId === record.id}
                          title="Delete Analysis"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
