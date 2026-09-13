// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Admin Triage & Issue Kanban Board Architecture
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState } from 'react';
import { ticketService } from '../../services/ticket/ticketService';
import { IssueTicket, TicketStatus } from '../../types/ticket';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  KanbanSquare, 
  Bug, 
  Sparkles, 
  AlertOctagon, 
  Monitor, 
  Calendar, 
  User, 
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Eye
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const TicketKanbanBoard: React.FC = () => {
  const { success, error } = useNotification();
  const [tickets, setTickets] = useState<IssueTicket[]>(ticketService.getTickets());

  // Selected Ticket for Inspection Modal
  const [selectedTicket, setSelectedTicket] = useState<IssueTicket | null>(null);
  const [remarksInput, setRemarksInput] = useState('');
  const [targetStatus, setTargetStatus] = useState<TicketStatus>('In_Progress');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fullscreen Screenshot Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<TicketStatus | null>(null);

  const reloadTickets = () => {
    setTickets(ticketService.getTickets());
  };

  const columns: { id: TicketStatus; label: string; headerColor: string; activeColor: string }[] = [
    { 
      id: 'New', 
      label: 'جديد', 
      headerColor: 'border-sky-500/50 bg-sky-950/40 text-sky-300',
      activeColor: 'border-sky-400 bg-sky-500/10'
    },
    { 
      id: 'In_Review', 
      label: 'قيد الفحص', 
      headerColor: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
      activeColor: 'border-amber-400 bg-amber-500/10'
    },
    { 
      id: 'In_Progress', 
      label: 'جاري المعالجة', 
      headerColor: 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300',
      activeColor: 'border-indigo-400 bg-indigo-500/10'
    },
    { 
      id: 'Resolved', 
      label: 'تم الحل', 
      headerColor: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
      activeColor: 'border-emerald-400 bg-emerald-500/10'
    },
    { 
      id: 'Declined', 
      label: 'مرفوض', 
      headerColor: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
      activeColor: 'border-rose-400 bg-rose-500/10'
    },
  ];

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    e.dataTransfer.setData('text/plain', ticketId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTicketId(ticketId);
  };

  const handleDragOver = (e: React.DragEvent, colId: TicketStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropCol !== colId) {
      setActiveDropCol(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: TicketStatus) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (activeDropCol === colId) {
      setActiveDropCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TicketStatus) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('text/plain') || draggedTicketId;
    setActiveDropCol(null);
    setDraggedTicketId(null);
    if (!ticketId) return;

    const currentTicket = tickets.find(t => t.ticket_id === ticketId);
    if (currentTicket && currentTicket.status !== targetStatus) {
      const res = ticketService.updateTicketStatus(ticketId, targetStatus, undefined, 'إدارة النظام');
      if (res.success) {
        const colMeta = columns.find(c => c.id === targetStatus);
        success('تم نقل التذكرة بنجاح', `نُقلت إلى مرحلة [${colMeta?.label || targetStatus}]`);
        reloadTickets();
      } else {
        error('تعذر نقل التذكرة', res.error?.message);
      }
    }
  };

  const handleOpenTicket = (ticket: IssueTicket) => {
    setSelectedTicket(ticket);
    setRemarksInput(ticket.admin_resolution_remarks || '');
    setTargetStatus(ticket.status);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsUpdating(true);
    const res = ticketService.updateTicketStatus(
      selectedTicket.ticket_id,
      targetStatus,
      remarksInput.trim() || undefined,
      'إدارة النظام'
    );
    setIsUpdating(false);

    if (res.success) {
      success('تم تحديث حالة التذكرة بنجاح', `رقم: ${selectedTicket.ticket_id}`);
      reloadTickets();
      setSelectedTicket(null);
    } else {
      error('فشل التحديث', res.error?.message);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'Bug / Error':
        return 'عطل برمجي';
      case 'System Glitch':
        return 'خلل فني';
      case 'Feature Request / Idea':
        return 'مقترح فكرة';
      default:
        return cat;
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Bug / Error':
        return <Bug className="w-3.5 h-3.5 text-rose-400" />;
      case 'System Glitch':
        return <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <KanbanSquare className="w-6 h-6 text-sky-400" />
            <span>لوحة متابعة وفرز البلاغات</span>
          </h2>
          <p className="text-xs text-[#8097AE] mt-1">
            متابعة وفحص بلاغات الأعطال والمقترحات الفنية مع إمكانية السحب والإفلات بين المراحل
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>إجمالي البلاغات: <strong className="text-sky-400">{tickets.length}</strong></span>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map(col => {
          const colTickets = tickets.filter(t => t.status === col.id);
          const isOver = activeDropCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-2xl border transition-all duration-200 p-3 min-h-[520px] flex flex-col ${
                isOver 
                  ? `${col.activeColor} ring-2 ring-sky-400/40 shadow-lg scale-[1.01]` 
                  : 'border-[#334155] bg-[#0F172A]/60'
              }`}
            >
              {/* Column Header */}
              <div className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-between mb-3 shadow-xs ${col.headerColor}`}>
                <span className="font-bold">{col.label}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#0F172A] text-white border border-white/10 shadow-xs">
                  {colTickets.length}
                </span>
              </div>

              {/* Ticket Cards List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {colTickets.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 border-2 border-dashed border-slate-800/80 rounded-xl my-2">
                    اسحب التذاكر هنا
                  </div>
                ) : (
                  colTickets.map(ticket => (
                    <div
                      key={ticket.ticket_id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, ticket.ticket_id)}
                      onDragEnd={() => {
                        setDraggedTicketId(null);
                        setActiveDropCol(null);
                      }}
                      onClick={() => handleOpenTicket(ticket)}
                      className={`p-3.5 rounded-xl bg-[#1E293B] border border-[#334155] shadow-sm hover:shadow-md hover:border-sky-500 transition-all cursor-grab active:cursor-grabbing space-y-2.5 group select-none ${
                        draggedTicketId === ticket.ticket_id ? 'opacity-40 scale-95 border-dashed border-sky-400' : 'opacity-100 hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-800/40">
                          {ticket.ticket_id}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-300">
                          {getCategoryIcon(ticket.category)}
                          <span className="font-medium text-[10px]">{getCategoryLabel(ticket.category)}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-slate-100 leading-snug group-hover:text-sky-300 transition-colors line-clamp-2">
                        {ticket.title}
                      </h4>

                      {/* Reporter info */}
                      <div className="text-[10px] text-[#8097AE] flex items-center justify-between pt-2 border-t border-[#334155]">
                        <span className="truncate max-w-[120px]">{ticket.telemetry.user_name}</span>
                        {ticket.screenshot_data_url && (
                          <span className="flex items-center gap-1 text-sky-400 font-semibold bg-sky-950/30 px-1.5 py-0.5 rounded border border-sky-800/30">
                            <ImageIcon className="w-3 h-3" />
                            <span>لقطة</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Details & Inspection Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`فحص تذكرة • ${selectedTicket.ticket_id}`}
          subtitle={`مقدم البلاغ: ${selectedTicket.telemetry.user_name} (${selectedTicket.telemetry.user_role})`}
          maxWidth="3xl"
        >
          <div className="space-y-4">
            {/* Category & Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#005B96]/30 text-sky-300 border border-sky-500/30">
                  {selectedTicket.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  تاريخ التسجيل: {formatDateTime(selectedTicket.created_at)}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{selectedTicket.title}</h3>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#334155] text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              <span className="block text-[11px] font-bold text-sky-400 mb-1">تفاصيل المشكلة / المقترح:</span>
              {selectedTicket.description}
            </div>

            {/* Reproduction steps if present */}
            {selectedTicket.reproduction_steps && (
              <div className="p-3 rounded-xl bg-[#0F172A] border border-[#334155] text-xs text-slate-300">
                <span className="block text-[11px] font-bold text-sky-400 mb-1">خطوات التكرار:</span>
                {selectedTicket.reproduction_steps}
              </div>
            )}

            {/* Attached Screenshot */}
            {selectedTicket.screenshot_data_url && (
              <div>
                <span className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <span>لقطة الشاشة المرفقة (اضغط للتكبير):</span>
                </span>
                <div
                  onClick={() => setPreviewImage(selectedTicket.screenshot_data_url || null)}
                  className="cursor-pointer border border-[#334155] rounded-xl overflow-hidden max-h-56 bg-[#0F172A] flex items-center justify-center relative group"
                >
                  <img
                    src={selectedTicket.screenshot_data_url}
                    alt="Screenshot"
                    className="max-h-56 object-contain"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity">
                    <Eye className="w-4 h-4" />
                    <span>عرض بالحجم الكامل</span>
                  </div>
                </div>
              </div>
            )}

            {/* Device & Route Telemetry Captured Box */}
            <div className="p-3 rounded-xl bg-[#0B1120] text-white text-xs font-mono space-y-1 border border-[#334155]">
              <div className="text-[11px] text-[#A7CCB5] font-bold flex items-center gap-1.5 mb-1">
                <Monitor className="w-3.5 h-3.5" />
                <span>البيانات الفنية للجهاز:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>المسار: <span className="text-white">{selectedTicket.telemetry.current_route}</span></div>
                <div>النظام: <span className="text-white">{selectedTicket.telemetry.os}</span></div>
                <div>المتصفح: <span className="text-white">{selectedTicket.telemetry.browser}</span></div>
                <div>الشاشة: <span className="text-white">{selectedTicket.telemetry.screen_resolution}</span></div>
              </div>
            </div>

            {/* Triage Update Form */}
            <form onSubmit={handleUpdateStatus} className="pt-3 border-t border-[#334155] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    تحديث مرحلة التذكرة:
                  </label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as TicketStatus)}
                    className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 focus:ring-2 focus:ring-[#005B96] outline-none font-semibold"
                  >
                    <option value="New">جديد</option>
                    <option value="In_Review">قيد الفحص</option>
                    <option value="In_Progress">جاري المعالجة</option>
                    <option value="Resolved">تم الحل</option>
                    <option value="Declined">مرفوض</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ملاحظات الدعم الفني وتوجيه الإدارة للمستخدم:
                  </label>
                  <input
                    type="text"
                    value={remarksInput}
                    onChange={(e) => setRemarksInput(e.target.value)}
                    placeholder="مثال: تم إصلاح الخلل في التحديث الأخير v2.6..."
                    className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                  إغلاق
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
                  حفظ وتحديث التذكرة
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Fullscreen Screenshot Lightbox Modal */}
      {previewImage && (
        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title="معاينة لقطة الشاشة بالحجم الكامل"
          maxWidth="6xl"
        >
          <div className="flex items-center justify-center p-2 bg-slate-900 rounded-xl overflow-auto max-h-[75vh]">
            <img src={previewImage} alt="Full Preview" className="max-w-full object-contain" />
          </div>
        </Modal>
      )}
    </div>
  );
};
