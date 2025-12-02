import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Building2, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import PropertyCard from "@/components/property-card";
import SearchAndFilters from "@/components/search-and-filters";
import ParentForm from "@/components/parent-form";
import PropertyForm from "@/components/property-form";
import PropertyDetailModal from "@/components/property-detail-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeader } from "@/lib/auth";
import type { PropertyWithDetails, PropertyStatus, ParentRealEstate } from "@/types";

export default function PropertiesPage() {
  const { user, hasRole } = useAuth();
  const isPropertyOwner = hasRole('PROPERTY_OWNER');
  const [, navigate] = useLocation();
  const [showParentModal, setShowParentModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithDetails | null>(null);
  const [detailModalMode, setDetailModalMode] = useState<'view' | 'edit'>('view');
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Use state to track search params directly (instead of relying on URL)
  const [searchParams, setSearchParams] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || '',
      status: (params.get('status') as PropertyStatus) || undefined,
      type: (params.get('type') as 'unit' | 'parent' | 'all') || 'all',
      page: parseInt(params.get('page') || '1', 10),
      pageSize: parseInt(params.get('pageSize') || '20', 10),
      sort: params.get('sort') || 'createdAt',
      dir: (params.get('dir') as 'asc' | 'desc') || 'desc',
    };
  });

  const handleViewProperty = (property: PropertyWithDetails) => {
    setSelectedProperty(property);
    setDetailModalMode('view');
    setShowDetailModal(true);
  };

  const handleEditProperty = (property: PropertyWithDetails) => {
    setSelectedProperty(property);
    setDetailModalMode('edit');
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProperty(null);
  };

  // Update URL and state when params change
  const updateParams = (newParams: Partial<typeof searchParams>) => {
    const merged = { ...searchParams, ...newParams };

    // Update state immediately (this triggers re-render and re-fetch)
    setSearchParams(merged);

    // Also update URL for bookmarking/sharing
    const params = new URLSearchParams();
    if (merged.q) params.set('q', merged.q);
    if (merged.status) params.set('status', merged.status);
    if (merged.type !== 'all') params.set('type', merged.type);
    if (merged.page !== 1) params.set('page', merged.page.toString());
    if (merged.pageSize !== 20) params.set('pageSize', merged.pageSize.toString());
    if (merged.sort !== 'createdAt') params.set('sort', merged.sort);
    if (merged.dir !== 'desc') params.set('dir', merged.dir);

    const queryString = params.toString();
    navigate(`/properties${queryString ? `?${queryString}` : ''}`, { replace: true });
  };

  // Fetch properties (units)
  const { data: propertiesData, isLoading: isLoadingProperties, error: propertiesError } = useQuery({
    queryKey: ['/api/properties', searchParams.q, searchParams.status, searchParams.page, searchParams.pageSize, searchParams.sort, searchParams.dir],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchParams.q) params.set('q', searchParams.q);
      if (searchParams.status) params.set('status', searchParams.status);
      params.set('page', searchParams.page.toString());
      params.set('pageSize', searchParams.pageSize.toString());
      params.set('sort', searchParams.sort);
      params.set('dir', searchParams.dir);

      const response = await fetch(`/api/properties?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
    enabled: searchParams.type === 'unit' || searchParams.type === 'all',
    staleTime: 0,
  });

  // Fetch parent real estates
  const { data: parentsData, isLoading: isLoadingParents, error: parentsError } = useQuery({
    queryKey: ['/api/estates', searchParams.q],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchParams.q) params.set('q', searchParams.q);

      const response = await fetch(`/api/estates?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch parent real estates');
      return response.json();
    },
    enabled: searchParams.type === 'parent' || searchParams.type === 'all',
  });

  // Only use data when the corresponding query is enabled AND loaded
  // Important: React Query returns cached data even when enabled=false,
  // so we must explicitly check the filter type to prevent showing stale data
  const shouldShowProperties = searchParams.type === 'unit' || searchParams.type === 'all';
  const shouldShowParents = searchParams.type === 'parent' || searchParams.type === 'all';
  
  // Only use data when both enabled AND we have the data for the current filters
  const properties = (shouldShowProperties && propertiesData) ? (propertiesData.data || []) : [];
  const parents = (shouldShowParents && parentsData) ? (parentsData.data || []) : [];
  const meta = (shouldShowProperties && propertiesData) ? propertiesData.meta : undefined;
  
  const isLoading = (shouldShowProperties && isLoadingProperties) || (shouldShowParents && isLoadingParents);
  const error = propertiesError || parentsError;

  // Combine and filter data based on type
  const displayItems = useMemo(() => {
    // Filter properties for Property Owner (only show owned properties)
    let filteredProperties = properties;
    if (isPropertyOwner && user) {
      filteredProperties = properties.filter((p: PropertyWithDetails) => p.ownerId === user.id);
    }

    if (searchParams.type === 'unit') {
      return filteredProperties.map((p: PropertyWithDetails) => ({ ...p, itemType: 'unit' as const }));
    } else if (searchParams.type === 'parent') {
      // Property Owners don't have parent estates
      if (isPropertyOwner) return [];
      return parents.map((p: ParentRealEstate) => ({ ...p, itemType: 'parent' as const }));
    } else {
      // Show both - but if status filter is active, only show units (parents don't have status)
      if (searchParams.status) {
        return filteredProperties.map((p: PropertyWithDetails) => ({ ...p, itemType: 'unit' as const }));
      }
      // Property Owners don't see parent estates
      if (isPropertyOwner) {
        return filteredProperties.map((p: PropertyWithDetails) => ({ ...p, itemType: 'unit' as const }));
      }
      return [
        ...filteredProperties.map((p: PropertyWithDetails) => ({ ...p, itemType: 'unit' as const })),
        ...parents.map((p: ParentRealEstate) => ({ ...p, itemType: 'parent' as const })),
      ];
    }
  }, [properties, parents, searchParams.type, searchParams.status, isPropertyOwner, user]);

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-properties">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              {isPropertyOwner ? 'My Properties' : 'Properties'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isPropertyOwner ? 'View your property portfolio' : 'Manage your property portfolio'}
            </p>
          </div>

          {/* Create Buttons - Only for Property Managers and Admins */}
          {!isPropertyOwner && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowParentModal(true)}
                data-testid="button-create-parent"
              >
                <Building2 className="h-4 w-4" />
                Create Parent Estate
              </Button>
              <Button
                className="gap-2"
                onClick={() => setShowPropertyModal(true)}
                data-testid="button-create-property"
              >
                <Plus className="h-4 w-4" />
                Create Property
              </Button>
            </div>
          )}

                  </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <SearchAndFilters
          searchParams={searchParams}
          onParamsChange={updateParams}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="w-full h-48 bg-muted animate-pulse" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
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
                Error loading properties: {error.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Properties Grid */}
        {!isLoading && !error && displayItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8" data-testid="grid-properties">
              {displayItems.map((item: any) => {
                if (item.itemType === 'unit') {
                  return (
                    <PropertyCard
                      key={item.id}
                      property={item}
                      readOnly={isPropertyOwner}
                      onView={handleViewProperty}
                      onEdit={handleEditProperty}
                    />
                  );
                } else {
                  // Parent real estate card
                  const parent = item as ParentRealEstate;
                  return (
                    <Card key={parent.id} className="hover-elevate" data-testid={`card-parent-${parent.id}`}>
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2" data-testid={`text-parent-name-${parent.id}`}>
                              {parent.name}
                            </h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p data-testid={`text-parent-location-${parent.id}`}>
                                {parent.region} • {parent.city}
                              </p>
                              {parent.street && (
                                <p data-testid={`text-parent-street-${parent.id}`}>
                                  {parent.street}
                                </p>
                              )}
                              <p className="text-xs" data-testid={`text-parent-address-${parent.id}`}>
                                {parent.address}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                            <Building className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        {parent.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-parent-description-${parent.id}`}>
                            {parent.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                }
              })}
            </div>

            {/* Pagination - show for units and all (since all includes paginated units) */}
            {(searchParams.type === 'unit' || searchParams.type === 'all') && meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between" data-testid="pagination-container">
                <div className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                  {searchParams.type === 'all' 
                    ? `Showing page ${meta.page} of ${meta.totalPages} (units paginated, ${parents.length} parents shown)`
                    : `Showing ${((meta.page - 1) * meta.pageSize) + 1} to ${Math.min(meta.page * meta.pageSize, meta.total)} of ${meta.total} properties`
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateParams({ page: meta.page - 1 })}
                    disabled={meta.page <= 1}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, meta.totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, meta.page - 2) + i;
                      if (pageNum > meta.totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === meta.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateParams({ page: pageNum })}
                          className="w-8 h-8 p-0"
                          data-testid={`button-page-${pageNum}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateParams({ page: meta.page + 1 })}
                    disabled={meta.page >= meta.totalPages}
                    data-testid="button-next-page"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayItems.length === 0 && (
          <Card className="text-center py-12" data-testid="empty-state">
            <CardContent className="max-w-md mx-auto">
              <div className="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-empty-title">
                {searchParams.q || searchParams.status ? 'No items found' : 'No items yet'}
              </h3>
              <p className="text-muted-foreground mb-6" data-testid="text-empty-description">
                {searchParams.q || searchParams.status 
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first property or parent real estate.'
                }
              </p>
              <Button onClick={() => setShowPropertyModal(true)} data-testid="button-empty-create">
                <Plus className="h-4 w-4 mr-2" />
                Create Property
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Modals */}
      <Dialog open={showParentModal} onOpenChange={setShowParentModal}>
        <ParentForm onClose={() => setShowParentModal(false)} />
      </Dialog>

      <Dialog open={showPropertyModal} onOpenChange={setShowPropertyModal}>
        <PropertyForm onClose={() => setShowPropertyModal(false)} />
      </Dialog>

      {/* Property Detail Modal (View/Edit) */}
      <PropertyDetailModal
        property={selectedProperty}
        mode={detailModalMode}
        open={showDetailModal}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
