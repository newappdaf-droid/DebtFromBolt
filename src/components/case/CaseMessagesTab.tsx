// Case Messages Tab Component
// Threaded messaging with attachments and @mentions

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, Paperclip, Plus, User, 
  Building, Mail, Phone, FileText, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { casesApi } from '@/lib/api/casesApi';
import { CaseMessage, CreateMessageRequest } from '@/types/cases';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CaseMessagesTabProps {
  caseId: string;
}

export function CaseMessagesTab({ caseId }: CaseMessagesTabProps) {
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [hasAttachments, setHasAttachments] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [caseId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await casesApi.getCaseMessages(caseId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageBody.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const request: CreateMessageRequest = {
        Body: messageBody.trim(),
        HasAttachments: hasAttachments
      };

      const message = await casesApi.createMessage(caseId, request);
      setMessages(prev => [...prev, message]);
      setMessageBody('');
      setHasAttachments(false);
      setShowMessageDialog(false);
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getMessageSender = (message: CaseMessage) => {
    if (message.FromUserId) {
      return `User ${message.FromUserId}`;
    }
    if (message.FromOrgId) {
      return `Organization ${message.FromOrgId}`;
    }
    return 'System';
  };

  const getMessageRecipient = (message: CaseMessage) => {
    if (message.ToOrgId) {
      return `Organization ${message.ToOrgId}`;
    }
    return 'Internal';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading messages...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">Case Messages</span>
              <Badge variant="outline">{messages.length} messages</Badge>
            </div>
            
            <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send New Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Textarea
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      placeholder="Type your message here..."
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use @username to mention team members
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach Files
                    </Button>
                    <Badge variant={hasAttachments ? 'default' : 'outline'}>
                      {hasAttachments ? 'Has Attachments' : 'No Attachments'}
                    </Badge>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Messages Thread */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Message Thread</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Thread
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages in this case yet</p>
              <p className="text-sm">Start the conversation by sending the first message</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={message.MessageId} className="flex gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getMessageSender(message).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{getMessageSender(message)}</span>
                        <span className="text-xs text-muted-foreground">
                          to {getMessageRecipient(message)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.CreatedAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                        {message.HasAttachments && (
                          <Badge variant="outline" className="text-xs">
                            <Paperclip className="h-3 w-3 mr-1" />
                            Attachments
                          </Badge>
                        )}
                        {!message.ReadAt && (
                          <Badge variant="default" className="text-xs">
                            Unread
                          </Badge>
                        )}
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm whitespace-pre-wrap">{message.Body}</p>
                      </div>
                      
                      {message.HasAttachments && (
                        <div className="mt-2 flex gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            document.pdf
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}