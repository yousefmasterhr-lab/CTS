import React from 'react';
import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: number;
  animated?: boolean;
  showText?: boolean;
  className?: string;
  isDark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 42,
  animated = false,
  showText = false,
  className = '',
  isDark = false,
}) => {
  // SVG Path animation variants
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (custom: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: custom * 0.15, duration: 1.2, ease: [0.16, 1, 0.3, 1] },
        opacity: { delay: custom * 0.15, duration: 0.3 }
      }
    })
  };

  const glowVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div 
        className="relative flex items-center justify-center select-none"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 64 64"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* Primary Navy Monolith Gradient */}
            <linearGradient id="monolithGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#005B96" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Trajectory Vector Accent Gradient */}
            <linearGradient id="vectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7CCB5" />
              <stop offset="50%" stopColor="#D8E3E9" />
              <stop offset="100%" stopColor="#8097AE" />
            </linearGradient>

            {/* Lock Shackle Gradient */}
            <linearGradient id="lockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7CCB5" />
              <stop offset="100%" stopColor="#5A8F6C" />
            </linearGradient>

            {/* Soft Ambient Glow Filter */}
            <filter id="brandGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Isometric Monolith Outer Facets */}
          {animated ? (
            <>
              {/* Monolith Left & Right Faces */}
              <motion.path
                d="M32 6 L56 19 L56 45 L32 58 L8 45 L8 19 Z"
                stroke="#8097AE"
                strokeWidth="1.8"
                fill="url(#monolithGrad)"
                fillOpacity="0.92"
                variants={pathVariants}
                initial="hidden"
                animate="visible"
                custom={0}
              />
              {/* Isometric Central Spine */}
              <motion.path
                d="M32 6 L32 58"
                stroke="#D8E3E9"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                strokeOpacity="0.7"
                variants={pathVariants}
                initial="hidden"
                animate="visible"
                custom={1}
              />
              {/* Isometric Top Diamond Deck */}
              <motion.path
                d="M8 19 L32 32 L56 19"
                stroke="#D8E3E9"
                strokeWidth="1.8"
                variants={pathVariants}
                initial="hidden"
                animate="visible"
                custom={2}
              />
              {/* 2. Dynamic Correspondence Trajectory Arc & Vector */}
              <motion.path
                d="M12 28 Q 32 44 52 28"
                stroke="url(#vectorGrad)"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
                filter="url(#brandGlow)"
                variants={pathVariants}
                initial="hidden"
                animate="visible"
                custom={3}
              />
              <motion.path
                d="M48 24 L52 28 L46 31"
                stroke="#A7CCB5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                variants={pathVariants}
                initial="hidden"
                animate="visible"
                custom={4}
              />
              {/* 3. Secure Enterprise Lock Monolith */}
              <motion.g
                variants={glowVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Lock Shackle */}
                <path
                  d="M27.5 28 V24.5 A4.5 4.5 0 0 1 36.5 24.5 V28"
                  stroke="url(#lockGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Lock Body */}
                <rect
                  x="25"
                  y="28"
                  width="14"
                  height="12"
                  rx="2.5"
                  fill="#005B96"
                  stroke="#A7CCB5"
                  strokeWidth="1.5"
                />
                {/* Digital Keyhole Indicator */}
                <circle cx="32" cy="33" r="1.5" fill="#A7CCB5" />
                <path
                  d="M32 34.5 V37"
                  stroke="#A7CCB5"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </motion.g>
            </>
          ) : (
            <>
              {/* Static Render for Fast Performance in Grids/Headers */}
              <path
                d="M32 6 L56 19 L56 45 L32 58 L8 45 L8 19 Z"
                stroke="#8097AE"
                strokeWidth="1.8"
                fill="url(#monolithGrad)"
                fillOpacity="0.95"
              />
              <path
                d="M32 6 L32 58"
                stroke="#D8E3E9"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                strokeOpacity="0.6"
              />
              <path
                d="M8 19 L32 32 L56 19"
                stroke="#D8E3E9"
                strokeWidth="1.6"
              />
              <path
                d="M12 28 Q 32 44 52 28"
                stroke="url(#vectorGrad)"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M48 24 L52 28 L46 31"
                stroke="#A7CCB5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M27.5 28 V24.5 A4.5 4.5 0 0 1 36.5 24.5 V28"
                stroke="url(#lockGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <rect
                x="25"
                y="28"
                width="14"
                height="12"
                rx="2.5"
                fill="#005B96"
                stroke="#A7CCB5"
                strokeWidth="1.5"
              />
              <circle cx="32" cy="33" r="1.5" fill="#A7CCB5" />
              <path
                d="M32 34.5 V37"
                stroke="#A7CCB5"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-lg leading-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              PCMS
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#005B96]/15 text-[#005B96] font-semibold border border-[#005B96]/30">
              CTS v2.6
            </span>
          </div>
          <span className={`text-[11px] leading-tight font-medium ${isDark ? 'text-[#8097AE]' : 'text-[#4A7599]'}`}>
            Project Correspondence Management
          </span>
        </div>
      )}
    </div>
  );
};
