import React, { useEffect, useState } from 'react';
import { Clock, User, Phone, Mail, FileText, MessageSquare, Scale, HandCoins, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Action {
  id: string;
  case_id: string;
  agent_id: string;
  action_type: string;
  description: string;
  status: string;
  created_at: string;
  metadata?: {
    priority?: string;
    outcome?: string;
    next_action?: string;
    duration_minutes?: number;
  } | null;
}

interface ActionHistoryProps {
  caseId: string;
  refreshTrigger?: number;
}

const ACTION_TYPE_LABELS: Record<string, { label: string; icon: any; category: string }> = {
  // Communication
  phone_call: { label: 'Phone Call', icon: Phone, category: 'Communication' },
  email_sent: { label: 'Email Sent', icon: Mail, category: 'Communication' },
  letter_sent: { label: 'Letter Sent', icon: FileText, category: 'Communication' },
  meeting: { label: 'Meeting', icon: User, category: 'Communication' },
  
  // Case Management
  document_review: { label: 'Document Review', icon: FileText, category: 'Case Management' },
  case_analysis: { label: 'Case Analysis', icon: FileText, category: 'Case Management' },
  status_update: { label: 'Status Update', icon: Clock, category: 'Case Management' },
  client_communication: { label: 'Client Communication', icon: MessageSquare, category: 'Case Management' },
  
  // Negotiation & Settlement
  negotiation: { label: 'Negotiation Session', icon: HandCoins, category: 'Negotiation' },
  settlement_offer: { label: 'Settlement Offer', icon: HandCoins, category: 'Negotiation' },
  payment_plan: { label: 'Payment Plan Setup', icon: Clock, category: 'Negotiation' },
  discount_approved: { label: 'Discount Approved', icon: HandCoins, category: 'Negotiation' },
  
  // Legal Actions
  legal_notice: { label: 'Legal Notice Sent', icon: AlertTriangle, category: 'Legal' },
  court_filing: { label: 'Court Filing', icon: Scale, category: 'Legal' },
  legal_consultation: { label: 'Legal Consultation', icon: Scale, category: 'Legal' },
  enforcement_action: { label: 'Enforcement Action', icon: AlertTriangle, category: 'Legal' },
};

const ACTION_TYPE_COLORS: Record<string, string> = {
  // Communication - Blue theme
  phone_call: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  email_sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  letter_sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  meeting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  
  // Case Management - Purple theme
  document_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  case_analysis: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  status_update: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  client_communication: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  
  // Negotiation & Settlement - Green theme
  negotiation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  settlement_offer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  payment_plan: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  discount_approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  
  // Legal Actions - Red theme
  legal_notice: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  court_filing: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  legal_consultation: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  enforcement_action: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  
  // Fallback
  other: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

// Demo test data
const TEST_ACTIONS: Action[] = [
  {
    id: 'demo-1',
    case_id: 'demo',
    agent_id: 'demo-agent',
    action_type: 'phone_call',
    description: 'Initial contact with debtor - discussed payment options and current financial situation. Debtor expressed willingness to cooperate.',
    status: 'completed',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    metadata: {
      priority: 'high',
      duration_minutes: 15,
      outcome: 'Positive response - debtor willing to negotiate',
      next_action: 'Send payment plan options via email'
    }
  },
  {
    id: 'demo-2',
    case_id: 'demo',
    agent_id: 'demo-agent',
    action_type: 'email_sent',
    description: 'Sent detailed payment plan options including 3, 6, and 12-month installment plans with terms and conditions.',
    status: 'completed',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    metadata: {
      priority: 'medium',
      duration_minutes: 5,
      outcome: 'Email delivered successfully',
      next_action: 'Follow up in 48 hours if no response'
    }
  },
  {
    id: 'demo-3',
    case_id: 'demo',
    agent_id: 'demo-agent',
    action_type: 'document_review',
    description: 'Reviewed debtor credit history and payment patterns. Analyzed risk factors and collection strategy recommendations.',
    status: 'completed',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    metadata: {
      priority: 'medium',
      duration_minutes: 30,
      outcome: 'Medium risk profile identified',
      next_action: 'Proceed with standard collection approach'
    }
  },
  {
    id: 'demo-4',
    case_id: 'demo',
    agent_id: 'demo-agent',
    action_type: 'legal_notice',
    description: 'Formal demand letter sent via registered mail. 14-day payment deadline established with legal consequences outlined.',
    status: 'completed',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    metadata: {
      priority: 'urgent',
      duration_minutes: 10,
      outcome: 'Legal notice delivered and acknowledged',
      next_action: 'Monitor for payment or response by deadline'
    }
  },
  {
    id: 'demo-5',
    case_id: 'demo',
    agent_id: 'demo-agent',
    action_type: 'case_analysis',
    description: 'Initial case assessment completed. Debt validation confirmed, debtor contact information verified, and collection strategy established.',
    status: 'completed',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    metadata: {
      priority: 'medium',
      duration_minutes: 45,
      outcome: 'Case ready for active collection',
      next_action: 'Begin debtor outreach sequence'
    }
  }
];

export function ActionHistory({ caseId, refreshTrigger }: ActionHistoryProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActions = async () => {
    try {
      // Use mock data instead of Supabase
      setActions(TEST_ACTIONS);
    } catch (error) {
      console.error('Error fetching actions:', error);
      toast.error('Failed to load action history');
      // Fall back to test data on error
      setActions(TEST_ACTIONS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [caseId, refreshTrigger]);

  if (isLoading) {
    return (
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Action History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading actions...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-professional">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          Action History ({actions.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete log of all actions taken on this case
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {actions.map((action, index) => {
            const actionInfo = ACTION_TYPE_LABELS[action.action_type] || {
              label: action.action_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
              icon: Clock,
              category: 'Other'
            };
            const ActionIcon = actionInfo.icon;
            const hasMetadata = action.metadata && Object.keys(action.metadata).length > 0;

            return (
              <div key={action.id} className="relative">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="p-2.5 bg-primary/10 rounded-full">
                      <ActionIcon className="h-4 w-4 text-primary" />
                    </div>
                    {index < actions.length - 1 && (
                      <div className="h-full w-0.5 bg-border mt-3"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pb-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant="secondary" 
                          className={ACTION_TYPE_COLORS[action.action_type] || ACTION_TYPE_COLORS.other}
                        >
                          {actionInfo.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {actionInfo.category}
                        </Badge>
                        {action.metadata?.priority && action.metadata.priority !== 'medium' && (
                          <Badge 
                            variant="secondary"
                            className={PRIORITY_COLORS[action.metadata.priority]}
                          >
                            {action.metadata.priority.charAt(0).toUpperCase() + action.metadata.priority.slice(1)} Priority
                          </Badge>
                        )}
                        {action.metadata?.duration_minutes && (
                          <Badge variant="outline" className="text-xs">
                            {action.metadata.duration_minutes}min
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(action.created_at).toLocaleString('en-GB')}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed">{action.description}</p>
                      
                      {/* Additional Details */}
                      {hasMetadata && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            {action.metadata?.outcome && (
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                  Outcome
                                </h5>
                                <p className="text-sm text-foreground">{action.metadata.outcome}</p>
                              </div>
                            )}
                            
                            {action.metadata?.next_action && (
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                  Next Action Recommended
                                </h5>
                                <p className="text-sm text-foreground">{action.metadata.next_action}</p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}