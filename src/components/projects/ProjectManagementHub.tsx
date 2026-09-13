// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Engineering Projects & Stakeholders Directory Management Hub
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, PROJECT_STATUS_LABELS } from '../../types/project';
import { Entity, EntityRole, LegalEntityType, EntityStatus, ENTITY_ROLE_LABELS, LEGAL_TYPE_LABELS } from '../../types/entity';
import { Correspondence } from '../../types/correspondence';
import { dbService } from '../../services/db/firestoreService';
import { useNotification } from '../../context/NotificationContext';
import { ProjectFormModal } from './ProjectFormModal';
import { EntityFormModal } from './EntityFormModal';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { ProjectTimelineModal } from './ProjectTimelineModal';
import { Button } from '../common/Button';
import { 
  FolderGit2, 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  UserCheck, 
  Phone, 
  Mail, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  HardHat,
  Landmark,
  ShieldCheck,
  FileSpreadsheet,
  Eye,
  History
} from 'lucide-react';

interface ProjectManagementHubProps {
  onRefreshGlobal?: () => void;
  onOpenDocDossier?: (doc: Correspondence) => void;
}

export const ProjectManagementHub: React.FC<ProjectManagementHubProps> = ({ 
  onRefreshGlobal,
  onOpenDocDossier
}) => {
  const { success, error } = useNotification();

  // Active view tab: 'projects' or 'entities'
  const [activeTab, setActiveTab] = useState<'projects' | 'entities'>('projects');

  // Local refresh trigger
  const [refreshCount, setRefreshCount] = useState(0);
  const handleDataChanged = () => {
    setRefreshCount(prev => prev + 1);
    if (onRefreshGlobal) onRefreshGlobal();
  };

  // Data fetching
  const projects = useMemo(() => dbService.getProjects(), [refreshCount]);
  const entities = useMemo(() => dbService.getEntities(), [refreshCount]);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [selectedDetailProject, setSelectedDetailProject] = useState<Project | null>(null);
  const [selectedTimelineProject, setSelectedTimelineProject] = useState<Project | null>(null);

  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);

  // Delete confirmation modal state
  const [itemToDelete, setItemToDelete] = useState<{ type: 'project' | 'entity'; id: string; name: string } | null>(null);

  // Search & Filters for Projects
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('ALL');

  // Search & Filters for Entities
  const [entitySearch, setEntitySearch] = useState('');
  const [entityRoleFilter, setEntityRoleFilter] = useState<string>('ALL');
  const [entityLegalFilter, setEntityLegalFilter] = useState<string>('ALL');
  const [entityStatusFilter, setEntityStatusFilter] = useState<string>('ALL');

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const q = projectSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        p.project_name.toLowerCase().includes(q) ||
        p.project_code.toLowerCase().includes(q) ||
        p.project_id.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.client_name && p.client_name.toLowerCase().includes(q));

      const matchesStatus = projectStatusFilter === 'ALL' || p.project_status === projectStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, projectSearch, projectStatusFilter]);

  // Filtered Entities
  const filteredEntities = useMemo(() => {
    return entities.filter(e => {
      const q = entitySearch.toLowerCase().trim();
      const matchesSearch = !q ||
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        (e.short_name && e.short_name.toLowerCase().includes(q)) ||
        (e.contact_person && e.contact_person.toLowerCase().includes(q)) ||
        (e.registration_no && e.registration_no.toLowerCase().includes(q)) ||
        (e.phone && e.phone.includes(q)) ||
        (e.mobile && e.mobile.includes(q));

      const matchesRole = entityRoleFilter === 'ALL' || e.role === entityRoleFilter;
      const matchesLegal = entityLegalFilter === 'ALL' || e.legal_type === entityLegalFilter;
      const matchesStatus = entityStatusFilter === 'ALL' || e.status === entityStatusFilter;

      return matchesSearch && matchesRole && matchesLegal && matchesStatus;
    });
  }, [entities, entitySearch, entityRoleFilter, entityLegalFilter, entityStatusFilter]);

  // KPI Metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.project_status === 'Active').length;
  const totalEntities = entities.length;
  const consultantsCount = entities.filter(e => e.role === 'Consultant').length;
  const contractorsCount = entities.filter(e => e.role === 'Main_Contractor' || e.role === 'Subcontractor').length;
  const ownersCount = entities.filter(e => e.role === 'Owner' || e.role === 'Government').length;

  // Execute deletion with safety confirmation
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'project') {
      const res = dbService.deleteProject(itemToDelete.id);
      if (res.success) {
        success(`تم حذف المشروع [${itemToDelete.name}] بنجاح.`);
        handleDataChanged();
      } else {
        error(res.error?.message || 'فشل حذف المشروع.');
      }
    } else {
      const res = dbService.deleteEntity(itemToDelete.id);
      if (res.success) {
        success(`تم حذف الجهة [${itemToDelete.name}] بنجاح.`);
        handleDataChanged();
      } else {
        error(res.error?.message || 'فشل حذف الجهة.');
      }
    }

    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Metrics */}
      <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#334155] shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
                <Building2 className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  مركز إدارة المشاريع والجهات الهندسية
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  تكويد المشاريع وإدارة مثلث التعاقد (الجهات المالكة، المكاتب الاستشارية، شركات المقاولات، والموردين)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'projects' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingProject(null);
                  setIsProjectModalOpen(true);
                }}
                className="bg-[#005B96] hover:bg-[#004877] font-semibold"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                تكويد مشروع جديد
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingEntity(null);
                  setIsEntityModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                إضافة جهة / طرف جديد
              </Button>
            )}
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-[#334155]/60">
          <div className="p-3 rounded-xl bg-[#0F172A]/70 border border-[#334155]/60">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
              <span>إجمالي المشاريع</span>
            </div>
            <div className="text-lg font-bold text-white mt-1">{totalProjects}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A]/70 border border-[#334155]/60">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>قيد التنفيذ</span>
            </div>
            <div className="text-lg font-bold text-emerald-400 mt-1">{activeProjects}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A]/70 border border-[#334155]/60">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>إجمالي الجهات</span>
            </div>
            <div className="text-lg font-bold text-white mt-1">{totalEntities}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A]/70 border border-[#334155]/60">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>مكاتب استشارية</span>
            </div>
            <div className="text-lg font-bold text-sky-400 mt-1">{consultantsCount}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A]/70 border border-[#334155]/60">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-amber-400" />
              <span>شركات المقاولات</span>
            </div>
            <div className="text-lg font-bold text-amber-400 mt-1">{contractorsCount}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A]/70 border border-[#334155]/60">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>الجهات المالكة</span>
            </div>
            <div className="text-lg font-bold text-emerald-400 mt-1">{ownersCount}</div>
          </div>
        </div>
      </div>

      {/* 2. Primary Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#334155] pb-1">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'projects'
              ? 'bg-[#005B96] text-white shadow-lg shadow-[#005B96]/30'
              : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>المشاريع الهندسية ({filteredProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('entities')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'entities'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>دليل وسجل الجهات والأطراف ({filteredEntities.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: ENGINEERING PROJECTS VIEW                                         */}
      {/* ========================================================================= */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {/* Controls & Filters Bar */}
          <div className="bg-[#1E293B] p-4 rounded-xl border border-[#334155] flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="بحث باسم المشروع، الكود، الموقع، أو المالك..."
                className="w-full pr-9 pl-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-slate-400 shrink-0">الحالة:</span>
              <select
                value={projectStatusFilter}
                onChange={(e) => setProjectStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="Active">قيد التنفيذ</option>
                <option value="Suspended">معلق / متوقف</option>
                <option value="Handed_Over">تم التسليم النهائي</option>
              </select>
            </div>
          </div>

          {/* Projects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((p) => {
              const statusCfg = PROJECT_STATUS_LABELS[p.project_status] || PROJECT_STATUS_LABELS.Active;

              return (
                <div
                  key={p.project_id}
                  className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5 shadow-md hover:border-[#005B96]/60 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Code and Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#005B96]/20 border border-[#005B96]/40 text-sky-300 font-mono font-bold text-xs">
                          {p.project_code}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {p.project_id}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-sky-300 transition-colors">
                      {p.project_name}
                    </h3>

                    {/* Stakeholders Triangle */}
                    <div className="mt-4 p-3 rounded-xl bg-[#0F172A]/70 border border-[#334155]/60 space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <Landmark className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-slate-400 shrink-0">المالك:</span>
                        <span className="font-semibold text-slate-200 truncate">{p.client_name}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span className="text-slate-400 shrink-0">الاستشاري:</span>
                        <span className="font-semibold text-slate-200 truncate">{p.consultant_name}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-slate-400 shrink-0">المقاول:</span>
                        <span className="font-semibold text-slate-200 truncate">{p.contractor_name}</span>
                      </div>
                    </div>

                    {/* Location & Dates */}
                    <div className="mt-3 space-y-1.5 text-[11px] text-slate-400">
                      {p.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                          <span className="truncate">{p.location}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-sky-400 shrink-0" />
                          <span>بدء: {p.start_date}</span>
                        </div>
                        {p.end_date && (
                          <div className="text-slate-400">
                            الانتهاء: {p.end_date}
                          </div>
                        )}
                      </div>

                      {(p.total_budget !== undefined || p.total_budget_sar !== undefined) && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-300 pt-1 font-mono">
                          <DollarSign className="w-3 h-3 shrink-0 text-emerald-400" />
                          <span>
                            الميزانية: {(p.total_budget ?? p.total_budget_sar)?.toLocaleString()} {p.currency || 'EGP'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between gap-1.5 mt-5 pt-3 border-t border-[#334155]/60">
                    <button
                      onClick={() => setSelectedTimelineProject(p)}
                      title="السجل الزمني ودورة مراسلات المشروع (Timeline & Cycle)"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <History className="w-3.5 h-3.5 text-emerald-400" />
                      <span>سجل المراسلات</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedDetailProject(p)}
                        title="عرض تفاصيل وبيانات المشروع الكاملة"
                        className="p-1.5 rounded-lg bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setEditingProject(p);
                          setIsProjectModalOpen(true);
                        }}
                        title="تعديل بيانات المشروع"
                        className="p-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setItemToDelete({ type: 'project', id: p.project_id, name: p.project_name })}
                        title="حذف المشروع"
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProjects.length === 0 && (
              <div className="col-span-full p-12 text-center bg-[#1E293B] rounded-2xl border border-[#334155]">
                <FolderGit2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">لا توجد مشاريع مطابقة لمعايير البحث</h4>
                <p className="text-xs text-slate-400 mt-1">
                  يمكنك إضافة مشروع جديد بالنقر على زر «تكويد مشروع جديد» أعلاه
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: STAKEHOLDERS & ENTITIES DIRECTORY VIEW                             */}
      {/* ========================================================================= */}
      {activeTab === 'entities' && (
        <div className="space-y-4">
          {/* Controls & Filters Bar */}
          <div className="bg-[#1E293B] p-4 rounded-xl border border-[#334155] flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={entitySearch}
                onChange={(e) => setEntitySearch(e.target.value)}
                placeholder="بحث بالاسم، الكود، مسؤول التواصل، أو السجل..."
                className="w-full pr-9 pl-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={entityRoleFilter}
                onChange={(e) => setEntityRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="ALL">جميع الأدوار</option>
                <option value="Consultant">مكتب استشاري</option>
                <option value="Owner">جهة مالكة</option>
                <option value="Main_Contractor">مقاول عام</option>
                <option value="Subcontractor">مقاول باطن</option>
                <option value="Supplier">مورد معتمد</option>
                <option value="Government">جهة حكومية</option>
              </select>

              <select
                value={entityLegalFilter}
                onChange={(e) => setEntityLegalFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="ALL">جميع الأشكال القانونية</option>
                <option value="Company">شركة</option>
                <option value="Legal_Entity">شخص اعتباري (هيئة/وزارة)</option>
                <option value="Individual">شخص فردي / مكتب فردي</option>
              </select>

              <select
                value={entityStatusFilter}
                onChange={(e) => setEntityStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="Active">نشط</option>
                <option value="Inactive">غير نشط</option>
              </select>
            </div>
          </div>

          {/* Entities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntities.map((ent) => {
              const roleCfg = ENTITY_ROLE_LABELS[ent.role] || ENTITY_ROLE_LABELS.Consultant;
              const legalLabel = LEGAL_TYPE_LABELS[ent.legal_type] || ent.legal_type;

              return (
                <div
                  key={ent.id}
                  className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5 shadow-md hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleCfg.bg} ${roleCfg.text} ${roleCfg.border}`}>
                          {roleCfg.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {legalLabel}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-500/40 text-sky-300 font-mono font-bold text-xs">
                        {ent.code}
                      </span>
                    </div>

                    {/* Official Name */}
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                      {ent.name}
                    </h3>
                    {ent.short_name && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {ent.short_name}
                      </p>
                    )}

                    {/* Registration & Tax */}
                    {(ent.registration_no || ent.tax_no) && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono p-2 rounded-lg bg-[#0F172A]/80 border border-[#334155]/60 text-slate-300">
                        {ent.registration_no && (
                          <div className="truncate">
                            <span className="text-slate-500 block">السجل:</span>
                            <span>{ent.registration_no}</span>
                          </div>
                        )}
                        {ent.tax_no && (
                          <div className="truncate">
                            <span className="text-slate-500 block">الضريبي:</span>
                            <span>{ent.tax_no}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Contact Person & Info */}
                    <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                      {ent.contact_person && (
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="font-semibold text-white truncate">{ent.contact_person}</span>
                          {ent.contact_title && (
                            <span className="text-[10px] text-slate-400 truncate">({ent.contact_title})</span>
                          )}
                        </div>
                      )}

                      {ent.phone && ent.phone !== '—' && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span dir="ltr">{ent.phone}</span>
                        </div>
                      )}

                      {ent.mobile && (
                        <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-mono">
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span dir="ltr">{ent.mobile}</span>
                        </div>
                      )}

                      {ent.email && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                          <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                          <span className="truncate">{ent.email}</span>
                        </div>
                      )}

                      {ent.address && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                          <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                          <span className="truncate">{ent.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#334155]/60">
                    <span className={`text-[10px] font-bold ${ent.status === 'Active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                      ● {ent.status === 'Active' ? 'نشط' : 'معطل'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingEntity(ent);
                          setIsEntityModalOpen(true);
                        }}
                        title="تعديل بيانات الجهة"
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setItemToDelete({ type: 'entity', id: ent.id, name: ent.name })}
                        title="حذف الجهة"
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredEntities.length === 0 && (
              <div className="col-span-full p-12 text-center bg-[#1E293B] rounded-2xl border border-[#334155]">
                <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">لا توجد جهات مطابقة لمعايير التصفية</h4>
                <p className="text-xs text-slate-400 mt-1">
                  يمكنك إضافة جهة جديدة بالنقر على زر «إضافة جهة / طرف جديد» أعلاه
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}
      {/* Project Add / Edit Modal */}
      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSaved={handleDataChanged}
        existingProject={editingProject}
      />

      {/* Entity Add / Edit Modal */}
      <EntityFormModal
        isOpen={isEntityModalOpen}
        onClose={() => {
          setIsEntityModalOpen(false);
          setEditingEntity(null);
        }}
        onSaved={handleDataChanged}
        existingEntity={editingEntity}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={!!selectedDetailProject}
        onClose={() => setSelectedDetailProject(null)}
        project={selectedDetailProject}
        onOpenTimeline={(proj) => {
          setSelectedDetailProject(null);
          setSelectedTimelineProject(proj);
        }}
        onEditProject={(proj) => {
          setSelectedDetailProject(null);
          setEditingProject(proj);
          setIsProjectModalOpen(true);
        }}
      />

      {/* Project Timeline & Cycle Modal */}
      <ProjectTimelineModal
        isOpen={!!selectedTimelineProject}
        onClose={() => setSelectedTimelineProject(null)}
        project={selectedTimelineProject}
        onOpenDocDossier={(doc) => {
          if (onOpenDocDossier) {
            onOpenDocDossier(doc);
          }
        }}
      />

      {/* Delete Confirmation Safeguard Dialog */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E293B] border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <h3 className="text-base font-bold text-white">
                تأكيد حذف {itemToDelete.type === 'project' ? 'المشروع الهندسي' : 'الجهة / الطرف'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف <strong className="text-white">[{itemToDelete.name}]</strong>؟
            </p>

            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-200">
              <strong>حماية الأرشيف الهندسي:</strong> سيقوم النظام بفحص ما إذا كان هذا العنصر مرتبطاً بمراسلات رسمية سابقة أو مشاريع قائمة، وسيمنع الحذف لحماية سلامة البيانات.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#334155]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setItemToDelete(null)}
              >
                إلغاء التراجع
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700"
              >
                نعم، احذف الآن
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
