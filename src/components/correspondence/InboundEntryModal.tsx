// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Inbound Intake Pipeline & Anti-Duplicate Validation Engine
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================
import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { dbService } from '../../services/db/firestoreService';
import { storageService } from '../../services/storage/simulatedStorage';
import { DocType, Priority, Attachment, Correspondence } from '../../types/correspondence';
import { 
  Inbox, 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  Trash2, 
  AlertTriangle,
  Edit3,
  Link2
} from 'lucide-react';

interface InboundEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  existingDoc?: Correspondence | null;
  parentOutboundDoc?: Correspondence | null;
}

const STANDARD_ENTITIES = [
  'CTR (شركة المقاول العام)',
  'CON (مركز استشارات العفيفي)',
  'وزارة الداخلية - قطاع المشروعات (المالك)',
  'CTR (شركة النيل العامة للإنشاء والرصف)',
  'استشاري ضبط الجودة والمواد'
];

export const InboundEntryModal: React.FC<InboundEntryModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  existingDoc,
  parentOutboundDoc
}) => {
  const { currentUser, activeProjectId } = useAuth();
  const { success, error } = useNotification();
  const projects = dbService.getProjects();

  const registeredEntities: string[] = useMemo(() => {
    const list = dbService.getEntities();
    const formatted = list.map(e => `${e.code} (${e.name})`);
    return Array.from(new Set([...formatted, ...STANDARD_ENTITIES]));
  }, [isOpen]);

  const [projectRef, setProjectRef] = useState<string>(existingDoc?.project_ref || activeProjectId);
  const [classification, setClassification] = useState<DocType>(existingDoc?.classification || 'LTR');
  const [externalRefNo, setExternalRefNo] = useState(existingDoc?.external_ref_no || '');
  const [senderEntity, setSenderEntity] = useState(existingDoc?.sender_entity || '');
  const [receiverEntity, setReceiverEntity] = useState(existingDoc?.receiver_entity || 'CON (مركز استشارات العفيفي)');
  const [originatorCode] = useState('CTR');
  const [recipientCode] = useState('CON');
  const [subject, setSubject] = useState(existingDoc?.subject || '');
  const [bodyText, setBodyText] = useState(existingDoc?.body_text || '');
  const [priority, setPriority] = useState<Priority>(existingDoc?.priority || 'Normal');
  const [issueDate, setIssueDate] = useState(existingDoc?.issue_date || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(existingDoc?.due_date ? existingDoc.due_date.split('T')[0] : '');
  const [attachments, setAttachments] = useState<Attachment[]>(existingDoc?.attachments || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Anti-Duplicate Live Preview Check
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Sync state when modal opens or existingDoc changes
  useEffect(() => {
    if (isOpen) {
      if (existingDoc) {
        setProjectRef(existingDoc.project_ref || activeProjectId);
        setClassification(existingDoc.classification || 'LTR');
        setExternalRefNo(existingDoc.external_ref_no || '');
        setSenderEntity(existingDoc.sender_entity || '');
        setReceiverEntity(existingDoc.receiver_entity || 'CON (مركز استشارات العفيفي)');
        setSubject(existingDoc.subject || '');
        setBodyText(existingDoc.body_text || '');
        setPriority(existingDoc.priority || 'Normal');
        setIssueDate(existingDoc.issue_date || new Date().toISOString().split('T')[0]);
        setDueDate(existingDoc.due_date ? existingDoc.due_date.split('T')[0] : '');
        setAttachments(existingDoc.attachments || []);
      } else if (parentOutboundDoc) {
        setProjectRef(parentOutboundDoc.project_ref || activeProjectId);
        setClassification(parentOutboundDoc.classification || 'LTR');
        setExternalRefNo('');
        setSenderEntity(parentOutboundDoc.receiver_entity || 'CTR (شركة المقاول العام)');
        setReceiverEntity(parentOutboundDoc.sender_entity || 'CON (مركز استشارات العفيفي)');
        setSubject(`رداً على الخطاب الصادر رقم ${parentOutboundDoc.serial_number}: ${parentOutboundDoc.subject}`);
        setBodyText('');
        setPriority('Normal');
        setIssueDate(new Date().toISOString().split('T')[0]);
        setDueDate('');
        setAttachments([]);
      } else {
        setProjectRef(activeProjectId);
        setClassification('LTR');
        setExternalRefNo('');
        setSenderEntity('CTR (شركة المقاول العام)');
        setReceiverEntity('CON (مركز استشارات العفيفي)');
        setSubject('');
        setBodyText('');
        setPriority('Normal');
        setIssueDate(new Date().toISOString().split('T')[0]);
        setDueDate('');
        setAttachments([]);
      }
      setDuplicateWarning(null);
    }
  }, [isOpen, existingDoc, parentOutboundDoc, activeProjectId]);

  const handleExternalRefChange = (refVal: string) => {
    setExternalRefNo(refVal);
    if (!refVal.trim() || !senderEntity.trim() || existingDoc) {
      setDuplicateWarning(null);
      return;
    }

    const existing = dbService.getCorrespondences().find(c =>
      c.doc_type === 'Incoming' &&
      c.project_ref === projectRef &&
      c.sender_entity.trim().toLowerCase() === senderEntity.trim().toLowerCase() &&
      c.external_ref_no?.trim().toLowerCase() === refVal.trim().toLowerCase()
    );

    if (existing) {
      setDuplicateWarning(`تنبيه أمني: هذا الخطاب مسجل مسبقاً بنفس رقم المرجع (${refVal}) لنفس الجهة برقم وارد [${existing.serial_number}]`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadRes = await storageService.uploadFile(file, projectRef, 'Inbound');
      const newAtt: Attachment = {
        file_id: uploadRes.file_id,
        doc_ref: existingDoc?.doc_id || 'pending-inbound',
        file_name: uploadRes.file_name,
        file_size_mb: uploadRes.file_size_mb,
        storage_direct_url: uploadRes.storage_direct_url,
        file_category: 'Scan Document',
        upload_timestamp: uploadRes.upload_timestamp
      };
      setAttachments(prev => [...prev, newAtt]);
      success('تم رفع وثيقة الوارد بنجاح', file.name);
    } catch (err: any) {
      error('فشل رفع الملف', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!subject.trim() || !senderEntity.trim() || !externalRefNo.trim()) {
      error('يرجى ملء جميع الحقول الإلزامية ورقم المرجع الخارجي');
      return;
    }

    setIsSubmitting(true);
    try {
      const project = dbService.getProjectById(projectRef);

      // Edit Mode for existing Inbound
      if (existingDoc) {
        const res = await dbService.updateCorrespondence(
          existingDoc.doc_id,
          {
            classification,
            external_ref_no: externalRefNo.trim(),
            project_ref: projectRef,
            project_name: project?.project_name,
            subject: subject.trim(),
            body_text: bodyText.trim(),
            sender_entity: senderEntity.trim(),
            receiver_entity: receiverEntity.trim(),
            priority,
            issue_date: issueDate,
            due_date: dueDate ? `${dueDate}T17:00:00Z` : undefined,
            attachments,
            status: existingDoc.status === 'Rejected' ? 'Pending' : existingDoc.status
          },
          currentUser
        );

        setIsSubmitting(false);

        if (res.success) {
          success(
            existingDoc.status === 'Rejected' ? 'تم تصحيح الخطاب وإعادة إرساله للاعتماد' : 'تم حفظ التعديلات بنجاح',
            `معاملة رقم: ${existingDoc.serial_number}`
          );
          onSaved();
          onClose();
        } else {
          error('فشل التعديل', res.error?.message);
        }
        return;
      }

      // Create Mode
      const res = await dbService.createInbound(
        {
          classification,
          external_ref_no: externalRefNo.trim(),
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
          received_date: new Date().toISOString(),
          due_date: dueDate ? `${dueDate}T17:00:00Z` : undefined,
          status: 'Pending',
          parent_doc_id: parentOutboundDoc?.doc_id || null,
          parent_serial: parentOutboundDoc?.serial_number || null,
          created_by_user_id: currentUser.id,
          created_by_name: currentUser.full_name,
          attachments
        },
        currentUser
      );

      setIsSubmitting(false);

      if (res.success) {
        success('تم تسجيل الخطاب الوارد بنجاح', `الرقم المرجعي الداخلي: ${res.data.serial_number}`);
        onSaved();
        onClose();
      } else {
        error('فشل التسجيل', res.error?.message);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      error('خطأ غير متوقع', err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingDoc ? 'تعديل بيانات الخطاب الوارد' : 'تسجيل خطاب وارد جديد'}
      subtitle={existingDoc ? `معاملة رقم: [${existingDoc.serial_number}]` : 'إدخال وقيد الخطابات الواردة وحفظ المرفقات'}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Manager's Review Remarks Alert (if returned for revision) */}
        {existingDoc?.review_remarks && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 shadow-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-bold text-white">
                ملاحظات التدقيق والتصحيح المطلوبة من ({existingDoc.returned_by_name || 'المدير المسؤول'}):
              </p>
              <p className="leading-relaxed text-amber-100 bg-[#0F172A]/80 p-2.5 rounded-lg border border-amber-500/30">
                {existingDoc.review_remarks}
              </p>
            </div>
          </div>
        )}

        {/* Parent Outbound Letter Cross-Reference Banner */}
        {parentOutboundDoc && (
          <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-xs flex items-center justify-between gap-3 text-sky-200">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-sky-400">
                <Link2 className="w-4 h-4" />
              </span>
              <div>
                <p className="font-bold text-white">تسجيل وارد رداً على خطاب صادر سابق:</p>
                <p className="text-[11px] text-slate-300">
                  مرتبط بالمعاملة رقم <strong dir="ltr" className="serial-code text-sky-300">{parentOutboundDoc.serial_number}</strong>
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/60 text-sky-300 border border-blue-500/30 font-bold shrink-0">
              ربط تزامني
            </span>
          </div>
        )}

        {/* Anti-Duplicate Warning Alert */}
        {duplicateWarning && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-bold">تحذير أمني من نظام فحص التكرار (Anti-Duplicate Guard):</p>
              <p className="mt-0.5 leading-relaxed">{duplicateWarning}</p>
            </div>
          </div>
        )}

        {/* Project & Classification */}
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              تصنيف المعاملة (Doc Type):
            </label>
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value as DocType)}
              className="w-full px-3 py-2.5 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
            >
              <option value="LTR">LTR - خطاب</option>
              <option value="SUB">SUB - اعتماد فني ومواد (Submittal)</option>
              <option value="RFI">RFI - استفسار فني</option>
              <option value="IPC">IPC - مستخلص جاري</option>
              <option value="MOM">MOM - محضر اجتماع</option>
              <option value="TRANS">TRANS - مذكرة إرسال (Transmittal)</option>
              <option value="SITE">SITE - ملاحظة موقعية</option>
            </select>
          </div>
        </div>

        {/* External Ref No & Sender / Receiver */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              رقم المرجع الخارجي (External Ref No): *
            </label>
            <input
              type="text"
              required
              value={externalRefNo}
              onChange={(e) => handleExternalRefChange(e.target.value)}
              placeholder="مثال: CTR/MOI/26/089"
              className="w-full px-3 py-2.5 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              الجهة الراسلة: *
            </label>
            <select
              value={registeredEntities.includes(senderEntity) ? senderEntity : 'CUSTOM'}
              onChange={(e) => {
                if (e.target.value === 'CUSTOM') {
                  setSenderEntity('');
                } else {
                  setSenderEntity(e.target.value);
                  handleExternalRefChange(externalRefNo);
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
                onChange={(e) => {
                  setSenderEntity(e.target.value);
                  handleExternalRefChange(externalRefNo);
                }}
                placeholder="اكتب اسم الجهة الراسلة..."
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
                placeholder="اكتب اسم الجهة المستلمة..."
                className="w-full mt-1.5 px-3 py-2 text-xs bg-[#0F172A] border border-sky-500/50 rounded-xl text-white focus:ring-2 focus:ring-sky-500 outline-none"
              />
            )}
          </div>
        </div>

        {/* Subject & Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            موضوع المعاملة والملخص التنفيذي: *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="مثال: طلب اعتماد تقرير فحص التربة لقطاع المبنى الرئيسي..."
            className="w-full px-3 py-2.5 text-sm bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
          />
        </div>

        {/* Letter Text / Body */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            نص ومضمون الخطاب الوارد:
          </label>
          <textarea
            rows={3}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="ملخص التفاصيل الفنية الواردة بالخطاب..."
            className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Priority & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              تاريخ تحرير الخطاب:
            </label>
            <input
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              تاريخ استحقاق الرد (SLA):
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
            />
          </div>
        </div>

        {/* Attachment Upload Zone */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>مرفقات المسح الضوئي (Scanned PDF):</span>
            <span className="text-[11px] text-slate-400">تخزين سحابي منفصل Decoupled Storage</span>
          </label>

          <label className="border-2 border-dashed border-[#334155] hover:border-[#005B96] rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer bg-[#0F172A]/70 hover:bg-slate-800 transition-colors">
            <UploadCloud className="w-6 h-6 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">
              {isUploading ? 'جاري الرفع السحابي...' : 'اضغط لاختيار ملف الخطاب الممسوح ضوئياً (PDF)'}
            </span>
            <input
              type="file"
              accept="application/pdf,image/*"
              disabled={isUploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Uploaded List */}
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#334155]">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onClose} 
            className="border-[#334155] text-slate-300 hover:bg-slate-800 h-9 px-4 text-xs font-semibold"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="mint"
            size="sm"
            isLoading={isSubmitting}
            disabled={!!duplicateWarning}
            rightIcon={existingDoc ? <Edit3 className="w-3.5 h-3.5 text-[#0F172A]" /> : <Inbox className="w-3.5 h-3.5 text-[#0F172A]" />}
            className="font-bold text-[#0F172A] h-9 px-4 text-xs shadow-md shadow-[#A7CCB5]/20 hover:brightness-105"
          >
            {existingDoc
              ? (existingDoc.status === 'Rejected' ? 'حفظ وإعادة الرفع للاعتماد' : 'حفظ التعديلات')
              : 'اعتماد وتسجيل الوارد'
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};
