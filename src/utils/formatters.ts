// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Standard Formatters & Visual Helpers
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import { DocStatus, Priority, DocType, Direction } from '../types/correspondence';

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} (${hours}:${mins})`;
  } catch {
    return dateString;
  }
}

export function getDocTypeLabel(type: DocType): { ar: string; en: string; code: string } {
  switch (type) {
    case 'LTR':
      return { ar: 'خطاب', en: 'Letter', code: 'LTR' };
    case 'SUB':
      return { ar: 'اعتماد فني / مواد', en: 'Technical Submittal', code: 'SUB' };
    case 'RFI':
      return { ar: 'استفسار فني', en: 'Request for Information', code: 'RFI' };
    case 'IPC':
      return { ar: 'مستخلص جاري', en: 'Payment Certificate', code: 'IPC' };
    case 'MOM':
      return { ar: 'محضر اجتماع', en: 'Minutes of Meeting', code: 'MOM' };
    case 'TRANS':
      return { ar: 'مذكرة إرسال', en: 'Transmittal', code: 'TRANS' };
    case 'SITE':
      return { ar: 'ملاحظة موقعية', en: 'Site Notice', code: 'SITE' };
    default:
      return { ar: type, en: type, code: type };
  }
}

export function getDirectionLabel(dir: Direction): { ar: string; en: string } {
  return dir === 'Incoming' 
    ? { ar: 'وارد', en: 'Incoming' }
    : { ar: 'صادر', en: 'Outgoing' };
}

export function getStatusBadgeInfo(status: DocStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'Approved':
      return { label: 'معتمد', bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/50' };
    case 'Replied':
      return { label: 'تم الرد', bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-400/40' };
    case 'Pending':
      return { label: 'قيد المراجعة', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-400/40' };
    case 'Draft':
      return { label: 'مسودة', bg: 'bg-amber-500/25', text: 'text-amber-300', border: 'border-amber-400/50' };
    case 'Closed':
      return { label: 'مغلق ومؤرشف', bg: 'bg-slate-700/60', text: 'text-slate-300', border: 'border-slate-600' };
    case 'Rejected':
      return { label: 'مرفوض', bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/50' };
    default:
      return { label: status, bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
  }
}

export function getPriorityBadgeInfo(priority: Priority): { label: string; bg: string; text: string; border: string; pulse?: boolean } {
  switch (priority) {
    case 'Immediate':
      return { label: 'فوري', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', pulse: true };
    case 'Urgent':
      return { label: 'عاجل', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', pulse: false };
    case 'Normal':
      return { label: 'عادي', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', pulse: false };
    default:
      return { label: priority, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
