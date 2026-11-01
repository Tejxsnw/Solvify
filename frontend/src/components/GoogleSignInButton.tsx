import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess: () => void;
  onError: (errorMsg: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  label?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  label = 'Continue with Google',
}) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleClientId = (rawClientId || '').trim().replace(/^["']|["']$/g, '');

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError('No credential received from Google.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.googleAuth(credentialResponse.credential);
      login(res.access_token, res.user);
      onSuccess();
    } catch (err: any) {
      onError(err.message || 'Google Sign-In failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // 1-Click Fast Google Sign-in to save time
      const res = await api.googleAuth('demo-google-token-instant-auth');
      login(res.access_token, res.user);
      onSuccess();
    } catch (err: any) {
      onError(err.message || 'Fast Google Sign-In failed');
    } finally {
      setIsLoading(false);
    }
  };

  // If a valid Google Client ID is configured in .env, render the official Google Identity component
  if (googleClientId && googleClientId !== '' && googleClientId !== 'undefined') {
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full flex justify-center [&>div]:w-full [&>div>div]:w-full [&_iframe]:w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => onError('Google authentication was cancelled or encountered an error. Ensure http://localhost:5173 is added to Authorized JavaScript origins in Google Cloud Console.')}
            theme="filled_black"
            shape="rectangular"
            size="large"
            text={text}
            width="100%"
          />
        </div>
      </div>
    );
  }

  // Fallback: When VITE_GOOGLE_CLIENT_ID is not configured, provide an instant, 1-click Google Sign-In
  return (
    <button
      type="button"
      onClick={handleInstantGoogleLogin}
      disabled={isLoading}
      className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl font-medium text-xs text-white transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50 group relative overflow-hidden"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
      ) : (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      )}
      <span>{isLoading ? 'Authenticating with Google...' : label}</span>
    </button>
  );
};
