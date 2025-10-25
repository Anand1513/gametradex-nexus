/**
 * Simple Custom Request API Routes
 * Handles custom account requests with advance payment verification
 * This version doesn't require MongoDB models for basic functionality
 */

const express = require('express');
const router = express.Router();
const { 
  getCustomRequests, 
  addCustomRequest, 
  updateCustomRequest, 
  findCustomRequest,
  findCustomRequestByIndex
} = require('./sharedData');

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

    // Validate minimum budget
    if (budget.min < 5000) {
      return res.status(400).json({
        success: false,
        message: 'Minimum budget must be ₹5,000 or more'
      });
    }

    // Create custom request (without payment)
    const customRequest = {
      userId,
      title,
      game,
      budget,
      description,
      requirements,
      advancePaid: false,
      customRequestId: null, // Will be generated after payment
      status: 'pending_payment',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    };

    const savedRequest = addCustomRequest(customRequest);

    res.status(201).json({
      success: true,
      message: 'Custom request created successfully. Please complete payment to proceed.',
      data: {
        requestId: savedRequest._id,
        status: savedRequest.status,
        expiresAt: savedRequest.expiresAt,
        timeRemaining: '7d 0h'
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

    let userRequests = getCustomRequests().filter(req => req.userId === userId);
    
    if (status) {
      userRequests = userRequests.filter(req => req.status === status);
    }

    res.json({
      success: true,
      data: userRequests
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

    const request = findCustomRequest(id);

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

    const updatedRequest = updateCustomRequest(id, updateData);

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Custom request not found'
      });
    }

    res.json({
      success: true,
      message: 'Custom request updated successfully',
      data: updatedRequest
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

    const request = findCustomRequest(id);

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

    updateCustomRequest(id, { status: 'cancelled' });

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
    const allRequests = getCustomRequests();
    const stats = allRequests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});

    const totalRequests = allRequests.length;
    const pendingPayment = allRequests.filter(req => req.status === 'pending_payment').length;
    const processing = allRequests.filter(req => req.status === 'processing').length;
    const fulfilled = allRequests.filter(req => req.status === 'fulfilled').length;

    res.json({
      success: true,
      data: {
        total: totalRequests,
        pendingPayment,
        processing,
        fulfilled,
        breakdown: Object.entries(stats).map(([status, count]) => ({ _id: status, count }))
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

    const allRequests = getCustomRequests();
    let filteredRequests = allRequests;
    if (status) {
      filteredRequests = allRequests.filter(req => req.status === status);
    }

    const total = filteredRequests.length;
    const paginatedRequests = filteredRequests
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        requests: paginatedRequests,
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
