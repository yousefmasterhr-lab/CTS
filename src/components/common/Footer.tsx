// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Enterprise Footer & Mandatory Copyright Notice
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React from 'react';
import { ShieldCheck, Server } from 'lucide-react';

export const Footer: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <footer className={`w-full py-4 px-6 border-t border-[#334155] bg-[#0F172A] text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="font-bold text-[#D8E3E9] tracking-wide">
          © 2026 hrsup. All rights reserved.
        </span>
        <span className="hidden sm:inline text-slate-600">|</span>
        <span className="hidden sm:inline text-[11px] text-slate-400">
          منظومة إدارة مراسلات المشاريع الاستشارية (PCMS / CTS v2.6 Enterprise)
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_10px_#10b981]"></span>
          </span>
          <span className="font-semibold text-emerald-400 font-mono tracking-wide" dir="ltr">Cloud Server: Connected</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Server className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-mono">Security: Active</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono">System Integrity Verified</span>
        </div>
      </div>
    </footer>
  );
};
