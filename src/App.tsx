// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Root Coordinator & Zero-Trust Authentication Barrier
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { LoginPortal } from './components/auth/LoginPortal';
import { AppLayout } from './components/layout/AppLayout';
import { ArchitecturalWelcomeSequence } from './components/auth/ArchitecturalWelcomeSequence';
import { SessionTimeoutModal } from './components/auth/SessionTimeoutModal';

const AppContent: React.FC = () => {
  const { 
    isAuthenticated, 
    isWelcomeSequenceActive, 
    welcomeUser, 
    completeWelcomeSequence,
    isSessionTimedOut,
    dismissSessionTimeout
  } = useAuth();

  return (
    <>
      {!isAuthenticated ? (
        <LoginPortal />
      ) : isWelcomeSequenceActive && welcomeUser ? (
        <ArchitecturalWelcomeSequence
          user={welcomeUser}
          onComplete={completeWelcomeSequence}
          durationSeconds={5}
        />
      ) : (
        <AppLayout />
      )}

      {/* Luxury In-App Inactivity Security Lock Modal */}
      <SessionTimeoutModal
        isOpen={isSessionTimedOut}
        onClose={dismissSessionTimeout}
      />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </LanguageProvider>
  );
};

export default App;
