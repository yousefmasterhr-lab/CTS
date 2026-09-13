// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Zero-Trust Gatekeeper Login Portal
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrandLogo } from '../../assets/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { SystemRole } from '../../types/auth';

export const LoginPortal: React.FC = () => {
  const { login, switchUserRole } = useAuth();
  const [email, setEmail] = useState('admin@hrsup.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await login(email, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'فشل التحقق من الهوية المهنية');
    }
  };

  const handleRoleQuickSelect = (role: SystemRole, defaultEmail: string) => {
    setEmail(defaultEmail);
    setPassword('••••••••');
    switchUserRole(role, { showWelcome: true });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#0F172A] text-white overflow-hidden selection:bg-[#005B96] selection:text-white">
      {/* 1. Isometric CAD Blueprint Grid Background */}
      <div className="absolute inset-0 bg-cad-isometric opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]/80 pointer-events-none" />

      {/* 2. Main Gatekeeper Box */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-[#1E293B]/90 backdrop-blur-2xl border border-[#8097AE]/30 rounded-3xl p-8 shadow-2xl shadow-black/60 relative overflow-hidden"
        >
          {/* Subtle Top Glowing Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#005B96] to-[#A7CCB5]" />

          {/* Logo & Brand Heading */}
          <div className="flex flex-col items-center text-center mb-8">
            <BrandLogo size={68} animated={true} isDark={true} />
            <h1 className="text-2xl font-bold mt-4 tracking-tight text-white flex items-center gap-2">
              منظومة PCMS لإدارة المراسلات
            </h1>
            <p className="text-xs text-[#8097AE] mt-1 font-medium">
              Project Correspondence Management System
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#005B96]/20 border border-[#005B96]/40 text-xs text-[#D8E3E9]">
              <Lock className="w-3.5 h-3.5 text-[#A7CCB5]" />
              <span>بوابة الدخول الموحدة • للمصرح لهم فقط</span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 bg-[#0F172A]/70 border border-[#8097AE]/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#005B96] focus:border-transparent transition-all pr-10"
                />
                <Mail className="w-4 h-4 text-[#8097AE] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#0F172A]/70 border border-[#8097AE]/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#005B96] focus:border-transparent transition-all pr-10"
                />
                <KeyRound className="w-4 h-4 text-[#8097AE] absolute left-3.5 top-3" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-bold tracking-wide text-base shadow-lg shadow-[#005B96]/20"
              rightIcon={<ArrowLeft className="w-4 h-4" />}
            >
              تسجيل الدخول
            </Button>
          </form>

          {/* 3. Fast Role Testing Dock for Human Inspector */}
          <div className="mt-8 pt-6 border-t border-[#8097AE]/20">
            <p className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center justify-between">
              <span>تسجيل دخول سريع بحساب تجريبي:</span>
              <span className="text-[10px] text-[#A7CCB5] font-semibold bg-[#A7CCB5]/10 px-2 py-0.5 rounded">Demo</span>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleRoleQuickSelect('Admin', 'admin@hrsup.com')}
                className="px-2 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#005B96]/30 border border-[#8097AE]/20 text-[11px] font-medium text-slate-200 transition-colors text-right"
              >
                👑 مدير النظام
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickSelect('Doc_Controller', 'dc@hrsup.com')}
                className="px-2 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#005B96]/30 border border-[#8097AE]/20 text-[11px] font-medium text-slate-200 transition-colors text-right"
              >
                📑 مراقب المستندات
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickSelect('Project_Manager', 'pm@hrsup.com')}
                className="px-2 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#005B96]/30 border border-[#8097AE]/20 text-[11px] font-medium text-slate-200 transition-colors text-right"
              >
                👔 مدير المشروع
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickSelect('Engineer', 'eng@hrsup.com')}
                className="px-2 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#005B96]/30 border border-[#8097AE]/20 text-[11px] font-medium text-slate-200 transition-colors text-right"
              >
                📐 مهندس المكتب
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickSelect('Viewer', 'viewer@hrsup.com')}
                className="px-2 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#005B96]/30 border border-[#8097AE]/20 text-[11px] font-medium text-slate-200 transition-colors text-right col-span-2 sm:col-span-1"
              >
                🔍 مدقق خارجي
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4. Portal Footer with Strict Copyright Notice */}
      <div className="py-4 px-6 text-center text-xs text-[#8097AE] border-t border-[#8097AE]/15 bg-[#0F172A]/90 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="font-semibold text-white">
          © 2026 hrsup. All rights reserved.
        </span>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-[#A7CCB5]" />
          <span>اتصال آمن ومشفر للمشاريع الهندسية</span>
        </div>
      </div>
    </div>
  );
};
