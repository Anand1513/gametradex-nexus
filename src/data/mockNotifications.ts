/**
 * Mock Notification Data
 * Sample notifications for testing the notification system
 */

import { Notification, NotificationType, NotificationPriority } from '@/types/notifications';

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'LISTING_APPROVED',
    title: 'Listing Approved',
    message: 'Listing "Premium Gaming Account - Level 100" has been approved by admin',
    targetUrl: '/admin/dashboard?tab=listings',
    relatedActionId: 'listing-123',
    isRead: false,
    isReadBy: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    priority: 'LOW',
    metadata: {
      listingTitle: 'Premium Gaming Account - Level 100',
      adminEmail: 'admin@gametradex.com',
      actionType: 'LISTING_APPROVE'
    }
  },
  {
    id: 'notif-2',
    type: 'PRICE_CHANGED',
    title: 'Price Updated',
    message: 'Price for listing "Rare Gaming Account" has been updated from ₹500-₹800 to ₹600-₹900',
    targetUrl: '/admin/dashboard?tab=listings',
    relatedActionId: 'listing-456',
    isRead: false,
    isReadBy: [],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    priority: 'MEDIUM',
    metadata: {
      listingTitle: 'Rare Gaming Account',
      oldPrice: { priceMin: 500, priceMax: 800 },
      newPrice: { priceMin: 600, priceMax: 900 },
      adminEmail: 'admin@gametradex.com'
    }
  },
  {
    id: 'notif-3',
    type: 'USER_ROLE_CHANGED',
    title: 'User Role Changed',
    message: 'User role changed from buyer to seller for John Doe (john@example.com)',
    targetUrl: '/admin/dashboard?tab=users',
    relatedActionId: 'user-789',
    isRead: true,
    isReadBy: ['admin-credential-user'],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    priority: 'MEDIUM',
    metadata: {
      userName: 'John Doe',
      userEmail: 'john@example.com',
      oldRole: 'buyer',
      newRole: 'seller',
      adminEmail: 'admin@gametradex.com'
    }
  },
  {
    id: 'notif-4',
    type: 'LISTING_DELETED',
    title: 'Listing Deleted',
    message: 'Listing "Suspicious Gaming Account" has been deleted by admin due to policy violation',
    targetUrl: '/admin/dashboard?tab=listings',
    relatedActionId: 'listing-999',
    isRead: false,
    isReadBy: [],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    priority: 'HIGH',
    metadata: {
      listingTitle: 'Suspicious Gaming Account',
      deletionReason: 'policy_violation',
      adminEmail: 'admin@gametradex.com'
    }
  },
  {
    id: 'notif-5',
    type: 'ESCROW_UPDATED',
    title: 'Escrow Updated',
    message: 'Escrow status updated to released for amount ₹1,200 (Transaction #ESC-456)',
    targetUrl: '/admin/dashboard?tab=escrows',
    relatedActionId: 'escrow-456',
    isRead: false,
    isReadBy: [],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    priority: 'MEDIUM',
    metadata: {
      escrowId: 'ESC-456',
      amount: 1200,
      oldStatus: 'pending',
      newStatus: 'released',
      adminEmail: 'admin@gametradex.com'
    }
  },
  {
    id: 'notif-6',
    type: 'SECURITY_ALERT',
    title: 'Security Alert',
    message: 'Multiple failed login attempts detected from IP 192.168.1.100',
    targetUrl: '/admin/dashboard?tab=system',
    relatedActionId: 'security-123',
    isRead: false,
    isReadBy: [],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    priority: 'URGENT',
    metadata: {
      alertType: 'failed_login_attempts',
      ipAddress: '192.168.1.100',
      attemptCount: 5,
      adminEmail: 'admin@gametradex.com'
    }
  },
  {
    id: 'notif-7',
    type: 'SYSTEM_ALERT',
    title: 'System Update',
    message: 'Database backup completed successfully. Backup size: 2.3GB',
    targetUrl: '/admin/dashboard?tab=system',
    relatedActionId: 'system-789',
    isRead: true,
    isReadBy: ['admin-credential-user'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    priority: 'LOW',
    metadata: {
      updateType: 'database_backup',
      backupSize: '2.3GB',
      status: 'completed',
      adminEmail: 'admin@gametradex.com'
    }
  },
  {
    id: 'notif-8',
    type: 'LISTING_REJECTED',
    title: 'Listing Rejected',
    message: 'Listing "Fake Gaming Account" has been rejected due to insufficient verification',
    targetUrl: '/admin/dashboard?tab=listings',
    relatedActionId: 'listing-321',
    isRead: false,
    isReadBy: [],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    priority: 'MEDIUM',
    metadata: {
      listingTitle: 'Fake Gaming Account',
      rejectionReason: 'insufficient_verification',
      adminEmail: 'admin@gametradex.com'
    }
  }
];

export const getMockNotificationStats = () => {
  const total = mockNotifications.length;
  const unread = mockNotifications.filter(n => !n.isRead).length;
  
  const byType = mockNotifications.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1;
    return acc;
  }, {} as Record<NotificationType, number>);
  
  const byPriority = mockNotifications.reduce((acc, notification) => {
    acc[notification.priority] = (acc[notification.priority] || 0) + 1;
    return acc;
  }, {} as Record<NotificationPriority, number>);
  
  const recent = mockNotifications
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  
  return {
    total,
    unread,
    byType,
    byPriority,
    recent
  };
};
