# GameTradeX API Test Suite

Comprehensive test suite for the GameTradeX marketplace API, covering listing creation, purchase flow, role updates, ownership checks, and notification management.

## 🧪 Test Categories

### 1. Listing Creation Tests
- ✅ Creates listings with proper validation
- ✅ Updates user role to 'seller' automatically
- ✅ Logs admin actions for audit trail
- ✅ Creates notifications for listing events
- ✅ Requires authentication for listing creation
- ✅ Validates required fields

### 2. Purchase Flow Tests
- ✅ Creates purchases with proper ownership checks
- ✅ Updates user stats (boughtCount, totalSpent, totalEarned)
- ✅ Prevents users from buying their own listings
- ✅ Creates notifications for both buyer and seller
- ✅ Logs admin actions for purchase events
- ✅ Requires authentication for purchases

### 3. Delivery & Receipt Confirmation Tests
- ✅ Allows only sellers to confirm delivery
- ✅ Allows only buyers to confirm receipt
- ✅ Prevents receipt confirmation before delivery
- ✅ Updates purchase status correctly
- ✅ Creates notifications for delivery/receipt events
- ✅ Logs admin actions for confirmation events

### 4. Role Update Tests
- ✅ Allows only admins to update user roles
- ✅ Prevents non-admins from updating roles
- ✅ Handles non-existent users gracefully
- ✅ Logs admin actions for role changes
- ✅ Creates notifications for role updates
- ✅ Validates admin access requirements

### 5. Notification Tests
- ✅ Marks notifications as read correctly
- ✅ Handles non-existent notifications
- ✅ Requires authentication for notification access
- ✅ Updates notification status properly
- ✅ Maintains notification history

### 6. Support Ticket Tests
- ✅ Creates support tickets for authenticated users
- ✅ Requires authentication for ticket creation
- ✅ Sets default priority for tickets
- ✅ Logs admin actions for ticket creation
- ✅ Associates tickets with correct users

### 7. Ownership Verification Tests
- ✅ Verifies ownership for delivery confirmation
- ✅ Verifies ownership for receipt confirmation
- ✅ Prevents unauthorized access to other users' resources
- ✅ Enforces proper access control
- ✅ Maintains data integrity

### 8. Integration Tests
- ✅ Completes full purchase workflow
- ✅ Maintains proper ownership throughout flow
- ✅ Creates all necessary notifications
- ✅ Logs all admin actions
- ✅ Updates user stats correctly
- ✅ Prevents unauthorized access

## 🚀 Running Tests

### Install Dependencies
```bash
cd backend
npm install
```

### Run All Tests
```bash
npm test
# or
node run-tests.js all
```

### Run Specific Test Category
```bash
node run-tests.js category "Listing Creation"
node run-tests.js category "Purchase Flow"
node run-tests.js category "Delivery & Receipt"
node run-tests.js category "Role Update"
node run-tests.js category "Notification"
node run-tests.js category "Support Ticket"
node run-tests.js category "Ownership Verification"
node run-tests.js category "Integration"
```

### Run with Coverage
```bash
npm run test:coverage
# or
node run-tests.js coverage
```

### List Available Categories
```bash
node run-tests.js list
```

## 📊 Test Coverage

The test suite covers:

- **API Endpoints**: All CRUD operations for listings, purchases, users, notifications
- **Authentication**: Token validation, user identification, session management
- **Authorization**: Role-based access control, ownership verification
- **Business Logic**: Purchase flow, delivery confirmation, receipt confirmation
- **Data Integrity**: User stats updates, role assignments, status changes
- **Notifications**: Creation, marking as read, user-specific access
- **Admin Actions**: Logging, audit trail, security monitoring
- **Error Handling**: Invalid requests, unauthorized access, missing resources

## 🔒 Security Tests

### Ownership Verification
- ✅ Only sellers can confirm delivery of their listings
- ✅ Only buyers can confirm receipt of their purchases
- ✅ Users cannot access other users' private resources
- ✅ Proper authentication required for all operations

### Role-Based Access Control
- ✅ Only admins can update user roles
- ✅ Users cannot escalate their own privileges
- ✅ Proper role validation for sensitive operations
- ✅ Admin actions are logged for audit purposes

### Data Protection
- ✅ User data is protected from unauthorized access
- ✅ Purchase information is restricted to involved parties
- ✅ Notification access is user-specific
- ✅ Support tickets are private to the creator

## 🎯 Test Scenarios

### Complete Purchase Flow
1. **User creates listing** → Role updated to 'seller', stats updated
2. **Another user buys listing** → Purchase created, both users' stats updated
3. **Seller confirms delivery** → Purchase status updated, buyer notified
4. **Buyer confirms receipt** → Purchase completed, seller notified
5. **All actions logged** → Admin actions recorded for audit

### Error Scenarios
1. **Unauthorized access** → Proper 403/401 responses
2. **Invalid data** → Validation errors with helpful messages
3. **Missing resources** → 404 responses for non-existent items
4. **Business rule violations** → Prevents invalid operations

### Security Scenarios
1. **Cross-user access** → Blocked with proper error messages
2. **Role escalation** → Prevented with authorization checks
3. **Data tampering** → Protected with ownership verification
4. **Session hijacking** → Prevented with token validation

## 📈 Performance Tests

- **Concurrent requests**: Multiple users creating listings/purchases
- **Database operations**: Efficient queries and updates
- **Memory usage**: Proper cleanup and resource management
- **Response times**: Fast API responses under load

## 🐛 Debugging Tests

### Verbose Output
```bash
npm test -- --verbose
```

### Watch Mode
```bash
npm run test:watch
```

### Specific Test
```bash
npx jest --testNamePattern="should create listing"
```

## 📝 Test Data

The test suite uses mock data to ensure:
- **Consistency**: Same test data across all runs
- **Isolation**: Tests don't interfere with each other
- **Reliability**: Predictable test outcomes
- **Speed**: Fast test execution without external dependencies

## 🔧 Configuration

### Jest Configuration
- **Test Environment**: Node.js
- **Timeout**: 10 seconds per test
- **Coverage**: HTML and LCOV reports
- **Parallel**: Sequential execution to avoid conflicts

### Test Setup
- **Global utilities**: Helper functions for test data
- **Mock services**: Simulated external dependencies
- **Cleanup**: Automatic cleanup between tests
- **Isolation**: Each test runs independently

## 📚 Test Documentation

Each test includes:
- **Description**: What the test verifies
- **Setup**: Required test data and conditions
- **Execution**: API calls and assertions
- **Verification**: Expected outcomes and side effects
- **Cleanup**: State reset for next test

## 🎉 Success Criteria

Tests pass when:
- ✅ All API endpoints respond correctly
- ✅ Authentication and authorization work properly
- ✅ Business logic is enforced correctly
- ✅ Data integrity is maintained
- ✅ Security measures are effective
- ✅ Error handling is appropriate
- ✅ Performance is acceptable
- ✅ Code coverage is comprehensive

## 🚨 Common Issues

### Port Conflicts
- Tests use different ports to avoid conflicts
- Sequential execution prevents port collisions
- Proper cleanup after each test

### Async Operations
- Proper handling of promises and async/await
- Timeout configuration for long-running operations
- Error handling for failed async operations

### Mock Data
- Consistent test data across all tests
- Proper cleanup between test runs
- Isolated test environments

## 📞 Support

For test-related issues:
1. Check the test output for specific error messages
2. Verify all dependencies are installed
3. Ensure the test environment is properly configured
4. Review the test documentation for guidance

---

**GameTradeX Test Suite** - Ensuring robust, secure, and reliable marketplace operations! 🎮✨
