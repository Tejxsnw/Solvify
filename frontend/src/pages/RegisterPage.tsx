import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Activity, Lock, Mail, User, ArrowRight, Zap } from 'lucide-react';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

interface RegisterPageProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
  onContinueAsGuest: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onGoToLogin, onContinueAsGuest }) => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.register(name, email, password);
      login(res.access_token, res.user);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setError(null);
    setIsDemoLoading(true);
    try {
      const res = await api.demoLogin();
      login(res.access_token, res.user);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo access failed');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl bg-slate-900/80 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 p-0.5 mx-auto shadow-lg shadow-sky-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mt-4">Create Solvify Account</h2>
          <p className="text-xs text-slate-400 mt-1">Join the enterprise financial intelligence network</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* 1-Click Fast Google Sign-in */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Fast 1-Click Sign Up
          </label>
          <GoogleSignInButton
            text="signup_with"
            label="Sign up with Google"
            onSuccess={onSuccess}
            onError={(err) => setError(err)}
          />
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-[#0b101e] px-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider shrink-0">
            or with email
          </span>
          <div className="border-t border-slate-800 w-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@enterprise.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isDemoLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-3 text-center text-xs">
          <p className="text-slate-400">
            Already have an account?{' '}
            <button onClick={onGoToLogin} className="text-sky-400 font-semibold hover:underline">
              Sign In
            </button>
          </p>

          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isLoading || isDemoLoading}
            className="w-full py-2 px-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/90 text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isDemoLoading ? 'Loading Demo...' : 'Instant Demo Analyst Access (No Sign-up)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

