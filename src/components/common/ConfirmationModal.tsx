// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Architectural Confirmation Modal Component
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Info, X, Check } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد الإجراء',
  cancelText = 'إلغاء',
  variant = 'danger',
  isLoading = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  const variantConfig = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-rose-400" />,
      glow: 'from-rose-500/20 via-rose-500/5 to-transparent',
      borderColor: 'border-rose-500/30',
      iconBg: 'bg-rose-500/15 border-rose-500/30',
      confirmButton: 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-900/40 border border-rose-500/40'
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
      glow: 'from-amber-500/20 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/30',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      confirmButton: 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg shadow-amber-900/40 border border-amber-500/40'
    },
    info: {
      icon: <Info className="w-6 h-6 text-sky-400" />,
      glow: 'from-sky-500/20 via-sky-500/5 to-transparent',
      borderColor: 'border-sky-500/30',
      iconBg: 'bg-sky-500/15 border-sky-500/30',
      confirmButton: 'bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white shadow-lg shadow-sky-900/40 border border-sky-500/40'
    }
  }[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={isLoading ? undefined : onClose}
            className="fixed inset-0 bg-[#070D18]/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full max-w-md bg-[#0F172A] border ${variantConfig.borderColor} text-white rounded-3xl shadow-2xl shadow-black/80 overflow-hidden z-10`}
          >
            {/* Ambient Top Glow Line */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${variantConfig.glow}`} />

            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                {/* Icon Container with subtle pulse */}
                <div className={`shrink-0 w-12 h-12 rounded-2xl ${variantConfig.iconBg} border flex items-center justify-center shadow-md`}>
                  {variantConfig.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {message}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="shrink-0 p-1.5 rounded-xl border border-slate-700/60 bg-slate-800/40 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-7 flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all shadow-sm"
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${variantConfig.confirmButton} disabled:opacity-50 cursor-pointer`}
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{confirmText}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
