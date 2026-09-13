// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Luxurious Action Icon Button with Animated Hint Tooltip
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React from 'react';

export type ActionIconVariant = 'slate' | 'blue' | 'amber' | 'rose' | 'mint';
export type TooltipPlacement = 'top' | 'bottom';
export type TooltipAlign = 'center' | 'left' | 'right';

interface ActionIconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: ActionIconVariant;
  className?: string;
  disabled?: boolean;
  tooltipPlacement?: TooltipPlacement;
  tooltipAlign?: TooltipAlign;
}

export const ActionIconButton: React.FC<ActionIconButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'slate',
  className = '',
  disabled = false,
  tooltipPlacement = 'top',
  tooltipAlign = 'center'
}) => {
  const variantStyles: Record<ActionIconVariant, string> = {
    slate: 'border-[#334155] bg-[#0F172A]/90 text-slate-300 hover:text-white hover:border-slate-400 hover:bg-[#1E293B] hover:shadow-[0_0_16px_rgba(148,163,184,0.3)]',
    blue: 'border-sky-500/30 bg-sky-950/30 text-sky-400 hover:text-white hover:border-sky-400 hover:bg-sky-500/25 hover:shadow-[0_0_18px_rgba(56,189,248,0.45)]',
    amber: 'border-amber-500/30 bg-amber-950/30 text-amber-400 hover:text-amber-100 hover:border-amber-400 hover:bg-amber-500/25 hover:shadow-[0_0_18px_rgba(245,158,11,0.45)]',
    rose: 'border-rose-500/30 bg-rose-950/30 text-rose-400 hover:text-rose-100 hover:border-rose-400 hover:bg-rose-500/25 hover:shadow-[0_0_18px_rgba(244,63,94,0.45)]',
    mint: 'border-[#A7CCB5]/50 bg-[#A7CCB5] text-[#0F172A] hover:bg-[#bce0ca] hover:border-white hover:shadow-[0_0_20px_rgba(167,204,181,0.6)]'
  };

  const isBottom = tooltipPlacement === 'bottom';
  const posVerticalClass = isBottom 
    ? 'top-full mt-2 translate-y-1 group-hover/btn:translate-y-0' 
    : 'bottom-full mb-2 -translate-y-1 group-hover/btn:translate-y-0';

  let alignClass = 'left-1/2 -translate-x-1/2';
  let arrowAlignClass = 'left-1/2 -translate-x-1/2';
  if (tooltipAlign === 'left') {
    alignClass = 'left-0';
    arrowAlignClass = 'left-[14px]'; // Points to center of 36px (w-9) button (14 + 4 = 18px)
  } else if (tooltipAlign === 'right') {
    alignClass = 'right-0';
    arrowAlignClass = 'right-[14px]';
  }

  const arrowVerticalClass = isBottom
    ? 'bottom-full -mb-[1px] border-b-[#0F172A]'
    : 'top-full -mt-[1px] border-t-[#0F172A]';

  return (
    <div className="relative group/btn inline-flex items-center justify-center">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        title={label}
        aria-label={label}
        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 ease-out hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm backdrop-blur-sm ${variantStyles[variant]} ${className}`}
      >
        <span className="transition-transform duration-200 group-hover/btn:scale-110 flex items-center justify-center">
          {icon}
        </span>
      </button>

      {/* Floating Animated Hint / Tooltip */}
      <div 
        role="tooltip"
        className={`pointer-events-none absolute ${posVerticalClass} ${alignClass} px-3 py-1.5 text-[11px] font-bold text-white bg-[#0F172A] border border-[#334155] rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.6)] opacity-0 scale-90 group-hover/btn:opacity-100 group-hover/btn:scale-100 transition-all duration-200 ease-out whitespace-nowrap z-50 flex items-center gap-1.5 backdrop-blur-md`}
      >
        <span>{label}</span>
        {/* Tooltip downward/upward pointer */}
        <div className={`absolute ${arrowVerticalClass} ${arrowAlignClass} border-4 border-transparent`} />
      </div>
    </div>
  );
};
