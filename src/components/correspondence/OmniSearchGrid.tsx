// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Central Omni-Search Grid with Multi-Filters & Eye-Care Dark Theme
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db/firestoreService';
import { Correspondence } from '../../types/correspondence';
import { exportCorrespondencesToExcel } from '../../utils/excelExport';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProjectFilterBar } from '../common/ProjectFilterBar';
import { 
  Search, 
  FileSpreadsheet, 
  Inbox, 
  Send, 
  Eye, 
  Reply, 
  Layers
} from 'lucide-react';
import { getDocTypeLabel } from '../../utils/formatters';

interface OmniSearchGridProps {
  onOpenDossier: (doc: Correspondence) => void;
  onReplyToInbound: (inboundDoc: Correspondence) => void;
  onOpenInboundModal: () => void;
  onOpenOutboundModal: () => void;
}

export const OmniSearchGrid: React.FC<OmniSearchGridProps> = ({
  onOpenDossier,
  onReplyToInbound,
  onOpenInboundModal,
  onOpenOutboundModal
}) => {
  const { currentUser, activeProjectId } = useAuth();
  const projects = dbService.getProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDirection, setSelectedDirection] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Load correspondences
  const rawCorrespondences = dbService.getCorrespondences({ user: currentUser || undefined });

  // Filtered List
  const filteredList = useMemo(() => {
    return rawCorrespondences.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSerial = item.serial_number.toLowerCase().includes(q);
        const matchesSubject = item.subject.toLowerCase().includes(q);
        const matchesExt = item.external_ref_no?.toLowerCase().includes(q) || false;
        const matchesSender = item.sender_entity.toLowerCase().includes(q);
        const matchesReceiver = item.receiver_entity.toLowerCase().includes(q);
        if (!matchesSerial && !matchesSubject && !matchesExt && !matchesSender && !matchesReceiver) {
          return false;
        }
      }

      // Project
      if (activeProjectId !== 'ALL' && item.project_ref !== activeProjectId) {
        return false;
      }

      // Direction
      if (selectedDirection !== 'ALL' && item.doc_type !== selectedDirection) {
        return false;
      }

      // Classification
      if (selectedType !== 'ALL' && item.classification !== selectedType) {
        return false;
      }

      // Status
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [rawCorrespondences, searchQuery, activeProjectId, selectedDirection, selectedType, selectedStatus]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportCorrespondencesToExcel(filteredList, `PCMS_Correspondence_Export`);
    } catch (err) {
      console.error('Failed to export correspondences to Excel:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Main Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#1E293B] p-5 rounded-2xl border border-[#334155] shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>سجل المراسلات العام</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            متابعة وبحث المراسلات الصادرة والواردة وتصدير التقارير
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Excel Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 font-semibold"
            leftIcon={<FileSpreadsheet className={`w-4 h-4 text-emerald-400 ${isExporting ? 'animate-spin' : ''}`} />}
          >
            {isExporting ? 'جاري التصدير...' : `تصدير تقرير (${filteredList.length}) Excel`}
          </Button>

          {/* Intake / Draft Triggers */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenInboundModal}
            leftIcon={<Inbox className="w-4 h-4" />}
          >
            تسجيل وارد
          </Button>

          <Button
            variant="mint"
            size="sm"
            onClick={onOpenOutboundModal}
            leftIcon={<Send className="w-4 h-4 text-[#0F172A]" />}
            className="font-bold"
          >
            تحرير صادر
          </Button>
        </div>
      </div>

      {/* Project Selector Bar */}
      <ProjectFilterBar 
        scopeLabel="سجل المراسلات العام" 
        correspondences={rawCorrespondences} 
      />

      {/* Secondary Filters Bar */}
      <div className="p-4 bg-[#1E293B] rounded-2xl border border-[#334155] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالرقم الصادر، المرجع الخارجي، الموضوع، أو الجهة..."
            className="w-full px-3.5 py-2 pl-9 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#005B96]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Direction */}
        <div>
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#005B96] font-medium"
          >
            <option value="ALL">النوع (الكل)</option>
            <option value="Incoming">وارد فقط (Incoming)</option>
            <option value="Outgoing">صادر فقط (Outgoing)</option>
          </select>
        </div>

        {/* Classification */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#005B96] font-medium"
          >
            <option value="ALL">التصنيف (الكل)</option>
            <option value="LTR">LTR - خطابات رسمية</option>
            <option value="SUB">SUB - اعتمادات مواد وفنية</option>
            <option value="RFI">RFI - استفسارات فنية</option>
            <option value="IPC">IPC - مستخلصات مالية</option>
            <option value="MOM">MOM - محاضر اجتماعات</option>
            <option value="TRANS">TRANS - مذكرات إرسال</option>
            <option value="SITE">SITE - ملاحظات موقعية</option>
          </select>
        </div>
      </div>

      {/* Grid Table View */}
      <div className="bg-[#1E293B] rounded-2xl border border-[#334155] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#0F172A] text-slate-300 select-none border-b border-[#334155]">
              <tr>
                <th className="py-3.5 px-4 font-bold">المسار والرقم المرجعي</th>
                <th className="py-3.5 px-4 font-bold">التصنيف والمشروع</th>
                <th className="py-3.5 px-4 font-bold">الموضوع والملخص التنفيذي</th>
                <th className="py-3.5 px-4 font-bold">الجهة الراسلة / المستلمة</th>
                <th className="py-3.5 px-4 font-bold">الأهمية</th>
                <th className="py-3.5 px-4 font-bold">الحالة</th>
                <th className="py-3.5 px-4 font-bold">التاريخ</th>
                <th className="py-3.5 px-4 font-bold text-center">إجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#334155]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Layers className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-white">لا توجد مراسلات مطابقة لمعايير البحث</p>
                    <p className="text-xs text-slate-400 mt-1">جرب تغيير الفلاتر أو إزالة كلمات البحث</p>
                  </td>
                </tr>
              ) : (
                filteredList.map(item => {
                  const typeInfo = getDocTypeLabel(item.classification);
                  const isIncoming = item.doc_type === 'Incoming';

                  return (
                    <tr
                      key={item.doc_id}
                      className="hover:bg-slate-800/60 transition-colors group"
                    >
                      {/* Serial Number & Direction (with explicit dir="ltr") */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            isIncoming ? 'bg-blue-500/20 text-blue-400' : 'bg-[#A7CCB5]/20 text-[#A7CCB5]'
                          }`}>
                            {isIncoming ? <Inbox className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <button
                              onClick={() => onOpenDossier(item)}
                              className="serial-code text-xs font-bold text-white hover:text-[#A7CCB5] transition-colors"
                            >
                              {item.serial_number}
                            </button>
                            {item.external_ref_no && (
                              <div className="serial-code block text-[10px] text-slate-400 mt-0.5">
                                مرجع: {item.external_ref_no}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Classification & Project */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-white">
                            {typeInfo.ar}
                          </span>
                          <span className="serial-code text-[10px] text-slate-400">
                            [{item.project_ref}]
                          </span>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <p className="font-semibold text-slate-100 leading-snug line-clamp-2">
                          {item.subject}
                        </p>
                        {item.parent_serial && (
                          <div className="flex items-center gap-1 text-[10px] text-[#A7CCB5] mt-1 font-mono">
                            <span>رد على: <span className="serial-code">{item.parent_serial}</span></span>
                          </div>
                        )}
                      </td>

                      {/* Parties */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-[11px] text-slate-200">من: {item.sender_entity}</div>
                        <div className="text-[10px] text-slate-400">إلى: {item.receiver_entity}</div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant={item.priority === 'Immediate' ? 'danger' : item.priority === 'Urgent' ? 'warning' : 'neutral'}
                          pulse={item.priority === 'Immediate'}
                          size="sm"
                        >
                          {item.priority === 'Immediate' ? 'فوري' : item.priority === 'Urgent' ? 'عاجل' : 'عادي'}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          item.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]' :
                          item.status === 'Replied' ? 'bg-sky-500/20 text-sky-300 border-sky-400/40' :
                          item.status === 'Draft' ? 'bg-amber-500/25 text-amber-300 border-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]' :
                          'bg-purple-500/20 text-purple-300 border-purple-400/40'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="serial-code text-[11px] text-slate-400">
                          {item.issue_date}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Open Dossier */}
                          <button
                            onClick={() => onOpenDossier(item)}
                            title="عرض ملف المعاملة والـ PDF"
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Reply to Inbound shortcut */}
                          {isIncoming && (
                            <button
                              onClick={() => onReplyToInbound(item)}
                              title="إعداد رد صادر على هذا الخطاب"
                              className="p-1.5 rounded-lg text-[#A7CCB5] hover:bg-[#A7CCB5]/15 transition-colors"
                            >
                              <Reply className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics */}
        <div className="px-6 py-3 border-t border-[#334155] bg-[#0F172A] text-xs text-slate-400 flex items-center justify-between">
          <span>إجمالي المعاملات المعروضة: <strong className="text-white font-mono">{filteredList.length}</strong></span>
          <span className="font-mono text-[11px] text-slate-500">PCMS Omni-Search Realtime Index</span>
        </div>
      </div>
    </div>
  );
};
