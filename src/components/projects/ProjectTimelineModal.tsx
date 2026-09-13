// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Project Correspondence Timeline History & Cycle Modal (Animated & Architectural)
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../../types/project';
import { Correspondence } from '../../types/correspondence';
import { dbService } from '../../services/db/firestoreService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { 
  GitCommit, 
  ArrowLeftRight, 
  ArrowLeft,
  ArrowDown, 
  ArrowUp,
  Inbox, 
  Send, 
  Calendar, 
  Clock, 
  Paperclip, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  FolderGit2, 
  Sparkles,
  Link2,
  FileText
} from 'lucide-react';
import { getDocTypeLabel } from '../../utils/formatters';

interface ProjectTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onOpenDocDossier: (doc: Correspondence) => void;
}

export const ProjectTimelineModal: React.FC<ProjectTimelineModalProps> = ({
  isOpen,
  onClose,
  project,
  onOpenDocDossier
}) => {
  if (!project) return null;

  // Filter & Sort State
  const [filterType, setFilterType] = useState<'ALL' | 'Incoming' | 'Outgoing'>('ALL');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC'); // DESC: newest first

  // Fetch all correspondences belonging to this project
  const correspondences = useMemo(() => {
    const all = dbService.getCorrespondences();
    return all.filter(
      c => c.project_ref === project.project_id || c.project_ref === project.project_code
    );
  }, [project, isOpen]);

  // Filtered and sorted letters
  const timelineItems = useMemo(() => {
    let list = correspondences.filter(c => {
      if (filterType === 'ALL') return true;
      return c.doc_type === filterType;
    });

    list.sort((a, b) => {
      const dateA = new Date(a.issue_date || a.created_at).getTime();
      const dateB = new Date(b.issue_date || b.created_at).getTime();
      return sortOrder === 'ASC' ? dateA - dateB : dateB - dateA;
    });

    return list;
  }, [correspondences, filterType, sortOrder]);

  const inboundsCount = correspondences.filter(c => c.doc_type === 'Incoming').length;
  const outboundsCount = correspondences.filter(c => c.doc_type === 'Outgoing').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="السجل الزمني ودورة مراسلات المشروع (Timeline & Cycle)"
      maxWidth="6xl"
    >
      <div className="space-y-6">
        {/* Project Header Banner */}
        <div className="bg-[#0F172A] p-5 rounded-2xl border border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-[#005B96]/20 border border-[#005B96]/40 text-sky-300 font-mono font-bold text-xs">
                {project.project_code}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {project.project_id}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                إجمالي المعاملات: {correspondences.length}
              </span>
            </div>
            <h3 className="text-base font-bold text-white leading-snug">
              {project.project_name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              المالك: <strong className="text-slate-200">{project.client_name}</strong> • الاستشاري: <strong className="text-slate-200">{project.consultant_name}</strong>
            </p>
          </div>

          {/* Controls Bar: Type Filter & Sort Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#1E293B] p-1 rounded-xl border border-[#334155]">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'ALL'
                    ? 'bg-[#005B96] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل ({correspondences.length})
              </button>
              <button
                onClick={() => setFilterType('Outgoing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  filterType === 'Outgoing'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Send className="w-3 h-3" />
                <span>صادر ({outboundsCount})</span>
              </button>
              <button
                onClick={() => setFilterType('Incoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  filterType === 'Incoming'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Inbox className="w-3 h-3" />
                <span>وارد ({inboundsCount})</span>
              </button>
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
              title={sortOrder === 'DESC' ? 'الترتيب: من الأحدث للأقدم' : 'الترتيب: من الأقدم للأحدث'}
              className="px-3 py-2 rounded-xl bg-[#1E293B] border border-[#334155] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              {sortOrder === 'DESC' ? (
                <>
                  <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
                  <span>الأحدث أولاً</span>
                </>
              ) : (
                <>
                  <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>الأقدم أولاً</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Timeline Flow Container */}
        <div className="relative pl-2 pr-2 sm:px-4 py-2">
          {timelineItems.length > 0 ? (
            <div className="relative border-r-2 border-dashed border-[#334155] mr-4 sm:mr-6 space-y-6">
              {timelineItems.map((doc, idx) => {
                const isIncoming = doc.doc_type === 'Incoming';
                const typeColor = isIncoming 
                  ? { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-500 shadow-purple-500/50' }
                  : { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30', dot: 'bg-sky-500 shadow-sky-500/50' };

                let statusBadge: { bg: string; text: string; label: string } = { bg: 'bg-slate-500/20', text: 'text-slate-300', label: doc.status };
                if (doc.status === 'Approved') statusBadge = { bg: 'bg-emerald-500/20', text: 'text-emerald-300', label: 'معتمد رسمياً' };
                else if (doc.status === 'Replied') statusBadge = { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'تم الرد' };
                else if (doc.status === 'Pending') statusBadge = { bg: 'bg-amber-500/20', text: 'text-amber-300', label: 'قيد الإجراء' };
                else if (doc.status === 'Draft') statusBadge = { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'مسودة' };

                return (
                  <motion.div
                    key={doc.doc_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="relative mr-5 sm:mr-8 group"
                  >
                    {/* Glowing Node Dot on the timeline line */}
                    <div className={`absolute -right-[27px] sm:-right-[39px] top-4 w-4 h-4 rounded-full border-2 border-[#0F172A] ${typeColor.dot} shadow-md transition-transform group-hover:scale-125 flex items-center justify-center`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-75" />
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-4 sm:p-5 shadow-lg hover:border-[#005B96]/60 transition-all space-y-3">
                      {/* Top Meta Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#334155]/60 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${typeColor.bg} ${typeColor.text} ${typeColor.border} flex items-center gap-1`}>
                            {isIncoming ? <Inbox className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                            <span>{isIncoming ? 'وارد' : 'صادر'}</span>
                          </span>

                          <span className="font-mono text-xs font-bold text-white bg-[#0F172A] px-2.5 py-0.5 rounded-md border border-[#334155]">
                            {doc.serial_number}
                          </span>

                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                            {getDocTypeLabel(doc.classification).ar}
                          </span>

                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                            {statusBadge.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-sky-400" />
                          <span>{doc.issue_date}</span>
                        </div>
                      </div>

                      {/* Subject */}
                      <div>
                        <h4 className="text-sm font-bold text-white leading-relaxed group-hover:text-sky-300 transition-colors">
                          {doc.subject}
                        </h4>
                        {doc.body_text && (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {doc.body_text}
                          </p>
                        )}
                      </div>

                      {/* Flow: Sender -> Receiver */}
                      <div className="p-3.5 rounded-xl bg-[#0F172A]/90 border border-[#334155]/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap min-w-0">
                          <div className="inline-flex items-center gap-1.5 shrink-0 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                            <span className="text-slate-400 text-[11px]">من:</span>
                            <span className="font-bold text-white">{doc.sender_entity}</span>
                          </div>

                          <ArrowLeft className="w-3.5 h-3.5 text-sky-400 shrink-0 mx-1" />

                          <div className="inline-flex items-center gap-1.5 shrink-0 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                            <span className="text-slate-400 text-[11px]">إلى:</span>
                            <span className="font-bold text-white">{doc.receiver_entity}</span>
                          </div>
                        </div>

                        {doc.external_ref_no && (
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 whitespace-nowrap shrink-0 self-start md:self-auto">
                            <span className="text-slate-400">مرجع خارجي:</span>
                            <strong className="text-slate-200">{doc.external_ref_no}</strong>
                          </div>
                        )}
                      </div>

                      {/* Parent Connection or Attachments Footer */}
                      <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                          {doc.parent_serial && (
                            <span className="flex items-center gap-1 text-sky-300">
                              <Link2 className="w-3.5 h-3.5 text-sky-400" />
                              <span>رداً على: {doc.parent_serial}</span>
                            </span>
                          )}

                          {doc.attachments && doc.attachments.length > 0 && (
                            <span className="flex items-center gap-1 text-emerald-300">
                              <Paperclip className="w-3 h-3 text-emerald-400" />
                              <span>{doc.attachments.length} مرفق</span>
                            </span>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onClose();
                            onOpenDocDossier(doc);
                          }}
                          className="text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 font-semibold text-xs"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          معاينة الخطاب
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#1E293B] rounded-2xl border border-[#334155] p-6 space-y-3">
              <FolderGit2 className="w-12 h-12 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">لا توجد مراسلات مسجلة لهذا المشروع بعد</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                عند تسجيل خطابات واردة أو اعتماد خطابات صادرة وربطها بكود المشروع [{project.project_code}] ستظهر هنا تلقائياً في دورة المراسلات الزمنية.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-[#334155]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            إغلاق
          </Button>
        </div>
      </div>
    </Modal>
  );
};
