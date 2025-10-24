/**
 * Notification Routes
 * Handles notification CRUD operations and mark-as-read functionality
 */

const express = require('express');
const router = express.Router();

// Mock notifications data (in production, this would be from MongoDB)
let mockNotifications = [
  {
    id: 'notif-1',
    type: 'LISTING_APPROVED',
    title: 'Listing Approved',
    message: 'Listing "Premium Gaming Account - Level 100" has been approved by admin',
    targetUrl: '/admin/dashboard?tab=listings',
    relatedActionId: 'listing-123',
    isRead: false,
    isReadBy: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    priority: 'LOW',
    metadata: {
      listingTitle: 'Premium Gaming Account - Level 100',
      adminEmail: 'admin@gametradex.com',
      actionType: 'LISTING_APPROVE'
    }
  },
  {
    id: 'notif-2',
    type: 'PRICE_CHANGED',
    title: 'Price Updated',
    message: 'Price for listing "Rare Gaming Account" has been updated from ₹500-₹800 to ₹600-₹900',
    targetUrl: '/admin/dashboard?tab=listings',
    relatedActionId: 'listing-456',
    isRead: false,
    isReadBy: [],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    priority: 'MEDIUM',
    metadata: {
      listingTitle: 'Rare Gaming Account',
      oldPrice: { priceMin: 500, priceMax: 800 },
      newPrice: { priceMin: 600, priceMax: 900 },
      adminEmail: 'admin@gametradex.com'
    }
  },
  {
    id: 'notif-3',
    type: 'USER_ROLE_CHANGED',
    title: 'User Role Changed',
    message: 'User role changed from buyer to seller for John Doe (john@example.com)',
    targetUrl: '/admin/dashboard?tab=users',
    relatedActionId: 'user-789',
    isRead: true,
    isReadBy: ['admin-credential-user'],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    priority: 'MEDIUM',
    metadata: {
      userName: 'John Doe',
      userEmail: 'john@example.com',
      oldRole: 'buyer',
      newRole: 'seller',
      adminEmail: 'admin@gametradex.com'
    }
  }
];

/**
 * Get all notifications
 * GET /api/notifications
 */
router.get('/', (req, res) => {
  try {
    const { type, priority, isRead, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let filteredNotifications = [...mockNotifications];
    
    // Apply filters
    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }
    
    if (priority) {
      filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
    }
    
    if (isRead !== undefined) {
      const isReadBool = isRead === 'true';
      filteredNotifications = filteredNotifications.filter(n => n.isRead === isReadBool);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filteredNotifications = filteredNotifications.filter(n => n.createdAt >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredNotifications = filteredNotifications.filter(n => n.createdAt <= end);
    }
    
    // Sort by creation date (newest first)
    filteredNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Apply pagination
    const total = filteredNotifications.length;
    const paginatedNotifications = filteredNotifications.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
    
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
});

/**
 * Get notification by ID
 * GET /api/notifications/:id
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const notification = mockNotifications.find(n => n.id === id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
    
  } catch (error) {
    console.error('Error getting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification',
      error: error.message
    });
  }
});

/**
 * Mark notification as read
 * POST /api/notifications/:id/mark-read
 */
router.post('/:id/mark-read', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // In production, this would come from authentication middleware
    
    const notification = mockNotifications.find(n => n.id === id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Add user ID to isReadBy array if not already present
    if (userId && !notification.isReadBy.includes(userId)) {
      notification.isReadBy.push(userId);
    }
    
    // Update isRead status
    notification.isRead = true;
    notification.updatedAt = new Date();
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notificationId: id,
        isRead: notification.isRead,
        isReadBy: notification.isReadBy
      }
    });
    
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

/**
 * Mark multiple notifications as read
 * POST /api/notifications/mark-read
 */
router.post('/mark-read', (req, res) => {
  try {
    const { notificationIds, userId } = req.body;
    
    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'notificationIds must be an array'
      });
    }
    
    const updatedNotifications = [];
    
    notificationIds.forEach(id => {
      const notification = mockNotifications.find(n => n.id === id);
      if (notification) {
        if (userId && !notification.isReadBy.includes(userId)) {
          notification.isReadBy.push(userId);
        }
        notification.isRead = true;
        notification.updatedAt = new Date();
        updatedNotifications.push(notification);
      }
    });
    
    res.json({
      success: true,
      message: `${updatedNotifications.length} notifications marked as read`,
      data: {
        updatedCount: updatedNotifications.length,
        notificationIds: updatedNotifications.map(n => n.id)
      }
    });
    
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
});

/**
 * Mark all notifications as read
 * POST /api/notifications/mark-all-read
 */
router.post('/mark-all-read', (req, res) => {
  try {
    const { userId } = req.body;
    
    const updatedCount = mockNotifications.filter(notification => {
      if (!notification.isRead) {
        if (userId && !notification.isReadBy.includes(userId)) {
          notification.isReadBy.push(userId);
        }
        notification.isRead = true;
        notification.updatedAt = new Date();
        return true;
      }
      return false;
    }).length;
    
    res.json({
      success: true,
      message: `${updatedCount} notifications marked as read`,
      data: {
        updatedCount
      }
    });
    
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

/**
 * Get unread count
 * GET /api/notifications/unread-count
 */
router.get('/unread-count', (req, res) => {
  try {
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;
    
    res.json({
      success: true,
      data: {
        unreadCount
      }
    });
    
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
});

/**
 * Get notification stats
 * GET /api/notifications/stats
 */
router.get('/stats', (req, res) => {
  try {
    const total = mockNotifications.length;
    const unread = mockNotifications.filter(n => !n.isRead).length;
    
    const byType = mockNotifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {});
    
    const byPriority = mockNotifications.reduce((acc, notification) => {
      acc[notification.priority] = (acc[notification.priority] || 0) + 1;
      return acc;
    }, {});
    
    const recent = mockNotifications
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
    
    res.json({
      success: true,
      data: {
        total,
        unread,
        byType,
        byPriority,
        recent
      }
    });
    
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification stats',
      error: error.message
    });
  }
});

/**
 * Create notification
 * POST /api/notifications
 */
router.post('/', (req, res) => {
  try {
    const { type, title, message, targetUrl, relatedActionId, priority = 'MEDIUM', metadata = {} } = req.body;
    
    const newNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      targetUrl: targetUrl || '/admin/dashboard',
      relatedActionId,
      isRead: false,
      isReadBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      priority,
      metadata
    };
    
    mockNotifications.unshift(newNotification); // Add to beginning of array
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: newNotification
    });
    
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const notificationIndex = mockNotifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    mockNotifications.splice(notificationIndex, 1);
    
    res.json({
      success: true,
      message: 'Notification deleted successfully',
      data: {
        deletedId: id
      }
    });
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

module.exports = router;
