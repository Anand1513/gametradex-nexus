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

// Debug route to test if adminActionsRoutes is working
app.get('/api/admin/actions/debug', (req, res) => {
  res.json({ 
    message: 'Admin actions routes are working',
    timestamp: new Date().toISOString()
  });
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
