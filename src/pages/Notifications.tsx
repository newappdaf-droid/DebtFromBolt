// Professional Notifications Management Page for B2B Debt Collection Platform
// Complete notification center with filtering, marking as read, and action handling

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  CreditCard, 
  Search, 
  Filter,
  MarkAsRead,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  Building,
  Scale,
  Shield,
  MessageSquare,
  ExternalLink,
  Settings,
  Download
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/components/auth/AuthProvider';
import { Notification, NotificationType } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Extended mock notifications for the notifications page
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'case_update',
    title: 'Case Status Updated',
    message: 'Case #12345 has moved to Legal Stage',
    relatedEntityId: '12345',
    relatedEntityType: 'case',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    actionUrl: '/cases/550e8400-e29b-41d4-a716-446655440001',
  },
  {
    id: '2',
    type: 'approval_required',
    title: 'Approval Required',
    message: 'Legal escalation approval needed for Case #12346',
    relatedEntityId: '2',
    relatedEntityType: 'approval',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actionUrl: '/approvals',
  },
  {
    id: '3',
    type: 'payment_due',
    title: 'Invoice Overdue',
    message: 'Invoice #INV-2024-001 is now overdue',
    relatedEntityId: '1',
    relatedEntityType: 'invoice',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    actionUrl: '/invoices',
  },
  {
    id: '4',
    type: 'document_uploaded',
    title: 'Document Uploaded',
    message: 'New document uploaded to Case #12347',
    relatedEntityId: '12347',
    relatedEntityType: 'case',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    actionUrl: '/cases/550e8400-e29b-41d4-a716-446655440002',
  },
  {
    id: '5',
    type: 'case_update',
    title: 'Payment Received',
    message: 'Payment of £2,500 received for Case #12348',
    relatedEntityId: '12348',
    relatedEntityType: 'case',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    actionUrl: '/cases/550e8400-e29b-41d4-a716-446655440003',
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: '6',
    type: 'approval_required',
    title: 'Settlement Approval Required',
    message: 'Settlement agreement needs approval for Case #12349',
    relatedEntityId: '3',
    relatedEntityType: 'approval',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    actionUrl: '/approvals',
  },
  {
    id: '7',
    type: 'case_update',
    title: 'Case Assigned',
    message: 'Case #12350 has been assigned to you',
    relatedEntityId: '12350',
    relatedEntityType: 'case',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    actionUrl: '/cases/550e8400-e29b-41d4-a716-446655440004',
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
  },
  {
    id: '8',
    type: 'payment_due',
    title: 'Payment Reminder',
    message: 'Invoice #INV-2024-002 due in 3 days',
    relatedEntityId: '2',
    relatedEntityType: 'invoice',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    actionUrl: '/invoices',
  },
  {
    id: '9',
    type: 'document_uploaded',
    title: 'GDPR Request Document',
    message: 'Compliance certificate generated for GDPR request',
    relatedEntityId: 'gdpr_001',
    relatedEntityType: 'gdpr_request',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    actionUrl: '/gdpr-requests',
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 118).toISOString(),
  },
  {
    id: '10',
    type: 'case_update',
    title: 'Case Closed Successfully',
    message: 'Case #12351 has been closed with full recovery',
    relatedEntityId: '12351',
    relatedEntityType: 'case',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
    actionUrl: '/cases/550e8400-e29b-41d4-a716-446655440005',
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 160).toISOString(),
  }
];

const notificationIcons: Record<NotificationType, React.ElementType> = {
  case_update: FileText,
  approval_required: AlertCircle,
  document_uploaded: FileText,
  payment_due: CreditCard,
};

const notificationColors: Record<NotificationType, string> = {
  case_update: 'text-info',
  approval_required: 'text-warning',
  document_uploaded: 'text-accent',
  payment_due: 'text-destructive',
};

export default function Notifications() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Apply filters
  useEffect(() => {
    let filtered = [...notifications];

    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      const isRead = statusFilter === 'read';
      filtered = filtered.filter(notification => !!notification.readAt === isRead);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredNotifications(filtered);
  }, [notifications, typeFilter, statusFilter, searchQuery]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate to the related page
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, readAt: new Date().toISOString() }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    const now = new Date().toISOString();
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, readAt: now }))
    );
    
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    toast.success('Notification deleted');
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
    toast.success(`${selectedNotifications.length} notifications deleted`);
  };

  const markSelectedAsRead = () => {
    const now = new Date().toISOString();
    setNotifications(prev =>
      prev.map(notification =>
        selectedNotifications.includes(notification.id)
          ? { ...notification, readAt: now }
          : notification
      )
    );
    setSelectedNotifications([]);
    toast.success(`${selectedNotifications.length} notifications marked as read`);
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  // Calculate statistics
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.readAt).length,
    caseUpdates: notifications.filter(n => n.type === 'case_update').length,
    approvals: notifications.filter(n => n.type === 'approval_required').length,
    payments: notifications.filter(n => n.type === 'payment_due').length,
    documents: notifications.filter(n => n.type === 'document_uploaded').length,
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with important platform activities
          </p>
        </div>
        
        <div className="flex gap-2">
          {selectedNotifications.length > 0 && (
            <>
              <Button variant="outline" onClick={markSelectedAsRead}>
                <Eye className="h-4 w-4 mr-2" />
                Mark Read ({selectedNotifications.length})
              </Button>
              <Button variant="outline" onClick={deleteSelected}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedNotifications.length})
              </Button>
            </>
          )}
          {stats.unread > 0 && (
            <Button onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cases</p>
                <p className="text-2xl font-bold">{stats.caseUpdates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Scale className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approvals</p>
                <p className="text-2xl font-bold">{stats.approvals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payments</p>
                <p className="text-2xl font-bold">{stats.payments}</p>
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
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="case_update">Case Updates</SelectItem>
                  <SelectItem value="approval_required">Approvals</SelectItem>
                  <SelectItem value="payment_due">Payments</SelectItem>
                  <SelectItem value="document_uploaded">Documents</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredNotifications.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Checkbox
                checked={selectedNotifications.length === filteredNotifications.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select all ({filteredNotifications.length})
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle>
            Notifications ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No notifications found</h3>
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more notifications.'
                  : 'You\'re all caught up! New notifications will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                const isUnread = !notification.readAt;
                const isSelected = selectedNotifications.includes(notification.id);
                
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-lg border transition-colors',
                      isUnread ? 'bg-primary/5 border-primary/20' : 'bg-background border-border',
                      'hover:bg-accent/50 cursor-pointer',
                      isSelected && 'ring-2 ring-primary/50'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleNotificationSelection(notification.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className={cn('mt-1', notificationColors[notification.type])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div 
                      className="flex-1 min-w-0"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            'font-medium truncate',
                            isUnread && 'text-foreground'
                          )}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isUnread && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {notification.type.replace('_', ' ')}
                          </Badge>
                          {notification.relatedEntityType && (
                            <Badge variant="secondary" className="text-xs">
                              {notification.relatedEntityType}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          {!isUnread ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Mark as unread
                                setNotifications(prev =>
                                  prev.map(n =>
                                    n.id === notification.id
                                      ? { ...n, readAt: undefined }
                                      : n
                                  )
                                );
                              }}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          {notification.actionUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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