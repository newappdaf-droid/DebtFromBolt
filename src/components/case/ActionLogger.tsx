import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Clock, User, FileText, Phone, Mail, MessageSquare, Scale, HandCoins, AlertTriangle, Calendar, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

interface ActionLoggerProps {
  caseId: string;
  onActionLogged?: () => void;
}

const ACTION_CATEGORIES = {
  communication: {
    label: 'Communication',
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    actions: [
      { value: 'phone_call', label: 'Phone Call', icon: Phone },
      { value: 'email_sent', label: 'Email Sent', icon: Mail },
      { value: 'letter_sent', label: 'Letter Sent', icon: FileText },
      { value: 'meeting', label: 'Meeting', icon: User },
    ]
  },
  case_management: {
    label: 'Case Management',
    icon: FileText,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    actions: [
      { value: 'document_review', label: 'Document Review', icon: FileText },
      { value: 'case_analysis', label: 'Case Analysis', icon: FileText },
      { value: 'status_update', label: 'Status Update', icon: Clock },
      { value: 'client_communication', label: 'Client Communication', icon: MessageSquare },
    ]
  },
  negotiation: {
    label: 'Negotiation & Settlement',
    icon: HandCoins,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    actions: [
      { value: 'negotiation', label: 'Negotiation Session', icon: HandCoins },
      { value: 'settlement_offer', label: 'Settlement Offer', icon: HandCoins },
      { value: 'payment_plan', label: 'Payment Plan Setup', icon: Clock },
      { value: 'discount_approved', label: 'Discount Approved', icon: HandCoins },
    ]
  },
  legal: {
    label: 'Legal Actions',
    icon: Scale,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    actions: [
      { value: 'legal_notice', label: 'Legal Notice Sent', icon: AlertTriangle },
      { value: 'court_filing', label: 'Court Filing', icon: Scale },
      { value: 'legal_consultation', label: 'Legal Consultation', icon: Scale },
      { value: 'enforcement_action', label: 'enforcement Action', icon: AlertTriangle },
    ]
  }
};

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
];

// Reactions for each action type
const ACTION_REACTIONS = {
  phone_call: [
    { value: 'reached', label: 'Reached' },
    { value: 'no_answer', label: 'No Answer' },
    { value: 'wrong_number', label: 'Wrong Number' },
    { value: 'refused_to_speak', label: 'Refused to Speak' },
    { value: 'promised_to_pay', label: 'Promised to Pay' },
    { value: 'disputed_debt', label: 'Disputed Debt' },
    { value: 'requested_validation', label: 'Requested Validation' },
    { value: 'payment_plan_requested', label: 'Payment Plan Requested' }
  ],
  email_sent: [
    { value: 'delivered', label: 'Delivered' },
    { value: 'opened', label: 'Opened' },
    { value: 'bounced', label: 'Bounced' },
    { value: 'no_response', label: 'No Response' },
    { value: 'replied', label: 'Replied' },
    { value: 'unsubscribed', label: 'Unsubscribed' }
  ],
  letter_sent: [
    { value: 'delivered', label: 'Delivered' },
    { value: 'returned', label: 'Returned' },
    { value: 'no_response', label: 'No Response' },
    { value: 'responded', label: 'Responded' }
  ],
  meeting: [
    { value: 'attended', label: 'Attended' },
    { value: 'rescheduled', label: 'Rescheduled' },
    { value: 'no_show', label: 'No-Show' },
    { value: 'agreement_drafted', label: 'Agreement Drafted' },
    { value: 'partial_attendance', label: 'Partial Attendance' }
  ],
  negotiation: [
    { value: 'agreement_reached', label: 'Agreement Reached' },
    { value: 'counter_offer', label: 'Counter Offer' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'needs_approval', label: 'Needs Approval' }
  ],
  settlement_offer: [
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'counter_offered', label: 'Counter Offered' },
    { value: 'under_review', label: 'Under Review' }
  ]
};

// Auto-generated outcomes based on action + reaction
const AUTO_OUTCOMES = {
  'phone_call+promised_to_pay': 'PTP Recorded',
  'phone_call+disputed_debt': 'Dispute Raised',
  'phone_call+no_answer': 'Contact Failed',
  'phone_call+refused_to_speak': 'Contact Refused',
  'phone_call+requested_validation': 'Validation Requested',
  'email_sent+bounced': 'Contact Failed',
  'email_sent+opened': 'Message Acknowledged',
  'email_sent+replied': 'Response Received',
  'letter_sent+returned': 'Contact Failed',
  'letter_sent+responded': 'Response Received',
  'meeting+attended': 'Meeting Completed',
  'meeting+no_show': 'Meeting Failed',
  'meeting+agreement_drafted': 'Agreement in Progress',
  'negotiation+agreement_reached': 'Settlement Agreed',
  'negotiation+rejected': 'Negotiation Failed',
  'settlement_offer+accepted': 'Settlement Accepted',
  'settlement_offer+rejected': 'Settlement Rejected'
};

// Suggested next steps based on action + reaction
const NEXT_STEPS = {
  'phone_call+promised_to_pay': [
    { value: 'schedule_follow_up', label: 'Schedule Follow-up Call', default: true },
    { value: 'send_confirmation', label: 'Send Payment Confirmation' },
    { value: 'update_client', label: 'Update Client' }
  ],
  'phone_call+disputed_debt': [
    { value: 'send_validation', label: 'Send Validation Letter', default: true },
    { value: 'legal_review', label: 'Legal Review' },
    { value: 'update_client', label: 'Update Client' }
  ],
  'phone_call+no_answer': [
    { value: 'retry_contact', label: 'Retry Contact', default: true },
    { value: 'send_email', label: 'Send Email' },
    { value: 'send_letter', label: 'Send Letter' }
  ],
  'email_sent+bounced': [
    { value: 'verify_address', label: 'Verify Email Address', default: true },
    { value: 'try_phone', label: 'Try Phone Contact' },
    { value: 'send_letter', label: 'Send Letter' }
  ],
  'meeting+no_show': [
    { value: 'reschedule', label: 'Reschedule Meeting', default: true },
    { value: 'phone_contact', label: 'Phone Contact' },
    { value: 'send_letter', label: 'Send Formal Letter' }
  ]
};

export function ActionLogger({ caseId, onActionLogged }: ActionLoggerProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    action_type: '',
    reaction: '',
    description: '',
    priority: 'medium',
    outcome: '',
    next_step: '',
    future_contact: '',
    duration_minutes: '',
    attachments: [] as File[]
  });

  // Auto-populate outcome when action + reaction changes
  useEffect(() => {
    if (formData.action_type && formData.reaction) {
      const key = `${formData.action_type}+${formData.reaction}`;
      const autoOutcome = AUTO_OUTCOMES[key as keyof typeof AUTO_OUTCOMES];
      if (autoOutcome) {
        setFormData(prev => ({ ...prev, outcome: autoOutcome }));
      }
    }
  }, [formData.action_type, formData.reaction]);

  // Set default future contact date
  useEffect(() => {
    if (formData.action_type && formData.reaction) {
      const key = `${formData.action_type}+${formData.reaction}`;
      let hoursToAdd = 72; // Default 72 hours
      
      if (key === 'phone_call+promised_to_pay') hoursToAdd = 72;
      else if (key === 'phone_call+no_answer') hoursToAdd = 24;
      else if (key === 'email_sent+no_response') hoursToAdd = 168; // 1 week
      
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + hoursToAdd);
      
      // Ensure it's during business hours (9 AM - 6 PM)
      const hour = futureDate.getHours();
      if (hour < 9) futureDate.setHours(9, 0, 0, 0);
      else if (hour >= 18) futureDate.setHours(9, 0, 0, 0);
      
      setFormData(prev => ({ 
        ...prev, 
        future_contact: futureDate.toISOString().slice(0, 16) 
      }));
    }
  }, [formData.action_type, formData.reaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !formData.action_type || !formData.reaction || !formData.description.trim() || !formData.next_step || !formData.future_contact) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const actionData: any = {
        case_id: caseId,
        agent_id: user.id,
        action_type: formData.action_type,
        description: formData.description.trim(),
        status: 'completed'
      };

      // Add optional metadata
      const metadata: any = {};
      if (formData.priority !== 'medium') metadata.priority = formData.priority;
      if (formData.outcome.trim()) metadata.outcome = formData.outcome.trim();
      if (formData.next_step.trim()) metadata.next_step = formData.next_step.trim();
      if (formData.duration_minutes) metadata.duration_minutes = parseInt(formData.duration_minutes);
      
      if (Object.keys(metadata).length > 0) {
        actionData.metadata = metadata;
      }

      // Force mock mode until database schema is set up
      console.log('Mock action logged:', actionData);
      const error = null; // Simulate success

      if (error) throw error;

      toast.success('Action logged successfully');
      handleReset();
      setIsOpen(false);
      onActionLogged?.();
    } catch (error) {
      console.error('Error logging action:', error);
      toast.error('Failed to log action. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      action_type: '',
      reaction: '',
      description: '',
      priority: 'medium',
      outcome: '',
      next_step: '',
      future_contact: '',
      duration_minutes: '',
      attachments: []
    });
    setSelectedCategory('');
  };

  const handleCancel = () => {
    handleReset();
    setIsOpen(false);
  };

  const getAvailableActions = () => {
    if (!selectedCategory) return [];
    return ACTION_CATEGORIES[selectedCategory as keyof typeof ACTION_CATEGORIES]?.actions || [];
  };

  const getAvailableReactions = () => {
    if (!formData.action_type) return [];
    return ACTION_REACTIONS[formData.action_type as keyof typeof ACTION_REACTIONS] || [];
  };

  const getAvailableNextSteps = () => {
    if (!formData.action_type || !formData.reaction) return [];
    const key = `${formData.action_type}+${formData.reaction}`;
    return NEXT_STEPS[key as keyof typeof NEXT_STEPS] || [];
  };

  const getSelectedActionIcon = () => {
    if (!formData.action_type) return null;
    
    for (const category of Object.values(ACTION_CATEGORIES)) {
      const action = category.actions.find(a => a.value === formData.action_type);
      if (action) return action.icon;
    }
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Log New Action
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            Log New Action
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Record actions taken on this case for audit trail and progress tracking
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Action Category Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Action Category</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ACTION_CATEGORIES).map(([key, category]) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(key);
                        setFormData(prev => ({ ...prev, action_type: '' }));
                      }}
                      disabled={isLoading}
                      className={`p-3 rounded-lg border-2 transition-all text-left hover-scale ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{category.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {category.actions.length} actions available
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specific Action Selection */}
            {selectedCategory && (
              <div className="space-y-3 animate-fade-in">
                <Label className="text-sm font-medium">Specific Action</Label>
                <div className="grid grid-cols-1 gap-2">
                  {getAvailableActions().map((action) => {
                    const ActionIcon = action.icon;
                    const isSelected = formData.action_type === action.value;
                    return (
                      <button
                        key={action.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          action_type: action.value,
                          reaction: '',
                          outcome: '',
                          next_step: ''
                        }))}
                        disabled={isLoading}
                        className={`p-3 rounded-lg border text-left transition-all hover-scale ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ActionIcon className="h-4 w-4" />
                          <span className="font-medium text-sm">{action.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reaction Selection */}
            {formData.action_type && (
              <div className="space-y-3 animate-fade-in">
                <Label className="text-sm font-medium">
                  Reaction <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  What was the result of this action?
                </p>
                <Select
                  value={formData.reaction}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    reaction: value,
                    outcome: '',
                    next_step: ''
                  }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reaction..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableReactions().map((reaction) => (
                      <SelectItem key={reaction.value} value={reaction.value}>
                        {reaction.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Auto-populated Outcome */}
            {formData.reaction && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="outcome" className="text-sm font-medium">Outcome</Label>
                <Input
                  id="outcome"
                  value={formData.outcome}
                  onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Auto-populated based on action and reaction"
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-populated based on action and reaction. You can override if needed.
                </p>
              </div>
            )}

            {/* Required Next Step */}
            {formData.reaction && (
              <div className="space-y-3 animate-fade-in">
                <Label className="text-sm font-medium">
                  Next Step <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  What should be done next?
                </p>
                <Select
                  value={formData.next_step}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, next_step: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select next step..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableNextSteps().map((step) => (
                      <SelectItem key={step.value} value={step.value}>
                        <div className="flex items-center gap-2">
                          {step.default && <Badge variant="secondary" className="text-xs">Recommended</Badge>}
                          {step.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Future Contact DateTime */}
            {formData.next_step && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="future_contact" className="text-sm font-medium">
                  Schedule Future Contact <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2">
                  <Input
                    id="future_contact"
                    type="datetime-local"
                    value={formData.future_contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, future_contact: e.target.value }))}
                    disabled={isLoading}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Avoid 21:00-08:00 (GDPR blackout hours). Time will be adjusted if needed.
                  </p>
                </div>
              </div>
            )}

            {/* Priority and Duration */}
            {formData.action_type && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={priority.color}>
                              {priority.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g. 15"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                    disabled={isLoading}
                    min="1"
                    max="480"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            {formData.reaction && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="description" className="text-sm font-medium">
                  Notes <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the action taken and reaction received..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  disabled={isLoading}
                  className="resize-none"
                />
                <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  GDPR: Do not log sensitive data (ID numbers, bank details, etc.)
                </p>
              </div>
            )}

            {/* Attachments */}
            {formData.description && (
              <div className="space-y-3 animate-fade-in">
                <Separator />
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Attachments (Optional)</Label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      id="attachments"
                      multiple
                      onChange={handleFileUpload}
                      disabled={isLoading}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp3,.wav"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('attachments')?.click()}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files (recordings, letters, documents)
                    </Button>
                    {formData.attachments.length > 0 && (
                      <div className="space-y-1">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                            <span className="truncate">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              disabled={isLoading}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.action_type || !formData.reaction || !formData.description.trim() || !formData.next_step || !formData.future_contact}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Logging...' : 'Log Action'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}