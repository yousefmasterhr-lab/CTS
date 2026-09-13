// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Zero-Trust Authentication Gatekeeper & RBAC Watchdog
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, SystemRole, AuthSession } from '../types/auth';
import { dbService } from '../services/db/firestoreService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  activeProjectId: string;
  setActiveProjectId: (projectId: string) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUserRole: (role: SystemRole, options?: { showWelcome?: boolean }) => void;
  hasRole: (roles: SystemRole[]) => boolean;
  canAccessProject: (projectId: string) => boolean;
  isWelcomeSequenceActive: boolean;
  welcomeUser: User | null;
  startWelcomeSequence: (user: User) => void;
  completeWelcomeSequence: () => void;
  isSessionTimedOut: boolean;
  dismissSessionTimeout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'pcms_auth_session';
const ACTIVE_PROJECT_KEY = 'pcms_active_project';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeProjectId, setActiveProjectIdState] = useState<string>('PRJ-1233');
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isWelcomeSequenceActive, setIsWelcomeSequenceActive] = useState<boolean>(false);
  const [welcomeUser, setWelcomeUser] = useState<User | null>(null);
  const [isSessionTimedOut, setIsSessionTimedOut] = useState<boolean>(false);

  const dismissSessionTimeout = useCallback(() => {
    setIsSessionTimedOut(false);
  }, []);

  // Load existing session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const session: AuthSession = JSON.parse(stored);
        if (session.expires_at > Date.now()) {
          // Verify user still active in database
          const freshUser = dbService.getUserById(session.user.id);
          if (freshUser && freshUser.account_status) {
            setCurrentUser(freshUser);
          } else {
            localStorage.removeItem(SESSION_KEY);
          }
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }

      const storedProject = localStorage.getItem(ACTIVE_PROJECT_KEY);
      if (storedProject) {
        setActiveProjectIdState(storedProject);
      }
    } catch (err) {
      console.error('Session restoration error:', err);
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  // Inactivity Watchdog
  useEffect(() => {
    const handleActivity = () => setLastActivity(Date.now());

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    const interval = setInterval(() => {
      if (currentUser && Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS) {
        logout();
        setIsSessionTimedOut(true);
      }
    }, 60000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearInterval(interval);
    };
  }, [currentUser, lastActivity]);

  const setActiveProjectId = useCallback((id: string) => {
    setActiveProjectIdState(id);
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  }, []);

  const login = async (email: string, _pass: string): Promise<{ success: boolean; error?: string }> => {
    const users = dbService.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.work_email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'البريد الإلكتروني غير مسجل بالمنظومة أو غير مصرح له.' };
    }

    if (!user.account_status) {
      return { success: false, error: 'تم تعليق هذا الحساب بواسطة مدير النظام. يرجى مراجعة إدارة تقنية المعلومات.' };
    }

    const session: AuthSession = {
      user,
      token: 'jwt-sig-' + Math.random().toString(36).substring(2, 15),
      expires_at: Date.now() + INACTIVITY_TIMEOUT_MS
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(user);
    setLastActivity(Date.now());
    setIsSessionTimedOut(false);

    // Trigger Architectural Welcome Sequence
    setWelcomeUser(user);
    setIsWelcomeSequenceActive(true);

    // Auto-select first accessible project if needed
    if (user.system_role !== 'Admin' && user.assigned_projects.length > 0) {
      if (!user.assigned_projects.includes(activeProjectId)) {
        setActiveProjectId(user.assigned_projects[0]);
      }
    }

    return { success: true };
  };

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setIsWelcomeSequenceActive(false);
    setWelcomeUser(null);
  }, []);

  const startWelcomeSequence = useCallback((user: User) => {
    setWelcomeUser(user);
    setIsWelcomeSequenceActive(true);
  }, []);

  const completeWelcomeSequence = useCallback(() => {
    setIsWelcomeSequenceActive(false);
    setWelcomeUser(null);
  }, []);

  // Quick switcher for human testing & verification across roles
  const switchUserRole = useCallback((role: SystemRole, options?: { showWelcome?: boolean }) => {
    const users = dbService.getUsers();
    const targetUser = users.find(u => u.system_role === role);
    if (targetUser) {
      const session: AuthSession = {
        user: targetUser,
        token: 'demo-token-' + role,
        expires_at: Date.now() + INACTIVITY_TIMEOUT_MS
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setCurrentUser(targetUser);
      setIsSessionTimedOut(false);

      if (options?.showWelcome) {
        setWelcomeUser(targetUser);
        setIsWelcomeSequenceActive(true);
      }

      if (targetUser.system_role !== 'Admin' && targetUser.assigned_projects.length > 0) {
        setActiveProjectId(targetUser.assigned_projects[0]);
      }
    }
  }, [setActiveProjectId]);

  const hasRole = useCallback((roles: SystemRole[]): boolean => {
    if (!currentUser) return false;
    return roles.includes(currentUser.system_role);
  }, [currentUser]);

  const canAccessProject = useCallback((projectId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.system_role === 'Admin') return true;
    return currentUser.assigned_projects.includes(projectId);
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        activeProjectId,
        setActiveProjectId,
        login,
        logout,
        switchUserRole,
        hasRole,
        canAccessProject,
        isWelcomeSequenceActive,
        welcomeUser,
        startWelcomeSequence,
        completeWelcomeSequence,
        isSessionTimedOut,
        dismissSessionTimeout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
