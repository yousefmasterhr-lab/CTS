// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Architectural Toast & Notification System
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface NotificationContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message?: string, type: ToastType = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, title, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => showToast(title, message, 'success'), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast(title, message, 'error'), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast(title, message, 'warning'), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast(title, message, 'info'), [showToast]);

  // Global custom event listener for intercepted native dialogs
  React.useEffect(() => {
    const handleSystemAlert = (event: Event) => {
      const customEv = event as CustomEvent<{ title?: string; message: string; type?: ToastType }>;
      if (customEv.detail) {
        showToast(
          customEv.detail.title || 'تنبيه من المنظومة',
          customEv.detail.message,
          customEv.detail.type || 'warning'
        );
      }
    };

    window.addEventListener('pcms:system-alert', handleSystemAlert);
    return () => window.removeEventListener('pcms:system-alert', handleSystemAlert);
  }, [showToast]);

  return (
    <NotificationContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Floating Toast Portal */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md ${
                t.type === 'success' 
                  ? 'bg-[#0F172A]/95 text-white border-[#A7CCB5]/40 shadow-[#A7CCB5]/10' 
                  : t.type === 'error'
                  ? 'bg-[#0F172A]/95 text-white border-[#E11D48]/40 shadow-[#E11D48]/10'
                  : t.type === 'warning'
                  ? 'bg-[#0F172A]/95 text-white border-[#F59E0B]/40 shadow-[#F59E0B]/10'
                  : 'bg-[#0F172A]/95 text-white border-[#8097AE]/40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#A7CCB5]" />}
                {t.type === 'error' && <XCircle className="w-5 h-5 text-[#E11D48]" />}
                {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-[#005B96]" />}
              </div>

              <div className="flex-1 text-sm">
                <p className="font-semibold">{t.title}</p>
                {t.message && <p className="text-xs text-[#8097AE] mt-0.5 leading-relaxed">{t.message}</p>}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-[#8097AE] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
