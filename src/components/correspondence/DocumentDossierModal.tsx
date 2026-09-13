// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Document Dossier & Contractual Thread Visualizer Modal
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Correspondence } from '../../types/correspondence';
import { dbService } from '../../services/db/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { DocumentQRCode } from '../common/DocumentQRCode';
import { 
  FileText, 
  Download, 
  Printer, 
  Link2, 
  CheckCircle2, 
  Calendar, 
  User, 
  Building, 
  ShieldCheck,
  QrCode,
  ArrowDown,
  Clock,
  Layers,
  Eye,
  ArrowLeftRight,
  FileEdit,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { getDocTypeLabel, formatDateTime } from '../../utils/formatters';
import { CorrespondenceCycleVisualizer } from './CorrespondenceCycleVisualizer';
import { buildCorrespondenceThread } from '../../services/correspondence/correspondenceGraph';

interface DocumentDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Correspondence | null;
  onReply?: (doc: Correspondence) => void;
  onRecordInboundReply?: (outboundDoc: Correspondence) => void;
  onEdit?: (doc: Correspondence) => void;
  onReturnForRevision?: (doc: Correspondence) => void;
}

export const DocumentDossierModal: React.FC<DocumentDossierModalProps> = ({
  isOpen,
  onClose,
  document,
  onReply,
  onRecordInboundReply,
  onEdit,
  onReturnForRevision
}) => {
  const { currentUser } = useAuth();
  if (!document) return null;

  // Active document being viewed in this dossier
  const [activeDoc, setActiveDoc] = useState<Correspondence>(document);

  // Sync active document when prop changes
  useEffect(() => {
    if (document) {
      setActiveDoc(document);
    }
  }, [document]);

  const allDocs = dbService.getCorrespondences();
  const thread = buildCorrespondenceThread(activeDoc.doc_id, allDocs);

  const typeInfo = getDocTypeLabel(activeDoc.classification);
  const isIncoming = activeDoc.doc_type === 'Incoming';
  const canManageReview = currentUser?.system_role === 'Admin' || currentUser?.system_role === 'Project_Manager';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`ملف المعاملة الهندسية • ${activeDoc.serial_number}`}
      subtitle={activeDoc.project_name ? `مشروع: ${activeDoc.project_name} [${activeDoc.project_ref}]` : `مشروع كود [${activeDoc.project_ref}]`}
      maxWidth="6xl"
    >
      <div className="space-y-6">
        {/* 1. Header Card with Active Document Status */}
        <div className="p-6 rounded-2xl bg-[#0B1120] text-white border border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#005B96]/25 rounded-full blur-2xl pointer-events-none" />

          <div className="z-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isIncoming ? 'bg-blue-500/20 text-sky-300 border border-blue-400/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
              }`}>
                {isIncoming ? 'وارد' : 'صادر'}
              </span>
              <span className="text-xs text-slate-200 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-semibold">
                {typeInfo.ar}
              </span>
              {activeDoc.status === 'Rejected' ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs bg-rose-500/25 text-rose-300 font-bold border border-rose-500/50 flex items-center gap-1 shadow-[0_0_8px_rgba(244,63,94,0.2)]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>مُعاد للمراجعة والتصحيح</span>
                </span>
              ) : activeDoc.is_draft || activeDoc.status === 'Draft' ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs bg-amber-500/25 text-amber-300 font-bold border border-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                  مسودة
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/50 flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>معتمد</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-white">
              <span dir="ltr" className="serial-code">{activeDoc.serial_number}</span>
            </h2>

            {activeDoc.external_ref_no && (
              <p className="text-xs text-slate-300 mt-1">
                رقم المرجع الخارجي للجهة: <strong dir="ltr" className="text-white serial-code font-bold">{activeDoc.external_ref_no}</strong>
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="z-10 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-[#334155] text-slate-200 hover:bg-[#1E293B]"
              leftIcon={<Printer className="w-4 h-4" />}
            >
              طباعة الخطاب
            </Button>

            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(activeDoc);
                }}
                className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 font-medium"
                leftIcon={<FileEdit className="w-4 h-4 text-amber-400" />}
              >
                تعديل الخطاب
              </Button>
            )}

            {canManageReview && onReturnForRevision && activeDoc.status !== 'Rejected' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onReturnForRevision(activeDoc);
                }}
                className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                leftIcon={<RotateCcw className="w-4 h-4 text-rose-400" />}
              >
                إرجاع للمراجعة
              </Button>
            )}

            {isIncoming && onReply && (
              <Button
                variant="mint"
                size="sm"
                onClick={() => {
                  onClose();
                  onReply(activeDoc);
                }}
                leftIcon={<Link2 className="w-4 h-4 text-[#0F172A]" />}
              >
                إعداد رد صادر مرتبط
              </Button>
            )}

            {!isIncoming && onRecordInboundReply && (
              <Button
                variant="mint"
                size="sm"
                onClick={() => {
                  onClose();
                  onRecordInboundReply(activeDoc);
                }}
                leftIcon={<Link2 className="w-4 h-4 text-[#0F172A]" />}
              >
                تسجيل وارد رداً على هذا الصادر
              </Button>
            )}
          </div>
        </div>

        {/* 2. Interactive Correspondence History Cycle (Thread Tree & Dual Party Timeline) */}
        {thread && thread.total_turns > 0 && (
          <CorrespondenceCycleVisualizer
            thread={thread}
            activeDocId={activeDoc.doc_id}
            onSelectDoc={(doc) => setActiveDoc(doc)}
            onReplyToDoc={(doc) => {
              onClose();
              if (doc.doc_type === 'Incoming' && onReply) {
                onReply(doc);
              } else if (doc.doc_type === 'Outgoing' && onRecordInboundReply) {
                onRecordInboundReply(doc);
              }
            }}
          />
        )}

        {/* 3. Split-View Details & Embedded Document Preview (Smooth Motion Transition on Active Doc Switch) */}
        <motion.div 
          key={activeDoc.doc_id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Metadata Specification Sheet */}
          <div className="space-y-4">
            {activeDoc.review_remarks && (
              <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>ملاحظات التدقيق والمراجعة:</span>
                  </div>
                  {activeDoc.returned_by_name && (
                    <span className="text-[10px] text-rose-300/80">
                      (بواسطة: {activeDoc.returned_by_name} {activeDoc.returned_at ? `• ${activeDoc.returned_at}` : ''})
                    </span>
                  )}
                </div>
                <p className="text-slate-200 leading-relaxed whitespace-pre-line pr-6">
                  {activeDoc.review_remarks}
                </p>
              </div>
            )}

            <div className="p-5 rounded-xl bg-[#1E293B] border border-[#334155] space-y-3">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                بيانات الخطاب
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-slate-400 text-[11px]">الجهة المصدرة / الراسلة:</span>
                  <span className="font-semibold text-slate-200">{activeDoc.sender_entity}</span>
                </div>

                <div>
                  <span className="block text-slate-400 text-[11px]">الجهة المستلمة / الموجه إليها:</span>
                  <span className="font-semibold text-slate-200">{activeDoc.receiver_entity}</span>
                </div>

                <div>
                  <span className="block text-slate-400 text-[11px]">تاريخ التحرير:</span>
                  <span className="font-mono font-semibold text-slate-200">{activeDoc.issue_date}</span>
                </div>

                <div>
                  <span className="block text-slate-400 text-[11px]">تاريخ استحقاق الرد:</span>
                  {activeDoc.due_date ? (
                    <span dir="ltr" className="serial-code font-semibold text-amber-300">
                      {formatDateTime(activeDoc.due_date)}
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-400">
                      غير محدد
                    </span>
                  )}
                </div>

                <div>
                  <span className="block text-slate-400 text-[11px]">المحرر المسؤول:</span>
                  <span className="font-semibold text-slate-200">{activeDoc.created_by_name}</span>
                </div>

                <div>
                  <span className="block text-slate-400 text-[11px]">حالة الاعتماد:</span>
                  {isIncoming ? (
                    <span className="font-semibold text-sky-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>وارد مقيد بالمنظومة</span>
                    </span>
                  ) : activeDoc.approved_by_name ? (
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{activeDoc.approved_by_name} (معتمد)</span>
                    </span>
                  ) : (
                    <span className="font-semibold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>قيد المراجعة والاعتماد</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Subject Title */}
              <div className="pt-2 border-t border-[#334155]">
                <span className="block text-slate-400 text-[11px]">الموضوع والبيان:</span>
                <p className="text-sm font-bold text-white mt-0.5">{activeDoc.subject}</p>
              </div>

              {/* Body Text */}
              {activeDoc.body_text && (
                <div className="pt-2 border-t border-[#334155]">
                  <span className="block text-slate-400 text-[11px]">مضمون الخطاب:</span>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed whitespace-pre-line p-3 rounded-lg bg-[#0F172A] border border-[#334155]">
                    {activeDoc.body_text}
                  </p>
                </div>
              )}
            </div>

            {/* Attachments Section */}
            <div className="p-4 rounded-xl bg-[#1E293B] border border-[#334155]">
              <h4 className="text-xs font-bold text-sky-400 tracking-wider mb-2 flex items-center justify-between">
                <span>المرفقات الهندسية:</span>
                <span className="text-[11px] text-slate-400 font-normal">{activeDoc.attachments?.length || 0} ملفات</span>
              </h4>

              {!activeDoc.attachments || activeDoc.attachments.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">لا توجد مرفقات مرفوعة مع هذه المعاملة</p>
              ) : (
                <div className="space-y-2">
                  {activeDoc.attachments.map(att => (
                    <div
                      key={att.file_id}
                      className="p-2.5 rounded-lg bg-[#0F172A] border border-[#334155] flex items-center justify-between text-xs hover:bg-[#1E293B]/80 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="text-slate-200 font-medium truncate">{att.file_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({att.file_size_mb} MB)</span>
                      </div>
                      <a
                        href={att.storage_direct_url}
                        download={att.file_name}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:underline font-semibold flex items-center gap-1 text-[11px] shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تحميل</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Integrated Document Viewer (Printable Preview & Verification) */}
          <div className="border border-[#334155] rounded-xl bg-[#0B1120] p-6 shadow-md flex flex-col justify-between min-h-[420px] relative overflow-hidden">
            {/* Engineering Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
              <span className="text-8xl font-black rotate-[-30deg] text-sky-400">PCMS</span>
            </div>

            {/* Top Official Header */}
            <div>
              <div className="flex items-start justify-between border-b pb-4 border-[#334155]">
                <div className="text-right">
                  <h3 className="font-bold text-sm text-white">مركز استشارات العفيفي الهندسي</h3>
                  <p className="text-[11px] text-[#8097AE]">قطاع إدارة المشروعات والمكتب الفني</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">مشروع: {activeDoc.project_name || activeDoc.project_ref}</p>
                </div>
                <div className="text-left font-mono text-[11px]">
                  <div className="font-bold text-sky-400">
                    <span dir="ltr" className="serial-code">{activeDoc.serial_number}</span>
                  </div>
                  <div className="text-slate-400">{activeDoc.issue_date}</div>
                </div>
              </div>

              {/* Printable Body */}
              <div className="py-6 space-y-3">
                <div className="text-xs font-semibold text-slate-300">
                  السادة / {activeDoc.receiver_entity} المحترمين
                </div>
                <div className="text-xs font-bold text-sky-400 border-r-2 border-sky-400 pr-2">
                  الموضوع: {activeDoc.subject}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line pt-2">
                  {activeDoc.body_text || 'تحية طيبة وبعد، نحيط سيادتكم علماً بالإجراءات المتخذة حيال المعاملة المذكورة أعلاه وفق الأصول الهندسية المعتمدة.'}
                </p>
              </div>
            </div>

            {/* Bottom Signature & QR Verification */}
            <div className="border-t border-[#334155] pt-4 flex items-center justify-between">
              {/* Right: Responsible Entity / Signature */}
              <div className="text-right">
                {isIncoming ? (
                  <>
                    <div className="text-[11px] text-slate-400">مكتب ضبط واستلام المستندات:</div>
                    <div className="text-xs font-bold text-sky-300">
                      {activeDoc.created_by_name || 'قيد وتسجيل رسمي بالمنظومة'}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[11px] text-slate-400">
                      {activeDoc.approved_by_name ? 'مدير المشروع المعتمد:' : 'حالة الاعتماد:'}
                    </div>
                    <div className={`text-xs font-bold ${activeDoc.approved_by_name ? 'text-white' : 'text-amber-400'}`}>
                      {activeDoc.approved_by_name || 'بانتظار اعتماد مدير المشروع'}
                    </div>
                  </>
                )}
              </div>

              {/* Left: Dynamic QR Code & Exact State Label */}
              <div className="flex items-center gap-3">
                <DocumentQRCode
                  documentSerial={activeDoc.serial_number}
                  projectName={activeDoc.project_name || activeDoc.project_ref}
                  date={activeDoc.issue_date}
                  approvedBy={isIncoming ? 'وارد مسجل' : activeDoc.approved_by_name}
                  size={72}
                />
                <div className="text-[10px] text-slate-300 leading-tight">
                  {isIncoming ? (
                    <>
                      <div className="text-sky-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>معاملة واردة مسجلة</span>
                      </div>
                      <div className="text-slate-400 text-[9px] mt-0.5">امسح الكود بالهاتف للتحقق</div>
                    </>
                  ) : activeDoc.is_draft || activeDoc.status === 'Draft' || !activeDoc.approved_by_name ? (
                    <>
                      <div className="text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>مسودة قيد المراجعة</span>
                      </div>
                      <div className="text-slate-400 text-[9px] mt-0.5">رمز مؤقت للمعاينة</div>
                    </>
                  ) : (
                    <>
                      <div className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>خطاب صادر معتمد</span>
                      </div>
                      <div className="text-slate-400 text-[9px] mt-0.5">امسح الكود بالهاتف للتحقق</div>
                    </>
                  )}
                  <div className="font-mono text-slate-500 text-[9px] mt-0.5">ID: #{activeDoc.doc_id.substring(0, 8)}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Modal>
  );
};
