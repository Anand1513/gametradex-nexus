/**
 * Frontend Admin Session Management
 * Handles admin session creation, tracking, and termination (MongoDB integration moved to backend)
 */

export interface AdminSessionData {
  adminId: string;
  sessionId: string;
  loginAt: Date;
  ip: string;
  userAgent: string;
  origin?: string;
  isActive: boolean;
  lastActivity: Date;
  expiry?: number; // Session expiry timestamp
}

/**
 * Start admin session (frontend version)
 */
export const startAdminSession = async (admin: { id: string; email: string }): Promise<AdminSessionData | null> => {
  try {
    const sessionId = `admin_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const loginAt = new Date();
    const ip = '127.0.0.1'; // Mock IP for frontend
    const userAgent = navigator.userAgent;
    const origin = window.location.origin;
    
    const sessionData: AdminSessionData = {
      adminId: admin.id,
      sessionId,
      loginAt,
      ip,
      userAgent,
      origin,
      isActive: true,
      lastActivity: loginAt,
      expiry: Date.now() + (2 * 60 * 60 * 1000) // 2 hours from now
    };
    
    // Store session in localStorage
    localStorage.setItem('adminSession', JSON.stringify(sessionData));
    
    console.log('Admin session started (frontend):', {
      sessionId: sessionData.sessionId,
      adminId: sessionData.adminId,
      loginAt: sessionData.loginAt
    });
    
    // Send to backend API (optional - frontend works without backend)
    try {
      const response = await fetch('http://localhost:3001/api/admin/sessions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: admin.id,
          adminEmail: admin.email
        })
      });
      
      if (!response.ok) {
        console.warn('Failed to start admin session on backend:', response.statusText);
      }
    } catch (error) {
      console.warn('Error sending session to backend (backend not available):', error);
    }
    
    return sessionData;
    
  } catch (error) {
    console.error('Error starting admin session:', error);
    return null;
  }
};

/**
 * End admin session (frontend version)
 */
export const endAdminSession = async (sessionId: string): Promise<boolean> => {
  try {
    // Get session from localStorage
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      console.warn('No admin session found');
      return false;
    }
    
    const session = JSON.parse(adminSession);
    if (session.sessionId !== sessionId) {
      console.warn('Session ID mismatch');
      return false;
    }
    
    // Update session in localStorage
    const updatedSession = {
      ...session,
      isActive: false,
      logoutAt: new Date().toISOString()
    };
    
    localStorage.setItem('adminSession', JSON.stringify(updatedSession));
    
    console.log('Admin session ended (frontend):', {
      sessionId: session.sessionId,
      adminId: session.adminId,
      logoutAt: updatedSession.logoutAt
    });
    
    // Send to backend API
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.warn('Failed to end admin session on backend:', response.statusText);
      }
    } catch (error) {
      console.warn('Error sending session end to backend:', error);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error ending admin session:', error);
    return false;
  }
};

/**
 * Update admin session activity (frontend version)
 */
export const updateAdminSessionActivity = async (sessionId: string): Promise<boolean> => {
  try {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      return false;
    }
    
    const session = JSON.parse(adminSession);
    if (session.sessionId !== sessionId || !session.isActive) {
      return false;
    }
    
    // Update last activity
    const updatedSession = {
      ...session,
      lastActivity: new Date().toISOString()
    };
    
    localStorage.setItem('adminSession', JSON.stringify(updatedSession));
    
    // Send to backend API
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/activity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.warn('Failed to update session activity on backend:', response.statusText);
      }
    } catch (error) {
      console.warn('Error sending activity update to backend:', error);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error updating admin session activity:', error);
    return false;
  }
};

/**
 * Get active admin sessions (frontend version)
 */
export const getActiveAdminSessions = async (adminId?: string): Promise<AdminSessionData[]> => {
  try {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      return [];
    }
    
    const session = JSON.parse(adminSession);
    if (adminId && session.adminId !== adminId) {
      return [];
    }
    
    return session.isActive ? [session] : [];
    
  } catch (error) {
    console.error('Error getting active admin sessions:', error);
    return [];
  }
};

/**
 * Get admin session by session ID (frontend version)
 */
export const getAdminSession = async (sessionId: string): Promise<AdminSessionData | null> => {
  try {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      return null;
    }
    
    const session = JSON.parse(adminSession);
    if (session.sessionId !== sessionId) {
      return null;
    }
    
    return session;
    
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
};

/**
 * Get admin session statistics (frontend version)
 */
export const getAdminSessionStats = async (adminId: string, days: number = 30) => {
  try {
    // Mock stats for frontend
    return {
      totalSessions: 1,
      activeSessions: 1,
      totalDuration: 0,
      avgDuration: 0,
      firstLogin: new Date(),
      lastLogin: new Date(),
      uniqueIPs: 1
    };
  } catch (error) {
    console.error('Error getting admin session stats:', error);
    return {
      totalSessions: 0,
      activeSessions: 0,
      totalDuration: 0,
      avgDuration: 0,
      firstLogin: null,
      lastLogin: null,
      uniqueIPs: 0
    };
  }
};

/**
 * Get admin session activity summary (frontend version)
 */
export const getAdminSessionActivitySummary = async (adminId: string) => {
  try {
    // Mock activity for frontend
    return [];
  } catch (error) {
    console.error('Error getting admin session activity summary:', error);
    return [];
  }
};

/**
 * Get IP statistics for admin (frontend version)
 */
export const getAdminIPStats = async (adminId: string) => {
  try {
    // Mock IP stats for frontend
    return [];
  } catch (error) {
    console.error('Error getting admin IP stats:', error);
    return [];
  }
};

/**
 * Get concurrent sessions for admin (frontend version)
 */
export const getConcurrentAdminSessions = async (adminId: string) => {
  try {
    const sessions = await getActiveAdminSessions(adminId);
    return {
      concurrentSessions: sessions.length,
      sessions
    };
  } catch (error) {
    console.error('Error getting concurrent admin sessions:', error);
    return { concurrentSessions: 0, sessions: [] };
  }
};

/**
 * Cleanup expired sessions (frontend version)
 */
export const cleanupExpiredSessions = async (expiryHours: number = 24): Promise<number> => {
  try {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      return 0;
    }
    
    const session = JSON.parse(adminSession);
    const now = new Date();
    const lastActivity = new Date(session.lastActivity);
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceActivity > expiryHours) {
      localStorage.removeItem('adminSession');
      return 1;
    }
    
    return 0;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    return 0;
  }
};

/**
 * Validate admin session (frontend version)
 */
export const validateAdminSession = async (sessionId: string): Promise<boolean> => {
  try {
    const session = await getAdminSession(sessionId);
    return session ? session.isActive : false;
  } catch (error) {
    console.error('Error validating admin session:', error);
    return false;
  }
};

/**
 * Get session duration (frontend version)
 */
export const getSessionDuration = async (sessionId: string): Promise<number> => {
  try {
    const session = await getAdminSession(sessionId);
    
    if (!session) {
      return 0;
    }
    
    if (session.logoutAt) {
      return new Date(session.logoutAt).getTime() - new Date(session.loginAt).getTime();
    }
    
    return Date.now() - new Date(session.loginAt).getTime();
    
  } catch (error) {
    console.error('Error getting session duration:', error);
    return 0;
  }
};

// Alias for backward compatibility
export const updateAdminActivity = updateAdminSessionActivity;

export default {
  startAdminSession,
  endAdminSession,
  updateAdminSessionActivity,
  updateAdminActivity, // Alias
  getActiveAdminSessions,
  getAdminSession,
  getAdminSessionStats,
  getAdminSessionActivitySummary,
  getAdminIPStats,
  getConcurrentAdminSessions,
  cleanupExpiredSessions,
  validateAdminSession,
  getSessionDuration
};