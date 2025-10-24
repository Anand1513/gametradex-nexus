# GameTradeX Backend

MongoDB-based backend server for admin session management and action logging.

## Features

- **Admin Session Management**: Track admin login/logout sessions
- **Admin Action Logging**: Record all admin actions with detailed audit trails
- **MongoDB Integration**: Persistent storage for sessions and actions
- **REST API**: HTTP endpoints for frontend integration
- **Security**: IP tracking, user agent logging, session validation

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/gametradex

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8081
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or using local MongoDB installation
mongod
```

### 4. Setup Database

```bash
npm run setup-db
```

### 5. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Admin Actions
```
POST /api/admin/logs          # Log admin action
GET  /api/admin/actions       # Get admin actions
```

### Admin Sessions
```
POST /api/admin/sessions/start                    # Start session
POST /api/admin/sessions/:sessionId/end          # End session
PUT  /api/admin/sessions/:sessionId/activity     # Update activity
GET  /api/admin/sessions                         # Get sessions
```

## Database Collections

### admin_actions
```javascript
{
  adminId: String,
  adminEmail: String,
  sessionId: String,
  actionType: String,
  targetType: String,
  targetId: String,
  details: Object,
  ip: String,
  userAgent: String,
  createdAt: Date
}
```

### admin_sessions
```javascript
{
  adminId: String,
  sessionId: String,
  loginAt: Date,
  logoutAt: Date,
  ip: String,
  userAgent: String,
  origin: String,
  isActive: Boolean,
  lastActivity: Date,
  duration: Number
}
```

## Usage Examples

### Start Admin Session
```javascript
const response = await fetch('http://localhost:3001/api/admin/sessions/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminId: 'admin-123',
    adminEmail: 'admin@gametradex.com'
  })
});
```

### Log Admin Action
```javascript
const response = await fetch('http://localhost:3001/api/admin/logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminId: 'admin-123',
    email: 'admin@gametradex.com',
    sessionId: 'session-456',
    actionType: 'LOGIN',
    targetType: 'SESSION',
    details: { loginMethod: 'credentials' },
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0...'
  })
});
```

### End Admin Session
```javascript
const response = await fetch('http://localhost:3001/api/admin/sessions/session-456/end', {
  method: 'POST'
});
```

## Development

### File Structure
```
backend/
├── models/
│   ├── AdminAction.ts
│   └── AdminSession.ts
├── utils/
│   ├── database.ts
│   ├── logAdminAction.ts
│   └── adminSessions.ts
├── api/
│   └── routes/
│       ├── adminActions.ts
│       └── adminSessions.ts
├── middleware/
│   └── adminAuth.ts
├── scripts/
│   └── setupDatabase.ts
├── examples/
│   ├── adminLoggingExample.ts
│   └── adminSessionExample.ts
├── server.js
├── package.json
└── README.md
```

### Adding New Features

1. **New Models**: Add to `models/` directory
2. **New Utilities**: Add to `utils/` directory  
3. **New Routes**: Add to `api/routes/` directory
4. **New Middleware**: Add to `middleware/` directory

### Testing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test admin session start
curl -X POST http://localhost:3001/api/admin/sessions/start \
  -H "Content-Type: application/json" \
  -d '{"adminId":"admin-123","adminEmail":"admin@gametradex.com"}'

# Test admin action logging
curl -X POST http://localhost:3001/api/admin/logs \
  -H "Content-Type: application/json" \
  -d '{"adminId":"admin-123","email":"admin@gametradex.com","sessionId":"session-456","actionType":"LOGIN","targetType":"SESSION","details":{},"ip":"127.0.0.1","userAgent":"Mozilla/5.0"}'
```

## Production Deployment

### Environment Variables
```bash
NODE_ENV=production
MONGODB_URI=mongodb://your-mongodb-host:27017/gametradex
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### PM2 Process Manager
```bash
npm install -g pm2
pm2 start server.js --name gametradex-backend
pm2 save
pm2 startup
```

## Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### Database Status
```bash
# Check MongoDB connection
mongo mongodb://localhost:27017/gametradex --eval "db.stats()"
```

### Logs
```bash
# View application logs
pm2 logs gametradex-backend

# View MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Configure allowed origins properly
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Authentication**: Add JWT or session-based authentication
5. **Input Validation**: Validate all input data
6. **HTTPS**: Use HTTPS in production
7. **Database Security**: Secure MongoDB with authentication

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **CORS Errors**
   - Verify FRONTEND_URL environment variable
   - Check CORS configuration

3. **Session Not Found**
   - Verify session ID format
   - Check if session exists in database
   - Verify session is active

4. **Database Indexes**
   - Run setup script: `npm run setup-db`
   - Check index creation in MongoDB

### Debug Mode

```bash
DEBUG=* npm run dev
```

### Database Queries

```javascript
// Check admin actions
db.admin_actions.find().sort({createdAt: -1}).limit(10)

// Check admin sessions
db.admin_sessions.find().sort({loginAt: -1}).limit(10)

// Check active sessions
db.admin_sessions.find({isActive: true})
```
