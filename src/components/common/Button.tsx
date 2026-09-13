// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Tactile Mechanical Button Component
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'mint' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...rest
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg select-none transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#005B96] text-white hover:bg-[#004C80] active:bg-[#003E6B] focus:ring-[#005B96] shadow-sm shadow-[#005B96]/20',
    secondary: 'bg-slate-800 text-slate-200 border border-[#334155] hover:bg-slate-700 hover:text-white active:bg-slate-600 focus:ring-slate-500',
    mint: 'bg-[#A7CCB5] text-[#0F172A] hover:bg-[#92bca1] active:bg-[#7fa88f] focus:ring-[#A7CCB5] font-semibold shadow-sm',
    danger: 'bg-[#E11D48] text-white hover:bg-[#be123c] active:bg-[#9f1239] focus:ring-[#E11D48]',
    ghost: 'bg-transparent text-sky-400 hover:bg-sky-500/10 active:bg-sky-500/15 focus:ring-sky-500',
    outline: 'bg-slate-800/60 border border-[#334155] text-slate-200 hover:bg-slate-700/80 hover:text-white hover:border-slate-400 active:bg-slate-700 focus:ring-slate-500 shadow-xs',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </motion.button>
  );
};
