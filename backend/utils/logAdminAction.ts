/**
 * Admin Action Logging Helper
 * Centralized function to log admin actions to MongoDB
 */

import { Request } from 'express';
import { AdminAction } from '../models/AdminAction';

export interface AdminActionParams {
  req: Request;
  admin: {
    id: string;
    email: string;
  };
  sessionId: string;
  actionType: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, any>;
}

export interface AdminActionLogEntry {
  adminId: string;
  adminEmail: string;
  sessionId: string;
  actionType: string;
  targetType: string;
  targetId?: string;
  details: Record<string, any>;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

/**
 * Extract IP address from request
 */
const getClientIP = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection as any)?.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1'
  );
};

/**
 * Extract User Agent from request
 */
const getUserAgent = (req: Request): string => {
  return req.headers['user-agent'] || 'Unknown';
};

/**
 * Log admin action to MongoDB
 * @param params - Admin action parameters
 * @returns Promise<AdminActionLogEntry | null>
 */
export const logAdminAction = async (params: AdminActionParams): Promise<AdminActionLogEntry | null> => {
  try {
    const {
      req,
      admin,
      sessionId,
      actionType,
      targetType,
      targetId,
      details = {}
    } = params;

    // Extract request information
    const ip = getClientIP(req);
    const userAgent = getUserAgent(req);

    // Create admin action document
    const adminActionData = {
      adminId: admin.id,
      adminEmail: admin.email,
      sessionId,
      actionType,
      targetType,
      targetId,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
        userAgent,
        ip
      },
      ip,
      userAgent,
      createdAt: new Date()
    };

    // Save to MongoDB
    const adminAction = new AdminAction(adminActionData);
    const savedAction = await adminAction.save();

    console.log('Admin action logged:', {
      id: savedAction._id,
      adminId: admin.id,
      actionType,
      targetType,
      targetId,
      timestamp: savedAction.createdAt
    });

    return {
      adminId: savedAction.adminId,
      adminEmail: savedAction.adminEmail,
      sessionId: savedAction.sessionId,
      actionType: savedAction.actionType,
      targetType: savedAction.targetType,
      targetId: savedAction.targetId,
      details: savedAction.details,
      ip: savedAction.ip,
      userAgent: savedAction.userAgent,
      createdAt: savedAction.createdAt
    };

  } catch (error) {
    console.error('Error logging admin action:', error);
    
    // Log to console as fallback
    console.log('Admin Action (Fallback):', {
      adminId: params.admin.id,
      adminEmail: params.admin.email,
      sessionId: params.sessionId,
      actionType: params.actionType,
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details,
      ip: getClientIP(params.req),
      userAgent: getUserAgent(params.req),
      timestamp: new Date().toISOString()
    });
    
    return null;
  }
};

/**
 * Log admin login action
 */
export const logAdminLogin = async (
  req: Request,
  admin: { id: string; email: string },
  sessionId: string,
  loginMethod: 'key' | 'credentials' = 'credentials'
): Promise<AdminActionLogEntry | null> => {
  return logAdminAction({
    req,
    admin,
    sessionId,
    actionType: 'LOGIN',
    targetType: 'SESSION',
    details: {
      loginMethod,
      loginTime: new Date().toISOString()
    }
  });
};

/**
 * Log admin logout action
 */
export const logAdminLogout = async (
  req: Request,
  admin: { id: string; email: string },
  sessionId: string,
  sessionDuration?: number
): Promise<AdminActionLogEntry | null> => {
  return logAdminAction({
    req,
    admin,
    sessionId,
    actionType: 'LOGOUT',
    targetType: 'SESSION',
    details: {
      logoutTime: new Date().toISOString(),
      sessionDuration: sessionDuration || 0
    }
  });
};

/**
 * Log listing approval action
 */
export const logListingApproval = async (
  req: Request,
  admin: { id: string; email: string },
  sessionId: string,
  listingId: string,
  action: 'approve' | 'reject',
  listingDetails?: Record<string, any>
): Promise<AdminActionLogEntry | null> => {
  return logAdminAction({
    req,
    admin,
    sessionId,
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
 * Log listing deletion action
 */
export const logListingDeletion = async (
  req: Request,
  admin: { id: string; email: string },
  sessionId: string,
  listingId: string,
  listingDetails?: Record<string, any>
): Promise<AdminActionLogEntry | null> => {
  return logAdminAction({
    req,
    admin,
    sessionId,
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
 * Log price change action
 */
export const logPriceChange = async (
  req: Request,
  admin: { id: string; email: string },
  sessionId: string,
  listingId: string,
  oldPrice: Record<string, any>,
  newPrice: Record<string, any>,
  listingDetails?: Record<string, any>
): Promise<AdminActionLogEntry | null> => {
  return logAdminAction({
    req,
    admin,
    sessionId,
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
 * Log user role change action
 */
export const logUserRoleChange = async (
  req: Request,
  admin: { id: string; email: string },
  sessionId: string,
  userId: string,
  oldRole: string,
  newRole: string,
  userDetails?: Record<string, any>
): Promise<AdminActionLogEntry | null> => {
  return logAdminAction({
    req,
    admin,
    sessionId,
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
 * Log escrow update action
 */
export const logEscrowUpdate = async (
  req: Request,
  admin: { id: string; email: string },
  sessionId: string,
  escrowId: string,
  action: 'release' | 'refund',
  escrowDetails?: Record<string, any>
): Promise<AdminActionLogEntry | null> => {
  return logAdminAction({
    req,
    admin,
    sessionId,
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
 * Log security action
 */
export const logSecurityAction = async (
  req: Request,
  admin: { id: string; email: string },
  sessionId: string,
  securityAction: string,
  details?: Record<string, any>
): Promise<AdminActionLogEntry | null> => {
  return logAdminAction({
    req,
    admin,
    sessionId,
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
 * Log system update action
 */
export const logSystemUpdate = async (
  req: Request,
  admin: { id: string; email: string },
  sessionId: string,
  updateType: string,
  details?: Record<string, any>
): Promise<AdminActionLogEntry | null> => {
  return logAdminAction({
    req,
    admin,
    sessionId,
    actionType: 'SYSTEM_UPDATE',
    targetType: 'SYSTEM',
    details: {
      updateType,
      ...details,
      updateTime: new Date().toISOString()
    }
  });
};

export default logAdminAction;
