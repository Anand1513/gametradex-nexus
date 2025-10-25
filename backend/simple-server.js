/**
 * Simple Express Server for Notifications and Admin Routes
 * This version doesn't require MongoDB models for basic functionality
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      notifications: 'active',
      adminRoutes: 'active'
    }
  });
});

// Import notification routes
const notificationRoutes = require('./api/routes/notifications.js');

// Import admin routes
const adminRoutes = require('./api/routes/simpleAdminRoutes.js');

// Import admin actions routes
const adminActionsRoutes = require('./api/routes/adminActionsSimple.js');

// Import listings routes
const listingsRoutes = require('./api/routes/listings.js');

// Import purchases routes
const purchasesRoutes = require('./api/routes/purchases.js');

// Import custom requests routes
const customRequestsRoutes = require('./api/routes/simpleCustomRequests.js');

// Import payments routes
const paymentsRoutes = require('./api/routes/simplePayments.js');

// Import interests routes
const interestsRoutes = require('./api/routes/simpleInterests.js');

// Use notification routes
app.use('/api/notifications', notificationRoutes);

// Use admin routes
app.use('/api/admin', adminRoutes);

// Use admin actions routes
app.use('/api/admin/actions', adminActionsRoutes);

// Use listings routes
app.use('/api/listings', listingsRoutes);

// Use purchases routes
app.use('/api/purchases', purchasesRoutes);

// Use custom requests routes
app.use('/api/custom-requests', customRequestsRoutes);

// Use payments routes
app.use('/api/payments', paymentsRoutes);

// Use interests routes
app.use('/api/interests', interestsRoutes);

// Debug route to test if adminActionsRoutes is working
app.get('/api/admin/actions/debug', (req, res) => {
  res.json({ 
    message: 'Admin actions routes are working',
    timestamp: new Date().toISOString()
  });
});

// Custom Request Fulfillment Endpoint
app.put('/api/admin/custom-requests/:id/fulfill', (req, res) => {
  try {
    const { id } = req.params;
    const { adminEmail, adminId } = req.body;
    
    // Import the shared data functions
    const { updateCustomRequest, findCustomRequest } = require('./api/routes/sharedData');
    
    // Find the custom request
    const request = findCustomRequest(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Custom request not found'
      });
    }
    
    // Update the request status to fulfilled
    const updatedRequest = updateCustomRequest(id, {
      status: 'fulfilled',
      fulfilledAt: new Date(),
      fulfilledBy: adminId,
      fulfilledByEmail: adminEmail
    });
    
    // Log admin action
    console.log('📝 Admin action logged:', {
      adminId,
      adminEmail,
      actionType: 'CUSTOM_REQUEST_FULFILLED',
      targetType: 'CUSTOM_REQUEST',
      targetId: id,
      actorType: 'admin',
      timestamp: new Date().toISOString()
    });
    
    // Create notification for user
    console.log('📢 Notification created:', {
      type: 'CUSTOM_REQUEST_FULFILLED',
      title: 'Custom Request Completed',
      message: `Your custom request "${request.title}" has been completed and is ready for delivery.`,
      customRequestId: request.customRequestId,
      userId: request.userId,
      userEmail: request.userEmail,
      priority: 'HIGH',
      timestamp: new Date().toISOString()
    });
    
    // Send email notification
    console.log('📧 Email sent:', {
      to: request.userEmail,
      subject: 'Custom Request Completed - Ready for Delivery',
      customRequestId: request.customRequestId,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Custom request marked as fulfilled. User has been notified.',
      data: {
        requestId: id,
        customRequestId: request.customRequestId,
        status: 'fulfilled',
        fulfilledAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fulfilling custom request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fulfill custom request'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔔 Notifications API: http://localhost:${PORT}/api/notifications`);
  console.log(`👑 Admin API: http://localhost:${PORT}/api/admin`);
});

module.exports = app;
