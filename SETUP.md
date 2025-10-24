# GameTradeX Setup Guide

Complete setup instructions for the GameTradeX platform with MongoDB backend integration.

## 🚀 Quick Start

### 1. Frontend Setup (React + Vite)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Backend Setup (MongoDB + Express)
```bash
# Install backend dependencies
cd backend
npm install

# Setup database
npm run setup-db

# Start backend server
npm run dev
```

## 📁 Project Structure

```
gametradex-nexus/
├── src/                          # Frontend React app
│   ├── components/               # React components
│   ├── pages/                    # Page components
│   ├── utils/                    # Frontend utilities
│   └── contexts/                 # React contexts
├── backend/                      # Backend server
│   ├── models/                   # MongoDB models
│   ├── utils/                    # Backend utilities
│   ├── api/routes/               # API routes
│   ├── middleware/               # Express middleware
│   ├── scripts/                  # Database scripts
│   └── examples/                 # Usage examples
└── docs/                         # Documentation
```

## 🔧 Environment Setup

### Frontend Environment (.env)
```bash
# Frontend configuration
VITE_REACT_APP_USE_DUMMY_AUTH=true
VITE_REACT_APP_FIREBASE_API_KEY=your-firebase-key
VITE_REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain
VITE_REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

### Backend Environment (backend/.env)
```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/gametradex

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8081
```

## 🗄️ Database Setup

### 1. Install MongoDB
```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
# Windows: Download from mongodb.com
```

### 2. Start MongoDB
```bash
# Docker
docker start mongodb

# Local installation
mongod
```

### 3. Setup Database
```bash
# Run database setup script
npm run backend:setup
```

## 🚀 Running the Application

### Development Mode
```bash
# Terminal 1: Start backend
npm run backend:dev

# Terminal 2: Start frontend
npm run dev
```

### Production Mode
```bash
# Build frontend
npm run build

# Start backend
npm run backend
```

## 🔗 API Endpoints

### Backend Server (Port 3001)
- **Health Check**: `GET /health`
- **Admin Actions**: `POST /api/admin/logs`
- **Admin Sessions**: `POST /api/admin/sessions/start`
- **Session Management**: `PUT /api/admin/sessions/:id/activity`

### Frontend Server (Port 8081)
- **Admin Login**: `http://localhost:8081/admin/login`
- **Admin Dashboard**: `http://localhost:8081/admin/dashboard`
- **User Login**: `http://localhost:8081/login`

## 📊 Database Collections

### admin_actions
```javascript
{
  adminId: String,           // Admin user ID
  adminEmail: String,        // Admin email
  sessionId: String,         // Session ID
  actionType: String,        // LOGIN, LOGOUT, etc.
  targetType: String,        // SESSION, LISTING, etc.
  targetId: String,          // Target object ID
  details: Object,           // Action details
  ip: String,                // Client IP
  userAgent: String,         // Client user agent
  createdAt: Date            // Timestamp
}
```

### admin_sessions
```javascript
{
  adminId: String,           // Admin user ID
  sessionId: String,         // Unique session ID
  loginAt: Date,             // Login timestamp
  logoutAt: Date,            // Logout timestamp
  ip: String,                // Client IP
  userAgent: String,         // Client user agent
  origin: String,            // Request origin
  isActive: Boolean,         // Session status
  lastActivity: Date,        // Last activity
  duration: Number          // Session duration (ms)
}
```

## 🔐 Authentication

### Admin Login
- **URL**: `/admin/login`
- **Methods**: Key-based or ID/Password
- **Demo Credentials**: 
  - Key: `admin123`
  - Email: `admin@gametradex.com`
  - Password: `admin123`

### User Login
- **URL**: `/login`
- **Methods**: Email/Password or Firebase OAuth
- **Demo Credentials**:
  - Email: `user@example.com`
  - Password: `password123`

## 🛡️ Security Features

### Admin Session Management
- **Session Tracking**: All admin sessions recorded
- **Activity Monitoring**: Last activity timestamp updated
- **IP Tracking**: Client IP logged for security
- **Session Validation**: Sessions validated on each request
- **Automatic Cleanup**: Expired sessions cleaned up

### Admin Action Logging
- **Complete Audit Trail**: All admin actions logged
- **Before/After Values**: Detailed change tracking
- **Session Context**: Actions linked to sessions
- **Security Actions**: Security-related actions flagged
- **System Updates**: System changes tracked

## 📱 Frontend Features

### Admin Dashboard
- **Listings Management**: Approve, reject, delete listings
- **User Management**: View and manage users
- **Escrow Management**: Handle escrow transactions
- **Price Management**: Edit listing prices
- **Session Monitoring**: View active sessions
- **Activity Logs**: View admin action history

### User Features
- **Account Browsing**: Browse available accounts
- **Bidding System**: Place bids on accounts
- **Selling**: List accounts for sale
- **Profile Management**: Manage user profile
- **Contact**: Contact support

## 🔧 Development

### Adding New Features

#### Frontend
1. **New Components**: Add to `src/components/`
2. **New Pages**: Add to `src/pages/`
3. **New Utilities**: Add to `src/utils/`
4. **New Contexts**: Add to `src/contexts/`

#### Backend
1. **New Models**: Add to `backend/models/`
2. **New Routes**: Add to `backend/api/routes/`
3. **New Utilities**: Add to `backend/utils/`
4. **New Middleware**: Add to `backend/middleware/`

### Database Operations

#### Create Indexes
```bash
npm run backend:setup
```

#### View Collections
```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/gametradex

# View admin actions
db.admin_actions.find().sort({createdAt: -1}).limit(10)

# View admin sessions
db.admin_sessions.find().sort({loginAt: -1}).limit(10)
```

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Start MongoDB
docker start mongodb
```

#### 2. CORS Errors
```bash
# Check backend CORS configuration
# Verify FRONTEND_URL in backend/.env
```

#### 3. Session Not Found
```bash
# Check session in database
mongo mongodb://localhost:27017/gametradex --eval "db.admin_sessions.find({sessionId: 'your-session-id'})"
```

#### 4. Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear backend dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

#### Frontend
```bash
# Enable debug logging
DEBUG=* npm run dev
```

#### Backend
```bash
# Enable debug logging
DEBUG=* npm run backend:dev
```

## 📚 Documentation

### API Documentation
- **Admin Actions**: `backend/README.md`
- **Admin Sessions**: `ADMIN_SESSIONS.md`
- **Database Setup**: `backend/scripts/setupDatabase.ts`

### Usage Examples
- **Admin Logging**: `backend/examples/adminLoggingExample.ts`
- **Admin Sessions**: `backend/examples/adminSessionExample.ts`

## 🚀 Deployment

### Production Setup

#### 1. Environment Variables
```bash
# Frontend
NODE_ENV=production
VITE_REACT_APP_USE_DUMMY_AUTH=false

# Backend
NODE_ENV=production
MONGODB_URI=mongodb://your-production-mongodb:27017/gametradex
PORT=3001
FRONTEND_URL=https://your-domain.com
```

#### 2. Build and Deploy
```bash
# Build frontend
npm run build

# Start backend
npm run backend
```

#### 3. Database Setup
```bash
# Run database setup
npm run backend:setup
```

## 📞 Support

### Getting Help
1. **Check Documentation**: Review all README files
2. **Check Logs**: Review console and server logs
3. **Check Database**: Verify MongoDB connection and data
4. **Check Environment**: Verify all environment variables

### Common Commands
```bash
# Check application status
curl http://localhost:8081  # Frontend
curl http://localhost:3001/health  # Backend

# Check database
mongo mongodb://localhost:27017/gametradex --eval "db.stats()"

# View logs
npm run backend:dev  # Backend logs
npm run dev  # Frontend logs
```

## 🎯 Next Steps

1. **Customize Admin Dashboard**: Add new admin features
2. **Enhance Security**: Add JWT authentication
3. **Add Monitoring**: Implement application monitoring
4. **Scale Database**: Add database clustering
5. **Add Testing**: Implement unit and integration tests

---

**Happy Coding! 🚀**
