/**
 * Backend Endpoints Usage Examples
 * Demonstrates how to use the new listings and purchases endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const AUTH_TOKEN = 'your-jwt-token-here'; // Replace with actual token

// Helper function to make authenticated requests
const apiRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        'x-session-id': 'session-123'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`API Error: ${error.response?.data?.message || error.message}`);
    throw error;
  }
};

// Example 1: Create a new listing
export const createListingExample = async () => {
  try {
    console.log('📝 Creating new listing...');
    
    const listingData = {
      title: 'Premium Fortnite Account - 200+ Wins',
      description: 'High-level Fortnite account with rare skins and 200+ wins. Perfect for competitive players.',
      game: 'Fortnite',
      platform: 'PC',
      accountLevel: 150,
      rank: 'Champion',
      price: {
        min: 150,
        max: 200,
        isFixed: false,
        currency: 'USD'
      },
      images: [
        'https://example.com/skin1.jpg',
        'https://example.com/skin2.jpg'
      ],
      tags: ['rare-skins', 'high-wins', 'competitive'],
      requirements: {
        minAge: 18,
        region: 'NA',
        language: 'English'
      },
      deliveryMethod: 'email',
      deliveryInstructions: 'Account details will be sent via email within 24 hours'
    };

    const result = await apiRequest('POST', '/api/listings', listingData);
    console.log('✅ Listing created:', result.data.listing.title);
    console.log('👤 User role updated to:', result.data.userRole);
    console.log('📊 User stats:', result.data.stats);
    
    return result.data.listing;
  } catch (error) {
    console.error('❌ Error creating listing:', error);
    throw error;
  }
};

// Example 2: Buy a listing
export const buyListingExample = async (listingId) => {
  try {
    console.log('🛒 Buying listing...');
    
    const purchaseData = {
      paymentMethod: 'stripe',
      paymentId: 'pi_1234567890',
      deliveryInstructions: 'Please send account details to my email'
    };

    const result = await apiRequest('POST', `/api/listings/${listingId}/buy`, purchaseData);
    console.log('✅ Purchase created:', result.data.purchase._id);
    console.log('💰 Amount:', result.data.purchase.amount);
    console.log('📊 Buyer stats updated:', result.data.buyerStats);
    
    return result.data.purchase;
  } catch (error) {
    console.error('❌ Error buying listing:', error);
    throw error;
  }
};

// Example 3: Confirm delivery
export const confirmDeliveryExample = async (purchaseId) => {
  try {
    console.log('📦 Confirming delivery...');
    
    const result = await apiRequest('POST', `/api/purchases/${purchaseId}/confirm-delivery`);
    console.log('✅ Delivery confirmed:', result.data.purchase.status);
    console.log('📧 Notifications sent to buyer and seller');
    
    return result.data.purchase;
  } catch (error) {
    console.error('❌ Error confirming delivery:', error);
    throw error;
  }
};

// Example 4: Confirm receipt
export const confirmReceiptExample = async (purchaseId) => {
  try {
    console.log('✅ Confirming receipt...');
    
    const result = await apiRequest('POST', `/api/purchases/${purchaseId}/confirm-receipt`);
    console.log('✅ Receipt confirmed:', result.data.purchase.status);
    console.log('🎉 Purchase completed successfully!');
    
    return result.data.purchase;
  } catch (error) {
    console.error('❌ Error confirming receipt:', error);
    throw error;
  }
};

// Example 5: Get user's listings
export const getUserListingsExample = async (userId) => {
  try {
    console.log('📋 Getting user listings...');
    
    const result = await apiRequest('GET', `/api/listings?sellerId=${userId}`);
    console.log('✅ Found listings:', result.data.listings.length);
    
    result.data.listings.forEach(listing => {
      console.log(`- ${listing.title} (${listing.status}) - $${listing.price.min}-${listing.price.max}`);
    });
    
    return result.data.listings;
  } catch (error) {
    console.error('❌ Error getting listings:', error);
    throw error;
  }
};

// Example 6: Get user's purchases
export const getUserPurchasesExample = async () => {
  try {
    console.log('🛍️ Getting user purchases...');
    
    const result = await apiRequest('GET', '/api/purchases');
    console.log('✅ Found purchases:', result.data.purchases.length);
    
    result.data.purchases.forEach(purchase => {
      console.log(`- Purchase ${purchase._id} (${purchase.status}) - $${purchase.amount}`);
    });
    
    return result.data.purchases;
  } catch (error) {
    console.error('❌ Error getting purchases:', error);
    throw error;
  }
};

// Example 7: Create dispute
export const createDisputeExample = async (purchaseId) => {
  try {
    console.log('⚠️ Creating dispute...');
    
    const disputeData = {
      reason: 'not_delivered',
      description: 'Seller has not delivered the account details after 48 hours'
    };

    const result = await apiRequest('POST', `/api/purchases/${purchaseId}/dispute`, disputeData);
    console.log('✅ Dispute created:', result.data.purchase.dispute);
    console.log('📧 Admin notifications sent');
    
    return result.data.purchase;
  } catch (error) {
    console.error('❌ Error creating dispute:', error);
    throw error;
  }
};

// Example 8: Complete workflow
export const completeWorkflowExample = async () => {
  try {
    console.log('🚀 Starting complete workflow example...');
    
    // Step 1: Create listing
    const listing = await createListingExample();
    console.log('✅ Step 1: Listing created');
    
    // Step 2: Buy listing (as different user)
    const purchase = await buyListingExample(listing._id);
    console.log('✅ Step 2: Purchase created');
    
    // Step 3: Confirm delivery (as seller)
    const deliveredPurchase = await confirmDeliveryExample(purchase._id);
    console.log('✅ Step 3: Delivery confirmed');
    
    // Step 4: Confirm receipt (as buyer)
    const completedPurchase = await confirmReceiptExample(purchase._id);
    console.log('✅ Step 4: Receipt confirmed');
    
    console.log('🎉 Complete workflow finished successfully!');
    return {
      listing,
      purchase: completedPurchase
    };
  } catch (error) {
    console.error('❌ Complete workflow failed:', error);
    throw error;
  }
};

// Example 9: Error handling scenarios
export const errorHandlingExample = async () => {
  try {
    console.log('🔍 Testing error handling...');
    
    // Try to buy non-existent listing
    try {
      await buyListingExample('non-existent-id');
    } catch (error) {
      console.log('✅ Correctly caught error for non-existent listing');
    }
    
    // Try to confirm delivery for non-existent purchase
    try {
      await confirmDeliveryExample('non-existent-id');
    } catch (error) {
      console.log('✅ Correctly caught error for non-existent purchase');
    }
    
    // Try to access purchase without ownership
    try {
      await apiRequest('GET', '/api/purchases/unauthorized-id');
    } catch (error) {
      console.log('✅ Correctly caught ownership error');
    }
    
    console.log('✅ Error handling tests completed');
  } catch (error) {
    console.error('❌ Error in error handling tests:', error);
  }
};

// Example 10: API endpoint testing
export const testAllEndpoints = async () => {
  try {
    console.log('🧪 Testing all endpoints...');
    
    // Test listings endpoints
    console.log('📝 Testing listings endpoints...');
    await apiRequest('GET', '/api/listings');
    console.log('✅ GET /api/listings - OK');
    
    // Test purchases endpoints
    console.log('🛍️ Testing purchases endpoints...');
    await apiRequest('GET', '/api/purchases');
    console.log('✅ GET /api/purchases - OK');
    
    // Test admin actions endpoints
    console.log('👑 Testing admin actions endpoints...');
    await apiRequest('GET', '/api/admin/actions');
    console.log('✅ GET /api/admin/actions - OK');
    
    // Test notifications endpoints
    console.log('📢 Testing notifications endpoints...');
    await apiRequest('GET', '/api/notifications');
    console.log('✅ GET /api/notifications - OK');
    
    console.log('🎉 All endpoint tests completed successfully!');
  } catch (error) {
    console.error('❌ Endpoint testing failed:', error);
  }
};

// Export all examples
module.exports = {
  createListingExample,
  buyListingExample,
  confirmDeliveryExample,
  confirmReceiptExample,
  getUserListingsExample,
  getUserPurchasesExample,
  createDisputeExample,
  completeWorkflowExample,
  errorHandlingExample,
  testAllEndpoints
};
