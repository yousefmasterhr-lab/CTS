// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Architectural CAD Holographic Welcome Sequence (Refined & Balanced)
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../../types/auth';
import { BrandLogo } from '../../assets/BrandLogo';
import { 
  ArrowLeft, 
  Compass, 
  CheckCircle2, 
  Terminal
} from 'lucide-react';

interface ArchitecturalWelcomeSequenceProps {
  user: User;
  onComplete: () => void;
  durationSeconds?: number;
}

export const ArchitecturalWelcomeSequence: React.FC<ArchitecturalWelcomeSequenceProps> = ({
  user,
  onComplete,
  durationSeconds = 5
}) => {
  const [progress, setProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // Friendly Arabic Role Labels
  const roleDisplayNames: Record<string, { title: string; badgeColor: string; icon: string }> = {
    Admin: { title: 'مدير عام المنظومة (Super Admin)', badgeColor: 'border-amber-400/40 bg-amber-500/10 text-amber-300', icon: '👑' },
    Doc_Controller: { title: 'مراقب المستندات والأرشيف المركزي', badgeColor: 'border-sky-400/40 bg-sky-500/10 text-sky-300', icon: '📑' },
    Project_Manager: { title: 'مدير المشروع والإشراف الهندسي', badgeColor: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300', icon: '👔' },
    Engineer: { title: 'مهندس المكتب الفني والدراسات', badgeColor: 'border-indigo-400/40 bg-indigo-500/10 text-indigo-300', icon: '📐' },
    Viewer: { title: 'مدقق ومستعرض معتمد', badgeColor: 'border-purple-400/40 bg-purple-500/10 text-purple-300', icon: '🔍' },
  };

  const roleInfo = roleDisplayNames[user.system_role] || { 
    title: user.system_role, 
    badgeColor: 'border-slate-400/40 bg-slate-500/10 text-slate-300', 
    icon: '👤' 
  };

  // 5-Second Telemetry Step Messages
  const getTelemetryMessage = (p: number) => {
    if (p < 25) return 'فك تشفير بروتوكول الأمان وتأكيد الهوية...';
    if (p < 60) return 'مزامنة سجل المراسلات والمشاريع النشطة...';
    if (p < 85) return 'تجهيز الصلاحيات ومساحة العمل الهندسية...';
    return 'اكتملت التهيئة بنجاح • مرحباً بك في المنظومة...';
  };

  // Optional Gentle Sci-Fi Harmonic Chime via Native Web Audio API
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      }
    } catch {
      // Graceful fallback if audio is blocked or unsupported
    }
  }, []);

  // Smooth Progress Timer over 5000ms
  useEffect(() => {
    const totalMs = durationSeconds * 1000;
    const intervalMs = 40;
    const stepIncrement = (intervalMs / totalMs) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + stepIncrement;
        if (next >= 100) {
          clearInterval(timer);
          handleFinish();
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [durationSeconds]);

  const handleFinish = () => {
    if (isFinishing) return;
    setIsFinishing(true);
    setTimeout(() => {
      onComplete();
    }, 350); // 350ms graceful fade-out
  };

  return (
    <AnimatePresence>
      <motion.div
        key="architectural-welcome"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#070D18] text-white overflow-hidden select-none"
      >
        {/* ================================================================ */}
        {/* 1. CAD BLUEPRINT ISOMETRIC GRID & SOFT AMBIENCE                  */}
        {/* ================================================================ */}
        <div className="absolute inset-0 bg-cad-isometric opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#005B96]/20 via-[#070D18]/85 to-[#070D18] pointer-events-none" />

        {/* ================================================================ */}
        {/* 2. CLEAN TOP BAR (SYSTEM BRANDING & SKIP BUTTON)                 */}
        {/* ================================================================ */}
        <div className="w-full pt-8 px-8 sm:px-12 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#A7CCB5] bg-[#A7CCB5]/10 px-3.5 py-1.5 rounded-full border border-[#A7CCB5]/30 flex items-center gap-2 shadow-sm">
              <Compass className="w-3.5 h-3.5 text-[#A7CCB5] animate-spin" style={{ animationDuration: '10s' }} />
              <span>منظومة إدارة وتوثيق المراسلات الهندسية (PCMS)</span>
            </span>
          </div>

          <button
            onClick={handleFinish}
            className="text-xs text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl border border-slate-700/80 hover:border-slate-500 bg-[#0F172A]/80 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
          >
            <span>تخطي والدخول فوراً</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ================================================================ */}
        {/* 3. CENTERPIECE: BALANCED LOGO + COMPASS + WELCOME CREDENTIALS     */}
        {/* ================================================================ */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 max-w-2xl w-full">
          {/* Constrained Container for Logo and Rotating Rings to prevent overlap */}
          <div className="relative w-52 h-52 flex items-center justify-center mb-6">
            {/* Outer Rotating Architectural Ring */}
            <motion.svg
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              className="absolute w-48 h-48 sm:w-52 sm:h-52 pointer-events-none text-sky-500/30"
              viewBox="0 0 200 200"
            >
              <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 6" />
              <circle cx="100" cy="100" r="82" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
              {/* Clean Cardinal Ticks */}
              <line x1="100" y1="4" x2="100" y2="14" stroke="#A7CCB5" strokeWidth="2" />
              <line x1="100" y1="186" x2="100" y2="196" stroke="#A7CCB5" strokeWidth="2" />
              <line x1="4" y1="100" x2="14" y2="100" stroke="#A7CCB5" strokeWidth="2" />
              <line x1="186" y1="100" x2="196" y2="100" stroke="#A7CCB5" strokeWidth="2" />
            </motion.svg>

            {/* Inner Counter-Rotating Reticle */}
            <motion.svg
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute w-36 h-36 sm:w-40 sm:h-40 pointer-events-none text-[#A7CCB5]/35"
              viewBox="0 0 160 160"
            >
              <circle cx="80" cy="80" r="72" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 8" />
              <rect x="76" y="4" width="8" height="8" fill="none" stroke="#A7CCB5" strokeWidth="1.5" />
              <rect x="76" y="148" width="8" height="8" fill="none" stroke="#A7CCB5" strokeWidth="1.5" />
              <rect x="4" y="76" width="8" height="8" fill="none" stroke="#A7CCB5" strokeWidth="1.5" />
              <rect x="148" y="76" width="8" height="8" fill="none" stroke="#A7CCB5" strokeWidth="1.5" />
            </motion.svg>

            {/* Soft Ambient Radial Light */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.65, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-sky-500/25 to-emerald-500/20 blur-xl pointer-events-none"
            />

            {/* The Core Brand Logo Box */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: 'spring', 
                stiffness: 110, 
                damping: 14,
                duration: 0.7 
              }}
              className="relative z-10 p-4 rounded-2xl bg-[#0F172A]/90 border border-[#8097AE]/30 shadow-[0_0_35px_rgba(0,91,150,0.35)] backdrop-blur-xl"
            >
              <BrandLogo size={68} animated={true} isDark={true} />

              {/* Vertical Laser Horizon Scanner Effect */}
              <motion.div
                animate={{ y: [-30, 70, -30] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#38bdf8] pointer-events-none"
              />
            </motion.div>
          </div>

          {/* ================================================================ */}
          {/* 4. USER GREETING (PROPORTIONAL, EXECUTIVE & SEPARATED)           */}
          {/* ================================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3 mt-2"
          >
            {/* Identity Verified Badge with Comfortable Top Margin */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>تم تأكيد الهوية • تصريح دخول معتمد</span>
            </div>

            {/* User Full Name in Refined, Executive Scale */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-normal">
              <span>مرحباً بك، </span>
              <span className="text-[#A7CCB5] font-extrabold">{user.full_name}</span>
            </h1>

            {/* Department & Role Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border backdrop-blur-sm ${roleInfo.badgeColor}`}>
                <span>{roleInfo.icon}</span>
                <span>{roleInfo.title}</span>
              </span>

              <span className="text-slate-600">•</span>

              <span className="text-xs text-slate-300 font-medium px-3 py-1 rounded-xl bg-[#0F172A]/70 border border-slate-700/60">
                {user.department}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ================================================================ */}
        {/* 5. LIVE TELEMETRY PROGRESS DOCK (CLEAN & CENTERED)               */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full max-w-lg px-6 pb-10 z-10 space-y-2.5"
        >
          {/* Telemetry Stage Label and Ticker */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>{getTelemetryMessage(progress)}</span>
            </span>
            <span className="font-mono font-bold text-sky-400 text-xs">
              {Math.round(progress)}%
            </span>
          </div>

          {/* High-Tech Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-[#0F172A] border border-slate-700/70 overflow-hidden shadow-inner">
            <motion.div
              style={{ width: `${progress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-[#005B96] via-[#38BDF8] to-[#A7CCB5] shadow-[0_0_10px_rgba(56,189,248,0.6)] relative"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
