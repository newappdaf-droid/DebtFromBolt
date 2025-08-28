// Professional Language Selector Component
// Elegant dropdown for language switching with flags and native names

import React from 'react';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export function LanguageSelector({ 
  variant = 'default', 
  className 
}: LanguageSelectorProps) {
  const { 
    getCurrentLanguage, 
    getSupportedLanguages, 
    getLanguageInfo, 
    changeLanguage 
  } = useTranslation();

  const currentLanguage = getCurrentLanguage();
  const supportedLanguages = getSupportedLanguages();
  const currentLanguageInfo = getLanguageInfo(currentLanguage);

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode !== currentLanguage) {
      await changeLanguage(languageCode);
    }
  };

  const renderTrigger = () => {
    switch (variant) {
      case 'icon-only':
        return (
          <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0", className)}>
            <Globe className="h-4 w-4" />
          </Button>
        );
      case 'compact':
        return (
          <Button variant="ghost" size="sm" className={cn("h-8 px-2", className)}>
            <Globe className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">
              {currentLanguageInfo?.code.toUpperCase()}
            </span>
          </Button>
        );
      default:
        return (
          <Button variant="outline" size="sm" className={cn("h-9", className)}>
            <Globe className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {currentLanguageInfo?.nativeName || 'Language'}
            </span>
            <span className="sm:hidden">
              {currentLanguageInfo?.code.toUpperCase()}
            </span>
          </Button>
        );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {renderTrigger()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{language.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-xs text-muted-foreground">{language.name}</span>
              </div>
            </div>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact language badge component for status displays
export function LanguageBadge({ 
  languageCode, 
  className 
}: { 
  languageCode: string; 
  className?: string; 
}) {
  const { getLanguageInfo } = useTranslation();
  const languageInfo = getLanguageInfo(languageCode);

  if (!languageInfo) return null;

  return (
    <Badge variant="outline" className={cn("text-xs", className)}>
      <span className="mr-1">{languageInfo.flag}</span>
      {languageInfo.code.toUpperCase()}
    </Badge>
  );
}