import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCheck, Plus, RefreshCw, Power, Trash2, MoreVertical, Calendar, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatSAR } from "@/lib/currency";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxProperties: number;
}

interface UserSubscription {
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  plan: SubscriptionPlan;
}

export default function UserSubscriptionsPage() {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all user subscriptions
  const { data: subscriptionsResponse, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['/api/user-subscriptions'],
    queryFn: async () => {
      const response = await fetch('/api/user-subscriptions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      return response.json();
    },
  });

  // Fetch all users for assignment
  const { data: usersResponse } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  // Fetch all plans for assignment
  const { data: plansResponse } = useQuery({
    queryKey: ['/api/subscription-plans'],
    queryFn: async () => {
      const response = await fetch('/api/subscription-plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch plans');
      return response.json();
    },
  });

  const subscriptions: UserSubscription[] = subscriptionsResponse?.data || [];
  const users: User[] = usersResponse?.data || [];
  const plans: SubscriptionPlan[] = plansResponse?.data || [];

  // Assign subscription mutation
  const assignSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, planId }: { userId: string; planId: string }) => {
      return await apiRequest('POST', '/api/user-subscriptions', { userId, planId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-subscriptions'] });
      setIsAssignDialogOpen(false);
      setSelectedUserId('');
      setSelectedPlanId('');
      toast({
        title: 'Subscription assigned',
        description: 'User subscription has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  // Renew subscription mutation
  const renewSubscriptionMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('PATCH', `/api/user-subscriptions/${userId}/renew`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-subscriptions'] });
      toast({
        title: 'Subscription renewed',
        description: 'User subscription has been renewed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  // Toggle subscription status mutation
  const toggleSubscriptionMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('PATCH', `/api/user-subscriptions/${userId}/toggle`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-subscriptions'] });
      toast({
        title: 'Status updated',
        description: 'Subscription status has been toggled successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  // Remove subscription mutation
  const removeSubscriptionMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('DELETE', `/api/user-subscriptions/${userId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-subscriptions'] });
      setIsRemoveDialogOpen(false);
      setSelectedSubscription(null);
      toast({
        title: 'Subscription removed',
        description: 'User subscription has been removed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    assignSubscriptionMutation.mutate({ userId: selectedUserId, planId: selectedPlanId });
  };

  const handleRenew = (subscription: UserSubscription) => {
    renewSubscriptionMutation.mutate(subscription.userId);
  };

  const handleToggle = (subscription: UserSubscription) => {
    toggleSubscriptionMutation.mutate(subscription.userId);
  };

  const handleRemove = () => {
    if (!selectedSubscription) return;
    removeSubscriptionMutation.mutate(selectedSubscription.userId);
  };

  const openRemoveDialog = (subscription: UserSubscription) => {
    setSelectedSubscription(subscription);
    setIsRemoveDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const daysUntilExpiry = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isLoadingSubscriptions) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  const activeSubscriptions = subscriptions.filter(s => s.isActive && !isExpired(s.endDate));
  const expiredSubscriptions = subscriptions.filter(s => isExpired(s.endDate));
  const inactiveSubscriptions = subscriptions.filter(s => !s.isActive && !isExpired(s.endDate));

  return (
    <div className="space-y-6" data-testid="page-user-subscriptions">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            User Subscriptions
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage user subscription assignments
          </p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Assign Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Subscription</DialogTitle>
              <DialogDescription>
                Assign a subscription plan to a user
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssign} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-select">User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId} required>
                  <SelectTrigger id="user-select">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-select">Subscription Plan</Label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId} required>
                  <SelectTrigger id="plan-select">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.filter(p => p.isActive).map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {formatSAR(plan.price)} / {plan.durationDays} days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={assignSubscriptionMutation.isPending || !selectedUserId || !selectedPlanId}>
                  {assignSubscriptionMutation.isPending ? 'Assigning...' : 'Assign'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-xs text-muted-foreground">All user subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">Need renewal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Power className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inactiveSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">Manually disabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>User Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptions.map((subscription) => {
              const expired = isExpired(subscription.endDate);
              const daysLeft = daysUntilExpiry(subscription.endDate);
              const expiringWithin7Days = daysLeft <= 7 && daysLeft > 0;

              return (
                <div
                  key={subscription.userId}
                  className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {subscription.user.firstName} {subscription.user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {subscription.user.email}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {subscription.plan.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {expired ? (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        Expired
                      </Badge>
                    ) : expiringWithin7Days ? (
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                        Expires in {daysLeft}d
                      </Badge>
                    ) : subscription.isActive ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Active ({daysLeft}d left)
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                        Inactive
                      </Badge>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRenew(subscription)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Renew
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle(subscription)}>
                          <Power className="mr-2 h-4 w-4" />
                          {subscription.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openRemoveDialog(subscription)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}

            {subscriptions.length === 0 && (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No subscriptions found</p>
                <p className="text-sm text-muted-foreground mt-2">Assign subscriptions to users to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="py-4">
              <p className="text-sm">
                <strong>User:</strong> {selectedSubscription.user.firstName} {selectedSubscription.user.lastName}
              </p>
              <p className="text-sm">
                <strong>Plan:</strong> {selectedSubscription.plan.name}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsRemoveDialogOpen(false); setSelectedSubscription(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={removeSubscriptionMutation.isPending}>
              {removeSubscriptionMutation.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
