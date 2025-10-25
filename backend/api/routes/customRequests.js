/**
 * Custom Request API Routes
 * Handles custom account requests with advance payment verification
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
 * Create new custom request (without payment)
 * POST /api/custom-requests
 */
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      title,
      game,
      budget,
      description,
      requirements = {}
    } = req.body;

    // Validate required fields
    if (!userId || !title || !game || !budget || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, title, game, budget, description'
      });
    }

    // Validate budget
    if (!budget.min || !budget.max || budget.min >= budget.max) {
      return res.status(400).json({
        success: false,
        message: 'Invalid budget range. Min must be less than max.'
      });
    }

    // Create custom request (without payment)
    const customRequest = new CustomRequest({
      userId,
      title,
      game,
      budget,
      description,
      requirements,
      advancePaid: false,
      status: 'pending_payment'
    });

    const savedRequest = await customRequest.save();

    // Log admin action
    try {
      await logAdminAction({
        req,
        admin: {
          id: userId,
          email: req.body.userEmail || 'unknown@example.com'
        },
        sessionId: req.headers['x-session-id'] || 'unknown',
        actionType: 'CUSTOM_REQUEST_CREATE',
        targetType: 'CUSTOM_REQUEST',
        targetId: savedRequest._id.toString(),
        details: {
          title,
          game,
          budget: savedRequest.formattedBudget,
          status: 'pending_payment'
        },
        actorType: 'user'
      });
    } catch (logError) {
      console.warn('Failed to log custom request creation:', logError);
    }

    // Create notification
    try {
      await createNotification({
        type: 'CUSTOM_REQUEST_CREATED',
        title: 'Custom Request Created',
        message: `Your custom request "${title}" has been created and is pending payment.`,
        targetUrl: `/custom-requests/${savedRequest._id}`,
        relatedActionId: savedRequest._id.toString(),
        priority: 'MEDIUM'
      });
    } catch (notificationError) {
      console.warn('Failed to create notification:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'Custom request created successfully. Please complete payment to proceed.',
      data: {
        requestId: savedRequest._id,
        status: savedRequest.status,
        expiresAt: savedRequest.expiresAt,
        timeRemaining: savedRequest.timeRemaining
      }
    });

  } catch (error) {
    console.error('Error creating custom request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom request',
      error: error.message
    });
  }
});

/**
 * Get custom requests by user
 * GET /api/custom-requests/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const requests = await CustomRequest.findByUserId(userId, status);

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching custom requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom requests',
      error: error.message
    });
  }
});

/**
 * Get single custom request
 * GET /api/custom-requests/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await CustomRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Custom request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Error fetching custom request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom request',
      error: error.message
    });
  }
});

/**
 * Update custom request
 * PUT /api/custom-requests/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.customRequestId;
    delete updateData.advancePaid;
    delete updateData.paymentDetails;

    const request = await CustomRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Custom request not found'
      });
    }

    res.json({
      success: true,
      message: 'Custom request updated successfully',
      data: request
    });

  } catch (error) {
    console.error('Error updating custom request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update custom request',
      error: error.message
    });
  }
});

/**
 * Cancel custom request
 * DELETE /api/custom-requests/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await CustomRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Custom request not found'
      });
    }

    if (request.status === 'fulfilled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a fulfilled request'
      });
    }

    await request.cancel();

    res.json({
      success: true,
      message: 'Custom request cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling custom request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel custom request',
      error: error.message
    });
  }
});

/**
 * Get custom request statistics (Admin only)
 * GET /api/custom-requests/admin/stats
 */
router.get('/admin/stats', async (req, res) => {
  try {
    const stats = await CustomRequest.getStats();
    const totalRequests = await CustomRequest.countDocuments();
    const pendingPayment = await CustomRequest.countDocuments({ status: 'pending_payment' });
    const processing = await CustomRequest.countDocuments({ status: 'processing' });
    const fulfilled = await CustomRequest.countDocuments({ status: 'fulfilled' });

    res.json({
      success: true,
      data: {
        total: totalRequests,
        pendingPayment,
        processing,
        fulfilled,
        breakdown: stats
      }
    });

  } catch (error) {
    console.error('Error fetching custom request stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

/**
 * Get all custom requests (Admin only)
 * GET /api/custom-requests/admin/all
 */
router.get('/admin/all', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = status ? { status } : {};
    const requests = await CustomRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CustomRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching all custom requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom requests',
      error: error.message
    });
  }
});

module.exports = router;
