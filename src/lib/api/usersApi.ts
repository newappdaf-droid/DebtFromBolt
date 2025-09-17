// Professional Users API for B2B Debt Collection Platform
// User management operations with role-based access control

import { User, UserRole } from '@/types';

// Mock users data store
const mockUsers: User[] = [
  // Clients
  {
    id: 'client_1',
    email: 'client@acmemanufacturing.com',
    name: 'ACME Manufacturing Ltd',
    role: 'CLIENT',
    clientId: 'client_1',
    department: 'Finance',
    phone: '+44 121 234 5678',
    isActive: true,
    lastLoginAt: '2024-12-19T08:30:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-12-19T08:30:00Z',
    permissions: ['view_cases', 'create_cases', 'view_invoices'],
  },
  {
    id: 'client_2',
    email: 'finance@sterlingfinancial.com',
    name: 'Sterling Financial Services',
    role: 'CLIENT',
    clientId: 'client_2',
    department: 'Accounts Receivable',
    phone: '+44 20 7890 1234',
    isActive: true,
    lastLoginAt: '2024-12-18T16:45:00Z',
    createdAt: '2024-02-10T11:30:00Z',
    updatedAt: '2024-12-18T16:45:00Z',
    permissions: ['view_cases', 'create_cases', 'view_invoices'],
  },
  
  // Agents
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
    permissions: ['view_cases', 'update_cases', 'send_messages', 'create_approvals'],
  },
  {
    id: 'agent_2',
    email: 'michael.chen@collectpro.com',
    name: 'Michael Chen',
    role: 'AGENT',
    department: 'Collections Team B',
    phone: '+44 161 987 6543',
    isActive: true,
    lastLoginAt: '2024-12-19T08:45:00Z',
    createdAt: '2024-02-15T09:30:00Z',
    updatedAt: '2024-12-19T08:45:00Z',
    permissions: ['view_cases', 'update_cases', 'send_messages', 'create_approvals'],
  },
  
  // Admins
  {
    id: 'admin_1',
    email: 'john.admin@collectpro.com',
    name: 'John Administrator',
    role: 'ADMIN',
    department: 'System Administration',
    phone: '+44 20 7000 0001',
    isActive: true,
    lastLoginAt: '2024-12-19T07:45:00Z',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-12-19T07:45:00Z',
    permissions: ['full_access'],
  },
  
  // DPOs
  {
    id: 'dpo_1',
    email: 'jane.smith@collectpro.com',
    name: 'Jane Smith',
    role: 'DPO',
    department: 'Data Protection',
    phone: '+44 20 7000 0002',
    isActive: true,
    lastLoginAt: '2024-12-18T16:30:00Z',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-12-18T16:30:00Z',
    permissions: ['view_all_data', 'gdpr_requests', 'data_erasure', 'retention_policy'],
  },
];

export class UsersApi {
  private users: User[] = [...mockUsers];

  // Get all users
  async getUsers(): Promise<User[]> {
    await this.simulateDelay();
    return [...this.users];
  }

  // Get user by ID
  async getUser(id: string): Promise<User | null> {
    await this.simulateDelay();
    return this.users.find(user => user.id === id) || null;
  }

  // Create new user
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    await this.simulateDelay();
    
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    return newUser;
  }

  // Update user
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await this.simulateDelay();
    
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await this.simulateDelay();
    
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }

    this.users.splice(userIndex, 1);
  }

  // Toggle user active status
  async toggleUserStatus(id: string): Promise<User> {
    await this.simulateDelay();
    
    const user = this.users.find(user => user.id === id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updatedUser = {
      ...user,
      isActive: !user.isActive,
      updatedAt: new Date().toISOString(),
    };

    const userIndex = this.users.findIndex(user => user.id === id);
    this.users[userIndex] = updatedUser;
    
    return updatedUser;
  }

  // Get users by role
  async getUsersByRole(role: UserRole): Promise<User[]> {
    await this.simulateDelay();
    return this.users.filter(user => user.role === role);
  }

  // Search users
  async searchUsers(query: string): Promise<User[]> {
    await this.simulateDelay();
    
    if (!query.trim()) {
      return [...this.users];
    }

    const searchTerm = query.toLowerCase();
    return this.users.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.department && user.department.toLowerCase().includes(searchTerm))
    );
  }

  // Helper method to simulate API delay
  private async simulateDelay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const usersApi = new UsersApi();