import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Shield,
  Download,
  Eye,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Database,
  Trash2,
  FileDown,
  Plus,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

import { useAuth } from '@/components/auth/AuthProvider';
import { mockGdprRequests } from '@/lib/mockData';
import type { GdprRequest } from '@/types';

const statusConfig = {
  pending: { 
    label: 'Pending Review', 
    icon: Clock, 
    description: 'Request received, awaiting processing'
  },
  processing: { 
    label: 'Processing', 
    icon: AlertCircle, 
    description: 'Request being processed'
  },
  completed: { 
    label: 'Completed', 
    icon: CheckCircle, 
    description: 'Request fulfilled'
  },
  cancelled: { 
    label: 'Cancelled', 
    icon: AlertTriangle, 
    description: 'Request cancelled'
  },
  rejected: { 
    label: 'Rejected', 
    icon: AlertTriangle, 
    description: 'Request declined'
  }
};

const typeConfig = {
  SAR: {
    label: 'Subject Access Request',
    icon: FileDown,
    description: 'Request for personal data held by the organization'
  },
  ERASURE: {
    label: 'Right to Erasure',
    icon: Trash2,
    description: 'Request to delete personal data'
  },
  RECTIFICATION: {
    label: 'Right to Rectification',
    icon: FileText,
    description: 'Request to correct inaccurate personal data'
  },
  PORTABILITY: {
    label: 'Data Portability',
    icon: Download,
    description: 'Request for data in machine-readable format'
  },
  OBJECTION: {
    label: 'Right to Object',
    icon: Shield,
    description: 'Objection to processing of personal data'
  }
};

// New reusable dialog for GDPR requests
interface NewGdprRequestDialogProps {
  requestType: 'SAR' | 'ERASURE';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    type: 'SAR' | 'ERASURE';
    subjectName: string;
    subjectEmail: string;
    description: string;
    confirmation: boolean;
  }) => void;
}

function NewGdprRequestDialog({ requestType, isOpen, onOpenChange, onCreate }: NewGdprRequestDialogProps) {
  const [subjectName, setSubjectName] = useState('');
  const [subjectEmail, setSubjectEmail] = useState('');
  const [description, setDescription] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSAR = requestType === 'SAR';
  const dialogTitle = isSAR ? 'Subject Access Request (SAR)' : 'Erasure Request (Right to be Forgotten)';
  const aboutText = isSAR
    ? 'We will provide a comprehensive export of all personal data we hold about the specified individual within 30 days. This may include case data, communications, documents, and audit logs where the individual is referenced.'
    : 'This will permanently delete all non-legally required personal data from our systems within 30 days. Some data may be retained if required by law (e.g., financial records for tax purposes). Legal holds may prevent deletion.';
  const legalNotice = isSAR
    ? 'This request will be processed in accordance with GDPR Article 15 and our Data Protection Policy. We may require additional information to verify the identity of the data subject before processing this request. Response times may be extended if the request is complex or if we receive multiple requests from you.'
    : 'This request will be processed in accordance with GDPR Article 17 and our Data Protection Policy. We may require additional information to verify the identity of the data subject before processing this request. Response times may be extended if the request is complex or if we receive multiple requests from you.';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!subjectName.trim()) newErrors.subjectName = 'Subject Name is required.';
    if (!subjectEmail.trim()) newErrors.subjectEmail = 'Subject Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subjectEmail)) newErrors.subjectEmail = 'Invalid email format.';
    if (!description.trim()) newErrors.description = 'Request Description is required.';
    if (!confirmation) newErrors.confirmation = 'You must confirm to proceed.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onCreate({ type: requestType, subjectName, subjectEmail, description, confirmation });
      // Reset form
      setSubjectName('');
      setSubjectEmail('');
      setDescription('');
      setConfirmation(false);
      setErrors({});
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSubjectName('');
    setSubjectEmail('');
    setDescription('');
    setConfirmation(false);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSAR ? <FileDown className="h-5 w-5 text-primary" /> : <Trash2 className="h-5 w-5 text-destructive" />}
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card className={`border-l-4 ${isSAR ? 'border-l-primary bg-primary/5' : 'border-l-destructive bg-destructive/5'}`}>
            <CardContent className="p-4 text-sm">
              <h4 className="font-semibold mb-2">About This Request</h4>
              <p>{aboutText}</p>
            </CardContent>
          </Card>

          <div>
            <Label htmlFor="subjectName">Subject Name <span className="text-destructive">*</span></Label>
            <Input
              id="subjectName"
              value={subjectName}
              onChange={(e) => { setSubjectName(e.target.value); setErrors(prev => ({ ...prev, subjectName: '' })); }}
              placeholder="Full name of the data subject"
              className={errors.subjectName ? 'border-destructive' : ''}
            />
            {errors.subjectName && <p className="text-sm text-destructive mt-1">{errors.subjectName}</p>}
          </div>

          <div>
            <Label htmlFor="subjectEmail">Subject Email <span className="text-destructive">*</span></Label>
            <Input
              id="subjectEmail"
              type="email"
              value={subjectEmail}
              onChange={(e) => { setSubjectEmail(e.target.value); setErrors(prev => ({ ...prev, subjectEmail: '' })); }}
              placeholder="Email address of the data subject"
              className={errors.subjectEmail ? 'border-destructive' : ''}
            />
            {errors.subjectEmail && <p className="text-sm text-destructive mt-1">{errors.subjectEmail}</p>}
          </div>

          <div>
            <Label htmlFor="description">Request Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: '' })); }}
              placeholder={isSAR ? "Provide details about this access request..." : "Provide details about this erasure request..."}
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="confirmation"
              checked={confirmation}
              onCheckedChange={(checked) => { setConfirmation(checked === true); setErrors(prev => ({ ...prev, confirmation: '' })); }}
            />
            <Label htmlFor="confirmation" className="text-sm leading-relaxed cursor-pointer">
              I confirm that I understand this request will be processed within 30 days and that identity verification may be required. <span className="text-destructive">*</span>
            </Label>
          </div>
          {errors.confirmation && <p className="text-sm text-destructive mt-1">{errors.confirmation}</p>}

          <Card className="border-l-4 border-l-warning bg-warning/5">
            <CardContent className="p-4 text-sm">
              <h4 className="font-semibold mb-2">Legal Notice</h4>
              <p>{legalNotice}</p>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className={isSAR ? '' : 'bg-destructive hover:bg-destructive/90'}
          >
            {isSAR ? 'Create SAR' : 'Create Erasure Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function GdprRequests() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [requests, setRequests] = useState<GdprRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<GdprRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<GdprRequest | null>(null);
  const [showRequestDetailDialog, setShowRequestDetailDialog] = useState(false);
  const [showNewSARDialog, setShowNewSARDialog] = useState(false);
  const [showNewErasureDialog, setShowNewErasureDialog] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load GDPR requests data
  useEffect(() => {
    setRequests(mockGdprRequests);
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...requests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(request => request.type === typeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request => 
        request.dataSubject.toLowerCase().includes(query) ||
        request.description.toLowerCase().includes(query) ||
        request.requestedByName.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredRequests(filtered);
  }, [requests, statusFilter, typeFilter, searchQuery]);

  const handleViewRequestDetails = (request: GdprRequest) => {
    setSelectedRequest(request);
    setShowRequestDetailDialog(true);
  };

  const handleDownloadCertificate = (request: GdprRequest) => {
    if (request.downloadUrl) {
      toast({
        title: 'Download Started',
        description: `Downloading completion certificate for request ${request.id}`,
      });
    }
  };

  const handleCreateRequest = async (data: {
    type: 'SAR' | 'ERASURE';
    subjectName: string;
    subjectEmail: string;
    description: string;
    confirmation: boolean;
  }) => {
    if (!data.confirmation) {
      toast({
        title: 'Confirmation Required',
        description: 'You must confirm understanding before proceeding.',
        variant: 'destructive'
      });
      return;
    }

    const newRequest: GdprRequest = {
      id: `gdpr_${Date.now()}`,
      type: data.type,
      status: 'pending',
      requestedBy: user?.id || 'current_user',
      requestedByName: user?.name || 'Current User',
      dataSubject: data.subjectName,
      dataSubjectEmail: data.subjectEmail,
      description: data.description,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      affectedCases: []
    };

    setRequests([newRequest, ...requests]);
    
    toast({
      title: 'Request Created',
      description: `GDPR request ${newRequest.id} has been submitted for processing.`
    });
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (request: GdprRequest) => {
    const created = new Date(request.createdAt);
    const due = new Date(request.dueDate);
    const now = new Date();
    
    const totalTime = due.getTime() - created.getTime();
    const elapsedTime = now.getTime() - created.getTime();
    
    const percentage = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
    
    if (request.status === 'completed') return 100;
    if (request.status === 'rejected' || request.status === 'cancelled') return 0;
    
    return percentage;
  };

  // Calculate statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    completed: requests.filter(r => r.status === 'completed').length,
    overdue: requests.filter(r => {
      const daysRemaining = getDaysRemaining(r.dueDate);
      return daysRemaining < 0 && r.status !== 'completed';
    }).length
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            GDPR Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage data protection requests and compliance
          </p>
        </div>
        
        {stats.overdue > 0 && (
          <Badge variant="outline" className="text-sm py-2 px-4 border-destructive text-destructive">
            {stats.overdue} Overdue
          </Badge>
        )}
      </div>

      {/* Request Creation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-professional hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileDown className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Subject Access Request</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Request access to all personal data we hold about a specific individual. We have 30 days to respond with a comprehensive data export.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setShowNewSARDialog(true)}
              className="w-full"
            >
              Create SAR →
            </Button>
          </CardContent>
        </Card>

        <Card className="card-professional hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Erasure Request</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Request deletion of personal data under the "Right to be Forgotten". This will remove all non-legally required data from our systems.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setShowNewErasureDialog(true)}
              className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Create Erasure Request →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Your GDPR Rights Section */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your GDPR Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2 text-primary">
                <FileDown className="h-4 w-4" />
                Right to Access (SAR)
              </h4>
              <p className="text-sm text-muted-foreground">
                You have the right to request copies of all personal data we hold about you.
              </p>
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2 text-primary">
                <FileText className="h-4 w-4" />
                Right to Rectification
              </h4>
              <p className="text-sm text-muted-foreground">
                You can request correction of inaccurate or incomplete data.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Right to Erasure
              </h4>
              <p className="text-sm text-muted-foreground">
                You can request deletion of your personal data in certain circumstances.
              </p>
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2 text-primary">
                <Download className="h-4 w-4" />
                Right to Portability
              </h4>
              <p className="text-sm text-muted-foreground">
                You can request your data in a structured, machine-readable format.
              </p>
            </div>
          </div>
          <div className="col-span-2 pt-4 border-t text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-primary">Response Time:</span> We will respond to your request within 30 days of receipt.{' '}
              <span className="font-semibold text-primary">Identity Verification:</span> We may need to verify your identity before processing requests.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
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
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{stats.processing}</p>
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
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
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
                  placeholder="Search by data subject, description, or requester..."
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
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="SAR">Subject Access Request</SelectItem>
                  <SelectItem value="ERASURE">Right to Erasure</SelectItem>
                  <SelectItem value="RECTIFICATION">Right to Rectification</SelectItem>
                  <SelectItem value="PORTABILITY">Data Portability</SelectItem>
                  <SelectItem value="OBJECTION">Right to Object</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your GDPR Requests Table */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle>Your GDPR Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No GDPR requests found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'GDPR requests will appear here when submitted.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">TYPE</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">SUBJECT</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">STATUS</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">REQUESTED</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">DUE DATE</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => {
                    const TypeIcon = typeConfig[request.type as keyof typeof typeConfig]?.icon || Shield;
                    const daysRemaining = getDaysRemaining(request.dueDate);
                    const isOverdue = daysRemaining < 0 && request.status !== 'completed';
                    
                    return (
                      <tr key={request.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded ${request.type === 'SAR' ? 'bg-warning/10' : 'bg-destructive/10'}`}>
                              <TypeIcon className={`h-4 w-4 ${request.type === 'SAR' ? 'text-warning' : 'text-destructive'}`} />
                            </div>
                            <span className="font-medium text-sm">
                              {request.type}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">{request.dataSubject}</p>
                            {request.dataSubjectEmail && (
                              <p className="text-sm text-muted-foreground">{request.dataSubjectEmail}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            variant={
                              request.status === 'completed' ? 'default' :
                              request.status === 'processing' ? 'secondary' :
                              request.status === 'pending' ? 'outline' : 'destructive'
                            }
                            className={
                              request.status === 'processing' ? 'bg-warning/10 text-warning border-warning' : ''
                            }
                          >
                            {request.status === 'processing' ? 'In Progress' : 
                             request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <p>{format(new Date(request.createdAt), 'dd/MM/yyyy')}</p>
                            <p className="text-muted-foreground">by {request.requestedByName}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <p>{format(new Date(request.dueDate), 'dd/MM/yyyy')}</p>
                            {isOverdue && (
                              <p className="text-destructive font-medium">Overdue</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRequestDetails(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.downloadUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadCertificate(request)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Detail Dialog */}
      <Dialog open={showRequestDetailDialog} onOpenChange={setShowRequestDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>GDPR Request Details</DialogTitle>
            <DialogDescription>
              {selectedRequest && `${typeConfig[selectedRequest.type as keyof typeof typeConfig]?.label} - ${selectedRequest.id}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <ScrollArea className="max-h-96">
              <div className="space-y-6">
                {/* Request Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {typeConfig[selectedRequest.type as keyof typeof typeConfig]?.label}
                    </h3>
                    <p className="text-muted-foreground">{selectedRequest.id}</p>
                  </div>
                  <StatusBadge status={selectedRequest.status} />
                </div>
                
                <Separator />
                
                {/* Request Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data Subject</p>
                    <p className="font-semibold">{selectedRequest.dataSubject}</p>
                    {selectedRequest.dataSubjectEmail && (
                      <p className="text-sm text-muted-foreground">{selectedRequest.dataSubjectEmail}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested By</p>
                    <p className="font-semibold">{selectedRequest.requestedByName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p>{format(new Date(selectedRequest.createdAt), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p>{format(new Date(selectedRequest.dueDate), 'PPP')}</p>
                  </div>
                  {selectedRequest.completedAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p>{format(new Date(selectedRequest.completedAt), 'PPP')}</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Request Description</h4>
                  <p className="text-sm">{selectedRequest.description}</p>
                </div>
                
                {/* Affected Cases */}
                {selectedRequest.affectedCases && selectedRequest.affectedCases.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Affected Cases</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.affectedCases.map((caseId, index) => (
                          <Badge key={index} variant="outline" className="cursor-pointer" 
                                 onClick={() => navigate(`/cases/${caseId}`)}>
                            {caseId}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* New SAR Dialog */}
      <NewGdprRequestDialog
        requestType="SAR"
        isOpen={showNewSARDialog}
        onOpenChange={setShowNewSARDialog}
        onCreate={handleCreateRequest}
      />

      {/* New Erasure Dialog */}
      <NewGdprRequestDialog
        requestType="ERASURE"
        isOpen={showNewErasureDialog}
        onOpenChange={setShowNewErasureDialog}
        onCreate={handleCreateRequest}
      />
    </div>
  );
}