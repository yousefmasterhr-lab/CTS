// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Immutable Audit Trail, Dynamic History Flow & Compliance Hub
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState, useMemo } from 'react';
import { dbService, AuditLogItem } from '../../services/db/firestoreService';
import {
  ShieldAlert,
  Search,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  ArrowUpRight,
  Inbox,
  FilePlus,
  UserPlus,
  History,
  Activity
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

// Friendly, simple Arabic metadata for actions
const ACTION_MAP: Record<string, { label: string; badge: 'mint' | 'navy' | 'slate' | 'danger' | 'warning' | 'purple'; icon: React.ReactNode }> = {
  DOC_UPDATED: { label: 'تعديل خطاب', badge: 'warning', icon: <FileEdit className="w-3.5 h-3.5 text-amber-400" /> },
  OUTBOUND_APPROVED_ATOMIC: { label: 'اعتماد نهائي', badge: 'mint', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
  RETURNED_FOR_REVISION: { label: 'إرجاع للمراجعة', badge: 'danger', icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> },
  RESUBMITTED_FOR_APPROVAL: { label: 'إعادة رفع', badge: 'navy', icon: <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" /> },
  INBOUND_REGISTERED: { label: 'تسجيل وارد', badge: 'purple', icon: <Inbox className="w-3.5 h-3.5 text-purple-400" /> },
  OUTBOUND_DRAFT_CREATED: { label: 'إنشاء مسودة', badge: 'slate', icon: <FilePlus className="w-3.5 h-3.5 text-slate-300" /> },
  USER_CREATED: { label: 'إضافة موظف', badge: 'purple', icon: <UserPlus className="w-3.5 h-3.5 text-purple-400" /> },
};

export const AuditTrailView: React.FC = () => {
  const { success, info } = useNotification();
  const [auditLogs] = useState<AuditLogItem[]>(() => dbService.getAuditLogs());
  const correspondences = useMemo(() => dbService.getCorrespondences(), []);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Transaction History Flow Modal state
  const [selectedTargetDoc, setSelectedTargetDoc] = useState<string | null>(null);

  // Unique users from logs
  const uniqueUsers = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach(l => {
      if (l.user_name) set.add(l.user_name);
    });
    return Array.from(set);
  }, [auditLogs]);

  // Unique actions from logs
  const uniqueActions = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach(l => {
      if (l.action_type) set.add(l.action_type);
    });
    return Array.from(set);
  }, [auditLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchesDoc = (log.target_doc || '').toLowerCase().includes(q);
        const matchesUser = (log.user_name || '').toLowerCase().includes(q);
        const matchesDetails = (log.details || '').toLowerCase().includes(q);
        const matchesPrev = (log.previous_value || '').toLowerCase().includes(q);
        const matchesNew = (log.new_value || '').toLowerCase().includes(q);
        if (!matchesDoc && !matchesUser && !matchesDetails && !matchesPrev && !matchesNew) {
          return false;
        }
      }

      if (selectedUser !== 'ALL' && log.user_name !== selectedUser) {
        return false;
      }

      if (selectedAction !== 'ALL' && log.action_type !== selectedAction) {
        return false;
      }

      if (selectedDate) {
        const logDate = (log.timestamp || '').substring(0, 10);
        if (logDate !== selectedDate) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, searchQuery, selectedUser, selectedAction, selectedDate]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedUser('ALL');
    setSelectedAction('ALL');
    setSelectedDate('');
  };

  const isFilterActive = searchQuery || selectedUser !== 'ALL' || selectedAction !== 'ALL' || selectedDate;

  // KPI Statistics
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const updates = auditLogs.filter(l => l.action_type === 'DOC_UPDATED').length;
    const approvals = auditLogs.filter(l => l.action_type === 'OUTBOUND_APPROVED_ATOMIC').length;
    const activeUsersCount = uniqueUsers.length;
    return { total, updates, approvals, activeUsersCount };
  }, [auditLogs, uniqueUsers]);

  // NATIVE STYLED .XLSX EXPORT (ZERO EXCEL WARNINGS, BEAUTIFUL COLORS & RTL)
  const handleExportStyledExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      // Dynamic import of exceljs to maintain lightning fast bundle
      const ExcelJSModule = await import('exceljs');
      const ExcelJS = (ExcelJSModule as any).default || ExcelJSModule;

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'PCMS Enterprise';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('سجل الرقابة والتدقيق', {
        views: [{ rtl: true }]
      });

      // Row 1: Title Banner
      worksheet.mergeCells('A1:G1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'نظام إدارة المراسلات والمشاريع الهندسية (PCMS) • سجل الرقابة والتدقيق الشامل';
      titleCell.font = { name: 'Segoe UI', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF005B96' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 42;

      // Row 2: Subtitle Metadata
      worksheet.mergeCells('A2:G2');
      const nowFormatted = new Date().toLocaleString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      const subCell = worksheet.getCell('A2');
      subCell.value = `تاريخ استخراج التقرير: ${nowFormatted} | عدد الحركات المصدرة: ${filteredLogs.length} | شركة استشارات العفيفي الهندسية`;
      subCell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF38BDF8' } };
      subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      subCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(2).height = 26;

      // Row 3: Spacing
      worksheet.getRow(3).height = 10;

      // Row 4: Column Headers
      const headers = ['التوقيت', 'الموظف المسؤول', 'نوع الإجراء', 'رقم المعاملة', 'قبل التعديل', 'بعد التعديل', 'البيان والتفاصيل'];
      const headerRow = worksheet.getRow(4);
      headerRow.values = headers;
      headerRow.height = 30;

      worksheet.columns = [
        { key: 'timestamp', width: 22 },
        { key: 'user_name', width: 26 },
        { key: 'action_type', width: 18 },
        { key: 'target_doc', width: 24 },
        { key: 'previous_value', width: 32 },
        { key: 'new_value', width: 35 },
        { key: 'details', width: 50 },
      ];

      for (let col = 1; col <= 7; col++) {
        const cell = headerRow.getCell(col);
        cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF0369A1' } },
          bottom: { style: 'thin', color: { argb: 'FF0369A1' } },
          left: { style: 'thin', color: { argb: 'FF0369A1' } },
          right: { style: 'thin', color: { argb: 'FF0369A1' } },
        };
      }

      // Rows: Data
      filteredLogs.forEach((log, index) => {
        const actionLabel = ACTION_MAP[log.action_type]?.label || log.action_type;
        const formattedTime = formatDateTime(log.timestamp);
        const prevVal = log.previous_value && log.previous_value !== '—' ? log.previous_value : '—';
        const newVal = log.new_value && log.new_value !== '—' ? log.new_value : '—';

        const row = worksheet.addRow([
          formattedTime,
          log.user_name || '',
          actionLabel,
          log.target_doc || '',
          prevVal,
          newVal,
          log.details || ''
        ]);

        row.height = 26;
        const isEven = index % 2 === 0;
        const defaultBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

        // Action colors
        let actionBg = 'FFF1F5F9';
        let actionColor = 'FF334155';
        if (log.action_type === 'DOC_UPDATED') {
          actionBg = 'FFFEF3C7'; actionColor = 'FF92400E';
        } else if (log.action_type === 'OUTBOUND_APPROVED_ATOMIC') {
          actionBg = 'FFDCFCE7'; actionColor = 'FF15803D';
        } else if (log.action_type === 'RETURNED_FOR_REVISION') {
          actionBg = 'FFFEE2E2'; actionColor = 'FF991B1B';
        } else if (log.action_type === 'RESUBMITTED_FOR_APPROVAL') {
          actionBg = 'FFE0F2FE'; actionColor = 'FF0369A1';
        } else if (log.action_type === 'INBOUND_REGISTERED') {
          actionBg = 'FFF3E8FF'; actionColor = 'FF7E22CE';
        }

        for (let col = 1; col <= 7; col++) {
          const cell = row.getCell(col);
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          };

          cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF0F172A' } };
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };

          if (col === 1) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { name: 'Consolas', size: 9, color: { argb: 'FF64748B' } };
          } else if (col === 2) {
            cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
          } else if (col === 3) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: actionColor } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: actionBg } };
          } else if (col === 4) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { name: 'Consolas', size: 9.5, bold: true, color: { argb: 'FF0284C7' } };
          } else if (col === 5) {
            cell.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF9F1239' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF1F2' } };
          } else if (col === 6) {
            cell.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF166534' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
          } else if (col === 7) {
            cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF334155' } };
          }
        }
      });

      // Pure modern .xlsx generation
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const todayStr = new Date().toISOString().substring(0, 10);
      link.setAttribute('href', url);
      link.setAttribute('download', `سجل_الرقابة_والتدقيق_PCMS_${todayStr}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      success('تم تصدير شيت الإكسل بنجاح', `تم استخراج ملف إكسل رسمي (.xlsx) ملون ومنسق باحترافية.`);
    } catch (err: any) {
      console.error('Export error:', err);
      info('تنبيه', 'تعذر استخراج ملف الإكسل');
    } finally {
      setIsExporting(false);
    }
  };

  // Transaction History Flow Data for Modal
  const modalHistoryData = useMemo(() => {
    if (!selectedTargetDoc) return null;

    const matchingLogs = auditLogs.filter(l => {
      if (l.target_doc === selectedTargetDoc) return true;
      if (l.details && l.details.includes(selectedTargetDoc)) return true;
      if (l.previous_value && l.previous_value.includes(selectedTargetDoc)) return true;
      if (l.new_value && l.new_value.includes(selectedTargetDoc)) return true;
      return false;
    });

    const sorted = [...matchingLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const doc = correspondences.find(c => 
      c.serial_number === selectedTargetDoc || 
      c.doc_id === selectedTargetDoc ||
      (c.external_ref_no && c.external_ref_no === selectedTargetDoc)
    );

    return {
      targetDoc: selectedTargetDoc,
      doc,
      events: sorted
    };
  }, [selectedTargetDoc, auditLogs, correspondences]);

  return (
    <div className="space-y-6">
      {/* TOP HEADER & EXPORT */}
      <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-sky-400" />
            <span>سجل الرقابة والتدقيق الشامل</span>
          </h2>
          <p className="text-xs text-[#8097AE] mt-1">
            توثيق فوري لكافة حركات المعاملات والاعتمادات والتعديلات بالزمن الفعلي مع سجل المقارنة قبل وبعد
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            disabled={isExporting}
            onClick={handleExportStyledExcel}
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
            className="border-emerald-700/50 hover:border-emerald-500 hover:bg-emerald-950/30 text-emerald-300 cursor-pointer shadow-xs transition-all duration-200"
          >
            {isExporting ? 'جاري التصدير...' : 'تصدير إلى Excel'}
          </Button>

          <span className="text-xs font-mono px-3 py-2 rounded-xl bg-sky-950/40 text-sky-300 font-bold border border-sky-800/40 whitespace-nowrap shadow-xs">
            العمليات: {auditLogs.length}
          </span>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#1E293B]/90 border border-[#334155] shadow-xs">
          <div className="text-[11px] text-[#8097AE] font-semibold mb-1">إجمالي الحركات</div>
          <div className="text-xl font-mono font-black text-white">{stats.total}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1E293B]/90 border border-[#334155] shadow-xs">
          <div className="text-[11px] text-[#8097AE] font-semibold mb-1">عمليات التعديل</div>
          <div className="text-xl font-mono font-black text-amber-400">{stats.updates}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1E293B]/90 border border-[#334155] shadow-xs">
          <div className="text-[11px] text-[#8097AE] font-semibold mb-1">الاعتمادات الصادرة</div>
          <div className="text-xl font-mono font-black text-emerald-400">{stats.approvals}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1E293B]/90 border border-[#334155] shadow-xs">
          <div className="text-[11px] text-[#8097AE] font-semibold mb-1">الموظفون المسجلون</div>
          <div className="text-xl font-mono font-black text-sky-400">{stats.activeUsersCount}</div>
        </div>
      </div>

      {/* ADVANCED MULTI-FILTER BAR */}
      <div className="p-4 rounded-2xl bg-[#1E293B] border border-[#334155] shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-[#334155]/60 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Filter className="w-4 h-4 text-sky-400" />
            <span>تصفية وفلترة سجل الرقابة</span>
          </div>

          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو المعاملة أو البيان..."
              className="w-full px-3 py-2 pl-8 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </div>

          {/* User Filter */}
          <div className="relative">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-200 focus:ring-2 focus:ring-[#005B96] outline-none cursor-pointer transition-all"
            >
              <option value="ALL">كافة الموظفين</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {/* Action Type Filter */}
          <div className="relative">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-200 focus:ring-2 focus:ring-[#005B96] outline-none cursor-pointer transition-all"
            >
              <option value="ALL">كافة أنواع الإجراءات</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {ACTION_MAP[action]?.label || action}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-200 focus:ring-2 focus:ring-[#005B96] outline-none cursor-pointer transition-all font-mono"
            />
          </div>
        </div>

        {/* Filter count indicator */}
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
          <span>
            عرض <strong className="text-white font-mono">{filteredLogs.length}</strong> من إجمالي <strong className="text-white font-mono">{auditLogs.length}</strong> عملية
          </span>
          {isFilterActive && (
            <span className="text-amber-400 text-[10px] font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              تصفية نشطة
            </span>
          )}
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="bg-[#1E293B] rounded-2xl border border-[#334155] shadow-sm overflow-hidden">
        <table className="w-full text-right text-xs table-auto">
          <thead className="bg-[#0F172A] text-white select-none">
            <tr>
              <th className="py-3 px-3 font-semibold whitespace-nowrap">التوقيت</th>
              <th className="py-3 px-3 font-semibold whitespace-nowrap">الموظف</th>
              <th className="py-3 px-3 font-semibold whitespace-nowrap">نوع الإجراء</th>
              <th className="py-3 px-3 font-semibold whitespace-nowrap">المعاملة</th>
              <th className="py-3 px-3 font-semibold whitespace-nowrap">قبل</th>
              <th className="py-3 px-3 font-semibold whitespace-nowrap">بعد</th>
              <th className="py-3 px-3 font-semibold">البيان والتفاصيل</th>
              <th className="py-3 px-3 font-semibold text-center whitespace-nowrap">المسار</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#334155]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14 text-center text-[#8097AE]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-slate-500 stroke-1" />
                    <span>لا توجد سجلات تطابق معايير التصفية الحالية</span>
                    {isFilterActive && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-1 text-xs text-sky-400 hover:underline cursor-pointer"
                      >
                        إعادة ضبط الفلاتر وعرض الكل
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => {
                const actionMeta = ACTION_MAP[log.action_type] || {
                  label: log.action_type,
                  badge: 'slate',
                  icon: <Activity className="w-3.5 h-3.5 text-slate-400" />
                };

                return (
                  <tr
                    key={log.log_id}
                    className="hover:bg-slate-800/60 transition-colors group"
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap text-[11px]" dir="ltr">
                      {formatDateTime(log.timestamp)}
                    </td>

                    {/* Employee */}
                    <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#005B96]/30 text-sky-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                          {log.user_name ? log.user_name.charAt(0) : 'م'}
                        </div>
                        <span className="text-xs">{log.user_name}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge variant={actionMeta.badge} size="sm" className="whitespace-nowrap font-bold">
                        <span className="flex items-center gap-1">
                          {actionMeta.icon}
                          <span>{actionMeta.label}</span>
                        </span>
                      </Badge>
                    </td>

                    {/* Target Document */}
                    <td className="py-3 px-3 font-bold text-sky-400 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedTargetDoc(log.target_doc)}
                        className="hover:underline font-mono text-xs cursor-pointer flex items-center gap-1 text-sky-400 hover:text-sky-300"
                        title="فتح مسار وتاريخ المعاملة بالكامل"
                      >
                        <span dir="ltr">{log.target_doc}</span>
                      </button>
                    </td>

                    {/* Before (قبل) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {log.previous_value && log.previous_value !== '—' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950/30 text-rose-300 border border-rose-800/30 text-[11px] font-mono whitespace-nowrap max-w-[150px] truncate inline-block" title={log.previous_value}>
                          {log.previous_value}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">—</span>
                      )}
                    </td>

                    {/* After (بعد) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {log.new_value && log.new_value !== '—' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-300 border border-emerald-800/30 text-[11px] font-mono whitespace-nowrap max-w-[150px] truncate inline-block" title={log.new_value}>
                          {log.new_value}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">—</span>
                      )}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-3 text-slate-300 text-[11px] leading-relaxed">
                      {log.details || '—'}
                    </td>

                    {/* History Flow Action Button */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedTargetDoc(log.target_doc)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-sky-600 hover:text-white text-slate-300 border border-[#334155] transition-all duration-200 cursor-pointer shadow-xs group-hover:border-sky-500/50"
                        title="عرض مسار وتاريخ المعاملة بالكامل"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* TRANSACTION HISTORY FLOW MODAL */}
      <Modal
        isOpen={Boolean(selectedTargetDoc)}
        onClose={() => setSelectedTargetDoc(null)}
        title={`سجل تتبع ومسار المعاملة: ${selectedTargetDoc || ''}`}
        subtitle="سلسلة العمليات وتفاصيل التعديل قبل وبعد بالترتيب الزمني"
        maxWidth="3xl"
      >
        {modalHistoryData && (
          <div className="space-y-5">
            {/* Target Doc Summary Header Card */}
            <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
              <div>
                <div className="text-[11px] text-slate-400 font-semibold mb-0.5">المعاملة المستهدفة:</div>
                <div className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <span dir="ltr">{modalHistoryData.targetDoc}</span>
                  {modalHistoryData.doc && (
                    <Badge
                      variant={
                        modalHistoryData.doc.status === 'Approved' ? 'mint' :
                        modalHistoryData.doc.status === 'Rejected' ? 'danger' : 'warning'
                      }
                      size="sm"
                    >
                      {modalHistoryData.doc.status === 'Approved' ? 'معتمد رسمياً' :
                       modalHistoryData.doc.status === 'Rejected' ? 'مرفوض للتصحيح' : 'قيد المراجعة'}
                    </Badge>
                  )}
                </div>
                {modalHistoryData.doc && (
                  <div className="text-xs text-sky-300 font-medium mt-1">
                    {modalHistoryData.doc.subject}
                  </div>
                )}
              </div>

              <div className="text-left sm:text-right text-xs font-mono text-slate-400">
                <div>إجمالي العمليات المسجلة: <strong className="text-white">{modalHistoryData.events.length}</strong></div>
                {modalHistoryData.events[0] && (
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    تاريخ البدء: {formatDateTime(modalHistoryData.events[0].timestamp)}
                  </div>
                )}
              </div>
            </div>

            {/* Visual Timeline Flow */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-1 border-b border-[#334155]/60">
                <History className="w-4 h-4 text-sky-400" />
                <span>المسار الزمني وحركات التعديل المتعاقبة (History Flow):</span>
              </div>

              {modalHistoryData.events.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  لا توجد حركات مسجلة إضافية لهذه المعاملة
                </div>
              ) : (
                <div className="relative pr-6 space-y-4 before:absolute before:right-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-sky-500 before:via-indigo-500 before:to-emerald-500">
                  {modalHistoryData.events.map((event, idx) => {
                    const isLast = idx === modalHistoryData.events.length - 1;
                    const prevActor = idx > 0 ? modalHistoryData.events[idx - 1].user_name : null;
                    const nextActor = idx < modalHistoryData.events.length - 1 ? modalHistoryData.events[idx + 1].user_name : null;
                    const actionMeta = ACTION_MAP[event.action_type] || {
                      label: event.action_type,
                      badge: 'slate',
                      icon: <Activity className="w-3.5 h-3.5 text-slate-400" />
                    };

                    return (
                      <div key={event.log_id} className="relative group">
                        {/* Timeline Node Dot */}
                        <div className={`absolute -right-6 top-1.5 w-4 h-4 rounded-full border-2 border-[#1E293B] flex items-center justify-center ${
                          isLast ? 'bg-emerald-400 ring-4 ring-emerald-500/20 animate-pulse' : 'bg-sky-400'
                        }`} />

                        {/* Event Card */}
                        <div className="p-3.5 rounded-xl bg-[#0F172A]/80 border border-[#334155] hover:border-sky-500/40 transition-all duration-200 shadow-xs space-y-2.5">
                          {/* Top Row: User & Action & Time */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-sky-900/60 text-sky-200 text-[10px] flex items-center justify-center font-mono">
                                  {idx + 1}
                                </span>
                                <span>{event.user_name}</span>
                              </span>
                              <Badge variant={actionMeta.badge} size="sm">
                                <span className="flex items-center gap-1">
                                  {actionMeta.icon}
                                  <span>{actionMeta.label}</span>
                                </span>
                              </Badge>
                            </div>

                            <div className="font-mono text-[11px] text-slate-400" dir="ltr">
                              {formatDateTime(event.timestamp)}
                            </div>
                          </div>

                          {/* Specific Action Details */}
                          <div className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                            <span className="font-semibold text-sky-300">التفاصيل: </span>
                            <span>{event.details}</span>
                          </div>

                          {/* Before vs After Visual Comparison */}
                          {(event.previous_value || event.new_value) && (
                            <div className="p-2.5 rounded-xl bg-[#1E293B]/70 border border-[#334155]/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                              <div className="flex items-start sm:items-center gap-1.5 text-rose-300 flex-1">
                                <span className="text-[10px] font-sans font-bold text-slate-400 shrink-0">قبل:</span>
                                <span className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/40 text-[11px] leading-relaxed">
                                  {event.previous_value || '—'}
                                </span>
                              </div>

                              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500 shrink-0 hidden sm:block rotate-180" />

                              <div className="flex items-start sm:items-center gap-1.5 text-emerald-300 flex-1">
                                <span className="text-[10px] font-sans font-bold text-slate-400 shrink-0">بعد:</span>
                                <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-[11px] leading-relaxed">
                                  {event.new_value || '—'}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Relative Flow Relationship Summary (مين عدل قبله وبعده) */}
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 pt-1 border-t border-[#334155]/40">
                            {prevActor ? (
                              <span>
                                تم الإجراء بعد تعديل: <strong className="text-sky-300">{prevActor}</strong>
                              </span>
                            ) : (
                              <span className="text-teal-300 font-semibold">بداية إنشاء وقيد المعاملة</span>
                            )}

                            {nextActor && (
                              <span>
                                • تلاه إجراء بواسطة: <strong className="text-sky-300">{nextActor}</strong>
                              </span>
                            )}

                            {isLast && (
                              <span className="text-emerald-400 font-semibold">• أحدث حركة مسجلة على المعاملة</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-[#334155]">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setSelectedTargetDoc(null)}
              >
                إغلاق النافذة
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
