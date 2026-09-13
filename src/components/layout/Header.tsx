// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Header Component with Project Selector, Theme Guard & In-App Actions
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db/firestoreService';
import { ticketService } from '../../services/ticket/ticketService';
import { 
  Building2, 
  LifeBuoy, 
  Menu, 
  ListOrdered,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../common/Button';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenReportModal: () => void;
  onOpenMySubmissions: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenReportModal,
  onOpenMySubmissions
}) => {
  const { currentUser } = useAuth();
  const [systemMode, setSystemModeState] = React.useState<'demo' | 'production'>(() => dbService.getSystemMode());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);

  React.useEffect(() => {
    const handleModeChange = (e: any) => {
      if (e.detail?.mode) {
        setSystemModeState(e.detail.mode);
      }
    };
    window.addEventListener('pcms:system-mode-changed', handleModeChange);
    return () => window.removeEventListener('pcms:system-mode-changed', handleModeChange);
  }, []);

  const handleToggleModeConfirm = () => {
    const nextMode = systemMode === 'demo' ? 'production' : 'demo';
    dbService.setSystemMode(nextMode, true);
    setSystemModeState(nextMode);
    setIsConfirmModalOpen(false);
    window.location.reload(); // Reload to refresh all workspaces & caches cleanly
  };

  // User's tickets count for badge
  const userTickets = currentUser ? ticketService.getTicketsByUser(currentUser.id) : [];
  const openTicketsCount = userTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Declined').length;

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#0F172A] border-b border-[#334155] flex items-center justify-between gap-4 sticky top-0 z-20 shadow-md">
      {/* Left: Mobile Toggle & System Brand Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean System Title / Badge */}
        <div className="hidden sm:flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Building2 className="w-4 h-4" />
          </span>
          <div>
            <span className="text-xs font-bold text-white tracking-wide block">
              منظومة إدارة وتوثيق المراسلات الهندسية
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              Project Correspondence Management System (PCMS • CTS)
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* System Mode Switcher (Admin Only) */}
        {currentUser?.system_role === 'Admin' && (
          <button
            type="button"
            onClick={() => setIsConfirmModalOpen(true)}
            title={
              systemMode === 'demo'
                ? 'المنظومة تحتوي بيانات تجريبية. اضغط للتحويل للإنتاج وتصفير البيانات الافتراضية.'
                : 'المنظومة في وضع التشغيل الفعلي (Live Production). اضغط للتبديل.'
            }
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
              systemMode === 'demo'
                ? 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300'
                : 'border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {systemMode === 'demo' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>وضع تجريبي (Demo Data)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>إنتاج فعلي (Live Production)</span>
              </>
            )}
          </button>
        )}

        {/* User's Submissions Status Pill */}
        <button
          onClick={onOpenMySubmissions}
          title="متابعة حالة البلاغات التي أرسلتها"
          className="relative hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#334155] bg-[#1E293B] hover:bg-slate-800 text-xs text-slate-200 transition-colors"
        >
          <ListOrdered className="w-3.5 h-3.5 text-[#A7CCB5]" />
          <span>تذاكري ومتابعاتي</span>
          {openTicketsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#005B96] text-white font-mono text-[10px] font-bold">
              {openTicketsCount}
            </span>
          )}
        </button>

        {/* Global In-App Issue / Bug Report Button */}
        <Button
          onClick={onOpenReportModal}
          variant="outline"
          size="sm"
          className="border-[#005B96]/60 bg-[#005B96]/15 text-[#D8E3E9] hover:bg-[#005B96]/30 font-semibold"
          leftIcon={<LifeBuoy className="w-3.5 h-3.5 text-[#A7CCB5]" />}
        >
          <span className="hidden sm:inline">إبلاغ عن عطل / فكرة</span>
          <span className="sm:hidden">إبلاغ</span>
        </Button>
      </div>

      {/* Mode Switch Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleToggleModeConfirm}
        title={
          systemMode === 'demo'
            ? 'التحويل إلى وضع الإنتاج الفعلي (Clean Production)'
            : 'استعادة البيانات التجريبية (Demo Mode)'
        }
        message={
          systemMode === 'demo'
            ? 'سيتم تصفير جميع المراسلات والمعاملات التجريبية وسجل التدقيق لتهيئة المنظومة لبدء الاستخدام الحقيقي على نظافة تامة. هل ترغب في المتابعة؟'
            : 'سيتم استعادة المراسلات والبيانات التجريبية لاختبار المنظومة أو لأغراض العرض التقديمي. هل ترغب في المتابعة؟'
        }
        confirmText={
          systemMode === 'demo'
            ? 'تأكيد التصفير والتحويل للإنتاج'
            : 'استعادة البيانات التجريبية'
        }
        cancelText="إلغاء"
        variant={systemMode === 'demo' ? 'warning' : 'info'}
      />
    </header>
  );
};
