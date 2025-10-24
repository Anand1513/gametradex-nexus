/**
 * GameTradeX Backend Server
 * Handles MongoDB operations for admin actions and sessions
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gametradex';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Import models and routes
const { AdminAction } = require('./models/AdminAction');
const { AdminSession } = require('./models/AdminSession');

// Import utilities
const { logAdminAction } = require('./utils/logAdminAction');
const { startAdminSession, endAdminSession } = require('./utils/adminSessions');

// Import admin routes
const adminRoutes = require('./api/routes/adminRoutes.js');

// Import notification routes
const notificationRoutes = require('./api/routes/notifications.js');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Admin Actions API Routes
app.post('/api/admin/logs', async (req, res) => {
  try {
    const logEntry = req.body;
    
    // Create admin action document
    const adminAction = new AdminAction({
      adminId: logEntry.adminId,
      adminEmail: logEntry.email,
      sessionId: logEntry.sessionId,
      actionType: logEntry.actionType,
      targetType: logEntry.targetType,
      targetId: logEntry.targetId,
      details: logEntry.details,
      ip: logEntry.ip,
      userAgent: logEntry.userAgent || 'Unknown',
      createdAt: new Date()
    });
    
    const savedAction = await adminAction.save();
    
    res.status(201).json({
      success: true,
      message: 'Admin action logged successfully',
      data: savedAction
    });
    
  } catch (error) {
    console.error('Error logging admin action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log admin action',
      error: error.message
    });
  }
});

// Admin Sessions API Routes
app.post('/api/admin/sessions/start', async (req, res) => {
  try {
    const { adminId, adminEmail } = req.body;
    
    if (!adminId || !adminEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: adminId, adminEmail'
      });
    }
    
    // Create admin session
    const sessionId = `admin_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const loginAt = new Date();
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const origin = req.headers.origin || req.headers.referer;
    
    const adminSession = new AdminSession({
      adminId,
      sessionId,
      loginAt,
      ip,
      userAgent,
      origin,
      isActive: true,
      lastActivity: loginAt
    });
    
    const savedSession = await adminSession.save();
    
    // Log the login action
    await logAdminAction({
      req,
      admin: { id: adminId, email: adminEmail },
      sessionId,
      actionType: 'LOGIN',
      targetType: 'SESSION',
      details: {
        loginMethod: 'admin_credentials',
        loginTime: loginAt.toISOString(),
        ip,
        userAgent,
        origin
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Admin session started successfully',
      data: {
        sessionId: savedSession.sessionId,
        adminId: savedSession.adminId,
        loginAt: savedSession.loginAt,
        ip: savedSession.ip,
        userAgent: savedSession.userAgent,
        origin: savedSession.origin
      }
    });
    
  } catch (error) {
    console.error('Error starting admin session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start admin session',
      error: error.message
    });
  }
});

app.post('/api/admin/sessions/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    // Find and end the session
    const session = await AdminSession.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    if (!session.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Session already ended'
      });
    }
    
    // End the session
    session.isActive = false;
    session.logoutAt = new Date();
    session.duration = session.logoutAt.getTime() - session.loginAt.getTime();
    await session.save();
    
    // Log the logout action
    await logAdminAction({
      req,
      admin: { id: session.adminId, email: 'admin@gametradex.com' },
      sessionId: session.sessionId,
      actionType: 'LOGOUT',
      targetType: 'SESSION',
      details: {
        logoutTime: session.logoutAt.toISOString(),
        sessionDuration: session.duration,
        ip: session.ip,
        userAgent: session.userAgent
      }
    });
    
    res.json({
      success: true,
      message: 'Admin session ended successfully'
    });
    
  } catch (error) {
    console.error('Error ending admin session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end admin session',
      error: error.message
    });
  }
});

app.put('/api/admin/sessions/:sessionId/activity', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    // Find and update session activity
    const session = await AdminSession.findOne({ sessionId });
    
    if (!session || !session.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or inactive'
      });
    }
    
    session.lastActivity = new Date();
    await session.save();
    
    res.json({
      success: true,
      message: 'Session activity updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating session activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session activity',
      error: error.message
    });
  }
});

// Get admin actions
app.get('/api/admin/actions', async (req, res) => {
  try {
    const { limit = 50, offset = 0, adminId, actionType } = req.query;
    
    const query = {};
    if (adminId) query.adminId = adminId;
    if (actionType) query.actionType = actionType;
    
    const actions = await AdminAction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await AdminAction.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        actions,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
    
  } catch (error) {
    console.error('Error getting admin actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin actions',
      error: error.message
    });
  }
});

// Get admin sessions
app.get('/api/admin/sessions', async (req, res) => {
  try {
    const { limit = 50, offset = 0, adminId, active } = req.query;
    
    const query = {};
    if (adminId) query.adminId = adminId;
    if (active !== undefined) query.isActive = active === 'true';
    
    const sessions = await AdminSession.find(query)
      .sort({ loginAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await AdminSession.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        sessions,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
    
  } catch (error) {
    console.error('Error getting admin sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin sessions',
      error: error.message
    });
  }
});

// Use admin routes
app.use('/api/admin', adminRoutes);

// Use notification routes
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Admin logs: http://localhost:${PORT}/api/admin/logs`);
      console.log(`Admin sessions: http://localhost:${PORT}/api/admin/sessions`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mongoose.connection.close();
  process.exit(0);
});

startServer();

module.exports = app;
