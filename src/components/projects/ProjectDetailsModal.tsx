// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Engineering Project Detailed Overview Modal
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useMemo } from 'react';
import { Project, PROJECT_STATUS_LABELS } from '../../types/project';
import { dbService } from '../../services/db/firestoreService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { 
  FolderGit2, 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  Landmark, 
  ShieldCheck, 
  HardHat, 
  Layers, 
  Inbox, 
  Send, 
  CheckCircle2, 
  Clock, 
  History,
  Edit3
} from 'lucide-react';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onOpenTimeline: (project: Project) => void;
  onEditProject: (project: Project) => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
  onOpenTimeline,
  onEditProject
}) => {
  if (!project) return null;

  const statusCfg = PROJECT_STATUS_LABELS[project.project_status] || PROJECT_STATUS_LABELS.Active;

  // Project statistics
  const projectDocs = useMemo(() => {
    return dbService.getCorrespondences().filter(
      c => c.project_ref === project.project_id || c.project_ref === project.project_code
    );
  }, [project, isOpen]);

  const inboundsCount = projectDocs.filter(c => c.doc_type === 'Incoming').length;
  const outboundsCount = projectDocs.filter(c => c.doc_type === 'Outgoing').length;
  const approvedCount = projectDocs.filter(c => c.status === 'Approved' || c.status === 'Replied').length;
  const pendingCount = projectDocs.filter(c => c.status === 'Pending' || c.status === 'Draft').length;

  const budgetDisplay = project.total_budget !== undefined
    ? `${project.total_budget.toLocaleString()} ${project.currency || 'EGP'}`
    : project.total_budget_sar !== undefined
    ? `${project.total_budget_sar.toLocaleString()} SAR`
    : '—';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تفاصيل وبيانات المشروع الهندسي"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="bg-[#0F172A] p-5 rounded-2xl border border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-lg bg-[#005B96]/20 border border-[#005B96]/40 text-sky-300 font-mono font-bold text-sm">
                {project.project_code}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {project.project_id}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                {statusCfg.label}
              </span>
            </div>
            <h3 className="text-base font-bold text-white leading-relaxed">
              {project.project_name}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onOpenTimeline(project);
              }}
              className="border-sky-500/40 text-sky-300 hover:bg-sky-500/10 font-semibold"
              leftIcon={<History className="w-4 h-4 text-sky-400" />}
            >
              سجل المراسلات
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose();
                onEditProject(project);
              }}
              className="text-slate-300 hover:text-white"
              leftIcon={<Edit3 className="w-4 h-4" />}
            >
              تعديل
            </Button>
          </div>
        </div>

        {/* Stakeholders Matrix */}
        <div className="bg-[#0F172A] p-5 rounded-2xl border border-[#334155] space-y-3">
          <h4 className="text-xs font-bold text-sky-400 flex items-center gap-2 pb-2 border-b border-[#334155]/80">
            <Building2 className="w-4 h-4" />
            <span>أطراف المشروع</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#1E293B]/70 border border-[#334155]/60 space-y-1">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                <span>الجهة المالكة:</span>
              </div>
              <div className="text-xs font-bold text-white truncate">
                {project.client_name || '—'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#1E293B]/70 border border-[#334155]/60 space-y-1">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>المكتب الاستشاري:</span>
              </div>
              <div className="text-xs font-bold text-white truncate">
                {project.consultant_name || '—'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#1E293B]/70 border border-[#334155]/60 space-y-1">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5 text-amber-400" />
                <span>المقاول العام:</span>
              </div>
              <div className="text-xs font-bold text-white truncate">
                {project.contractor_name || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Project Key Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#0F172A] border border-[#334155]">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>تاريخ البدء</span>
            </div>
            <div className="text-xs font-bold text-white mt-1 font-mono">
              {project.start_date || '—'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A] border border-[#334155]">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>الانتهاء المتوقع</span>
            </div>
            <div className="text-xs font-bold text-white mt-1 font-mono">
              {project.end_date || '—'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A] border border-[#334155]">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>الميزانية</span>
            </div>
            <div className="text-xs font-bold text-emerald-300 mt-1 font-mono">
              {budgetDisplay}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A] border border-[#334155]">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>الموقع</span>
            </div>
            <div className="text-xs font-bold text-white mt-1 truncate">
              {project.location || '—'}
            </div>
          </div>
        </div>

        {/* Description & Scope of work */}
        {(project.scope_of_work || project.description || project.notes) && (
          <div className="bg-[#0F172A] p-4 rounded-xl border border-[#334155] space-y-2 text-xs">
            {project.scope_of_work && (
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">نطاق الأعمال:</span>
                <p className="text-slate-200 leading-relaxed">{project.scope_of_work}</p>
              </div>
            )}
            {project.notes && (
              <div className="pt-2 border-t border-[#334155]/60">
                <span className="text-slate-400 font-semibold block mb-0.5">ملاحظات:</span>
                <p className="text-slate-300 leading-relaxed">{project.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Real-time Project Correspondence Stats */}
        <div className="bg-[#0F172A] p-4 rounded-xl border border-[#334155] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>إحصائيات مراسلات هذا المشروع</span>
            </h4>
            <span className="text-xs font-mono font-bold text-sky-400">
              إجمالي: {projectDocs.length} خطاب
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-[#1E293B] border border-[#334155]">
              <span className="text-slate-400 text-[11px] block">الوارد</span>
              <span className="text-base font-bold text-purple-400 font-mono mt-0.5 block">{inboundsCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1E293B] border border-[#334155]">
              <span className="text-slate-400 text-[11px] block">الصادر</span>
              <span className="text-base font-bold text-sky-400 font-mono mt-0.5 block">{outboundsCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1E293B] border border-[#334155]">
              <span className="text-slate-400 text-[11px] block">معتمد / تم الرد</span>
              <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">{approvedCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1E293B] border border-[#334155]">
              <span className="text-slate-400 text-[11px] block">قيد الانتظار</span>
              <span className="text-base font-bold text-amber-400 font-mono mt-0.5 block">{pendingCount}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#334155]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            إغلاق
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onOpenTimeline(project);
            }}
            className="bg-[#005B96] hover:bg-[#004877]"
            leftIcon={<History className="w-4 h-4" />}
          >
            استعراض المخطط الزمني للمراسلات
          </Button>
        </div>
      </div>
    </Modal>
  );
};
