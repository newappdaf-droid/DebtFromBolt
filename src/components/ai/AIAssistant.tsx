// AI Assistant Component for CollectPro Platform
// Professional AI chat interface with contextual help and suggestions

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Minimize2, Maximize2, X, Copy, ExternalLink,
  MessageSquare, Lightbulb, ArrowRight, Loader2, CheckCircle,
  AlertCircle, HelpCircle, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/AuthProvider';
import { createAIAgent } from '@/lib/ai/mockAI';
import { AIMessage, SuggestedAction } from '@/types/ai';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AIAssistantProps {
  className?: string;
}

export function AIAssistant({ className }: AIAssistantProps) {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: AIMessage = {
        id: 'welcome',
        content: `Hello! I'm your CollectPro AI Assistant. I can help you navigate the platform, answer questions about debt collection processes, and guide you through various features. What would you like to know?`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: 1.0,
          suggestedActions: [
            { id: '1', label: 'How do I create a case?', action: 'execute', value: 'How do I create a new case?', icon: 'Plus' },
            { id: '2', label: 'GDPR compliance help', action: 'execute', value: 'Tell me about GDPR compliance', icon: 'Shield' },
            { id: '3', label: 'Platform overview', action: 'execute', value: 'Give me an overview of the platform', icon: 'LayoutDashboard' }
          ]
        }
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: `user_${Date.now()}`,
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Create AI agent with current context
      const aiAgent = createAIAgent({
        userRole: user?.role || 'CLIENT',
        currentPage: location.pathname,
        permissions: user?.permissions || []
      });

      const response = await aiAgent.generateResponse(userMessage.content);

      const assistantMessage: AIMessage = {
        id: `assistant_${Date.now()}`,
        content: response.content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: response.confidence,
          sources: response.sources,
          suggestedActions: response.suggestedActions
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Add follow-up questions as system message if available
      if (response.followUpQuestions && response.followUpQuestions.length > 0) {
        const followUpMessage: AIMessage = {
          id: `followup_${Date.now()}`,
          content: 'Here are some related questions you might find helpful:',
          role: 'system',
          timestamp: new Date().toISOString(),
          metadata: {
            suggestedActions: response.followUpQuestions.map((question, index) => ({
              id: `followup_${index}`,
              label: question,
              action: 'execute' as const,
              value: question,
              icon: 'HelpCircle'
            }))
          }
        };

        setTimeout(() => {
          setMessages(prev => [...prev, followUpMessage]);
        }, 500);
      }

    } catch (error) {
      console.error('AI response error:', error);
      
      const errorMessage: AIMessage = {
        id: `error_${Date.now()}`,
        content: 'I apologize, but I encountered an issue processing your request. Please try again or contact support if the problem persists.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: 0.0
        }
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedAction = (action: SuggestedAction) => {
    switch (action.action) {
      case 'navigate':
        navigate(action.value);
        toast.success(`Navigating to ${action.label}`);
        break;
      case 'execute':
        if (action.value.startsWith('mailto:')) {
          window.open(action.value);
        } else {
          // Treat as a new question
          setInputValue(action.value);
          setTimeout(() => handleSendMessage(), 100);
        }
        break;
      case 'copy':
        navigator.clipboard.writeText(action.value);
        toast.success('Copied to clipboard');
        break;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    // Re-add welcome message
    setTimeout(() => {
      const welcomeMessage: AIMessage = {
        id: 'welcome_new',
        content: 'Conversation cleared. How can I help you today?',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        metadata: { confidence: 1.0 }
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50',
          'bg-primary hover:bg-primary/90 text-primary-foreground',
          'animate-pulse hover:animate-none transition-all duration-300',
          className
        )}
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card 
      className={cn(
        'fixed bottom-6 right-6 z-50 shadow-2xl border-2',
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]',
        'transition-all duration-300 ease-in-out',
        className
      )}
    >
      <CardHeader className="p-4 bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary-foreground/20 rounded-lg">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">CollectPro AI</CardTitle>
              {!isMinimized && (
                <p className="text-sm text-primary-foreground/80">
                  Your intelligent assistant
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-3">
                  <div className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}>
                    {message.role !== 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={cn(
                      'max-w-[80%] rounded-lg p-3 text-sm',
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : message.role === 'system'
                        ? 'bg-muted text-muted-foreground border'
                        : 'bg-accent text-accent-foreground'
                    )}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Confidence indicator for AI responses */}
                      {message.role === 'assistant' && message.metadata?.confidence && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-current/20">
                          <div className={cn(
                            'h-2 w-2 rounded-full',
                            message.metadata.confidence > 0.8 ? 'bg-green-500' :
                            message.metadata.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          )} />
                          <span className="text-xs opacity-70">
                            {Math.round(message.metadata.confidence * 100)}% confidence
                          </span>
                        </div>
                      )}
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  {/* Suggested Actions */}
                  {message.metadata?.suggestedActions && message.metadata.suggestedActions.length > 0 && (
                    <div className="ml-11 space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Suggested actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.metadata.suggestedActions.map((action) => (
                          <Button
                            key={action.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestedAction(action)}
                            className="h-8 text-xs"
                          >
                            {action.action === 'navigate' && <ArrowRight className="h-3 w-3 mr-1" />}
                            {action.action === 'copy' && <Copy className="h-3 w-3 mr-1" />}
                            {action.action === 'execute' && <ExternalLink className="h-3 w-3 mr-1" />}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sources */}
                  {message.metadata?.sources && message.metadata.sources.length > 0 && (
                    <div className="ml-11">
                      <p className="text-xs text-muted-foreground">
                        Sources: {message.metadata.sources.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-accent text-accent-foreground rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator />

          {/* Input Area */}
          <div className="p-4 space-y-3">
            {/* Quick Actions */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue('How do I create a new case?')}
                className="whitespace-nowrap text-xs"
              >
                <Lightbulb className="h-3 w-3 mr-1" />
                Create Case
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue('Tell me about GDPR compliance')}
                className="whitespace-nowrap text-xs"
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                GDPR Help
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearConversation}
                className="whitespace-nowrap text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Clear Chat
              </Button>
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about CollectPro..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              AI responses are simulated. Press Enter to send.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}