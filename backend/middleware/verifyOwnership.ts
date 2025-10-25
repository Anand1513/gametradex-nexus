/**
 * Verify Ownership Middleware
 * Ensures users can only access their own resources
 */

import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { logAdminAction } from '../utils/logAdminAction';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Verify that the user owns the resource they're trying to access
 */
export const verifyOwnership = (resourceType: 'listing' | 'escrow' | 'user' | 'payment') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const resourceId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID required'
        });
      }

      // Get user details
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Admin users can access any resource
      if (user.role === 'admin' || user.role === 'moderator') {
        return next();
      }

      // Check ownership based on resource type
      let isOwner = false;

      switch (resourceType) {
        case 'listing':
          // Check if user owns the listing
          const listing = await req.app.locals.db.collection('listings').findOne({
            _id: resourceId,
            sellerId: userId
          });
          isOwner = !!listing;
          break;

        case 'escrow':
          // Check if user is buyer or seller in the escrow
          const escrow = await req.app.locals.db.collection('escrows').findOne({
            _id: resourceId,
            $or: [
              { buyerId: userId },
              { sellerId: userId }
            ]
          });
          isOwner = !!escrow;
          break;

        case 'user':
          // Users can only access their own profile
          isOwner = resourceId === userId;
          break;

        case 'payment':
          // Check if user is involved in the payment
          const payment = await req.app.locals.db.collection('payments').findOne({
            _id: resourceId,
            $or: [
              { buyerId: userId },
              { sellerId: userId }
            ]
          });
          isOwner = !!payment;
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid resource type'
          });
      }

      if (!isOwner) {
        // Log unauthorized access attempt
        try {
          await logAdminAction({
            req,
            admin: {
              id: userId,
              email: user.email
            },
            sessionId: req.headers['x-session-id'] as string || 'unknown',
            actionType: 'UNAUTHORIZED_ACCESS',
            targetType: resourceType.toUpperCase(),
            targetId: resourceId,
            details: {
              attemptedBy: userId,
              resourceType,
              resourceId,
              userAgent: req.get('User-Agent'),
              ip: req.ip
            },
            actorType: 'user'
          });
        } catch (logError) {
          console.warn('Failed to log unauthorized access attempt:', logError);
        }

        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      // Add ownership info to request for use in route handlers
      req.user = {
        ...req.user,
        resourceOwnership: {
          type: resourceType,
          id: resourceId,
          verified: true
        }
      };

      next();
    } catch (error) {
      console.error('Error in verifyOwnership middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Verify admin access
 */
export const verifyAdminAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'admin' && user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Error in verifyAdminAccess middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify seller access
 */
export const verifySellerAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'seller' && user.role !== 'admin' && user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Seller access required'
      });
    }

    next();
  } catch (error) {
    console.error('Error in verifySellerAccess middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify buyer access
 */
export const verifyBuyerAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'buyer' && user.role !== 'admin' && user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Buyer access required'
      });
    }

    next();
  } catch (error) {
    console.error('Error in verifyBuyerAccess middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify resource access with custom logic
 */
export const verifyResourceAccess = (accessCheck: (req: AuthenticatedRequest) => Promise<boolean>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const hasAccess = await accessCheck(req);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      next();
    } catch (error) {
      console.error('Error in verifyResourceAccess middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Rate limiting middleware for ownership verification
 */
export const rateLimitOwnership = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) return next();

    const now = Date.now();
    const userAttempts = attempts.get(userId);

    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many ownership verification attempts. Please try again later.'
      });
    }

    userAttempts.count++;
    next();
  };
};
