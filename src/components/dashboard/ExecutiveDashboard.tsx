// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Executive Dashboard & Advanced Telemetry Analytics Hub
// Eye-Friendly CAD Dark Palette (#0B1120, #0F172A, #1E293B, #005B96, #A7CCB5)
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db/firestoreService';
import { Correspondence } from '../../types/correspondence';
import { 
  Inbox, 
  Send, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  FileText, 
  Building2,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Layers,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { ProjectFilterBar } from '../common/ProjectFilterBar';
import { getDocTypeLabel } from '../../utils/formatters';

interface ExecutiveDashboardProps {
  onNavigateTab: (tab: any) => void;
  onOpenInbound: () => void;
  onOpenOutbound: () => void;
  onSelectDoc: (docId: string) => void;
}

// Telemetry Animated Counter
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 0.8 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalSteps = 30;
    const stepTime = (duration * 1000) / totalSteps;
    const stepIncrement = Math.max(1, Math.ceil((end - start) / totalSteps));

    const timer = setInterval(() => {
      start += stepIncrement;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
};

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onNavigateTab,
  onOpenInbound,
  onOpenOutbound,
  onSelectDoc
}) => {
  const { currentUser, activeProjectId } = useAuth();
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Get raw data from database
  const allProjects = useMemo(() => dbService.getProjects(), []);
  const allCorrespondences = useMemo(() => 
    dbService.getCorrespondences({ user: currentUser || undefined }), 
    [currentUser]
  );

  // Filter correspondences based on active project
  const filteredCorrespondences = useMemo(() => {
    if (!activeProjectId || activeProjectId === 'ALL') {
      return allCorrespondences;
    }
    return allCorrespondences.filter(c => c.project_ref === activeProjectId);
  }, [allCorrespondences, activeProjectId]);

  const activeProject = useMemo(() => {
    if (!activeProjectId || activeProjectId === 'ALL') return null;
    return allProjects.find(p => p.project_id === activeProjectId) || null;
  }, [allProjects, activeProjectId]);

  // KPI Metrics Calculation
  const totalLetters = filteredCorrespondences.length;
  const inboundLetters = filteredCorrespondences.filter(c => c.doc_type === 'Incoming').length;
  const outboundLetters = filteredCorrespondences.filter(c => c.doc_type === 'Outgoing' && !c.is_draft).length;
  const pendingReview = filteredCorrespondences.filter(c => c.status === 'Pending' || c.is_draft).length;
  
  // Overdue SLA items
  const nowTime = new Date().getTime();
  const overdueItems = filteredCorrespondences.filter(c => {
    if (!c.due_date) return false;
    return new Date(c.due_date).getTime() < nowTime && c.status !== 'Replied' && c.status !== 'Closed';
  });

  const repliedInbounds = filteredCorrespondences.filter(c => c.doc_type === 'Incoming' && c.status === 'Replied').length;
  const replyRate = inboundLetters > 0 ? Math.round((repliedInbounds / inboundLetters) * 100) : 100;

  // Resolution Rate
  const resolvedCount = filteredCorrespondences.filter(c => 
    c.status === 'Approved' || c.status === 'Replied' || c.status === 'Closed'
  ).length;
  const resolutionRate = totalLetters > 0 ? Math.round((resolvedCount / totalLetters) * 100) : 100;

  // 1. Monthly Velocity & Flow (Last 6 Months)
  const monthlyTimelineData = useMemo(() => {
    const months = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
    const monthNamesAr: Record<string, string> = {
      '2026-04': 'أبريل',
      '2026-05': 'مايو',
      '2026-06': 'يونيو',
      '2026-07': 'يوليو',
      '2026-08': 'أغسطس',
      '2026-09': 'سبتمبر'
    };

    return months.map(m => {
      const monthLetters = filteredCorrespondences.filter(c => (c.issue_date || '').startsWith(m));
      const incoming = monthLetters.filter(c => c.doc_type === 'Incoming').length;
      const outgoing = monthLetters.filter(c => c.doc_type === 'Outgoing').length;
      return {
        key: m,
        label: monthNamesAr[m] || m,
        incoming,
        outgoing,
        total: incoming + outgoing
      };
    });
  }, [filteredCorrespondences]);

  const maxMonthVal = useMemo(() => {
    const max = Math.max(...monthlyTimelineData.map(d => Math.max(d.incoming, d.outgoing)), 1);
    return Math.max(max, 4); // Minimum baseline for nice chart scaling
  }, [monthlyTimelineData]);

  // 2. Classification Breakdown
  const classificationData = useMemo(() => {
    const counts = {
      letters: filteredCorrespondences.filter(c => c.classification === 'LTR').length,
      approvals: filteredCorrespondences.filter(c => c.classification === 'SUB' || c.classification === 'IPC').length,
      site: filteredCorrespondences.filter(c => c.classification === 'RFI' || c.classification === 'SITE').length,
      memos: filteredCorrespondences.filter(c => c.classification === 'MOM' || c.classification === 'TRANS').length,
    };

    const total = Math.max(totalLetters, 1);
    return [
      {
        id: 'letters',
        label: 'خطابات رسمية وإدارية',
        code: 'LTR',
        count: counts.letters,
        pct: Math.round((counts.letters / total) * 100),
        color: 'from-sky-500 to-blue-600',
        textColor: 'text-sky-400',
        bgColor: 'bg-sky-500/10',
        borderColor: 'border-sky-500/30'
      },
      {
        id: 'approvals',
        label: 'اعتمادات فنية ومستخلصات',
        code: 'SUB / IPC',
        count: counts.approvals,
        pct: Math.round((counts.approvals / total) * 100),
        color: 'from-emerald-400 to-teal-600',
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30'
      },
      {
        id: 'memos',
        label: 'محاضر اجتماعات ومذكرات',
        code: 'MOM / TRANS',
        count: counts.memos,
        pct: Math.round((counts.memos / total) * 100),
        color: 'from-indigo-400 to-purple-600',
        textColor: 'text-indigo-400',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/30'
      },
      {
        id: 'site',
        label: 'استفسارات وملاحظات موقعية',
        code: 'RFI / SITE',
        count: counts.site,
        pct: Math.round((counts.site / total) * 100),
        color: 'from-amber-400 to-orange-500',
        textColor: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30'
      }
    ];
  }, [filteredCorrespondences, totalLetters]);

  // 3. Stakeholders Exchange Analysis
  const stakeholderData = useMemo(() => {
    // Tiers: Owner / Consultant / Contractor
    const groups = [
      {
        id: 'client',
        title: 'جهات الإسناد والمالك',
        subtitle: 'Owner / Client Entities',
        keywords: ['وزارة', 'الهيئة', 'MOI', 'المالك', 'صندوق', 'جهة'],
        icon: Building2,
        color: 'text-sky-400',
        bg: 'bg-sky-500/10 border-sky-500/30'
      },
      {
        id: 'consultant',
        title: 'المكاتب الاستشارية الهندسية',
        subtitle: 'Supervision Consultants',
        keywords: ['استشار', 'CON', 'دار', 'هندسي', 'المكتب'],
        icon: Users,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30'
      },
      {
        id: 'contractor',
        title: 'شركات المقاولات والتنفيذ',
        subtitle: 'General Contractors',
        keywords: ['المقاول', 'CTR', 'إنشاء', 'شركة', 'الحديثة', 'العامة'],
        icon: Activity,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30'
      }
    ];

    return groups.map(g => {
      const inboundFrom = filteredCorrespondences.filter(c => 
        c.doc_type === 'Incoming' && g.keywords.some(k => (c.sender_entity || '').includes(k))
      ).length;

      const outboundTo = filteredCorrespondences.filter(c => 
        c.doc_type === 'Outgoing' && g.keywords.some(k => (c.receiver_entity || '').includes(k))
      ).length;

      const total = inboundFrom + outboundTo;
      return {
        ...g,
        inbound: inboundFrom,
        outbound: outboundTo,
        total
      };
    });
  }, [filteredCorrespondences]);

  // 4. Recent Letters
  const recentLetters = useMemo(() => {
    return [...filteredCorrespondences]
      .sort((a, b) => new Date(b.issue_date || '').getTime() - new Date(a.issue_date || '').getTime())
      .slice(0, 5);
  }, [filteredCorrespondences]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      {/* ==================================================================== */}
      {/* 1. EXECUTIVE COMMAND & STRATEGIC ANALYTICS HERO HEADER              */}
      {/* ==================================================================== */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#005B96]/30 border border-[#334155] shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#005B96]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left/Main Information */}
        <div className="z-10 space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              تحديث تلقائي مستمر
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>لوحة متابعة المراسلات</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            أهلاً بك، <strong className="text-white font-bold">{currentUser?.full_name || 'مهندس النظام'}</strong> • متابعة الخطابات الصادرة والواردة وسرعة الرد عليها.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenInbound}
            className="px-4 py-2.5 rounded-xl bg-[#A7CCB5] text-[#0F172A] hover:bg-[#b8e2c8] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#A7CCB5]/20 transition-all cursor-pointer"
          >
            <Inbox className="w-4 h-4" />
            <span>تسجيل وارد جديد</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenOutbound}
            className="px-4 py-2.5 rounded-xl bg-[#005B96] hover:bg-[#0073bc] text-white font-bold text-xs flex items-center gap-2 border border-sky-400/30 shadow-lg shadow-[#005B96]/30 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>إنشاء مسودة صادر</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ==================================================================== */}
      {/* 2. SYNCHRONIZED LUXURY PROJECT FILTER BAR                           */}
      {/* ==================================================================== */}
      <motion.div variants={itemVariants}>
        <ProjectFilterBar 
          scopeLabel="لوحة المؤشرات" 
          correspondences={allCorrespondences} 
          showProjectInfoBanner={true}
        />
      </motion.div>

      {/* ==================================================================== */}
      {/* 3. KPI METRIC CARDS (4 METRICS)                                     */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Letters */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] shadow-sm hover:border-sky-500/50 hover:shadow-lg transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">إجمالي الخطابات</span>
            <div className="p-2.5 rounded-xl bg-[#005B96]/20 text-sky-400 border border-sky-500/20 group-hover:bg-[#005B96]/30 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            <AnimatedCounter value={totalLetters} />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-[#334155]/60 pt-2 font-medium">
            <span>وارد: <strong className="text-sky-300 font-mono">{inboundLetters}</strong></span>
            <span>صادر: <strong className="text-emerald-300 font-mono">{outboundLetters}</strong></span>
          </div>
        </motion.div>

        {/* KPI 2: Inbound Intake */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] shadow-sm hover:border-indigo-500/50 hover:shadow-lg transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">الخطابات الواردة</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            <AnimatedCounter value={inboundLetters} />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-[#334155]/60 pt-2 font-medium">
            <span>تم الرد عليه: <strong className="text-emerald-300 font-mono">{repliedInbounds}</strong></span>
            <span className="text-indigo-300 font-mono font-bold">(تم الرد على {replyRate}%)</span>
          </div>
        </motion.div>

        {/* KPI 3: Outbound Official */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] shadow-sm hover:border-emerald-500/50 hover:shadow-lg transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">الخطابات الصادرة</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            <AnimatedCounter value={outboundLetters} />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-[#334155]/60 pt-2 font-medium">
            <span>معتمد ومرقم رسمياً</span>
            <span className="text-emerald-300 font-bold">سجلات موثقة</span>
          </div>
        </motion.div>

        {/* KPI 4: Pending Radar */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className={`p-5 rounded-2xl bg-[#1E293B] border shadow-sm hover:shadow-lg transition-all relative overflow-hidden group ${
            overdueItems.length > 0 ? 'border-amber-500/60 bg-amber-500/5' : 'border-[#334155] hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">تحت المراجعة</span>
            <div className={`p-2.5 rounded-xl border transition-colors ${
              overdueItems.length > 0 
                ? 'bg-amber-500/25 text-amber-300 border-amber-500/40' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/20 group-hover:bg-amber-500/30'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono flex items-center gap-2.5">
            <AnimatedCounter value={pendingReview} />
            {overdueItems.length > 0 && (
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-[#334155]/60 pt-2 font-medium">
            {overdueItems.length > 0 ? (
              <span className="text-rose-300 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>{overdueItems.length} خطاب متأخر عن الرد</span>
              </span>
            ) : (
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>جميع الردود في موعدها</span>
              </span>
            )}
            <span className="text-slate-400 font-mono">متابعة المواعيد</span>
          </div>
        </motion.div>
      </div>

      {/* ==================================================================== */}
      {/* 4. ANALYTICS ROW 1: VELOCITY TIMELINE & CLASSIFICATION DONUT       */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: Velocity & Correspondence Volume (7 cols) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-7 bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sky-400" />
                  <span>حركة الخطابات خلال الشهور السابقة</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">مقارنة بين الخطابات الواردة والصادرة شهرياً</p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-md bg-sky-500 shadow-sm" />
                  <span>الوارد</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm" />
                  <span>الصادر</span>
                </div>
              </div>
            </div>

            {/* Interactive Animated Bar Graph */}
            <div className="mt-8 pt-6 pb-2 border-b border-[#334155]/60">
              <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
                {monthlyTimelineData.map((item) => {
                  const incomingHeight = Math.max(8, (item.incoming / maxMonthVal) * 160);
                  const outgoingHeight = Math.max(8, (item.outgoing / maxMonthVal) * 160);
                  const isHovered = hoveredMonth === item.key;

                  return (
                    <div 
                      key={item.key}
                      onMouseEnter={() => setHoveredMonth(item.key)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                    >
                      {/* Floating Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-12 z-20 px-3 py-1.5 bg-[#0F172A] border border-sky-400/40 rounded-xl shadow-xl text-center whitespace-nowrap text-[11px] font-bold text-white animate-fade-in pointer-events-none">
                          <span className="text-sky-300 block">{item.label} 2026</span>
                          <span className="text-slate-300 font-mono">وارد: {item.incoming} | صادر: {item.outgoing}</span>
                        </div>
                      )}

                      {/* Dual Bars Container */}
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                        {/* Inbound Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${incomingHeight}px` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`w-1/2 rounded-t-lg bg-gradient-to-t from-sky-600 to-sky-400 transition-all duration-200 group-hover:brightness-125 shadow-sm relative ${
                            isHovered ? 'shadow-[0_0_12px_rgba(56,189,248,0.5)]' : ''
                          }`}
                        >
                          {item.incoming > 0 && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold font-mono text-sky-300">
                              {item.incoming}
                            </span>
                          )}
                        </motion.div>

                        {/* Outbound Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${outgoingHeight}px` }}
                          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                          className={`w-1/2 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-200 group-hover:brightness-125 shadow-sm relative ${
                            isHovered ? 'shadow-[0_0_12px_rgba(52,211,153,0.5)]' : ''
                          }`}
                        >
                          {item.outgoing > 0 && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold font-mono text-emerald-300">
                              {item.outgoing}
                            </span>
                          )}
                        </motion.div>
                      </div>

                      {/* Month Label */}
                      <span className={`text-[11px] mt-2 font-bold transition-colors ${
                        isHovered ? 'text-white' : 'text-slate-400'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Velocity Footer Metric */}
          <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 font-medium bg-[#0F172A]/50 px-4 py-2.5 rounded-xl border border-[#334155]/60">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>متوسط التبادل: <strong className="text-white font-mono">{Math.round(totalLetters / 6)} خطاب شهرياً</strong></span>
            </div>
            <div className="text-slate-400 text-[11px]">
              بيانات محدثة طبقاً لسجل المراسلات
            </div>
          </div>
        </motion.div>

        {/* CHART 2: Document Classification Breakdown (5 cols) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-5 bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-400" />
                  <span>أنواع الخطابات والمعاملات</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">توزيع الخطابات حسب النوع</p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {totalLetters} خطاب
              </span>
            </div>

            {/* Visual Segmented Progress Bar */}
            <div className="mt-2 mb-6">
              <div className="h-3 w-full rounded-full bg-[#0F172A] overflow-hidden flex shadow-inner border border-[#334155]/60">
                {classificationData.map((cat) => (
                  <motion.div
                    key={cat.id}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${cat.color}`}
                    title={`${cat.label}: ${cat.count} (${cat.pct}%)`}
                  />
                ))}
              </div>
            </div>

            {/* Categories List Cards */}
            <div className="space-y-2.5">
              {classificationData.map((cat) => (
                <div 
                  key={cat.id}
                  className={`p-3 rounded-xl border ${cat.borderColor} ${cat.bgColor} flex items-center justify-between transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${cat.color}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-200">{cat.label}</div>
                      <span className="serial-code text-[10px] text-slate-400 font-mono">[{cat.code}]</span>
                    </div>
                  </div>

                  <div className="text-left flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-white">{cat.count}</span>
                    <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-black/30 ${cat.textColor}`}>
                      {cat.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#334155]/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>توثيق كامل لكافة أنواع المعاملات</span>
            <span className="text-sky-300 font-bold">بيانات مكتملة</span>
          </div>
        </motion.div>
      </div>

      {/* ==================================================================== */}
      {/* 5. ANALYTICS ROW 2: STAKEHOLDERS MATRIX & SLA HEALTH RADAR          */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PANEL 3: Stakeholders Exchange Traffic (7 cols) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-7 bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>الخطابات المتبادلة مع أطراف المشروع</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">عدد الخطابات مع كل جهة (المالك، الاستشاري، المقاول)</p>
              </div>
              <span className="text-xs text-indigo-300 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                مراسلات متبادلة
              </span>
            </div>

            <div className="space-y-4 mt-2">
              {stakeholderData.map((item) => {
                const maxTotal = Math.max(...stakeholderData.map(s => s.total), 1);
                const totalPct = Math.min(100, Math.round((item.total / maxTotal) * 100));
                const Icon = item.icon;

                return (
                  <div key={item.id} className="p-4 rounded-xl bg-[#0F172A]/70 border border-[#334155] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg border ${item.bg}`}>
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.title}</h4>
                          <span className="text-[10px] text-slate-400">{item.subtitle}</span>
                        </div>
                      </div>

                      <div className="text-left">
                        <span className="text-xs font-bold font-mono text-white">{item.total} خطاب</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="text-sky-300">وارد: {item.inbound}</span>
                          <span>•</span>
                          <span className="text-emerald-300">صادر: {item.outbound}</span>
                        </div>
                      </div>
                    </div>

                    {/* Proportional Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-[#1E293B] overflow-hidden flex border border-slate-700/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.total > 0 ? (item.inbound / item.total) * 100 : 0}%` }}
                        transition={{ duration: 0.7 }}
                        className="h-full bg-sky-500"
                        title={`وارد: ${item.inbound}`}
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.total > 0 ? (item.outbound / item.total) * 100 : 0}%` }}
                        transition={{ duration: 0.7 }}
                        className="h-full bg-emerald-500"
                        title={`صادر: ${item.outbound}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#334155]/60 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
              <span>توزيع متوازن بين الصادر والوارد</span>
            </span>
            <span className="text-[11px] text-slate-400">أطراف المشروع</span>
          </div>
        </motion.div>

        {/* PANEL 4: SLA Health & Resolution Radar (5 cols) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-5 bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-400" />
                  <span>معدل سرعة الرد والإنجاز</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">متابعة الرد على الخطابات في المواعيد المحددة</p>
              </div>
            </div>

            {/* Circular Gauge Centerpiece */}
            <div className="py-3 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-slate-800"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-emerald-400"
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * resolutionRate) / 100 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {resolutionRate}%
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                    نسبة الرد في الموعد
                  </span>
                </div>
              </div>
            </div>

            {/* SLA Status Badges Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <span className="text-[11px] text-emerald-300 font-bold block mb-0.5">معتمد ومنتهي</span>
                <span className="text-lg font-bold font-mono text-white">{resolvedCount}</span>
              </div>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-center">
                <span className="text-[11px] text-sky-300 font-bold block mb-0.5">تم الرد عليه</span>
                <span className="text-lg font-bold font-mono text-white">{repliedInbounds}</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                <span className="text-[11px] text-amber-300 font-bold block mb-0.5">تحت المراجعة</span>
                <span className="text-lg font-bold font-mono text-white">{pendingReview}</span>
              </div>

              <div className={`p-3 rounded-xl border text-center ${
                overdueItems.length > 0 
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' 
                  : 'bg-slate-800/40 border-slate-700 text-slate-400'
              }`}>
                <span className="text-[11px] font-bold block mb-0.5">متأخر عن موعده</span>
                <span className="text-lg font-bold font-mono text-white">{overdueItems.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#334155]/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>متابعة مستمرة لكافة الخطابات</span>
            <span className="text-emerald-300 font-bold">منتظم</span>
          </div>
        </motion.div>
      </div>

      {/* ==================================================================== */}
      {/* 6. RECENT CORRESPONDENCES LIVE STREAM                               */}
      {/* ==================================================================== */}
      <motion.div
        variants={itemVariants}
        className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-md"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              <span>أحدث الخطابات المسجلة</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">متابعة مباشرة لآخر الخطابات الصادرة والواردة</p>
          </div>

          <button
            onClick={() => onNavigateTab('correspondence')}
            className="text-xs text-sky-400 hover:text-sky-300 hover:underline font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>عرض سجل المراسلات بالكامل</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {recentLetters.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            لا توجد مراسلات مسجلة في النطاق المحدد حالياً.
          </div>
        ) : (
          <div className="divide-y divide-[#334155]">
            {recentLetters.map(letter => {
              const typeInfo = getDocTypeLabel(letter.classification);
              return (
                <motion.div
                  key={letter.doc_id}
                  whileHover={{ x: -3, backgroundColor: 'rgba(30, 41, 59, 0.9)' }}
                  transition={{ duration: 0.15 }}
                  onClick={() => onSelectDoc(letter.doc_id)}
                  className="py-3.5 px-3 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 shadow-sm ${
                      letter.doc_type === 'Incoming' 
                        ? 'bg-blue-500/20 text-sky-400 border border-sky-500/30' 
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {letter.doc_type === 'Incoming' ? <Inbox className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="serial-code text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                          {letter.serial_number}
                        </span>
                        <Badge variant="slate" size="sm">
                          {typeInfo.ar}
                        </Badge>
                        {letter.external_ref_no && (
                          <span className="serial-code text-[11px] text-slate-400">
                            (مرجع: {letter.external_ref_no})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-100 font-semibold leading-relaxed">
                        {letter.subject}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-medium">
                        <span>من: <strong className="text-slate-300">{letter.sender_entity}</strong></span>
                        <span>•</span>
                        <span>إلى: <strong className="text-slate-300">{letter.receiver_entity}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 text-left">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                      letter.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]' :
                      letter.status === 'Replied' ? 'bg-sky-500/20 text-sky-300 border-sky-400/40' :
                      letter.status === 'Draft' ? 'bg-amber-500/25 text-amber-300 border-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]' :
                      'bg-purple-500/20 text-purple-300 border-purple-400/40'
                    }`}>
                      {letter.status}
                    </span>
                    <span className="serial-code text-[10px] text-slate-400 mt-1">
                      {letter.issue_date}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
