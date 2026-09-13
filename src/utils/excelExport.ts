// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Ultra-Premium Enterprise Excel Export Utility (Styled .xlsx)
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import { Correspondence } from '../types/correspondence';
import { formatDateTime } from './formatters';

export async function exportCorrespondencesToExcel(
  data: Correspondence[],
  fileName = 'سجل_المراسلات_العام_PCMS'
): Promise<void> {
  // Dynamically import exceljs for zero startup overhead and code splitting
  const ExcelJSModule = await import('exceljs');
  const ExcelJS = (ExcelJSModule as any).default || ExcelJSModule;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PCMS Enterprise System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('سجل المراسلات', {
    views: [{ rtl: true }]
  });

  const nowFormatted = new Date().toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  // -------------------------------------------------------------
  // Row 1: Corporate Title Banner
  // -------------------------------------------------------------
  worksheet.mergeCells('A1:R1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'نظام إدارة المراسلات والمشاريع الهندسية (PCMS) • سجل المراسلات العام';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF005B96' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 45;

  // -------------------------------------------------------------
  // Row 2: Subtitle Metadata
  // -------------------------------------------------------------
  worksheet.mergeCells('A2:R2');
  const subCell = worksheet.getCell('A2');
  subCell.value = `تاريخ التصدير: ${nowFormatted}  |  إجمالي المعاملات: ${data.length} خطاب  |  مركز استشارات العفيفي الهندسي`;
  subCell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF38BDF8' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 26;

  // Row 3: Spacing
  worksheet.getRow(3).height = 10;

  // -------------------------------------------------------------
  // Row 4: Column Headers
  // -------------------------------------------------------------
  const headers = [
    '#',
    'الرقم المرجعي / الصادر',
    'النوع',
    'التصنيف',
    'رقم المرجع الخارجي',
    'كود المشروع',
    'الموضوع والبيان',
    'الجهة الراسلة',
    'الجهة الموجه إليها',
    'الأهمية',
    'الحالة',
    'تاريخ التحرير',
    'تاريخ الاستلام',
    'تاريخ استحقاق الرد',
    'المعاملة الأصلية',
    'محرر المعاملة',
    'المعتمد',
    'تاريخ الاعتماد'
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 34;

  // Set Widths
  worksheet.columns = [
    { key: 'index', width: 6 },
    { key: 'serial', width: 28 },
    { key: 'type', width: 12 },
    { key: 'class', width: 12 },
    { key: 'ext_ref', width: 24 },
    { key: 'project', width: 16 },
    { key: 'subject', width: 48 },
    { key: 'sender', width: 26 },
    { key: 'receiver', width: 26 },
    { key: 'priority', width: 14 },
    { key: 'status', width: 16 },
    { key: 'issue_date', width: 15 },
    { key: 'received_date', width: 18 },
    { key: 'due_date', width: 18 },
    { key: 'parent', width: 24 },
    { key: 'creator', width: 22 },
    { key: 'approver', width: 22 },
    { key: 'approval_date', width: 18 }
  ];

  // Header Cells Formatting
  for (let col = 1; col <= 18; col++) {
    const cell = headerRow.getCell(col);
    cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF0369A1' } },
      bottom: { style: 'thin', color: { argb: 'FF0369A1' } },
      left: { style: 'thin', color: { argb: 'FF0369A1' } },
      right: { style: 'thin', color: { argb: 'FF0369A1' } }
    };
  }

  // -------------------------------------------------------------
  // Data Rows
  // -------------------------------------------------------------
  data.forEach((item, index) => {
    const isIncoming = item.doc_type === 'Incoming';
    const typeLabel = isIncoming ? 'وارد' : 'صادر';

    let statusLabel = 'قيد المراجعة';
    let statusBg = 'FFFEF3C7';
    let statusColor = 'FF92400E';

    if (item.status === 'Approved') {
      statusLabel = 'معتمد';
      statusBg = 'FFDCFCE7';
      statusColor = 'FF15803D';
    } else if (item.status === 'Replied') {
      statusLabel = 'تم الرد';
      statusBg = 'FFDBEAFE';
      statusColor = 'FF1D4ED8';
    } else if (item.status === 'Rejected') {
      statusLabel = 'مرفوض للتصحيح';
      statusBg = 'FFFEE2E2';
      statusColor = 'FF991B1B';
    } else if (item.status === 'Draft') {
      statusLabel = 'مسودة';
      statusBg = 'FFF1F5F9';
      statusColor = 'FF475569';
    }

    let priorityLabel = 'عادي';
    let priorityBg = 'FFF1F5F9';
    let priorityColor = 'FF475569';
    if (item.priority === 'Immediate') {
      priorityLabel = 'فوري';
      priorityBg = 'FFFFE4E6';
      priorityColor = 'FFBE123C';
    } else if (item.priority === 'Urgent') {
      priorityLabel = 'عاجل';
      priorityBg = 'FFFEF3C7';
      priorityColor = 'FFB45309';
    }

    const row = worksheet.addRow([
      index + 1,
      item.serial_number,
      typeLabel,
      item.classification,
      item.external_ref_no || '—',
      item.project_ref,
      item.subject,
      item.sender_entity,
      item.receiver_entity,
      priorityLabel,
      statusLabel,
      item.issue_date,
      item.received_date ? formatDateTime(item.received_date) : '—',
      item.due_date ? formatDateTime(item.due_date) : '—',
      item.parent_serial || item.parent_doc_id || '—',
      item.created_by_name || '—',
      item.approved_by_name || '—',
      item.approval_date ? formatDateTime(item.approval_date) : '—'
    ]);

    row.height = 26;
    const isEven = index % 2 === 0;
    const defaultBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    for (let col = 1; col <= 18; col++) {
      const cell = row.getCell(col);
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };

      cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF0F172A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };

      // Specific Column Styling
      if (col === 1) {
        // Index
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Consolas', size: 9, color: { argb: 'FF64748B' } };
      } else if (col === 2) {
        // Serial Number
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Consolas', size: 9.5, bold: true, color: { argb: 'FF0284C7' } };
      } else if (col === 3) {
        // Type (Incoming / Outgoing)
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: isIncoming ? 'FF7E22CE' : 'FF0369A1' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isIncoming ? 'FFF3E8FF' : 'FFE0F2FE' } };
      } else if (col === 4) {
        // Classification
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Consolas', size: 9.5, bold: true, color: { argb: 'FF334155' } };
      } else if (col === 5) {
        // External Ref
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Consolas', size: 9, color: { argb: 'FF475569' } };
      } else if (col === 6) {
        // Project
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
      } else if (col === 7) {
        // Subject
        cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
      } else if (col === 10) {
        // Priority
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: priorityColor } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: priorityBg } };
      } else if (col === 11) {
        // Status
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: statusColor } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
      } else if (col >= 12 && col <= 14) {
        // Dates
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Consolas', size: 9, color: { argb: 'FF64748B' } };
      } else if (col === 18) {
        // Approval Date
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Consolas', size: 9, color: { argb: 'FF64748B' } };
      }
    }
  });

  // -------------------------------------------------------------
  // Generate Pure Native .xlsx and Trigger Download
  // -------------------------------------------------------------
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const todayStr = new Date().toISOString().substring(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${todayStr}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
