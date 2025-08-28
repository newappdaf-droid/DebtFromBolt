import React, { createContext, useContext } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (languageCode: string) => void;
  getSupportedLanguages: () => Language[];
  getLanguageInfo: (code: string) => Language | undefined;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useI18nTranslation();

  const setLanguage = async (languageCode: string) => {
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode)) {
      await i18n.changeLanguage(languageCode);
    }
  };

  const getSupportedLanguages = () => SUPPORTED_LANGUAGES;

  const getLanguageInfo = (code: string) => 
    SUPPORTED_LANGUAGES.find(lang => lang.code === code);

  const value: LanguageContextType = {
    currentLanguage: i18n.language,
    setLanguage,
    getSupportedLanguages,
    getLanguageInfo,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}