// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Dynamic Scannable Document QR Verification Component
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Maximize2, X, CheckCircle2 } from 'lucide-react';

interface DocumentQRCodeProps {
  documentSerial: string;
  projectName: string;
  date: string;
  approvedBy?: string;
  className?: string;
  size?: number;
}

export const DocumentQRCode: React.FC<DocumentQRCodeProps> = ({
  documentSerial,
  projectName,
  date,
  approvedBy,
  className = '',
  size = 72
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // High-performance, smartphone-optimized verification payload (Ultra-low density, large square modules)
  // Clean ASCII URL generates a Version 2/3 QR code with large squares that phone cameras scan instantly
  const verificationUrl = `https://hrsup.com/pcms/verify?doc=${encodeURIComponent(documentSerial)}&dt=${encodeURIComponent(date)}`;

  useEffect(() => {
    // Generate high-contrast, razor-sharp QR with clean margin
    QRCode.toDataURL(verificationUrl, {
      width: Math.max(size * 3, 240), // High resolution raster for razor-sharp display
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000', // Pure black for maximum camera sensor contrast
        light: '#FFFFFF'
      }
    })
      .then(url => setDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [verificationUrl, size]);

  if (!dataUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="bg-slate-800 animate-pulse rounded-lg border border-[#334155] flex items-center justify-center text-slate-500"
      >
        <QrCode className="w-5 h-5 opacity-40" />
      </div>
    );
  }

  return (
    <>
      <div 
        onClick={() => setIsZoomed(true)}
        className="group relative cursor-pointer inline-block"
        title="انقر للتكبير والمسح بالهاتف"
      >
        <img
          src={dataUrl}
          alt={`رمز التحقق للخطاب ${documentSerial}`}
          style={{ 
            width: size, 
            height: size,
            imageRendering: 'pixelated'
          }}
          className={`rounded-lg bg-white p-1.5 shadow-md border-2 border-slate-200 group-hover:border-sky-400 group-hover:scale-105 transition-all ${className}`}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white">
          <Maximize2 className="w-4 h-4" />
        </div>
      </div>

      {/* Enlarged QR Modal for Easy Phone Camera Scanning */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div 
            className="bg-[#1E293B] border border-[#334155] p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-3 left-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              رمز التحقق الإلكتروني للخطاب
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              وجّه كاميرا الهاتف نحو الباركود للتحقق الفوري
            </p>

            <div className="bg-white p-4 rounded-xl inline-block shadow-lg mx-auto border-2 border-slate-200">
              <img
                src={dataUrl}
                alt="QR Code Enlarge"
                className="w-52 h-52 mx-auto"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            <div className="mt-4 p-3 bg-[#0F172A] rounded-xl border border-[#334155] text-right text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">رقم المعاملة:</span>
                <span dir="ltr" className="font-mono font-bold text-sky-400">{documentSerial}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">المشروع:</span>
                <span className="text-slate-200 font-medium truncate max-w-[180px]">{projectName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">تاريخ الإصدار:</span>
                <span className="font-mono text-slate-200">{date}</span>
              </div>
              {approvedBy && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">الاعتماد:</span>
                  <span className="text-emerald-400 font-semibold">{approvedBy}</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>رابط رسمي مشفر وقابل للمسح عبر أي هاتف</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
