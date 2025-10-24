/**
 * Simple Admin Actions API Routes
 * Quick implementation for testing
 */

const express = require('express');
const router = express.Router();

// Mock data
let mockActions = [
  {
    id: 'action-1',
    adminId: 'admin-123',
    adminEmail: 'admin@gametradex.com',
    sessionId: 'session-abc123',
    actionType: 'LOGIN',
    targetType: 'SESSION',
    targetId: 'session-abc123',
    details: { loginMethod: 'key' },
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0...',
    createdAt: new Date().toISOString(),
    hmacSignature: 'abc123',
    signedAt: new Date().toISOString()
  },
  {
    id: 'action-2',
    adminId: 'admin-123',
    adminEmail: 'admin@gametradex.com',
    sessionId: 'session-abc123',
    actionType: 'PRICE_UPDATE',
    targetType: 'LISTING',
    targetId: 'listing-456',
    details: { oldPrice: 100, newPrice: 150 },
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0...',
    createdAt: new Date().toISOString(),
    hmacSignature: 'def456',
    signedAt: new Date().toISOString()
  }
];

// GET /api/admin/actions
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      actions: mockActions,
      total: mockActions.length,
      limit: 50,
      offset: 0
    }
  });
});

// GET /api/admin/actions/verify
router.get('/verify', (req, res) => {
  res.json({
    success: true,
    data: {
      total: mockActions.length,
      valid: mockActions.length,
      invalid: 0,
      errors: []
    }
  });
});

// GET /api/admin/actions/export
router.get('/export', (req, res) => {
  const csvContent = [
    'ID,Time,Admin Email,Action Type,IP,Session ID',
    ...mockActions.map(action => 
      `${action.id},${action.createdAt},${action.adminEmail},${action.actionType},${action.ip},${action.sessionId}`
    )
  ].join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="admin-actions.csv"');
  res.send(csvContent);
});

// GET /api/admin/actions/types
router.get('/types', (req, res) => {
  const types = [...new Set(mockActions.map(action => action.actionType))];
  res.json({
    success: true,
    data: types
  });
});

module.exports = router;
