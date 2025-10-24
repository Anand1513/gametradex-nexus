/**
 * Admin Routes with Action Logging
 * Handles admin actions with proper audit logging
 */

const express = require('express');
const router = express.Router();
const { logAdminAction } = require('../../utils/logAdminAction.js');

// Mock data for demonstration
const mockListings = [
  {
    id: '1',
    title: 'Premium Gaming Account',
    price: { min: 100, max: 150, isFixed: false, negotiable: true },
    status: 'pending',
    verified: false,
    sellerId: 'seller-1',
    createdAt: new Date()
  },
  {
    id: '2', 
    title: 'Rare Skin Collection',
    price: { min: 50, max: 50, isFixed: true, negotiable: false },
    status: 'approved',
    verified: true,
    sellerId: 'seller-2',
    createdAt: new Date()
  }
];

const mockUsers = [
  { id: 'user-1', email: 'user1@example.com', role: 'user', name: 'John Doe' },
  { id: 'user-2', email: 'user2@example.com', role: 'seller', name: 'Jane Smith' }
];

const mockEscrows = [
  { id: 'escrow-1', listingId: '1', buyerId: 'buyer-1', sellerId: 'seller-1', amount: 120, status: 'pending' }
];

const mockPayments = [
  { id: 'payment-1', amount: 120, method: 'stripe', status: 'completed', userId: 'user-1' }
];

/**
 * Update listing price
 * PUT /api/admin/listings/:id/price
 */
router.put('/listings/:id/price', async (req, res) => {
  try {
    const { id } = req.params;
    const { priceMin, priceMax, isFixed, negotiable } = req.body;
    const sessionId = req.headers['x-session-id'] || 'unknown';
    const adminId = req.headers['x-admin-id'] || 'admin-123';
    const adminEmail = req.headers['x-admin-email'] || 'admin@gametradex.com';

    // Find the listing
    const listing = mockListings.find(l => l.id === id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Store old price for logging
    const oldPrice = { ...listing.price };
    
    // Update price
    listing.price = {
      min: priceMin,
      max: priceMax,
      isFixed: isFixed,
      negotiable: negotiable
    };

    // Log the price change action
    await logAdminAction({
      req,
      admin: { id: adminId, email: adminEmail },
      sessionId,
      actionType: 'PRICE_UPDATE',
      targetType: 'LISTING',
      targetId: id,
      details: {
        oldPrice,
        newPrice: listing.price,
        listingTitle: listing.title,
        listingStatus: listing.status,
        sellerId: listing.sellerId,
        changeReason: 'admin_manual_update',
        priceChangeSummary: {
          oldPriceMin: oldPrice.min,
          oldPriceMax: oldPrice.max,
          newPriceMin: priceMin,
          newPriceMax: priceMax,
          priceTypeChanged: oldPrice.isFixed !== isFixed,
          negotiableChanged: oldPrice.negotiable !== negotiable
        }
      }
    });

    res.json({
      success: true,
      message: 'Listing price updated successfully',
      data: {
        listingId: id,
        oldPrice,
        newPrice: listing.price
      }
    });

  } catch (error) {
    console.error('Error updating listing price:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update listing price',
      error: error.message
    });
  }
});

/**
 * Approve listing
 * POST /api/admin/listings/:id/approve
 */
router.post('/listings/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const sessionId = req.headers['x-session-id'] || 'unknown';
    const adminId = req.headers['x-admin-id'] || 'admin-123';
    const adminEmail = req.headers['x-admin-email'] || 'admin@gametradex.com';

    // Find the listing
    const listing = mockListings.find(l => l.id === id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    const oldStatus = listing.status;
    const oldVerified = listing.verified;

    // Approve listing
    listing.status = 'approved';
    listing.verified = true;

    // Log the approval action
    await logAdminAction({
      req,
      admin: { id: adminId, email: adminEmail },
      sessionId,
      actionType: 'LISTING_APPROVE',
      targetType: 'LISTING',
      targetId: id,
      details: {
        action: 'approve',
        listingDetails: {
          title: listing.title,
          status: listing.status,
          price: listing.price,
          sellerId: listing.sellerId,
          verified: listing.verified
        },
        approvalTime: new Date().toISOString(),
        oldStatus,
        oldVerified,
        newStatus: listing.status,
        newVerified: listing.verified
      }
    });

    res.json({
      success: true,
      message: 'Listing approved successfully',
      data: {
        listingId: id,
        status: listing.status,
        verified: listing.verified
      }
    });

  } catch (error) {
    console.error('Error approving listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve listing',
      error: error.message
    });
  }
});

/**
 * Reject listing
 * POST /api/admin/listings/:id/reject
 */
router.post('/listings/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const sessionId = req.headers['x-session-id'] || 'unknown';
    const adminId = req.headers['x-admin-id'] || 'admin-123';
    const adminEmail = req.headers['x-admin-email'] || 'admin@gametradex.com';

    // Find the listing
    const listing = mockListings.find(l => l.id === id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    const oldStatus = listing.status;

    // Reject listing
    listing.status = 'rejected';

    // Log the rejection action
    await logAdminAction({
      req,
      admin: { id: adminId, email: adminEmail },
      sessionId,
      actionType: 'LISTING_REJECT',
      targetType: 'LISTING',
      targetId: id,
      details: {
        action: 'reject',
        listingDetails: {
          title: listing.title,
          status: listing.status,
          price: listing.price,
          sellerId: listing.sellerId,
          verified: listing.verified
        },
        rejectionTime: new Date().toISOString(),
        oldStatus,
        newStatus: listing.status,
        rejectionReason: reason || 'admin_manual_rejection'
      }
    });

    res.json({
      success: true,
      message: 'Listing rejected successfully',
      data: {
        listingId: id,
        status: listing.status,
        reason
      }
    });

  } catch (error) {
    console.error('Error rejecting listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject listing',
      error: error.message
    });
  }
});

/**
 * Delete listing
 * DELETE /api/admin/listings/:id
 */
router.delete('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const sessionId = req.headers['x-session-id'] || 'unknown';
    const adminId = req.headers['x-admin-id'] || 'admin-123';
    const adminEmail = req.headers['x-admin-email'] || 'admin@gametradex.com';

    // Find the listing
    const listingIndex = mockListings.findIndex(l => l.id === id);
    if (listingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    const listing = mockListings[listingIndex];
    const listingDetails = {
      title: listing.title,
      status: listing.status,
      price: listing.price,
      sellerId: listing.sellerId,
      verified: listing.verified,
      createdAt: listing.createdAt
    };

    // Delete listing
    mockListings.splice(listingIndex, 1);

    // Log the deletion action
    await logAdminAction({
      req,
      admin: { id: adminId, email: adminEmail },
      sessionId,
      actionType: 'LISTING_DELETE',
      targetType: 'LISTING',
      targetId: id,
      details: {
        listingDetails,
        deletionTime: new Date().toISOString(),
        deletionReason: reason || 'admin_manual_deletion'
      }
    });

    res.json({
      success: true,
      message: 'Listing deleted successfully',
      data: {
        listingId: id,
        deletedListing: listingDetails
      }
    });

  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete listing',
      error: error.message
    });
  }
});

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const sessionId = req.headers['x-session-id'] || 'unknown';
    const adminId = req.headers['x-admin-id'] || 'admin-123';
    const adminEmail = req.headers['x-admin-email'] || 'admin@gametradex.com';

    // Find the user
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldRole = user.role;
    const userDetails = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    // Update user role
    user.role = role;

    // Log the role change action
    await logAdminAction({
      req,
      admin: { id: adminId, email: adminEmail },
      sessionId,
      actionType: 'USER_ROLE_CHANGE',
      targetType: 'USER',
      targetId: id,
      details: {
        oldRole,
        newRole: role,
        userDetails,
        changeTime: new Date().toISOString(),
        changeReason: 'admin_manual_change'
      }
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        userId: id,
        oldRole,
        newRole: role
      }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

/**
 * Update escrow status
 * PUT /api/admin/escrows/:id/status
 */
router.put('/escrows/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, action } = req.body;
    const sessionId = req.headers['x-session-id'] || 'unknown';
    const adminId = req.headers['x-admin-id'] || 'admin-123';
    const adminEmail = req.headers['x-admin-email'] || 'admin@gametradex.com';

    // Find the escrow
    const escrow = mockEscrows.find(e => e.id === id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    const oldStatus = escrow.status;
    const escrowDetails = {
      id: escrow.id,
      listingId: escrow.listingId,
      buyerId: escrow.buyerId,
      sellerId: escrow.sellerId,
      amount: escrow.amount
    };

    // Update escrow status
    escrow.status = status;

    // Log the escrow update action
    await logAdminAction({
      req,
      admin: { id: adminId, email: adminEmail },
      sessionId,
      actionType: 'ESCROW_UPDATE',
      targetType: 'ESCROW',
      targetId: id,
      details: {
        action: action || 'status_change',
        escrowDetails,
        oldStatus,
        newStatus: status,
        updateTime: new Date().toISOString(),
        actionReason: 'admin_manual_action'
      }
    });

    res.json({
      success: true,
      message: 'Escrow status updated successfully',
      data: {
        escrowId: id,
        oldStatus,
        newStatus: status
      }
    });

  } catch (error) {
    console.error('Error updating escrow status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update escrow status',
      error: error.message
    });
  }
});

/**
 * Edit payment
 * PUT /api/admin/payments/:id
 */
router.put('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, status } = req.body;
    const sessionId = req.headers['x-session-id'] || 'unknown';
    const adminId = req.headers['x-admin-id'] || 'admin-123';
    const adminEmail = req.headers['x-admin-email'] || 'admin@gametradex.com';

    // Find the payment
    const payment = mockPayments.find(p => p.id === id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const oldPayment = { ...payment };
    const paymentDetails = {
      id: payment.id,
      userId: payment.userId
    };

    // Update payment
    if (amount !== undefined) payment.amount = amount;
    if (method !== undefined) payment.method = method;
    if (status !== undefined) payment.status = status;

    // Log the payment edit action
    await logAdminAction({
      req,
      admin: { id: adminId, email: adminEmail },
      sessionId,
      actionType: 'PAYMENT_EDIT',
      targetType: 'PAYMENT',
      targetId: id,
      details: {
        oldPayment,
        newPayment: payment,
        paymentDetails,
        editTime: new Date().toISOString(),
        editReason: 'admin_manual_edit'
      }
    });

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: {
        paymentId: id,
        oldPayment,
        newPayment: payment
      }
    });

  } catch (error) {
    console.error('Error editing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit payment',
      error: error.message
    });
  }
});

/**
 * Get all listings
 * GET /api/admin/listings
 */
router.get('/listings', (req, res) => {
  res.json({
    success: true,
    data: mockListings
  });
});

/**
 * Get all users
 * GET /api/admin/users
 */
router.get('/users', (req, res) => {
  res.json({
    success: true,
    data: mockUsers
  });
});

/**
 * Get all escrows
 * GET /api/admin/escrows
 */
router.get('/escrows', (req, res) => {
  res.json({
    success: true,
    data: mockEscrows
  });
});

/**
 * Get all payments
 * GET /api/admin/payments
 */
router.get('/payments', (req, res) => {
  res.json({
    success: true,
    data: mockPayments
  });
});

module.exports = router;
