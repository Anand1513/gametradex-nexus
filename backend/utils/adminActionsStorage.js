/**
 * Admin Actions Storage System
 * Append-only storage with HMAC signing for tamper detection
 */

const fs = require('fs').promises;
const path = require('path');
const { createSignedAction, verifySignedAction } = require('./hmacSigner');

// Storage file path
const STORAGE_FILE = path.join(__dirname, '../data/admin_actions.json');

/**
 * Ensure storage directory exists
 */
const ensureStorageDir = async () => {
  const storageDir = path.dirname(STORAGE_FILE);
  try {
    await fs.mkdir(storageDir, { recursive: true });
  } catch (error) {
    console.error('Error creating storage directory:', error);
  }
};

/**
 * Load admin actions from storage
 * @returns {Array} - Array of admin actions
 */
const loadActions = async () => {
  try {
    await ensureStorageDir();
    const data = await fs.readFile(STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    console.error('Error loading admin actions:', error);
    return [];
  }
};

/**
 * Save admin actions to storage (append-only)
 * @param {Array} actions - Array of admin actions
 */
const saveActions = async (actions) => {
  try {
    await ensureStorageDir();
    await fs.writeFile(STORAGE_FILE, JSON.stringify(actions, null, 2));
  } catch (error) {
    console.error('Error saving admin actions:', error);
    throw error;
  }
};

/**
 * Append a new admin action (append-only)
 * @param {Object} actionData - The admin action data
 * @returns {Object} - The signed and stored action
 */
const appendAction = async (actionData) => {
  try {
    // Load existing actions
    const existingActions = await loadActions();
    
    // Create signed action
    const signedAction = createSignedAction({
      ...actionData,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      // Ensure these fields are always present
      sessionId: actionData.sessionId || 'unknown',
      ip: actionData.ip || 'unknown',
      userAgent: actionData.userAgent || 'unknown'
    });
    
    // Append to existing actions (append-only)
    const updatedActions = [...existingActions, signedAction];
    
    // Save updated actions
    await saveActions(updatedActions);
    
    console.log('📝 Admin action appended:', {
      id: signedAction.id,
      actionType: signedAction.actionType,
      adminEmail: signedAction.adminEmail,
      timestamp: signedAction.createdAt
    });
    
    return signedAction;
  } catch (error) {
    console.error('Error appending admin action:', error);
    throw error;
  }
};

/**
 * Get admin actions with filtering
 * @param {Object} filters - Filter options
 * @returns {Array} - Filtered admin actions
 */
const getActions = async (filters = {}) => {
  try {
    const actions = await loadActions();
    
    let filteredActions = [...actions];
    
    // Apply filters
    if (filters.adminEmail) {
      filteredActions = filteredActions.filter(action => 
        action.adminEmail.toLowerCase().includes(filters.adminEmail.toLowerCase())
      );
    }
    
    if (filters.actionType) {
      filteredActions = filteredActions.filter(action => 
        action.actionType === filters.actionType
      );
    }
    
    if (filters.sessionId) {
      filteredActions = filteredActions.filter(action => 
        action.sessionId === filters.sessionId
      );
    }
    
    if (filters.from) {
      const fromDate = new Date(filters.from);
      filteredActions = filteredActions.filter(action => 
        new Date(action.createdAt) >= fromDate
      );
    }
    
    if (filters.to) {
      const toDate = new Date(filters.to);
      filteredActions = filteredActions.filter(action => 
        new Date(action.createdAt) <= toDate
      );
    }
    
    // Sort by creation date (newest first)
    filteredActions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return filteredActions;
  } catch (error) {
    console.error('Error getting admin actions:', error);
    return [];
  }
};

/**
 * Verify all stored actions for tampering
 * @returns {Object} - Verification results
 */
const verifyAllActions = async () => {
  try {
    const actions = await loadActions();
    const verificationResults = {
      total: actions.length,
      valid: 0,
      invalid: 0,
      errors: []
    };
    
    for (const action of actions) {
      const verification = verifySignedAction(action);
      if (verification.isValid) {
        verificationResults.valid++;
      } else {
        verificationResults.invalid++;
        verificationResults.errors.push({
          id: action.id,
          actionType: action.actionType,
          createdAt: action.createdAt,
          reason: 'Invalid HMAC signature'
        });
      }
    }
    
    return verificationResults;
  } catch (error) {
    console.error('Error verifying admin actions:', error);
    return {
      total: 0,
      valid: 0,
      invalid: 0,
      errors: [{ reason: error.message }]
    };
  }
};

/**
 * Get action types from stored actions
 * @returns {Array} - Unique action types
 */
const getActionTypes = async () => {
  try {
    const actions = await loadActions();
    const types = [...new Set(actions.map(action => action.actionType))];
    return types.sort();
  } catch (error) {
    console.error('Error getting action types:', error);
    return [];
  }
};

/**
 * Export actions as CSV
 * @param {Object} filters - Filter options
 * @returns {string} - CSV content
 */
const exportActionsAsCSV = async (filters = {}) => {
  try {
    const actions = await getActions(filters);
    
    // CSV headers
    const headers = [
      'ID',
      'Timestamp',
      'Admin Email',
      'Session ID',
      'Action Type',
      'Target Type',
      'Target ID',
      'IP Address',
      'User Agent',
      'Details',
      'HMAC Signature',
      'Signed At'
    ];
    
    // CSV rows
    const rows = actions.map(action => [
      action.id,
      action.createdAt,
      action.adminEmail,
      action.sessionId,
      action.actionType,
      action.targetType,
      action.targetId,
      action.ip,
      action.userAgent,
      JSON.stringify(action.details),
      action.hmacSignature,
      action.signedAt
    ]);
    
    // Generate CSV content
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    return csvContent;
  } catch (error) {
    console.error('Error exporting actions as CSV:', error);
    throw error;
  }
};

module.exports = {
  appendAction,
  getActions,
  verifyAllActions,
  getActionTypes,
  exportActionsAsCSV,
  loadActions,
  saveActions
};
