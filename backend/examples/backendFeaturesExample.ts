/**
 * Backend Features Usage Examples
 * Demonstrates how to use the extended User schema, AdminAction schema, and helper functions
 */

import { User } from '../models/User';
import { AdminAction } from '../models/AdminAction';
import { logAdminAction } from '../utils/logAdminAction';
import { createNotification, createAdminActionNotification, createUserActionNotification } from '../utils/notifications';
import { sendEmail, sendWelcomeEmail, sendVerificationEmail } from '../utils/email';
import { verifyOwnership, verifyAdminAccess } from '../middleware/verifyOwnership';

// Example 1: Creating a new user with extended schema
export const createUserExample = async () => {
  try {
    const newUser = new User({
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'hashedPassword123',
      role: 'seller',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        country: 'USA',
        timezone: 'America/New_York'
      },
      stats: {
        listedCount: 0,
        boughtCount: 0,
        totalSpent: 0,
        totalEarned: 0,
        rating: 0,
        reviewCount: 0
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          showEmail: false,
          showPhone: false,
          showStats: true
        }
      },
      security: {
        loginAttempts: 0,
        twoFactorEnabled: false
      }
    });

    const savedUser = await newUser.save();
    console.log('✅ User created:', savedUser.username);

    // Send welcome email
    await sendWelcomeEmail(savedUser);
    console.log('📧 Welcome email sent');

    return savedUser;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
};

// Example 2: Updating user stats
export const updateUserStatsExample = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Update stats when user lists an item
    await user.updateStats('list');
    console.log('📊 User stats updated for listing');

    // Update stats when user buys an item
    await user.updateStats('buy', 150.00);
    console.log('📊 User stats updated for purchase');

    // Update rating
    await user.updateRating(4.5);
    console.log('⭐ User rating updated');

    return user;
  } catch (error) {
    console.error('❌ Error updating user stats:', error);
    throw error;
  }
};

// Example 3: Logging admin action with actorType
export const logAdminActionExample = async (req: any) => {
  try {
    await logAdminAction({
      req,
      admin: {
        id: 'admin-123',
        email: 'admin@gametradex.com'
      },
      sessionId: 'session-abc123',
      actionType: 'LISTING_APPROVE',
      targetType: 'LISTING',
      targetId: 'listing-456',
      details: {
        listingTitle: 'Premium Gaming Account',
        oldStatus: 'pending',
        newStatus: 'approved',
        approvalTime: new Date().toISOString()
      },
      actorType: 'admin' // or 'user' for user actions
    });

    console.log('📝 Admin action logged with actorType');
  } catch (error) {
    console.error('❌ Error logging admin action:', error);
    throw error;
  }
};

// Example 4: Creating notifications
export const createNotificationExample = async () => {
  try {
    // Create admin action notification
    await createAdminActionNotification(
      'LISTING_APPROVE',
      'admin@gametradex.com',
      'LISTING',
      'listing-456',
      { listingTitle: 'Premium Gaming Account' }
    );

    // Create user action notification
    await createUserActionNotification(
      'LISTING_CREATE',
      'user-123',
      'LISTING',
      'listing-789',
      { listingTitle: 'Rare Gaming Account' }
    );

    // Create general notification
    await createNotification({
      type: 'SUCCESS',
      title: 'Listing Approved',
      message: 'Your listing has been approved and is now live!',
      targetUrl: '/listings/456',
      relatedActionId: 'listing-456',
      priority: 'MEDIUM',
      recipients: ['user-123'],
      metadata: {
        listingId: 'listing-456',
        approvedBy: 'admin@gametradex.com'
      }
    });

    console.log('📢 Notifications created');
  } catch (error) {
    console.error('❌ Error creating notifications:', error);
    throw error;
  }
};

// Example 5: Sending emails
export const sendEmailExample = async (user: any) => {
  try {
    // Send verification email
    await sendVerificationEmail(user, 'verification-token-123');
    console.log('📧 Verification email sent');

    // Send listing notification email
    await sendEmail({
      to: user.email,
      subject: 'Your listing has been approved!',
      html: `
        <h1>Great news!</h1>
        <p>Your listing has been approved and is now live on GameTradeX.</p>
        <a href="/listings/456">View Listing</a>
      `
    });
    console.log('📧 Listing notification email sent');

  } catch (error) {
    console.error('❌ Error sending emails:', error);
    throw error;
  }
};

// Example 6: Using ownership verification middleware
export const ownershipVerificationExample = () => {
  // In your route handlers:
  
  // Verify listing ownership
  app.get('/api/listings/:id', 
    authenticateUser, // Your auth middleware
    verifyOwnership('listing'), // Verify user owns the listing
    (req, res) => {
      // User can only access their own listings
      res.json({ listing: req.listing });
    }
  );

  // Verify escrow ownership
  app.get('/api/escrows/:id',
    authenticateUser,
    verifyOwnership('escrow'), // Verify user is buyer or seller
    (req, res) => {
      // User can only access escrows they're involved in
      res.json({ escrow: req.escrow });
    }
  );

  // Admin access
  app.get('/api/admin/users',
    authenticateUser,
    verifyAdminAccess, // Only admins can access
    (req, res) => {
      // Only admins can access this route
      res.json({ users: [] });
    }
  );
};

// Example 7: Querying users with new schema
export const queryUsersExample = async () => {
  try {
    // Find top sellers
    const topSellers = await User.findTopSellers(10);
    console.log('🏆 Top sellers:', topSellers.length);

    // Find top buyers
    const topBuyers = await User.findTopBuyers(10);
    console.log('💰 Top buyers:', topBuyers.length);

    // Find users by role
    const sellers = await User.findByRole('seller');
    console.log('👥 Sellers:', sellers.length);

    // Find users with high ratings
    const highRatedUsers = await User.find({
      'stats.rating': { $gte: 4.0 },
      'stats.reviewCount': { $gte: 5 }
    });
    console.log('⭐ High-rated users:', highRatedUsers.length);

    return { topSellers, topBuyers, sellers, highRatedUsers };
  } catch (error) {
    console.error('❌ Error querying users:', error);
    throw error;
  }
};

// Example 8: Admin action queries with actorType
export const queryAdminActionsExample = async () => {
  try {
    // Find all admin actions
    const adminActions = await AdminAction.find({ actorType: 'admin' });
    console.log('👑 Admin actions:', adminActions.length);

    // Find user actions
    const userActions = await AdminAction.find({ actorType: 'user' });
    console.log('👤 User actions:', userActions.length);

    // Find actions by type
    const loginActions = await AdminAction.find({ actionType: 'LOGIN' });
    console.log('🔐 Login actions:', loginActions.length);

    // Find recent actions
    const recentActions = await AdminAction.find()
      .sort({ createdAt: -1 })
      .limit(50);
    console.log('📅 Recent actions:', recentActions.length);

    return { adminActions, userActions, loginActions, recentActions };
  } catch (error) {
    console.error('❌ Error querying admin actions:', error);
    throw error;
  }
};

// Example 9: Complete workflow
export const completeWorkflowExample = async () => {
  try {
    console.log('🚀 Starting complete workflow example...');

    // 1. Create user
    const user = await createUserExample();
    console.log('✅ Step 1: User created');

    // 2. Update user stats
    await updateUserStatsExample(user._id);
    console.log('✅ Step 2: User stats updated');

    // 3. Create notifications
    await createNotificationExample();
    console.log('✅ Step 3: Notifications created');

    // 4. Send emails
    await sendEmailExample(user);
    console.log('✅ Step 4: Emails sent');

    // 5. Query data
    const userData = await queryUsersExample();
    const actionData = await queryAdminActionsExample();
    console.log('✅ Step 5: Data queried');

    console.log('🎉 Complete workflow finished successfully!');
    return { user, userData, actionData };
  } catch (error) {
    console.error('❌ Complete workflow failed:', error);
    throw error;
  }
};

export default {
  createUserExample,
  updateUserStatsExample,
  logAdminActionExample,
  createNotificationExample,
  sendEmailExample,
  ownershipVerificationExample,
  queryUsersExample,
  queryAdminActionsExample,
  completeWorkflowExample
};
