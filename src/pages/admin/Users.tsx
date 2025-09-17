// Professional User Management Page for B2B Debt Collection Platform
// Complete enterprise-grade user administration with audit trails and bulk operations

import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  Users, Plus, Search, Filter, Download, MoreHorizontal, Edit, Trash2,
  UserPlus, Mail, Shield, Eye, Key, Clock, Building, Phone, MapPin,
  CheckCircle, XCircle, AlertTriangle, UserCheck, Settings, Archive,
  ChevronDown, ChevronUp, Calendar, Activity, Lock, Unlock, UserX,
  FileText, BarChart3, TrendingUp, Target, Award, Briefcase, Save
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, 
  DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

import { useAuth } from '@/components/auth/AuthProvider';
import { 
  usersApi, UserSummary, UserDetail, CreateUserRequest, UpdateUserRequest, 
  InviteUserRequest, BulkInviteRequest, BulkUserActionRequest, UserFilters,
  UserRole, UserStatus, AuditLogEntry
} from '@/lib/api/usersApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Role configuration for UI
const roleConfig = {
  CLIENT: { 
    label: 'Client', 
    color: 'bg-blue-100 text-blue-800', 
    icon: Building,
    description: 'Can create cases and view own data'
  },
  AGENT: { 
    label: 'Agent', 
    color: 'bg-green-100 text-green-800', 
    icon: UserCheck,
    description: 'Can manage assigned cases and activities'
  },
  ADMIN: { 
    label: 'Administrator', 
    color: 'bg-purple-100 text-purple-800', 
    icon: Shield,
    description: 'Full system access and user management'
  },
  DPO: { 
    label: 'Data Protection Officer', 
    color: 'bg-orange-100 text-orange-800', 
    icon: Lock,
    description: 'GDPR compliance and data protection oversight'
  }
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  locked: { label: 'Locked', color: 'bg-red-100 text-red-800', icon: Lock }
};

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function Users() {
  const { user: currentUser, hasRole } = useAuth();
  
  // State management
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination and filtering
  const [filters, setFilters] = useState<UserFilters>({
    Query: '',
    Role: undefined,
    Status: undefined,
    Department: undefined,
    Page: 1,
    Size: 25,
    SortBy: 'CreatedAt',
    SortOrder: 'desc'
  });
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBulkInviteDialog, setShowBulkInviteDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [showImpersonateDialog, setShowImpersonateDialog] = useState(false);
  
  // Form states
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    Email: '',
    Name: '',
    Role: 'AGENT',
    Department: '',
    Phone: '',
    JobTitle: '',
    ClientId: '',
    IsActive: true,
    SendInvitation: true,
    Permissions: []
  });
  
  const [editForm, setEditForm] = useState<UpdateUserRequest>({});
  const [bulkInviteText, setBulkInviteText] = useState('');
  const [impersonationReason, setImpersonationReason] = useState('');
  
  // Bulk operation states
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkActionData, setBulkActionData] = useState<any>({});
  const [bulkProgress, setBulkProgress] = useState(0);
  const [showBulkProgress, setShowBulkProgress] = useState(false);

  // Load users data
  useEffect(() => {
    loadUsers();
  }, [filters]);

  // Load audit log when dialog opens
  useEffect(() => {
    if (showAuditDialog) {
      loadAuditLog();
    }
  }, [showAuditDialog]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getUsers(filters);
      setUsers(response.Users);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLog = async () => {
    try {
      const response = await usersApi.getAuditLog({ Page: 1, Size: 100 });
      setAuditLog(response.Entries);
    } catch (err) {
      console.error('Failed to load audit log:', err);
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.Email || !createForm.Name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newUser = await usersApi.createUser(createForm);
      await loadUsers();
      setShowCreateDialog(false);
      resetCreateForm();
      toast.success(`User ${newUser.Name} created successfully`);
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      await usersApi.updateUser(selectedUser.UserId, editForm);
      await loadUsers();
      setShowEditDialog(false);
      setSelectedUser(null);
      setEditForm({});
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await usersApi.deleteUser(userId);
      await loadUsers();
      setSelectedUsers(prev => prev.filter(id => id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleBulkInvite = async () => {
    if (!bulkInviteText.trim()) {
      toast.error('Please enter email addresses');
      return;
    }

    const emails = bulkInviteText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const invitations: InviteUserRequest[] = emails.map(email => ({
      Email: email,
      Name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      Role: 'AGENT',
      Department: 'Collections'
    }));

    try {
      setShowBulkProgress(true);
      setBulkProgress(0);
      
      const response = await usersApi.bulkInviteUsers({ Invitations: invitations });
      
      setBulkProgress(100);
      setShowBulkInviteDialog(false);
      setBulkInviteText('');
      setShowBulkProgress(false);
      
      toast.success(`${response.SuccessfulInvitations} invitations sent successfully`);
      if (response.FailedInvitations > 0) {
        toast.error(`${response.FailedInvitations} invitations failed`);
      }
    } catch (error) {
      setShowBulkProgress(false);
      toast.error('Failed to send bulk invitations');
    }
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    if (!bulkAction) {
      toast.error('Please select an action');
      return;
    }

    try {
      setShowBulkProgress(true);
      setBulkProgress(0);

      const request: BulkUserActionRequest = {
        UserIds: selectedUsers,
        Action: bulkAction as any,
        ActionData: bulkActionData
      };

      const response = await usersApi.bulkUserActions(request);
      
      setBulkProgress(100);
      await loadUsers();
      setSelectedUsers([]);
      setBulkAction('');
      setBulkActionData({});
      setShowBulkProgress(false);
      
      toast.success(`${response.SuccessfulActions} users updated successfully`);
      if (response.FailedActions > 0) {
        toast.error(`${response.FailedActions} actions failed`);
      }
    } catch (error) {
      setShowBulkProgress(false);
      toast.error('Failed to perform bulk action');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await usersApi.resetUserPassword(userId);
      toast.success('Password reset email sent');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleImpersonate = async () => {
    if (!selectedUser || !impersonationReason.trim()) {
      toast.error('Please provide a reason for impersonation');
      return;
    }

    try {
      const response = await usersApi.impersonateUser(selectedUser.UserId, impersonationReason);
      setShowImpersonateDialog(false);
      setImpersonationReason('');
      toast.success(`Impersonating ${selectedUser.Name} for 1 hour`);
      // In real implementation, you would use the impersonation token
    } catch (error) {
      toast.error('Failed to start impersonation');
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      Email: '',
      Name: '',
      Role: 'AGENT',
      Department: '',
      Phone: '',
      JobTitle: '',
      ClientId: '',
      IsActive: true,
      SendInvitation: true,
      Permissions: []
    });
  };

  const openEditDialog = async (user: UserSummary) => {
    try {
      const userDetail = await usersApi.getUser(user.UserId);
      setSelectedUser(userDetail);
      setEditForm({
        Name: userDetail.Name,
        Role: userDetail.Role,
        Department: userDetail.Department,
        Phone: userDetail.Phone,
        JobTitle: userDetail.JobTitle,
        ClientId: userDetail.ClientId,
        IsActive: userDetail.IsActive,
        Permissions: userDetail.Permissions
      });
      setShowEditDialog(true);
    } catch (error) {
      toast.error('Failed to load user details');
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Department', 'Status', 'Last Login', 'Created'].join(','),
      ...users.map(u => [
        u.Name,
        u.Email,
        u.Role,
        u.Department || '',
        u.Status,
        u.LastLoginAt ? new Date(u.LastLoginAt).toLocaleDateString() : 'Never',
        new Date(u.CreatedAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (field: 'Name' | 'Email' | 'Role' | 'CreatedAt' | 'LastLoginAt') => {
    const newOrder = filters.SortBy === field && filters.SortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({ ...prev, SortBy: field, SortOrder: newOrder, Page: 1 }));
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.UserId));
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.Status === 'active').length;
    const pendingUsers = users.filter(u => u.Status === 'pending').length;
    const lockedUsers = users.filter(u => u.Status === 'locked').length;
    const clientUsers = users.filter(u => u.Role === 'CLIENT').length;
    const agentUsers = users.filter(u => u.Role === 'AGENT').length;
    const adminUsers = users.filter(u => u.Role === 'ADMIN').length;
    const dpoUsers = users.filter(u => u.Role === 'DPO').length;

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      lockedUsers,
      clientUsers,
      agentUsers,
      adminUsers,
      dpoUsers
    };
  }, [users]);

  // Check permissions
  if (!hasRole('ADMIN')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You need administrator privileges to access user management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, roles, and permissions across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedUsers.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Actions ({selectedUsers.length})
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setBulkAction('activate'); handleBulkAction(); }}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setBulkAction('deactivate'); handleBulkAction(); }}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Deactivate Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setBulkAction('reset_password'); handleBulkAction(); }}>
                  <Key className="h-4 w-4 mr-2" />
                  Reset Passwords
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => { setBulkAction('delete'); handleBulkAction(); }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button variant="outline" onClick={() => setShowBulkInviteDialog(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Bulk Invite
          </Button>
          
          <Button variant="outline" onClick={() => setShowAuditDialog(true)}>
            <Activity className="h-4 w-4 mr-2" />
            Audit Log
          </Button>
          
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Lock className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Locked</p>
                <p className="text-2xl font-bold">{stats.lockedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Building className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clients</p>
                <p className="text-2xl font-bold">{stats.clientUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agents</p>
                <p className="text-2xl font-bold">{stats.agentUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{stats.adminUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Lock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">DPOs</p>
                <p className="text-2xl font-bold">{stats.dpoUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={filters.Query || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, Query: e.target.value, Page: 1 }))}
                className="pl-10"
              />
            </div>

            <Select value={filters.Role || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, Role: value === 'all' ? undefined : value as UserRole, Page: 1 }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="CLIENT">Clients</SelectItem>
                <SelectItem value="AGENT">Agents</SelectItem>
                <SelectItem value="ADMIN">Administrators</SelectItem>
                <SelectItem value="DPO">Data Protection Officers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.Status || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, Status: value === 'all' ? undefined : value as UserStatus, Page: 1 }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.Department || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, Department: value === 'all' ? undefined : value, Page: 1 }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Collections">Collections</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Data Protection">Data Protection</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${filters.Size}`} onValueChange={(value) => setFilters(prev => ({ ...prev, Size: parseInt(value), Page: 1 }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map(size => (
                  <SelectItem key={size} value={`${size}`}>{size} per page</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ Page: 1, Size: 25, SortBy: 'CreatedAt', SortOrder: 'desc' })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="card-professional">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('Name')}
              >
                <div className="flex items-center gap-2">
                  Name
                  {filters.SortBy === 'Name' && (
                    filters.SortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('Email')}
              >
                <div className="flex items-center gap-2">
                  Email
                  {filters.SortBy === 'Email' && (
                    filters.SortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('Role')}
              >
                <div className="flex items-center gap-2">
                  Role
                  {filters.SortBy === 'Role' && (
                    filters.SortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('LastLoginAt')}
              >
                <div className="flex items-center gap-2">
                  Last Login
                  {filters.SortBy === 'LastLoginAt' && (
                    filters.SortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('CreatedAt')}
              >
                <div className="flex items-center gap-2">
                  Created
                  {filters.SortBy === 'CreatedAt' && (
                    filters.SortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="text-muted-foreground">Loading users...</div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="text-destructive">Failed to load users: {error}</div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {filters.Query || filters.Role || filters.Status
                        ? 'No users match your filters' 
                        : 'No users found'
                      }
                    </p>
                    {!filters.Query && !filters.Role && (
                      <Button onClick={() => setShowCreateDialog(true)} variant="outline" className="mt-2">
                        Create First User
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const RoleIcon = roleConfig[user.Role].icon;
                const StatusIcon = statusConfig[user.Status].icon;
                
                return (
                  <TableRow key={user.UserId} className="hover:bg-muted/30">
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.UserId)}
                        onCheckedChange={() => toggleUserSelection(user.UserId)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.Name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.Name}</p>
                          {user.ClientId && (
                            <p className="text-sm text-muted-foreground">Client: {user.ClientId}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-mono text-sm">{user.Email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleConfig[user.Role].color}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {roleConfig[user.Role].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user.Department || 'Not specified'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[user.Status].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[user.Status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {user.LastLoginAt 
                          ? format(new Date(user.LastLoginAt), 'MMM dd, yyyy')
                          : 'Never'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(user.CreatedAt), 'MMM dd, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user.UserId)}>
                            <Key className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedUser(user as UserDetail);
                              setShowImpersonateDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Impersonate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to permanently delete <strong>{user.Name}</strong>? 
                                  This action cannot be undone and will remove all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.UserId)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {users.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((filters.Page || 1) - 1) * (filters.Size || 25) + 1} to{' '}
            {Math.min((filters.Page || 1) * (filters.Size || 25), stats.totalUsers)} of{' '}
            {stats.totalUsers} users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, Page: Math.max(1, (prev.Page || 1) - 1) }))}
              disabled={(filters.Page || 1) === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {filters.Page || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, Page: (prev.Page || 1) + 1 }))}
              disabled={users.length < (filters.Size || 25)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the platform with appropriate role and permissions.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="role">Role & Permissions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={createForm.Name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, Name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.Email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, Email: e.target.value }))}
                    placeholder="john.doe@company.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={createForm.Phone || ''}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, Phone: e.target.value }))}
                    placeholder="+44 20 7123 4567"
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={createForm.JobTitle || ''}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, JobTitle: e.target.value }))}
                    placeholder="Collection Agent"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={createForm.Department || ''} onValueChange={(value) => setCreateForm(prev => ({ ...prev, Department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Collections">Collections</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Data Protection">Data Protection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="role" className="space-y-4">
              <div>
                <Label>User Role *</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {Object.entries(roleConfig).map(([role, config]) => {
                    const RoleIcon = config.icon;
                    return (
                      <div
                        key={role}
                        className={cn(
                          'p-4 border-2 rounded-lg cursor-pointer transition-all',
                          createForm.Role === role 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => setCreateForm(prev => ({ ...prev, Role: role as UserRole }))}
                      >
                        <div className="flex items-center gap-3">
                          <RoleIcon className="h-5 w-5" />
                          <div>
                            <p className="font-medium">{config.label}</p>
                            <p className="text-sm text-muted-foreground">{config.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {createForm.Role === 'CLIENT' && (
                <div>
                  <Label htmlFor="clientId">Client Organization</Label>
                  <Select value={createForm.ClientId || ''} onValueChange={(value) => setCreateForm(prev => ({ ...prev, ClientId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client_1">ACME Manufacturing Ltd</SelectItem>
                      <SelectItem value="client_2">Sterling Financial Services</SelectItem>
                      <SelectItem value="client_3">Nordic Enterprises</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Account Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Activate the account immediately or keep it inactive
                    </p>
                  </div>
                  <Switch
                    checked={createForm.IsActive}
                    onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, IsActive: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Send Invitation Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Send setup instructions to the user's email
                    </p>
                  </div>
                  <Switch
                    checked={createForm.SendInvitation}
                    onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, SendInvitation: checked }))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              {selectedUser && `Update ${selectedUser.Name}'s profile and permissions`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="role">Role & Permissions</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editName">Full Name</Label>
                    <Input
                      id="editName"
                      value={editForm.Name || selectedUser.Name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, Name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Email Address</Label>
                    <Input value={selectedUser.Email} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editPhone">Phone Number</Label>
                    <Input
                      id="editPhone"
                      value={editForm.Phone || selectedUser.Phone || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, Phone: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="editJobTitle">Job Title</Label>
                    <Input
                      id="editJobTitle"
                      value={editForm.JobTitle || selectedUser.JobTitle || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, JobTitle: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="editDepartment">Department</Label>
                  <Select 
                    value={editForm.Department || selectedUser.Department || ''} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, Department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Collections">Collections</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Data Protection">Data Protection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="role" className="space-y-4">
                <div>
                  <Label>User Role</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {Object.entries(roleConfig).map(([role, config]) => {
                      const RoleIcon = config.icon;
                      const isSelected = (editForm.Role || selectedUser.Role) === role;
                      return (
                        <div
                          key={role}
                          className={cn(
                            'p-4 border-2 rounded-lg cursor-pointer transition-all',
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          )}
                          onClick={() => setEditForm(prev => ({ ...prev, Role: role as UserRole }))}
                        >
                          <div className="flex items-center gap-3">
                            <RoleIcon className="h-5 w-5" />
                            <div>
                              <p className="font-medium">{config.label}</p>
                              <p className="text-sm text-muted-foreground">{config.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {(editForm.Role || selectedUser.Role) === 'CLIENT' && (
                  <div>
                    <Label htmlFor="editClientId">Client Organization</Label>
                    <Select 
                      value={editForm.ClientId || selectedUser.ClientId || ''} 
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, ClientId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client organization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client_1">ACME Manufacturing Ltd</SelectItem>
                        <SelectItem value="client_2">Sterling Financial Services</SelectItem>
                        <SelectItem value="client_3">Nordic Enterprises</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="security" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Account Active</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow user to access the platform
                      </p>
                    </div>
                    <Switch
                      checked={editForm.IsActive ?? selectedUser.IsActive}
                      onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, IsActive: checked }))}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Security Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Last Login:</span>
                        <p className="font-medium">
                          {selectedUser.LastLoginAt 
                            ? format(new Date(selectedUser.LastLoginAt), 'PPp')
                            : 'Never'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failed Attempts:</span>
                        <p className="font-medium">{selectedUser.FailedLoginAttempts}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Password Changed:</span>
                        <p className="font-medium">
                          {selectedUser.PasswordChangedAt 
                            ? format(new Date(selectedUser.PasswordChangedAt), 'PPp')
                            : 'Never'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last IP:</span>
                        <p className="font-medium font-mono">{selectedUser.LastLoginIp || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              <Save className="h-4 w-4 mr-2" />
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Invite Dialog */}
      <Dialog open={showBulkInviteDialog} onOpenChange={setShowBulkInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk User Invitations</DialogTitle>
            <DialogDescription>
              Send invitations to multiple users at once. Enter one email address per line.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulkEmails">Email Addresses</Label>
              <Textarea
                id="bulkEmails"
                value={bulkInviteText}
                onChange={(e) => setBulkInviteText(e.target.value)}
                placeholder="user1@company.com&#10;user2@company.com&#10;user3@company.com"
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                One email per line. Users will be created as Agents by default.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkInvite}>
              <Mail className="h-4 w-4 mr-2" />
              Send Invitations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>User Management Audit Log</DialogTitle>
            <DialogDescription>
              Complete audit trail of all user management activities
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {auditLog.map((entry) => (
                <div key={entry.AuditId} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {entry.Action.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{entry.UserEmail}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{entry.Details}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>By: {entry.PerformedByName}</span>
                      <span>{format(new Date(entry.Timestamp), 'MMM dd, yyyy HH:mm')}</span>
                      {entry.IpAddress && <span>IP: {entry.IpAddress}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Impersonation Dialog */}
      <Dialog open={showImpersonateDialog} onOpenChange={setShowImpersonateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Impersonate User</DialogTitle>
            <DialogDescription>
              {selectedUser && `Temporarily access the platform as ${selectedUser.Name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="font-medium text-warning">Security Warning</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Impersonation is logged and monitored. Only use for legitimate support purposes.
              </p>
            </div>
            
            <div>
              <Label htmlFor="impersonationReason">Reason for Impersonation *</Label>
              <Textarea
                id="impersonationReason"
                value={impersonationReason}
                onChange={(e) => setImpersonationReason(e.target.value)}
                placeholder="Describe why you need to impersonate this user..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImpersonateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImpersonate}
              disabled={!impersonationReason.trim()}
              className="bg-warning text-warning-foreground hover:bg-warning/90"
            >
              <Eye className="h-4 w-4 mr-2" />
              Start Impersonation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Progress Dialog */}
      <Dialog open={showBulkProgress} onOpenChange={setShowBulkProgress}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Processing Bulk Operation</DialogTitle>
            <DialogDescription>
              Please wait while we process your request...
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{bulkProgress}%</span>
            </div>
            <Progress value={bulkProgress} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}