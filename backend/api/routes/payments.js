/**
 * Payment Verification API Routes
 * Handles payment verification and custom request ID generation
 */

const express = require('express');
const router = express.Router();
const { CustomRequest } = require('../../models/CustomRequest');
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
    const customRequest = await CustomRequest.findById(requestId);

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
    if (new Date() > customRequest.expiresAt) {
      await customRequest.expire();
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

    // Update custom request with payment details
    customRequest.advancePaid = true;
    customRequest.paymentDetails = {
      amount: paymentDetails.amount,
      paymentMethod,
      transactionId,
      paymentDate: new Date()
    };
    customRequest.status = 'processing';

    // Save the request (this will trigger the pre-save middleware to generate customRequestId)
    const updatedRequest = await customRequest.save();

    // Log admin action
    try {
      await logAdminAction({
        req,
        admin: {
          id: customRequest.userId,
          email: req.body.userEmail || 'unknown@example.com'
        },
        sessionId: req.headers['x-session-id'] || 'unknown',
        actionType: 'PAYMENT_VERIFIED',
        targetType: 'CUSTOM_REQUEST',
        targetId: updatedRequest._id.toString(),
        details: {
          customRequestId: updatedRequest.customRequestId,
          amount: paymentDetails.amount,
          paymentMethod,
          transactionId,
          status: 'processing'
        },
        actorType: 'user'
      });
    } catch (logError) {
      console.warn('Failed to log payment verification:', logError);
    }

    // Create notification
    try {
      await createNotification({
        type: 'PAYMENT_VERIFIED',
        title: 'Payment Verified',
        message: `Payment verified for custom request "${customRequest.title}". Your request ID is ${updatedRequest.customRequestId}.`,
        targetUrl: `/custom-requests/${updatedRequest._id}`,
        relatedActionId: updatedRequest._id.toString(),
        priority: 'HIGH'
      });
    } catch (notificationError) {
      console.warn('Failed to create notification:', notificationError);
    }

    // Send email confirmation
    try {
      await sendEmail({
        to: req.body.userEmail || 'user@example.com',
        subject: 'Payment Verified - Custom Request Confirmed',
        html: `
          <h2>Payment Verified Successfully!</h2>
          <p>Your custom request has been confirmed and is now being processed.</p>
          <p><strong>Request ID:</strong> ${updatedRequest.customRequestId}</p>
          <p><strong>Title:</strong> ${customRequest.title}</p>
          <p><strong>Game:</strong> ${customRequest.game}</p>
          <p><strong>Budget:</strong> ${customRequest.formattedBudget}</p>
          <p>Our team will start searching for matching accounts and will contact you within 24-48 hours.</p>
        `
      });
    } catch (emailError) {
      console.warn('Failed to send confirmation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully. Custom request ID generated.',
      data: {
        customRequestId: updatedRequest.customRequestId,
        status: updatedRequest.status,
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

    const customRequest = await CustomRequest.findById(requestId);

    if (!customRequest) {
      return res.status(404).json({
        success: false,
        message: 'Custom request not found'
      });
    }

    res.json({
      success: true,
      data: {
        requestId: customRequest._id,
        customRequestId: customRequest.customRequestId,
        status: customRequest.status,
        advancePaid: customRequest.advancePaid,
        paymentDetails: customRequest.paymentDetails,
        timeRemaining: customRequest.timeRemaining
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

    const customRequest = await CustomRequest.findById(requestId);

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
    customRequest.status = 'cancelled';
    customRequest.adminNotes = `Refunded: ${reason}`;
    await customRequest.save();

    // Log admin action
    try {
      await logAdminAction({
        req,
        admin: {
          id: req.body.adminId || 'admin',
          email: req.body.adminEmail || 'admin@example.com'
        },
        sessionId: req.headers['x-session-id'] || 'unknown',
        actionType: 'PAYMENT_REFUND',
        targetType: 'CUSTOM_REQUEST',
        targetId: customRequest._id.toString(),
        details: {
          customRequestId: customRequest.customRequestId,
          refundAmount: customRequest.paymentDetails.amount,
          reason,
          status: 'cancelled'
        },
        actorType: 'admin'
      });
    } catch (logError) {
      console.warn('Failed to log refund action:', logError);
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        customRequestId: customRequest.customRequestId,
        refundAmount: customRequest.paymentDetails.amount,
        status: customRequest.status
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
