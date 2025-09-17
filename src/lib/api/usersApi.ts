// Professional Users API Adapter for B2B Debt Collection Platform
// Mock implementation with .NET-ready contracts and PascalCase DTOs

import { User } from '@/types';

// Mock Data Store for Users
class MockUsersStore {
  private users: User[] = [
    {
      id: 'admin_1',
      email: 'admin@collectpro.com',
      name: 'John Administrator',
      role: 'ADMIN',
      department: 'Administration',
      phone: '+44 20 7000 0001',
      isActive: true,
      lastLoginAt: '2024-12-19T07:45:00Z',
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-12-19T07:45:00Z',
      permissions: ['full_access'],
    },
    {
      id: 'agent_1',
      email: 'sarah.johnson@collectpro.com',
      name: 'Sarah Johnson',
      role: 'AGENT',
      department: 'Collections Team A',
      phone: '+44 20 7123 4567',
      isActive: true,
      lastLoginAt: '2024-12-19T09:15:00Z',
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-12-19T09:15:00Z',
      permissions: ['view_cases', 'update_cases', 'send_messages'],
    },
    {
      id: 'client_1',
      email: 'client@acme.com',
      name: 'ACME Manufacturing Ltd',
      role: 'CLIENT',
      clientId: 'client_1',
      department: 'Finance',
      phone: '+44 121 234 5678',
      isActive: true,
      lastLoginAt: '2024-12-19T08:30:00Z',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-12-19T08:30:00Z',
      permissions: ['view_cases', 'create_cases'],
    },
    {
      id: 'dpo_1',
      email: 'dpo@collectpro.com',
      name: 'Jane Smith',
      role: 'DPO',
      department: 'Data Protection',
      phone: '+44 20 7000 0002',
      isActive: true,
      lastLoginAt: '2024-12-18T16:30:00Z',
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-12-18T16:30:00Z',
      permissions: ['view_all_data', 'gdpr_requests'],
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
      this.users[index] = { ...this.users[index], ...updates, updatedAt: new Date().toISOString() };
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
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: userData.email || '',
      name: userData.name || '',
      role: userData.role || 'CLIENT',
      department: userData.department,
      phone: userData.phone,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: userData.permissions || [],
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