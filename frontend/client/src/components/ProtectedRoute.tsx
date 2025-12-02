import { ReactNode } from 'react';
import { Redirect, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();
  const [location] = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to appropriate login if not authenticated
  if (!isAuthenticated) {
    // Determine which login page based on the URL
    if (location.startsWith('/admin')) {
      return <Redirect to="/admin/login" />;
    } else if (location.startsWith('/owner')) {
      return <Redirect to="/owner-login" />;
    }
    return <Redirect to="/login" />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && !hasRole(allowedRoles)) {
    // Redirect to correct portal based on user role
    if (user?.role === 'ADMIN' && !location.startsWith('/admin')) {
      return <Redirect to="/admin" />;
    } else if (user?.role === 'PROPERTY_OWNER' && !location.startsWith('/owner')) {
      return <Redirect to="/owner" />;
    } else if (user?.role === 'PROPERTY_MANAGER' && (location.startsWith('/admin') || location.startsWith('/owner'))) {
      return <Redirect to="/" />;
    }

    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
