// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Outbound Drafting & Atomic Numbering Approval Ceremony
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { dbService } from '../../services/db/firestoreService';
import { storageService } from '../../services/storage/simulatedStorage';
import { DocType, Priority, Attachment, Correspondence } from '../../types/correspondence';
import { 
  UploadCloud, 
  FileText, 
  Trash2,
  Lock,
  Calendar,
  AlertTriangle,
  Link2,
  CheckCircle2,
  Edit3,
  Stamp,
  FileEdit
} from 'lucide-react';
import { DocumentQRCode } from '../common/DocumentQRCode';

interface OutboundDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  existingDraft?: Correspondence | null;
  parentInboundId?: string | null;
}

const STANDARD_ENTITIES = [
  'CON (مركز استشارات العفيفي)',
  'CTR (شركة المقاول العام)',
  'وزارة الداخلية - قطاع المشروعات (المالك)',
  'CTR (شركة النيل العامة للإنشاء والرصف)',
  'استشاري ضبط الجودة والمواد'
];

export const OutboundDraftModal: React.FC<OutboundDraftModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  existingDraft,
  parentInboundId
}) => {
  const { currentUser, activeProjectId } = useAuth();
  const { success, error, warning } = useNotification();
  const projects = dbService.getProjects();
  const allInbounds = dbService.getCorrespondences({ doc_type: 'Incoming' });

  const registeredEntities: string[] = useMemo(() => {
    const list = dbService.getEntities();
    const formatted = list.map(e => `${e.code} (${e.name})`);
    return Array.from(new Set([...formatted, ...STANDARD_ENTITIES]));
  }, [isOpen]);

  const [projectRef, setProjectRef] = useState<string>(existingDraft?.project_ref || activeProjectId);
  const [classification, setClassification] = useState<DocType>(existingDraft?.classification || 'LTR');
  const [parentDocId, setParentDocId] = useState<string>(existingDraft?.parent_doc_id || parentInboundId || '');
  const [senderEntity, setSenderEntity] = useState(existingDraft?.sender_entity || 'CON (مركز استشارات العفيفي)');
  const [receiverEntity, setReceiverEntity] = useState(existingDraft?.receiver_entity || 'CTR (شركة المقاول العام)');
  const [originatorCode] = useState(existingDraft?.originator_code || 'CON');
  const [recipientCode] = useState(existingDraft?.recipient_code || 'CTR');
  const [subject, setSubject] = useState(existingDraft?.subject || '');
  const [bodyText, setBodyText] = useState(existingDraft?.body_text || '');
  const [priority, setPriority] = useState<Priority>(existingDraft?.priority || 'Urgent');
  const [issueDate, setIssueDate] = useState(existingDraft?.issue_date || new Date().toISOString().split('T')[0]);
  const [attachments, setAttachments] = useState<Attachment[]>(existingDraft?.attachments || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Official Approval Stamping Ceremony State
  const [isStampingCeremony, setIsStampingCeremony] = useState(false);
  const [approvedSerial, setApprovedSerial] = useState<string | null>(null);

  const canApprove = currentUser?.system_role === 'Admin' || currentUser?.system_role === 'Project_Manager';

  // Automatically synchronize modal state whenever it opens or props change
  useEffect(() => {
    if (isOpen) {
      if (existingDraft) {
        setProjectRef(existingDraft.project_ref || activeProjectId);
        setClassification(existingDraft.classification || 'LTR');
        setParentDocId(existingDraft.parent_doc_id || '');
        setSenderEntity(existingDraft.sender_entity || 'CON (مركز استشارات العفيفي)');
        setReceiverEntity(existingDraft.receiver_entity || 'CTR (شركة المقاول العام)');
        setSubject(existingDraft.subject || '');
        setBodyText(existingDraft.body_text || '');
        setPriority(existingDraft.priority || 'Urgent');
        setIssueDate(existingDraft.issue_date || new Date().toISOString().split('T')[0]);
        setAttachments(existingDraft.attachments || []);
      } else if (parentInboundId) {
        const parentDoc = allInbounds.find(d => d.doc_id === parentInboundId) || dbService.getCorrespondenceById(parentInboundId);
        setParentDocId(parentInboundId);
        if (parentDoc) {
          setProjectRef(parentDoc.project_ref || activeProjectId);
          setSenderEntity('CON (مركز استشارات العفيفي)');
          setReceiverEntity(parentDoc.sender_entity || 'CTR (شركة المقاول العام)');
          setClassification(parentDoc.classification || 'LTR');
          setPriority(parentDoc.priority || 'Urgent');
          setSubject(`الرد على: ${parentDoc.subject}`);
          setBodyText('');
          setAttachments([]);
        }
      } else {
        setParentDocId('');
        setProjectRef(activeProjectId);
        setSenderEntity('CON (مركز استشارات العفيفي)');
        setReceiverEntity('CTR (شركة المقاول العام)');
        setClassification('LTR');
        setPriority('Urgent');
        setSubject('');
        setBodyText('');
        setAttachments([]);
      }
      setIsStampingCeremony(false);
      setApprovedSerial(null);
    }
  }, [isOpen, parentInboundId, existingDraft, activeProjectId]);

  // Handle manual change of parent document dropdown
  const handleParentDocChange = (newParentId: string) => {
    setParentDocId(newParentId);
    if (newParentId) {
      const selectedParent = allInbounds.find(d => d.doc_id === newParentId) || dbService.getCorrespondenceById(newParentId);
      if (selectedParent) {
        setProjectRef(selectedParent.project_ref);
        setReceiverEntity(selectedParent.sender_entity);
        if (!subject.trim() || subject.startsWith('الرد على:')) {
          setSubject(`الرد على: ${selectedParent.subject}`);
        }
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadRes = await storageService.uploadFile(file, projectRef, 'Outbound');
      const newAtt: Attachment = {
        file_id: uploadRes.file_id,
        doc_ref: 'pending-outbound',
        file_name: uploadRes.file_name,
        file_size_mb: uploadRes.file_size_mb,
        storage_direct_url: uploadRes.storage_direct_url,
        file_category: 'Outbound Technical Submittal',
        upload_timestamp: uploadRes.upload_timestamp
      };
      setAttachments(prev => [...prev, newAtt]);
      success('تم رفع المرفق الصادر بنجاح', file.name);
    } catch (err: any) {
      error('فشل الرفع', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Save Draft (DRAFT-XXXX)
  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!subject.trim()) {
      error('يرجى كتابة موضوع الخطاب');
      return;
    }

    setIsSubmitting(true);
    try {
      const project = dbService.getProjectById(projectRef);
      const parentDoc = parentDocId ? dbService.getCorrespondenceById(parentDocId) : null;

      // If editing existing draft
      if (existingDraft) {
        const res = await dbService.updateCorrespondence(
          existingDraft.doc_id,
          {
            classification,
            project_ref: projectRef,
            project_name: project?.project_name,
            subject: subject.trim(),
            body_text: bodyText.trim(),
            sender_entity: senderEntity.trim(),
            receiver_entity: receiverEntity.trim(),
            priority,
            issue_date: issueDate,
            attachments,
            parent_doc_id: parentDocId || null,
            parent_serial: parentDoc?.serial_number || null,
            status: existingDraft.status === 'Rejected' ? 'Pending' : existingDraft.status
          },
          currentUser
        );

        setIsSubmitting(false);

        if (res.success) {
          success(
            existingDraft.status === 'Rejected' ? 'تم تصحيح المسودة وإعادة إرسالها للاعتماد' : 'تم حفظ تعديلات المسودة بنجاح',
            `معاملة رقم: ${existingDraft.serial_number}`
          );
          onSaved();
          onClose();
        } else {
          error('فشل حفظ التعديل', res.error?.message);
        }
        return;
      }

      const res = await dbService.createOutboundDraft(
        {
          classification,
          project_ref: projectRef,
          project_name: project?.project_name,
          subject: subject.trim(),
          body_text: bodyText.trim(),
          sender_entity: senderEntity.trim(),
          receiver_entity: receiverEntity.trim(),
          originator_code: originatorCode.trim().toUpperCase(),
          recipient_code: recipientCode.trim().toUpperCase(),
          priority,
          issue_date: issueDate,
          status: 'Draft',
          parent_doc_id: parentDocId || null,
          parent_serial: parentDoc?.serial_number || null,
          created_by_user_id: currentUser.id,
          created_by_name: currentUser.full_name,
          attachments
        },
        currentUser
      );

      setIsSubmitting(false);

      if (res.success) {
        success('تم حفظ مسودة الخطاب بنجاح', `رمز المسودة المؤقت: ${res.data.serial_number}`);
        onSaved();
        onClose();
      } else {
        error('فشل حفظ المسودة', res.error?.message);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      error('خطأ غير متوقع', err.message);
    }
  };

  // Official Approval Ceremony & Atomic Serial Generation
  const handleApproveAndIssue = async () => {
    if (!currentUser || !canApprove) {
      warning('صلاحية الاعتماد محصورة لمدير المشروع أو مدير النظام فقط.');
      return;
    }

    if (!subject.trim()) {
      error('يرجى كتابة موضوع الخطاب قبل الاعتماد');
      return;
    }

    setIsSubmitting(true);
    setIsStampingCeremony(true);

    try {
      let docToApproveId = existingDraft?.doc_id;

      // If this is a new draft being directly approved by PM
      if (!docToApproveId) {
        const project = dbService.getProjectById(projectRef);
        const parentDoc = parentDocId ? dbService.getCorrespondenceById(parentDocId) : null;

        const draftRes = await dbService.createOutboundDraft(
          {
            classification,
            project_ref: projectRef,
            project_name: project?.project_name,
            subject: subject.trim(),
            body_text: bodyText.trim(),
            sender_entity: senderEntity.trim(),
            receiver_entity: receiverEntity.trim(),
            originator_code: originatorCode.trim().toUpperCase(),
            recipient_code: recipientCode.trim().toUpperCase(),
            priority,
            issue_date: issueDate,
            status: 'Pending',
            parent_doc_id: parentDocId || null,
            parent_serial: parentDoc?.serial_number || null,
            created_by_user_id: currentUser.id,
            created_by_name: currentUser.full_name,
            attachments
          },
          currentUser
        );
        if (!draftRes.success) throw new Error(draftRes.error?.message);
        docToApproveId = draftRes.data.doc_id;
      }

      // Execute Atomic Approval Ceremony
      const approveRes = await dbService.approveOutboundCorrespondence(docToApproveId, currentUser);

      if (approveRes.success) {
        setApprovedSerial(approveRes.data.serial_number);
        success('تم اعتماد الخطاب الصادر بنجاح', `رقم الصادر: ${approveRes.data.serial_number}`);
        setTimeout(() => {
          setIsStampingCeremony(false);
          setIsSubmitting(false);
          onSaved();
          onClose();
        }, 4000);
      } else {
        setIsStampingCeremony(false);
        setIsSubmitting(false);
        error('فشل اعتماد الخطاب', approveRes.error?.message);
      }
    } catch (err: any) {
      setIsStampingCeremony(false);
      setIsSubmitting(false);
      error('خطأ أثناء الاعتماد', err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إعداد وتوجيه خطاب صادر"
      subtitle="تحرير مسودة خطاب أو إعداد رد على مكاتبة سابقة"
      maxWidth="4xl"
    >
      {/* Official Approval Stamping Ceremony Overlay Animation */}
      <AnimatePresence>
        {isStampingCeremony && approvedSerial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-[#0F172A]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center text-white select-none"
          >
            {/* Scanline Sweep Shimmer */}
            <div className="absolute inset-0 shimmer-effect pointer-events-none opacity-40" />

            {/* Micro-Haptic Animated Monolith & QR Stamp */}
            <motion.div
              initial={{ scale: 2, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: -3, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="p-6 rounded-2xl border-2 border-[#A7CCB5] bg-[#005B96]/40 shadow-2xl shadow-[#A7CCB5]/30 flex flex-col items-center gap-3 relative"
            >
              <div className="flex items-center gap-2 text-[#A7CCB5] font-bold tracking-wide text-xs">
                <Stamp className="w-5 h-5" />
                <span>اعتماد وتوثيق الخطاب الصادر</span>
              </div>

              <div className="serial-code text-2xl sm:text-3xl font-black text-white tracking-wider bg-black/50 px-5 py-2.5 rounded-xl border border-white/20 shadow-inner">
                {approvedSerial}
              </div>

              <div className="flex items-center gap-2 text-xs text-[#D8E3E9]">
                <CheckCircle2 className="w-4 h-4 text-[#A7CCB5]" />
                <span>تم اعتماد الخطاب وإصدار الرقم بنجاح</span>
              </div>

              <div className="text-xs text-[#A7CCB5]">
                المعتمد: {currentUser?.full_name} • {new Date().toISOString().split('T')[0]}
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <p className="text-xs text-slate-300 animate-pulse flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تم تحديث حالة المعاملة الواردة إلى (تم الرد) بنجاح</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsStampingCeremony(false);
                  setIsSubmitting(false);
                  onSaved();
                  onClose();
                }}
                className="px-3 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 transition-all font-medium cursor-pointer"
              >
                إغلاق الآن
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSaveDraft} className="space-y-4">
        {/* Manager Review Remarks Banner */}
        {existingDraft?.review_remarks && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 shadow-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-bold text-white">
                ملاحظات التدقيق والتصحيح المطلوبة من ({existingDraft.returned_by_name || 'المدير المسؤول'}):
              </p>
              <p className="leading-relaxed text-amber-100 bg-[#0F172A]/80 p-2.5 rounded-lg border border-amber-500/30">
                {existingDraft.review_remarks}
              </p>
            </div>
          </div>
        )}
        {/* Project & Parent Document Cross-Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              المشروع الهندسي:
            </label>
            <select
              value={projectRef}
              onChange={(e) => setProjectRef(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
            >
              {projects.map(p => (
                <option key={p.project_id} value={p.project_id}>
                  [{p.project_code}] {p.project_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[#A7CCB5]">
                <Link2 className="w-3.5 h-3.5" />
                <span>مرتبط بوارد سابق (رد على خطاب):</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">اختياري</span>
            </label>
            <select
              value={parentDocId}
              onChange={(e) => handleParentDocChange(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#0F172A] border border-[#005B96]/60 rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
            >
              <option value="">-- خطاب جديد مستقل (بدون وارد سابق) --</option>
              {allInbounds.map(inb => (
                <option key={inb.doc_id} value={inb.doc_id}>
                  [{inb.serial_number}] {inb.subject.substring(0, 50)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Classification & Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              تصنيف المعاملة:
            </label>
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value as DocType)}
              className="w-full px-3 py-2.5 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
            >
              <option value="LTR">LTR - خطاب</option>
              <option value="SUB">SUB - اعتماد مواد وفنيات (Submittal)</option>
              <option value="RFI">RFI - استفسار فني</option>
              <option value="IPC">IPC - مستخلص جاري</option>
              <option value="MOM">MOM - محضر اجتماع</option>
              <option value="TRANS">TRANS - مذكرة إرسال</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              الجهة المصدرة:
            </label>
            <select
              value={registeredEntities.includes(senderEntity) ? senderEntity : 'CUSTOM'}
              onChange={(e) => {
                if (e.target.value === 'CUSTOM') {
                  setSenderEntity('');
                } else {
                  setSenderEntity(e.target.value);
                }
              }}
              className="w-full px-3 py-2.5 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
            >
              {registeredEntities.map(ent => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
              <option value="CUSTOM">-- جهة مخصصة (إدخال يدوي) --</option>
            </select>
            {!registeredEntities.includes(senderEntity) && (
              <input
                type="text"
                required
                value={senderEntity}
                onChange={(e) => setSenderEntity(e.target.value)}
                placeholder="اكتب اسم الجهة المصدرة..."
                className="w-full mt-1.5 px-3 py-2 text-xs bg-[#0F172A] border border-sky-500/50 rounded-xl text-white focus:ring-2 focus:ring-sky-500 outline-none"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              الجهة الموجه إليها:
            </label>
            <select
              value={registeredEntities.includes(receiverEntity) ? receiverEntity : 'CUSTOM'}
              onChange={(e) => {
                if (e.target.value === 'CUSTOM') {
                  setReceiverEntity('');
                } else {
                  setReceiverEntity(e.target.value);
                }
              }}
              className="w-full px-3 py-2.5 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
            >
              {registeredEntities.map(ent => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
              <option value="CUSTOM">-- جهة مخصصة (إدخال يدوي) --</option>
            </select>
            {!registeredEntities.includes(receiverEntity) && (
              <input
                type="text"
                required
                value={receiverEntity}
                onChange={(e) => setReceiverEntity(e.target.value)}
                placeholder="اكتب اسم الجهة الموجه إليها..."
                className="w-full mt-1.5 px-3 py-2 text-xs bg-[#0F172A] border border-sky-500/50 rounded-xl text-white focus:ring-2 focus:ring-sky-500 outline-none"
              />
            )}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            موضوع المعاملة والملخص التنفيذي: *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="مثال: الرد على استفسار المقاول وتعميد تفاصيل حديد التسليح..."
            className="w-full px-3 py-2.5 text-sm bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
          />
        </div>

        {/* Body Text */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            نص ومضمون الخطاب:
          </label>
          <textarea
            rows={4}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="نص الخطاب ومحتوى الرد الفني..."
            className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Priority & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              درجة الأهمية:
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2.5 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-medium"
            >
              <option value="Normal">عادي (Normal)</option>
              <option value="Urgent">عاجل (Urgent)</option>
              <option value="Immediate">فوري (Immediate)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              تاريخ الخطاب:
            </label>
            <input
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
            />
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>مرفقات الخطاب الصادر (مخططات أو مذكرات فنية):</span>
            <span className="text-[11px] text-slate-400">مستودع تخزين سحابي منفصل</span>
          </label>

          <label className="border-2 border-dashed border-[#334155] hover:border-[#005B96] rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer bg-[#0F172A]/70 hover:bg-slate-800 transition-colors">
            <UploadCloud className="w-6 h-6 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">
              {isUploading ? 'جاري الرفع...' : 'اضغط لاختيار المرفق أو المخطط الهندسي (PDF)'}
            </span>
            <input
              type="file"
              accept="application/pdf,image/*"
              disabled={isUploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {attachments.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {attachments.map(att => (
                <div
                  key={att.file_id}
                  className="p-2.5 rounded-lg bg-[#0F172A] border border-[#334155] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#A7CCB5]" />
                    <span className="text-slate-200 truncate">{att.file_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({att.file_size_mb} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachments(prev => prev.filter(a => a.file_id !== att.file_id))}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#334155]">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-[#A7CCB5]" />
            <span>حفظ المسودة يعطي رمزاً مؤقتاً ولا يستهلك تسلسل أرقام الصادر حتى يتم اعتماده.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onClose} 
              className="border-[#334155] text-slate-300 hover:bg-slate-800 h-9 px-4 text-xs font-semibold whitespace-nowrap"
            >
              إلغاء
            </Button>

            {/* Save as Draft */}
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isSubmitting && !isStampingCeremony}
              leftIcon={<FileEdit className="w-3.5 h-3.5 text-amber-300" />}
              className="bg-amber-500/15 border border-amber-500/50 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400 font-semibold shadow-sm transition-all h-9 px-3.5 text-xs whitespace-nowrap flex items-center justify-center"
            >
              {existingDraft?.status === 'Rejected' ? 'حفظ وإعادة الرفع للاعتماد' : 'حفظ كمسودة'}
            </Button>

            {/* Official PM / Admin Approval Button */}
            {canApprove && (
              <Button
                type="button"
                variant="mint"
                size="sm"
                isLoading={isSubmitting && isStampingCeremony}
                onClick={handleApproveAndIssue}
                leftIcon={<Stamp className="w-3.5 h-3.5 text-[#0F172A]" />}
                className="font-bold text-[#0F172A] shadow-md shadow-[#A7CCB5]/20 hover:brightness-105 transition-all h-9 px-3.5 text-xs whitespace-nowrap flex items-center justify-center"
              >
                اعتماد وإنشاء صادر
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
