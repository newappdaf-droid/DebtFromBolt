// Case Activities Tab Component
// Comprehensive activity management with SLA tracking and PTP handling

import React, { useState, useEffect } from 'react';
import { 
  Plus, Clock, Phone, Mail, FileText, User, AlertTriangle, 
  CheckCircle, Calendar, Target, Activity, HandCoins, Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { casesApi } from '@/lib/api/casesApi';
import { CaseActivity, PromiseToPay, CreateActivityRequest, CreatePtpRequest } from '@/types/cases';
import { ActionLogger } from '@/components/case/ActionLogger';
import { toast } from 'sonner';
import { format, isAfter, differenceInDays } from 'date-fns';

interface CaseActivitiesTabProps {
  caseId: string;
  onUpdate?: () => void;
}

const activityTypeConfig = {
  Call: { label: 'Phone Call', icon: Phone, color: 'bg-blue-100 text-blue-800' },
  SMS: { label: 'SMS', icon: Phone, color: 'bg-green-100 text-green-800' },
  Email: { label: 'Email', icon: Mail, color: 'bg-purple-100 text-purple-800' },
  Visit: { label: 'Site Visit', icon: User, color: 'bg-orange-100 text-orange-800' },
  Verification: { label: 'Verification', icon: CheckCircle, color: 'bg-teal-100 text-teal-800' },
  Dispute: { label: 'Dispute', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
  PTP: { label: 'Promise to Pay', icon: HandCoins, color: 'bg-emerald-100 text-emerald-800' },
  Other: { label: 'Other', icon: Activity, color: 'bg-gray-100 text-gray-800' }
};

const outcomeConfig = {
  Reached: { label: 'Contact Made', color: 'bg-green-100 text-green-800' },
  NoAnswer: { label: 'No Answer', color: 'bg-yellow-100 text-yellow-800' },
  WrongNumber: { label: 'Wrong Number', color: 'bg-red-100 text-red-800' },
  Paid: { label: 'Payment Made', color: 'bg-emerald-100 text-emerald-800' },
  Promise: { label: 'Promise to Pay', color: 'bg-blue-100 text-blue-800' },
  BrokenPromise: { label: 'Broken Promise', color: 'bg-red-100 text-red-800' },
  DisputeOpen: { label: 'Dispute Opened', color: 'bg-orange-100 text-orange-800' },
  DisputeClosed: { label: 'Dispute Resolved', color: 'bg-green-100 text-green-800' },
  Other: { label: 'Other', color: 'bg-gray-100 text-gray-800' }
};

export function CaseActivitiesTab({ caseId, onUpdate }: CaseActivitiesTabProps) {
  const [activities, setActivities] = useState<CaseActivity[]>([]);
  const [ptps, setPtps] = useState<PromiseToPay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showPtpDialog, setShowPtpDialog] = useState(false);
  
  // Form states
  const [activityForm, setActivityForm] = useState<CreateActivityRequest>({
    Type: 'Call',
    Outcome: undefined,
    Note: '',
    DueAt: undefined
  });
  
  const [ptpForm, setPtpForm] = useState<CreatePtpRequest>({
    PromisedAmount: 0,
    DueDate: ''
  });

  useEffect(() => {
    loadActivities();
  }, [caseId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const activitiesData = await casesApi.getCaseActivities(caseId);
      setActivities(activitiesData);
      
      // Load PTPs (would be separate endpoint in real API)
      const mockPtps: PromiseToPay[] = [
        {
          PtpId: `ptp_${caseId}_1`,
          CaseId: caseId,
          PromisedAmount: 2500,
          DueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          Status: 'Open',
          CreatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setPtps(mockPtps);
    } catch (error) {
      console.error('Failed to load activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async () => {
    if (!activityForm.Note?.trim()) {
      toast.error('Please provide activity notes');
      return;
    }

    try {
      const activity = await casesApi.createActivity(caseId, activityForm);
      setActivities(prev => [activity, ...prev]);
      setShowActivityDialog(false);
      setActivityForm({
        Type: 'Call',
        Outcome: undefined,
        Note: '',
        DueAt: undefined
      });
      toast.success('Activity logged successfully');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to create activity');
    }
  };

  const handleCreatePtp = async () => {
    if (!ptpForm.PromisedAmount || !ptpForm.DueDate) {
      toast.error('Please fill in all PTP fields');
      return;
    }

    try {
      const ptp = await casesApi.createPtp(caseId, ptpForm);
      setPtps(prev => [ptp, ...prev]);
      setShowPtpDialog(false);
      setPtpForm({ PromisedAmount: 0, DueDate: '' });
      toast.success('Promise to Pay created');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to create Promise to Pay');
    }
  };

  const handleClosePtp = async (ptpId: string, status: 'Kept' | 'Broken') => {
    try {
      await casesApi.closePtp(caseId, ptpId, { Status: status });
      setPtps(prev => prev.map(p => 
        p.PtpId === ptpId 
          ? { ...p, Status: status, ClosedAt: new Date().toISOString() }
          : p
      ));
      toast.success(`Promise to Pay marked as ${status.toLowerCase()}`);
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update Promise to Pay');
    }
  };

  const getOverdueActivities = () => {
    return activities.filter(a => 
      a.DueAt && isAfter(new Date(), new Date(a.DueAt))
    );
  };

  const getUpcomingActivities = () => {
    return activities.filter(a => 
      a.DueAt && !isAfter(new Date(), new Date(a.DueAt))
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading activities...</p>
        </CardContent>
      </Card>
    );
  }

  const overdueActivities = getOverdueActivities();
  const upcomingActivities = getUpcomingActivities();

  return (
    <div className="space-y-6">
      {/* SLA Alerts */}
      {(overdueActivities.length > 0 || upcomingActivities.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueActivities.length > 0 && (
            <Card className="border-destructive">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-destructive">Overdue Activities</span>
                  <Badge variant="destructive">{overdueActivities.length}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {overdueActivities.length} activities are past their due date
                </p>
              </CardContent>
            </Card>
          )}
          
          {upcomingActivities.length > 0 && (
            <Card className="border-warning">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="font-medium text-warning">Upcoming Activities</span>
                  <Badge variant="outline" className="border-warning text-warning">{upcomingActivities.length}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {upcomingActivities.length} activities due soon
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <ActionLogger caseId={caseId} onActionLogged={onUpdate} />
        
        <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Simple Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Activity Type</Label>
                  <Select value={activityForm.Type} onValueChange={(value: any) => setActivityForm(prev => ({ ...prev, Type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(activityTypeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Outcome</Label>
                  <Select value={activityForm.Outcome || ''} onValueChange={(value: any) => setActivityForm(prev => ({ ...prev, Outcome: value || undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(outcomeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={activityForm.Note || ''}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, Note: e.target.value }))}
                  placeholder="Describe the activity..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Due Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={activityForm.DueAt ? new Date(activityForm.DueAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, DueAt: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActivityDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateActivity}>
                Log Activity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showPtpDialog} onOpenChange={setShowPtpDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <HandCoins className="h-4 w-4 mr-2" />
              Create PTP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Promise to Pay</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Promised Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={ptpForm.PromisedAmount || ''}
                  onChange={(e) => setPtpForm(prev => ({ ...prev, PromisedAmount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={ptpForm.DueDate ? new Date(ptpForm.DueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setPtpForm(prev => ({ ...prev, DueDate: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPtpDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePtp}>
                Create PTP
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Promises to Pay */}
      {ptps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="h-5 w-5" />
              Promises to Pay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ptps.map((ptp) => {
                const isOverdue = isAfter(new Date(), new Date(ptp.DueDate));
                const daysUntilDue = differenceInDays(new Date(ptp.DueDate), new Date());
                
                return (
                  <div key={ptp.PtpId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">€{ptp.PromisedAmount.toLocaleString()}</span>
                        <Badge className={
                          ptp.Status === 'Open' ? (isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800') :
                          ptp.Status === 'Kept' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {ptp.Status}
                        </Badge>
                        {isOverdue && ptp.Status === 'Open' && (
                          <Badge variant="destructive">
                            {Math.abs(daysUntilDue)} days overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Due: {format(new Date(ptp.DueDate), 'MMM dd, yyyy')}
                        {!isOverdue && ptp.Status === 'Open' && ` (${daysUntilDue} days)`}
                      </p>
                    </div>
                    
                    {ptp.Status === 'Open' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleClosePtp(ptp.PtpId, 'Kept')}>
                          Mark Kept
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleClosePtp(ptp.PtpId, 'Broken')}>
                          Mark Broken
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activities ({activities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activities logged yet</p>
              <p className="text-sm">Start by logging your first activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const ActivityIcon = activityTypeConfig[activity.Type].icon;
                const isOverdue = activity.DueAt && isAfter(new Date(), new Date(activity.DueAt));
                
                return (
                  <div key={activity.ActivityId} className="flex gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ActivityIcon className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={activityTypeConfig[activity.Type].color}>
                          {activityTypeConfig[activity.Type].label}
                        </Badge>
                        {activity.Outcome && (
                          <Badge className={outcomeConfig[activity.Outcome].color}>
                            {outcomeConfig[activity.Outcome].label}
                          </Badge>
                        )}
                        {activity.DueAt && (
                          <Badge variant={isOverdue ? 'destructive' : 'outline'}>
                            <Clock className="h-3 w-3 mr-1" />
                            {isOverdue ? 'Overdue' : 'Due'} {format(new Date(activity.DueAt), 'MMM dd')}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm mb-2">{activity.Note}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created {format(new Date(activity.CreatedAt), 'MMM dd, yyyy HH:mm')}</span>
                        {activity.CreatedBy && (
                          <span>by {activity.CreatedBy}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}