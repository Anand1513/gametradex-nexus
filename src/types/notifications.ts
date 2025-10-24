/**
 * Notification Types and Interfaces
 */

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  targetUrl: string;
  relatedActionId?: string;
  isRead: boolean;
  isReadBy: string[]; // Array of admin IDs who have read this notification
  createdAt: Date;
  updatedAt: Date;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'LISTING_DELETED'
  | 'PRICE_CHANGED'
  | 'USER_ROLE_CHANGED'
  | 'ESCROW_UPDATED'
  | 'PAYMENT_PROCESSED'
  | 'SYSTEM_ALERT'
  | 'SECURITY_ALERT'
  | 'ADMIN_ACTION'
  | 'USER_REPORT'
  | 'LISTING_REPORT';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  recent: Notification[];
}
