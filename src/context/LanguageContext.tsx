// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Localization & RTL/LTR Synchronization
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppLanguage = 'ar' | 'en';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  dir: 'rtl' | 'ltr';
  t: (arText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>('ar');

  useEffect(() => {
    const stored = localStorage.getItem('pcms_lang') as AppLanguage;
    if (stored === 'en' || stored === 'ar') {
      setLanguageState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('pcms_lang', lang);
  };

  const t = (arText: string, enText: string) => {
    return language === 'ar' ? arText : enText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir: language === 'ar' ? 'rtl' : 'ltr', t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
