/**
 * Admin Logging Usage Examples
 * Demonstrates how to use the admin action logging system
 */

import { Request } from 'express';
import { 
  logAdminAction, 
  logAdminLogin, 
  logAdminLogout,
  logListingApproval,
  logListingDeletion,
  logPriceChange,
  logUserRoleChange,
  logEscrowUpdate,
  logSecurityAction,
  logSystemUpdate
} from '@/utils/logAdminAction';

/**
 * Example: Log admin login
 */
export const exampleAdminLogin = async (req: Request) => {
  const admin = {
    id: 'admin-123',
    email: 'admin@gametradex.com'
  };
  const sessionId = 'session-456';

  await logAdminLogin(req, admin, sessionId, 'credentials');
};

/**
 * Example: Log admin logout
 */
export const exampleAdminLogout = async (req: Request) => {
  const admin = {
    id: 'admin-123',
    email: 'admin@gametradex.com'
  };
  const sessionId = 'session-456';
  const sessionDuration = 3600000; // 1 hour in milliseconds

  await logAdminLogout(req, admin, sessionId, sessionDuration);
};

/**
 * Example: Log listing approval
 */
export const exampleListingApproval = async (req: Request) => {
  const admin = {
    id: 'admin-123',
    email: 'admin@gametradex.com'
  };
  const sessionId = 'session-456';
  const listingId = 'listing-789';
  const action = 'approve';
  const listingDetails = {
    title: 'Premium Gaming Account',
    price: 500,
    sellerId: 'seller-123'
  };

  await logListingApproval(req, admin, sessionId, listingId, action, listingDetails);
};

/**
 * Example: Log listing deletion
 */
export const exampleListingDeletion = async (req: Request) => {
  const admin = {
    id: 'admin-123',
    email: 'admin@gametradex.com'
  };
  const sessionId = 'session-456';
  const listingId = 'listing-789';
  const listingDetails = {
    title: 'Suspicious Gaming Account',
    reason: 'policy_violation',
    sellerId: 'seller-456'
  };

  await logListingDeletion(req, admin, sessionId, listingId, listingDetails);
};

/**
 * Example: Log price change
 */
export const examplePriceChange = async (req: Request) => {
  const admin = {
    id: 'admin-123',
    email: 'admin@gametradex.com'
  };
  const sessionId = 'session-456';
  const listingId = 'listing-789';
  const oldPrice = {
    priceMin: 100,
    priceMax: 200,
    isFixed: false,
    negotiable: true
  };
  const newPrice = {
    priceMin: 150,
    priceMax: 250,
    isFixed: false,
    negotiable: true
  };
  const listingDetails = {
    title: 'Rare Gaming Account',
    sellerId: 'seller-123'
  };

  await logPriceChange(req, admin, sessionId, listingId, oldPrice, newPrice, listingDetails);
};

/**
 * Example: Log user role change
 */
export const exampleUserRoleChange = async (req: Request) => {
  const admin = {
    id: 'admin-123',
    email: 'admin@gametradex.com'
  };
  const sessionId = 'session-456';
  const userId = 'user-789';
  const oldRole = 'buyer';
  const newRole = 'seller';
  const userDetails = {
    name: 'John Doe',
    email: 'john@example.com'
  };

  await logUserRoleChange(req, admin, sessionId, userId, oldRole, newRole, userDetails);
};

/**
 * Example: Log escrow update
 */
export const exampleEscrowUpdate = async (req: Request) => {
  const admin = {
    id: 'admin-123',
    email: 'admin@gametradex.com'
  };
  const sessionId = 'session-456';
  const escrowId = 'escrow-123';
  const action = 'release';
  const escrowDetails = {
    amount: 1200,
    buyerId: 'buyer-456',
    sellerId: 'seller-789',
    listingId: 'listing-123'
  };

  await logEscrowUpdate(req, admin, sessionId, escrowId, action, escrowDetails);
};

/**
 * Example: Log security action
 */
export const exampleSecurityAction = async (req: Request) => {
  const admin = {
    id: 'admin-123',
    email: 'admin@gametradex.com'
  };
  const sessionId = 'session-456';
  const securityAction = 'failed_login_attempts';
  const details = {
    ip: '192.168.1.100',
    attemptCount: 5,
    blocked: true
  };

  await logSecurityAction(req, admin, sessionId, securityAction, details);
};

/**
 * Example: Log system update
 */
export const exampleSystemUpdate = async (req: Request) => {
  const admin = {
    id: 'admin-123',
    email: 'admin@gametradex.com'
  };
  const sessionId = 'session-456';
  const updateType = 'database_backup';
  const details = {
    backupSize: '2.3GB',
    status: 'completed',
    duration: 1800000 // 30 minutes
  };

  await logSystemUpdate(req, admin, sessionId, updateType, details);
};

/**
 * Example: Custom admin action
 */
export const exampleCustomAction = async (req: Request) => {
  const admin = {
    id: 'admin-123',
    email: 'admin@gametradex.com'
  };
  const sessionId = 'session-456';

  await logAdminAction({
    req,
    admin,
    sessionId,
    actionType: 'CUSTOM_ACTION',
    targetType: 'SYSTEM',
    targetId: 'custom-123',
    details: {
      customField: 'custom_value',
      actionDescription: 'Custom admin action performed'
    }
  });
};

/**
 * Example: Express route handler with logging
 */
export const exampleRouteHandler = async (req: Request, res: any) => {
  try {
    // Extract admin info from request (set by middleware)
    const admin = req.admin;
    const sessionId = req.sessionId;

    if (!admin || !sessionId) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }

    // Perform admin action (e.g., approve listing)
    const listingId = req.params.id;
    const action = req.body.action; // 'approve' or 'reject'

    // Log the action
    await logListingApproval(req, admin, sessionId, listingId, action);

    // Return success response
    res.json({
      success: true,
      message: `Listing ${action}d successfully`
    });

  } catch (error) {
    console.error('Error in route handler:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  exampleAdminLogin,
  exampleAdminLogout,
  exampleListingApproval,
  exampleListingDeletion,
  examplePriceChange,
  exampleUserRoleChange,
  exampleEscrowUpdate,
  exampleSecurityAction,
  exampleSystemUpdate,
  exampleCustomAction,
  exampleRouteHandler
};
