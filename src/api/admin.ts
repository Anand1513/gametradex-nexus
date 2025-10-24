// Admin API service for handling admin-specific operations

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface PriceUpdateData {
  priceMin: number;
  priceMax: number;
  isFixed: boolean;
  negotiable: boolean;
}

interface PriceUpdateResponse {
  id: string;
  priceMin: number;
  priceMax: number;
  isFixed: boolean;
  negotiable: boolean;
  updatedAt: string;
}

/**
 * Update listing price via admin API
 * @param listingId - The ID of the listing to update
 * @param priceData - The new price data
 * @returns Promise<PriceUpdateResponse>
 */
export const updateListingPrice = async (
  listingId: string, 
  priceData: PriceUpdateData
): Promise<PriceUpdateResponse> => {
  const adminSession = localStorage.getItem('adminSession');
  
  if (!adminSession) {
    throw new Error('Admin session not found');
  }

  const sessionData = JSON.parse(adminSession);
  
  if (sessionData.expiry < Date.now()) {
    localStorage.removeItem('adminSession');
    throw new Error('Admin session expired');
  }

  const response = await fetch(`http://localhost:3001/api/admin/listings/${listingId}/price`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionData.sessionId || '',
      'x-admin-id': sessionData.adminId || 'admin-123',
      'x-admin-email': 'admin@gametradex.com'
    },
    body: JSON.stringify(priceData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Get admin session info
 * @returns Object with session details or null if invalid
 */
export const getAdminSession = () => {
  try {
    const session = localStorage.getItem('adminSession');
    if (!session) return null;
    
    const sessionData = JSON.parse(session);
    
    if (sessionData.expiry < Date.now()) {
      localStorage.removeItem('adminSession');
      return null;
    }
    
    return sessionData;
  } catch (error) {
    localStorage.removeItem('adminSession');
    return null;
  }
};

/**
 * Check if admin session is valid
 * @returns boolean
 */
export const isAdminSessionValid = (): boolean => {
  return getAdminSession() !== null;
};

/**
 * Approve listing
 */
export const approveListing = async (listingId: string) => {
  const adminSession = localStorage.getItem('adminSession');
  const sessionData = adminSession ? JSON.parse(adminSession) : null;
  
  const response = await fetch(`http://localhost:3001/api/admin/listings/${listingId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionData?.sessionId || '',
      'x-admin-id': sessionData?.adminId || 'admin-123',
      'x-admin-email': 'admin@gametradex.com'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to approve listing');
  }

  return await response.json();
};

/**
 * Reject listing
 */
export const rejectListing = async (listingId: string, reason?: string) => {
  const adminSession = localStorage.getItem('adminSession');
  const sessionData = adminSession ? JSON.parse(adminSession) : null;
  
  const response = await fetch(`http://localhost:3001/api/admin/listings/${listingId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionData?.sessionId || '',
      'x-admin-id': sessionData?.adminId || 'admin-123',
      'x-admin-email': 'admin@gametradex.com'
    },
    body: JSON.stringify({ reason })
  });

  if (!response.ok) {
    throw new Error('Failed to reject listing');
  }

  return await response.json();
};

/**
 * Delete listing
 */
export const deleteListing = async (listingId: string, reason?: string) => {
  const adminSession = localStorage.getItem('adminSession');
  const sessionData = adminSession ? JSON.parse(adminSession) : null;
  
  const response = await fetch(`http://localhost:3001/api/admin/listings/${listingId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionData?.sessionId || '',
      'x-admin-id': sessionData?.adminId || 'admin-123',
      'x-admin-email': 'admin@gametradex.com'
    },
    body: JSON.stringify({ reason })
  });

  if (!response.ok) {
    throw new Error('Failed to delete listing');
  }

  return await response.json();
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: string) => {
  const adminSession = localStorage.getItem('adminSession');
  const sessionData = adminSession ? JSON.parse(adminSession) : null;
  
  const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionData?.sessionId || '',
      'x-admin-id': sessionData?.adminId || 'admin-123',
      'x-admin-email': 'admin@gametradex.com'
    },
    body: JSON.stringify({ role })
  });

  if (!response.ok) {
    throw new Error('Failed to update user role');
  }

  return await response.json();
};

/**
 * Update escrow status
 */
export const updateEscrowStatus = async (escrowId: string, status: string, action?: string) => {
  const adminSession = localStorage.getItem('adminSession');
  const sessionData = adminSession ? JSON.parse(adminSession) : null;
  
  const response = await fetch(`http://localhost:3001/api/admin/escrows/${escrowId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionData?.sessionId || '',
      'x-admin-id': sessionData?.adminId || 'admin-123',
      'x-admin-email': 'admin@gametradex.com'
    },
    body: JSON.stringify({ status, action })
  });

  if (!response.ok) {
    throw new Error('Failed to update escrow status');
  }

  return await response.json();
};

/**
 * Edit payment
 */
export const editPayment = async (paymentId: string, paymentData: {
  amount?: number;
  method?: string;
  status?: string;
}) => {
  const adminSession = localStorage.getItem('adminSession');
  const sessionData = adminSession ? JSON.parse(adminSession) : null;
  
  const response = await fetch(`http://localhost:3001/api/admin/payments/${paymentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionData?.sessionId || '',
      'x-admin-id': sessionData?.adminId || 'admin-123',
      'x-admin-email': 'admin@gametradex.com'
    },
    body: JSON.stringify(paymentData)
  });

  if (!response.ok) {
    throw new Error('Failed to edit payment');
  }

  return await response.json();
};
