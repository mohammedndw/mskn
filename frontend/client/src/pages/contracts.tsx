import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, Building2, User, Calendar, DollarSign, Clock, Copy, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ContractForm from "@/components/contract-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import type { ContractWithDetails } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ContractsPage() {
  const { user, hasRole } = useAuth();
  const isPropertyOwner = hasRole('PROPERTY_OWNER');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contracts
  const { data: contractsData, isLoading: loadingContracts, error: contractsError } = useQuery({
    queryKey: ['/api/contracts', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);

      const response = await fetch(`/api/contracts?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch contracts');
      return response.json();
    },
  });

  // Fetch properties to filter by owner
  const { data: propertiesData, isLoading: loadingProperties } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties?pageSize=1000', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
    enabled: isPropertyOwner, // Only fetch if user is property owner
  });

  const allContracts = contractsData?.data || [];
  const allProperties = propertiesData?.data || [];

  // Filter contracts for Property Owner (only show contracts for their properties)
  let contracts = allContracts;
  if (isPropertyOwner && user) {
    const ownedPropertyIds = allProperties
      .filter((p: any) => p.ownerId === user.id)
      .map((p: any) => p.id);
    contracts = allContracts.filter((c: ContractWithDetails) =>
      ownedPropertyIds.includes(c.propertyId)
    );
  }

  const isLoading = loadingContracts || (isPropertyOwner && loadingProperties);
  const error = contractsError;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/contracts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      toast({
        title: "Success",
        description: "Contract deleted successfully",
      });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contract",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const calculateDaysRemaining = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysRemainingBadge = (daysRemaining: number) => {
    if (daysRemaining < 0) {
      return (
        <Badge variant="destructive" className="gap-1" data-testid="badge-expired">
          <Clock className="h-3 w-3" />
          Expired {Math.abs(daysRemaining)} days ago
        </Badge>
      );
    } else if (daysRemaining === 0) {
      return (
        <Badge variant="outline" className="gap-1 border-destructive text-destructive" data-testid="badge-expires-today">
          <Clock className="h-3 w-3" />
          Expires today
        </Badge>
      );
    } else if (daysRemaining <= 30) {
      return (
        <Badge variant="default" className="gap-1" data-testid="badge-expires-soon">
          <Clock className="h-3 w-3" />
          {daysRemaining} days left
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="gap-1" data-testid="badge-active">
          <Clock className="h-3 w-3" />
          {daysRemaining} days left
        </Badge>
      );
    }
  };

  const copyTenantPortalLink = async (accessToken: string) => {
    const baseUrl = window.location.origin;
    const tenantUrl = `${baseUrl}/tenant/${accessToken}`;
    
    try {
      await navigator.clipboard.writeText(tenantUrl);
      toast({
        title: "Link Copied!",
        description: "Tenant portal link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-contracts">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              {isPropertyOwner ? 'My Contracts' : 'Contracts'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isPropertyOwner ? 'View rental contracts for your properties' : 'Manage rental contracts'}
            </p>
          </div>

          {/* New Contract Button - Only for Property Managers and Admins */}
          {!isPropertyOwner && (
            <Button
              className="gap-2"
              onClick={() => setShowCreateModal(true)}
              data-testid="button-create-contract"
            >
              <Plus className="h-4 w-4" />
              New Contract
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search contracts by tenant name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-contracts"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-5 bg-muted rounded animate-pulse w-2/3" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-3 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <p className="text-destructive" data-testid="text-error">
                Error loading contracts: {error.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && contracts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4" data-testid="text-no-contracts">
                No contracts found. Create your first contract to get started.
              </p>
              <Button onClick={() => setShowCreateModal(true)} data-testid="button-create-first-contract">
                <Plus className="h-4 w-4 mr-2" />
                Create Contract
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contracts Grid */}
        {!isLoading && !error && contracts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-contracts">
            {contracts.map((contract: ContractWithDetails) => {
              const daysRemaining = calculateDaysRemaining(contract.endDate);
              
              return (
                <Card key={contract.id} className="hover-elevate" data-testid={`card-contract-${contract.id}`}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold" data-testid={`text-contract-property-${contract.id}`}>
                        {contract.property.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {contract.property.city}
                      </p>
                    </div>
                    {!isPropertyOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirmId(contract.id)}
                        data-testid={`button-delete-contract-${contract.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span data-testid={`text-contract-tenant-${contract.id}`}>{contract.tenant.firstName} {contract.tenant.lastName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span data-testid={`text-contract-price-${contract.id}`}>{formatPrice(contract.price)}/month</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span data-testid={`text-contract-dates-${contract.id}`}>
                        {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                      </span>
                    </div>
                    
                    <div className="pt-2" data-testid={`badge-container-${contract.id}`}>
                      {getDaysRemainingBadge(daysRemaining)}
                    </div>

                    {contract.tenantPortalToken && (
                      <div className="pt-3 mt-3 border-t border-border space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Link2 className="h-3 w-3" />
                          <span className="font-mono truncate" data-testid={`text-access-token-${contract.id}`}>
                            Tenant Portal Link
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => copyTenantPortalLink(contract.tenantPortalToken!)}
                          data-testid={`button-copy-tenant-link-${contract.id}`}
                        >
                          <Copy className="h-3 w-3" />
                          Copy Tenant Portal Link
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Contract Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <ContractForm onSuccess={() => setShowCreateModal(false)} />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contract.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
