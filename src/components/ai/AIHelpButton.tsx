// AI Help Button Component
// Contextual help button that appears on pages with AI assistance

import React from 'react';
import { Bot, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLocation } from 'react-router-dom';

interface AIHelpButtonProps {
  onOpenAI: () => void;
  className?: string;
}

const pageHelpContent: Record<string, { title: string; suggestions: string[] }> = {
  '/dashboard': {
    title: 'Dashboard Help',
    suggestions: [
      'How do I interpret the dashboard metrics?',
      'What do the different status indicators mean?',
      'How can I customize my dashboard view?'
    ]
  },
  '/cases': {
    title: 'Cases Help',
    suggestions: [
      'How do I create a new case?',
      'How do I filter and search cases?',
      'What are the different case statuses?'
    ]
  },
  '/approvals': {
    title: 'Approvals Help',
    suggestions: [
      'How do I approve or reject requests?',
      'What types of approvals are available?',
      'How do I track approval history?'
    ]
  },
  '/gdpr-requests': {
    title: 'GDPR Help',
    suggestions: [
      'How do I handle data subject requests?',
      'What are the GDPR compliance requirements?',
      'How do I process erasure requests?'
    ]
  }
};

export function AIHelpButton({ onOpenAI, className }: AIHelpButtonProps) {
  const { user } = useAuth();
  const location = useLocation();
  
  const currentPageHelp = pageHelpContent[location.pathname];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`relative ${className}`}
        >
          <Bot className="h-4 w-4 mr-2" />
          AI Help
          <Badge variant="secondary" className="ml-2 text-xs">
            Beta
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">AI Assistant</h4>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Get instant help with CollectPro features and processes.
          </p>

          {currentPageHelp && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">{currentPageHelp.title}</h5>
              <div className="space-y-1">
                {currentPageHelp.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => {
                      onOpenAI();
                      // You could also auto-populate the question here
                    }}
                  >
                    <HelpCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="text-xs">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={onOpenAI}
            className="w-full"
            size="sm"
          >
            <Bot className="h-4 w-4 mr-2" />
            Open AI Assistant
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}