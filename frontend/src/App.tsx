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

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'none' | 'login' | 'register'>('none');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

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

  if (authView === 'login') {
    return (
      <LoginPage
        onSuccess={() => setAuthView('none')}
        onGoToRegister={() => setAuthView('register')}
        onContinueAsGuest={() => setAuthView('none')}
      />
    );
  }

  if (authView === 'register') {
    return (
      <RegisterPage
        onSuccess={() => setAuthView('none')}
        onGoToLogin={() => setAuthView('login')}
        onContinueAsGuest={() => setAuthView('none')}
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
