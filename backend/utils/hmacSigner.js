/**
 * HMAC Signer for Admin Actions
 * Provides tamper detection for admin action logs
 */

const crypto = require('crypto');

// In production, this should be from environment variables
const HMAC_SECRET = process.env.ADMIN_ACTIONS_HMAC_SECRET || 'your-super-secret-hmac-key-change-in-production';

/**
 * Generate HMAC signature for admin action data
 * @param {Object} actionData - The admin action data to sign
 * @returns {string} - HMAC signature
 */
const generateHMAC = (actionData) => {
  try {
    // Create a deterministic string from the action data
    const dataString = JSON.stringify(actionData, Object.keys(actionData).sort());
    const hmac = crypto.createHmac('sha256', HMAC_SECRET);
    hmac.update(dataString);
    return hmac.digest('hex');
  } catch (error) {
    console.error('Error generating HMAC:', error);
    return null;
  }
};

/**
 * Verify HMAC signature for admin action data
 * @param {Object} actionData - The admin action data
 * @param {string} signature - The HMAC signature to verify
 * @returns {boolean} - Whether the signature is valid
 */
const verifyHMAC = (actionData, signature) => {
  try {
    const expectedSignature = generateHMAC(actionData);
    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying HMAC:', error);
    return false;
  }
};

/**
 * Create a signed admin action entry
 * @param {Object} actionData - The admin action data
 * @returns {Object} - Action data with HMAC signature
 */
const createSignedAction = (actionData) => {
  const signature = generateHMAC(actionData);
  return {
    ...actionData,
    hmacSignature: signature,
    signedAt: new Date().toISOString()
  };
};

/**
 * Verify a signed admin action entry
 * @param {Object} signedAction - The signed admin action
 * @returns {Object} - Verification result
 */
const verifySignedAction = (signedAction) => {
  const { hmacSignature, signedAt, ...actionData } = signedAction;
  
  const isValid = verifyHMAC(actionData, hmacSignature);
  
  return {
    isValid,
    actionData,
    signature: hmacSignature,
    signedAt,
    verificationTime: new Date().toISOString()
  };
};

module.exports = {
  generateHMAC,
  verifyHMAC,
  createSignedAction,
  verifySignedAction,
  HMAC_SECRET
};
