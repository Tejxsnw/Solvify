import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  Activity,
  Lightbulb,
  Sliders,
  History,
  GitCompare,
  FileText,
  Bot,
  ShieldCheck,
  Building2,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAiChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, openAiChat }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Company', icon: Calculator },
    { id: 'health', label: 'Financial Health', icon: Activity },
    { id: 'explainability', label: 'Explainability', icon: ShieldCheck },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'whatif', label: 'What-If Simulator', icon: Sliders },
    { id: 'history', label: 'Saved Analyses', icon: History },
    { id: 'compare', label: 'Compare Companies', icon: GitCompare },
    { id: 'reports', label: 'PDF Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 backdrop-blur-xl z-20">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Activity className="w-5 h-5 text-sky-400" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
            SOLVIFY <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono">AI</span>
          </h1>
          <p className="text-[11px] text-slate-400">Risk & Distress Analytics</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-md shadow-sky-500/5'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="pt-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Intelligent Copilot
        </div>
        <button
          onClick={openAiChat}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all group"
        >
          <div className="flex items-center gap-3">
            <Bot className="w-4 h-4 text-purple-400 group-hover:rotate-6 transition-transform" />
            <span>AI Risk Assistant</span>
          </div>
          <span className="text-[10px] bg-purple-400/20 px-1.5 py-0.5 rounded text-purple-300 font-mono">Live</span>
        </button>
      </div>

      {/* User / Auth Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        {user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-semibold text-white truncate w-28">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate w-28">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Log Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
