/**
 * Shared Data Store for Simple Server
 * This file provides a shared data store for custom requests and payments
 */

// Mock data storage (in production, this would be in a database)
let customRequests = [];
let requestIdCounter = 1;

// Export functions to access and modify the data
module.exports = {
  // Custom Requests
  getCustomRequests: () => customRequests,
  addCustomRequest: (request) => {
    request._id = `req-${requestIdCounter++}`;
    customRequests.push(request);
    return request;
  },
  updateCustomRequest: (id, updates) => {
    const index = customRequests.findIndex(req => req._id === id);
    if (index !== -1) {
      customRequests[index] = { ...customRequests[index], ...updates, updatedAt: new Date() };
      return customRequests[index];
    }
    return null;
  },
  findCustomRequest: (id) => customRequests.find(req => req._id === id),
  findCustomRequestByIndex: (id) => customRequests.findIndex(req => req._id === id),
  
  // Utility functions
  getRequestIdCounter: () => requestIdCounter,
  incrementRequestIdCounter: () => requestIdCounter++
};
