// Custom hook for notifications management
import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '@/lib/api/notificationsApi';
import { Notification } from '@/types';
import { toast } from 'sonner';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(message);
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.readAt).length;
  }, [notifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, readAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      const now = new Date().toISOString();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, readAt: now }))
      );
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all notifications as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  }, []);

  // Create notification (for testing)
  const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const newNotification = await notificationsApi.createNotification(notification);
      setNotifications(prev => [newNotification, ...prev]);
      return newNotification;
    } catch (err) {
      toast.error('Failed to create notification');
      throw err;
    }
  }, []);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = notificationsApi.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    return unsubscribe;
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount: getUnreadCount(),
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refreshNotifications: loadNotifications
  };
}