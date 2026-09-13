// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Dedicated Outbound Drafting & Atomic Approval Suite
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db/firestoreService';
import { Correspondence } from '../../types/correspondence';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ActionIconButton } from '../common/ActionIconButton';
import { ProjectFilterBar } from '../common/ProjectFilterBar';
import { 
  Send, 
  Plus, 
  Search, 
  Stamp, 
  Eye, 
  CheckCircle2, 
  Clock, 
  FileText,
  Link2,
  Lock,
  Sparkles,
  FileEdit,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { getDocTypeLabel, formatDateTime } from '../../utils/formatters';

interface OutboundWorkspaceProps {
  onOpenDraftModal: () => void;
  onOpenDossier: (doc: Correspondence) => void;
  onQuickApprove: (doc: Correspondence) => void;
  onEditOutbound?: (doc: Correspondence) => void;
  onReturnOutbound?: (doc: Correspondence) => void;
}

export const OutboundWorkspace: React.FC<OutboundWorkspaceProps> = ({
  onOpenDraftModal,
  onOpenDossier,
  onQuickApprove,
  onEditOutbound,
  onReturnOutbound
}) => {
  const { currentUser, activeProjectId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'DRAFTS' | 'APPROVED'>('ALL');

  const outbounds = dbService.getCorrespondences({
    doc_type: 'Outgoing',
    user: currentUser || undefined
  });

  const filteredOutbounds = useMemo(() => {
    return outbounds.filter(item => {
      // Active Project Filter
      if (activeProjectId !== 'ALL' && item.project_ref !== activeProjectId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          item.serial_number.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          (item.parent_serial && item.parent_serial.toLowerCase().includes(q)) ||
          item.receiver_entity.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (filterTab === 'DRAFTS') {
        return item.is_draft || item.status === 'Draft' || item.status === 'Pending';
      }

      if (filterTab === 'APPROVED') {
        return item.status === 'Approved' && !item.is_draft;
      }

      return true;
    });
  }, [outbounds, searchQuery, filterTab, activeProjectId]);

  const draftsCount = outbounds.filter(c => c.is_draft || c.status === 'Draft' || c.status === 'Pending').length;
  const approvedCount = outbounds.filter(c => c.status === 'Approved' && !c.is_draft).length;
  const canApprove = currentUser?.system_role === 'Admin' || currentUser?.system_role === 'Project_Manager';

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Quick Action */}
      <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-[#A7CCB5]/20 text-[#A7CCB5] border border-[#A7CCB5]/40 shrink-0">
            <Send className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#A7CCB5] font-mono tracking-wide">
                ATOMIC NUMBERING & DRAFTING SUITE
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-black/40 text-[#D8E3E9] border border-[#334155]">
                منع إهدار الأرقام التسلسلية
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              مسودات واعتماد الصادر
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              تحرير مسودات الخطابات ومراجعتها واعتمادها لحجز الرقم الصادر المعتمد وإغلاق دورة المعاملة
            </p>
          </div>
        </div>

        <Button
          variant="mint"
          size="lg"
          onClick={onOpenDraftModal}
          leftIcon={<Plus className="w-5 h-5 text-[#0F172A]" />}
          className="font-bold shadow-lg shadow-[#A7CCB5]/10 shrink-0"
        >
          تحرير مسودة صادر جديدة
        </Button>
      </div>

      {/* 2. Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">إجمالي المعاملات الصادرة</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{outbounds.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#005B96]/20 text-[#005B96]">
            <Send className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">مسودات قيد المراجعة والاعتماد</span>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{draftsCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">صادر معتمد ومختوم رسمياً</span>
            <div className="text-2xl font-bold text-[#A7CCB5] font-mono mt-1">{approvedCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#A7CCB5]/10 text-[#A7CCB5]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Project Selector Bar */}
      <ProjectFilterBar 
        scopeLabel="مسودات واعتماد الصادر" 
        correspondences={outbounds} 
      />

      {/* 3. Filter Tabs & Search */}
      <div className="p-4 rounded-xl bg-[#1E293B] border border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0F172A] rounded-xl border border-[#334155] w-full sm:w-auto">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'ALL' 
                ? 'bg-[#005B96] text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            الكل ({outbounds.length})
          </button>

          <button
            onClick={() => setFilterTab('DRAFTS')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'DRAFTS' 
                ? 'bg-amber-500 text-black shadow-sm font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            المسودات ({draftsCount})
          </button>

          <button
            onClick={() => setFilterTab('APPROVED')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'APPROVED' 
                ? 'bg-[#A7CCB5] text-[#0F172A] shadow-sm font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            المعتمد رسمياً ({approvedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالرقم، المسودة، الموضوع، أو المستلم..."
            className="w-full px-4 py-2 pl-9 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#005B96]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* 4. Outbound Records List */}
      <div className="space-y-3">
        {filteredOutbounds.length === 0 ? (
          <div className="p-12 text-center bg-[#1E293B] rounded-2xl border border-[#334155] text-slate-400">
            <Send className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-bold text-white">لا توجد معاملات صادرة مطابقة للبحث</p>
            <p className="text-xs text-slate-400 mt-1">
              اضغط على زر "تحرير مسودة صادر جديدة" للبدء في كتابة خطابك.
            </p>
          </div>
        ) : (
          filteredOutbounds.map(item => {
            const typeInfo = getDocTypeLabel(item.classification);
            const isDraft = item.is_draft || item.status === 'Draft' || item.status === 'Pending';

            return (
              <div
                key={item.doc_id}
                className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] hover:border-[#005B96]/80 hover:bg-[#1E293B]/95 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_36px_-8px_rgba(0,91,150,0.35)] flex flex-col lg:flex-row lg:items-center justify-between gap-4 group/card relative"
              >
                {/* Right Decorative Accent on Hover */}
                <div className={`absolute inset-y-3 right-0 w-1 rounded-l-full bg-transparent transition-all duration-300 opacity-0 group-hover/card:opacity-100 ${
                  isDraft ? 'group-hover/card:bg-gradient-to-b group-hover/card:from-amber-400 group-hover/card:to-amber-600' : 'group-hover/card:bg-gradient-to-b group-hover/card:from-[#38BDF8] group-hover/card:to-[#A7CCB5]'
                }`} />

                {/* Right Info */}
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 transition-all duration-300 group-hover/card:scale-110 ${
                    isDraft 
                      ? 'bg-amber-500/15 text-amber-400 group-hover/card:bg-amber-500/25 group-hover/card:shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                      : 'bg-[#A7CCB5]/15 text-[#A7CCB5] group-hover/card:bg-[#A7CCB5]/25 group-hover/card:shadow-[0_0_15px_rgba(167,204,181,0.4)]'
                  }`}>
                    {isDraft ? <FileText className="w-5 h-5" /> : <Stamp className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1.5">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`serial-code text-xs font-bold px-2 py-0.5 rounded border ${
                        isDraft 
                          ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' 
                          : 'text-[#A7CCB5] bg-[#0F172A] border-[#334155]'
                      }`}>
                        {item.serial_number}
                      </span>

                      <Badge variant="slate" size="sm">
                        {typeInfo.ar}
                      </Badge>

                      <Badge
                        variant={item.priority === 'Immediate' ? 'danger' : item.priority === 'Urgent' ? 'warning' : 'neutral'}
                        size="sm"
                      >
                        {item.priority === 'Immediate' ? 'فوري' : item.priority === 'Urgent' ? 'عاجل' : 'عادي'}
                      </Badge>

                      {item.status === 'Rejected' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          مُعاد للمراجعة والتصحيح
                        </span>
                      ) : isDraft ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          مسودة قيد المراجعة
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#A7CCB5]/20 text-[#A7CCB5] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>معتمد</span>
                        </span>
                      )}

                      {/* Parent Cross-Reference Tag */}
                      {item.parent_serial && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                          <Link2 className="w-3 h-3" />
                          <span>رد على: {item.parent_serial}</span>
                        </span>
                      )}
                    </div>

                    {/* Subject */}
                    <h3 className="text-sm font-bold text-white leading-snug group-hover/card:text-sky-200 transition-colors duration-200">
                      {item.subject}
                    </h3>

                    {/* Metadata Subline */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-medium">
                      <span>الجهة الموجه إليها: <strong className="text-slate-300">{item.receiver_entity}</strong></span>
                      <span>•</span>
                      <span>المحرر: <strong className="text-slate-300">{item.created_by_name}</strong></span>
                      {item.approved_by_name && (
                        <>
                          <span>•</span>
                          <span>المعتمد: <strong className="text-[#A7CCB5]">{item.approved_by_name}</strong></span>
                        </>
                      )}
                      <span>•</span>
                      <span>التاريخ: <span className="serial-code text-slate-300">{item.issue_date}</span></span>
                    </div>

                    {/* Review remarks alert if returned */}
                    {item.status === 'Rejected' && item.review_remarks && (
                      <div className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs flex items-start gap-2.5 text-rose-200">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-300">ملاحظات وتوجيهات المراجعة:</span>
                            {item.returned_by_name && (
                              <span className="text-[10px] text-rose-200/70">
                                (بواسطة: {item.returned_by_name})
                              </span>
                            )}
                          </div>
                          <p className="text-slate-200 leading-relaxed">{item.review_remarks}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Left Actions (Icon-Only with Animated Tooltips) */}
                <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#334155]/60 justify-end">
                  <ActionIconButton
                    icon={<Eye className="w-4 h-4 text-sky-400" />}
                    label="عرض الملف والوثيقة"
                    variant="blue"
                    onClick={() => onOpenDossier(item)}
                  />

                  {/* Edit button: for any unapproved or rejected outbound */}
                  {(isDraft || item.status === 'Rejected') && onEditOutbound && (
                    <ActionIconButton
                      icon={<FileEdit className="w-4 h-4 text-amber-400" />}
                      label="تعديل المسودة"
                      variant="amber"
                      onClick={() => onEditOutbound(item)}
                    />
                  )}

                  {/* Manager Return for revision button */}
                  {isDraft && item.status !== 'Rejected' && canApprove && onReturnOutbound && (
                    <ActionIconButton
                      icon={<RotateCcw className="w-4 h-4 text-rose-400" />}
                      label="إرجاع للمراجعة والتصحيح"
                      variant="rose"
                      onClick={() => onReturnOutbound(item)}
                    />
                  )}

                  {/* If draft and user has PM/Admin role, show one-click approval trigger */}
                  {isDraft && canApprove && (
                    <ActionIconButton
                      icon={<Stamp className="w-4 h-4 text-[#0F172A]" />}
                      label="اعتماد وإنشاء الرقم الصادر"
                      variant="mint"
                      tooltipAlign="left"
                      onClick={() => onQuickApprove(item)}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
