import React, { createContext, useContext, useState, useEffect } from 'react';
import { FinancialInput, PredictionResult, AnalysisRecord } from '../types';
import { DEMO_COMPANIES } from '../data/demoData';
import { api } from '../services/api';

interface AnalysisContextType {
  currentInput: FinancialInput;
  setCurrentInput: (input: FinancialInput) => void;
  currentResult: PredictionResult | null;
  setCurrentResult: (result: PredictionResult | null) => void;
  currentAnalysis: AnalysisRecord | null;
  setCurrentAnalysis: (analysis: AnalysisRecord | null) => void;
  history: AnalysisRecord[];
  refreshHistory: () => Promise<void>;
  runAnalysis: (input: FinancialInput, save?: boolean) => Promise<PredictionResult>;
  loadDemoCompany: (companyIndex: number) => void;
  isAnalyzing: boolean;
  error: string | null;
  setError: (err: string | null) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentInput, setCurrentInput] = useState<FinancialInput>(DEMO_COMPANIES[0]);
  const [currentResult, setCurrentResult] = useState<PredictionResult | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisRecord | null>(null);
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshHistory = async () => {
    try {
      const records = await api.getAnalyses();
      setHistory(records);
    } catch (e) {
      console.warn('Could not fetch analyses history:', e);
    }
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const runAnalysis = async (input: FinancialInput, save: boolean = true): Promise<PredictionResult> => {
    setIsAnalyzing(true);
    setError(null);
    try {
      if (save) {
        const record = await api.createAnalysis(input, true);
        setCurrentAnalysis(record);
        const result: PredictionResult = {
          probability: record.risk_probability,
          risk_band: record.risk_band,
          model_name: record.model_name,
          model_version: record.model_version,
          ratios: record.ratios,
          top_factors: record.explanation,
          recommendations: record.recommendations,
          health_score: record.health_score,
        };
        setCurrentResult(result);
        setCurrentInput(input);
        await refreshHistory();
        return result;
      } else {
        const result = await api.predict(input);
        setCurrentResult(result);
        setCurrentInput(input);
        return result;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete analysis');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadDemoCompany = (companyIndex: number) => {
    const selected = DEMO_COMPANIES[companyIndex % DEMO_COMPANIES.length];
    setCurrentInput({ ...selected });
  };

  return (
    <AnalysisContext.Provider
      value={{
        currentInput,
        setCurrentInput,
        currentResult,
        setCurrentResult,
        currentAnalysis,
        setCurrentAnalysis,
        history,
        refreshHistory,
        runAnalysis,
        loadDemoCompany,
        isAnalyzing,
        error,
        setError,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error('useAnalysis must be used within an AnalysisProvider');
  return context;
};
