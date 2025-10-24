/**
 * Frontend Admin Activity Logging System
 * Records all admin actions (MongoDB integration moved to backend)
 */

import { createNotification } from '@/api/notifications';
import { NotificationType, NotificationPriority } from '@/types/notifications';

export interface AdminLogEntry {
  adminId: string;
  email: string;
  actionType: AdminActionType;
  targetType: TargetType;
  targetId?: string;
  details: Record<string, any>;
  ip: string;
  sessionId: string;
  timestamp: Date;
}

export type AdminActionType = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'LISTING_APPROVE'
  | 'LISTING_REJECT'
  | 'LISTING_DELETE'
  | 'PRICE_CHANGE'
  | 'USER_ROLE_CHANGE'
  | 'ESCROW_UPDATE'
  | 'PAYMENT_EDIT'
  | 'SECURITY_ACTION'
  | 'SYSTEM_UPDATE';

export type TargetType = 
  | 'SESSION'
  | 'LISTING'
  | 'USER'
  | 'ESCROW'
  | 'PAYMENT'
  | 'SECURITY'
  | 'SYSTEM';

/**
 * Get admin session details from localStorage
 */
const getAdminSessionDetails = () => {
  try {
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      const session = JSON.parse(adminSession);
      return {
        adminId: session.adminId || 'admin-123',
        email: session.email || 'admin@gametradex.com',
        sessionId: session.sessionId || `session_${Date.now()}`
      };
    }
  } catch (error) {
    console.error('Error getting admin session details:', error);
  }
  
  return {
    adminId: 'admin-123',
    email: 'admin@gametradex.com',
    sessionId: `session_${Date.now()}`
  };
};

/**
 * Get client IP (mock for frontend)
 */
const getClientIP = (): string => {
  return '127.0.0.1'; // Mock IP for frontend
};

/**
 * Get session ID
 */
const getSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Log admin action (frontend version - sends to backend API)
 */
export const logAdminAction = async (params: {
  actionType: AdminActionType;
  targetType: TargetType;
  targetId?: string;
  details?: Record<string, any>;
}): Promise<AdminLogEntry | null> => {
  try {
    const admin = getAdminSessionDetails();
    const sessionId = admin.sessionId;
    const ip = getClientIP();
    
    const logEntry: AdminLogEntry = {
      adminId: admin.adminId,
      email: admin.email,
      actionType: params.actionType,
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details || {},
      ip,
      sessionId,
      timestamp: new Date()
    };

    // Send to backend API (optional - frontend works without backend)
    try {
      const response = await fetch('http://localhost:3001/api/admin/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry)
      });

      if (!response.ok) {
        console.warn('Failed to log admin action to backend:', response.statusText);
      }
    } catch (error) {
      console.warn('Error sending admin action to backend (backend not available):', error);
    }

    // Create notification for the action
    await createAdminNotification(logEntry);

    console.log('Admin action logged (frontend):', logEntry);
    return logEntry;

  } catch (error) {
    console.error('Error logging admin action:', error);
    return null;
  }
};

/**
 * Create admin notification
 */
const createAdminNotification = async (logEntry: AdminLogEntry) => {
  try {
    let notificationType: NotificationType = 'INFO';
    let priority: NotificationPriority = 'MEDIUM';
    let message = '';
    let targetUrl = '';

    switch (logEntry.actionType) {
      case 'LOGIN':
        notificationType = 'SUCCESS';
        priority = 'HIGH';
        message = `Admin ${logEntry.email} logged in`;
        targetUrl = '/admin/dashboard';
        break;
      case 'LOGOUT':
        notificationType = 'INFO';
        priority = 'MEDIUM';
        message = `Admin ${logEntry.email} logged out`;
        targetUrl = '/admin/login';
        break;
      case 'LISTING_APPROVE':
        notificationType = 'SUCCESS';
        priority = 'HIGH';
        message = `Listing approved by ${logEntry.email}`;
        targetUrl = `/admin/dashboard?tab=listings`;
        break;
      case 'LISTING_REJECT':
        notificationType = 'WARNING';
        priority = 'HIGH';
        message = `Listing rejected by ${logEntry.email}`;
        targetUrl = `/admin/dashboard?tab=listings`;
        break;
      case 'LISTING_DELETE':
        notificationType = 'WARNING';
        priority = 'HIGH';
        message = `Listing deleted by ${logEntry.email}`;
        targetUrl = `/admin/dashboard?tab=listings`;
        break;
      case 'PRICE_CHANGE':
        notificationType = 'INFO';
        priority = 'MEDIUM';
        message = `Price updated by ${logEntry.email}`;
        targetUrl = `/admin/dashboard?tab=listings`;
        break;
      case 'USER_ROLE_CHANGE':
        notificationType = 'INFO';
        priority = 'HIGH';
        message = `User role changed by ${logEntry.email}`;
        targetUrl = `/admin/dashboard?tab=users`;
        break;
      case 'ESCROW_UPDATE':
        notificationType = 'INFO';
        priority = 'HIGH';
        message = `Escrow updated by ${logEntry.email}`;
        targetUrl = `/admin/dashboard?tab=escrows`;
        break;
      case 'PAYMENT_EDIT':
        notificationType = 'INFO';
        priority = 'HIGH';
        message = `Payment edited by ${logEntry.email}`;
        targetUrl = `/admin/dashboard?tab=payments`;
        break;
      case 'SECURITY_ACTION':
        notificationType = 'WARNING';
        priority = 'HIGH';
        message = `Security action by ${logEntry.email}`;
        targetUrl = '/admin/dashboard?tab=security';
        break;
      case 'SYSTEM_UPDATE':
        notificationType = 'INFO';
        priority = 'MEDIUM';
        message = `System updated by ${logEntry.email}`;
        targetUrl = '/admin/dashboard?tab=system';
        break;
    }

    await createNotification({
      type: notificationType,
      priority,
      title: 'Admin Action',
      message,
      targetUrl,
      relatedActionId: logEntry.sessionId,
      metadata: {
        adminId: logEntry.adminId,
        adminEmail: logEntry.email,
        actionType: logEntry.actionType,
        targetType: logEntry.targetType,
        targetId: logEntry.targetId,
        timestamp: logEntry.timestamp.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating admin notification:', error);
  }
};

/**
 * Log admin login
 */
export const logAdminLogin = async (loginMethod: 'key' | 'credentials' = 'credentials'): Promise<AdminLogEntry | null> => {
  return logAdminAction({
    actionType: 'LOGIN',
    targetType: 'SESSION',
    details: {
      loginMethod,
      loginTime: new Date().toISOString()
    }
  });
};

/**
 * Log admin logout
 */
export const logAdminLogout = async (sessionDuration?: number): Promise<AdminLogEntry | null> => {
  return logAdminAction({
    actionType: 'LOGOUT',
    targetType: 'SESSION',
    details: {
      logoutTime: new Date().toISOString(),
      sessionDuration: sessionDuration || 0
    }
  });
};

/**
 * Log listing approval
 */
export const logListingApproval = async (
  listingId: string,
  action: 'approve' | 'reject',
  listingDetails?: Record<string, any>
): Promise<AdminLogEntry | null> => {
  return logAdminAction({
    actionType: action === 'approve' ? 'LISTING_APPROVE' : 'LISTING_REJECT',
    targetType: 'LISTING',
    targetId: listingId,
    details: {
      action,
      listingDetails,
      approvalTime: new Date().toISOString()
    }
  });
};

/**
 * Log listing deletion
 */
export const logListingDeletion = async (
  listingId: string,
  listingDetails?: Record<string, any>
): Promise<AdminLogEntry | null> => {
  return logAdminAction({
    actionType: 'LISTING_DELETE',
    targetType: 'LISTING',
    targetId: listingId,
    details: {
      listingDetails,
      deletionTime: new Date().toISOString(),
      deletionReason: 'admin_action'
    }
  });
};

/**
 * Log price change
 */
export const logPriceChange = async (
  listingId: string,
  oldPrice: Record<string, any>,
  newPrice: Record<string, any>,
  listingDetails?: Record<string, any>
): Promise<AdminLogEntry | null> => {
  return logAdminAction({
    actionType: 'PRICE_CHANGE',
    targetType: 'LISTING',
    targetId: listingId,
    details: {
      oldPrice,
      newPrice,
      listingDetails,
      changeTime: new Date().toISOString(),
      priceChangeDetails: {
        oldPriceMin: oldPrice.priceMin,
        oldPriceMax: oldPrice.priceMax,
        newPriceMin: newPrice.priceMin,
        newPriceMax: newPrice.priceMax,
        priceTypeChanged: oldPrice.isFixed !== newPrice.isFixed,
        negotiableChanged: oldPrice.negotiable !== newPrice.negotiable
      }
    }
  });
};

/**
 * Log user role change
 */
export const logUserRoleChange = async (
  userId: string,
  oldRole: string,
  newRole: string,
  userDetails?: Record<string, any>
): Promise<AdminLogEntry | null> => {
  return logAdminAction({
    actionType: 'USER_ROLE_CHANGE',
    targetType: 'USER',
    targetId: userId,
    details: {
      oldRole,
      newRole,
      userDetails,
      changeTime: new Date().toISOString(),
      changeReason: 'admin_manual_change'
    }
  });
};

/**
 * Log escrow update
 */
export const logEscrowUpdate = async (
  escrowId: string,
  action: 'release' | 'refund',
  escrowDetails?: Record<string, any>
): Promise<AdminLogEntry | null> => {
  return logAdminAction({
    actionType: 'ESCROW_UPDATE',
    targetType: 'ESCROW',
    targetId: escrowId,
    details: {
      action,
      escrowDetails,
      updateTime: new Date().toISOString(),
      actionReason: 'admin_manual_action'
    }
  });
};

/**
 * Log payment edit
 */
export const logPaymentEdit = async (
  paymentId: string,
  oldPayment: Record<string, any>,
  newPayment: Record<string, any>,
  paymentDetails?: Record<string, any>
): Promise<AdminLogEntry | null> => {
  return logAdminAction({
    actionType: 'PAYMENT_EDIT',
    targetType: 'PAYMENT',
    targetId: paymentId,
    details: {
      oldPayment,
      newPayment,
      paymentDetails,
      editTime: new Date().toISOString(),
      editReason: 'admin_manual_edit'
    }
  });
};

/**
 * Log security action
 */
export const logSecurityAction = async (
  securityAction: string,
  details?: Record<string, any>
): Promise<AdminLogEntry | null> => {
  return logAdminAction({
    actionType: 'SECURITY_ACTION',
    targetType: 'SECURITY',
    details: {
      securityAction,
      ...details,
      securityTime: new Date().toISOString()
    }
  });
};

/**
 * Log system update
 */
export const logSystemUpdate = async (
  updateType: string,
  details?: Record<string, any>
): Promise<AdminLogEntry | null> => {
  return logAdminAction({
    actionType: 'SYSTEM_UPDATE',
    targetType: 'SYSTEM',
    details: {
      updateType,
      ...details,
      updateTime: new Date().toISOString()
    }
  });
};

/**
 * Log user action
 */
export const logUserAction = async (
  userId: string,
  action: string,
  userDetails?: Record<string, any>
): Promise<AdminLogEntry | null> => {
  return logAdminAction({
    actionType: 'USER_ACTION',
    targetType: 'USER',
    targetId: userId,
    details: {
      action,
      userDetails,
      actionTime: new Date().toISOString()
    }
  });
};

/**
 * Log listing edit
 */
export const logListingEdit = async (
  listingId: string,
  editType: string,
  listingDetails?: Record<string, any>
): Promise<AdminLogEntry | null> => {
  return logAdminAction({
    actionType: 'LISTING_EDIT',
    targetType: 'LISTING',
    targetId: listingId,
    details: {
      editType,
      listingDetails,
      editTime: new Date().toISOString()
    }
  });
};

export default {
  logAdminAction,
  logAdminLogin,
  logAdminLogout,
  logListingApproval,
  logListingDeletion,
  logPriceChange,
  logUserRoleChange,
  logEscrowUpdate,
  logPaymentEdit,
  logSecurityAction,
  logSystemUpdate,
  logUserAction,
  logListingEdit
};