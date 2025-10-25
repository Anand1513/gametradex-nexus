/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  // Generate test data
  createTestUser: (overrides = {}) => ({
    id: `test-user-${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    role: 'user',
    stats: { listedCount: 0, boughtCount: 0, totalSpent: 0, totalEarned: 0 },
    ...overrides
  }),

  createTestListing: (overrides = {}) => ({
    id: `test-listing-${Date.now()}`,
    title: 'Test Account',
    description: 'Test description',
    game: 'Fortnite',
    platform: 'PC',
    price: { min: 100, max: 150, currency: 'USD' },
    sellerId: `test-user-${Date.now()}`,
    status: 'pending',
    isVerified: false,
    createdAt: new Date().toISOString(),
    stats: { views: 0, favorites: 0, inquiries: 0 },
    ...overrides
  }),

  createTestPurchase: (overrides = {}) => ({
    id: `test-purchase-${Date.now()}`,
    listingId: `test-listing-${Date.now()}`,
    buyerId: `test-buyer-${Date.now()}`,
    sellerId: `test-seller-${Date.now()}`,
    amount: 100,
    currency: 'USD',
    status: 'paid',
    paymentDetails: {
      method: 'credit_card',
      transactionId: `txn-${Date.now()}`
    },
    deliveryDetails: {
      method: 'email',
      instructions: 'Send account details via email'
    },
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  createTestNotification: (overrides = {}) => ({
    id: `test-notification-${Date.now()}`,
    type: 'TEST',
    title: 'Test Notification',
    message: 'This is a test notification',
    isRead: false,
    priority: 'MEDIUM',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  // Wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate auth headers
  getAuthHeader: (userId) => `Bearer ${userId}`,

  // Mock timestamps
  getMockTimestamp: () => new Date().toISOString()
};

// Global test hooks
beforeAll(() => {
  console.log('🚀 Starting GameTradeX API Tests');
});

afterAll(() => {
  console.log('✅ GameTradeX API Tests Completed');
});

beforeEach(() => {
  // Reset any global state if needed
});

afterEach(() => {
  // Cleanup after each test
});
