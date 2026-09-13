// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Dedicated Inbound Intake & Registry Workspace
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
  Inbox, 
  Plus, 
  Search, 
  Reply, 
  Eye, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  FileText,
  Building2,
  CheckCircle2,
  FileEdit,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { getDocTypeLabel, formatDateTime } from '../../utils/formatters';

interface InboundWorkspaceProps {
  onOpenIntakeModal: () => void;
  onOpenDossier: (doc: Correspondence) => void;
  onReplyToInbound: (inboundDoc: Correspondence) => void;
  onEditInbound?: (doc: Correspondence) => void;
  onReturnInbound?: (doc: Correspondence) => void;
}

export const InboundWorkspace: React.FC<InboundWorkspaceProps> = ({
  onOpenIntakeModal,
  onOpenDossier,
  onReplyToInbound,
  onEditInbound,
  onReturnInbound
}) => {
  const { currentUser, activeProjectId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassification, setSelectedClassification] = useState('ALL');

  const inbounds = dbService.getCorrespondences({
    doc_type: 'Incoming',
    user: currentUser || undefined
  });
  const allCorrespondences = dbService.getCorrespondences();

  const filteredInbounds = useMemo(() => {
    return inbounds.filter(item => {
      // Active Project Filter
      if (activeProjectId !== 'ALL' && item.project_ref !== activeProjectId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          item.serial_number.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          (item.external_ref_no && item.external_ref_no.toLowerCase().includes(q)) ||
          item.sender_entity.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedClassification !== 'ALL' && item.classification !== selectedClassification) {
        return false;
      }
      return true;
    });
  }, [inbounds, searchQuery, selectedClassification, activeProjectId]);

  const urgentCount = inbounds.filter(c => c.priority === 'Immediate' || c.priority === 'Urgent').length;
  const pendingReplyCount = inbounds.filter(c => c.status !== 'Replied' && c.status !== 'Closed').length;
  const canManageReview = currentUser?.system_role === 'Admin' || currentUser?.system_role === 'Project_Manager';

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Quick Action */}
      <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-[#005B96]/20 text-[#005B96] border border-[#005B96]/40 shrink-0">
            <Inbox className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#A7CCB5] font-mono tracking-wide">
                INBOUND INTAKE PIPELINE
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#005B96]/20 text-[#D8E3E9] border border-[#005B96]/30">
                فحص منع التكرار نشط
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              منظومة تسجيل الوارد وتتبع المعاملات
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              تسجيل الخطابات والاعتمادات الواردة من المالك والمقاولين مع ربط المعاملات ورفع المرفقات
            </p>
          </div>
        </div>

        <Button
          variant="mint"
          size="lg"
          onClick={onOpenIntakeModal}
          leftIcon={<Plus className="w-5 h-5 text-[#0F172A]" />}
          className="font-bold shadow-lg shadow-[#A7CCB5]/10 shrink-0"
        >
          تسجيل خطاب وارد جديد
        </Button>
      </div>

      {/* 2. Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">إجمالي الوارد المسجل</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{inbounds.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">وارد عاجل / فوري</span>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{urgentCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">قيد إعداد الرد</span>
            <div className="text-2xl font-bold text-[#A7CCB5] font-mono mt-1">{pendingReplyCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#A7CCB5]/10 text-[#A7CCB5]">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Project Selector Bar */}
      <ProjectFilterBar 
        scopeLabel="الوارد" 
        correspondences={inbounds} 
      />

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-[#1E293B] border border-[#334155] flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الوارد، المرجع الخارجي، الجهة الراسلة، أو الموضوع..."
            className="w-full px-4 py-2.5 pl-10 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#005B96]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#005B96]"
          >
            <option value="ALL">كافة التصنيفات</option>
            <option value="LTR">LTR - خطابات رسمية</option>
            <option value="SUB">SUB - اعتمادات مواد وفنية</option>
            <option value="RFI">RFI - استفسارات فنية</option>
            <option value="IPC">IPC - مستخلصات مالية</option>
            <option value="MOM">MOM - محاضر اجتماعات</option>
            <option value="TRANS">TRANS - مذكرات إرسال</option>
            <option value="SITE">SITE - ملاحظات موقعية</option>
          </select>
        </div>
      </div>

      {/* 4. Inbound Records Cards / Table */}
      <div className="space-y-3">
        {filteredInbounds.length === 0 ? (
          <div className="p-12 text-center bg-[#1E293B] rounded-2xl border border-[#334155] text-slate-400">
            <Inbox className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-bold text-white">لا توجد خطابات واردة مطابقة للبحث</p>
            <p className="text-xs text-slate-400 mt-1">
              يمكنك الضغط على زر "تسجيل خطاب وارد جديد" أعلاه لبدء تسجيل أول معاملة.
            </p>
          </div>
        ) : (
          filteredInbounds.map(item => {
            const typeInfo = getDocTypeLabel(item.classification);
            const replyCount = allCorrespondences.filter(c => c.parent_doc_id === item.doc_id).length;
            const isReplied = item.status === 'Replied' || replyCount > 0;

            return (
              <div
                key={item.doc_id}
                className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] hover:border-[#005B96]/80 hover:bg-[#1E293B]/95 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_36px_-8px_rgba(0,91,150,0.35)] flex flex-col lg:flex-row lg:items-center justify-between gap-4 group/card relative"
              >
                {/* Right Decorative Accent on Hover */}
                <div className="absolute inset-y-3 right-0 w-1 rounded-l-full bg-transparent group-hover/card:bg-gradient-to-b group-hover/card:from-[#38BDF8] group-hover/card:to-[#A7CCB5] transition-all duration-300 opacity-0 group-hover/card:opacity-100" />

                {/* Right Info */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#005B96]/15 text-[#005B96] shrink-0 mt-0.5 group-hover/card:scale-110 group-hover/card:bg-[#005B96]/25 group-hover/card:text-sky-300 group-hover/card:shadow-[0_0_15px_rgba(0,91,150,0.4)] transition-all duration-300">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="serial-code text-xs font-bold text-[#A7CCB5] bg-[#0F172A] px-2 py-0.5 rounded border border-[#334155]">
                        {item.serial_number}
                      </span>

                      {item.external_ref_no && (
                        <span className="serial-code text-[11px] text-slate-300 font-mono bg-[#0F172A] px-2 py-0.5 rounded border border-[#334155]">
                          مرجع: {item.external_ref_no}
                        </span>
                      )}

                      <Badge variant="slate" size="sm">
                        {typeInfo.ar}
                      </Badge>

                      <Badge
                        variant={item.priority === 'Immediate' ? 'danger' : item.priority === 'Urgent' ? 'warning' : 'neutral'}
                        pulse={item.priority === 'Immediate'}
                        size="sm"
                      >
                        {item.priority === 'Immediate' ? 'فوري' : item.priority === 'Urgent' ? 'عاجل' : 'عادي'}
                      </Badge>

                      {item.status === 'Rejected' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          مُعاد للمراجعة والتصحيح
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isReplied ? 'bg-[#A7CCB5]/20 text-[#A7CCB5]' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {isReplied ? 'تم الرد' : 'بانتظار الرد'}
                        </span>
                      )}
                    </div>

                    {/* Subject */}
                    <h3 className="text-sm font-bold text-white leading-snug group-hover/card:text-sky-200 transition-colors duration-200">
                      {item.subject}
                    </h3>

                    {/* Metadata Subline */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-medium">
                      <span>من: <strong className="text-slate-300">{item.sender_entity}</strong></span>
                      <span>•</span>
                      <span>إلى: <strong className="text-slate-300">{item.receiver_entity}</strong></span>
                      <span>•</span>
                      <span>تاريخ التحرير: <span className="serial-code text-slate-300">{item.issue_date}</span></span>
                      <span>•</span>
                      <span className="text-[#A7CCB5]">({item.attachments?.length || 0}) مرفقات</span>
                      <span>•</span>
                      <span className={replyCount > 0 ? 'text-sky-300 font-semibold' : 'text-slate-400'}>
                        ({replyCount}) {replyCount === 1 ? 'رد' : replyCount === 2 ? 'ردان' : 'ردود'}
                      </span>
                    </div>

                    {/* Review remarks alert if returned */}
                    {item.status === 'Rejected' && item.review_remarks && (
                      <div className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs flex items-start gap-2.5 text-rose-200">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-300">ملاحظات المراجعة وتوجيهات التصحيح:</span>
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

                {/* Left Action Buttons (Icon-Only with Animated Tooltips) */}
                <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#334155]/60 justify-end">
                  <ActionIconButton
                    icon={<Eye className="w-4 h-4 text-sky-400" />}
                    label="عرض الملف والوثيقة"
                    variant="blue"
                    onClick={() => onOpenDossier(item)}
                  />

                  {onEditInbound && (
                    <ActionIconButton
                      icon={<FileEdit className="w-4 h-4 text-amber-400" />}
                      label="تعديل المعاملة"
                      variant="amber"
                      onClick={() => onEditInbound(item)}
                    />
                  )}

                  {canManageReview && onReturnInbound && item.status !== 'Rejected' && (
                    <ActionIconButton
                      icon={<RotateCcw className="w-4 h-4 text-rose-400" />}
                      label="إرجاع للمراجعة والتصحيح"
                      variant="rose"
                      onClick={() => onReturnInbound(item)}
                    />
                  )}

                  <ActionIconButton
                    icon={<Reply className="w-4 h-4 text-[#0F172A]" />}
                    label="إعداد رد صادر"
                    variant="mint"
                    tooltipAlign="left"
                    onClick={() => onReplyToInbound(item)}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
