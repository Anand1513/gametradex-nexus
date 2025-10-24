/**
 * Admin Session Management
 * Handles admin session creation, tracking, and termination
 */

import { Request } from 'express';
import { AdminSession } from '../models/AdminSession';
import { logAdminAction } from './logAdminAction';

export interface AdminSessionData {
  adminId: string;
  sessionId: string;
  loginAt: Date;
  ip: string;
  userAgent: string;
  origin?: string;
  isActive: boolean;
  lastActivity: Date;
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
 * Extract origin from request
 */
const getOrigin = (req: Request): string | undefined => {
  return req.headers.origin || req.headers.referer;
};

/**
 * Generate unique session ID
 */
const generateSessionId = (): string => {
  return `admin_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Start admin session
 * Creates a new admin session and logs the login action
 */
export const startAdminSession = async (
  req: Request,
  admin: { id: string; email: string }
): Promise<AdminSessionData | null> => {
  try {
    // Generate session ID
    const sessionId = generateSessionId();
    
    // Extract request information
    const ip = getClientIP(req);
    const userAgent = getUserAgent(req);
    const origin = getOrigin(req);
    const loginAt = new Date();
    
    // Create admin session document
    const sessionData = {
      adminId: admin.id,
      sessionId,
      loginAt,
      ip,
      userAgent,
      origin,
      isActive: true,
      lastActivity: loginAt
    };
    
    // Save session to MongoDB
    const adminSession = new AdminSession(sessionData);
    const savedSession = await adminSession.save();
    
    console.log('Admin session started:', {
      sessionId: savedSession.sessionId,
      adminId: savedSession.adminId,
      ip: savedSession.ip,
      loginAt: savedSession.loginAt
    });
    
    // Log the login action
    await logAdminAction({
      req,
      admin,
      sessionId,
      actionType: 'LOGIN',
      targetType: 'SESSION',
      details: {
        loginMethod: 'admin_credentials',
        loginTime: loginAt.toISOString(),
        ip,
        userAgent,
        origin
      }
    });
    
    return {
      adminId: savedSession.adminId,
      sessionId: savedSession.sessionId,
      loginAt: savedSession.loginAt,
      ip: savedSession.ip,
      userAgent: savedSession.userAgent,
      origin: savedSession.origin,
      isActive: savedSession.isActive,
      lastActivity: savedSession.lastActivity
    };
    
  } catch (error) {
    console.error('Error starting admin session:', error);
    return null;
  }
};

/**
 * End admin session
 * Updates session with logout time and logs the logout action
 */
export const endAdminSession = async (sessionId: string): Promise<boolean> => {
  try {
    // Find the session
    const session = await AdminSession.getBySessionId(sessionId);
    
    if (!session) {
      console.warn('Session not found:', sessionId);
      return false;
    }
    
    if (!session.isActive) {
      console.warn('Session already ended:', sessionId);
      return false;
    }
    
    // End the session
    await session.endSession();
    
    console.log('Admin session ended:', {
      sessionId: session.sessionId,
      adminId: session.adminId,
      duration: session.duration,
      logoutAt: session.logoutAt
    });
    
    // Log the logout action
    await logAdminAction({
      req: {} as Request, // Create minimal request object for logging
      admin: { id: session.adminId, email: 'admin@gametradex.com' },
      sessionId: session.sessionId,
      actionType: 'LOGOUT',
      targetType: 'SESSION',
      details: {
        logoutTime: session.logoutAt?.toISOString(),
        sessionDuration: session.duration,
        ip: session.ip,
        userAgent: session.userAgent
      }
    });
    
    return true;
    
  } catch (error) {
    console.error('Error ending admin session:', error);
    return false;
  }
};

/**
 * Update admin session activity
 * Updates the lastActivity timestamp for an active session
 */
export const updateAdminSessionActivity = async (sessionId: string): Promise<boolean> => {
  try {
    const session = await AdminSession.getBySessionId(sessionId);
    
    if (!session || !session.isActive) {
      return false;
    }
    
    await session.updateActivity();
    
    return true;
    
  } catch (error) {
    console.error('Error updating admin session activity:', error);
    return false;
  }
};

/**
 * Get active admin sessions
 */
export const getActiveAdminSessions = async (adminId?: string): Promise<AdminSessionData[]> => {
  try {
    const sessions = await AdminSession.getActiveSessions(adminId);
    
    return sessions.map(session => ({
      adminId: session.adminId,
      sessionId: session.sessionId,
      loginAt: session.loginAt,
      ip: session.ip,
      userAgent: session.userAgent,
      origin: session.origin,
      isActive: session.isActive,
      lastActivity: session.lastActivity
    }));
    
  } catch (error) {
    console.error('Error getting active admin sessions:', error);
    return [];
  }
};

/**
 * Get admin session by session ID
 */
export const getAdminSession = async (sessionId: string): Promise<AdminSessionData | null> => {
  try {
    const session = await AdminSession.getBySessionId(sessionId);
    
    if (!session) {
      return null;
    }
    
    return {
      adminId: session.adminId,
      sessionId: session.sessionId,
      loginAt: session.loginAt,
      ip: session.ip,
      userAgent: session.userAgent,
      origin: session.origin,
      isActive: session.isActive,
      lastActivity: session.lastActivity
    };
    
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
};

/**
 * Get admin session statistics
 */
export const getAdminSessionStats = async (adminId: string, days: number = 30) => {
  try {
    const stats = await AdminSession.getAdminSessionStats(adminId, days);
    return stats[0] || {
      totalSessions: 0,
      activeSessions: 0,
      totalDuration: 0,
      avgDuration: 0,
      firstLogin: null,
      lastLogin: null,
      uniqueIPs: 0
    };
  } catch (error) {
    console.error('Error getting admin session stats:', error);
    return {
      totalSessions: 0,
      activeSessions: 0,
      totalDuration: 0,
      avgDuration: 0,
      firstLogin: null,
      lastLogin: null,
      uniqueIPs: 0
    };
  }
};

/**
 * Get admin session activity summary
 */
export const getAdminSessionActivitySummary = async (adminId: string) => {
  try {
    return await AdminSession.getSessionActivitySummary(adminId);
  } catch (error) {
    console.error('Error getting admin session activity summary:', error);
    return [];
  }
};

/**
 * Get IP statistics for admin
 */
export const getAdminIPStats = async (adminId: string) => {
  try {
    return await AdminSession.getIPStats(adminId);
  } catch (error) {
    console.error('Error getting admin IP stats:', error);
    return [];
  }
};

/**
 * Get concurrent sessions for admin
 */
export const getConcurrentAdminSessions = async (adminId: string) => {
  try {
    const result = await AdminSession.getConcurrentSessions(adminId);
    return result[0] || { concurrentSessions: 0, sessions: [] };
  } catch (error) {
    console.error('Error getting concurrent admin sessions:', error);
    return { concurrentSessions: 0, sessions: [] };
  }
};

/**
 * Cleanup expired sessions
 */
export const cleanupExpiredSessions = async (expiryHours: number = 24): Promise<number> => {
  try {
    const result = await AdminSession.cleanupExpiredSessions(expiryHours);
    console.log(`Cleaned up ${result.modifiedCount} expired sessions`);
    return result.modifiedCount || 0;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    return 0;
  }
};

/**
 * Validate admin session
 * Checks if session exists and is active
 */
export const validateAdminSession = async (sessionId: string): Promise<boolean> => {
  try {
    const session = await AdminSession.getBySessionId(sessionId);
    return session ? session.isActive : false;
  } catch (error) {
    console.error('Error validating admin session:', error);
    return false;
  }
};

/**
 * Get session duration
 */
export const getSessionDuration = async (sessionId: string): Promise<number> => {
  try {
    const session = await AdminSession.getBySessionId(sessionId);
    
    if (!session) {
      return 0;
    }
    
    if (session.logoutAt) {
      return session.duration || 0;
    }
    
    return Date.now() - session.loginAt.getTime();
    
  } catch (error) {
    console.error('Error getting session duration:', error);
    return 0;
  }
};

export default {
  startAdminSession,
  endAdminSession,
  updateAdminSessionActivity,
  getActiveAdminSessions,
  getAdminSession,
  getAdminSessionStats,
  getAdminSessionActivitySummary,
  getAdminIPStats,
  getConcurrentAdminSessions,
  cleanupExpiredSessions,
  validateAdminSession,
  getSessionDuration
};