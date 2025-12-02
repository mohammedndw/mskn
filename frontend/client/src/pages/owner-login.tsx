import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OwnerLogin() {
  const [nationalId, setNationalId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { ownerLogin, isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already authenticated as property owner
  if (isAuthenticated && user?.role === 'PROPERTY_OWNER') {
    setLocation('/owner');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate National ID format (10 digits)
    if (!/^\d{10}$/.test(nationalId)) {
      toast({
        title: "Invalid National ID",
        description: "National ID must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await ownerLogin(nationalId);
      // Redirect to owner portal after successful login
      setLocation('/owner');
    } catch (error: any) {
      toast({
        title: "Access Denied",
        description: error.message || "Unable to access owner portal",
        variant: "destructive",
      });
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
            Property Owner Portal
          </h1>
          <p className="text-muted-foreground">
            Access your property information
          </p>
        </div>

        {/* Login Card */}
        <Card data-testid="card-owner-login">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Owner Access</CardTitle>
            <CardDescription>
              Enter your National ID to view your properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nationalId" className="text-sm font-medium text-foreground">
                  National ID
                </label>
                <Input
                  id="nationalId"
                  type="text"
                  placeholder="Enter your 10-digit National ID"
                  value={nationalId}
                  onChange={(e) => {
                    // Only allow digits and max 10 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setNationalId(value);
                  }}
                  required
                  disabled={isLoading}
                  data-testid="input-national-id"
                  autoComplete="off"
                  maxLength={10}
                  pattern="\d{10}"
                  className="text-center text-lg tracking-widest"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {nationalId.length}/10 digits
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || nationalId.length !== 10}
                data-testid="button-owner-login"
              >
                {isLoading ? 'Verifying...' : 'Access Portal'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to main login */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setLocation('/login')}
            className="text-muted-foreground"
            data-testid="button-back-to-login"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff Login
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          You can only access if you have properties assigned to your account
        </p>
      </div>
    </div>
  );
}
