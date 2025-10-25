/**
 * Listings API Routes
 * Handles listing creation, management, and purchasing
 */

const express = require('express');
const router = express.Router();
const { Listing } = require('../../models/Listing');
const { User } = require('../../models/User');
const { Purchase } = require('../../models/Purchase');
const { 
  logAdminAction, 
  createNotification, 
  createListingNotification, 
  sendEmail, 
  sendListingNotificationEmail,
  verifyOwnership,
  verifyAdminAccess
} = require('../../utils/simpleHelpers');

/**
 * Create new listing
 * POST /api/listings
 */
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      game,
      platform,
      accountLevel,
      rank,
      price,
      images = [],
      tags = [],
      requirements = {},
      deliveryMethod = 'email',
      deliveryInstructions
    } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate required fields
    if (!title || !description || !game || !platform || !accountLevel || !rank || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create listing
    const listing = new Listing({
      title,
      description,
      game,
      platform,
      accountLevel,
      rank,
      price: {
        min: price.min,
        max: price.max,
        isFixed: price.isFixed || false,
        currency: price.currency || 'USD'
      },
      sellerId: userId,
      sellerEmail: user.email,
      images,
      tags,
      requirements,
      deliveryMethod,
      deliveryInstructions
    });

    const savedListing = await listing.save();

    // Update user role to seller if not already
    if (user.role === 'user') {
      user.role = 'seller';
      await user.save();
    }

    // Update user stats
    await user.updateStats('list');

    // Log admin action
    try {
      await logAdminAction({
        req,
        admin: {
          id: userId,
          email: user.email
        },
        sessionId: req.headers['x-session-id'] || 'unknown',
        actionType: 'LISTING_CREATE',
        targetType: 'LISTING',
        targetId: savedListing._id.toString(),
        details: {
          listingTitle: title,
          game,
          platform,
          price: savedListing.price,
          sellerId: userId,
          sellerEmail: user.email
        },
        actorType: 'user'
      });
    } catch (logError) {
      console.warn('Failed to log listing creation:', logError);
    }

    // Create notification
    try {
      await createListingNotification(
        savedListing._id.toString(),
        'created',
        userId,
        {
          title,
          game,
          platform,
          price: savedListing.price
        }
      );
    } catch (notificationError) {
      console.warn('Failed to create listing notification:', notificationError);
    }

    // Send email notification
    try {
      await sendListingNotificationEmail(
        user,
        title,
        'created',
        `${process.env.FRONTEND_URL}/listings/${savedListing._id}`
      );
    } catch (emailError) {
      console.warn('Failed to send listing email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: {
        listing: savedListing,
        userRole: user.role,
        stats: user.stats
      }
    });

  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create listing',
      error: error.message
    });
  }
});

/**
 * Get listings
 * GET /api/listings
 */
router.get('/', async (req, res) => {
  try {
    // Mock data for testing
    const mockListings = [
      {
        _id: 'listing-1',
        title: 'Premium Fortnite Account - 200+ Wins',
        description: 'High-level Fortnite account with rare skins',
        game: 'Fortnite',
        platform: 'PC',
        accountLevel: 150,
        rank: 'Champion',
        price: { min: 150, max: 200, isFixed: false, currency: 'USD' },
        sellerId: 'seller-1',
        sellerEmail: 'seller@example.com',
        status: 'approved',
        isVerified: true,
        images: ['https://example.com/skin1.jpg'],
        tags: ['rare-skins', 'high-wins'],
        stats: { views: 50, favorites: 5, inquiries: 2 },
        metadata: { createdAt: new Date(), updatedAt: new Date() }
      },
      {
        _id: 'listing-2',
        title: 'Valorant Radiant Account',
        description: 'Radiant rank Valorant account with all agents unlocked',
        game: 'Valorant',
        platform: 'PC',
        accountLevel: 100,
        rank: 'Radiant',
        price: { min: 300, max: 400, isFixed: true, currency: 'USD' },
        sellerId: 'seller-2',
        sellerEmail: 'seller2@example.com',
        status: 'approved',
        isVerified: true,
        images: ['https://example.com/valorant.jpg'],
        tags: ['radiant', 'all-agents'],
        stats: { views: 100, favorites: 10, inquiries: 5 },
        metadata: { createdAt: new Date(), updatedAt: new Date() }
      }
    ];

    res.json({
      success: true,
      data: {
        listings: mockListings,
        total: mockListings.length,
        limit: 20,
        offset: 0
      }
    });

  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: error.message
    });
  }
});

/**
 * Get listing by ID
 * GET /api/listings/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Increment view count
    await listing.incrementViews();

    res.json({
      success: true,
      data: { listing }
    });

  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listing',
      error: error.message
    });
  }
});

/**
 * Buy listing
 * POST /api/listings/:id/buy
 */
router.post('/:id/buy', async (req, res) => {
  try {
    const { paymentMethod, paymentId, deliveryInstructions } = req.body;
    const listingId = req.params.id;
    const buyerId = req.user?.id;

    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method required'
      });
    }

    // Get listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Listing is not available for purchase'
      });
    }

    if (listing.sellerId === buyerId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot buy your own listing'
      });
    }

    // Get buyer details
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    // Update buyer role if needed
    if (buyer.role === 'user') {
      buyer.role = 'buyer';
      await buyer.save();
    }

    // Create purchase
    const purchase = new Purchase({
      listingId,
      buyerId,
      buyerEmail: buyer.email,
      sellerId: listing.sellerId,
      sellerEmail: listing.sellerEmail,
      amount: listing.price.min, // Use minimum price for purchase
      currency: listing.price.currency,
      paymentMethod,
      paymentId,
      deliveryDetails: {
        method: 'email',
        instructions: deliveryInstructions || 'Please deliver via email'
      }
    });

    const savedPurchase = await purchase.save();

    // Mark listing as sold
    await listing.markAsSold();

    // Update buyer stats
    await buyer.updateStats('buy', savedPurchase.amount);

    // Get seller and update their stats
    const seller = await User.findById(listing.sellerId);
    if (seller) {
      seller.stats.totalEarned += savedPurchase.amount;
      await seller.save();
    }

    // Log admin action
    try {
      await logAdminAction({
        req,
        admin: {
          id: buyerId,
          email: buyer.email
        },
        sessionId: req.headers['x-session-id'] || 'unknown',
        actionType: 'PURCHASE_CREATE',
        targetType: 'PURCHASE',
        targetId: savedPurchase._id.toString(),
        details: {
          listingId,
          listingTitle: listing.title,
          amount: savedPurchase.amount,
          buyerId,
          sellerId: listing.sellerId,
          paymentMethod
        },
        actorType: 'user'
      });
    } catch (logError) {
      console.warn('Failed to log purchase creation:', logError);
    }

    // Create notifications
    try {
      // Notify buyer
      await createNotification({
        type: 'SUCCESS',
        title: 'Purchase Created',
        message: `You have successfully purchased "${listing.title}"`,
        targetUrl: `/purchases/${savedPurchase._id}`,
        relatedActionId: savedPurchase._id.toString(),
        priority: 'HIGH',
        recipients: [buyerId],
        metadata: {
          purchaseId: savedPurchase._id.toString(),
          listingTitle: listing.title,
          amount: savedPurchase.amount
        }
      });

      // Notify seller
      await createNotification({
        type: 'INFO',
        title: 'Listing Sold',
        message: `Your listing "${listing.title}" has been purchased`,
        targetUrl: `/purchases/${savedPurchase._id}`,
        relatedActionId: savedPurchase._id.toString(),
        priority: 'HIGH',
        recipients: [listing.sellerId],
        metadata: {
          purchaseId: savedPurchase._id.toString(),
          listingTitle: listing.title,
          amount: savedPurchase.amount,
          buyerEmail: buyer.email
        }
      });
    } catch (notificationError) {
      console.warn('Failed to create purchase notifications:', notificationError);
    }

    // Send email notifications
    try {
      // Email buyer
      await sendEmail({
        to: buyer.email,
        subject: `Purchase Confirmation - ${listing.title}`,
        html: `
          <h1>Purchase Confirmed!</h1>
          <p>You have successfully purchased "${listing.title}" for $${savedPurchase.amount}</p>
          <p>Please wait for delivery confirmation from the seller.</p>
          <a href="${process.env.FRONTEND_URL}/purchases/${savedPurchase._id}">View Purchase</a>
        `
      });

      // Email seller
      await sendEmail({
        to: listing.sellerEmail,
        subject: `Your listing "${listing.title}" has been sold!`,
        html: `
          <h1>Listing Sold!</h1>
          <p>Your listing "${listing.title}" has been purchased for $${savedPurchase.amount}</p>
          <p>Please deliver the account details to the buyer.</p>
          <a href="${process.env.FRONTEND_URL}/purchases/${savedPurchase._id}">View Purchase</a>
        `
      });
    } catch (emailError) {
      console.warn('Failed to send purchase emails:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: {
        purchase: savedPurchase,
        listing: listing,
        buyerStats: buyer.stats
      }
    });

  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create purchase',
      error: error.message
    });
  }
});

/**
 * Update listing
 * PUT /api/listings/:id
 */
router.put('/:id', verifyOwnership('listing'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    const updates = req.body;
    Object.assign(listing, updates);
    listing.metadata.updatedAt = new Date();

    const updatedListing = await listing.save();

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: { listing: updatedListing }
    });

  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update listing',
      error: error.message
    });
  }
});

/**
 * Delete listing
 * DELETE /api/listings/:id
 */
router.delete('/:id', verifyOwnership('listing'), async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.json({
      success: true,
      message: 'Listing deleted successfully'
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

module.exports = router;
