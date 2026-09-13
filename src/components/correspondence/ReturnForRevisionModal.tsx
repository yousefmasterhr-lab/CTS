// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Manager Review & Return for Revision Modal
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Correspondence } from '../../types/correspondence';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { dbService } from '../../services/db/firestoreService';
import { RotateCcw, AlertTriangle, User, MessageSquare } from 'lucide-react';

interface ReturnForRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Correspondence | null;
  onReturned: () => void;
}

export const ReturnForRevisionModal: React.FC<ReturnForRevisionModalProps> = ({
  isOpen,
  onClose,
  document,
  onReturned
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useNotification();
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!document) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!remarks.trim()) {
      error('يرجى كتابة ملاحظات التدقيق والتصحيح المطلوبة للموظف');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await dbService.returnCorrespondenceForReview(document.doc_id, currentUser, remarks.trim());
      setIsSubmitting(false);

      if (res.success) {
        success(
          'تم إرجاع الخطاب للمراجعة والتصحيح',
          `أُرسلت الملاحظات للمحرر (${document.created_by_name}) بنجاح.`
        );
        setRemarks('');
        onReturned();
        onClose();
      } else {
        error('فشل إرجاع الخطاب', res.error?.message);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      error('حدث خطأ غير متوقع', err?.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إرجاع الخطاب للمراجعة والتصحيح"
      subtitle={`معاملة رقم: ${document.serial_number}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Banner */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-white">تنبيه تدقيق ومراجعة البيانات</p>
            <p className="leading-relaxed text-slate-300">
              سيتم تغيير حالة الخطاب إلى <strong className="text-amber-300">(مُعاد للتعديل)</strong> وإشعار الموظف المسؤول <strong className="text-white">({document.created_by_name})</strong> بالملاحظات لتصحيح الأخطاء وإعادة رفع الخطاب للاعتماد.
            </p>
          </div>
        </div>

        {/* Document Details Card */}
        <div className="p-3 rounded-xl bg-[#0F172A] border border-[#334155] text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>موضوع الخطاب:</span>
            <span className="font-mono text-slate-300">{document.issue_date}</span>
          </div>
          <p className="font-semibold text-white truncate">{document.subject}</p>
          <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1 border-t border-[#334155]/60">
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span>المحرر المسؤول عن الإدخال: <strong className="text-slate-200">{document.created_by_name}</strong></span>
          </div>
        </div>

        {/* Remarks Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>ملاحظات التدقيق والأخطاء المطلوب تصحيحها من الموظف: *</span>
          </label>
          <textarea
            required
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="مثال: يرجى تعديل اسم الجهة الموجه إليها إلى شركة المقاول العام، وإرفاق ملخص فحص التربة بصيغة PDF..."
            className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-amber-500/40 rounded-xl text-white focus:ring-2 focus:ring-amber-400 outline-none resize-none leading-relaxed"
          />
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
            variant="danger"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold h-9 px-4 text-xs shadow-md shadow-rose-900/20"
          >
            إرجاع للموظف مع الملاحظات
          </Button>
        </div>
      </form>
    </Modal>
  );
};
