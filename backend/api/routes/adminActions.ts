/**
 * Admin Actions API Routes
 * Handles admin action logging and retrieval
 */

import { Request, Response } from 'express';
import { AdminAction } from '../../models/AdminAction';
import { connectToDatabase } from '../../utils/database';
import { logAdminAction, logAdminLogin, logAdminLogout } from '../../utils/logAdminAction';

/**
 * Log admin action endpoint
 * POST /api/admin/actions/log
 */
export const logAdminActionRoute = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const {
      adminId,
      adminEmail,
      sessionId,
      actionType,
      targetType,
      targetId,
      details = {}
    } = req.body;

    // Validate required fields
    if (!adminId || !adminEmail || !sessionId || !actionType || !targetType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: adminId, adminEmail, sessionId, actionType, targetType'
      });
    }

    // Create admin action
    const adminAction = new AdminAction({
      adminId,
      adminEmail,
      sessionId,
      actionType,
      targetType,
      targetId,
      details,
      ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown',
      createdAt: new Date()
    });

    const savedAction = await adminAction.save();

    res.status(201).json({
      success: true,
      message: 'Admin action logged successfully',
      data: {
        id: savedAction._id,
        adminId: savedAction.adminId,
        actionType: savedAction.actionType,
        targetType: savedAction.targetType,
        timestamp: savedAction.createdAt
      }
    });

  } catch (error) {
    console.error('Error logging admin action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log admin action',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get admin actions endpoint
 * GET /api/admin/actions
 */
export const getAdminActions = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const {
      adminId,
      actionType,
      targetType,
      limit = 50,
      offset = 0,
      startDate,
      endDate
    } = req.query;

    // Build query
    const query: any = {};
    
    if (adminId) query.adminId = adminId;
    if (actionType) query.actionType = actionType;
    if (targetType) query.targetType = targetType;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const actions = await AdminAction.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await AdminAction.countDocuments(query);

    res.json({
      success: true,
      data: {
        actions,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + Number(limit) < total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin actions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get admin action by ID
 * GET /api/admin/actions/:id
 */
export const getAdminActionById = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { id } = req.params;
    const action = await AdminAction.findById(id);

    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Admin action not found'
      });
    }

    res.json({
      success: true,
      data: action
    });

  } catch (error) {
    console.error('Error fetching admin action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin action',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get admin activity summary
 * GET /api/admin/actions/summary/:adminId
 */
export const getAdminActivitySummary = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { adminId } = req.params;
    const { days = 30 } = req.query;

    const summary = await AdminAction.getActivitySummary(adminId, Number(days));

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error fetching admin activity summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin activity summary',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get admin statistics
 * GET /api/admin/actions/stats/:adminId
 */
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { adminId } = req.params;
    const stats = await AdminAction.getAdminStats(adminId);

    res.json({
      success: true,
      data: stats[0] || {
        totalActions: 0,
        uniqueSessions: 0,
        actionTypes: 0,
        firstAction: null,
        lastAction: null
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get security actions
 * GET /api/admin/actions/security
 */
export const getSecurityActions = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { limit = 50 } = req.query;
    const actions = await AdminAction.getSecurityActions(Number(limit));

    res.json({
      success: true,
      data: actions
    });

  } catch (error) {
    console.error('Error fetching security actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security actions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get session activity
 * GET /api/admin/actions/session/:sessionId
 */
export const getSessionActivity = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { sessionId } = req.params;
    const actions = await AdminAction.getSessionActivity(sessionId);

    res.json({
      success: true,
      data: actions
    });

  } catch (error) {
    console.error('Error fetching session activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session activity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete admin action
 * DELETE /api/admin/actions/:id
 */
export const deleteAdminAction = async (req: Request, res: Response) => {
  try {
    await connectToDatabase();

    const { id } = req.params;
    const action = await AdminAction.findByIdAndDelete(id);

    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Admin action not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin action deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting admin action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin action',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
