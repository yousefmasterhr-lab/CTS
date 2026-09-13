// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// In-App Issue Reporter with Clipboard Screenshot Pasting (Ctrl+V)
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ticketService } from '../../services/ticket/ticketService';
import { captureDeviceTelemetry } from '../../utils/metadataCapture';
import { TicketCategory } from '../../types/ticket';
import { 
  Bug, 
  Sparkles, 
  AlertOctagon, 
  Camera, 
  Trash2, 
  UploadCloud, 
  Send,
  Monitor,
  Info
} from 'lucide-react';

interface IssueReporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const IssueReporterModal: React.FC<IssueReporterModalProps> = ({
  isOpen,
  onClose,
  onSubmitted
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useNotification();

  const [category, setCategory] = useState<TicketCategory>('Bug / Error');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Capture Telemetry
  const telemetry = captureDeviceTelemetry(currentUser);

  // Clipboard Paste (Ctrl+V) Listener for Instant Screenshot Capture
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              setScreenshotDataUrl(reader.result as string);
              setScreenshotFileName(`clipboard_screenshot_${Date.now()}.png`);
            };
            reader.readAsDataURL(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotDataUrl(reader.result as string);
        setScreenshotFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      error('يرجى ملء عنوان ووصف المشكلة أو الفكرة');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ticketService.createTicket({
        category,
        title,
        description,
        reproduction_steps: reproductionSteps,
        screenshot_data_url: screenshotDataUrl || undefined,
        screenshot_file_name: screenshotFileName || undefined,
        telemetry,
        status: 'New'
      });

      setIsSubmitting(false);

      if (res.success) {
        success('تم تسجيل البلاغ بنجاح', `رقم التذكرة: ${res.data.ticket_id} وتم إشعار الإدارة عبر تليجرام`);
        // Reset form
        setTitle('');
        setDescription('');
        setReproductionSteps('');
        setScreenshotDataUrl(null);
        setScreenshotFileName(null);
        onClose();
        if (onSubmitted) onSubmitted();
      } else {
        error('فشل تسجيل التذكرة', res.error?.message);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      error('خطأ غير متوقع أثناء الحفظ', err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="مركز الدعم والملاحظات • Report Issue & Feedback"
      subtitle="إبلاغ مباشر عن عطل أو تقديم مقترح تطوير مع إلصاق فوري للشاشة (Ctrl+V)"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-100 mb-1.5">
            نوع البلاغ أو الملاحظة:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Bug / Error', label: 'عطل برمجي / خطأ', icon: <Bug className="w-4 h-4 text-rose-500" /> },
              { id: 'System Glitch', label: 'بطء أو خلل واجهة', icon: <AlertOctagon className="w-4 h-4 text-amber-400" /> },
              { id: 'Feature Request / Idea', label: 'مقترح تطوير وفكرة', icon: <Sparkles className="w-4 h-4 text-sky-400" /> }
            ].map(cat => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id as TicketCategory)}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  category === cat.id
                    ? 'border-sky-500 bg-sky-950/40 text-sky-300 shadow-sm font-bold'
                    : 'border-[#334155] bg-[#0F172A] text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-100 mb-1">
            عنوان المشكلة أو المقترح:
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: رسالة خطأ عند محاولة اعتماد مسودة الصادر رقم 1233..."
            className="w-full px-3 py-2 text-sm bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-100 mb-1">
            تفاصيل الملاحظة / ما حدث بالتحديد:
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="يرجى كتابة تفاصيل المشكلة..."
            className="w-full px-3 py-2 text-sm bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none resize-none"
          />
        </div>

        {/* Reproduction steps */}
        <div>
          <label className="block text-xs font-semibold text-slate-100 mb-1">
            خطوات التكرار (اختياري):
          </label>
          <input
            type="text"
            value={reproductionSteps}
            onChange={(e) => setReproductionSteps(e.target.value)}
            placeholder="1. فتحت المسودة 2. ضغطت زر الاعتماد..."
            className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none"
          />
        </div>

        {/* Screenshot & Clipboard Attachment Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-sky-400" />
              <span>لقطة الشاشة والمرفقات:</span>
            </label>
            <span className="text-[11px] font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
              يدعم اللصق المباشر (Ctrl + V)
            </span>
          </div>

          {screenshotDataUrl ? (
            <div className="relative border-2 border-dashed border-[#A7CCB5]/60 rounded-xl p-2 bg-[#A7CCB5]/10 flex flex-col items-center">
              <img
                src={screenshotDataUrl}
                alt="Screenshot Preview"
                className="max-h-44 object-contain rounded-lg border border-[#334155]"
              />
              <div className="flex items-center justify-between w-full mt-2 px-2">
                <span className="text-xs text-slate-300 font-mono truncate">{screenshotFileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setScreenshotDataUrl(null);
                    setScreenshotFileName(null);
                  }}
                  className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف الصورة
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-[#334155] hover:border-sky-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#0F172A] hover:bg-[#1E293B]/60 transition-colors">
              <UploadCloud className="w-8 h-8 text-[#8097AE]" />
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-300">
                  اضغط للرفع أو الصق لقطة الشاشة مباشرة بواسطة <kbd className="font-mono bg-[#1E293B] text-white px-1.5 py-0.5 border border-[#334155] rounded shadow-xs">Ctrl + V</kbd>
                </p>
                <p className="text-[11px] text-[#8097AE]">PNG, JPG, PDF (بحد أقصى 10 ميجابايت)</p>
              </div>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Telemetry Preview Box */}
        <div className="p-2.5 rounded-xl bg-[#0B1120] border border-[#334155] text-[11px] text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-sky-400" />
            <span>بيانات الجهاز الملتقطة آلياً:</span>
          </div>
          <div className="font-mono text-[10px] text-slate-400" dir="ltr">
            {telemetry.browser} • {telemetry.os} • {telemetry.screen_resolution}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#334155]">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            rightIcon={<Send className="w-4 h-4" />}
          >
            إرسال البلاغ للإدارة
          </Button>
        </div>
      </form>
    </Modal>
  );
};
