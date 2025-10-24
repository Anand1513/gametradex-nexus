import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminAccess = () => {
      // Check admin session
      const session = localStorage.getItem('adminSession');
      console.log('AdminProtectedRoute - checking session:', session);
      
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          console.log('AdminProtectedRoute - session data:', sessionData);
          console.log('AdminProtectedRoute - session expiry:', sessionData.expiry);
          console.log('AdminProtectedRoute - current time:', Date.now());
          
          // Check if session is active and not expired
          if (sessionData.isActive && (!sessionData.expiry || sessionData.expiry > Date.now())) {
            console.log('AdminProtectedRoute - session valid, authorizing');
            setIsAuthorized(true);
          } else {
            // Session expired or inactive
            console.log('AdminProtectedRoute - session expired or inactive');
            localStorage.removeItem('adminSession');
            localStorage.removeItem('dummyAuthToken');
            setIsAuthorized(false);
            toast.error('Admin session expired. Please log in again.');
          }
        } catch (error) {
          console.log('AdminProtectedRoute - session parse error:', error);
          localStorage.removeItem('adminSession');
          localStorage.removeItem('dummyAuthToken');
          setIsAuthorized(false);
          toast.error('Invalid admin session. Please log in again.');
        }
      } else {
        console.log('AdminProtectedRoute - no session found');
        setIsAuthorized(false);
        toast.error('Admin session required. Please log in.');
      }
    };

    checkAdminAccess();
  }, []);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
