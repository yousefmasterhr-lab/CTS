// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Architectural Synchronized Animated Project Filter Bar Component
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db/firestoreService';
import { Correspondence } from '../../types/correspondence';
import { 
  Building2, 
  ChevronDown, 
  CheckCircle2, 
  Layers, 
  Search, 
  X, 
  Filter,
  Sparkles,
  MapPin,
  Landmark
} from 'lucide-react';

interface ProjectFilterBarProps {
  className?: string;
  scopeLabel?: string; // e.g. 'سجل المراسلات' | 'الوارد' | 'مسودات الصادر'
  correspondences?: Correspondence[];
  showProjectInfoBanner?: boolean;
}

export const ProjectFilterBar: React.FC<ProjectFilterBarProps> = ({
  className = '',
  scopeLabel = 'المراسلات',
  correspondences,
  showProjectInfoBanner = true
}) => {
  const { currentUser, activeProjectId, setActiveProjectId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const projects = dbService.getProjects();

  // Filter accessible projects based on role
  const accessibleProjects = useMemo(() => {
    if (!currentUser || currentUser.system_role === 'Admin') {
      return projects;
    }
    return projects.filter(p => currentUser.assigned_projects.includes(p.project_id));
  }, [projects, currentUser]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Currently selected project
  const currentProject = useMemo(() => {
    if (activeProjectId === 'ALL') return null;
    return projects.find(p => p.project_id === activeProjectId || p.project_code === activeProjectId) || null;
  }, [projects, activeProjectId]);

  // Filtered projects in dropdown search
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return accessibleProjects;
    const q = searchQuery.toLowerCase().trim();
    return accessibleProjects.filter(p => 
      p.project_name.toLowerCase().includes(q) ||
      p.project_code.toLowerCase().includes(q) ||
      p.project_id.toLowerCase().includes(q) ||
      (p.client_name && p.client_name.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q))
    );
  }, [accessibleProjects, searchQuery]);

  // Count items per project if correspondences provided
  const getProjectDocCount = (projId: string, projCode: string) => {
    if (!correspondences) return null;
    return correspondences.filter(c => c.project_ref === projId || c.project_ref === projCode).length;
  };

  const totalDocCount = correspondences ? correspondences.length : null;

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* 1. Main Interactive Trigger Bar */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-2">
          {/* Main Dropdown Button */}
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className={`flex-1 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 text-right cursor-pointer select-none group shadow-sm ${
              isOpen
                ? 'bg-[#1E293B] border-sky-400 ring-2 ring-sky-500/30'
                : activeProjectId === 'ALL'
                  ? 'bg-[#0F172A] border-[#334155] hover:border-slate-400 hover:bg-[#1E293B]'
                  : 'bg-sky-950/20 border-sky-500/50 hover:border-sky-400 hover:bg-sky-950/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
            }`}
          >
            {/* Left Content: Icon & Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2 rounded-lg border shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                activeProjectId === 'ALL'
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-[#005B96]/20 text-sky-400 border-sky-500/40 shadow-sm'
              }`}>
                {activeProjectId === 'ALL' ? (
                  <Layers className="w-4 h-4" />
                ) : (
                  <Building2 className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">
                    المشروع الهندسي النشط:
                  </span>
                  {activeProjectId !== 'ALL' && currentProject && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#005B96] text-white">
                      {currentProject.project_code}
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-white truncate mt-0.5">
                  {activeProjectId === 'ALL' ? (
                    <span>كافة المشاريع الهندسية (عرض شامل لجميع المعاملات)</span>
                  ) : currentProject ? (
                    <span>{currentProject.project_name}</span>
                  ) : (
                    <span>المشروع المحدد: {activeProjectId}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Counter Badge & Animated Chevron */}
            <div className="flex items-center gap-2 shrink-0">
              {totalDocCount !== null && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B1120] text-sky-300 border border-[#334155] text-[11px] font-mono font-bold">
                  <span>{currentProject ? (getProjectDocCount(currentProject.project_id, currentProject.project_code) ?? 0) : totalDocCount}</span>
                  <span className="text-slate-400 text-[10px] font-sans">معاملة</span>
                </span>
              )}

              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-400 group-hover:text-white"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </div>
          </button>

          {/* Quick Clear Button (if a specific project is selected) */}
          {activeProjectId !== 'ALL' && (
            <button
              type="button"
              onClick={() => setActiveProjectId('ALL')}
              title="إلغاء التصفية وعرض كافة المشاريع"
              className="p-2.5 rounded-xl border border-slate-700 bg-[#0F172A] text-slate-400 hover:text-rose-300 hover:border-rose-500/50 hover:bg-rose-500/10 transition-colors shrink-0 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2. Animated Popover Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute top-full right-0 left-0 mt-2 z-50 bg-[#1E293B] border border-[#334155] rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden divide-y divide-[#334155]/60"
            >
              {/* Popover Header with Search Input */}
              <div className="p-3 bg-[#0F172A] space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Filter className="w-3.5 h-3.5 text-sky-400" />
                    <span>تصفية {scopeLabel} حسب المشروع</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    متاح ({accessibleProjects.length}) مشاريع
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث بكود المشروع، الاسم، أو المالك..."
                    className="w-full pr-8 pl-3 py-1.5 text-xs bg-[#1E293B] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Popover Items List */}
              <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                {/* Option 1: ALL PROJECTS */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveProjectId('ALL');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-right cursor-pointer ${
                    activeProjectId === 'ALL'
                      ? 'bg-[#005B96]/20 border border-sky-500/40 text-white'
                      : 'hover:bg-[#0F172A] text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`p-2 rounded-lg border ${
                      activeProjectId === 'ALL'
                        ? 'bg-[#005B96] text-white border-[#005B96]'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      <Layers className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">
                        كافة المشاريع الهندسية (All Projects)
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        عرض شامل لكافة المعاملات والمراسلات دون تقييد بمشروع محدد
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {totalDocCount !== null && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0F172A] text-slate-300 border border-[#334155]">
                        {totalDocCount} معاملة
                      </span>
                    )}
                    {activeProjectId === 'ALL' && (
                      <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    )}
                  </div>
                </button>

                {/* Separator */}
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 tracking-wider">
                  المشاريع الهندسية المسجلة
                </div>

                {/* Option 2..N: Individual Projects */}
                {filteredProjects.map((p) => {
                  const isSelected = activeProjectId === p.project_id || activeProjectId === p.project_code;
                  const docCount = getProjectDocCount(p.project_id, p.project_code);

                  return (
                    <button
                      key={p.project_id}
                      type="button"
                      onClick={() => {
                        setActiveProjectId(p.project_id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-right cursor-pointer ${
                        isSelected
                          ? 'bg-sky-950/40 border border-sky-400 text-white shadow-md shadow-sky-500/10'
                          : 'hover:bg-[#0F172A] text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#005B96] text-white border-[#005B96]'
                            : 'bg-slate-800 text-sky-300 border-slate-700'
                        }`}>
                          {p.project_code}
                        </span>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white leading-snug">
                            {p.project_name}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                            {p.client_name && (
                              <span className="flex items-center gap-1 truncate">
                                <Landmark className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{p.client_name}</span>
                              </span>
                            )}
                            {p.location && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                                <span>{p.location}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 mr-2">
                        {docCount !== null && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            docCount > 0
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}>
                            {docCount}
                          </span>
                        )}
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                    </button>
                  );
                })}

                {filteredProjects.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    لا توجد مشاريع تطابق بحثك «{searchQuery}»
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Sleek Active Project Banner (if a specific project is selected and enabled) */}
      {showProjectInfoBanner && currentProject && activeProjectId !== 'ALL' && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3.5 py-2 rounded-xl bg-sky-950/30 border border-sky-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
        >
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-sky-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>المشروع المحدد:</span>
            </span>
            <strong className="text-white font-semibold">[{currentProject.project_code}] {currentProject.project_name}</strong>
            {currentProject.client_name && (
              <span className="text-slate-400">
                • المالك: <strong className="text-slate-300">{currentProject.client_name}</strong>
              </span>
            )}
            {currentProject.consultant_name && (
              <span className="text-slate-400">
                • الاستشاري: <strong className="text-slate-300">{currentProject.consultant_name}</strong>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setActiveProjectId('ALL')}
            className="text-[11px] text-sky-400 hover:text-sky-200 hover:underline shrink-0 font-medium self-end sm:self-auto cursor-pointer"
          >
            عرض كافة المشاريع
          </button>
        </motion.div>
      )}
    </div>
  );
};
