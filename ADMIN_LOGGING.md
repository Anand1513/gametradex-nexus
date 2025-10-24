# Admin Action Logging System

A comprehensive MongoDB-based logging system for tracking all admin actions in the GameTradeX platform.

## Overview

The admin logging system records every admin action in a MongoDB collection called `admin_actions` with detailed information including admin details, session information, action context, and request metadata.

## Schema

### AdminAction Collection

```typescript
{
  adminId: string;           // Admin user ID
  adminEmail: string;        // Admin email address
  sessionId: string;         // Admin session ID
  actionType: string;        // Type of action performed
  targetType: string;        // Type of target affected
  targetId?: string;         // ID of the target (optional)
  details: Record<string, any>; // Additional action details
  ip: string;                // Client IP address
  userAgent: string;         // Client user agent
  createdAt: Date;           // Action timestamp
}
```

### Action Types

- `LOGIN` - Admin login
- `LOGOUT` - Admin logout
- `LISTING_APPROVE` - Listing approval
- `LISTING_REJECT` - Listing rejection
- `LISTING_DELETE` - Listing deletion
- `LISTING_EDIT` - Listing edit
- `PRICE_CHANGE` - Price modification
- `USER_EDIT` - User modification
- `USER_ROLE_CHANGE` - User role change
- `ESCROW_UPDATE` - Escrow update
- `ESCROW_RELEASE` - Escrow release
- `ESCROW_REFUND` - Escrow refund
- `PAYMENT_EDIT` - Payment edit
- `PAYMENT_PROCESS` - Payment processing
- `SECURITY_ACTION` - Security-related action
- `SYSTEM_UPDATE` - System update
- `NOTIFICATION_CREATE` - Notification creation
- `NOTIFICATION_READ` - Notification read
- `ADMIN_ACTION` - General admin action

### Target Types

- `SESSION` - Session-related actions
- `LISTING` - Listing-related actions
- `USER` - User-related actions
- `ESCROW` - Escrow-related actions
- `PAYMENT` - Payment-related actions
- `NOTIFICATION` - Notification-related actions
- `SYSTEM` - System-related actions
- `SECURITY` - Security-related actions

## Usage

### Basic Logging

```typescript
import { logAdminAction } from '@/utils/logAdminAction';

// Log a custom admin action
await logAdminAction({
  req,
  admin: { id: 'admin-123', email: 'admin@gametradex.com' },
  sessionId: 'session-456',
  actionType: 'LISTING_APPROVE',
  targetType: 'LISTING',
  targetId: 'listing-789',
  details: {
    listingTitle: 'Premium Gaming Account',
    approvalReason: 'verified_seller'
  }
});
```

### Convenience Functions

```typescript
import { 
  logAdminLogin, 
  logAdminLogout,
  logListingApproval,
  logPriceChange,
  logUserRoleChange
} from '@/utils/logAdminAction';

// Log admin login
await logAdminLogin(req, admin, sessionId, 'credentials');

// Log admin logout
await logAdminLogout(req, admin, sessionId, sessionDuration);

// Log listing approval
await logListingApproval(req, admin, sessionId, listingId, 'approve', listingDetails);

// Log price change
await logPriceChange(req, admin, sessionId, listingId, oldPrice, newPrice, listingDetails);

// Log user role change
await logUserRoleChange(req, admin, sessionId, userId, oldRole, newRole, userDetails);
```

## API Endpoints

### Log Admin Action
```
POST /api/admin/actions/log
Content-Type: application/json

{
  "adminId": "admin-123",
  "adminEmail": "admin@gametradex.com",
  "sessionId": "session-456",
  "actionType": "LISTING_APPROVE",
  "targetType": "LISTING",
  "targetId": "listing-789",
  "details": {
    "listingTitle": "Premium Gaming Account"
  }
}
```

### Get Admin Actions
```
GET /api/admin/actions?adminId=admin-123&limit=50&offset=0
```

### Get Admin Activity Summary
```
GET /api/admin/actions/summary/admin-123?days=30
```

### Get Admin Statistics
```
GET /api/admin/actions/stats/admin-123
```

### Get Security Actions
```
GET /api/admin/actions/security?limit=50
```

### Get Session Activity
```
GET /api/admin/actions/session/session-456
```

## Database Setup

### 1. Install Dependencies

```bash
npm install mongoose
```

### 2. Set Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017/gametradex
```

### 3. Setup Database

```bash
npm run setup-database
```

### 4. Connect to Database

```typescript
import { connectToDatabase } from '@/utils/database';

// Connect to MongoDB
await connectToDatabase();
```

## Middleware

### Admin Authentication Middleware

```typescript
import { adminAuth } from '@/middleware/adminAuth';

// Apply to admin routes
app.use('/api/admin', adminAuth);
```

### Optional Admin Authentication

```typescript
import { optionalAdminAuth } from '@/middleware/adminAuth';

// Apply to routes that may have admin context
app.use('/api/notifications', optionalAdminAuth);
```

## Express Route Example

```typescript
import { Request, Response } from 'express';
import { logListingApproval } from '@/utils/logAdminAction';

export const approveListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    // Get admin info from middleware
    const admin = req.admin;
    const sessionId = req.sessionId;
    
    if (!admin || !sessionId) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }
    
    // Log the action
    await logListingApproval(req, admin, sessionId, id, action);
    
    // Perform the actual approval logic
    // ... business logic here ...
    
    res.json({ success: true, message: `Listing ${action}d successfully` });
    
  } catch (error) {
    console.error('Error approving listing:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
```

## Query Examples

### Get Recent Admin Actions

```typescript
import { AdminAction } from '@/models/AdminAction';

// Get recent actions
const recentActions = await AdminAction.getRecent(50);

// Get actions by admin
const adminActions = await AdminAction.getByAdminId('admin-123', 100);

// Get actions by type
const loginActions = await AdminAction.getByActionType('LOGIN', 50);
```

### Get Activity Summary

```typescript
// Get admin activity summary for last 30 days
const summary = await AdminAction.getActivitySummary('admin-123', 30);

// Get admin statistics
const stats = await AdminAction.getAdminStats('admin-123');
```

### Get Security Actions

```typescript
// Get security-related actions
const securityActions = await AdminAction.getSecurityActions(50);
```

## Indexes

The system creates the following indexes for optimal performance:

- `{ adminId: 1, createdAt: -1 }` - Admin actions by date
- `{ actionType: 1, createdAt: -1 }` - Actions by type
- `{ targetType: 1, targetId: 1 }` - Target-specific actions
- `{ sessionId: 1, createdAt: -1 }` - Session activity
- `{ createdAt: -1 }` - General date sorting
- `{ ip: 1 }` - IP-based queries

## Security Considerations

1. **IP Logging**: All actions are logged with client IP for security auditing
2. **Session Tracking**: Each action is linked to an admin session
3. **User Agent Logging**: Browser/client information is captured
4. **Detailed Context**: Rich details about each action are stored
5. **Retention Policy**: Consider implementing data retention policies for compliance

## Monitoring and Alerts

### Security Monitoring

```typescript
// Get failed login attempts
const failedLogins = await AdminAction.find({
  actionType: 'LOGIN',
  'details.loginMethod': 'credentials',
  createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
});
```

### Activity Monitoring

```typescript
// Get admin activity in last hour
const recentActivity = await AdminAction.find({
  adminId: 'admin-123',
  createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
});
```

## Best Practices

1. **Always log admin actions** - Every admin action should be logged
2. **Include context** - Provide relevant details in the `details` field
3. **Use appropriate action types** - Choose the most specific action type
4. **Handle errors gracefully** - Logging failures shouldn't break the application
5. **Monitor log volume** - Consider archiving old logs for performance
6. **Secure access** - Restrict access to admin action logs
7. **Regular audits** - Review admin actions regularly for security

## Troubleshooting

### Common Issues

1. **Connection Errors**: Ensure MongoDB is running and accessible
2. **Index Errors**: Run the setup script to create required indexes
3. **Authentication Errors**: Verify admin middleware is properly configured
4. **Performance Issues**: Check index usage and consider query optimization

### Debug Mode

```typescript
// Enable debug logging
process.env.DEBUG_ADMIN_LOGGING = 'true';
```

This will log all admin actions to the console for debugging purposes.
