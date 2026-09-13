// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// User Submissions Tracker & Real-Time Status Viewer
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticket/ticketService';
import { Badge } from '../common/Badge';
import { formatDateTime } from '../../utils/formatters';
import { TicketStatus } from '../../types/ticket';
import { CheckCircle2, Clock, AlertCircle, FileQuestion, MessageSquare } from 'lucide-react';

interface MySubmissionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MySubmissionsDrawer: React.FC<MySubmissionsDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser } = useAuth();
  const tickets = currentUser ? ticketService.getTicketsByUser(currentUser.id) : [];

  const getStatusChip = (status: TicketStatus) => {
    switch (status) {
      case 'New':
        return <Badge variant="navy">جديد • New</Badge>;
      case 'In_Review':
        return <Badge variant="warning">قيد الفحص والمراجعة</Badge>;
      case 'In_Progress':
        return <Badge variant="slate">جاري العمل والمعالجة</Badge>;
      case 'Resolved':
        return <Badge variant="mint">تم الحل والانتهاء</Badge>;
      case 'Declined':
        return <Badge variant="danger">مرفوض مع الإيضاح</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="سجل بلاغاتي ومتابعاتي • My Submitted Issues"
      subtitle="متابعة فورية ومباشرة لحالة المشاكل والمقترحات التي أرسلتها لإدارة النظام"
      maxWidth="2xl"
    >
      {tickets.length === 0 ? (
        <div className="py-12 text-center text-[#8097AE]">
          <CheckCircle2 className="w-12 h-12 mx-auto text-[#A7CCB5] mb-3 opacity-60" />
          <p className="text-sm font-semibold text-slate-300">لا توجد بلاغات مسجلة بحسابك حالياً</p>
          <p className="text-xs text-slate-500 mt-1">
            عند إرسال أي استفسار أو بلاغ عن عطل، ستظهر حالته وملاحظات الدعم الفني هنا مباشرة.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div
              key={ticket.ticket_id}
              className="p-4 rounded-xl border border-[#334155] bg-[#0F172A]/70 hover:bg-[#1E293B] transition-all space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
                    {ticket.ticket_id}
                  </span>
                  <span className="text-xs font-semibold text-white">{ticket.title}</span>
                </div>
                <div>{getStatusChip(ticket.status)}</div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {ticket.description}
              </p>

              {/* Admin Remarks Note */}
              {ticket.admin_resolution_remarks && (
                <div className="mt-2 p-2.5 rounded-lg bg-emerald-950/30 border border-[#A7CCB5]/40 text-xs text-[#A7CCB5] flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <span className="font-bold">رد وتوجيه الإدارة: </span>
                    <span className="text-slate-200">{ticket.admin_resolution_remarks}</span>
                    {ticket.assigned_admin && (
                      <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                        المعني بالحل: {ticket.assigned_admin}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-[#334155] flex items-center justify-between text-[10px] text-[#8097AE] font-mono">
                <span>النوع: {ticket.category}</span>
                <span dir="ltr">تاريخ التقديم: {formatDateTime(ticket.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
