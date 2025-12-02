import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, Phone, CreditCard, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import TenantForm from "@/components/tenant-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import type { Tenant } from "@/types";
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

export default function TenantsPage() {
  const { user, hasRole } = useAuth();
  const isPropertyOwner = hasRole('PROPERTY_OWNER');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tenants
  const { data: tenantsData, isLoading: loadingTenants, error: tenantsError } = useQuery({
    queryKey: ['/api/tenants', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);

      const response = await fetch(`/api/tenants?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch tenants');
      return response.json();
    },
  });

  // Fetch contracts to filter tenants by property owner
  const { data: contractsData, isLoading: loadingContracts } = useQuery({
    queryKey: ['/api/contracts'],
    queryFn: async () => {
      const response = await fetch('/api/contracts', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch contracts');
      return response.json();
    },
    enabled: isPropertyOwner, // Only fetch if user is property owner
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

  const allTenants = tenantsData?.data || [];
  const allContracts = contractsData?.data || [];
  const allProperties = propertiesData?.data || [];

  // Filter tenants for Property Owner (only show tenants renting their properties)
  let tenants = allTenants;
  if (isPropertyOwner && user) {
    const ownedPropertyIds = allProperties
      .filter((p: any) => p.ownerId === user.id)
      .map((p: any) => p.id);
    const tenantIdsFromContracts = [
      ...new Set(
        allContracts
          .filter((c: any) => ownedPropertyIds.includes(c.propertyId))
          .map((c: any) => c.tenantId)
      ),
    ];
    tenants = allTenants.filter((t: Tenant) => tenantIdsFromContracts.includes(t.id));
  }

  const isLoading = loadingTenants || (isPropertyOwner && (loadingContracts || loadingProperties));
  const error = tenantsError;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/tenants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      toast({
        title: "Success",
        description: "Tenant deleted successfully",
      });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tenant",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-tenants">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              {isPropertyOwner ? 'My Tenants' : 'Tenants'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isPropertyOwner ? 'View tenants renting your properties' : 'Manage your tenants'}
            </p>
          </div>

          {/* Add Tenant Button - Only for Property Managers and Admins */}
          {!isPropertyOwner && (
            <Button
              className="gap-2"
              onClick={() => setShowCreateModal(true)}
              data-testid="button-create-tenant"
            >
              <Plus className="h-4 w-4" />
              Add Tenant
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
              placeholder="Search tenants by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-tenants"
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
                Error loading tenants: {error.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tenants Grid */}
        {!isLoading && !error && tenants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-tenants">
            {tenants.map((tenant: Tenant) => (
              <Card key={tenant.id} className="hover-elevate" data-testid={`card-tenant-${tenant.id}`}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg font-semibold" data-testid={`text-tenant-name-${tenant.id}`}>
                    {tenant.firstName} {tenant.lastName}
                  </CardTitle>
                  {!isPropertyOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmId(tenant.id)}
                      data-testid={`button-delete-tenant-${tenant.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span data-testid={`text-tenant-phone-${tenant.id}`}>{tenant.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span data-testid={`text-tenant-nationalid-${tenant.id}`}>{tenant.nationalId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span data-testid={`text-tenant-birthdate-${tenant.id}`}>{formatDate(tenant.birthDate)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && tenants.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4" data-testid="text-empty-state">
                {searchQuery ? 'No tenants found matching your search.' : 'No tenants yet. Add your first tenant to get started.'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCreateModal(true)} data-testid="button-empty-add-tenant">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tenant
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Create Tenant Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <TenantForm onClose={() => setShowCreateModal(false)} />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tenant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
