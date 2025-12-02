import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already authenticated
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Validate National ID (10 digits)
    if (!/^\d{10}$/.test(formData.nationalId)) {
      toast({
        title: "Invalid National ID",
        description: "National ID must be exactly 10 digits",
        variant: "destructive",
      });
      return false;
    }

    // Validate phone (Saudi format 05XXXXXXXX)
    if (!/^05\d{8}$/.test(formData.phone)) {
      toast({
        title: "Invalid Phone",
        description: "Phone must be in format 05XXXXXXXX",
        variant: "destructive",
      });
      return false;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return false;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          nationalId: formData.nationalId,
          password: formData.password,
          role: 'PROPERTY_MANAGER',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      toast({
        title: "Account Created!",
        description: "Your account has been created successfully. Please sign in.",
      });

      // Redirect to login
      setLocation('/login');
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Unable to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
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
            Create your account
          </p>
        </div>

        {/* Signup Card */}
        <Card data-testid="card-signup">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign up</CardTitle>
            <CardDescription>
              Enter your details to create a Property Manager account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Mohammed"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    data-testid="input-firstName"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Ahmed"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    data-testid="input-lastName"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  data-testid="input-email"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="05XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData(prev => ({ ...prev, phone: value }));
                  }}
                  required
                  disabled={isLoading}
                  data-testid="input-phone"
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="nationalId" className="text-sm font-medium text-foreground">
                  National ID
                </label>
                <Input
                  id="nationalId"
                  name="nationalId"
                  type="text"
                  placeholder="10-digit National ID"
                  value={formData.nationalId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData(prev => ({ ...prev, nationalId: value }));
                  }}
                  required
                  disabled={isLoading}
                  data-testid="input-nationalId"
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.nationalId.length}/10 digits
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  data-testid="input-password"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  data-testid="input-confirmPassword"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-signup"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setLocation('/login')}
            className="text-muted-foreground"
            data-testid="button-back-to-login"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
