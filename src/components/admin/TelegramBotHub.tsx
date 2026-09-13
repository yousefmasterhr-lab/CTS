// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Admin Multi-Bot Telegram Integration Hub & Scoping Matrix
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState } from 'react';
import { telegramService } from '../../services/telegram/telegramService';
import { TelegramBotConfig, TelegramBotScopingMatrix, TelegramEventType } from '../../types/telegram';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { 
  Bot, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Radio,
  Sliders,
  Sparkles,
  FileEdit
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const TelegramBotHub: React.FC = () => {
  const { currentUser } = useAuth();
  const { success, error, info } = useNotification();
  const [bots, setBots] = useState<TelegramBotConfig[]>(telegramService.getBots());

  // Registration & Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [botName, setBotName] = useState('');
  const [botToken, setBotToken] = useState('');
  const [defaultChatId, setDefaultChatId] = useState('');
  const [description, setDescription] = useState('');
  const [scopes, setScopes] = useState<TelegramBotScopingMatrix>({
    critical_errors: false,
    sla_overdue: true,
    inbound_logs: true,
    outbound_approvals: true,
    internal_tasks: false,
    user_bug_reports: false,
  });

  // Test Dispatch Payload Modal State
  const [testResult, setTestResult] = useState<{ formatted: string; count: number } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [botToDelete, setBotToDelete] = useState<{ id: string; name: string } | null>(null);

  const reloadBots = () => {
    setBots(telegramService.getBots());
  };

  const handleOpenCreateModal = () => {
    setEditingBotId(null);
    setBotName('');
    setBotToken('');
    setDefaultChatId('');
    setDescription('');
    setScopes({
      critical_errors: false,
      sla_overdue: true,
      inbound_logs: true,
      outbound_approvals: true,
      internal_tasks: false,
      user_bug_reports: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (bot: TelegramBotConfig) => {
    setEditingBotId(bot.bot_id);
    setBotName(bot.bot_name);
    setBotToken(bot.bot_token);
    setDefaultChatId(bot.default_chat_id);
    setDescription(bot.description || '');
    setScopes({ ...bot.scopes });
    setIsModalOpen(true);
  };

  const handleToggleScope = (scopeKey: keyof TelegramBotScopingMatrix) => {
    setScopes(prev => ({ ...prev, [scopeKey]: !prev[scopeKey] }));
  };

  const handleSaveBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!botName.trim() || !botToken.trim() || !defaultChatId.trim()) {
      error('يرجى ملء جميع الحقول المطلوبة للبوت');
      return;
    }

    if (editingBotId) {
      const existing = bots.find(b => b.bot_id === editingBotId);
      const updatedBot: TelegramBotConfig = {
        bot_id: editingBotId,
        bot_name: botName.trim(),
        bot_token: botToken.trim(),
        default_chat_id: defaultChatId.trim(),
        is_active: existing ? existing.is_active : true,
        description: description.trim(),
        scopes,
        created_at: existing ? existing.created_at : new Date().toISOString(),
        last_dispatched_at: existing?.last_dispatched_at
      };

      const res = telegramService.saveBot(updatedBot);
      if (res.success) {
        success('تم تحديث بيانات البوت بنجاح', updatedBot.bot_name);
        reloadBots();
        setIsModalOpen(false);
      } else {
        error('فشل حفظ التعديلات', res.error?.message);
      }
    } else {
      const newBot: TelegramBotConfig = {
        bot_id: 'bot-' + Math.random().toString(36).substring(2, 9),
        bot_name: botName.trim(),
        bot_token: botToken.trim(),
        default_chat_id: defaultChatId.trim(),
        is_active: true,
        description: description.trim(),
        scopes,
        created_at: new Date().toISOString()
      };

      const res = telegramService.saveBot(newBot);
      if (res.success) {
        success('تم تسجيل البوت بنجاح', newBot.bot_name);
        reloadBots();
        setIsModalOpen(false);
      } else {
        error('فشل حفظ البوت', res.error?.message);
      }
    }
  };

  const handleToggleActive = (bot: TelegramBotConfig) => {
    const updated = { ...bot, is_active: !bot.is_active };
    telegramService.saveBot(updated);
    reloadBots();
    info(updated.is_active ? 'تم تفعيل البوت' : 'تم تعطيل البوت مؤقتاً', bot.bot_name);
  };

  const handleDeleteBot = (botId: string, name: string) => {
    setBotToDelete({ id: botId, name });
  };

  const handleConfirmDelete = () => {
    if (botToDelete) {
      telegramService.deleteBot(botToDelete.id);
      reloadBots();
      success('تم حذف البوت بنجاح', botToDelete.name);
      setBotToDelete(null);
    }
  };

  // Trigger Standardized Dispatcher Test
  const handleTriggerTest = async (eventType: TelegramEventType, moduleName: 'Inbound' | 'Outbound' | 'Tickets' | 'SLA' | 'System') => {
    setIsTesting(true);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const testPayload = {
      origin: 'PCMS Engine',
      project_code_name: '1233 - مبنى الحراص وزارة الداخلية',
      module: moduleName,
      severity: eventType === 'critical_errors' ? 'CRITICAL' as const : 'INFO' as const,
      event: `اختبار بث فوري لرسائل تليجرام [حدث: ${eventType}]`,
      actor: `${currentUser?.full_name || 'Admin'} (${currentUser?.system_role || 'Super Admin'})`,
      timestamp: nowStr,
      reference: 'TEST-DISPATCH-9988'
    };

    const result = await telegramService.dispatchEvent(eventType, testPayload);
    setIsTesting(false);

    setTestResult({
      formatted: result.formatted_message,
      count: result.dispatched_count
    });

    success(
      'تم إطلاق الاختبار بنجاح',
      `تم إرسال الرسالة إلى (${result.dispatched_count}) بوت نشط ومصرح له بهذا النطاق`
    );
  };

  const scopeLabels: Record<keyof TelegramBotScopingMatrix, { label: string; desc: string; adminOnly: boolean }> = {
    critical_errors: { label: 'أخطاء برمجية حرجة', desc: 'أخطاء الخادم وقواعد البيانات وانقطاع الاتصال', adminOnly: true },
    user_bug_reports: { label: 'بلاغات الأعطال والشكاوى', desc: 'تذاكر الأعطال ومقترحات المهندسين مع لقطات الشاشة', adminOnly: true },
    sla_overdue: { label: 'تجاوز مهلة الرد', desc: 'تنبيهات عند اقتراب انتهاء مهلة الرد', adminOnly: false },
    inbound_logs: { label: 'تسجيل وارد جديد', desc: 'إشعار فوري عند تسجيل خطاب وارد جديد', adminOnly: false },
    outbound_approvals: { label: 'اعتماد الصادر والترقيم', desc: 'إشعار عند اعتماد الخطابات وتوليد الرقم الصادر', adminOnly: false },
    internal_tasks: { label: 'التكليفات والمهام', desc: 'توجيه المعاملات وتكليف مهندسي المكتب الفني', adminOnly: false },
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-sky-400" />
            <span>إدارة بوتات تليجرام</span>
          </h2>
          <p className="text-xs text-[#8097AE] mt-1">
            ربط بوتات وقنوات تليجرام وتحديد أحداث الإشعار لكل بوت
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            تسجيل بوت جديد
          </Button>
        </div>
      </div>

      {/* Quick Test Dispatch Panel */}
      <div className="p-4 rounded-xl bg-[#0F172A]/70 border border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-200">
          <Activity className="w-4 h-4 text-sky-400" />
          <span className="font-semibold">اختبار البث الفوري:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleTriggerTest('inbound_logs', 'Inbound')}
            disabled={isTesting}
            className="px-3 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>بث إشعار وارد</span>
          </button>

          <button
            onClick={() => handleTriggerTest('outbound_approvals', 'Outbound')}
            disabled={isTesting}
            className="px-3 py-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-[#A7CCB5] border border-[#A7CCB5]/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>بث اعتماد صادر</span>
          </button>

          <button
            onClick={() => handleTriggerTest('user_bug_reports', 'Tickets')}
            disabled={isTesting}
            className="px-3 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>بث بلاغ عطل</span>
          </button>
        </div>
      </div>

      {/* Test Result Display Modal */}
      {testResult && (
        <div className="p-4 rounded-xl bg-[#0F172A] text-white border border-[#A7CCB5]/40 shadow-xl relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#A7CCB5] flex items-center gap-1.5 font-mono">
              <Sparkles className="w-4 h-4" />
              <span>معاينة حمولة الإرسال:</span>
            </span>
            <button
              onClick={() => setTestResult(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              إغلاق المعاينة
            </button>
          </div>
          <pre className="p-3 rounded-lg bg-black/60 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed border border-white/10" dir="ltr">
            {testResult.formatted}
          </pre>
        </div>
      )}

      {/* Registered Bots Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bots.map(bot => (
          <div
            key={bot.bot_id}
            className={`p-5 rounded-2xl border transition-all ${
              bot.is_active 
                ? 'bg-[#1E293B] border-[#334155] shadow-sm hover:shadow-md' 
                : 'bg-[#0F172A]/40 border-[#334155] opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  bot.is_active ? 'bg-[#005B96]/30 text-sky-400' : 'bg-slate-800 text-slate-500'
                }`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{bot.bot_name}</h3>
                  <p className="text-[11px] font-mono text-[#8097AE]" dir="ltr">
                    قناة الإرسال: {bot.default_chat_id}
                  </p>
                </div>
              </div>

              {/* Status Toggle, Edit & Delete */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleActive(bot)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    bot.is_active 
                      ? 'bg-[#A7CCB5]/20 text-[#A7CCB5] border border-[#A7CCB5]/40 hover:bg-[#A7CCB5]/30' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {bot.is_active ? 'نشط' : 'معطل'}
                </button>

                <button
                  type="button"
                  title="تعديل إعدادات البوت"
                  onClick={() => handleOpenEditModal(bot)}
                  className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-colors cursor-pointer"
                >
                  <FileEdit className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="حذف البوت"
                  onClick={() => handleDeleteBot(bot.bot_id, bot.bot_name)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {bot.description && (
              <p className="text-xs text-slate-300 mb-3">{bot.description}</p>
            )}

            {/* Scopes Section */}
            <div className="pt-3 border-t border-[#334155]">
              <span className="block text-[11px] font-bold text-sky-400 mb-2">
                أحداث الإشعار المحددة:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(bot.scopes).map(([key, isGranted]) => {
                  const scopeMeta = scopeLabels[key as keyof TelegramBotScopingMatrix];
                  return (
                    <div
                      key={key}
                      className={`px-2 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 ${
                        isGranted 
                          ? 'bg-sky-950/40 text-sky-300 font-semibold border border-sky-800/40' 
                          : 'bg-[#0F172A] text-slate-500 line-through border border-transparent'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isGranted ? 'bg-sky-400' : 'bg-slate-600'}`} />
                      <span className="truncate">{scopeMeta?.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Last Dispatch Time */}
            <div className="mt-3 pt-2 border-t border-[#334155] flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span dir="ltr">Token: ••••••••••••••••{bot.bot_token.slice(-6)}</span>
              <span>آخر بث: {bot.last_dispatched_at ? formatDateTime(bot.last_dispatched_at) : 'لم يتم بعد'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Register / Edit Bot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBotId ? 'تعديل إعدادات البوت' : 'تسجيل بوت تليجرام جديد'}
        subtitle={editingBotId ? 'تعديل بيانات الاتصال وأحداث الإشعار' : 'ربط البوت وتحديد أحداث الإشعار'}
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveBot} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                اسم البوت: *
              </label>
              <input
                type="text"
                required
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="مثال: Staff Operations Bot"
                className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                معرف القناة أو المحادثة (Chat ID): *
              </label>
              <input
                type="text"
                required
                value={defaultChatId}
                onChange={(e) => setDefaultChatId(e.target.value)}
                placeholder="مثال: -100123456789"
                className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              رمز توثيق البوت (Bot Token): *
            </label>
            <input
              type="password"
              required
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="مثال: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              وصف الاستخدام والغرض:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: مخصص لإشعارات الموقع والمهندسين"
              className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none"
            />
          </div>

          {/* Scope Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              تحديد أحداث الإشعار المسموح بها:
            </label>
            <div className="space-y-2">
              {Object.entries(scopeLabels).map(([key, meta]) => {
                const scopeKey = key as keyof TelegramBotScopingMatrix;
                const isChecked = scopes[scopeKey];
                return (
                  <div
                    key={key}
                    onClick={() => handleToggleScope(scopeKey)}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                      isChecked 
                        ? 'border-sky-500 bg-sky-950/40' 
                        : 'border-[#334155] bg-[#0F172A] hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by parent div
                        className="mt-0.5 rounded text-[#005B96] focus:ring-[#005B96]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100">{meta.label}</span>
                          {meta.adminOnly && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40 font-mono font-semibold">
                              Admin Only
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#8097AE] mt-0.5">{meta.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#334155]">
            <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" size="md">
              {editingBotId ? 'حفظ التعديلات' : 'حفظ وتفعيل البوت'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Luxury In-App Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!botToDelete}
        onClose={() => setBotToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف البوت من المنظومة"
        message={`هل أنت متأكد من رغبتك في حذف البوت [${botToDelete?.name}]؟ سيؤدي ذلك إلى إلغاء ربطه وإيقاف الإشعارات التلقائية المرتبطة به فوراً.`}
        confirmText="تأكيد الحذف"
        cancelText="تراجع"
        variant="danger"
      />
    </div>
  );
};
