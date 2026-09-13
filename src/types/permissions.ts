// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Granular Permission Matrix & Role Templates
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import { SystemRole } from './auth';

export type PermissionCategory = 
  | 'dashboard'
  | 'projects'
  | 'inbound' 
  | 'outbound' 
  | 'correspondence'
  | 'tickets' 
  | 'bots' 
  | 'admin';

export interface PermissionItem {
  id: string;
  label: string;
  description: string;
  category: PermissionCategory;
}

export const PERMISSION_CATEGORIES: { id: PermissionCategory; label: string }[] = [
  { id: 'dashboard', label: 'لوحة المتابعة والمؤشرات' },
  { id: 'projects', label: 'المشاريع والجهات الهندسية' },
  { id: 'inbound', label: 'إدارة الوارد' },
  { id: 'outbound', label: 'إدارة الصادر والاعتمادات' },
  { id: 'correspondence', label: 'سجل المراسلات العام والتقارير' },
  { id: 'tickets', label: 'الدعم الفني والبلاغات' },
  { id: 'bots', label: 'إشعارات وبوتات تليجرام' },
  { id: 'admin', label: 'إدارة النظام والأمان' },
];

export const ALL_PERMISSIONS: PermissionItem[] = [
  // 1. Dashboard (لوحة المتابعة والمؤشرات)
  { id: 'dashboard.view', label: 'فتح واستعراض لوحة المتابعة', description: 'الاطلاع على ملخص حركة المراسلات والإحصائيات العامة', category: 'dashboard' },
  { id: 'dashboard.analytics', label: 'الاطلاع على المخططات التحليلية', description: 'متابعة الرسوم البيانية الشهرية وتوزيع المعاملات', category: 'dashboard' },
  { id: 'dashboard.switch_project', label: 'تصفية اللوحة حسب مشروع محدد', description: 'التبديل بين عرض كافة المشاريع أو مشروع بعينه', category: 'dashboard' },

  // 2. Projects & Stakeholders (المشاريع والجهات الهندسية)
  { id: 'projects.view', label: 'استعراض قائمة وبيانات المشاريع', description: 'الاطلاع على تفاصيل المشروعات والعقود والبيانات المالية', category: 'projects' },
  { id: 'projects.create', label: 'إضافة وتكويد مشروع جديد', description: 'تسجيل مشروع هندسي جديد وتحديد أطرافه وبياناته', category: 'projects' },
  { id: 'projects.edit', label: 'تعديل بيانات المشروعات', description: 'تحديث بيانات المشروعات وحالتها وقيمتها وتواريخها', category: 'projects' },
  { id: 'projects.delete', label: 'حذف أو أرشفة المشاريع', description: 'حذف المشروعات غير المرتبطة بمعاملات أو أرشفتها', category: 'projects' },
  { id: 'projects.timeline', label: 'استعراض الخط الزمني ومراسلات المشروع', description: 'فتح شاشة المراسلات التفصيلية التابعة لكل مشروع', category: 'projects' },
  { id: 'entities.view', label: 'استعراض دليل الشركات والجهات', description: 'الاطلاع على قائمة المقاولين والاستشاريين والجهات المالكة', category: 'projects' },
  { id: 'entities.manage', label: 'إضافة وتعديل وحذف الشركات والجهات', description: 'تسجيل جهة جديدة وتعديل بيانات الاتصال والمفوضين', category: 'projects' },

  // 3. Inbound (إدارة الوارد)
  { id: 'inbound.view', label: 'استعراض سجل وخطابات الوارد', description: 'الاطلاع على قائمة المعاملات الواردة وبياناتها', category: 'inbound' },
  { id: 'inbound.create', label: 'تسجيل وقيد وارد جديد', description: 'إضافة خطابات واردة جديدة ورفع مرفقاتها', category: 'inbound' },
  { id: 'inbound.edit', label: 'تعديل بيانات الخطابات الواردة', description: 'تعديل الموضوع، الرقم المرجعي، وتاريخ الخطاب', category: 'inbound' },
  { id: 'inbound.return', label: 'إرجاع الوارد للمراجعة والتصحيح', description: 'إرجاع المعاملة لمدخل البيانات مع توجيه الملاحظات', category: 'inbound' },
  { id: 'inbound.delete', label: 'حذف معاملات الوارد', description: 'حذف الخطابات والملفات المرفوعة نهائياً', category: 'inbound' },
  { id: 'inbound.download', label: 'تحميل ومعاينة الملفات الأصلية', description: 'تحميل الوثائق الممسوحة ضوئياً والمرفقات', category: 'inbound' },
  { id: 'inbound.reply', label: 'إعداد وتوجيه رد صادر', description: 'إنشاء مسودة رد صادر وربطها بالمعاملة الواردة', category: 'inbound' },
  { id: 'inbound.print', label: 'طباعة الباركود وبطاقة الخطاب الوارد', description: 'طباعة باركود الاستلام والملخص الإداري للمعاملة', category: 'inbound' },

  // 4. Outbound (إدارة الصادر والاعتمادات)
  { id: 'outbound.view', label: 'استعراض سجل ومسودات الصادر', description: 'الاطلاع على المسودات والخطابات الصادرة المعتمدة', category: 'outbound' },
  { id: 'outbound.create', label: 'تحرير مسودة صادر جديدة', description: 'بدء كتابة وصياغة خطابات صادر جديدة للمشروع', category: 'outbound' },
  { id: 'outbound.edit', label: 'تعديل مسودات الصادر', description: 'تعديل نصوص وتفاصيل المسودات قيد الإعداد', category: 'outbound' },
  { id: 'outbound.return', label: 'إرجاع الصادر للمراجعة والتصحيح', description: 'إرجاع المسودة للكاتب لإجراء تصحيحات قبل الاعتماد', category: 'outbound' },
  { id: 'outbound.approve', label: 'الاعتماد وتوليد الرقم الصادر الرسمي', description: 'الاعتماد النهائي وإصدار الرقم الصادر الرسمي وختمه', category: 'outbound' },
  { id: 'outbound.quick_approve', label: 'الاعتماد السريع للمسودات', description: 'اعتماد المسودات بنقرة واحدة من القائمة المباشرة', category: 'outbound' },
  { id: 'outbound.delete', label: 'حذف المسودات الصادرة', description: 'حذف المسودات الملغاة أو غير الصالحة', category: 'outbound' },
  { id: 'outbound.download', label: 'تحميل وثائق الصادر والمرفقات', description: 'تحميل مستند الصادر المعتمد والمرفقات المصاحبة', category: 'outbound' },
  { id: 'outbound.print', label: 'طباعة الخطاب الصادر بباركود QR', description: 'توليد وطباعة الوثيقة الرسمية الصادرة مع كود التحقق', category: 'outbound' },

  // 5. Correspondence & Reports (سجل المراسلات العام والتقارير)
  { id: 'correspondence.view', label: 'استعراض السجل العام لكافة المراسلات', description: 'البحث والاطلاع على جميع الخطابات الصادرة والواردة', category: 'correspondence' },
  { id: 'correspondence.filter', label: 'استخدام فلاتر وتصنيفات البحث المتقدم', description: 'فرز المعاملات حسب التاريخ والنوع والجهات', category: 'correspondence' },
  { id: 'cycle.view', label: 'الاطلاع على دورة المراسلات وشجرة الردود', description: 'استعراض الترابط بين الخطابات وسلسلة الردود المتبادلة', category: 'correspondence' },
  { id: 'reports.export', label: 'تصدير تقارير إكسل وسجلات المراسلات', description: 'توليد ملفات إكسل منسقة للمراسلات وسجل العمليات', category: 'correspondence' },
  { id: 'reports.analytics', label: 'متابعة مواعيد الردود والمهل المحددة', description: 'تتبع المراسلات المتأخرة وتنبيهات سرعة الإنجاز', category: 'correspondence' },

  // 6. Tickets & Support (الدعم الفني والبلاغات)
  { id: 'tickets.view', label: 'استعراض بلاغات وتذاكر الأعطال', description: 'الاطلاع على لوحة فرز التذاكر ومقترحات المهندسين', category: 'tickets' },
  { id: 'tickets.create', label: 'إرسال بلاغ أو فكرة تحسين جديدة', description: 'تسجيل بلاغ عطل فني أو تقديم اقتراح للمنظومة', category: 'tickets' },
  { id: 'tickets.triage', label: 'نقل وتحديث مراحل البلاغات (Kanban)', description: 'سحب ونقل التذاكر بين مراحل الفحص والمعالجة', category: 'tickets' },
  { id: 'tickets.resolve', label: 'اعتماد حل البلاغات وإغلاق التذاكر', description: 'إغلاق البلاغ وتدوين ملاحظات الدعم الفني', category: 'tickets' },

  // 7. Telegram Bots (إشعارات وبوتات تليجرام)
  { id: 'bots.view', label: 'الاطلاع على قنوات وبوتات تليجرام', description: 'استعراض حالة البوتات وقنوات البث المربوطة', category: 'bots' },
  { id: 'bots.manage', label: 'إضافة وتعديل وحذف البوتات', description: 'إدارة مفاتيح الربط وتحديد أحداث الإشعار للبوت', category: 'bots' },
  { id: 'bots.test', label: 'إطلاق اختبارات الإرسال الفوري', description: 'محاكاة بث الرسائل للتحقق من وصول الإشعارات', category: 'bots' },

  // 8. System Admin (إدارة النظام والأمان)
  { id: 'users.view', label: 'استعراض قائمة الموظفين والحسابات', description: 'الاطلاع على دليل الموظفين وأقسامهم والمشاريع', category: 'admin' },
  { id: 'users.manage', label: 'إنشاء وتعديل بيانات وحسابات الموظفين', description: 'إضافة موظف جديد أو تعديل بياناته الوظيفية', category: 'admin' },
  { id: 'users.permissions', label: 'تخصيص الصلاحيات الفردية للموظفين', description: 'تعديل وتخصيص صلاحيات موظف معين بشكل استثنائي', category: 'admin' },
  { id: 'users.toggle_status', label: 'تفعيل وتعطيل حسابات الموظفين', description: 'إيقاف مؤقت أو إعادة تنشيط حساب أي موظف', category: 'admin' },
  { id: 'admin.templates_manage', label: 'تعديل وحفظ قوالب الصلاحيات الافتراضية', description: 'ضبط حزم الصلاحيات التلقائية لكل وظيفة مسبقاً', category: 'admin' },
  { id: 'audit.view', label: 'استعراض سجل الرقابة والعمليات (Audit Trail)', description: 'تتبع كافة الحركات والعمليات المنفذة على النظام', category: 'admin' },
  { id: 'audit.export', label: 'تصدير سجل العمليات والرقابة إلى إكسل', description: 'تصدير تقرير مفصل بجميع العمليات وتاريخها ومن قام بها', category: 'admin' },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, string[]> = {
  Admin: ALL_PERMISSIONS.map(p => p.id),

  Project_Manager: [
    'dashboard.view', 'dashboard.analytics', 'dashboard.switch_project',
    'projects.view', 'projects.create', 'projects.edit', 'projects.timeline', 'entities.view', 'entities.manage',
    'inbound.view', 'inbound.create', 'inbound.edit', 'inbound.return', 'inbound.download', 'inbound.reply', 'inbound.print',
    'outbound.view', 'outbound.create', 'outbound.edit', 'outbound.return', 'outbound.approve', 'outbound.quick_approve', 'outbound.download', 'outbound.print',
    'correspondence.view', 'correspondence.filter', 'cycle.view', 'reports.export', 'reports.analytics',
    'tickets.view', 'tickets.create', 'tickets.triage', 'tickets.resolve',
    'bots.view', 'bots.test',
    'users.view', 'audit.view'
  ],

  Doc_Controller: [
    'dashboard.view', 'dashboard.switch_project',
    'projects.view', 'projects.timeline', 'entities.view',
    'inbound.view', 'inbound.create', 'inbound.edit', 'inbound.return', 'inbound.download', 'inbound.reply', 'inbound.print',
    'outbound.view', 'outbound.create', 'outbound.edit', 'outbound.download', 'outbound.print',
    'correspondence.view', 'correspondence.filter', 'cycle.view', 'reports.export',
    'tickets.view', 'tickets.create',
    'bots.view',
    'users.view'
  ],

  Engineer: [
    'dashboard.view', 'dashboard.analytics', 'dashboard.switch_project',
    'projects.view', 'projects.timeline', 'entities.view',
    'inbound.view', 'inbound.download', 'inbound.reply', 'inbound.print',
    'outbound.view', 'outbound.create', 'outbound.edit', 'outbound.download',
    'correspondence.view', 'correspondence.filter', 'cycle.view', 'reports.analytics',
    'tickets.view', 'tickets.create',
    'bots.view'
  ],

  Viewer: [
    'dashboard.view',
    'projects.view', 'projects.timeline', 'entities.view',
    'inbound.view', 'inbound.download',
    'outbound.view', 'outbound.download',
    'correspondence.view', 'correspondence.filter', 'cycle.view',
    'reports.analytics',
    'tickets.create'
  ]
};

const STORAGE_ROLE_TEMPLATES = 'pcms_role_permission_templates';

export const getRoleTemplates = (): Record<SystemRole, string[]> => {
  try {
    const raw = localStorage.getItem(STORAGE_ROLE_TEMPLATES);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ROLE_PERMISSIONS, ...parsed };
    }
  } catch (e) {
    // fallback
  }
  return { ...DEFAULT_ROLE_PERMISSIONS };
};

export const saveRoleTemplates = (templates: Record<SystemRole, string[]>): void => {
  try {
    localStorage.setItem(STORAGE_ROLE_TEMPLATES, JSON.stringify(templates));
  } catch (e) {
    // ignore
  }
};
