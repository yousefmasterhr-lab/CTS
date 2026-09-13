// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Architectural Inactivity Security Lock & Session Timeout Modal
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Clock, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../../assets/BrandLogo';

export interface SessionTimeoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
          {/* 1. Deep Atmospheric Backdrop with CAD Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#070D18]/85 backdrop-blur-xl"
          />

          {/* Isometric Blueprint Subtle Overlay */}
          <div className="fixed inset-0 bg-cad-isometric opacity-30 pointer-events-none z-[101]" />

          {/* 2. Floating Luxury Security Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-[#0F172A] border border-[#8097AE]/30 text-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden z-[102]"
          >
            {/* Ambient Cyan/Amber Horizon Scanner Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-sky-400 to-[#A7CCB5]" />

            <div className="p-7 sm:p-8 flex flex-col items-center text-center">
              {/* Logo / Pulsing Shield Reticle */}
              <div className="relative mb-6 flex items-center justify-center">
                {/* Pulsing Light Wave */}
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-24 h-24 rounded-full bg-amber-500/20 blur-xl pointer-events-none"
                />

                {/* Outer Rotating Dotted Reticle */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 rounded-full border border-dashed border-amber-400/40 flex items-center justify-center p-2"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-inner">
                    <ShieldAlert className="w-8 h-8 text-amber-400" />
                  </div>
                </motion.div>
              </div>

              {/* Security Pill Tag */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-3 shadow-sm">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>بروتوكول الأمان الفوري • PCMS Zero-Trust</span>
              </div>

              {/* Headline */}
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 leading-snug">
                انتهت صلاحية الجلسة • قفل الشاشة التلقائي
              </h2>

              {/* Explanatory Body */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mb-6">
                تم إنهاء الجلسة وقفل الشاشة تلقائياً نظراً لعدم رصد أي نشاط لفترة من الوقت، وذلك لحماية خصوصية وسرية المراسلات والوثائق الهندسية المعتمدة.
              </p>

              {/* Information Telemetry Matrix */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-[#1E293B]/70 border border-[#334155]/80 text-right mb-6 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>السبب: خمول الشاشة للحماية</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#A7CCB5] shrink-0" />
                  <span>البيانات: محفوظة ومؤمنة بالكامل</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#005B96] to-[#004270] hover:from-[#006bb3] hover:to-[#005B96] text-white font-semibold text-sm shadow-lg shadow-[#005B96]/30 border border-[#38BDF8]/40 hover:border-[#38BDF8] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>تسجيل الدخول مجدداً للاستئناف</span>
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#A7CCB5]" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
