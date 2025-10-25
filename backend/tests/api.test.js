/**
 * Comprehensive API Tests for GameTradeX
 * Tests listing creation, purchase flow, role updates, ownership checks, and notifications
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Mock data and utilities
const mockUsers = {
  'user-1': {
    id: 'user-1',
    email: 'seller@example.com',
    username: 'seller123',
    role: 'user',
    stats: { listedCount: 0, boughtCount: 0, totalSpent: 0, totalEarned: 0 }
  },
  'user-2': {
    id: 'user-2',
    email: 'buyer@example.com',
    username: 'buyer123',
    role: 'user',
    stats: { listedCount: 0, boughtCount: 0, totalSpent: 0, totalEarned: 0 }
  },
  'admin-1': {
    id: 'admin-1',
    email: 'admin@gametradex.com',
    username: 'admin',
    role: 'admin',
    stats: { listedCount: 0, boughtCount: 0, totalSpent: 0, totalEarned: 0 }
  }
};

const mockListings = [];
const mockPurchases = [];
const mockNotifications = [];
const mockAdminActions = [];

// Mock helper functions
const mockHelpers = {
  logAdminAction: (params) => {
    mockAdminActions.push({
      ...params,
      timestamp: new Date().toISOString()
    });
    return Promise.resolve();
  },
  
  createNotification: (notification) => {
    const newNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockNotifications.push(newNotification);
    return Promise.resolve(newNotification);
  },
  
  sendEmail: (emailData) => {
    console.log('Mock email sent:', emailData);
    return Promise.resolve();
  },
  
  verifyOwnership: (req, res, next) => {
    // For delivery confirmation, check if user is the seller
    if (req.path.includes('/confirm-delivery')) {
      const purchase = mockPurchases.find(p => p.id === req.params.id);
      if (purchase && purchase.sellerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Only the seller can confirm delivery'
        });
      }
    }
    
    // For receipt confirmation, check if user is the buyer
    if (req.path.includes('/confirm-receipt')) {
      const purchase = mockPurchases.find(p => p.id === req.params.id);
      if (purchase && purchase.buyerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Only the buyer can confirm receipt'
        });
      }
    }
    
    next();
  },
  
  verifyAdminAccess: (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required.'
      });
    }
    
    next();
  }
};

// Create Express app for testing
const app = express();
app.use(express.json());
app.use(cors());

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  
  // Extract user from token (simplified for testing)
  const token = authHeader.replace('Bearer ', '');
  const user = mockUsers[token] || null;
  
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
  
  req.user = user;
  next();
};

// Test routes
app.post('/api/listings', mockAuth, async (req, res) => {
  try {
    const { title, description, game, platform, price, images } = req.body;
    const sellerId = req.user.id;
    
    // Create new listing
    const newListing = {
      id: `listing-${Date.now()}`,
      title,
      description,
      game,
      platform,
      price,
      images: images || [],
      sellerId,
      status: 'pending',
      isVerified: false,
      createdAt: new Date().toISOString(),
      stats: { views: 0, favorites: 0, inquiries: 0 }
    };
    
    mockListings.push(newListing);
    
    // Update user stats
    const user = mockUsers[sellerId];
    if (user) {
      user.stats.listedCount += 1;
      user.role = 'seller'; // Auto-assign seller role
    }
    
    // Log admin action
    await mockHelpers.logAdminAction({
      adminId: req.user.id,
      adminEmail: req.user.email,
      actionType: 'LISTING_CREATED',
      targetType: 'listing',
      targetId: newListing.id,
      details: {
        title: newListing.title,
        game: newListing.game,
        price: newListing.price
      }
    });
    
    // Create notification
    await mockHelpers.createNotification({
      type: 'LISTING_CREATED',
      title: 'Listing Created',
      message: `Your listing "${title}" has been created and is pending review.`,
      targetUrl: `/listing/${newListing.id}`,
      priority: 'MEDIUM',
      isRead: false
    });
    
    res.json({
      success: true,
      data: { listing: newListing }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create listing'
    });
  }
});

app.post('/api/listings/:id/buy', mockAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, deliveryInstructions } = req.body;
    const buyerId = req.user.id;
    
    // Find listing
    const listing = mockListings.find(l => l.id === id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }
    
    if (listing.sellerId === buyerId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot buy your own listing'
      });
    }
    
    // Create purchase
    const newPurchase = {
      id: `purchase-${Date.now()}`,
      listingId: id,
      buyerId,
      sellerId: listing.sellerId,
      amount: listing.price.min,
      currency: 'USD',
      status: 'paid',
      paymentDetails: {
        method: paymentMethod,
        transactionId: `txn-${Date.now()}`
      },
      deliveryDetails: {
        method: 'email',
        instructions: deliveryInstructions
      },
      createdAt: new Date().toISOString()
    };
    
    mockPurchases.push(newPurchase);
    
    // Update user stats
    const buyer = mockUsers[buyerId];
    const seller = mockUsers[listing.sellerId];
    
    if (buyer) {
      buyer.stats.boughtCount += 1;
      buyer.stats.totalSpent += newPurchase.amount;
      buyer.role = 'buyer';
    }
    
    if (seller) {
      seller.stats.totalEarned += newPurchase.amount;
    }
    
    // Log admin action
    await mockHelpers.logAdminAction({
      adminId: req.user.id,
      adminEmail: req.user.email,
      actionType: 'PURCHASE_CREATED',
      targetType: 'purchase',
      targetId: newPurchase.id,
      details: {
        listingTitle: listing.title,
        amount: newPurchase.amount,
        sellerId: listing.sellerId
      }
    });
    
    // Create notifications
    await mockHelpers.createNotification({
      type: 'PURCHASE_CREATED',
      title: 'Purchase Completed',
      message: `You have successfully purchased "${listing.title}" for $${newPurchase.amount}.`,
      targetUrl: `/purchase/${newPurchase.id}`,
      priority: 'HIGH',
      isRead: false
    });
    
    await mockHelpers.createNotification({
      type: 'SALE_CREATED',
      title: 'New Sale',
      message: `Your listing "${listing.title}" has been purchased for $${newPurchase.amount}.`,
      targetUrl: `/purchase/${newPurchase.id}`,
      priority: 'HIGH',
      isRead: false
    });
    
    res.json({
      success: true,
      data: { purchase: newPurchase }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create purchase'
    });
  }
});

app.post('/api/purchases/:id/confirm-delivery', mockAuth, mockHelpers.verifyOwnership, async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryDetails } = req.body;
    
    const purchase = mockPurchases.find(p => p.id === id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      });
    }
    
    if (purchase.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the seller can confirm delivery'
      });
    }
    
    // Update purchase status
    purchase.status = 'delivered';
    purchase.deliveryDetails = {
      ...purchase.deliveryDetails,
      ...deliveryDetails,
      deliveredAt: new Date().toISOString()
    };
    
    // Log admin action
    await mockHelpers.logAdminAction({
      adminId: req.user.id,
      adminEmail: req.user.email,
      actionType: 'DELIVERY_CONFIRMED',
      targetType: 'purchase',
      targetId: id,
      details: {
        purchaseId: id,
        buyerId: purchase.buyerId
      }
    });
    
    // Create notification for buyer
    await mockHelpers.createNotification({
      type: 'DELIVERY_CONFIRMED',
      title: 'Delivery Confirmed',
      message: 'Your purchase has been delivered. Please confirm receipt.',
      targetUrl: `/purchase/${id}`,
      priority: 'HIGH',
      isRead: false
    });
    
    res.json({
      success: true,
      data: { purchase }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to confirm delivery'
    });
  }
});

app.post('/api/purchases/:id/confirm-receipt', mockAuth, mockHelpers.verifyOwnership, async (req, res) => {
  try {
    const { id } = req.params;
    
    const purchase = mockPurchases.find(p => p.id === id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      });
    }
    
    if (purchase.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the buyer can confirm receipt'
      });
    }
    
    if (purchase.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Purchase must be delivered before confirming receipt'
      });
    }
    
    // Update purchase status
    purchase.status = 'completed';
    purchase.deliveryDetails.receivedAt = new Date().toISOString();
    
    // Log admin action
    await mockHelpers.logAdminAction({
      adminId: req.user.id,
      adminEmail: req.user.email,
      actionType: 'RECEIPT_CONFIRMED',
      targetType: 'purchase',
      targetId: id,
      details: {
        purchaseId: id,
        sellerId: purchase.sellerId
      }
    });
    
    // Create notification for seller
    await mockHelpers.createNotification({
      type: 'RECEIPT_CONFIRMED',
      title: 'Receipt Confirmed',
      message: 'Your sale has been completed successfully.',
      targetUrl: `/purchase/${id}`,
      priority: 'HIGH',
      isRead: false
    });
    
    res.json({
      success: true,
      data: { purchase }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to confirm receipt'
    });
  }
});

app.put('/api/users/:id/role', mockAuth, mockHelpers.verifyAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const user = mockUsers[id];
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const oldRole = user.role;
    user.role = role;
    
    // Log admin action
    await mockHelpers.logAdminAction({
      adminId: req.user.id,
      adminEmail: req.user.email,
      actionType: 'USER_ROLE_UPDATED',
      targetType: 'user',
      targetId: id,
      details: {
        oldRole,
        newRole: role,
        targetUser: user.email
      }
    });
    
    // Create notification for user
    await mockHelpers.createNotification({
      type: 'ROLE_UPDATED',
      title: 'Role Updated',
      message: `Your role has been updated to ${role}.`,
      targetUrl: '/dashboard',
      priority: 'MEDIUM',
      isRead: false
    });
    
    res.json({
      success: true,
      data: { user }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
});

app.post('/api/notifications/:id/mark-read', mockAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = mockNotifications.find(n => n.id === id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
    
    // Mark as read
    notification.isRead = true;
    notification.updatedAt = new Date();
    
    res.json({
      success: true,
      data: { notification }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

app.post('/api/support/tickets', mockAuth, async (req, res) => {
  try {
    const { subject, description, priority } = req.body;
    const userId = req.user.id;
    
    // Create support ticket
    const ticket = {
      id: `ticket-${Date.now()}`,
      userId,
      subject,
      description,
      priority: priority || 'MEDIUM',
      status: 'open',
      createdAt: new Date().toISOString()
    };
    
    // Log admin action
    await mockHelpers.logAdminAction({
      adminId: req.user.id,
      adminEmail: req.user.email,
      actionType: 'SUPPORT_TICKET_CREATED',
      targetType: 'ticket',
      targetId: ticket.id,
      details: {
        subject,
        priority: ticket.priority
      }
    });
    
    res.json({
      success: true,
      data: { ticket }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create support ticket'
    });
  }
});

module.exports = { app, mockUsers, mockListings, mockPurchases, mockNotifications, mockAdminActions };
