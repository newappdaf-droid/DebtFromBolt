// Professional Status Badge Component
// Clean, pill-shaped badges that handle long text gracefully

import React from 'react';
import { cn } from '@/lib/utils';
import { CaseStatus, ApprovalState } from '@/types';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: CaseStatus | ApprovalState | string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  truncate?: boolean;
  maxWidth?: string;
}

const statusConfig = {
  // Case Status Colors - Professional pill design
  new: {
    label: 'New',
    variant: 'info' as const,
  },
  in_progress: {
    label: 'In Progress',
    variant: 'pending' as const,
  },
  awaiting_approval: {
    label: 'Awaiting Approval',
    variant: 'pending' as const,
  },
  legal_stage: {
    label: 'Legal Stage',
    variant: 'legal' as const,
  },
  closed: {
    label: 'Closed',
    variant: 'approved' as const,
  },
  
  // Approval Status Colors
  pending: {
    label: 'Pending',
    variant: 'pending' as const,
  },
  approved: {
    label: 'Approved',
    variant: 'approved' as const,
  },
  rejected: {
    label: 'Rejected',
    variant: 'rejected' as const,
  },
  
  // Invoice Status Colors
  draft: {
    label: 'Draft',
    variant: 'inactive' as const,
  },
  sent: {
    label: 'Sent',
    variant: 'active' as const,
  },
  viewed: {
    label: 'Viewed',
    variant: 'info' as const,
  },
  paid: {
    label: 'Paid',
    variant: 'approved' as const,
  },
  overdue: {
    label: 'Overdue',
    variant: 'rejected' as const,
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'inactive' as const,
  },
  
  // GDPR Status Colors
  processing: {
    label: 'Processing',
    variant: 'pending' as const,
  },
  completed: {
    label: 'Completed',
    variant: 'approved' as const,
  },
  
  // User Role Colors
  CLIENT: {
    label: 'Client',
    variant: 'client' as const,
  },
  AGENT: {
    label: 'Collection Agent',
    variant: 'agent' as const,
  },
  ADMIN: {
    label: 'Administrator',
    variant: 'admin' as const,
  },
  DPO: {
    label: 'Data Protection Officer',
    variant: 'dpo' as const,
  },
};

export function StatusBadge({ 
  status, 
  variant, 
  size = 'default', 
  className,
  truncate = false,
  maxWidth
}: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    variant: 'outline' as const,
  };

  const displayVariant = variant || config.variant;

  return (
    <Badge 
      variant={displayVariant}
      size={size}
      truncate={truncate}
      maxWidth={maxWidth}
      className={cn("font-medium", className)}
    >
      {config.label}
    </Badge>
  );
}

// Helper component for priority indicators
interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function PriorityBadge({ priority, className, size = 'default' }: PriorityBadgeProps) {
  const priorityConfig = {
    low: {
      label: 'Low',
      variant: 'approved' as const,
    },
    medium: {
      label: 'Medium',
      variant: 'info' as const,
    },
    high: {
      label: 'High',
      variant: 'warning' as const,
    },
    urgent: {
      label: 'Urgent',
      variant: 'rejected' as const,
    },
  };

  const config = priorityConfig[priority];

  return (
    <Badge 
      variant={config.variant}
      size={size}
      className={cn("font-medium", className)}
    >
      {config.label}
    </Badge>
  );
}

// Helper component for type badges with better text handling
interface TypeBadgeProps {
  type: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  maxWidth?: string;
}

export function TypeBadge({ type, className, size = 'default', maxWidth }: TypeBadgeProps) {
  const typeConfig: Record<string, { label: string; variant: any }> = {
    legal_escalation: {
      label: 'Legal Escalation',
      variant: 'legal',
    },
    expense: {
      label: 'Expense Approval',
      variant: 'expense',
    },
    settlement_approval: {
      label: 'Settlement',
      variant: 'settlement',
    },
    payment_plan: {
      label: 'Payment Plan',
      variant: 'info',
    },
    retrieval: {
      label: 'Retrieval',
      variant: 'warning',
    },
    write_off: {
      label: 'Write Off',
      variant: 'inactive',
    },
    SAR: {
      label: 'Subject Access Request',
      variant: 'info',
    },
    ERASURE: {
      label: 'Right to Erasure',
      variant: 'rejected',
    },
    RECTIFICATION: {
      label: 'Rectification',
      variant: 'warning',
    },
    PORTABILITY: {
      label: 'Data Portability',
      variant: 'info',
    },
    OBJECTION: {
      label: 'Right to Object',
      variant: 'warning',
    },
  };

  const config = typeConfig[type] || {
    label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    variant: 'outline',
  };

  return (
    <Badge 
      variant={config.variant}
      size={size}
      truncate={true}
      maxWidth={maxWidth}
      className={cn("font-medium", className)}
    >
      {config.label}
    </Badge>
  );
}