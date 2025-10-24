/**
 * Admin Sessions API Routes
 * Handles admin session management and tracking
 */

import { Request, Response } from 'express';
import { connectToDatabase } from '../../utils/database';
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
} from '../../utils/adminSessions';

/**
 * Start admin session endpoint
 * POST /api/admin/sessions/start
 */
export const startAdminSessionRoute = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { adminId, adminEmail } = req.body;

    if (!adminId || !adminEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: adminId, adminEmail'
      });
    }

    const sessionData = await startAdminSession(req, { id: adminId, email: adminEmail });

    if (!sessionData) {
      return res.status(500).json({
        success: false,
        message: 'Failed to start admin session'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Admin session started successfully',
      data: {
        sessionId: sessionData.sessionId,
        adminId: sessionData.adminId,
        loginAt: sessionData.loginAt,
        ip: sessionData.ip,
        userAgent: sessionData.userAgent,
        origin: sessionData.origin
      }
    });

  } catch (error) {
    console.error('Error starting admin session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start admin session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * End admin session endpoint
 * POST /api/admin/sessions/:sessionId/end
 */
export const endAdminSessionRoute = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const success = await endAdminSession(sessionId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or already ended'
      });
    }

    res.json({
      success: true,
      message: 'Admin session ended successfully'
    });

  } catch (error) {
    console.error('Error ending admin session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end admin session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update session activity endpoint
 * PUT /api/admin/sessions/:sessionId/activity
 */
export const updateSessionActivityRoute = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const success = await updateAdminSessionActivity(sessionId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or inactive'
      });
    }

    res.json({
      success: true,
      message: 'Session activity updated successfully'
    });

  } catch (error) {
    console.error('Error updating session activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session activity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get active sessions endpoint
 * GET /api/admin/sessions/active
 */
export const getActiveSessionsRoute = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { adminId } = req.query;
    const sessions = await getActiveAdminSessions(adminId as string);

    res.json({
      success: true,
      data: {
        sessions,
        count: sessions.length
      }
    });

  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active sessions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get session by ID endpoint
 * GET /api/admin/sessions/:sessionId
 */
export const getSessionByIdRoute = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { sessionId } = req.params;
    const session = await getAdminSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get admin session statistics endpoint
 * GET /api/admin/sessions/stats/:adminId
 */
export const getAdminSessionStatsRoute = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { adminId } = req.params;
    const { days = 30 } = req.query;

    const stats = await getAdminSessionStats(adminId, Number(days));

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting admin session stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin session stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get admin session activity summary endpoint
 * GET /api/admin/sessions/activity/:adminId
 */
export const getAdminSessionActivityRoute = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { adminId } = req.params;
    const activity = await getAdminSessionActivitySummary(adminId);

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Error getting admin session activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin session activity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get admin IP statistics endpoint
 * GET /api/admin/sessions/ip-stats/:adminId
 */
export const getAdminIPStatsRoute = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { adminId } = req.params;
    const ipStats = await getAdminIPStats(adminId);

    res.json({
      success: true,
      data: ipStats
    });

  } catch (error) {
    console.error('Error getting admin IP stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin IP stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get concurrent sessions endpoint
 * GET /api/admin/sessions/concurrent/:adminId
 */
export const getConcurrentSessionsRoute = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { adminId } = req.params;
    const concurrent = await getConcurrentAdminSessions(adminId);

    res.json({
      success: true,
      data: concurrent
    });

  } catch (error) {
    console.error('Error getting concurrent sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get concurrent sessions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Validate session endpoint
 * GET /api/admin/sessions/:sessionId/validate
 */
export const validateSessionRoute = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { sessionId } = req.params;
    const isValid = await validateAdminSession(sessionId);

    res.json({
      success: true,
      data: {
        sessionId,
        isValid
      }
    });

  } catch (error) {
    console.error('Error validating session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get session duration endpoint
 * GET /api/admin/sessions/:sessionId/duration
 */
export const getSessionDurationRoute = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { sessionId } = req.params;
    const duration = await getSessionDuration(sessionId);

    res.json({
      success: true,
      data: {
        sessionId,
        duration,
        durationFormatted: formatDuration(duration)
      }
    });

  } catch (error) {
    console.error('Error getting session duration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session duration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Cleanup expired sessions endpoint
 * POST /api/admin/sessions/cleanup
 */
export const cleanupExpiredSessionsRoute = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { expiryHours = 24 } = req.body;
    const cleanedCount = await cleanupExpiredSessions(expiryHours);

    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired sessions`,
      data: {
        cleanedCount,
        expiryHours
      }
    });

  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup expired sessions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
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
