// Professional Notifications API for B2B Debt Collection Platform
// Mock implementation with real-time updates and filtering

import { Notification, NotificationType } from '@/types';

// Extended mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'case_update',
    title: 'Case Status Updated',
    message: 'Case #12345 has moved to Legal Stage',
    relatedEntityId: '550e8400-e29b-41d4-a716-446655440001',
    relatedEntityType: 'case',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    actionUrl: '/cases/550e8400-e29b-41d4-a716-446655440001',
  },
  {
    id: '2',
    type: 'approval_required',
    title: 'Approval Required',
    message: 'Legal escalation approval needed for Case #12346',
    relatedEntityId: 'approval_001',
    relatedEntityType: 'approval',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actionUrl: '/approvals',
  },
  {
    id: '3',
    type: 'payment_due',
    title: 'Invoice Overdue',
    message: 'Invoice #INV-2024-001 is now overdue',
    relatedEntityId: 'inv_001',
    relatedEntityType: 'invoice',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    actionUrl: '/invoices',
  },
  {
    id: '4',
    type: 'document_uploaded',
    title: 'Document Uploaded',
    message: 'New document uploaded to Case #12347',
    relatedEntityId: '550e8400-e29b-41d4-a716-446655440002',
    relatedEntityType: 'case',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    actionUrl: '/cases/550e8400-e29b-41d4-a716-446655440002',
  },
  {
    id: '5',
    type: 'case_update',
    title: 'Payment Received',
    message: 'Payment of £2,500 received for Case #12348',
    relatedEntityId: '550e8400-e29b-41d4-a716-446655440003',
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
    relatedEntityId: 'approval_002',
    relatedEntityType: 'approval',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    actionUrl: '/approvals',
  },
  {
    id: '7',
    type: 'case_update',
    title: 'Case Assigned',
    message: 'Case #12350 has been assigned to you',
    relatedEntityId: '550e8400-e29b-41d4-a716-446655440004',
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
    relatedEntityId: 'inv_002',
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
    relatedEntityId: '550e8400-e29b-41d4-a716-446655440005',
    relatedEntityType: 'case',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
    actionUrl: '/cases/550e8400-e29b-41d4-a716-446655440005',
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 160).toISOString(),
  }
];

export class NotificationsApi {
  private notifications: Notification[] = [...MOCK_NOTIFICATIONS];
  private subscribers: ((notifications: Notification[]) => void)[] = [];

  // Get all notifications for current user
  async getNotifications(): Promise<Notification[]> {
    await this.simulateDelay();
    return [...this.notifications];
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    await this.simulateDelay();
    return this.notifications.filter(n => !n.readAt).length;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await this.simulateDelay();
    
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications[index] = {
        ...this.notifications[index],
        readAt: new Date().toISOString()
      };
      this.notifySubscribers();
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await this.simulateDelay();
    
    const now = new Date().toISOString();
    this.notifications = this.notifications.map(n => ({
      ...n,
      readAt: n.readAt || now
    }));
    this.notifySubscribers();
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    await this.simulateDelay();
    
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifySubscribers();
  }

  // Create new notification (for testing)
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    await this.simulateDelay();
    
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    this.notifications.unshift(newNotification);
    this.notifySubscribers();
    
    return newNotification;
  }

  // Subscribe to notification updates
  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback([...this.notifications]));
  }

  private async simulateDelay(ms: number = 200): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simulate real-time notifications (for demo purposes)
  startSimulation(): void {
    const notificationTypes: NotificationType[] = ['case_update', 'approval_required', 'payment_due', 'document_uploaded'];
    const messages = [
      'New case activity recorded',
      'Payment plan approval needed',
      'Document verification completed',
      'Case escalation requested',
      'Invoice payment received',
      'GDPR request submitted'
    ];

    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        this.createNotification({
          type,
          title: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          message,
          relatedEntityId: `entity_${Date.now()}`,
          relatedEntityType: 'case',
          actionUrl: '/dashboard'
        });
      }
    }, 30000); // Every 30 seconds
  }
}

// Export singleton instance
export const notificationsApi = new NotificationsApi();

// Start simulation in development
if (import.meta.env.DEV) {
  notificationsApi.startSimulation();
}