import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_ID = rawClientId.trim().replace(/^["']|["']$/g, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'solvify-placeholder-client-id'}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
