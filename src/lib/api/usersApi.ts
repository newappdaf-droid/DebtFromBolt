// Professional Users API Adapter for B2B Debt Collection Platform
// Mock implementation with .NET-ready contracts and PascalCase DTOs

import { User, UserStatus, UserSource, NotificationPrefs, SecuritySettings, ComplianceData, ExternalIdentity } from '@/types';

// Mock Data Store for Users
class MockUsersStore {
  private users: User[] = [
    {
      // Core fields
      id: 'admin_1',
      email: 'admin@collectpro.com',
      email_verified: true,
      password_version: 'argon2id-2025',
      status: 'ACTIVE' as UserStatus,
      
      // Identity & profile
      name: 'John Administrator',
      username: 'jadmin',
      role: 'ADMIN',
      phone: '+44 20 7000 0001',
      phone_verified: true,
      avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      
      // Legacy fields
      department: 'Administration',
      isActive: true,
      permissions: ['full_access'],
      
      // Locale & preferences
      locale: 'en-GB',
      timezone: 'Europe/London',
      notification_prefs: {
        email: true,
        push: true,
        in_app: true,
        sms: true
      } as NotificationPrefs,
      marketing_opt_in: false,
      
      // Security & compliance
      security: {
        mfa_enabled: true,
        mfa_methods: ['TOTP', 'WebAuthn'],
        failed_login_count: 0,
        last_login_at: '2024-12-19T07:45:00Z',
        recovery_email: 'admin.recovery@collectpro.com'
      } as SecuritySettings,
      compliance: {
        accepted_terms_at: '2024-01-01T08:00:00Z',
        privacy_consent_at: '2024-01-01T08:00:00Z',
        terms_version: '2.1',
        privacy_version: '1.3',
        marketing_opt_in: false
      } as ComplianceData,
      
      // Integrations & SSO
      external_identities: [] as ExternalIdentity[],
      groups: ['administrators', 'system_users'],
      
      // Lifecycle management
      source: 'admin_created' as UserSource,
      
      // Audit fields
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-12-19T07:45:00Z',
      created_by: 'system',
      updated_by: 'admin_1'
    },
    {
      // Core fields
      id: 'agent_1',
      email: 'sarah.johnson@collectpro.com',
      email_verified: true,
      password_version: 'argon2id-2025',
      status: 'ACTIVE' as UserStatus,
      
      // Identity & profile
      name: 'Sarah Johnson',
      username: 'sjohnson',
      role: 'AGENT',
      phone: '+44 20 7123 4567',
      phone_verified: true,
      avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      
      // Legacy fields
      department: 'Collections Team A',
      isActive: true,
      permissions: ['view_cases', 'update_cases', 'send_messages'],
      
      // Locale & preferences
      locale: 'en-GB',
      timezone: 'Europe/London',
      notification_prefs: {
        email: true,
        push: true,
        in_app: true,
        sms: false
      } as NotificationPrefs,
      marketing_opt_in: true,
      
      // Security & compliance
      security: {
        mfa_enabled: false,
        mfa_methods: [],
        failed_login_count: 0,
        last_login_at: '2024-12-19T09:15:00Z'
      } as SecuritySettings,
      compliance: {
        accepted_terms_at: '2024-02-01T10:00:00Z',
        privacy_consent_at: '2024-02-01T10:00:00Z',
        terms_version: '2.1',
        privacy_version: '1.3',
        marketing_opt_in: true
      } as ComplianceData,
      
      // Integrations & SSO
      external_identities: [] as ExternalIdentity[],
      groups: ['collection_agents', 'field_team'],
      
      // Lifecycle management
      source: 'invitation' as UserSource,
      
      // Audit fields
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-12-19T09:15:00Z',
      created_by: 'admin_1',
      updated_by: 'agent_1'
    },
    {
      // Core fields
      id: 'client_1',
      email: 'client@acme.com',
      email_verified: true,
      password_version: 'argon2id-2025',
      status: 'ACTIVE' as UserStatus,
      
      // Identity & profile
      name: 'ACME Manufacturing Ltd',
      username: 'acme_finance',
      role: 'CLIENT',
      clientId: 'client_1',
      phone: '+44 121 234 5678',
      phone_verified: true,
      avatar_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      
      // Legacy fields
      department: 'Finance',
      isActive: true,
      permissions: ['view_cases', 'create_cases'],
      
      // Locale & preferences
      locale: 'en-GB',
      timezone: 'Europe/London',
      notification_prefs: {
        email: true,
        push: false,
        in_app: true,
        sms: true
      } as NotificationPrefs,
      marketing_opt_in: true,
      
      // Security & compliance
      security: {
        mfa_enabled: true,
        mfa_methods: ['TOTP'],
        failed_login_count: 0,
        last_login_at: '2024-12-19T08:30:00Z',
        recovery_email: 'backup@acme.com'
      } as SecuritySettings,
      compliance: {
        accepted_terms_at: '2024-01-15T09:00:00Z',
        privacy_consent_at: '2024-01-15T09:00:00Z',
        terms_version: '2.1',
        privacy_version: '1.3',
        marketing_opt_in: true
      } as ComplianceData,
      
      // Integrations & SSO
      external_identities: [
        {
          provider: 'google',
          subject: 'google_sub_12345',
          email: 'client@acme.com',
          verified: true,
          linked_at: '2024-01-15T09:30:00Z'
        }
      ] as ExternalIdentity[],
      groups: ['clients', 'manufacturing_sector'],
      
      // Lifecycle management
      source: 'signup' as UserSource,
      
      // Audit fields
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-12-19T08:30:00Z',
      created_by: 'system',
      updated_by: 'client_1'
    },
    {
      // Core fields
      id: 'dpo_1',
      email: 'dpo@collectpro.com',
      email_verified: true,
      password_version: 'argon2id-2025',
      status: 'ACTIVE' as UserStatus,
      
      // Identity & profile
      name: 'Jane Smith',
      username: 'jsmith_dpo',
      role: 'DPO',
      phone: '+44 20 7000 0002',
      phone_verified: true,
      avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      
      // Legacy fields
      department: 'Data Protection',
      isActive: true,
      permissions: ['view_all_data', 'gdpr_requests'],
      
      // Locale & preferences
      locale: 'en-GB',
      timezone: 'Europe/London',
      notification_prefs: {
        email: true,
        push: true,
        in_app: true,
        sms: false
      } as NotificationPrefs,
      marketing_opt_in: false,
      
      // Security & compliance
      security: {
        mfa_enabled: true,
        mfa_methods: ['TOTP', 'WebAuthn'],
        failed_login_count: 0,
        last_login_at: '2024-12-18T16:30:00Z',
        recovery_email: 'dpo.backup@collectpro.com'
      } as SecuritySettings,
      compliance: {
        accepted_terms_at: '2024-01-01T08:00:00Z',
        privacy_consent_at: '2024-01-01T08:00:00Z',
        terms_version: '2.1',
        privacy_version: '1.3',
        marketing_opt_in: false
      } as ComplianceData,
      
      // Integrations & SSO
      external_identities: [] as ExternalIdentity[],
      groups: ['data_protection', 'compliance_team'],
      
      // Lifecycle management
      source: 'admin_created' as UserSource,
      
      // Audit fields
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-12-18T16:30:00Z',
      created_by: 'system',
      updated_by: 'dpo_1'
    },
  ];

  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  addUser(user: User): void {
    this.users.push(user);
  }

  updateUser(id: string, updates: Partial<User>): void {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { 
        ...this.users[index], 
        ...updates, 
        updatedAt: new Date().toISOString(),
        updated_by: updates.updated_by || this.users[index].id
      };
    }
  }

  deleteUser(id: string): void {
    this.users = this.users.filter(u => u.id !== id);
  }
}

// Singleton mock store
const mockStore = new MockUsersStore();

// API Adapter Class
export class UsersApiAdapter {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async getUsers(): Promise<User[]> {
    await this.simulateDelay();
    return mockStore.getUsers();
  }

  async getUser(id: string): Promise<User | null> {
    await this.simulateDelay();
    return mockStore.getUserById(id) || null;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    await this.simulateDelay();
    
    const now = new Date().toISOString();
    const userId = `user_${Date.now()}`;
    
    const newUser: User = {
      // Core fields
      id: userId,
      email: userData.email || '',
      email_verified: false,
      password_version: 'argon2id-2025',
      status: userData.status || 'PENDING_VERIFICATION',
      
      // Identity & profile
      name: userData.name || '',
      username: userData.username,
      role: userData.role || 'CLIENT',
      phone: userData.phone,
      phone_verified: false,
      avatar_url: userData.avatar_url,
      
      // Legacy fields
      department: userData.department,
      isActive: true,
      permissions: userData.permissions || [],
      
      // Locale & preferences
      locale: userData.locale || 'en-GB',
      timezone: userData.timezone || 'Europe/London',
      notification_prefs: userData.notification_prefs || {
        email: true,
        push: false,
        in_app: true,
        sms: false
      },
      marketing_opt_in: userData.marketing_opt_in || false,
      
      // Security & compliance
      security: userData.security || {
        mfa_enabled: false,
        mfa_methods: [],
        failed_login_count: 0
      },
      compliance: userData.compliance || {
        marketing_opt_in: false
      },
      
      // Integrations & SSO
      external_identities: userData.external_identities || [],
      tenant_id: userData.tenant_id,
      groups: userData.groups || [],
      
      // Lifecycle management
      source: userData.source || 'signup',
      
      // Audit fields
      createdAt: now,
      updatedAt: now,
      created_by: userData.created_by || 'system',
      updated_by: userData.updated_by || 'system'
    };

    mockStore.addUser(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await this.simulateDelay();
    
    mockStore.updateUser(id, updates);
    const updatedUser = mockStore.getUserById(id);
    
    if (!updatedUser) {
      throw new Error(`User ${id} not found`);
    }
    
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await this.simulateDelay();
    mockStore.deleteUser(id);
  }

  private async simulateDelay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const usersApi = new UsersApiAdapter();