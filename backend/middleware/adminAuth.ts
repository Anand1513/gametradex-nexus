/**
 * Admin Authentication Middleware
 * Validates admin sessions and extracts admin information
 */

import { Request, Response, NextFunction } from 'express';

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
  sessionId?: string;
}

/**
 * Admin authentication middleware
 */
export const adminAuth = (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    // Extract admin information from headers or session
    const adminId = req.headers['x-admin-id'] as string;
    const adminEmail = req.headers['x-admin-email'] as string;
    const sessionId = req.headers['x-session-id'] as string;
    const authToken = req.headers['authorization'] as string;

    // Check if admin information is provided
    if (!adminId || !adminEmail) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    // Validate session ID
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Admin session required'
      });
    }

    // Set admin information in request
    req.admin = {
      id: adminId,
      email: adminEmail,
      role: 'admin'
    };
    req.sessionId = sessionId;

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Optional admin authentication middleware
 * Doesn't fail if admin info is not provided
 */
export const optionalAdminAuth = (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.headers['x-admin-id'] as string;
    const adminEmail = req.headers['x-admin-email'] as string;
    const sessionId = req.headers['x-session-id'] as string;

    if (adminId && adminEmail && sessionId) {
      req.admin = {
        id: adminId,
        email: adminEmail,
        role: 'admin'
      };
      req.sessionId = sessionId;
    }

    next();
  } catch (error) {
    console.error('Optional admin auth middleware error:', error);
    next();
  }
};

/**
 * Validate admin session middleware
 */
export const validateAdminSession = (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.admin || !req.sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Valid admin session required'
      });
    }

    // Here you could add additional session validation
    // For example, check if session is still valid in database
    // For now, we'll just proceed if admin info is present

    next();
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Session validation error'
    });
  }
};

export default adminAuth;
