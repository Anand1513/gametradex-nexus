/**
 * Simplified Admin Routes (without MongoDB dependencies)
 * Handles admin actions with mock logging
 */

const express = require('express');
const router = express.Router();

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

// Mock logging function
const mockLogAdminAction = (actionData) => {
  console.log('📝 Admin Action Logged:', {
    timestamp: new Date().toISOString(),
    ...actionData
  });
};

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
    mockLogAdminAction({
      adminId,
      adminEmail,
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
        changeReason: 'admin_manual_update'
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
    mockLogAdminAction({
      adminId,
      adminEmail,
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
    mockLogAdminAction({
      adminId,
      adminEmail,
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
    mockLogAdminAction({
      adminId,
      adminEmail,
      sessionId,
      actionType: 'LISTING_DELETE',
      targetType: 'LISTING',
      targetId: id,
      details: {
        listingDetails,
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
