import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="78747023362-osgh78ror5htvtrgdtlj2pnfpi040fuf.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);