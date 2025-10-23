// Mock API functions for authentication
export const authAPI = {
  login: async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'admin@gametradex.com' && password === 'admin123') {
      return {
        success: true,
        user: {
          id: 'admin-1',
          name: 'Admin User',
          email,
          role: 'admin'
        },
        token: 'mock-jwt-token'
      };
    }
    
    return {
      success: true,
      user: {
        id: '1',
        name: 'User',
        email,
        role: 'user'
      },
      token: 'mock-jwt-token'
    };
  },

  signup: async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      user: {
        id: '1',
        name,
        email,
        role: 'user'
      },
      token: 'mock-jwt-token'
    };
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};


