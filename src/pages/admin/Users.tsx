// Professional User Management Page for B2B Debt Collection Platform
// Complete user administration with comprehensive properties and GDPR compliance

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Users, Plus, Edit, Trash2, Search, Filter, Eye, EyeOff,
  Shield, Mail, Phone, Globe, Clock, CheckCircle, XCircle,
  AlertTriangle, User, Building, Key, Smartphone, ExternalLink,
  UserCheck, Settings, Download, Upload, MoreHorizontal
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';

import { usersApi } from '@/lib/api/usersApi';
import { User, UserRole, UserStatus, UserSource, NotificationPrefs } from '@/types';

// Comprehensive user form schema
const userFormSchema = z.object({
  // Core (must-have)
  id: z.string().optional(),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  email_verified: z.boolean().default(false),
  status: z.enum(["ACTIVE", "PENDING_VERIFICATION", "DISABLED", "DELETED_SOFT"]).default("PENDING_VERIFICATION"),
  
  // Identity & profile
  name: z.string().min(1, "Name is required"),
  username: z.string().optional(),
  role: z.enum(["CLIENT", "AGENT", "ADMIN", "DPO"]).default("CLIENT"),
  phone: z.string().optional(),
  phone_verified: z.boolean().default(false),
  avatar_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  
  // Legacy fields
  department: z.string().optional(),
  
  // Locale & preferences
  locale: z.string().default("en-GB"),
  timezone: z.string().default("Europe/London"),
  notification_prefs: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
    in_app: z.boolean().default(true),
    sms: z.boolean().default(false),
  }).default({ email: true, push: false, in_app: true, sms: false }),
  marketing_opt_in: z.boolean().default(false),
  
  // Security & compliance (simplified for form)
  mfa_enabled: z.boolean().default(false),
  recovery_email: z.string().email("Invalid email address").optional().or(z.literal("")),
  
  // Lifecycle management
  source: z.enum(["signup", "invitation", "sso", "admin_created"]).default("admin_created"),
  
  // Integrations (simplified)
  groups: z.array(z.string()).default([]),
  tenant_id: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

const statusConfig = {
  ACTIVE: { 
    label: 'Active', 
    icon: CheckCircle, 
    variant: 'default' as const,
    description: 'User account is active and functional'
  },
  PENDING_VERIFICATION: { 
    label: 'Pending Verification', 
    icon: Clock, 
    variant: 'secondary' as const,
    description: 'User account awaiting email verification'
  },
  DISABLED: { 
    label: 'Disabled', 
    icon: XCircle, 
    variant: 'destructive' as const,
    description: 'User account is temporarily disabled'
  },
  DELETED_SOFT: { 
    label: 'Soft Deleted', 
    icon: AlertTriangle, 
    variant: 'outline' as const,
    description: 'User account is marked for deletion'
  }
};

const roleConfig = {
  CLIENT: { label: 'Client', variant: 'outline' as const, description: 'Business client user' },
  AGENT: { label: 'Agent', variant: 'default' as const, description: 'Collection agent' },
  ADMIN: { label: 'Admin', variant: 'destructive' as const, description: 'System administrator' },
  DPO: { label: 'DPO', variant: 'secondary' as const, description: 'Data Protection Officer' }
};

const sourceConfig = {
  signup: { label: 'Self Signup', icon: User },
  invitation: { label: 'Invitation', icon: Mail },
  sso: { label: 'SSO', icon: ExternalLink },
  admin_created: { label: 'Admin Created', icon: UserCheck }
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      email_verified: false,
      status: 'PENDING_VERIFICATION',
      name: '',
      username: '',
      role: 'CLIENT',
      phone: '',
      phone_verified: false,
      avatar_url: '',
      department: '',
      locale: 'en-GB',
      timezone: 'Europe/London',
      notification_prefs: {
        email: true,
        push: false,
        in_app: true,
        sms: false,
      },
      marketing_opt_in: false,
      mfa_enabled: false,
      recovery_email: '',
      source: 'admin_created',
      groups: [],
      tenant_id: '',
    },
  });

  // Load users data
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await usersApi.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...users];

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.username && user.username.toLowerCase().includes(query)) ||
        (user.department && user.department.toLowerCase().includes(query))
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredUsers(filtered);
  }, [users, roleFilter, statusFilter, searchQuery]);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    form.reset();
    setShowUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
    
    // Populate form with user data
    form.reset({
      id: user.id,
      email: user.email,
      email_verified: user.email_verified,
      status: user.status,
      name: user.name,
      username: user.username || '',
      role: user.role,
      phone: user.phone || '',
      phone_verified: user.phone_verified,
      avatar_url: user.avatar_url || '',
      department: user.department || '',
      locale: user.locale,
      timezone: user.timezone,
      notification_prefs: user.notification_prefs,
      marketing_opt_in: user.marketing_opt_in,
      mfa_enabled: user.security.mfa_enabled,
      recovery_email: user.security.recovery_email || '',
      source: user.source,
      groups: user.groups,
      tenant_id: user.tenant_id || '',
    });
    
    setShowUserDialog(true);
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true);
      
      // Transform form data to User object
      const userData: Partial<User> = {
        email: data.email.toLowerCase().trim(),
        email_verified: data.email_verified,
        status: data.status,
        name: data.name.trim(),
        username: data.username?.trim() || undefined,
        role: data.role,
        phone: data.phone?.trim() || undefined,
        phone_verified: data.phone_verified,
        avatar_url: data.avatar_url?.trim() || undefined,
        department: data.department?.trim() || undefined,
        locale: data.locale,
        timezone: data.timezone,
        notification_prefs: data.notification_prefs,
        marketing_opt_in: data.marketing_opt_in,
        security: {
          mfa_enabled: data.mfa_enabled,
          mfa_methods: data.mfa_enabled ? ['TOTP'] : [],
          failed_login_count: 0,
          recovery_email: data.recovery_email?.trim() || undefined,
        },
        compliance: {
          marketing_opt_in: data.marketing_opt_in,
        },
        external_identities: [],
        tenant_id: data.tenant_id?.trim() || undefined,
        groups: data.groups,
        source: data.source,
      };

      if (isEditing && selectedUser) {
        const updatedUser = await usersApi.updateUser(selectedUser.id, userData);
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
        toast({
          title: 'User Updated',
          description: `${updatedUser.name} has been updated successfully.`
        });
      } else {
        const newUser = await usersApi.createUser(userData);
        setUsers(prev => [newUser, ...prev]);
        toast({
          title: 'User Created',
          description: `${newUser.name} has been created successfully.`
        });
      }

      setShowUserDialog(false);
      form.reset();
    } catch (error) {
      console.error('Failed to save user:', error);
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
    if (!selectedUser) return;

    try {
      await usersApi.deleteUser(selectedUser.id);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setShowDeleteConfirm(false);
      
      toast({
        title: 'User Deleted',
        description: `${selectedUser.name} has been permanently deleted.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getUserInitials = (user: User) => {
    return user.name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Department', 'Created', 'Last Login'].join(','),
      ...filteredUsers.map(user => [
        `"${user.name}"`,
        user.email,
        user.role,
        user.status,
        `"${user.department || ''}"`,
        new Date(user.createdAt).toLocaleDateString('en-GB'),
        user.security.last_login_at ? new Date(user.security.last_login_at).toLocaleDateString('en-GB') : 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Complete',
      description: 'Users data exported to CSV successfully.'
    });
  };

  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    pending: users.filter(u => u.status === 'PENDING_VERIFICATION').length,
    mfaEnabled: users.filter(u => u.security.mfa_enabled).length,
    clients: users.filter(u => u.role === 'CLIENT').length,
    agents: users.filter(u => u.role === 'AGENT').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleCreateUser}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{stats.active} active</p>
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
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">{stats.pending} pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MFA Enabled</p>
                <p className="text-2xl font-bold">{stats.mfaEnabled}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.mfaEnabled / stats.total) * 100)}% coverage
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Building className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Roles</p>
                <p className="text-lg font-bold">{stats.clients}C {stats.agents}A {stats.admins}Ad</p>
                <p className="text-xs text-muted-foreground">Clients/Agents/Admins</p>
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
                  placeholder="Search by name, email, username, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
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
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING_VERIFICATION">Pending</SelectItem>
                  <SelectItem value="DISABLED">Disabled</SelectItem>
                  <SelectItem value="DELETED_SOFT">Soft Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Create your first user to get started.'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const StatusIcon = statusConfig[user.status].icon;
                  const SourceIcon = sourceConfig[user.source].icon;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{user.name}</p>
                              {user.username && (
                                <Badge variant="outline" className="text-xs">
                                  @{user.username}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.department && (
                              <p className="text-xs text-muted-foreground">{user.department}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={roleConfig[user.role].variant}>
                          {roleConfig[user.role].label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusConfig[user.status].variant} className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[user.status].label}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {user.email_verified ? (
                              <CheckCircle className="h-3 w-3 text-success" />
                            ) : (
                              <XCircle className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {user.phone_verified ? (
                                <CheckCircle className="h-3 w-3 text-success" />
                              ) : (
                                <XCircle className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.security.mfa_enabled ? (
                            <Badge variant="default" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              MFA
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              No MFA
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            <SourceIcon className="h-3 w-3 mr-1" />
                            {sourceConfig[user.source].label}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {user.security.last_login_at ? (
                            <>
                              <p>{format(new Date(user.security.last_login_at), 'MMM dd, yyyy')}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(user.security.last_login_at), 'HH:mm')}
                              </p>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit User' : 'Create New User'}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update user information and settings.'
                : 'Create a new user account with comprehensive settings.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Core Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Core Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+44 20 7123 4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CLIENT">Client</SelectItem>
                            <SelectItem value="AGENT">Agent</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="DPO">DPO</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="PENDING_VERIFICATION">Pending Verification</SelectItem>
                            <SelectItem value="DISABLED">Disabled</SelectItem>
                            <SelectItem value="DELETED_SOFT">Soft Deleted</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Finance, Collections, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/avatar.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Verification Status */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Verification Status</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email_verified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Verified</FormLabel>
                          <FormDescription>
                            Mark email address as verified
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone_verified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Phone Verified</FormLabel>
                          <FormDescription>
                            Mark phone number as verified
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Locale & Preferences */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Locale & Preferences</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="locale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language & Region</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select locale" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en-GB">English (UK)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="de-DE">Deutsch</SelectItem>
                            <SelectItem value="fr-FR">Français</SelectItem>
                            <SelectItem value="es-ES">Español</SelectItem>
                            <SelectItem value="sq-AL">Shqip</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                            <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                            <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                            <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notification Preferences */}
                <div className="space-y-4 rounded-lg border p-4">
                  <h5 className="font-medium">Notification Preferences</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="notification_prefs.email"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <FormLabel>Email Notifications</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notification_prefs.push"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <FormLabel>Push Notifications</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notification_prefs.in_app"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <FormLabel>In-App Notifications</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notification_prefs.sms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <FormLabel>SMS Notifications</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="marketing_opt_in"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Marketing Opt-in</FormLabel>
                        <FormDescription>
                          Allow user to receive marketing communications
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Security Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Security Settings</h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="mfa_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Multi-Factor Authentication</FormLabel>
                          <FormDescription>
                            Enable MFA for enhanced security
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recovery_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recovery Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="recovery@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Alternative email for account recovery
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Advanced Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Source</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="signup">Self Signup</SelectItem>
                            <SelectItem value="invitation">Invitation</SelectItem>
                            <SelectItem value="sso">SSO</SelectItem>
                            <SelectItem value="admin_created">Admin Created</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tenant_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tenant ID</FormLabel>
                        <FormControl>
                          <Input placeholder="tenant_123" {...field} />
                        </FormControl>
                        <FormDescription>
                          For multi-tenant environments
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowUserDialog(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{selectedUser?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}