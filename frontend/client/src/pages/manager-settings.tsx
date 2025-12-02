import { useQuery } from "@tanstack/react-query";
import {
  Settings as SettingsIcon,
  User,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  FileText,
  Users,
  Wrench
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeader } from "@/lib/auth";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  maxProperties: number;
  maxTenants: number;
  maxContracts: number;
  features: string[];
  isActive: boolean;
}

interface UserSubscription {
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  daysRemaining: number;
  isExpired: boolean;
  plan: SubscriptionPlan;
}

interface DashboardStats {
  properties: { total: number };
  tenants: { total: number };
  contracts: { total: number; active: number };
  maintenance: { total: number; pending: number };
}

export default function ManagerSettings() {
  const { user } = useAuth();

  // Fetch user subscription
  const { data: subscriptionResponse, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/user-subscriptions/my-subscription'],
    queryFn: async () => {
      const response = await fetch('/api/user-subscriptions/my-subscription', {
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        if (response.status === 404) {
          return { data: null };
        }
        throw new Error('Failed to fetch subscription');
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch dashboard stats for usage
  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/manager'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/manager', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const subscription: UserSubscription | null = subscriptionResponse?.data;
  const stats: DashboardStats | null = statsResponse?.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return { label: 'No Subscription', variant: 'destructive' as const, icon: XCircle };
    if (subscription.isExpired) return { label: 'Expired', variant: 'destructive' as const, icon: XCircle };
    if (!subscription.isActive) return { label: 'Inactive', variant: 'secondary' as const, icon: AlertTriangle };
    if (subscription.daysRemaining <= 7) return { label: 'Expiring Soon', variant: 'secondary' as const, icon: AlertTriangle };
    return { label: 'Active', variant: 'default' as const, icon: CheckCircle2 };
  };

  const status = getSubscriptionStatus();
  const StatusIcon = status.icon;

  const isLoading = subscriptionLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-manager-settings">
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-settings-title">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2" data-testid="text-settings-description">
          Manage your account and subscription
        </p>
      </div>

      {/* Profile Section */}
      <Card data-testid="card-profile">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-lg font-semibold">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <Badge variant="default">Property Manager</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                <Badge variant={user?.isBlocked ? "destructive" : "outline"}>
                  {user?.isBlocked ? "Blocked" : "Active"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card data-testid="card-subscription">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Plan
              </CardTitle>
              <CardDescription>Your current subscription details</CardDescription>
            </div>
            <Badge variant={status.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-6">
              {/* Plan Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{subscription.plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {subscription.plan.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(subscription.plan.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      / {subscription.plan.durationInDays} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{formatDate(subscription.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{formatDate(subscription.endDate)}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 border rounded-lg ${
                  subscription.daysRemaining <= 7 ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''
                }`}>
                  <Clock className={`h-5 w-5 ${
                    subscription.daysRemaining <= 7 ? 'text-orange-500' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                    <p className={`font-medium ${
                      subscription.daysRemaining <= 7 ? 'text-orange-600' : ''
                    }`}>
                      {subscription.daysRemaining} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subscription Progress</span>
                  <span className="text-muted-foreground">
                    {Math.round(((subscription.plan.durationInDays - subscription.daysRemaining) / subscription.plan.durationInDays) * 100)}%
                  </span>
                </div>
                <Progress
                  value={((subscription.plan.durationInDays - subscription.daysRemaining) / subscription.plan.durationInDays) * 100}
                  className="h-2"
                />
              </div>

              <Separator />

              {/* Plan Features */}
              <div>
                <h4 className="font-semibold mb-3">Plan Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Max Properties</p>
                      <p className="font-medium">
                        {subscription.plan.maxProperties === -1 ? 'Unlimited' : subscription.plan.maxProperties}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Users className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Max Tenants</p>
                      <p className="font-medium">
                        {subscription.plan.maxTenants === -1 ? 'Unlimited' : subscription.plan.maxTenants}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Max Contracts</p>
                      <p className="font-medium">
                        {subscription.plan.maxContracts === -1 ? 'Unlimited' : subscription.plan.maxContracts}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Wrench className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Maintenance Requests</p>
                      <p className="font-medium">Included</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Features */}
              {subscription.plan.features && subscription.plan.features.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Additional Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {subscription.plan.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground">
                You don't have an active subscription plan. Please contact the administrator to get a subscription.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      {stats && subscription && (
        <Card data-testid="card-usage">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Usage Statistics
            </CardTitle>
            <CardDescription>Your current usage vs plan limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Properties Usage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Properties</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.properties?.total || 0} / {subscription.plan.maxProperties === -1 ? '∞' : subscription.plan.maxProperties}
                  </span>
                </div>
                <Progress
                  value={subscription.plan.maxProperties === -1 ? 0 : ((stats.properties?.total || 0) / subscription.plan.maxProperties) * 100}
                  className="h-2"
                />
              </div>

              {/* Tenants Usage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tenants</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.tenants?.total || 0} / {subscription.plan.maxTenants === -1 ? '∞' : subscription.plan.maxTenants}
                  </span>
                </div>
                <Progress
                  value={subscription.plan.maxTenants === -1 ? 0 : ((stats.tenants?.total || 0) / subscription.plan.maxTenants) * 100}
                  className="h-2"
                />
              </div>

              {/* Contracts Usage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Contracts</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.contracts?.total || 0} / {subscription.plan.maxContracts === -1 ? '∞' : subscription.plan.maxContracts}
                  </span>
                </div>
                <Progress
                  value={subscription.plan.maxContracts === -1 ? 0 : ((stats.contracts?.total || 0) / subscription.plan.maxContracts) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Support */}
      <Card className="border-dashed" data-testid="card-support">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-2">
                If you need to upgrade your plan, change subscription, or have any questions, please contact the system administrator.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Email:</strong> support@propmanage.com
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
