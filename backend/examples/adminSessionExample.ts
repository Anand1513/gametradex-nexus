/**
 * Admin Session Usage Examples
 * Demonstrates how to use the admin session management system
 */

import { Request } from 'express';
import { 
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
} from '@/utils/adminSessions';

/**
 * Example: Start admin session
 */
export const exampleStartAdminSession = async (req: Request) => {
  const admin = {
    id: 'admin-123',
    email: 'admin@gametradex.com'
  };

  const sessionData = await startAdminSession(req, admin);
  
  if (sessionData) {
    console.log('Admin session started:', {
      sessionId: sessionData.sessionId,
      adminId: sessionData.adminId,
      loginAt: sessionData.loginAt,
      ip: sessionData.ip
    });
  }
  
  return sessionData;
};

/**
 * Example: End admin session
 */
export const exampleEndAdminSession = async (sessionId: string) => {
  const success = await endAdminSession(sessionId);
  
  if (success) {
    console.log('Admin session ended:', sessionId);
  } else {
    console.log('Failed to end session:', sessionId);
  }
  
  return success;
};

/**
 * Example: Update session activity
 */
export const exampleUpdateSessionActivity = async (sessionId: string) => {
  const success = await updateAdminSessionActivity(sessionId);
  
  if (success) {
    console.log('Session activity updated:', sessionId);
  }
  
  return success;
};

/**
 * Example: Get active sessions
 */
export const exampleGetActiveSessions = async (adminId?: string) => {
  const sessions = await getActiveAdminSessions(adminId);
  
  console.log('Active sessions:', sessions.length);
  sessions.forEach(session => {
    console.log(`Session ${session.sessionId}: ${session.adminId} (${session.ip})`);
  });
  
  return sessions;
};

/**
 * Example: Get session by ID
 */
export const exampleGetSession = async (sessionId: string) => {
  const session = await getAdminSession(sessionId);
  
  if (session) {
    console.log('Session found:', {
      sessionId: session.sessionId,
      adminId: session.adminId,
      loginAt: session.loginAt,
      isActive: session.isActive
    });
  } else {
    console.log('Session not found:', sessionId);
  }
  
  return session;
};

/**
 * Example: Get admin session statistics
 */
export const exampleGetAdminSessionStats = async (adminId: string) => {
  const stats = await getAdminSessionStats(adminId, 30);
  
  console.log('Admin session stats:', {
    totalSessions: stats.totalSessions,
    activeSessions: stats.activeSessions,
    totalDuration: stats.totalDuration,
    avgDuration: stats.avgDuration,
    uniqueIPs: stats.uniqueIPs
  });
  
  return stats;
};

/**
 * Example: Get admin session activity summary
 */
export const exampleGetAdminSessionActivity = async (adminId: string) => {
  const activity = await getAdminSessionActivitySummary(adminId);
  
  console.log('Admin session activity:', activity);
  
  return activity;
};

/**
 * Example: Get admin IP statistics
 */
export const exampleGetAdminIPStats = async (adminId: string) => {
  const ipStats = await getAdminIPStats(adminId);
  
  console.log('Admin IP stats:', ipStats);
  
  return ipStats;
};

/**
 * Example: Get concurrent sessions
 */
export const exampleGetConcurrentSessions = async (adminId: string) => {
  const concurrent = await getConcurrentAdminSessions(adminId);
  
  console.log('Concurrent sessions:', {
    count: concurrent.concurrentSessions,
    sessions: concurrent.sessions.length
  });
  
  return concurrent;
};

/**
 * Example: Validate session
 */
export const exampleValidateSession = async (sessionId: string) => {
  const isValid = await validateAdminSession(sessionId);
  
  console.log('Session validation:', {
    sessionId,
    isValid
  });
  
  return isValid;
};

/**
 * Example: Get session duration
 */
export const exampleGetSessionDuration = async (sessionId: string) => {
  const duration = await getSessionDuration(sessionId);
  
  console.log('Session duration:', {
    sessionId,
    duration,
    durationFormatted: formatDuration(duration)
  });
  
  return duration;
};

/**
 * Example: Cleanup expired sessions
 */
export const exampleCleanupExpiredSessions = async (expiryHours: number = 24) => {
  const cleanedCount = await cleanupExpiredSessions(expiryHours);
  
  console.log('Cleaned up expired sessions:', cleanedCount);
  
  return cleanedCount;
};

/**
 * Example: Express route handler with session management
 */
export const exampleRouteHandler = async (req: Request, res: any) => {
  try {
    // Extract admin info from request (set by middleware)
    const admin = req.admin;
    const sessionId = req.sessionId;

    if (!admin || !sessionId) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }

    // Validate session
    const isValid = await validateAdminSession(sessionId);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Update session activity
    await updateAdminSessionActivity(sessionId);

    // Perform admin action
    // ... business logic here ...

    res.json({
      success: true,
      message: 'Action completed successfully'
    });

  } catch (error) {
    console.error('Error in route handler:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Example: Complete admin login flow
 */
export const exampleAdminLoginFlow = async (req: Request, admin: { id: string; email: string }) => {
  try {
    // Start admin session
    const sessionData = await startAdminSession(req, admin);
    
    if (!sessionData) {
      throw new Error('Failed to start admin session');
    }
    
    // Store session ID in response or session
    // res.cookie('adminSessionId', sessionData.sessionId);
    // or
    // req.session.adminSessionId = sessionData.sessionId;
    
    console.log('Admin login successful:', {
      sessionId: sessionData.sessionId,
      adminId: sessionData.adminId,
      loginAt: sessionData.loginAt
    });
    
    return sessionData;
    
  } catch (error) {
    console.error('Admin login flow error:', error);
    throw error;
  }
};

/**
 * Example: Complete admin logout flow
 */
export const exampleAdminLogoutFlow = async (sessionId: string) => {
  try {
    // End admin session
    const success = await endAdminSession(sessionId);
    
    if (!success) {
      throw new Error('Failed to end admin session');
    }
    
    // Clear session from response or session
    // res.clearCookie('adminSessionId');
    // or
    // delete req.session.adminSessionId;
    
    console.log('Admin logout successful:', sessionId);
    
    return success;
    
  } catch (error) {
    console.error('Admin logout flow error:', error);
    throw error;
  }
};

/**
 * Example: Session middleware
 */
export const exampleSessionMiddleware = async (req: Request, res: any, next: any) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!sessionId) {
      return res.status(401).json({ message: 'Session ID required' });
    }
    
    // Validate session
    const isValid = await validateAdminSession(sessionId);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }
    
    // Update session activity
    await updateAdminSessionActivity(sessionId);
    
    // Add session info to request
    req.sessionId = sessionId;
    
    next();
    
  } catch (error) {
    console.error('Session middleware error:', error);
    res.status(500).json({ message: 'Session validation error' });
  }
};

/**
 * Format duration in milliseconds to human readable format
 */
const formatDuration = (duration: number): string => {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export default {
  exampleStartAdminSession,
  exampleEndAdminSession,
  exampleUpdateSessionActivity,
  exampleGetActiveSessions,
  exampleGetSession,
  exampleGetAdminSessionStats,
  exampleGetAdminSessionActivity,
  exampleGetAdminIPStats,
  exampleGetConcurrentSessions,
  exampleValidateSession,
  exampleGetSessionDuration,
  exampleCleanupExpiredSessions,
  exampleRouteHandler,
  exampleAdminLoginFlow,
  exampleAdminLogoutFlow,
  exampleSessionMiddleware
};
