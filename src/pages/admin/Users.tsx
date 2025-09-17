// Professional User Management System for B2B Debt Collection Platform
// Complete enterprise-grade user administration with advanced features

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Users as UsersIcon,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Key,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Building,
  Download,
  Upload,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Copy,
  RefreshCw,
  Settings,
  FileText,
  Database,
  Activity,
  ChevronDown,
  ChevronUp,
  ArrowUpDown
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

import { useAuth } from '@/components/auth/AuthProvider';
import { mockUsers } from '@/lib/mockData';
import type { User, UserRole } from '@/types';

const roleConfig = {
  CLIENT: {
    label: 'Client',
    description: 'Access to own cases and invoices',
    color: 'blue',
    permissions: ['view_cases', 'create_cases', 'view_invoices', 'view_communications']
  },
  AGENT: {
    label: 'Collection Agent',
    description: 'Manage assigned cases and activities',
    color: 'green',
    permissions: ['view_cases', 'update_cases', 'log_activities', 'send_messages', 'create_approvals']
  },
  ADMIN: {
    label: 'Administrator',
    description: 'Full system access and management',
    color: 'red',
    permissions: ['full_access', 'user_management', 'system_configuration', 'approve_escalations']
  },
  DPO: {
    label: 'Data Protection Officer',
    description: 'GDPR compliance and data privacy management',
    color: 'purple',
    permissions: ['view_all_data', 'gdpr_requests', 'data_erasure', 'retention_policy', 'audit_access']
  }
};

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  clientId?: string;
  department?: string;
  phone?: string;
  jobTitle?: string;
  isActive: boolean;
  sendInvitation: boolean;
  permissions?: string[];
}

interface UserAuditLog {
  id: string;
  userId: string;
  action: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
}

type SortField = 'name' | 'email' | 'role' | 'createdAt' | 'lastLoginAt' | 'isActive';
type SortOrder = 'asc' | 'desc';

export default function Users() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDialog, setBulkDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Enhanced form state
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'CLIENT',
    clientId: '',
    department: '',
    phone: '',
    jobTitle: '',
    isActive: true,
    sendInvitation: true,
    permissions: []
  });
  
  // Filters and sorting
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Bulk actions
  const [bulkAction, setBulkAction] = useState('');
  const [bulkTargetRole, setBulkTargetRole] = useState<UserRole>('CLIENT');
  
  // Audit logs
  const [auditLogs, setAuditLogs] = useState<UserAuditLog[]>([]);

  // Load users data with enhanced properties
  useEffect(() => {
    const enhancedUsers = mockUsers.map(user => ({
      ...user,
      isActive: user.isActive ?? Math.random() > 0.1, // 90% active users
      department: user.department || ['Finance', 'Collections', 'Legal', 'Operations', 'IT'][Math.floor(Math.random() * 5)],
      phone: user.phone || `+44 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      permissions: roleConfig[user.role].permissions,
      lastLoginAt: user.lastLoginAt || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));
    setUsers(enhancedUsers);
    
    // Generate mock audit logs
    generateMockAuditLogs(enhancedUsers);
  }, []);

  const generateMockAuditLogs = (userList: User[]) => {
    const actions = ['created', 'updated', 'activated', 'deactivated', 'role_changed', 'password_reset'];
    const logs: UserAuditLog[] = [];
    
    userList.forEach(user => {
      for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        logs.push({
          id: `audit_${user.id}_${i}`,
          userId: user.id,
          action: actions[Math.floor(Math.random() * actions.length)],
          performedBy: currentUser?.id || 'admin_1',
          performedByName: currentUser?.name || 'System Admin',
          timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          details: `User ${user.name} was ${actions[Math.floor(Math.random() * actions.length)]}`,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
        });
      }
    });
    
    setAuditLogs(logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  // Enhanced filtering and sorting
  useEffect(() => {
    let filtered = [...users];

    // Apply filters
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(user => user.department === departmentFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.department && user.department.toLowerCase().includes(query)) ||
        (user.phone && user.phone.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'lastLoginAt':
          aValue = new Date(a.lastLoginAt || 0);
          bValue = new Date(b.lastLoginAt || 0);
          break;
        case 'isActive':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [users, roleFilter, statusFilter, departmentFilter, searchQuery, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setFormData({
      name: '',
      email: '',
      role: 'CLIENT',
      clientId: '',
      department: '',
      phone: '',
      jobTitle: '',
      isActive: true,
      sendInvitation: true,
      permissions: roleConfig.CLIENT.permissions
    });
    setShowUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      clientId: user.clientId || '',
      department: user.department || '',
      phone: user.phone || '',
      jobTitle: user.department || '', // Using department as job title for now
      isActive: user.isActive || true,
      sendInvitation: false,
      permissions: user.permissions || roleConfig[user.role].permissions
    });
    setShowUserDialog(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: 'Invalid Input',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const userData = {
        ...formData,
        id: selectedUser?.id || `user_${Date.now()}`,
        createdAt: selectedUser?.createdAt || new Date().toISOString(),
        lastLoginAt: selectedUser?.lastLoginAt,
        updatedAt: new Date().toISOString(),
        ...(formData.role !== 'CLIENT' && { clientId: undefined })
      };

      if (isEditing) {
        setUsers(users.map(user => 
          user.id === selectedUser?.id 
            ? { ...user, ...userData }
            : user
        ));
        
        // Add audit log
        addAuditLog(userData.id, 'updated', `User profile updated`);
        
        toast({
          title: 'User Updated',
          description: `${userData.name} has been updated successfully.`
        });
      } else {
        setUsers([userData as User, ...users]);
        
        // Add audit log
        addAuditLog(userData.id, 'created', `User account created${formData.sendInvitation ? ' and invitation sent' : ''}`);
        
        if (formData.sendInvitation) {
          // Simulate sending invitation
          setTimeout(() => {
            toast({
              title: 'Invitation Sent',
              description: `Invitation email sent to ${userData.email}`
            });
          }, 1000);
        }
        
        toast({
          title: 'User Created',
          description: `${userData.name} has been created successfully.`
        });
      }

      setShowUserDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save user. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      if (selectedUser.id === currentUser?.id) {
        toast({
          title: 'Cannot Delete',
          description: 'You cannot delete your own account.',
          variant: 'destructive'
        });
        return;
      }

      setUsers(users.filter(user => user.id !== selectedUser.id));
      setSelectedUsers(prev => prev.filter(id => id !== selectedUser.id));
      setShowDeleteConfirm(false);
      
      // Add audit log
      addAuditLog(selectedUser.id, 'deleted', `User account permanently deleted`);
      
      toast({
        title: 'User Deleted',
        description: `${selectedUser.name} has been permanently deleted.`
      });
    }
  };

  const handleToggleUserStatus = (user: User) => {
    const newStatus = !user.isActive;
    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, isActive: newStatus, updatedAt: new Date().toISOString() }
        : u
    ));
    
    // Add audit log
    addAuditLog(user.id, newStatus ? 'activated' : 'deactivated', `User account ${newStatus ? 'activated' : 'deactivated'}`);
    
    toast({
      title: `User ${newStatus ? 'Activated' : 'Deactivated'}`,
      description: `${user.name} has been ${newStatus ? 'activated' : 'deactivated'}.`
    });
  };

  const handleResetPassword = (user: User) => {
    // Add audit log
    addAuditLog(user.id, 'password_reset', `Password reset initiated`);
    
    toast({
      title: 'Password Reset',
      description: `Password reset email sent to ${user.email}.`
    });
  };

  const handleSendInvitation = (user: User) => {
    // Add audit log
    addAuditLog(user.id, 'invitation_sent', `Account invitation resent`);
    
    toast({
      title: 'Invitation Sent',
      description: `Account invitation sent to ${user.email}.`
    });
  };

  const handleImpersonateUser = (user: User) => {
    if (user.id === currentUser?.id) {
      toast({
        title: 'Cannot Impersonate',
        description: 'You cannot impersonate yourself.',
        variant: 'destructive'
      });
      return;
    }

    // Add audit log
    addAuditLog(user.id, 'impersonated', `User session impersonated by admin`);
    
    toast({
      title: 'Impersonation Started',
      description: `You are now viewing the system as ${user.name}. Use caution.`,
      variant: 'destructive'
    });
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select users first.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      switch (bulkAction) {
        case 'activate':
          setUsers(users.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, isActive: true, updatedAt: new Date().toISOString() }
              : user
          ));
          selectedUsers.forEach(userId => 
            addAuditLog(userId, 'bulk_activated', `Bulk activation applied`)
          );
          break;
          
        case 'deactivate':
          setUsers(users.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, isActive: false, updatedAt: new Date().toISOString() }
              : user
          ));
          selectedUsers.forEach(userId => 
            addAuditLog(userId, 'bulk_deactivated', `Bulk deactivation applied`)
          );
          break;
          
        case 'change_role':
          setUsers(users.map(user => 
            selectedUsers.includes(user.id) 
              ? { 
                  ...user, 
                  role: bulkTargetRole, 
                  permissions: roleConfig[bulkTargetRole].permissions,
                  updatedAt: new Date().toISOString(),
                  ...(bulkTargetRole !== 'CLIENT' && { clientId: undefined })
                }
              : user
          ));
          selectedUsers.forEach(userId => 
            addAuditLog(userId, 'bulk_role_change', `Role changed to ${bulkTargetRole}`)
          );
          break;
          
        case 'send_invitations':
          selectedUsers.forEach(userId => 
            addAuditLog(userId, 'bulk_invitation', `Invitation sent via bulk action`)
          );
          break;
          
        case 'reset_passwords':
          selectedUsers.forEach(userId => 
            addAuditLog(userId, 'bulk_password_reset', `Password reset via bulk action`)
          );
          break;
      }

      toast({
        title: 'Bulk Action Completed',
        description: `${bulkAction.replace('_', ' ')} applied to ${selectedUsers.length} users.`
      });
      
      setSelectedUsers([]);
      setBulkDialog(false);
    } catch (error) {
      toast({
        title: 'Bulk Action Failed',
        description: 'Some operations may have failed. Please check individual users.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addAuditLog = (userId: string, action: string, details: string) => {
    const newLog: UserAuditLog = {
      id: `audit_${Date.now()}_${Math.random()}`,
      userId,
      action,
      performedBy: currentUser?.id || 'system',
      performedByName: currentUser?.name || 'System',
      timestamp: new Date().toISOString(),
      details,
      ipAddress: '192.168.1.100' // Mock IP
    };
    
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(u => u.id));
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Department', 'Phone', 'Status', 'Last Login', 'Created'].join(','),
      ...filteredUsers.map(user => [
        `"${user.name}"`,
        user.email,
        user.role,
        `"${user.department || ''}"`,
        user.phone || '',
        user.isActive ? 'Active' : 'Inactive',
        user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never',
        new Date(user.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Complete',
      description: 'User data exported to CSV file.'
    });
  };

  // Get unique departments for filter
  const departments = [...new Set(users.map(u => u.department).filter(Boolean))];

  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    clients: users.filter(u => u.role === 'CLIENT').length,
    agents: users.filter(u => u.role === 'AGENT').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    dpos: users.filter(u => u.role === 'DPO').length,
    recentLogins: users.filter(u => {
      if (!u.lastLoginAt) return false;
      const daysSinceLogin = (Date.now() - new Date(u.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin <= 7;
    }).length
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Comprehensive user administration with role-based access control
          </p>
        </div>
        
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <Button variant="outline" onClick={() => setBulkDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Bulk Actions ({selectedUsers.length})
            </Button>
          )}
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => setShowInviteDialog(true)}>
            <Send className="h-4 w-4 mr-2" />
            Bulk Invite
          </Button>
          <Button onClick={handleCreateUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <UsersIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                <UserCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-lg font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-500/10 rounded-lg">
                <UserX className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Inactive</p>
                <p className="text-lg font-bold">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <Building className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Clients</p>
                <p className="text-lg font-bold">{stats.clients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-500/10 rounded-lg">
                <UserCheck className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Agents</p>
                <p className="text-lg font-bold">{stats.agents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-500/10 rounded-lg">
                <Shield className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Admins</p>
                <p className="text-lg font-bold">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/10 rounded-lg">
                <Shield className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">DPOs</p>
                <p className="text-lg font-bold">{stats.dpos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-500/10 rounded-lg">
                <Activity className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Recent</p>
                <p className="text-lg font-bold">{stats.recentLogins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Search */}
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="CLIENT">Client</SelectItem>
                <SelectItem value="AGENT">Agent</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="DPO">DPO</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || departmentFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setDepartmentFilter('all');
                }}
              >
                Clear Filters
              </Button>
              <span className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {users.length} users
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Users Table */}
      <Card className="card-professional">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <div className="flex items-center gap-2">
              {selectedUsers.length > 0 && (
                <Badge variant="outline">
                  {selectedUsers.length} selected
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowAuditDialog(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Audit Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    User
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-2">
                    Role
                    {getSortIcon('role')}
                  </div>
                </TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('isActive')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {getSortIcon('isActive')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('lastLoginAt')}
                >
                  <div className="flex items-center gap-2">
                    Last Login
                    {getSortIcon('lastLoginAt')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Created
                    {getSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} className={selectedUsers.includes(user.id) ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleUserSelection(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <UsersIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.clientId && (
                            <p className="text-xs text-muted-foreground">Client: {user.clientId}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`
                          ${user.role === 'CLIENT' ? 'border-blue-500 text-blue-500' : ''}
                          ${user.role === 'AGENT' ? 'border-green-500 text-green-500' : ''}
                          ${user.role === 'ADMIN' ? 'border-red-500 text-red-500' : ''}
                          ${user.role === 'DPO' ? 'border-purple-500 text-purple-500' : ''}
                        `}
                      >
                        {roleConfig[user.role].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user.department || 'Not specified'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.phone && (
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-sm">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt ? (
                        <div>
                          <span className="text-sm">
                            {format(new Date(user.lastLoginAt), 'MMM dd, yyyy')}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(user.lastLoginAt), 'HH:mm')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendInvitation(user)}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Invitation
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                            <Key className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                            {user.isActive ? (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Deactivate User
                              </>
                            ) : (
                              <>
                                <Unlock className="h-4 w-4 mr-2" />
                                Activate User
                              </>
                            )}
                          </DropdownMenuItem>
                          {user.id !== currentUser?.id && (
                            <DropdownMenuItem onClick={() => handleImpersonateUser(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Impersonate User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedUser(user);
                              setShowAuditDialog(true);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Audit Log
                          </DropdownMenuItem>
                          {user.id !== currentUser?.id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteConfirm(true);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit User Account' : 'Create New User Account'}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update user information, role, and permissions.' 
                : 'Create a new user account and optionally send an invitation email.'
              }
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+44 20 7123 4567"
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="Enter job title"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Collections">Collections</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="role" className="space-y-4">
              <div>
                <Label htmlFor="role">User Role *</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => {
                  setFormData({ 
                    ...formData, 
                    role: value,
                    permissions: roleConfig[value].permissions,
                    ...(value !== 'CLIENT' && { clientId: '' })
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`border-${config.color}-500 text-${config.color}-500`}>
                            {config.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {roleConfig[formData.role].description}
                </p>
              </div>
              
              {formData.role === 'CLIENT' && (
                <div>
                  <Label htmlFor="clientId">Client Organization ID</Label>
                  <Input
                    id="clientId"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    placeholder="Enter client identifier"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Associates this user with a specific client organization
                  </p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Role Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roleConfig[formData.role].permissions.map((permission) => (
                    <div key={permission} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm capitalize">{permission.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Account Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Control whether this user can access the system
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
                
                {!isEditing && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Send Invitation Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Send setup instructions to the user's email
                      </p>
                    </div>
                    <Switch
                      checked={formData.sendInvitation}
                      onCheckedChange={(checked) => setFormData({ ...formData, sendInvitation: checked })}
                    />
                  </div>
                )}
                
                <Separator />
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Password Policy:</span>
                      <span className="text-muted-foreground">Minimum 8 characters, mixed case</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Session Timeout:</span>
                      <span className="text-muted-foreground">8 hours of inactivity</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MFA Required:</span>
                      <span className="text-muted-foreground">
                        {formData.role === 'ADMIN' ? 'Yes' : 'Optional'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUserDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isEditing ? 'Update User' : 'Create User'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setBulkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Apply actions to {selectedUsers.length} selected users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Select Action</Label>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate Users</SelectItem>
                  <SelectItem value="deactivate">Deactivate Users</SelectItem>
                  <SelectItem value="change_role">Change Role</SelectItem>
                  <SelectItem value="send_invitations">Send Invitations</SelectItem>
                  <SelectItem value="reset_passwords">Reset Passwords</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {bulkAction === 'change_role' && (
              <div>
                <Label>Target Role</Label>
                <Select value={bulkTargetRole} onValueChange={(value: UserRole) => setBulkTargetRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Client</SelectItem>
                    <SelectItem value="AGENT">Agent</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="DPO">DPO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setBulkDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAction}
              disabled={loading || !bulkAction}
            >
              {loading ? 'Processing...' : 'Apply Action'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Logs Dialog */}
      <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>User Audit Logs</DialogTitle>
            <DialogDescription>
              {selectedUser 
                ? `Audit trail for ${selectedUser.name}` 
                : 'Complete user management audit trail'
              }
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {auditLogs
                .filter(log => !selectedUser || log.userId === selectedUser.id)
                .map((log) => (
                  <div key={log.id} className="flex gap-4 p-3 border rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="capitalize">
                          {log.action.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm font-medium">{log.performedByName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{log.details}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Bulk Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk User Invitation</DialogTitle>
            <DialogDescription>
              Send invitations to multiple users at once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Email Addresses</Label>
              <Textarea
                placeholder="Enter email addresses, one per line or comma-separated"
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Each user will receive an invitation to set up their account
              </p>
            </div>
            
            <div>
              <Label>Default Role</Label>
              <Select defaultValue="CLIENT">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="AGENT">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send Invitations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to permanently delete <strong>{selectedUser?.name}</strong>?
              </p>
              <div className="bg-destructive/10 p-3 rounded-lg">
                <p className="text-sm font-medium text-destructive mb-1">This action will:</p>
                <ul className="text-sm text-destructive space-y-1">
                  <li>• Permanently delete the user account</li>
                  <li>• Remove all associated permissions</li>
                  <li>• Invalidate all active sessions</li>
                  <li>• Create an audit trail entry</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. Consider deactivating the user instead if you might need to restore access later.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}