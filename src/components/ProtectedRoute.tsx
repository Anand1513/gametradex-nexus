import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireSeller?: boolean;
  requireBuyer?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireSeller = false,
  requireBuyer = false
}) => {
  const { user, userData, loading, isDummyAuth } = useAuth();

  // Check for dummy auth token
  const checkDummyAuthToken = () => {
    if (isDummyAuth) {
      const token = localStorage.getItem('dummyAuthToken');
      if (token) {
        try {
          const tokenData = JSON.parse(token);
          return tokenData.expiry > Date.now();
        } catch (error) {
          return false;
        }
      }
      return false;
    }
    return true; // Not using dummy auth, so proceed with normal checks
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If using dummy auth and token is invalid, redirect to login
  if (isDummyAuth && !checkDummyAuthToken() && requireAuth) {
    toast.error('Your session has expired. Please log in again.');
    return <Navigate to="/login" replace />;
  }

  if (requireAuth && !user) {
    toast.error('Please log in to continue.');
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && userData?.role !== 'admin') {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }

  if (requireSeller && userData?.role !== 'seller' && userData?.role !== 'admin') {
    toast.error('Access denied. Seller privileges required.');
    return <Navigate to="/" replace />;
  }

  if (requireBuyer && userData?.role !== 'buyer' && userData?.role !== 'admin') {
    toast.error('Access denied. Buyer privileges required.');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
