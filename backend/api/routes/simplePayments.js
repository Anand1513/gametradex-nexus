/**
 * Simple Payment Verification API Routes
 * Handles payment verification and custom request ID generation
 * This version doesn't require MongoDB models for basic functionality
 */

const express = require('express');
const router = express.Router();

// Import the shared custom requests data
const { 
  getCustomRequests, 
  updateCustomRequest, 
  findCustomRequest,
  findCustomRequestByIndex
} = require('./sharedData');

// Import notification utilities
const { 
  logAdminAction, 
  createNotification, 
  sendEmail 
} = require('../../utils/simpleHelpers');

/**
 * Verify payment and generate custom request ID
 * POST /api/payments/verify
 */
router.post('/verify', async (req, res) => {
  try {
    const {
      requestId,
      paymentDetails,
      transactionId,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!requestId || !paymentDetails || !transactionId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: requestId, paymentDetails, transactionId, paymentMethod'
      });
    }

    // Find the custom request
    const customRequest = findCustomRequest(requestId);

    if (!customRequest) {
      return res.status(404).json({
        success: false,
        message: 'Custom request not found'
      });
    }

    // Check if already paid
    if (customRequest.advancePaid) {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed for this request'
      });
    }

    // Check if request is still valid
    if (customRequest.status !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        message: 'Request is no longer pending payment'
      });
    }

    // Check if request has expired
    if (new Date() > new Date(customRequest.expiresAt)) {
      updateCustomRequest(requestId, { status: 'expired' });
      return res.status(400).json({
        success: false,
        message: 'Request has expired'
      });
    }

    // Simulate payment verification (in real implementation, integrate with payment gateway)
    const paymentVerified = await verifyPaymentWithGateway({
      transactionId,
      amount: paymentDetails.amount,
      paymentMethod
    });

    if (!paymentVerified) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Generate custom request ID in format CR-YYYYMMDD-####
    const now = new Date();
    const dateStr = now.getFullYear().toString() + 
                   (now.getMonth() + 1).toString().padStart(2, '0') + 
                   now.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const customRequestId = `CR-${dateStr}-${randomNum}`;

    // Update custom request with payment details
    const updatedRequest = updateCustomRequest(requestId, {
      advancePaid: true,
      customRequestId,
      status: 'processing',
      paymentDetails: {
        amount: paymentDetails.amount,
        paymentMethod,
        transactionId,
        paymentDate: new Date()
      }
    });

    // Create notifications for user and admin
    try {
      // User notification
      await createNotification({
        type: 'PAYMENT_VERIFIED',
        title: 'Payment Verified Successfully',
        message: `Your custom request "${customRequest.title}" has been confirmed. Request ID: ${customRequestId}`,
        targetUrl: `/custom-requests/${requestId}`,
        relatedActionId: requestId,
        priority: 'HIGH',
        userId: customRequest.userId
      });

      // Admin notification
      await createNotification({
        type: 'CUSTOM_REQUEST_PAID',
        title: 'New Custom Request Payment',
        message: `User ${customRequest.userId} has paid for custom request "${customRequest.title}". Request ID: ${customRequestId}`,
        targetUrl: `/admin/custom-requests/${requestId}`,
        relatedActionId: requestId,
        priority: 'HIGH',
        isAdmin: true
      });

      // Log admin action
      await logAdminAction({
        req,
        admin: {
          id: customRequest.userId,
          email: req.body.userEmail || 'user@example.com'
        },
        sessionId: req.headers['x-session-id'] || 'unknown',
        actionType: 'PAYMENT_VERIFIED',
        targetType: 'CUSTOM_REQUEST',
        targetId: requestId,
        details: {
          customRequestId,
          amount: paymentDetails.amount,
          paymentMethod,
          transactionId,
          status: 'processing'
        },
        actorType: 'user'
      });

      // Send email notification to user
      await sendEmail({
        to: req.body.userEmail || 'user@example.com',
        subject: 'Payment Verified - Custom Request Confirmed',
        html: `
          <h2>Payment Verified Successfully!</h2>
          <p>Your custom request has been confirmed and is now being processed.</p>
          <p><strong>Request ID:</strong> ${customRequestId}</p>
          <p><strong>Title:</strong> ${customRequest.title}</p>
          <p><strong>Game:</strong> ${customRequest.game}</p>
          <p><strong>Budget:</strong> ${customRequest.budget.currency} ${customRequest.budget.min.toLocaleString()} - ${customRequest.budget.max.toLocaleString()}</p>
          <p><strong>Advance Paid:</strong> ${customRequest.budget.currency} ${paymentDetails.amount.toLocaleString()}</p>
          <p>Our team will start searching for matching accounts and will contact you within 24-48 hours.</p>
        `
      });

    } catch (notificationError) {
      console.warn('Failed to create notifications or send email:', notificationError);
      // Don't fail the payment verification if notifications fail
    }

    res.json({
      success: true,
      message: 'Payment verified successfully. Custom request ID generated.',
      data: {
        customRequestId,
        status: 'processing',
        paymentDetails: updatedRequest.paymentDetails
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

/**
 * Get payment status
 * GET /api/payments/status/:requestId
 */
router.get('/status/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    const customRequest = findCustomRequest(requestId);

    if (!customRequest) {
      return res.status(404).json({
        success: false,
        message: 'Custom request not found'
      });
    }

    const now = new Date();
    const expiry = new Date(customRequest.expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    let timeRemaining = 'Expired';
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      timeRemaining = `${days}d ${hours}h`;
    }

    res.json({
      success: true,
      data: {
        requestId: customRequest._id,
        customRequestId: customRequest.customRequestId,
        status: customRequest.status,
        advancePaid: customRequest.advancePaid,
        paymentDetails: customRequest.paymentDetails,
        timeRemaining
      }
    });

  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
      error: error.message
    });
  }
});

/**
 * Refund payment (Admin only)
 * POST /api/payments/refund
 */
router.post('/refund', async (req, res) => {
  try {
    const { requestId, reason } = req.body;

    if (!requestId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: requestId, reason'
      });
    }

    const customRequest = findCustomRequest(requestId);

    if (!customRequest) {
      return res.status(404).json({
        success: false,
        message: 'Custom request not found'
      });
    }

    if (!customRequest.advancePaid) {
      return res.status(400).json({
        success: false,
        message: 'No payment to refund'
      });
    }

    // Simulate refund process
    const refundProcessed = await processRefund({
      transactionId: customRequest.paymentDetails.transactionId,
      amount: customRequest.paymentDetails.amount,
      reason
    });

    if (!refundProcessed) {
      return res.status(400).json({
        success: false,
        message: 'Refund processing failed'
      });
    }

    // Update request status
    updateCustomRequest(requestId, {
      status: 'cancelled',
      adminNotes: `Refunded: ${reason}`
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        customRequestId: customRequest.customRequestId,
        refundAmount: customRequest.paymentDetails.amount,
        status: 'cancelled'
      }
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
});

/**
 * Simulate payment gateway verification
 * In real implementation, integrate with actual payment gateway
 */
async function verifyPaymentWithGateway(paymentData) {
  // Simulate API call to payment gateway
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate successful verification
      resolve(true);
    }, 1000);
  });
}

/**
 * Simulate refund processing
 * In real implementation, integrate with actual payment gateway
 */
async function processRefund(refundData) {
  // Simulate API call to payment gateway for refund
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate successful refund
      resolve(true);
    }, 1000);
  });
}

module.exports = router;
