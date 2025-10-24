/**
 * Notifications API
 * Handles notification management and mark-as-read functionality
 */

import { Notification, NotificationFilters, NotificationStats } from '@/types/notifications';
import { mockNotifications, getMockNotificationStats } from '@/data/mockNotifications';

/**
 * Get admin session details for API calls
 */
const getAdminSessionDetails = (): { adminId: string; email: string; sessionId: string } => {
  const adminSession = localStorage.getItem('adminSession');
  const authToken = localStorage.getItem('dummyAuthToken');
  
  let adminId = 'unknown';
  let email = 'unknown';
  let sessionId = 'unknown';
  
  if (adminSession) {
    try {
      const session = JSON.parse(adminSession);
      email = session.email || 'unknown';
      sessionId = session.sessionId || 'unknown';
    } catch {
      // Handle parse error
    }
  }
  
  if (authToken) {
    try {
      const token = JSON.parse(authToken);
      adminId = token.uid || 'unknown';
      email = token.email || email;
    } catch {
      // Handle parse error
    }
  }
  
  return { adminId, email, sessionId };
};

/**
 * Get all notifications with filters
 */
export const getNotifications = async (filters: NotificationFilters = {}): Promise<Notification[]> => {
  try {
    // Try backend API first
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.isRead !== undefined) queryParams.append('isRead', filters.isRead.toString());
    if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.offset) queryParams.append('offset', filters.offset.toString());
    
    const response = await fetch(`http://localhost:3001/api/notifications?${queryParams.toString()}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.data.notifications || [];
    }
    
    // Fallback to mock data
    console.warn('Backend not available, using mock data');
    let filteredNotifications = [...mockNotifications];
    
    // Apply filters
    if (filters.type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
    }
    
    if (filters.priority) {
      filteredNotifications = filteredNotifications.filter(n => n.priority === filters.priority);
    }
    
    if (filters.isRead !== undefined) {
      filteredNotifications = filteredNotifications.filter(n => n.isRead === filters.isRead);
    }
    
    if (filters.startDate) {
      filteredNotifications = filteredNotifications.filter(n => n.createdAt >= filters.startDate!);
    }
    
    if (filters.endDate) {
      filteredNotifications = filteredNotifications.filter(n => n.createdAt <= filters.endDate!);
    }
    
    // Apply limit and offset
    if (filters.offset) {
      filteredNotifications = filteredNotifications.slice(filters.offset);
    }
    
    if (filters.limit) {
      filteredNotifications = filteredNotifications.slice(0, filters.limit);
    }
    
    // Sort by creation date (newest first)
    filteredNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return filteredNotifications;
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    // Use mock data
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;
    return unreadCount;
    
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { adminId } = getAdminSessionDetails();
    
    // Try backend API first
    const response = await fetch(`http://localhost:3001/api/notifications/${notificationId}/mark-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-id': adminId
      },
      body: JSON.stringify({
        userId: adminId
      })
    });
    
    if (response.ok) {
      return true;
    }
    
    // Fallback to mock behavior
    console.warn('Backend not available, simulating mark as read');
    console.log(`Marking notification ${notificationId} as read for admin ${adminId}`);
    return true;
    
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Mark multiple notifications as read
 */
export const markMultipleNotificationsAsRead = async (notificationIds: string[]): Promise<boolean> => {
  try {
    const { adminId } = getAdminSessionDetails();
    
    // Try backend API first
    const response = await fetch('http://localhost:3001/api/notifications/mark-read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-id': adminId
      },
      body: JSON.stringify({
        notificationIds,
        userId: adminId
      })
    });
    
    if (response.ok) {
      return true;
    }
    
    // Fallback to mock behavior
    console.warn('Backend not available, simulating mark multiple as read');
    console.log(`Marking ${notificationIds.length} notifications as read for admin ${adminId}`);
    return true;
    
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const { adminId } = getAdminSessionDetails();
    
    // Try backend API first
    const response = await fetch('http://localhost:3001/api/notifications/mark-all-read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-id': adminId
      },
      body: JSON.stringify({
        userId: adminId
      })
    });
    
    if (response.ok) {
      return true;
    }
    
    // Fallback to mock behavior
    console.warn('Backend not available, simulating mark all as read');
    console.log(`Marking all notifications as read for admin ${adminId}`);
    return true;
    
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

/**
 * Get notification statistics
 */
export const getNotificationStats = async (): Promise<NotificationStats> => {
  try {
    // Use mock data
    return getMockNotificationStats();
    
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return {
      total: 0,
      unread: 0,
      byType: {},
      byPriority: {},
      recent: []
    };
  }
};

/**
 * Create a new notification (for admin actions)
 */
export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification | null> => {
  try {
    const { adminId } = getAdminSessionDetails();
    
    // For mock data, we'll simulate creating a notification
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Created notification:', newNotification);
    
    // In a real app, this would save to the database
    // For now, we'll just return the notification
    return newNotification;
    
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const { adminId } = getAdminSessionDetails();
    
    // For mock data, we'll simulate the deletion
    console.log(`Deleting notification ${notificationId} for admin ${adminId}`);
    
    // In a real app, this would delete from the database
    // For now, we'll just return true to simulate success
    return true;
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};
