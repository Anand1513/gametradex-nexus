/**
 * Notification Helper Functions
 * Handles creating and managing notifications
 */

import { Notification } from '../models/Notification';
import { User } from '../models/User';

export interface CreateNotificationOptions {
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SECURITY';
  title: string;
  message: string;
  targetUrl?: string;
  relatedActionId?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  recipients: string[]; // Array of user IDs or 'all' for broadcast
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

/**
 * Create a new notification
 */
export const createNotification = async (options: CreateNotificationOptions) => {
  try {
    const notification = new Notification({
      type: options.type,
      title: options.title,
      message: options.message,
      targetUrl: options.targetUrl,
      relatedActionId: options.relatedActionId,
      priority: options.priority,
      isRead: false,
      isReadBy: [],
      metadata: options.metadata || {},
      expiresAt: options.expiresAt
    });

    const savedNotification = await notification.save();

    // If recipients is 'all', mark as broadcast
    if (options.recipients.includes('all')) {
      savedNotification.metadata = {
        ...savedNotification.metadata,
        isBroadcast: true,
        recipientCount: 'all'
      };
    } else {
      // Store specific recipients
      savedNotification.metadata = {
        ...savedNotification.metadata,
        recipients: options.recipients,
        recipientCount: options.recipients.length
      };
    }

    await savedNotification.save();

    console.log(`📢 Notification created: ${savedNotification.id} - ${options.title}`);
    return savedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create notification for admin actions
 */
export const createAdminActionNotification = async (
  actionType: string,
  adminEmail: string,
  targetType: string,
  targetId: string,
  details: Record<string, any>
) => {
  const notificationOptions: CreateNotificationOptions = {
    type: 'INFO',
    title: `Admin Action: ${actionType}`,
    message: `Admin ${adminEmail} performed ${actionType} on ${targetType} ${targetId}`,
    targetUrl: `/admin/activity`,
    relatedActionId: targetId,
    priority: 'MEDIUM',
    recipients: ['all'], // Broadcast to all admins
    metadata: {
      adminEmail,
      actionType,
      targetType,
      targetId,
      details
    }
  };

  return createNotification(notificationOptions);
};

/**
 * Create notification for user actions
 */
export const createUserActionNotification = async (
  actionType: string,
  userId: string,
  targetType: string,
  targetId: string,
  details: Record<string, any>
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const notificationOptions: CreateNotificationOptions = {
    type: 'INFO',
    title: `User Action: ${actionType}`,
    message: `User ${user.username} performed ${actionType} on ${targetType} ${targetId}`,
    targetUrl: `/admin/users/${userId}`,
    relatedActionId: targetId,
    priority: 'LOW',
    recipients: ['all'], // Broadcast to all admins
    metadata: {
      userId,
      username: user.username,
      actionType,
      targetType,
      targetId,
      details
    }
  };

  return createNotification(notificationOptions);
};

/**
 * Create security notification
 */
export const createSecurityNotification = async (
  securityEvent: string,
  details: Record<string, any>,
  priority: 'HIGH' | 'URGENT' = 'HIGH'
) => {
  const notificationOptions: CreateNotificationOptions = {
    type: 'SECURITY',
    title: `Security Alert: ${securityEvent}`,
    message: `Security event detected: ${securityEvent}`,
    targetUrl: `/admin/security`,
    priority,
    recipients: ['all'], // Broadcast to all admins
    metadata: {
      securityEvent,
      details,
      timestamp: new Date().toISOString()
    }
  };

  return createNotification(notificationOptions);
};

/**
 * Create listing notification
 */
export const createListingNotification = async (
  listingId: string,
  action: 'created' | 'approved' | 'rejected' | 'updated',
  userId: string,
  details: Record<string, any>
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const notificationOptions: CreateNotificationOptions = {
    type: action === 'approved' ? 'SUCCESS' : action === 'rejected' ? 'ERROR' : 'INFO',
    title: `Listing ${action.charAt(0).toUpperCase() + action.slice(1)}`,
    message: `Your listing has been ${action}`,
    targetUrl: `/listings/${listingId}`,
    relatedActionId: listingId,
    priority: 'MEDIUM',
    recipients: [userId],
    metadata: {
      listingId,
      action,
      userId,
      username: user.username,
      details
    }
  };

  return createNotification(notificationOptions);
};

/**
 * Create escrow notification
 */
export const createEscrowNotification = async (
  escrowId: string,
  action: 'created' | 'funded' | 'released' | 'disputed',
  userId: string,
  amount: number,
  details: Record<string, any>
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const notificationOptions: CreateNotificationOptions = {
    type: action === 'released' ? 'SUCCESS' : action === 'disputed' ? 'WARNING' : 'INFO',
    title: `Escrow ${action.charAt(0).toUpperCase() + action.slice(1)}`,
    message: `Escrow ${action} for amount $${amount}`,
    targetUrl: `/escrow/${escrowId}`,
    relatedActionId: escrowId,
    priority: 'HIGH',
    recipients: [userId],
    metadata: {
      escrowId,
      action,
      userId,
      username: user.username,
      amount,
      details
    }
  };

  return createNotification(notificationOptions);
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new Error('Notification not found');

    if (!notification.isReadBy.includes(userId)) {
      notification.isReadBy.push(userId);
      notification.isRead = notification.isReadBy.length > 0;
      await notification.save();
    }

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Get notifications for user
 */
export const getUserNotifications = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { 'metadata.recipients': userId },
        { 'metadata.isBroadcast': true }
      ],
      expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);

    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count for user
 */
export const getUnreadNotificationCount = async (userId: string) => {
  try {
    const count = await Notification.countDocuments({
      $or: [
        { 'metadata.recipients': userId },
        { 'metadata.isBroadcast': true }
      ],
      isReadBy: { $ne: userId },
      expiresAt: { $gt: new Date() }
    });

    return count;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    throw error;
  }
};
