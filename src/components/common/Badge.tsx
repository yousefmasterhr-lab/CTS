// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Architectural Badge & Radar Pulse Component
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'mint' | 'navy' | 'slate' | 'danger' | 'warning' | 'purple' | 'neutral';
  pulse?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  pulse = false,
  className = '',
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantStyles = {
    mint: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.15)] font-semibold',
    navy: 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold',
    slate: 'bg-slate-700/70 text-slate-100 border-slate-600 font-semibold shadow-xs',
    danger: 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-semibold',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-semibold',
    neutral: 'bg-slate-800 text-slate-200 border-slate-700',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium select-none whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {pulse && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
        </span>
      )}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};
