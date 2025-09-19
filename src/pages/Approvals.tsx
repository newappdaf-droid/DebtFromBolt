// Professional Approvals Management Page for B2B Debt Collection Platform
// Redesigned to match reference layout with clean table and detailed approval modal

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  Search, 
  FileText,
  AlertTriangle,
  MessageSquare,
  Eye,
  Check,
  X,
  ChevronDown,
  Calculator,
  Calendar,
  User,
  Building,
  Download,
  Scale
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Money } from '@/components/ui/money';

import { useAuth } from '@/components/auth/AuthProvider';
import { getApprovalsForUser } from '@/lib/mockData';
import { AIHelpButton } from '@/components/ai/AIHelpButton';
import type { Approval } from '@/types';

const statusConfig = {
  pending: { 
    label: 'Pending', 
    icon: Clock, 
    variant: 'warning' as const,
    description: 'Awaiting decision',
    color: 'bg-yellow-100 text-yellow-800'
  },
  approved: { 
    label: 'Approved', 
    icon: CheckCircle, 
    variant: 'success' as const,
    description: 'Request approved',
    color: 'bg-green-100 text-green-800'
  },
  rejected: { 
    label: 'Rejected', 
    icon: XCircle, 
    variant: 'destructive' as const,
    description: 'Request declined',
    color: 'bg-red-100 text-red-800'
  }
};

const typeConfig = {
  legal_escalation: {
    label: 'Legal Escalation',
    icon: Scale,
    description: 'Request to escalate case to legal proceedings',
    color: 'bg-red-100 text-red-800'
  },
  expense: {
    label: 'Expense Approval',
    icon: Calculator,
    description: 'Request for expense reimbursement',
    color: 'bg-blue-100 text-blue-800'
  },
  settlement_approval: {
    label: 'Settlement Agreement',
    icon: FileText,
    description: 'Proposed settlement terms',
    color: 'bg-green-100 text-green-800'
  },
  payment_plan: {
    label: 'Payment Plan',
    icon: Calendar,
    description: 'Payment plan approval',
    color: 'bg-purple-100 text-purple-800'
  },
  retrieval: {
    label: 'Case Retrieval',
    icon: FileText,
    description: 'Case retrieval request',
    color: 'bg-orange-100 text-orange-800'
  },
  write_off: {
    label: 'Write Off',
    icon: X,
    description: 'Write off approval',
    color: 'bg-gray-100 text-gray-800'
  }
};

// Approval Detail Modal Component
interface ApprovalDetailModalProps {
  approval: Approval;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDecision: (approvalId: string, decision: 'approved' | 'rejected', comments?: string) => void;
}

function ApprovalDetailModal({ approval, isOpen, onOpenChange, onDecision }: ApprovalDetailModalProps) {
  const [comments, setComments] = useState('');
  const [selectedDecision, setSelectedDecision] = useState<'approved' | 'rejected' | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDecision = (decision: 'approved' | 'rejected') => {
    setSelectedDecision(decision);
  };

  const handleConfirmDecision = () => {
    if (selectedDecision) {
      onDecision(approval.id, selectedDecision, comments);
      setComments('');
      setSelectedDecision(null);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setComments('');
    setSelectedDecision(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            {typeConfig[approval.type as keyof typeof typeConfig]?.label || approval.type} Approval Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Case Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Case Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Case:</span>
                <button
                  onClick={() => {
                    navigate(`/cases/${approval.caseId}`);
                    onOpenChange(false);
                  }}
                  className="font-medium text-primary hover:text-primary/80 hover:underline text-left"
                >
                  {approval.caseName}
                </button>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground">Amount:</span>
                <p className="font-medium">
                  <Money amount={approval.amount || 0} currency={approval.currency || 'EUR'} />
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Requested by:</span>
                <p className="font-medium">{approval.requestedByName}</p>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground">Request date:</span>
                <p className="font-medium">{format(new Date(approval.createdAt), 'dd/MM/yyyy')}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {approval.description}
            </p>
          </div>

          {/* Relevant Contract Clause */}
          {approval.clauseText && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">Relevant Contract Clause</h4>
              </div>
              <p className="text-sm text-blue-800">{approval.clauseText}</p>
            </div>
          )}

          {/* Fee Breakdown */}
          {approval.feeBreakdown && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Fee Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Handling Fee:</span>
                  <span><Money amount={approval.feeBreakdown.baseAmount * approval.feeBreakdown.percentage / 100} currency={approval.feeBreakdown.currency} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Legal Fee:</span>
                  <span><Money amount={approval.feeBreakdown.fixedFee} currency={approval.feeBreakdown.currency} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Additional Costs:</span>
                  <span><Money amount={250} currency={approval.feeBreakdown.currency} /></span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span><Money amount={approval.feeBreakdown.totalFee - approval.feeBreakdown.vatAmount} currency={approval.feeBreakdown.currency} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (20%):</span>
                  <span><Money amount={approval.feeBreakdown.vatAmount} currency={approval.feeBreakdown.currency} /></span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span><Money amount={approval.feeBreakdown.totalFee} currency={approval.feeBreakdown.currency} /></span>
                </div>
              </div>
            </div>
          )}

          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Legal escalation will incur additional fees and may impact the timeline significantly.
              </p>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments or notes about your decision..."
              rows={3}
              className="w-full"
            />
          </div>

          {/* Decision Buttons */}
          {approval.state === 'pending' && user?.role === 'ADMIN' && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
                onClick={() => handleDecision('approved')}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-500 text-red-700 hover:bg-red-50"
                onClick={() => handleDecision('rejected')}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          {selectedDecision && (
            <Button 
              onClick={handleConfirmDecision}
              variant={selectedDecision === 'approved' ? 'default' : 'destructive'}
            >
              Confirm Decision
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Approvals() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<Approval[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load approvals data
  useEffect(() => {
    if (user) {
      const userApprovals = getApprovalsForUser(user.id, user.role);
      setApprovals(userApprovals);
    }
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...approvals];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(approval => approval.state === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(approval => approval.type === typeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(approval => 
        approval.caseName.toLowerCase().includes(query) ||
        approval.description.toLowerCase().includes(query) ||
        approval.requestedByName.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredApprovals(filtered);
  }, [approvals, statusFilter, typeFilter, searchQuery]);

  const handleReviewApproval = (approval: Approval) => {
    setSelectedApproval(approval);
    setShowApprovalModal(true);
  };

  const handleApprovalDecision = async (approvalId: string, decision: 'approved' | 'rejected', comments?: string) => {
    if (user?.role !== 'ADMIN') {
      toast({
        title: 'Unauthorized',
        description: 'Only administrators can make approval decisions.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      const updatedApprovals = approvals.map(approval => 
        approval.id === approvalId 
          ? {
              ...approval,
              state: decision === 'approved' ? 'approved' : 'rejected' as any,
              decidedAt: new Date().toISOString(),
              decidedBy: user?.id,
              decisionNotes: comments || undefined
            }
          : approval
      );
      
      setApprovals(updatedApprovals);
      
      toast({
        title: `Request ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `The approval request has been ${decision}.`
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process decision. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: approvals.length,
    pending: approvals.filter(a => a.state === 'pending').length,
    approved: approvals.filter(a => a.state === 'approved').length,
    rejected: approvals.filter(a => a.state === 'rejected').length
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve case-related requests
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {stats.pending > 0 && user?.role === 'ADMIN' && (
            <Badge variant="outline" className="text-sm py-2 px-4 border-warning text-warning">
              {stats.pending} Pending Review{stats.pending > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by case name, description, or requester..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="legal_escalation">Legal Escalation</SelectItem>
                  <SelectItem value="expense">Expense Approval</SelectItem>
                  <SelectItem value="settlement_approval">Settlement</SelectItem>
                  <SelectItem value="payment_plan">Payment Plan</SelectItem>
                  <SelectItem value="retrieval">Retrieval</SelectItem>
                  <SelectItem value="write_off">Write Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approvals Table */}
      <Card className="card-professional">
        <CardContent className="p-0">
          {filteredApprovals.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No approval requests found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Approval requests will appear here when submitted.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      CASE
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      TYPE
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      AMOUNT
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      REQUESTED
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredApprovals.map((approval) => (
                    <tr key={approval.id} className="hover:bg-muted/30">
                      <td className="px-3 py-2">
                        <div>
                          <button
                            onClick={() => navigate(`/cases/${approval.caseId}`)}
                            className="font-medium text-primary hover:text-primary/80 hover:underline text-left text-sm truncate max-w-[200px] block"
                            title={approval.caseName}
                          >
                            {approval.caseName}
                          </button>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-[200px]" title={approval.description}>
                            {approval.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge 
                          status={approval.type} 
                          size="sm" 
                          maxWidth="120px"
                          truncate={true}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium">
                          <Money amount={approval.amount || 0} currency={approval.currency || 'EUR'} />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={approval.state} size="sm" maxWidth="80px" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs">
                          <p className="text-sm">{format(new Date(approval.createdAt), 'dd/MM/yy')}</p>
                          <p className="text-muted-foreground truncate max-w-[100px]" title={approval.requestedByName}>
                            by {approval.requestedByName}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {approval.state === 'pending' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReviewApproval(approval)}
                            className="text-primary border-primary hover:bg-primary/10"
                          >
                            Review
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {approval.state === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Detail Modal */}
      {selectedApproval && (
        <ApprovalDetailModal
          approval={selectedApproval}
          isOpen={showApprovalModal}
          onOpenChange={setShowApprovalModal}
          onDecision={handleApprovalDecision}
        />
      )}
    </div>
  );
}