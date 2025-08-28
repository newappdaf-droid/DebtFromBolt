// Professional Translation Hook for CollectPro
// Enhanced i18n hook with type safety and formatting utilities

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      // Update HTML lang attribute for accessibility
      document.documentElement.lang = languageCode;
      // Store preference in localStorage
      localStorage.setItem('app-language', languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const getCurrentLanguage = () => i18n.language;

  const getSupportedLanguages = () => SUPPORTED_LANGUAGES;

  const getLanguageInfo = (code: string) => 
    SUPPORTED_LANGUAGES.find(lang => lang.code === code);

  // Enhanced translation function with type safety
  const translate = (key: string, options?: any) => {
    return t(key, options);
  };

  // Format currency with locale
  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
    }).format(amount);
  };

  // Format date with locale
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(i18n.language, options).format(dateObj);
  };

  // Format number with locale
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  };

  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t('time.justNow');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('time.minutesAgo', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('time.hoursAgo', { count: hours });
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return t('time.daysAgo', { count: days });
    }
  };

  return {
    t: translate,
    i18n,
    changeLanguage,
    getCurrentLanguage,
    getSupportedLanguages,
    getLanguageInfo,
    formatCurrency,
    formatDate,
    formatNumber,
    formatRelativeTime,
    isReady: i18n.isInitialized,
  };
}