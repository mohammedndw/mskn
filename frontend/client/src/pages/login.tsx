import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already authenticated based on role
  if (isAuthenticated && user) {
    if (user.role === 'PROPERTY_MANAGER') {
      setLocation('/');
    } else if (user.role === 'ADMIN') {
      setLocation('/admin');
    } else if (user.role === 'PROPERTY_OWNER') {
      setLocation('/owner');
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);

      // Check role and redirect accordingly
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

      if (storedUser.role === 'ADMIN') {
        toast({
          title: "Wrong Portal",
          description: "Admins should use the Admin Portal. Redirecting...",
        });
        setLocation('/admin');
      } else if (storedUser.role === 'PROPERTY_OWNER') {
        toast({
          title: "Wrong Portal",
          description: "Property Owners should use the Owner Portal. Redirecting...",
        });
        setLocation('/owner');
      } else if (storedUser.role === 'PROPERTY_MANAGER') {
        setLocation('/');
      }
    } catch (error) {
      // Error handling is done in the login function (shows toast)
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
            <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Property Manager
          </h1>
          <p className="text-muted-foreground">
            Saudi Real Estate Management Platform
          </p>
        </div>

        {/* Login Card */}
        <Card data-testid="card-login">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access your account.{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => setLocation('/signup')}
              >
                Create an account
              </Button>
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
                  placeholder="name@example.com"
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
                className="w-full"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>

        {/* Owner Login Link */}
        <Card className="border-dashed">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Are you a Property Owner?
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLocation('/owner-login')}
              data-testid="button-owner-portal"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Access Owner Portal
            </Button>
          </CardContent>
        </Card>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-primary"
              onClick={() => setLocation('/signup')}
            >
              Sign up now
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
