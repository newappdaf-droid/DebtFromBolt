// Professional Case Detail Page for B2B Debt Collection Platform
// Cases 2.0: Enhanced case detail with workflows, finance, activities, and comprehensive management

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, FileText, History, Settings, AlertTriangle,
  Clock, User, Scale, CheckCircle, Building, CreditCard, Activity,
  Upload, Plus, Edit, Tag, Users, Calendar, TrendingUp, DollarSign,
  Phone, Mail, Archive, Briefcase, Target, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/auth/AuthProvider';
import { PermissionGate } from '@/components/auth/RoleGuard';
import { casesApi } from '@/lib/api/casesApi';
import { CaseHeader, CaseFinance, CaseActivity, Payment, CaseDocument, CaseHistoryItem } from '@/types/cases';
import { CaseActivitiesTab } from '@/components/case/CaseActivitiesTab';
import { CaseFinanceTab } from '@/components/case/CaseFinanceTab';
import { CaseDocumentsTab } from '@/components/case/CaseDocumentsTab';
import { CaseHistoryTab } from '@/components/case/CaseHistoryTab';
import { CaseMessagesTab } from '@/components/case/CaseMessagesTab';
import { toast } from 'sonner';

// Phase configuration
const phaseConfig = {
  Soft: { label: 'Soft Collection', color: 'bg-blue-100 text-blue-800', icon: Clock },
  Field: { label: 'Field Collection', color: 'bg-yellow-100 text-yellow-800', icon: User },
  Legal: { label: 'Legal Action', color: 'bg-red-100 text-red-800', icon: Scale },
  Bailiff: { label: 'Bailiff Action', color: 'bg-purple-100 text-purple-800', icon: AlertTriangle },
  Closed: { label: 'Closed', color: 'bg-green-100 text-green-800', icon: CheckCircle }
};

const zoneConfig = {
  PreLegal: { label: 'Pre-Legal', color: 'bg-gray-100 text-gray-800' },
  Legal: { label: 'Legal', color: 'bg-red-100 text-red-800' },
  Bailiff: { label: 'Bailiff', color: 'bg-purple-100 text-purple-800' }
};

const statusConfig = {
  PendingAcceptance: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  Active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  Refused: { label: 'Refused', color: 'bg-red-100 text-red-800' },
  Closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' }
};

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  
  const [caseHeader, setCaseHeader] = useState<CaseHeader | null>(null);
  const [caseFinance, setCaseFinance] = useState<CaseFinance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!id) {
      navigate('/cases');
      return;
    }

    loadCase();
  }, [id, navigate]);

  const loadCase = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await casesApi.getCase(id);
      setCaseHeader(response.Header);
      setCaseFinance(response.Finance);
    } catch (error) {
      console.error('Error loading case:', error);
      setError(error instanceof Error ? error.message : 'Failed to load case');
      toast.error('Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpdate = () => {
    // Refresh case data when updates occur
    loadCase();
  };

  const handleAcceptCase = async () => {
    if (!id) return;
    
    try {
      await casesApi.acceptCase(id);
      toast.success('Case accepted successfully');
      loadCase();
    } catch (error) {
      toast.error('Failed to accept case');
    }
  };

  const handleRefuseCase = async () => {
    if (!id) return;
    
    try {
      await casesApi.refuseCase(id, 'Case refused by user');
      toast.success('Case refused');
      loadCase();
    } catch (error) {
      toast.error('Failed to refuse case');
    }
  };

  const getDaysInProcess = () => {
    if (!caseHeader) return 0;
    const startDate = new Date(caseHeader.AcceptedAt || caseHeader.OpenedAt);
    const endDate = caseHeader.ClosedAt ? new Date(caseHeader.ClosedAt) : new Date();
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-36" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !caseHeader) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Case Not Found</h3>
                <p className="text-muted-foreground mb-4">
                  {error || 'The requested case could not be found or you do not have permission to view it.'}
                </p>
                <Button onClick={() => navigate('/cases')}>
                  Return to Cases List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canManageCase = hasRole(['ADMIN', 'AGENT']);
  const isAssignedAgent = hasRole('AGENT') && caseHeader.AssignedToUserId === user?.id;
  const isOwnCase = hasRole('CLIENT') && caseHeader.ClientId === user?.clientId;
  const canViewFullDetails = hasRole(['ADMIN', 'DPO']) || isAssignedAgent || isOwnCase;

  if (!canViewFullDetails) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-warning" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                <p className="text-muted-foreground">
                  You do not have permission to view this case.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const PhaseIcon = phaseConfig[caseHeader.Phase].icon;
  const daysInProcess = getDaysInProcess();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{caseHeader.CaseNumber}</h1>
            <p className="text-muted-foreground">Case ID: {caseHeader.CaseId}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {caseHeader.Status === 'PendingAcceptance' && canManageCase && (
            <>
              <Button variant="outline" onClick={handleRefuseCase}>
                Refuse Case
              </Button>
              <Button onClick={handleAcceptCase}>
                Accept Case
              </Button>
            </>
          )}
          {canManageCase && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Assign Agent
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Tag className="h-4 w-4 mr-2" />
                  Manage Labels
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Scale className="h-4 w-4 mr-2" />
                  Request Escalation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <PermissionGate allowedRoles={['ADMIN']}>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
              Admin
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Enhanced Case Header */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Case Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <PhaseIcon className="h-6 w-6 text-primary" />
                </div>
                Case Information
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={phaseConfig[caseHeader.Phase].color}>
                  {phaseConfig[caseHeader.Phase].label}
                </Badge>
                <Badge className={zoneConfig[caseHeader.Zone].color}>
                  {zoneConfig[caseHeader.Zone].label}
                </Badge>
                <Badge className={statusConfig[caseHeader.Status].color}>
                  {statusConfig[caseHeader.Status].label}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-muted-foreground mb-2">Case Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Case Type:</span>
                    <span className="font-medium">{caseHeader.CaseType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Process Type:</span>
                    <span className="font-medium">{caseHeader.ProcessType || 'Standard'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission:</span>
                    <span className="font-medium">{caseHeader.CommissionPct ? `${caseHeader.CommissionPct}%` : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-muted-foreground mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Opened:</span>
                    <span className="font-medium">{new Date(caseHeader.OpenedAt).toLocaleDateString()}</span>
                  </div>
                  {caseHeader.AcceptedAt && (
                    <div className="flex justify-between">
                      <span>Accepted:</span>
                      <span className="font-medium">{new Date(caseHeader.AcceptedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Days in Process:</span>
                    <span className="font-medium">{daysInProcess} days</span>
                  </div>
                </div>
              </div>
            </div>
            
            {caseHeader.Labels.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-muted-foreground mb-2">Labels</h4>
                <div className="flex flex-wrap gap-2">
                  {caseHeader.Labels.map((label) => (
                    <Badge key={label} variant="outline">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {caseFinance && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Principal:</span>
                  <span className="font-medium">{caseFinance.Currency} {(caseFinance.Principal ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fees:</span>
                  <span className="font-medium">{caseFinance.Currency} {(caseFinance.Fees ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payments:</span>
                  <span className="font-medium text-green-600">{caseFinance.Currency} {(caseFinance.PaymentsTotal ?? 0).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Open to Pay:</span>
                  <span className="font-bold text-lg">{caseFinance.Currency} {(caseFinance.OpenToPay ?? 0).toLocaleString()}</span>
                </div>
                
                {/* Payment Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Recovery Progress</span>
                    <span>{Math.round(((caseFinance.PaymentsTotal ?? 0) / ((caseFinance.Principal ?? 0) + (caseFinance.Fees ?? 0))) * 100) || 0}%</span>
                  </div>
                  <Progress 
                    value={((caseFinance.PaymentsTotal ?? 0) / ((caseFinance.Principal ?? 0) + (caseFinance.Fees ?? 0))) * 100 || 0} 
                    className="h-2"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Process Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Process Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Days in Process</span>
                </div>
                <span className="font-bold text-lg">{daysInProcess}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Activities</span>
                </div>
                <span className="font-medium">12</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Assigned Agent</span>
                </div>
                <span className="font-medium">
                  {caseHeader.AssignedToUserId ? `Agent ${caseHeader.AssignedToUserId.split('_')[1]}` : 'Unassigned'}
                </span>
              </div>
              
              {caseHeader.Priority && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Priority</span>
                  </div>
                  <Badge variant="outline" className={
                    caseHeader.Priority === 'High' ? 'border-red-500 text-red-500' :
                    caseHeader.Priority === 'Medium' ? 'border-yellow-500 text-yellow-500' :
                    'border-green-500 text-green-500'
                  }>
                    {caseHeader.Priority}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partner/Process Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Partner & Process Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium text-muted-foreground mb-2">Portfolio</h4>
              <p className="font-medium">{caseHeader.PortfolioId}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-muted-foreground mb-2">Client</h4>
              <p className="font-medium">{caseHeader.ClientId}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-muted-foreground mb-2">Creditor</h4>
              <p className="font-medium">{caseHeader.CreditorId || 'N/A'}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-muted-foreground mb-2">Sending Partner</h4>
              <p className="font-medium">{caseHeader.SendingPartnerId || 'Direct'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="debtor" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Debtor
          </TabsTrigger>
          <TabsTrigger value="creditor" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Creditor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Acceptance Conditions */}
          {caseHeader.Status === 'PendingAcceptance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Acceptance Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Contract Review Required</span>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Contract
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Debtor Verification Complete</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Documentation Uploaded</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Case Information Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Debtor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Debtor ID:</span>
                    <p className="font-medium">{caseHeader.DebtorId}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Contact Methods:</span>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">
                        <Phone className="h-3 w-3 mr-1" />
                        Phone
                      </Badge>
                      <Badge variant="outline">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caseHeader.AssignedToUserId ? (
                    <div>
                      <span className="text-sm text-muted-foreground">Assigned Agent:</span>
                      <p className="font-medium">Agent {caseHeader.AssignedToUserId.split('_')[1]}</p>
                      <Badge variant="secondary" className="mt-1">Assigned</Badge>
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <p className="text-muted-foreground">Unassigned</p>
                      <PermissionGate allowedRoles={['ADMIN']}>
                        <Button variant="outline" size="sm" className="mt-2">
                          <User className="h-4 w-4 mr-2" />
                          Assign Agent
                        </Button>
                      </PermissionGate>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <CaseHistoryTab caseId={caseHeader.CaseId} />
        </TabsContent>

        <TabsContent value="financial">
          <CaseFinanceTab caseId={caseHeader.CaseId} finance={caseFinance} onUpdate={handleDataUpdate} />
        </TabsContent>

        <TabsContent value="activities">
          <CaseActivitiesTab caseId={caseHeader.CaseId} onUpdate={handleDataUpdate} />
        </TabsContent>

        <TabsContent value="messages">
          <CaseMessagesTab caseId={caseHeader.CaseId} />
        </TabsContent>

        <TabsContent value="documents">
          <CaseDocumentsTab caseId={caseHeader.CaseId} onUpdate={handleDataUpdate} />
        </TabsContent>

        <TabsContent value="debtor">
          <Card>
            <CardHeader>
              <CardTitle>Debtor Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Debtor information will be loaded here</p>
                <p className="text-sm">ID: {caseHeader.DebtorId}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creditor">
          <Card>
            <CardHeader>
              <CardTitle>Creditor Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Creditor information will be loaded here</p>
                <p className="text-sm">ID: {caseHeader.CreditorId || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}