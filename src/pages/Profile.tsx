import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Mail, Building2, Calendar, Shield, Globe, Bell, 
  Smartphone, Lock, Key, Users, ExternalLink, Clock,
  CheckCircle, XCircle, AlertTriangle, Settings, Eye,
  UserCheck, MapPin, Languages, Zap
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().optional(),
  username: z.string().optional(),
  locale: z.string(),
  timezone: z.string(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      username: user?.username || '',
      locale: user?.locale || 'en-GB',
      timezone: user?.timezone || 'Europe/London',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // TODO: Implement API call to update profile
      console.log('Profile update:', data);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const getUserInitials = () => {
    return user?.name
      ?.split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase() || 'U';
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'DPO':
        return 'secondary';
      case 'AGENT':
        return 'default';
      case 'CLIENT':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'PENDING_VERIFICATION':
        return 'secondary';
      case 'DISABLED':
        return 'destructive';
      case 'DELETED_SOFT':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return CheckCircle;
      case 'PENDING_VERIFICATION':
        return Clock;
      case 'DISABLED':
        return XCircle;
      case 'DELETED_SOFT':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-muted-foreground">No user data available</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="text-xl">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getRoleBadgeVariant(user.role)} className="uppercase">
                {user.role}
              </Badge>
              <Badge variant={getStatusBadgeVariant(user.status)} className="flex items-center gap-1">
                {React.createElement(getStatusIcon(user.status), { className: "h-3 w-3" })}
                {user.status.replace('_', ' ')}
              </Badge>
              {user.email_verified && (
                <Badge variant="outline" className="text-success border-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Email Verified
                </Badge>
              )}
              {user.phone_verified && (
                <Badge variant="outline" className="text-success border-success">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Phone Verified
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{user.email}</p>
            {user.username && (
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Manage your personal details and contact information
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
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
                                <Input placeholder="Enter username" {...field} />
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
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} />
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
                                <Input placeholder="Enter your phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your department" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="locale"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
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
                      </div>

                      <div className="flex gap-4">
                        <Button type="submit" className="min-w-[100px]">
                          Save Changes
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{user.name}</span>
                        </div>
                      </div>

                      {user.username && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>@{user.username}</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{user.email}</span>
                          {user.email_verified && (
                            <CheckCircle className="h-4 w-4 text-success" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span>{user.phone || 'Not provided'}</span>
                          {user.phone_verified && (
                            <CheckCircle className="h-4 w-4 text-success" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{user.department || 'Not provided'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Language & Region</Label>
                        <div className="flex items-center gap-2">
                          <Languages className="h-4 w-4 text-muted-foreground" />
                          <span>{user.locale}</span>
                          <MapPin className="h-4 w-4 text-muted-foreground ml-2" />
                          <span>{user.timezone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(user.status)} className="flex items-center gap-1">
                        {React.createElement(getStatusIcon(user.status), { className: "h-3 w-3" })}
                        {user.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Account Source</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {user.source.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {user.security.last_login_at 
                          ? new Date(user.security.last_login_at).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and authentication methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* MFA Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span className="font-medium">Multi-Factor Authentication</span>
                      {user.security.mfa_enabled && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.security.mfa_enabled 
                        ? `Enabled with ${user.security.mfa_methods.length} method(s)`
                        : 'Not enabled - recommended for enhanced security'
                      }
                    </p>
                  </div>
                  <Button variant={user.security.mfa_enabled ? "outline" : "default"}>
                    {user.security.mfa_enabled ? 'Manage' : 'Enable MFA'}
                  </Button>
                </div>

                {/* MFA Methods */}
                {user.security.mfa_enabled && user.security.mfa_methods.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Active MFA Methods</Label>
                    <div className="space-y-2">
                      {user.security.mfa_methods.map((method, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {method === 'TOTP' && <Key className="h-4 w-4" />}
                            {method === 'WebAuthn' && <Zap className="h-4 w-4" />}
                            {method === 'SMS' && <Smartphone className="h-4 w-4" />}
                            <span className="font-medium">
                              {method === 'TOTP' && 'Authenticator App'}
                              {method === 'WebAuthn' && 'Security Key'}
                              {method === 'SMS' && 'SMS Verification'}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Failed Login Attempts</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{user.security.failed_login_count}</span>
                      <span className="text-sm text-muted-foreground">recent attempts</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Password Version</Label>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{user.password_version}</code>
                    </div>
                  </div>
                </div>

                {/* Recovery Email */}
                {user.security.recovery_email && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Recovery Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.security.recovery_email}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Customize your application experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notification Preferences */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Notification Preferences</Label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch checked={user.notification_prefs.email} disabled />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Push Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications in browser
                        </p>
                      </div>
                      <Switch checked={user.notification_prefs.push} disabled />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          In-App Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications within the application
                        </p>
                      </div>
                      <Switch checked={user.notification_prefs.in_app} disabled />
                    </div>

                    {user.notification_prefs.sms !== undefined && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            SMS Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive urgent notifications via SMS
                          </p>
                        </div>
                        <Switch checked={user.notification_prefs.sms} disabled />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Marketing Preferences */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive product updates and promotional content
                    </p>
                  </div>
                  <Switch checked={user.marketing_opt_in} disabled />
                </div>

                <Separator />

                {/* Locale Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Language & Region</Label>
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      <span>{user.locale}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Timezone</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user.timezone}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  GDPR & Compliance
                </CardTitle>
                <CardDescription>
                  View your privacy settings and compliance status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Terms & Privacy */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Legal Agreements</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="font-medium">Terms of Service</span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Version: {user.compliance.terms_version}</p>
                        <p>Accepted: {user.compliance.accepted_terms_at 
                          ? new Date(user.compliance.accepted_terms_at).toLocaleDateString('en-GB')
                          : 'Not accepted'
                        }</p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="font-medium">Privacy Policy</span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Version: {user.compliance.privacy_version}</p>
                        <p>Accepted: {user.compliance.privacy_consent_at 
                          ? new Date(user.compliance.privacy_consent_at).toLocaleDateString('en-GB')
                          : 'Not accepted'
                        }</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Marketing Consent */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Marketing Communications</span>
                      {user.compliance.marketing_opt_in ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.compliance.marketing_opt_in 
                        ? 'You have opted in to receive marketing communications'
                        : 'You have opted out of marketing communications'
                      }
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {user.compliance.marketing_opt_in ? 'Opt Out' : 'Opt In'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Connected Accounts
                </CardTitle>
                <CardDescription>
                  Manage your external account connections and SSO providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.external_identities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No external accounts connected</p>
                    <p className="text-sm">Connect external accounts for easier sign-in</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.external_identities.map((identity, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <ExternalLink className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{identity.provider}</span>
                              {identity.verified && (
                                <CheckCircle className="h-4 w-4 text-success" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {identity.email || identity.subject}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Connected: {new Date(identity.linked_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Groups & Permissions */}
                {user.groups.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Group Memberships</Label>
                      <div className="flex flex-wrap gap-2">
                        {user.groups.map((group, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {group.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Tenant Information */}
                {user.tenant_id && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Tenant ID</Label>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{user.tenant_id}</code>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              View your account details and audit information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                <code className="text-sm bg-muted px-2 py-1 rounded">{user.id}</code>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(user.role)} className="uppercase">
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : 'Unknown'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-GB') : 'Unknown'}</span>
                </div>
              </div>

              {user.created_by && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                  <span className="text-sm">{user.created_by}</span>
                </div>
              )}

              {user.updated_by && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Last Updated By</Label>
                  <span className="text-sm">{user.updated_by}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}