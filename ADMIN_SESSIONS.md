# Admin Session Management System

A comprehensive MongoDB-based session management system for tracking admin sessions in the GameTradeX platform.

## Overview

The admin session system records all admin sessions in a MongoDB collection called `admin_sessions` with detailed information including session tracking, activity monitoring, and automatic logout handling.

## Schema

### AdminSession Collection

```typescript
{
  adminId: string;           // Admin user ID
  sessionId: string;         // Unique session ID
  loginAt: Date;             // Login timestamp
  logoutAt?: Date;           // Logout timestamp (optional)
  ip: string;                // Client IP address
  userAgent: string;         // Client user agent
  origin?: string;           // Request origin (optional)
  createdAt: Date;           // Session creation timestamp
  isActive: boolean;         // Session active status
  lastActivity?: Date;       // Last activity timestamp
  duration?: number;         // Session duration in milliseconds
}
```

## Usage

### Basic Session Management

```typescript
import { startAdminSession, endAdminSession } from '@/utils/adminSessions';

// Start admin session
const sessionData = await startAdminSession(req, { 
  id: 'admin-123', 
  email: 'admin@gametradex.com' 
});

// End admin session
const success = await endAdminSession(sessionId);
```

### Session Activity Tracking

```typescript
import { updateAdminSessionActivity } from '@/utils/adminSessions';

// Update session activity
await updateAdminSessionActivity(sessionId);
```

### Session Validation

```typescript
import { validateAdminSession } from '@/utils/adminSessions';

// Validate session
const isValid = await validateAdminSession(sessionId);
```

## API Endpoints

### Start Admin Session
```
POST /api/admin/sessions/start
Content-Type: application/json

{
  "adminId": "admin-123",
  "adminEmail": "admin@gametradex.com"
}
```

### End Admin Session
```
POST /api/admin/sessions/:sessionId/end
```

### Update Session Activity
```
PUT /api/admin/sessions/:sessionId/activity
```

### Get Active Sessions
```
GET /api/admin/sessions/active?adminId=admin-123
```

### Get Session by ID
```
GET /api/admin/sessions/:sessionId
```

### Get Admin Session Statistics
```
GET /api/admin/sessions/stats/:adminId?days=30
```

### Get Admin Session Activity
```
GET /api/admin/sessions/activity/:adminId
```

### Get Admin IP Statistics
```
GET /api/admin/sessions/ip-stats/:adminId
```

### Get Concurrent Sessions
```
GET /api/admin/sessions/concurrent/:adminId
```

### Validate Session
```
GET /api/admin/sessions/:sessionId/validate
```

### Get Session Duration
```
GET /api/admin/sessions/:sessionId/duration
```

### Cleanup Expired Sessions
```
POST /api/admin/sessions/cleanup
Content-Type: application/json

{
  "expiryHours": 24
}
```

## Helper Functions

### startAdminSession(req, admin)

Creates a new admin session and logs the login action.

**Parameters:**
- `req: Request` - Express request object
- `admin: { id: string; email: string }` - Admin information

**Returns:**
- `Promise<AdminSessionData | null>` - Session data or null if failed

**Example:**
```typescript
const sessionData = await startAdminSession(req, {
  id: 'admin-123',
  email: 'admin@gametradex.com'
});

if (sessionData) {
  console.log('Session started:', sessionData.sessionId);
}
```

### endAdminSession(sessionId)

Ends an admin session and logs the logout action.

**Parameters:**
- `sessionId: string` - Session ID to end

**Returns:**
- `Promise<boolean>` - Success status

**Example:**
```typescript
const success = await endAdminSession('session-456');

if (success) {
  console.log('Session ended successfully');
}
```

### updateAdminSessionActivity(sessionId)

Updates the last activity timestamp for a session.

**Parameters:**
- `sessionId: string` - Session ID to update

**Returns:**
- `Promise<boolean>` - Success status

**Example:**
```typescript
await updateAdminSessionActivity('session-456');
```

### getActiveAdminSessions(adminId?)

Gets all active admin sessions.

**Parameters:**
- `adminId?: string` - Optional admin ID filter

**Returns:**
- `Promise<AdminSessionData[]>` - Array of active sessions

**Example:**
```typescript
const sessions = await getActiveAdminSessions('admin-123');
console.log('Active sessions:', sessions.length);
```

### getAdminSession(sessionId)

Gets a specific admin session by session ID.

**Parameters:**
- `sessionId: string` - Session ID to retrieve

**Returns:**
- `Promise<AdminSessionData | null>` - Session data or null if not found

**Example:**
```typescript
const session = await getAdminSession('session-456');

if (session) {
  console.log('Session found:', session.isActive);
}
```

### getAdminSessionStats(adminId, days?)

Gets session statistics for an admin.

**Parameters:**
- `adminId: string` - Admin ID
- `days: number` - Number of days to look back (default: 30)

**Returns:**
- `Promise<AdminSessionStats>` - Session statistics

**Example:**
```typescript
const stats = await getAdminSessionStats('admin-123', 30);
console.log('Total sessions:', stats.totalSessions);
console.log('Active sessions:', stats.activeSessions);
```

### validateAdminSession(sessionId)

Validates if a session exists and is active.

**Parameters:**
- `sessionId: string` - Session ID to validate

**Returns:**
- `Promise<boolean>` - Validation result

**Example:**
```typescript
const isValid = await validateAdminSession('session-456');

if (isValid) {
  console.log('Session is valid');
} else {
  console.log('Session is invalid or expired');
}
```

## Express Integration

### Session Middleware

```typescript
import { validateAdminSession, updateAdminSessionActivity } from '@/utils/adminSessions';

export const sessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!sessionId) {
      return res.status(401).json({ message: 'Session ID required' });
    }
    
    // Validate session
    const isValid = await validateAdminSession(sessionId);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }
    
    // Update session activity
    await updateAdminSessionActivity(sessionId);
    
    // Add session info to request
    req.sessionId = sessionId;
    
    next();
    
  } catch (error) {
    console.error('Session middleware error:', error);
    res.status(500).json({ message: 'Session validation error' });
  }
};
```

### Route Handler Example

```typescript
import { startAdminSession, endAdminSession } from '@/utils/adminSessions';

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { adminId, adminEmail } = req.body;
    
    // Start admin session
    const sessionData = await startAdminSession(req, { id: adminId, email: adminEmail });
    
    if (!sessionData) {
      return res.status(500).json({ message: 'Failed to start session' });
    }
    
    res.json({
      success: true,
      sessionId: sessionData.sessionId,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const adminLogout = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    // End admin session
    const success = await endAdminSession(sessionId);
    
    if (!success) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};
```

## Database Indexes

The system creates the following indexes for optimal performance:

- `{ adminId: 1, loginAt: -1 }` - Admin sessions by date
- `{ sessionId: 1 }` - Unique session ID lookup
- `{ isActive: 1, lastActivity: -1 }` - Active sessions by activity
- `{ loginAt: -1 }` - General date sorting
- `{ ip: 1, loginAt: -1 }` - IP-based queries

## Session Lifecycle

### 1. Session Creation
- Admin logs in
- `startAdminSession()` is called
- Session document created in MongoDB
- LOGIN action logged in admin_actions
- Session ID returned to client

### 2. Session Activity
- Client makes requests with session ID
- `updateAdminSessionActivity()` updates lastActivity
- Session remains active

### 3. Session Termination
- Admin logs out or session expires
- `endAdminSession()` is called
- Session marked as inactive
- LOGOUT action logged in admin_actions
- Session duration calculated

## Security Features

### Session Validation
- All admin actions require valid session
- Sessions are validated on each request
- Expired sessions are automatically cleaned up

### Activity Tracking
- Last activity timestamp updated on each request
- Inactive sessions can be identified and terminated
- Session duration calculated automatically

### IP Tracking
- All sessions logged with client IP
- IP statistics available for security monitoring
- Concurrent sessions from different IPs tracked

## Monitoring and Analytics

### Session Statistics
```typescript
const stats = await getAdminSessionStats('admin-123', 30);
console.log({
  totalSessions: stats.totalSessions,
  activeSessions: stats.activeSessions,
  totalDuration: stats.totalDuration,
  avgDuration: stats.avgDuration,
  uniqueIPs: stats.uniqueIPs
});
```

### Activity Summary
```typescript
const activity = await getAdminSessionActivitySummary('admin-123');
// Returns daily session activity
```

### IP Statistics
```typescript
const ipStats = await getAdminIPStats('admin-123');
// Returns sessions by IP address
```

### Concurrent Sessions
```typescript
const concurrent = await getConcurrentAdminSessions('admin-123');
console.log('Concurrent sessions:', concurrent.concurrentSessions);
```

## Cleanup and Maintenance

### Expired Session Cleanup
```typescript
import { cleanupExpiredSessions } from '@/utils/adminSessions';

// Cleanup sessions older than 24 hours
const cleanedCount = await cleanupExpiredSessions(24);
console.log('Cleaned up sessions:', cleanedCount);
```

### Scheduled Cleanup
```typescript
// Run cleanup every hour
setInterval(async () => {
  await cleanupExpiredSessions(24);
}, 60 * 60 * 1000);
```

## Best Practices

1. **Always validate sessions** - Check session validity on each request
2. **Update activity regularly** - Keep session activity current
3. **Handle session expiration** - Implement proper logout on expiration
4. **Monitor concurrent sessions** - Track multiple sessions per admin
5. **Clean up expired sessions** - Regular cleanup of old sessions
6. **Log session events** - All session events are logged in admin_actions
7. **Secure session storage** - Store session IDs securely on client side

## Troubleshooting

### Common Issues

1. **Session not found** - Check if session ID is correct
2. **Session expired** - Implement proper session renewal
3. **Concurrent sessions** - Monitor for multiple active sessions
4. **IP changes** - Handle IP changes during session

### Debug Mode

```typescript
// Enable debug logging
process.env.DEBUG_ADMIN_SESSIONS = 'true';
```

This will log all session operations to the console for debugging purposes.

## Integration with Admin Actions

The session system automatically integrates with the admin actions logging system:

- **LOGIN action** - Created when session starts
- **LOGOUT action** - Created when session ends
- **Session context** - All admin actions include session ID
- **Activity tracking** - Session activity updates logged

This provides a complete audit trail of admin sessions and activities.
