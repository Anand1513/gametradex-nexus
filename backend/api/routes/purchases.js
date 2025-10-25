/**
 * Purchases API Routes
 * Handles purchase management and delivery confirmations
 */

const express = require('express');
const router = express.Router();
const { Purchase } = require('../../models/Purchase');
const { Listing } = require('../../models/Listing');
const { User } = require('../../models/User');
const { 
  logAdminAction, 
  createNotification, 
  sendEmail, 
  verifyOwnership 
} = require('../../utils/simpleHelpers');

/**
 * Get purchases
 * GET /api/purchases
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      status,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {
      $or: [
        { buyerId: userId },
        { sellerId: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const purchases = await Purchase.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Purchase.countDocuments(query);

    res.json({
      success: true,
      data: {
        purchases,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases',
      error: error.message
    });
  }
});

/**
 * Get purchase by ID
 * GET /api/purchases/:id
 */
router.get('/:id', verifyOwnership('purchase'), async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      data: { purchase }
    });

  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase',
      error: error.message
    });
  }
});

/**
 * Confirm delivery
 * POST /api/purchases/:id/confirm-delivery
 */
router.post('/:id/confirm-delivery', verifyOwnership('purchase'), async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Only seller can confirm delivery
    if (purchase.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can confirm delivery'
      });
    }

    if (purchase.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Purchase must be paid before delivery confirmation'
      });
    }

    // Confirm delivery
    await purchase.confirmDelivery();

    // Get buyer details for notifications
    const buyer = await User.findById(purchase.buyerId);
    const seller = await User.findById(purchase.sellerId);

    // Log admin action
    try {
      await logAdminAction({
        req,
        admin: {
          id: req.user.id,
          email: seller?.email || 'unknown'
        },
        sessionId: req.headers['x-session-id'] || 'unknown',
        actionType: 'DELIVERY_CONFIRM',
        targetType: 'PURCHASE',
        targetId: purchase._id.toString(),
        details: {
          purchaseId: purchase._id.toString(),
          listingId: purchase.listingId,
          buyerId: purchase.buyerId,
          sellerId: purchase.sellerId,
          amount: purchase.amount,
          deliveryMethod: purchase.deliveryDetails.method
        },
        actorType: 'user'
      });
    } catch (logError) {
      console.warn('Failed to log delivery confirmation:', logError);
    }

    // Create notifications
    try {
      // Notify buyer
      await createNotification({
        type: 'SUCCESS',
        title: 'Delivery Confirmed',
        message: `Your purchase has been delivered. Please confirm receipt.`,
        targetUrl: `/purchases/${purchase._id}`,
        relatedActionId: purchase._id.toString(),
        priority: 'HIGH',
        recipients: [purchase.buyerId],
        metadata: {
          purchaseId: purchase._id.toString(),
          sellerEmail: purchase.sellerEmail,
          deliveryMethod: purchase.deliveryDetails.method
        }
      });

      // Notify seller
      await createNotification({
        type: 'INFO',
        title: 'Delivery Confirmed',
        message: `You have confirmed delivery for your sale.`,
        targetUrl: `/purchases/${purchase._id}`,
        relatedActionId: purchase._id.toString(),
        priority: 'MEDIUM',
        recipients: [purchase.sellerId],
        metadata: {
          purchaseId: purchase._id.toString(),
          buyerEmail: purchase.buyerEmail
        }
      });
    } catch (notificationError) {
      console.warn('Failed to create delivery notifications:', notificationError);
    }

    // Send email notifications
    try {
      // Email buyer
      await sendEmail({
        to: purchase.buyerEmail,
        subject: 'Purchase Delivered - Please Confirm Receipt',
        html: `
          <h1>Your purchase has been delivered!</h1>
          <p>The seller has confirmed delivery of your purchase.</p>
          <p>Please review the delivery and confirm receipt to complete the transaction.</p>
          <a href="${process.env.FRONTEND_URL}/purchases/${purchase._id}">Confirm Receipt</a>
        `
      });

      // Email seller
      await sendEmail({
        to: purchase.sellerEmail,
        subject: 'Delivery Confirmed',
        html: `
          <h1>Delivery Confirmed</h1>
          <p>You have confirmed delivery for your sale.</p>
          <p>Please wait for the buyer to confirm receipt.</p>
          <a href="${process.env.FRONTEND_URL}/purchases/${purchase._id}">View Purchase</a>
        `
      });
    } catch (emailError) {
      console.warn('Failed to send delivery emails:', emailError);
    }

    res.json({
      success: true,
      message: 'Delivery confirmed successfully',
      data: { purchase }
    });

  } catch (error) {
    console.error('Error confirming delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm delivery',
      error: error.message
    });
  }
});

/**
 * Confirm receipt
 * POST /api/purchases/:id/confirm-receipt
 */
router.post('/:id/confirm-receipt', verifyOwnership('purchase'), async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Only buyer can confirm receipt
    if (purchase.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can confirm receipt'
      });
    }

    if (purchase.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Purchase must be delivered before receipt confirmation'
      });
    }

    // Confirm receipt and complete purchase
    await purchase.confirmReceipt();
    await purchase.complete();

    // Get buyer and seller details
    const buyer = await User.findById(purchase.buyerId);
    const seller = await User.findById(purchase.sellerId);

    // Update user ratings (optional - you can implement rating system)
    if (buyer && seller) {
      // You can add rating logic here
      console.log('Purchase completed - ratings can be updated');
    }

    // Log admin action
    try {
      await logAdminAction({
        req,
        admin: {
          id: req.user.id,
          email: buyer?.email || 'unknown'
        },
        sessionId: req.headers['x-session-id'] || 'unknown',
        actionType: 'RECEIPT_CONFIRM',
        targetType: 'PURCHASE',
        targetId: purchase._id.toString(),
        details: {
          purchaseId: purchase._id.toString(),
          listingId: purchase.listingId,
          buyerId: purchase.buyerId,
          sellerId: purchase.sellerId,
          amount: purchase.amount,
          completionTime: purchase.metadata.completedAt
        },
        actorType: 'user'
      });
    } catch (logError) {
      console.warn('Failed to log receipt confirmation:', logError);
    }

    // Create notifications
    try {
      // Notify buyer
      await createNotification({
        type: 'SUCCESS',
        title: 'Purchase Completed',
        message: `Your purchase has been completed successfully!`,
        targetUrl: `/purchases/${purchase._id}`,
        relatedActionId: purchase._id.toString(),
        priority: 'HIGH',
        recipients: [purchase.buyerId],
        metadata: {
          purchaseId: purchase._id.toString(),
          amount: purchase.amount,
          completionTime: purchase.metadata.completedAt
        }
      });

      // Notify seller
      await createNotification({
        type: 'SUCCESS',
        title: 'Sale Completed',
        message: `Your sale has been completed successfully!`,
        targetUrl: `/purchases/${purchase._id}`,
        relatedActionId: purchase._id.toString(),
        priority: 'HIGH',
        recipients: [purchase.sellerId],
        metadata: {
          purchaseId: purchase._id.toString(),
          amount: purchase.amount,
          completionTime: purchase.metadata.completedAt
        }
      });
    } catch (notificationError) {
      console.warn('Failed to create completion notifications:', notificationError);
    }

    // Send email notifications
    try {
      // Email buyer
      await sendEmail({
        to: purchase.buyerEmail,
        subject: 'Purchase Completed Successfully!',
        html: `
          <h1>Purchase Completed!</h1>
          <p>Your purchase has been completed successfully.</p>
          <p>Thank you for using GameTradeX!</p>
          <a href="${process.env.FRONTEND_URL}/purchases/${purchase._id}">View Purchase</a>
        `
      });

      // Email seller
      await sendEmail({
        to: purchase.sellerEmail,
        subject: 'Sale Completed Successfully!',
        html: `
          <h1>Sale Completed!</h1>
          <p>Your sale has been completed successfully.</p>
          <p>Thank you for using GameTradeX!</p>
          <a href="${process.env.FRONTEND_URL}/purchases/${purchase._id}">View Purchase</a>
        `
      });
    } catch (emailError) {
      console.warn('Failed to send completion emails:', emailError);
    }

    res.json({
      success: true,
      message: 'Receipt confirmed and purchase completed successfully',
      data: { purchase }
    });

  } catch (error) {
    console.error('Error confirming receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm receipt',
      error: error.message
    });
  }
});

/**
 * Create dispute
 * POST /api/purchases/:id/dispute
 */
router.post('/:id/dispute', verifyOwnership('purchase'), async (req, res) => {
  try {
    const { reason, description } = req.body;
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Reason and description are required'
      });
    }

    // Create dispute
    await purchase.createDispute(reason, description);

    // Log admin action
    try {
      await logAdminAction({
        req,
        admin: {
          id: req.user.id,
          email: req.user.email || 'unknown'
        },
        sessionId: req.headers['x-session-id'] || 'unknown',
        actionType: 'DISPUTE_CREATE',
        targetType: 'PURCHASE',
        targetId: purchase._id.toString(),
        details: {
          purchaseId: purchase._id.toString(),
          reason,
          description,
          createdBy: req.user.id
        },
        actorType: 'user'
      });
    } catch (logError) {
      console.warn('Failed to log dispute creation:', logError);
    }

    // Create notification for admins
    try {
      await createNotification({
        type: 'WARNING',
        title: 'Purchase Dispute Created',
        message: `A dispute has been created for purchase ${purchase._id}`,
        targetUrl: `/admin/purchases/${purchase._id}`,
        relatedActionId: purchase._id.toString(),
        priority: 'HIGH',
        recipients: ['all'], // Notify all admins
        metadata: {
          purchaseId: purchase._id.toString(),
          reason,
          description,
          createdBy: req.user.id
        }
      });
    } catch (notificationError) {
      console.warn('Failed to create dispute notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Dispute created successfully',
      data: { purchase }
    });

  } catch (error) {
    console.error('Error creating dispute:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dispute',
      error: error.message
    });
  }
});

/**
 * Cancel purchase
 * POST /api/purchases/:id/cancel
 */
router.post('/:id/cancel', verifyOwnership('purchase'), async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    if (purchase.status === 'completed' || purchase.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Purchase cannot be cancelled'
      });
    }

    // Cancel purchase
    await purchase.cancel();

    // Log admin action
    try {
      await logAdminAction({
        req,
        admin: {
          id: req.user.id,
          email: req.user.email || 'unknown'
        },
        sessionId: req.headers['x-session-id'] || 'unknown',
        actionType: 'PURCHASE_CANCEL',
        targetType: 'PURCHASE',
        targetId: purchase._id.toString(),
        details: {
          purchaseId: purchase._id.toString(),
          cancelledBy: req.user.id,
          previousStatus: purchase.status
        },
        actorType: 'user'
      });
    } catch (logError) {
      console.warn('Failed to log purchase cancellation:', logError);
    }

    res.json({
      success: true,
      message: 'Purchase cancelled successfully',
      data: { purchase }
    });

  } catch (error) {
    console.error('Error cancelling purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel purchase',
      error: error.message
    });
  }
});

module.exports = router;
