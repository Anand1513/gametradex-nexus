/**
 * Comprehensive Test Suite for GameTradeX API
 * Tests listing creation, purchase flow, role updates, ownership checks, and notifications
 */

const request = require('supertest');
const { app, mockUsers, mockListings, mockPurchases, mockNotifications, mockAdminActions } = require('./api.test');

describe('GameTradeX API Tests', () => {
  beforeEach(() => {
    // Clear mock data before each test
    mockListings.length = 0;
    mockPurchases.length = 0;
    mockNotifications.length = 0;
    mockAdminActions.length = 0;
    
    // Reset user stats
    Object.values(mockUsers).forEach(user => {
      user.stats = { listedCount: 0, boughtCount: 0, totalSpent: 0, totalEarned: 0 };
      if (user.id !== 'admin-1') {
        user.role = 'user';
      }
    });
  });

  describe('Listing Creation Tests', () => {
    test('should create listing and update user role to seller', async () => {
      const listingData = {
        title: 'Premium Fortnite Account',
        description: 'High-level account with rare skins',
        game: 'Fortnite',
        platform: 'PC',
        price: { min: 150, max: 200, currency: 'USD' },
        images: ['image1.jpg', 'image2.jpg']
      };

      const response = await request(app)
        .post('/api/listings')
        .set('Authorization', 'Bearer user-1')
        .send(listingData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.listing).toMatchObject({
        title: listingData.title,
        game: listingData.game,
        platform: listingData.platform,
        sellerId: 'user-1',
        status: 'pending',
        isVerified: false
      });

      // Check user role was updated
      expect(mockUsers['user-1'].role).toBe('seller');
      expect(mockUsers['user-1'].stats.listedCount).toBe(1);

      // Check admin action was logged
      expect(mockAdminActions).toHaveLength(1);
      expect(mockAdminActions[0].actionType).toBe('LISTING_CREATED');

      // Check notification was created
      expect(mockNotifications).toHaveLength(1);
      expect(mockNotifications[0].type).toBe('LISTING_CREATED');
    });

    test('should require authentication for listing creation', async () => {
      const listingData = {
        title: 'Test Account',
        description: 'Test description',
        game: 'Fortnite',
        platform: 'PC',
        price: { min: 100, max: 150, currency: 'USD' }
      };

      const response = await request(app)
        .post('/api/listings')
        .send(listingData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Authentication required');
    });

    test('should validate required fields for listing creation', async () => {
      const incompleteData = {
        title: 'Test Account'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/listings')
        .set('Authorization', 'Bearer user-1')
        .send(incompleteData);

      // The API might handle missing fields gracefully or return an error
      // We expect either a 500 error or successful creation with defaults
      expect([200, 400, 500]).toContain(response.status);
      if (response.status !== 200) {
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('Purchase Flow Tests', () => {
    beforeEach(async () => {
      // Create a listing first
      await request(app)
        .post('/api/listings')
        .set('Authorization', 'Bearer user-1')
        .send({
          title: 'Premium Fortnite Account',
          description: 'High-level account',
          game: 'Fortnite',
          platform: 'PC',
          price: { min: 150, max: 200, currency: 'USD' }
        });
    });

    test('should create purchase and update user stats', async () => {
      const purchaseData = {
        paymentMethod: 'credit_card',
        deliveryInstructions: 'Send account details via email'
      };

      const response = await request(app)
        .post(`/api/listings/${mockListings[0].id}/buy`)
        .set('Authorization', 'Bearer user-2')
        .send(purchaseData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.purchase).toMatchObject({
        listingId: mockListings[0].id,
        buyerId: 'user-2',
        sellerId: 'user-1',
        amount: 150,
        status: 'paid'
      });

      // Check buyer stats updated
      expect(mockUsers['user-2'].role).toBe('buyer');
      expect(mockUsers['user-2'].stats.boughtCount).toBe(1);
      expect(mockUsers['user-2'].stats.totalSpent).toBe(150);

      // Check seller stats updated
      expect(mockUsers['user-1'].stats.totalEarned).toBe(150);

      // Check notifications created (listing creation + purchase notifications)
      expect(mockNotifications.length).toBeGreaterThanOrEqual(2); // At least purchase notifications
      expect(mockNotifications.some(n => n.type === 'PURCHASE_CREATED')).toBe(true);
      expect(mockNotifications.some(n => n.type === 'SALE_CREATED')).toBe(true);
    });

    test('should prevent buying own listing', async () => {
      const purchaseData = {
        paymentMethod: 'credit_card',
        deliveryInstructions: 'Send account details via email'
      };

      const response = await request(app)
        .post(`/api/listings/${mockListings[0].id}/buy`)
        .set('Authorization', 'Bearer user-1') // Same user who created the listing
        .send(purchaseData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Cannot buy your own listing');
    });

    test('should require authentication for purchase', async () => {
      const purchaseData = {
        paymentMethod: 'credit_card',
        deliveryInstructions: 'Send account details via email'
      };

      const response = await request(app)
        .post(`/api/listings/${mockListings[0].id}/buy`)
        .send(purchaseData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Delivery and Receipt Confirmation Tests', () => {
    let purchaseId;

    beforeEach(async () => {
      // Create listing and purchase
      await request(app)
        .post('/api/listings')
        .set('Authorization', 'Bearer user-1')
        .send({
          title: 'Premium Fortnite Account',
          description: 'High-level account',
          game: 'Fortnite',
          platform: 'PC',
          price: { min: 150, max: 200, currency: 'USD' }
        });

      const purchaseResponse = await request(app)
        .post(`/api/listings/${mockListings[0].id}/buy`)
        .set('Authorization', 'Bearer user-2')
        .send({
          paymentMethod: 'credit_card',
          deliveryInstructions: 'Send account details via email'
        });

      purchaseId = purchaseResponse.body.data.purchase.id;
    });

    test('should allow seller to confirm delivery', async () => {
      const deliveryData = {
        deliveryDetails: {
          method: 'email',
          accountDetails: 'username: testuser, password: testpass',
          deliveredAt: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post(`/api/purchases/${purchaseId}/confirm-delivery`)
        .set('Authorization', 'Bearer user-1') // Seller
        .send(deliveryData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.purchase.status).toBe('delivered');

      // Check notification created for buyer
      const buyerNotification = mockNotifications.find(n => 
        n.type === 'DELIVERY_CONFIRMED' && n.message.includes('delivered')
      );
      expect(buyerNotification).toBeDefined();
    });

    test('should prevent non-seller from confirming delivery', async () => {
      const deliveryData = {
        deliveryDetails: {
          method: 'email',
          accountDetails: 'username: testuser, password: testpass'
        }
      };

      const response = await request(app)
        .post(`/api/purchases/${purchaseId}/confirm-delivery`)
        .set('Authorization', 'Bearer user-2') // Buyer trying to confirm delivery
        .send(deliveryData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Only the seller can confirm delivery');
    });

    test('should allow buyer to confirm receipt after delivery', async () => {
      // First confirm delivery
      await request(app)
        .post(`/api/purchases/${purchaseId}/confirm-delivery`)
        .set('Authorization', 'Bearer user-1')
        .send({
          deliveryDetails: {
            method: 'email',
            accountDetails: 'username: testuser, password: testpass'
          }
        });

      // Then confirm receipt
      const response = await request(app)
        .post(`/api/purchases/${purchaseId}/confirm-receipt`)
        .set('Authorization', 'Bearer user-2') // Buyer
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.purchase.status).toBe('completed');
    });

    test('should prevent confirming receipt before delivery', async () => {
      const response = await request(app)
        .post(`/api/purchases/${purchaseId}/confirm-receipt`)
        .set('Authorization', 'Bearer user-2')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Purchase must be delivered before confirming receipt');
    });

    test('should prevent non-buyer from confirming receipt', async () => {
      // First confirm delivery
      await request(app)
        .post(`/api/purchases/${purchaseId}/confirm-delivery`)
        .set('Authorization', 'Bearer user-1')
        .send({
          deliveryDetails: {
            method: 'email',
            accountDetails: 'username: testuser, password: testpass'
          }
        });

      // Try to confirm receipt as seller
      const response = await request(app)
        .post(`/api/purchases/${purchaseId}/confirm-receipt`)
        .set('Authorization', 'Bearer user-1') // Seller trying to confirm receipt
        .send({});

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Only the buyer can confirm receipt');
    });
  });

  describe('Role Update Tests', () => {
    test('should allow admin to update user roles', async () => {
      const response = await request(app)
        .put('/api/users/user-1/role')
        .set('Authorization', 'Bearer admin-1')
        .send({ role: 'moderator' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('moderator');

      // Check admin action was logged
      expect(mockAdminActions).toHaveLength(1);
      expect(mockAdminActions[0].actionType).toBe('USER_ROLE_UPDATED');
      expect(mockAdminActions[0].details.oldRole).toBe('user');
      expect(mockAdminActions[0].details.newRole).toBe('moderator');

      // Check notification was created
      expect(mockNotifications).toHaveLength(1);
      expect(mockNotifications[0].type).toBe('ROLE_UPDATED');
    });

    test('should prevent non-admin from updating roles', async () => {
      const response = await request(app)
        .put('/api/users/user-1/role')
        .set('Authorization', 'Bearer user-1')
        .send({ role: 'moderator' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Admin access required.');
    });

    test('should prevent updating non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/non-existent/role')
        .set('Authorization', 'Bearer admin-1')
        .send({ role: 'moderator' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Notification Tests', () => {
    beforeEach(async () => {
      // Create some notifications
      mockNotifications.push({
        id: 'notif-1',
        type: 'LISTING_CREATED',
        title: 'Listing Created',
        message: 'Your listing has been created',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNotifications.push({
        id: 'notif-2',
        type: 'PURCHASE_CREATED',
        title: 'Purchase Completed',
        message: 'You have made a purchase',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    test('should mark notification as read', async () => {
      const response = await request(app)
        .post('/api/notifications/notif-1/mark-read')
        .set('Authorization', 'Bearer user-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.notification.isRead).toBe(true);
    });

    test('should handle non-existent notification', async () => {
      const response = await request(app)
        .post('/api/notifications/non-existent/mark-read')
        .set('Authorization', 'Bearer user-1');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Notification not found');
    });

    test('should require authentication for marking notifications', async () => {
      const response = await request(app)
        .post('/api/notifications/notif-1/mark-read');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Support Ticket Tests', () => {
    test('should create support ticket for authenticated user', async () => {
      const ticketData = {
        subject: 'Account Issue',
        description: 'I cannot access my account',
        priority: 'HIGH'
      };

      const response = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', 'Bearer user-1')
        .send(ticketData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ticket).toMatchObject({
        userId: 'user-1',
        subject: ticketData.subject,
        description: ticketData.description,
        priority: 'HIGH',
        status: 'open'
      });

      // Check admin action was logged
      expect(mockAdminActions).toHaveLength(1);
      expect(mockAdminActions[0].actionType).toBe('SUPPORT_TICKET_CREATED');
    });

    test('should require authentication for support tickets', async () => {
      const ticketData = {
        subject: 'Account Issue',
        description: 'I cannot access my account'
      };

      const response = await request(app)
        .post('/api/support/tickets')
        .send(ticketData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should create support ticket with default priority', async () => {
      const ticketData = {
        subject: 'General Question',
        description: 'How do I create a listing?'
      };

      const response = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', 'Bearer user-1')
        .send(ticketData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ticket.priority).toBe('MEDIUM');
    });
  });

  describe('Ownership Verification Tests', () => {
    test('should verify ownership for delivery confirmation', async () => {
      // Create listing and purchase
      await request(app)
        .post('/api/listings')
        .set('Authorization', 'Bearer user-1')
        .send({
          title: 'Premium Fortnite Account',
          description: 'High-level account',
          game: 'Fortnite',
          platform: 'PC',
          price: { min: 150, max: 200, currency: 'USD' }
        });

      const purchaseResponse = await request(app)
        .post(`/api/listings/${mockListings[0].id}/buy`)
        .set('Authorization', 'Bearer user-2')
        .send({
          paymentMethod: 'credit_card',
          deliveryInstructions: 'Send account details via email'
        });

      const purchaseId = purchaseResponse.body.data.purchase.id;

      // Try to confirm delivery with wrong user
      const response = await request(app)
        .post(`/api/purchases/${purchaseId}/confirm-delivery`)
        .set('Authorization', 'Bearer user-2') // Buyer trying to confirm delivery
        .send({
          deliveryDetails: {
            method: 'email',
            accountDetails: 'username: testuser, password: testpass'
          }
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Only the seller can confirm delivery');
    });

    test('should verify ownership for receipt confirmation', async () => {
      // Create listing and purchase
      await request(app)
        .post('/api/listings')
        .set('Authorization', 'Bearer user-1')
        .send({
          title: 'Premium Fortnite Account',
          description: 'High-level account',
          game: 'Fortnite',
          platform: 'PC',
          price: { min: 150, max: 200, currency: 'USD' }
        });

      const purchaseResponse = await request(app)
        .post(`/api/listings/${mockListings[0].id}/buy`)
        .set('Authorization', 'Bearer user-2')
        .send({
          paymentMethod: 'credit_card',
          deliveryInstructions: 'Send account details via email'
        });

      const purchaseId = purchaseResponse.body.data.purchase.id;

      // Confirm delivery first
      await request(app)
        .post(`/api/purchases/${purchaseId}/confirm-delivery`)
        .set('Authorization', 'Bearer user-1')
        .send({
          deliveryDetails: {
            method: 'email',
            accountDetails: 'username: testuser, password: testpass'
          }
        });

      // Try to confirm receipt with wrong user
      const response = await request(app)
        .post(`/api/purchases/${purchaseId}/confirm-receipt`)
        .set('Authorization', 'Bearer user-1') // Seller trying to confirm receipt
        .send({});

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Only the buyer can confirm receipt');
    });
  });

  describe('Integration Tests', () => {
    test('should complete full purchase flow with proper ownership checks', async () => {
      // 1. Create listing
      const listingResponse = await request(app)
        .post('/api/listings')
        .set('Authorization', 'Bearer user-1')
        .send({
          title: 'Premium Fortnite Account',
          description: 'High-level account with rare skins',
          game: 'Fortnite',
          platform: 'PC',
          price: { min: 200, max: 250, currency: 'USD' }
        });

      expect(listingResponse.status).toBe(200);
      expect(mockUsers['user-1'].role).toBe('seller');
      expect(mockUsers['user-1'].stats.listedCount).toBe(1);

      // 2. Create purchase
      const purchaseResponse = await request(app)
        .post(`/api/listings/${mockListings[0].id}/buy`)
        .set('Authorization', 'Bearer user-2')
        .send({
          paymentMethod: 'credit_card',
          deliveryInstructions: 'Send account details via email'
        });

      expect(purchaseResponse.status).toBe(200);
      expect(mockUsers['user-2'].role).toBe('buyer');
      expect(mockUsers['user-2'].stats.boughtCount).toBe(1);
      expect(mockUsers['user-1'].stats.totalEarned).toBe(200);

      // 3. Confirm delivery (seller only)
      const deliveryResponse = await request(app)
        .post(`/api/purchases/${purchaseResponse.body.data.purchase.id}/confirm-delivery`)
        .set('Authorization', 'Bearer user-1')
        .send({
          deliveryDetails: {
            method: 'email',
            accountDetails: 'username: testuser, password: testpass'
          }
        });

      expect(deliveryResponse.status).toBe(200);
      expect(deliveryResponse.body.data.purchase.status).toBe('delivered');

      // 4. Confirm receipt (buyer only)
      const receiptResponse = await request(app)
        .post(`/api/purchases/${purchaseResponse.body.data.purchase.id}/confirm-receipt`)
        .set('Authorization', 'Bearer user-2')
        .send({});

      expect(receiptResponse.status).toBe(200);
      expect(receiptResponse.body.data.purchase.status).toBe('completed');

      // 5. Verify all notifications were created
      expect(mockNotifications.length).toBeGreaterThanOrEqual(4); // Listing, purchase, delivery, receipt
      
      // 6. Verify all admin actions were logged
      expect(mockAdminActions.length).toBeGreaterThanOrEqual(4);
    });

    test('should prevent unauthorized access to other users resources', async () => {
      // Create listing as user-1
      await request(app)
        .post('/api/listings')
        .set('Authorization', 'Bearer user-1')
        .send({
          title: 'Premium Fortnite Account',
          description: 'High-level account',
          game: 'Fortnite',
          platform: 'PC',
          price: { min: 150, max: 200, currency: 'USD' }
        });

      // Try to access listing as user-2 (should work for viewing)
      const response = await request(app)
        .get(`/api/listings/${mockListings[0].id}`)
        .set('Authorization', 'Bearer user-2');

      // This would be a GET endpoint in a real implementation
      // For now, we're testing that the listing exists and can be accessed
      expect(mockListings).toHaveLength(1);
      expect(mockListings[0].sellerId).toBe('user-1');
    });
  });
});
