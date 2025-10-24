/**
 * Admin Actions API Routes
 * Handles fetching admin action logs with filtering and append-only storage
 */

const express = require('express');
const router = express.Router();
const { appendAction, getActions, verifyAllActions, getActionTypes, exportActionsAsCSV } = require('../../utils/adminActionsStorage');

// Initialize with some sample data if storage is empty
const initializeSampleData = async () => {
  try {
    const actions = await getActions();
    if (actions.length === 0) {
      console.log('Initializing sample admin actions...');
      await appendAction({
        adminId: 'admin-123',
        adminEmail: 'admin@gametradex.com',
        sessionId: 'session-abc123',
        actionType: 'LOGIN',
        targetType: 'SESSION',
        targetId: 'session-abc123',
        details: {
          loginMethod: 'key',
          loginTime: new Date().toISOString(),
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      });
      
      await appendAction({
        adminId: 'admin-123',
        adminEmail: 'admin@gametradex.com',
        sessionId: 'session-abc123',
        actionType: 'PRICE_UPDATE',
        targetType: 'LISTING',
        targetId: 'listing-456',
        details: {
          oldPrice: { min: 100, max: 150 },
          newPrice: { min: 120, max: 180 },
          listingTitle: 'Premium Gaming Account',
          changeReason: 'admin_manual_update'
        },
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      });
      
      await appendAction({
        adminId: 'admin-123',
        adminEmail: 'admin@gametradex.com',
        sessionId: 'session-abc123',
        actionType: 'LISTING_APPROVE',
        targetType: 'LISTING',
        targetId: 'listing-789',
        details: {
          listingTitle: 'Rare Gaming Account',
          oldStatus: 'pending',
          newStatus: 'approved',
          approvalTime: new Date().toISOString()
        },
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      });
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

// Initialize sample data on startup
initializeSampleData();

// Mock admin actions data (fallback)
let mockAdminActions = [
  {
    id: 'action-1',
    adminId: 'admin-123',
    adminEmail: 'admin@gametradex.com',
    sessionId: 'session-abc123',
    actionType: 'LOGIN',
    targetType: 'SESSION',
    targetId: 'session-abc123',
    details: {
      loginMethod: 'key',
      loginTime: '2025-10-25T02:30:00.000Z',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    createdAt: new Date('2025-10-25T02:30:00.000Z')
  },
  {
    id: 'action-2',
    adminId: 'admin-123',
    adminEmail: 'admin@gametradex.com',
    sessionId: 'session-abc123',
    actionType: 'PRICE_UPDATE',
    targetType: 'LISTING',
    targetId: 'listing-456',
    details: {
      oldPrice: { min: 100, max: 150 },
      newPrice: { min: 120, max: 180 },
      listingTitle: 'Premium Gaming Account',
      changeReason: 'admin_manual_update'
    },
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    createdAt: new Date('2025-10-25T02:35:00.000Z')
  },
  {
    id: 'action-3',
    adminId: 'admin-123',
    adminEmail: 'admin@gametradex.com',
    sessionId: 'session-abc123',
    actionType: 'LISTING_APPROVE',
    targetType: 'LISTING',
    targetId: 'listing-789',
    details: {
      listingTitle: 'Rare Gaming Account',
      oldStatus: 'pending',
      newStatus: 'approved',
      approvalTime: '2025-10-25T02:40:00.000Z'
    },
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    createdAt: new Date('2025-10-25T02:40:00.000Z')
  },
  {
    id: 'action-4',
    adminId: 'admin-123',
    adminEmail: 'admin@gametradex.com',
    sessionId: 'session-abc123',
    actionType: 'USER_ROLE_CHANGE',
    targetType: 'USER',
    targetId: 'user-123',
    details: {
      userName: 'John Doe',
      userEmail: 'john@example.com',
      oldRole: 'buyer',
      newRole: 'seller',
      changeReason: 'admin_manual_change'
    },
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    createdAt: new Date('2025-10-25T02:45:00.000Z')
  },
  {
    id: 'action-5',
    adminId: 'admin-123',
    adminEmail: 'admin@gametradex.com',
    sessionId: 'session-abc123',
    actionType: 'LOGOUT',
    targetType: 'SESSION',
    targetId: 'session-abc123',
    details: {
      logoutTime: '2025-10-25T03:00:00.000Z',
      sessionDuration: '30 minutes'
    },
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    createdAt: new Date('2025-10-25T03:00:00.000Z')
  }
];

/**
 * Get admin actions with filters
 * GET /api/admin/actions
 */
router.get('/', async (req, res) => {
  try {
    const { 
      adminEmail, 
      actionType, 
      from, 
      to, 
      sessionId, 
      limit = 50, 
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Use new storage system
    const filteredActions = await getActions({
      adminEmail,
      actionType,
      from,
      to,
      sessionId
    });
    
    // Apply pagination
    const total = filteredActions.length;
    const paginatedActions = filteredActions.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      data: {
        actions: paginatedActions,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        filters: {
          adminEmail,
          actionType,
          from,
          to,
          sessionId
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting admin actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin actions',
      error: error.message
    });
  }
});

/**
 * Get admin action by ID
 * GET /api/admin/actions/:id
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const action = mockAdminActions.find(a => a.id === id);
    
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
    console.error('Error getting admin action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin action',
      error: error.message
    });
  }
});

/**
 * Get action types for filter dropdown
 * GET /api/admin/actions/types
 */
router.get('/types', async (req, res) => {
  try {
    const actionTypes = await getActionTypes();
    
    res.json({
      success: true,
      data: actionTypes
    });
    
  } catch (error) {
    console.error('Error getting action types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get action types',
      error: error.message
    });
  }
});

/**
 * Export actions as CSV
 * GET /api/admin/actions/export
 */
router.get('/export', async (req, res) => {
  try {
    const { 
      adminEmail, 
      actionType, 
      from, 
      to, 
      sessionId 
    } = req.query;
    
    // Use new storage system for export
    const csvContent = await exportActionsAsCSV({
      adminEmail,
      actionType,
      from,
      to,
      sessionId
    });
    
    const filename = `admin-actions-${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
    
  } catch (error) {
    console.error('Error exporting admin actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export admin actions',
      error: error.message
    });
  }
});

/**
 * Verify HMAC signatures of all actions
 * GET /api/admin/actions/verify
 */
router.get('/verify', async (req, res) => {
  try {
    const verificationResults = await verifyAllActions();
    
    res.json({
      success: true,
      data: verificationResults
    });
    
  } catch (error) {
    console.error('Error verifying admin actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify admin actions',
      error: error.message
    });
  }
});

/**
 * Append a new admin action (append-only)
 * POST /api/admin/actions
 */
router.post('/', async (req, res) => {
  try {
    const { 
      adminId,
      adminEmail,
      sessionId,
      actionType,
      targetType,
      targetId,
      details,
      ip,
      userAgent
    } = req.body;
    
    // Validate required fields
    if (!adminId || !adminEmail || !actionType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: adminId, adminEmail, actionType'
      });
    }
    
    // Append the action (append-only)
    const newAction = await appendAction({
      adminId,
      adminEmail,
      sessionId: sessionId || req.ip || 'unknown',
      actionType,
      targetType: targetType || 'UNKNOWN',
      targetId: targetId || 'unknown',
      details: details || {},
      ip: ip || req.ip || 'unknown',
      userAgent: userAgent || req.get('User-Agent') || 'unknown'
    });
    
    res.status(201).json({
      success: true,
      message: 'Admin action logged successfully',
      data: {
        id: newAction.id,
        actionType: newAction.actionType,
        adminEmail: newAction.adminEmail,
        createdAt: newAction.createdAt,
        hmacSignature: newAction.hmacSignature
      }
    });
    
  } catch (error) {
    console.error('Error appending admin action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to append admin action',
      error: error.message
    });
  }
});

module.exports = router;
