// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Application Bootstrap Entrypoint
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeNativeDialogGuard } from './utils/nativeDialogGuard';

// Intercept any native browser popups to ensure custom in-app design
initializeNativeDialogGuard();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
