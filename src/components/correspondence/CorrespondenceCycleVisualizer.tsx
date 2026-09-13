// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Multi-Turn Synchronous Correspondence History Cycle Visualizer
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Correspondence } from '../../types/correspondence';
import { CorrespondenceThread, ThreadNode } from '../../services/correspondence/correspondenceGraph';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ActionIconButton } from '../common/ActionIconButton';
import { 
  GitCommit, 
  ArrowDown, 
  ArrowLeft,
  Clock, 
  CheckCircle2, 
  Eye, 
  Reply, 
  Layers, 
  Building2, 
  FileText,
  Sparkles,
  GitFork,
  ArrowLeftRight
} from 'lucide-react';
import { getDocTypeLabel } from '../../utils/formatters';

interface CorrespondenceCycleVisualizerProps {
  thread: CorrespondenceThread;
  activeDocId: string;
  onSelectDoc: (doc: Correspondence) => void;
  onReplyToDoc?: (doc: Correspondence) => void;
}

export const CorrespondenceCycleVisualizer: React.FC<CorrespondenceCycleVisualizerProps> = ({
  thread,
  activeDocId,
  onSelectDoc,
  onReplyToDoc
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/90 border border-[#334155] shadow-xl space-y-5">
      {/* 1. Header Bar: Cycle Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#334155]/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <ArrowLeftRight className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-white tracking-wide">
              سلسلة المراسلات والردود المرتبطة
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#005B96]/30 text-sky-300 font-mono font-bold border border-[#005B96]/50">
              ({thread.total_turns}) خطابات ومراسلات
            </span>
            {thread.has_branches && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1">
                <GitFork className="w-3 h-3" />
                <span>تفرع ردود</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            تتبع زمني متسلسل لكافة الخطابات والردود والتعقيبات الصادرة والواردة لنفس المعاملة
          </p>
        </div>
      </div>

      {/* 2. Chronological Turn-by-Turn Flow Cards */}
      <div className="space-y-4 relative">
        {thread.nodes.map((node, idx) => {
          const isActive = node.doc.doc_id === activeDocId;
          const isSideA = node.party_side === 'A';
          const typeInfo = getDocTypeLabel(node.doc.classification);
          const isDraft = node.doc.is_draft || node.doc.status === 'Draft';
          const isIncoming = node.doc.doc_type === 'Incoming';

          return (
            <React.Fragment key={node.doc.doc_id}>
              {/* Connector between turns */}
              {idx > 0 && (
                <div className="flex items-center justify-center my-2 gap-2">
                  <div className="h-4 w-px bg-gradient-to-b from-[#334155] to-sky-500/60" />
                  
                  {node.days_from_parent !== null && (
                    <div className="px-3 py-0.5 rounded-full bg-[#0B1120] border border-sky-500/30 text-sky-300 text-[10px] font-mono font-medium shadow-sm flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-sky-400" />
                      <span>
                        {node.days_from_parent === 0 
                          ? 'في نفس اليوم' 
                          : node.days_from_parent === 1 
                            ? 'تم الرد خلال 24 ساعة' 
                            : `تم الرد خلال (${node.days_from_parent}) أيام`}
                      </span>
                    </div>
                  )}

                  {node.is_branch && (
                    <div className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold flex items-center gap-1">
                      <GitFork className="w-2.5 h-2.5" />
                      <span>{node.branch_label}</span>
                    </div>
                  )}

                  <div className="h-4 w-px bg-gradient-to-b from-sky-500/60 to-[#334155]" />
                </div>
              )}

              {/* Turn Node Card */}
              <motion.div
                layout
                onClick={() => onSelectDoc(node.doc)}
                role="button"
                tabIndex={0}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none relative group ${
                  isActive
                    ? isSideA
                      ? 'bg-blue-950/40 border-2 border-sky-400 shadow-lg shadow-sky-500/20'
                      : 'bg-emerald-950/40 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-[#1E293B]/90 border-[#334155] hover:border-slate-400 hover:bg-[#1E293B]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Right Header & Info */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Step Number Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-mono ${
                        isSideA 
                          ? 'bg-blue-500/20 text-sky-300 border border-blue-500/40' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        #{node.turn_number}
                      </span>

                      {/* Direction Tag */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isIncoming ? 'bg-sky-900/40 text-sky-300' : 'bg-emerald-900/40 text-emerald-300'
                      }`}>
                        {isIncoming ? 'وارد' : 'صادر'}
                      </span>

                      {/* Serial Number */}
                      <span dir="ltr" className="serial-code text-xs font-bold text-white px-2 py-0.5 rounded bg-[#0F172A] border border-[#334155]">
                        {node.doc.serial_number}
                      </span>

                      {/* Type Info */}
                      <span className="text-[10px] text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {typeInfo.ar}
                      </span>

                      {/* Status */}
                      {node.doc.status === 'Rejected' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          مُعاد للمراجعة
                        </span>
                      ) : isDraft ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          مسودة
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#A7CCB5]/20 text-[#A7CCB5] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>معتمد</span>
                        </span>
                      )}

                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-sky-400 to-emerald-400 text-black shadow-sm">
                          المعروض حالياً
                        </span>
                      )}
                    </div>

                    {/* Subject */}
                    <h4 className="text-sm font-bold text-white leading-snug group-hover:text-sky-300 transition-colors">
                      {node.doc.subject}
                    </h4>

                    {/* Exchange Parties Flow */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                      <span className="text-slate-400">من:</span>
                      <strong className={isSideA ? 'text-sky-300' : 'text-emerald-300'}>
                        {node.party_name}
                      </strong>
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
                        <span>إلى:</span>
                      </span>
                      <strong className="text-slate-200">
                        {node.recipient_name}
                      </strong>
                      <span>•</span>
                      <span className="text-slate-400">تاريخ التحرير:</span>
                      <span dir="ltr" className="serial-code text-slate-200">{node.doc.issue_date}</span>
                      <span>•</span>
                      <span className="text-slate-400">({node.doc.attachments?.length || 0}) مرفقات</span>
                    </div>
                  </div>

                  {/* Left Action Buttons (Icon-Only with Tooltips) */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#334155]/60 justify-end">
                    <ActionIconButton
                      icon={<Eye className="w-4 h-4 text-sky-400" />}
                      label={isActive ? "الخطاب المعروض حالياً" : "معاينة الخطاب والوثيقة"}
                      variant="blue"
                      tooltipAlign="left"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDoc(node.doc);
                      }}
                    />

                    {onReplyToDoc && (
                      <ActionIconButton
                        icon={<Reply className="w-4 h-4 text-[#0F172A]" />}
                        label="إعداد رد صادر على هذا الخطاب"
                        variant="mint"
                        tooltipAlign="left"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReplyToDoc(node.doc);
                        }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
