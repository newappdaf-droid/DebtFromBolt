// Professional Users API Adapter for B2B Debt Collection Platform
// .NET-ready contracts with PascalCase DTOs for ASP.NET Core integration

import { User } from '@/types';

// .NET-ready User Management Types (PascalCase)
export type UserRole = "CLIENT" | "AGENT" | "ADMIN" | "DPO";
export type UserStatus = "active" | "inactive" | "pending" | "locked";

export interface UserSummary {
  UserId: string;
  Email: string;
  Name: string;
  Role: UserRole;
  Status: UserStatus;
  Department?: string;
  ClientId?: string;
  LastLoginAt?: string;
  CreatedAt: string;
  IsActive: boolean;
}

export interface UserDetail extends UserSummary {
  Phone?: string;
  JobTitle?: string;
  Permissions: string[];
  LastLoginIp?: string;
  FailedLoginAttempts: number;
  LockedUntil?: string;
  PasswordChangedAt?: string;
  UpdatedAt: string;
  UpdatedBy?: string;
}

export interface CreateUserRequest {
  Email: string;
  Name: string;
  Role: UserRole;
  Department?: string;
  Phone?: string;
  JobTitle?: string;
  ClientId?: string;
  IsActive?: boolean;
  SendInvitation?: boolean;
  Permissions?: string[];
}

export interface UpdateUserRequest {
  Name?: string;
  Role?: UserRole;
  Department?: string;
  Phone?: string;
  JobTitle?: string;
  ClientId?: string;
  IsActive?: boolean;
  Permissions?: string[];
}

export interface InviteUserRequest {
  Email: string;
  Name: string;
  Role: UserRole;
  Department?: string;
  ClientId?: string;
  CustomMessage?: string;
}

export interface BulkInviteRequest {
  Invitations: InviteUserRequest[];
}

export interface BulkInviteResponse {
  TotalInvitations: number;
  SuccessfulInvitations: number;
  FailedInvitations: number;
  FailedEmails: string[];
  Errors: string[];
}

export interface BulkUserActionRequest {
  UserIds: string[];
  Action: "activate" | "deactivate" | "assign_role" | "reset_password" | "delete";
  ActionData?: any;
}

export interface BulkActionResponse {
  TotalUsers: number;
  SuccessfulActions: number;
  FailedActions: number;
  FailedUserIds: string[];
  Errors: string[];
}

export interface UserInvitation {
  InvitationId: string;
  Email: string;
  Name: string;
  Role: UserRole;
  Status: "pending" | "accepted" | "expired" | "cancelled";
  InvitationToken: string;
  ExpiresAt: string;
  CreatedAt: string;
  AcceptedAt?: string;
}

export interface ImpersonationResponse {
  ImpersonationToken: string;
  ExpiresAt: string;
  TargetUser: UserSummary;
}

export interface UserListResponse {
  Users: UserSummary[];
  Total: number;
  Page: number;
  Size: number;
  HasNext: boolean;
  HasPrevious: boolean;
}

export interface AuditLogEntry {
  AuditId: string;
  UserId: string;
  UserEmail: string;
  Action: string;
  Details?: string;
  IpAddress?: string;
  UserAgent?: string;
  Timestamp: string;
  PerformedBy: string;
  PerformedByName: string;
}

export interface AuditLogResponse {
  Entries: AuditLogEntry[];
  Total: number;
  Page: number;
  Size: number;
  HasNext: boolean;
  HasPrevious: boolean;
}

export interface UserFilters {
  Query?: string;
  Role?: UserRole;
  Status?: UserStatus;
  Department?: string;
  ClientId?: string;
  Page?: number;
  Size?: number;
  SortBy?: "Name" | "Email" | "Role" | "CreatedAt" | "LastLoginAt";
  SortOrder?: "asc" | "desc";
}

// Mock Data Store for Users
class MockUsersDataStore {
  private users: UserDetail[] = [];
  private invitations: UserInvitation[] = [];
  private auditLog: AuditLogEntry[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Generate comprehensive mock users
    const departments = ["Finance", "Collections", "Legal", "IT", "Management", "Data Protection"];
    const jobTitles = ["Manager", "Specialist", "Senior Agent", "Junior Agent", "Director", "Officer"];
    
    for (let i = 1; i <= 25; i++) {
      const roles: UserRole[] = ["CLIENT", "AGENT", "ADMIN", "DPO"];
      const statuses: UserStatus[] = ["active", "inactive", "pending"];
      
      const role = roles[Math.floor(Math.random() * roles.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      
      const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString();
      const lastLoginAt = status === "active" ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined;
      
      const user: UserDetail = {
        UserId: `user_${i.toString().padStart(3, '0')}`,
        Email: `user${i}@${role.toLowerCase() === 'client' ? 'client' : 'collectpro'}.com`,
        Name: `${['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa'][Math.floor(Math.random() * 8)]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'][Math.floor(Math.random() * 8)]}`,
        Role: role,
        Status: status,
        Department: department,
        Phone: `+44 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
        JobTitle: jobTitle,
        ClientId: role === "CLIENT" ? `client_${Math.floor(Math.random() * 5) + 1}` : undefined,
        LastLoginAt: lastLoginAt,
        CreatedAt: createdAt,
        IsActive: status === "active",
        Permissions: this.getDefaultPermissions(role),
        LastLoginIp: status === "active" ? `192.168.1.${Math.floor(Math.random() * 254) + 1}` : undefined,
        FailedLoginAttempts: Math.floor(Math.random() * 3),
        LockedUntil: status === "locked" ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined,
        PasswordChangedAt: new Date(new Date(createdAt).getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        UpdatedAt: new Date(new Date(createdAt).getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        UpdatedBy: Math.random() > 0.5 ? "admin_1" : undefined
      };

      this.users.push(user);
    }

    // Generate mock invitations
    for (let i = 1; i <= 5; i++) {
      const invitation: UserInvitation = {
        InvitationId: `inv_${i}`,
        Email: `newuser${i}@example.com`,
        Name: `New User ${i}`,
        Role: ["CLIENT", "AGENT"][Math.floor(Math.random() * 2)] as UserRole,
        Status: ["pending", "expired"][Math.floor(Math.random() * 2)] as any,
        InvitationToken: `token_${Math.random().toString(36).substring(2, 15)}`,
        ExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        CreatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      this.invitations.push(invitation);
    }

    // Generate mock audit log
    const actions = ["user_created", "user_updated", "user_deleted", "role_changed", "password_reset", "user_activated", "user_deactivated"];
    for (let i = 1; i <= 50; i++) {
      const auditEntry: AuditLogEntry = {
        AuditId: `audit_${i}`,
        UserId: `user_${Math.floor(Math.random() * 25) + 1}`,
        UserEmail: `user${Math.floor(Math.random() * 25) + 1}@example.com`,
        Action: actions[Math.floor(Math.random() * actions.length)],
        Details: `Mock audit entry ${i}`,
        IpAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        UserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        PerformedBy: "admin_1",
        PerformedByName: "System Administrator"
      };
      this.auditLog.push(auditEntry);
    }
  }

  private getDefaultPermissions(role: UserRole): string[] {
    const permissions = {
      CLIENT: ['view_own_cases', 'create_cases', 'view_own_invoices'],
      AGENT: ['view_assigned_cases', 'update_cases', 'send_messages', 'create_activities'],
      ADMIN: ['full_access', 'manage_users', 'approve_escalations', 'view_all_data'],
      DPO: ['view_all_data', 'manage_gdpr', 'data_erasure', 'audit_access']
    };
    return permissions[role] || [];
  }

  // Getters
  getUsers(): UserDetail[] { return this.users; }
  getInvitations(): UserInvitation[] { return this.invitations; }
  getAuditLog(): AuditLogEntry[] { return this.auditLog; }

  // User operations
  addUser(user: UserDetail): void { this.users.push(user); }
  updateUser(userId: string, updates: Partial<UserDetail>): void {
    const index = this.users.findIndex(u => u.UserId === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates, UpdatedAt: new Date().toISOString() };
    }
  }
  deleteUser(userId: string): void {
    this.users = this.users.filter(u => u.UserId !== userId);
  }

  // Invitation operations
  addInvitation(invitation: UserInvitation): void { this.invitations.push(invitation); }
  updateInvitation(invitationId: string, updates: Partial<UserInvitation>): void {
    const index = this.invitations.findIndex(i => i.InvitationId === invitationId);
    if (index !== -1) {
      this.invitations[index] = { ...this.invitations[index], ...updates };
    }
  }

  // Audit operations
  addAuditEntry(entry: AuditLogEntry): void { this.auditLog.unshift(entry); }
}

// Singleton mock store
const mockStore = new MockUsersDataStore();

// Professional Users API Adapter
export class UsersApiAdapter {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // Get users with filtering and pagination
  async getUsers(filters?: UserFilters): Promise<UserListResponse> {
    await this.simulateDelay();
    
    let users = mockStore.getUsers();
    
    // Apply filters
    if (filters?.Query) {
      const query = filters.Query.toLowerCase();
      users = users.filter(u => 
        u.Name.toLowerCase().includes(query) ||
        u.Email.toLowerCase().includes(query) ||
        (u.Department && u.Department.toLowerCase().includes(query))
      );
    }
    
    if (filters?.Role) {
      users = users.filter(u => u.Role === filters.Role);
    }
    
    if (filters?.Status) {
      users = users.filter(u => u.Status === filters.Status);
    }
    
    if (filters?.Department) {
      users = users.filter(u => u.Department === filters.Department);
    }
    
    if (filters?.ClientId) {
      users = users.filter(u => u.ClientId === filters.ClientId);
    }

    // Sort
    const sortBy = filters?.SortBy || "CreatedAt";
    const sortOrder = filters?.SortOrder || "desc";
    
    users.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "Name":
          aValue = a.Name;
          bValue = b.Name;
          break;
        case "Email":
          aValue = a.Email;
          bValue = b.Email;
          break;
        case "Role":
          aValue = a.Role;
          bValue = b.Role;
          break;
        case "LastLoginAt":
          aValue = a.LastLoginAt ? new Date(a.LastLoginAt) : new Date(0);
          bValue = b.LastLoginAt ? new Date(b.LastLoginAt) : new Date(0);
          break;
        default:
          aValue = new Date(a.CreatedAt);
          bValue = new Date(b.CreatedAt);
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Pagination
    const page = filters?.Page || 1;
    const size = filters?.Size || 25;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedUsers = users.slice(startIndex, endIndex);

    return {
      Users: paginatedUsers,
      Total: users.length,
      Page: page,
      Size: size,
      HasNext: endIndex < users.length,
      HasPrevious: page > 1
    };
  }

  // Get single user details
  async getUser(userId: string): Promise<UserDetail> {
    await this.simulateDelay();
    
    const user = mockStore.getUsers().find(u => u.UserId === userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    return user;
  }

  // Create new user
  async createUser(request: CreateUserRequest): Promise<UserDetail> {
    await this.simulateDelay();
    
    const userId = `user_${Date.now()}`;
    const now = new Date().toISOString();
    
    const newUser: UserDetail = {
      UserId: userId,
      Email: request.Email,
      Name: request.Name,
      Role: request.Role,
      Status: request.SendInvitation ? "pending" : "active",
      Department: request.Department,
      Phone: request.Phone,
      JobTitle: request.JobTitle,
      ClientId: request.ClientId,
      LastLoginAt: undefined,
      CreatedAt: now,
      IsActive: request.IsActive ?? true,
      Permissions: request.Permissions || this.getDefaultPermissions(request.Role),
      LastLoginIp: undefined,
      FailedLoginAttempts: 0,
      LockedUntil: undefined,
      PasswordChangedAt: undefined,
      UpdatedAt: now,
      UpdatedBy: "current_admin"
    };

    mockStore.addUser(newUser);
    
    // Add audit entry
    this.addAuditEntry({
      UserId: userId,
      UserEmail: request.Email,
      Action: "user_created",
      Details: `User created with role ${request.Role}`,
      PerformedBy: "current_admin",
      PerformedByName: "Current Administrator"
    });

    // Send invitation if requested
    if (request.SendInvitation) {
      await this.inviteUser({
        Email: request.Email,
        Name: request.Name,
        Role: request.Role,
        Department: request.Department,
        ClientId: request.ClientId
      });
    }

    return newUser;
  }

  // Update user
  async updateUser(userId: string, request: UpdateUserRequest): Promise<UserDetail> {
    await this.simulateDelay();
    
    const existingUser = mockStore.getUsers().find(u => u.UserId === userId);
    if (!existingUser) {
      throw new Error(`User ${userId} not found`);
    }

    const updates: Partial<UserDetail> = {
      ...request,
      UpdatedAt: new Date().toISOString(),
      UpdatedBy: "current_admin"
    };

    mockStore.updateUser(userId, updates);
    
    // Add audit entry
    this.addAuditEntry({
      UserId: userId,
      UserEmail: existingUser.Email,
      Action: "user_updated",
      Details: `User profile updated`,
      PerformedBy: "current_admin",
      PerformedByName: "Current Administrator"
    });

    return { ...existingUser, ...updates } as UserDetail;
  }

  // Delete user
  async deleteUser(userId: string): Promise<{ Success: boolean }> {
    await this.simulateDelay();
    
    const user = mockStore.getUsers().find(u => u.UserId === userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    mockStore.deleteUser(userId);
    
    // Add audit entry
    this.addAuditEntry({
      UserId: userId,
      UserEmail: user.Email,
      Action: "user_deleted",
      Details: `User account permanently deleted`,
      PerformedBy: "current_admin",
      PerformedByName: "Current Administrator"
    });

    return { Success: true };
  }

  // Send user invitation
  async inviteUser(request: InviteUserRequest): Promise<UserInvitation> {
    await this.simulateDelay();
    
    const invitation: UserInvitation = {
      InvitationId: `inv_${Date.now()}`,
      Email: request.Email,
      Name: request.Name,
      Role: request.Role,
      Status: "pending",
      InvitationToken: `token_${Math.random().toString(36).substring(2, 15)}`,
      ExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      CreatedAt: new Date().toISOString()
    };

    mockStore.addInvitation(invitation);
    
    // Add audit entry
    this.addAuditEntry({
      UserId: "pending",
      UserEmail: request.Email,
      Action: "invitation_sent",
      Details: `Invitation sent for role ${request.Role}`,
      PerformedBy: "current_admin",
      PerformedByName: "Current Administrator"
    });

    return invitation;
  }

  // Bulk invite users
  async bulkInviteUsers(request: BulkInviteRequest): Promise<BulkInviteResponse> {
    await this.simulateDelay(1000); // Longer delay for bulk operation
    
    let successful = 0;
    let failed = 0;
    const failedEmails: string[] = [];
    const errors: string[] = [];

    for (const inviteRequest of request.Invitations) {
      try {
        await this.inviteUser(inviteRequest);
        successful++;
      } catch (error) {
        failed++;
        failedEmails.push(inviteRequest.Email);
        errors.push(`Failed to invite ${inviteRequest.Email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      TotalInvitations: request.Invitations.length,
      SuccessfulInvitations: successful,
      FailedInvitations: failed,
      FailedEmails: failedEmails,
      Errors: errors
    };
  }

  // Bulk user actions
  async bulkUserActions(request: BulkUserActionRequest): Promise<BulkActionResponse> {
    await this.simulateDelay(1000); // Longer delay for bulk operation
    
    let successful = 0;
    let failed = 0;
    const failedUserIds: string[] = [];
    const errors: string[] = [];

    for (const userId of request.UserIds) {
      try {
        switch (request.Action) {
          case "activate":
            mockStore.updateUser(userId, { IsActive: true, Status: "active" });
            break;
          case "deactivate":
            mockStore.updateUser(userId, { IsActive: false, Status: "inactive" });
            break;
          case "assign_role":
            if (request.ActionData?.Role) {
              mockStore.updateUser(userId, { 
                Role: request.ActionData.Role,
                Permissions: this.getDefaultPermissions(request.ActionData.Role)
              });
            }
            break;
          case "reset_password":
            mockStore.updateUser(userId, { PasswordChangedAt: new Date().toISOString() });
            break;
          case "delete":
            mockStore.deleteUser(userId);
            break;
        }
        
        // Add audit entry for each action
        const user = mockStore.getUsers().find(u => u.UserId === userId);
        this.addAuditEntry({
          UserId: userId,
          UserEmail: user?.Email || "unknown",
          Action: `bulk_${request.Action}`,
          Details: `Bulk action: ${request.Action}`,
          PerformedBy: "current_admin",
          PerformedByName: "Current Administrator"
        });
        
        successful++;
      } catch (error) {
        failed++;
        failedUserIds.push(userId);
        errors.push(`Failed to ${request.Action} user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      TotalUsers: request.UserIds.length,
      SuccessfulActions: successful,
      FailedActions: failed,
      FailedUserIds: failedUserIds,
      Errors: errors
    };
  }

  // Reset user password
  async resetUserPassword(userId: string): Promise<{ Success: boolean }> {
    await this.simulateDelay();
    
    const user = mockStore.getUsers().find(u => u.UserId === userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    mockStore.updateUser(userId, { 
      PasswordChangedAt: new Date().toISOString(),
      FailedLoginAttempts: 0,
      LockedUntil: undefined
    });
    
    // Add audit entry
    this.addAuditEntry({
      UserId: userId,
      UserEmail: user.Email,
      Action: "password_reset",
      Details: "Password reset initiated by administrator",
      PerformedBy: "current_admin",
      PerformedByName: "Current Administrator"
    });

    return { Success: true };
  }

  // Impersonate user
  async impersonateUser(userId: string, reason: string): Promise<ImpersonationResponse> {
    await this.simulateDelay();
    
    const user = mockStore.getUsers().find(u => u.UserId === userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Add audit entry for impersonation
    this.addAuditEntry({
      UserId: userId,
      UserEmail: user.Email,
      Action: "user_impersonated",
      Details: `Admin impersonation started. Reason: ${reason}`,
      PerformedBy: "current_admin",
      PerformedByName: "Current Administrator"
    });

    return {
      ImpersonationToken: `imp_${Math.random().toString(36).substring(2, 15)}`,
      ExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      TargetUser: user
    };
  }

  // Get audit log
  async getAuditLog(filters?: {
    UserId?: string;
    Action?: string;
    DateFrom?: string;
    DateTo?: string;
    Page?: number;
    Size?: number;
  }): Promise<AuditLogResponse> {
    await this.simulateDelay();
    
    let entries = mockStore.getAuditLog();
    
    // Apply filters
    if (filters?.UserId) {
      entries = entries.filter(e => e.UserId === filters.UserId);
    }
    
    if (filters?.Action) {
      entries = entries.filter(e => e.Action.includes(filters.Action!));
    }
    
    if (filters?.DateFrom) {
      entries = entries.filter(e => new Date(e.Timestamp) >= new Date(filters.DateFrom!));
    }
    
    if (filters?.DateTo) {
      entries = entries.filter(e => new Date(e.Timestamp) <= new Date(filters.DateTo!));
    }

    // Pagination
    const page = filters?.Page || 1;
    const size = filters?.Size || 50;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedEntries = entries.slice(startIndex, endIndex);

    return {
      Entries: paginatedEntries,
      Total: entries.length,
      Page: page,
      Size: size,
      HasNext: endIndex < entries.length,
      HasPrevious: page > 1
    };
  }

  // Get user invitations
  async getInvitations(): Promise<UserInvitation[]> {
    await this.simulateDelay();
    return mockStore.getInvitations();
  }

  // Helper methods
  private getDefaultPermissions(role: UserRole): string[] {
    const permissions = {
      CLIENT: ['view_own_cases', 'create_cases', 'view_own_invoices'],
      AGENT: ['view_assigned_cases', 'update_cases', 'send_messages', 'create_activities'],
      ADMIN: ['full_access', 'manage_users', 'approve_escalations', 'view_all_data'],
      DPO: ['view_all_data', 'manage_gdpr', 'data_erasure', 'audit_access']
    };
    return permissions[role] || [];
  }

  private addAuditEntry(entry: Omit<AuditLogEntry, 'AuditId' | 'Timestamp' | 'IpAddress' | 'UserAgent'>): void {
    const auditEntry: AuditLogEntry = {
      AuditId: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      ...entry,
      IpAddress: "192.168.1.100", // Would be actual IP in real implementation
      UserAgent: "CollectPro Admin Interface",
      Timestamp: new Date().toISOString()
    };
    
    mockStore.addAuditEntry(auditEntry);
  }

  // Helper method to simulate API delay
  private async simulateDelay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const usersApi = new UsersApiAdapter();

// Helper function to convert legacy User type to new UserDetail type
export function convertLegacyUser(user: User): UserDetail {
  return {
    UserId: user.id,
    Email: user.email,
    Name: user.name,
    Role: user.role as UserRole,
    Status: user.isActive ? "active" : "inactive",
    Department: user.department,
    Phone: user.phone,
    JobTitle: undefined,
    ClientId: user.clientId,
    LastLoginAt: user.lastLoginAt,
    CreatedAt: user.createdAt,
    IsActive: user.isActive ?? true,
    Permissions: user.permissions || [],
    LastLoginIp: undefined,
    FailedLoginAttempts: 0,
    LockedUntil: undefined,
    PasswordChangedAt: undefined,
    UpdatedAt: user.updatedAt || user.createdAt,
    UpdatedBy: undefined
  };
}