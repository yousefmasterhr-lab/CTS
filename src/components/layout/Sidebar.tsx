// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Architectural Deep-Navy Sidebar & Dynamic RBAC Navigation
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React from 'react';
import { BrandLogo } from '../../assets/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Inbox, 
  Send, 
  Layers, 
  Bot, 
  Users, 
  KanbanSquare, 
  LogOut, 
  ShieldAlert,
  FolderGit2,
  Building2,
  Sparkles
} from 'lucide-react';
import { SystemRole } from '../../types/auth';

export type NavigationTab = 
  | 'dashboard' 
  | 'correspondence' 
  | 'inbound' 
  | 'outbound' 
  | 'projects'
  | 'telegram' 
  | 'users' 
  | 'tickets'
  | 'audit';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onCloseMobile
}) => {
  const { currentUser, logout, switchUserRole, startWelcomeSequence } = useAuth();

  if (!currentUser) return null;

  const role = currentUser.system_role;

  // Nav Items definition with RBAC access list
  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'لوحة المتابعة والمؤشرات',
      sublabel: 'KPIs & Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Doc_Controller', 'Project_Manager', 'Engineer', 'Viewer'] as SystemRole[],
    },
    {
      id: 'projects' as NavigationTab,
      label: 'المشاريع والجهات الهندسية',
      sublabel: 'Projects & Stakeholders',
      icon: <Building2 className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Doc_Controller', 'Project_Manager'] as SystemRole[],
    },
    {
      id: 'correspondence' as NavigationTab,
      label: 'سجل المراسلات العام',
      sublabel: 'All Correspondence',
      icon: <Layers className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Doc_Controller', 'Project_Manager', 'Engineer', 'Viewer'] as SystemRole[],
    },
    {
      id: 'inbound' as NavigationTab,
      label: 'تسجيل وارد جديد',
      sublabel: 'Inbound Letters',
      icon: <Inbox className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Doc_Controller', 'Project_Manager'] as SystemRole[],
    },
    {
      id: 'outbound' as NavigationTab,
      label: 'مسودات واعتماد الصادر',
      sublabel: 'Outbound & Approvals',
      icon: <Send className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Doc_Controller', 'Project_Manager', 'Engineer'] as SystemRole[],
    },
    {
      id: 'tickets' as NavigationTab,
      label: 'الدعم الفني والبلاغات',
      sublabel: 'Tickets & Support',
      icon: <KanbanSquare className="w-5 h-5" />,
      allowedRoles: ['Admin'] as SystemRole[],
    },
    {
      id: 'telegram' as NavigationTab,
      label: 'إشعارات تليجرام',
      sublabel: 'Telegram Notifications',
      icon: <Bot className="w-5 h-5" />,
      allowedRoles: ['Admin'] as SystemRole[],
    },
    {
      id: 'users' as NavigationTab,
      label: 'المستخدمين والصلاحيات',
      sublabel: 'User Management',
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['Admin'] as SystemRole[],
    },
    {
      id: 'audit' as NavigationTab,
      label: 'سجل العمليات والرقابة',
      sublabel: 'Audit Trail',
      icon: <ShieldAlert className="w-5 h-5" />,
      allowedRoles: ['Admin', 'Viewer'] as SystemRole[],
    }
  ];

  const visibleNav = navItems.filter(item => item.allowedRoles.includes(role));

  const roleLabelMap: Record<SystemRole, { label: string; color: string }> = {
    Admin: { label: 'مدير النظام (Super Admin)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    Doc_Controller: { label: 'مراقب المستندات (Doc Controller)', color: 'bg-[#005B96]/30 text-[#D8E3E9] border-[#005B96]/50' },
    Project_Manager: { label: 'مدير المشروع (PM)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    Engineer: { label: 'مهندس المكتب (Engineer)', color: 'bg-[#A7CCB5]/20 text-[#A7CCB5] border-[#A7CCB5]/40' },
    Viewer: { label: 'مدقق ومستعرض (Auditor)', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed lg:static top-0 right-0 z-40 h-full w-72 bg-[#0F172A] border-l border-[#8097AE]/20 flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Logo */}
        <div className="p-5 border-b border-[#8097AE]/20">
          <BrandLogo size={42} showText={true} isDark={true} />
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 tracking-wide">
            القوائم الرئيسية
          </div>

          {visibleNav.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-right transition-all group ${
                  isActive 
                    ? 'bg-[#005B96] text-white shadow-lg shadow-[#005B96]/30 font-semibold' 
                    : 'text-[#8097AE] hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#1E293B] text-[#8097AE] group-hover:text-white'
                }`}>
                  {item.icon}
                </div>

                <div className="flex-1 text-right">
                  <div className="text-xs leading-snug font-medium">{item.label}</div>
                  <div className="text-[10px] font-sans opacity-70 leading-none mt-0.5" dir="ltr">{item.sublabel}</div>
                </div>

                {isActive && (
                  <div className="w-1.5 h-4 rounded-full bg-[#A7CCB5]" />
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & Testing Role Switcher */}
        <div className="p-4 border-t border-[#8097AE]/20 bg-[#1E293B]/60">
          {/* User Info */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{currentUser.full_name}</p>
              <p className="text-[11px] text-[#8097AE] truncate font-mono">{currentUser.work_email}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => startWelcomeSequence(currentUser)}
                title="عرض شاشة الترحيب الهندسي التفاعلية"
                className="p-1.5 rounded-lg text-[#8097AE] hover:text-[#A7CCB5] hover:bg-[#A7CCB5]/10 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </button>
              <button
                onClick={logout}
                title="تسجيل الخروج"
                className="p-1.5 rounded-lg text-[#8097AE] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Role Pill */}
          <div className={`px-2 py-1 rounded-md text-[10px] font-medium border mb-3 flex items-center justify-between ${roleLabelMap[role].color}`}>
            <span className="truncate">{roleLabelMap[role].label}</span>
          </div>

          {/* Quick Role Testing Select (Human Inspection Aid) */}
          <div className="pt-2 border-t border-[#8097AE]/20">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              تبديل الرتبة للاختبار السريع (Role Switch):
            </label>
            <select
              value={role}
              onChange={(e) => switchUserRole(e.target.value as SystemRole, { showWelcome: true })}
              className="w-full text-xs px-2 py-1.5 bg-[#0F172A] border border-[#8097AE]/30 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#005B96] cursor-pointer"
            >
              <option value="Admin">Admin (مدير النظام)</option>
              <option value="Doc_Controller">Doc Controller (مراقب المستندات)</option>
              <option value="Project_Manager">Project Manager (مدير المشروع)</option>
              <option value="Engineer">Engineer (مهندس المكتب)</option>
              <option value="Viewer">Viewer (مدقق خارجي)</option>
            </select>
          </div>
        </div>
      </aside>
    </>
  );
};
