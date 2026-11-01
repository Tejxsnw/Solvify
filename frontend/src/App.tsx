import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnalysisProvider, useAnalysis } from './context/AnalysisContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { FinancialHealthPage } from './pages/FinancialHealthPage';
import { ExplainabilityPage } from './pages/ExplainabilityPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { HistoryPage } from './pages/HistoryPage';
import { ComparePage } from './pages/ComparePage';
import { ReportsPage } from './pages/ReportsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AnalysisRecord } from './types';
import { Activity } from 'lucide-react';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { setCurrentAnalysis, setCurrentInput, setCurrentResult } = useAnalysis();

  const handleSelectAnalysis = (record: AnalysisRecord) => {
    setCurrentAnalysis(record);
    setCurrentInput(record.input_snapshot);
    setCurrentResult({
      probability: record.risk_probability,
      risk_band: record.risk_band,
      model_name: record.model_name,
      model_version: record.model_version,
      ratios: record.ratios,
      top_factors: record.explanation,
      recommendations: record.recommendations,
      health_score: record.health_score,
    });
    setActiveTab('dashboard');
  };

  const handleCompareSelect = (selectedIds: string[]) => {
    setCompareIds(selectedIds);
    setActiveTab('compare');
  };

  // Loading spinner while checking existing token
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#060913]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-sky-500/30 flex items-center justify-center animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-semibold tracking-wide">Loading Solvify…</p>
        </div>
      </div>
    );
  }

  // Show landing page
  if (showLanding) {
    return (
      <LandingPage
        onGetStarted={() => setShowLanding(false)}
        onLogin={() => {
          setShowLanding(false);
          setAuthView('login');
        }}
      />
    );
  }

  // Gate: show login/register if not authenticated
  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onSuccess={() => {}}
          onGoToLogin={() => setAuthView('login')}
          onContinueAsGuest={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginPage
        onSuccess={() => {}}
        onGoToRegister={() => setAuthView('register')}
        onContinueAsGuest={() => setAuthView('login')}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#060913] text-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
        }}
        openAiChat={() => setIsAiDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Header
          onOpenAiChat={() => setIsAiDrawerOpen(true)}
          onExportPdf={() => setActiveTab('reports')}
        />

        <main className="flex-1 pb-16">
          {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
          {activeTab === 'analyze' && (
            <AnalyzePage onAnalysisSuccess={() => setActiveTab('dashboard')} />
          )}
          {activeTab === 'health' && <FinancialHealthPage />}
          {activeTab === 'explainability' && <ExplainabilityPage />}
          {activeTab === 'recommendations' && <RecommendationsPage />}
          {activeTab === 'whatif' && <WhatIfPage />}
          {activeTab === 'history' && (
            <HistoryPage
              onSelectAnalysis={handleSelectAnalysis}
              onCompareSelect={handleCompareSelect}
              onDownloadReport={(id) => {
                setActiveTab('reports');
              }}
            />
          )}
          {activeTab === 'compare' && (
            <ComparePage
              selectedIds={compareIds}
              onBack={() => setActiveTab('history')}
            />
          )}
          {activeTab === 'reports' && <ReportsPage />}
        </main>
      </div>

      {/* AI Assistant Context Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <MainApp />
      </AnalysisProvider>
    </AuthProvider>
  );
}
