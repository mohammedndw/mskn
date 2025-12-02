import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already authenticated as admin
  if (isAuthenticated && user?.role === 'ADMIN') {
    setLocation('/admin');
    return null;
  }

  // Redirect non-admins to their appropriate portal
  if (isAuthenticated && user?.role !== 'ADMIN') {
    if (user?.role === 'PROPERTY_MANAGER') {
      setLocation('/');
    } else if (user?.role === 'PROPERTY_OWNER') {
      setLocation('/owner');
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);

      // Check if user is admin after login
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.role !== 'ADMIN') {
        toast({
          title: "Access Denied",
          description: "This portal is for administrators only.",
          variant: "destructive",
        });
        // Clear auth and stay on admin login
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setIsLoading(false);
        return;
      }

      // Redirect to admin dashboard
      setLocation('/admin');
    } catch (error) {
      // Error handling is done in the login function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Portal
          </h1>
          <p className="text-muted-foreground">
            System Administration Dashboard
          </p>
        </div>

        {/* Login Card */}
        <Card data-testid="card-admin-login">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Administrator Login</CardTitle>
            <CardDescription>
              Enter your admin credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-email"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-password"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isLoading}
                data-testid="button-admin-login"
              >
                {isLoading ? 'Signing in...' : 'Sign in as Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          This portal is for system administrators only
        </p>
      </div>
    </div>
  );
}
