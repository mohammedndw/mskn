import { useQuery } from "@tanstack/react-query";
import { Building2, Users, DollarSign, TrendingUp, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSAR } from "@/lib/currency";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeader } from "@/lib/auth";
import AdminDashboard from "./admin-dashboard";

export default function Dashboard() {
  const { hasRole, user } = useAuth();

  // Show Admin Dashboard for admin users
  if (hasRole('ADMIN')) {
    return <AdminDashboard />;
  }

  // Show Property Owner Dashboard for property owners
  if (hasRole('PROPERTY_OWNER')) {
    return <PropertyOwnerDashboard />;
  }

  // Property Manager Dashboard
  // Fetch properties for dashboard stats
  const { data: propertiesData } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties?pageSize=1000', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  // Fetch parent real estates
  const { data: parentsData } = useQuery({
    queryKey: ['/api/estates'],
    queryFn: async () => {
      const response = await fetch('/api/estates', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch parents');
      return response.json();
    },
  });

  const properties = propertiesData?.data || [];
  const parents = parentsData?.data || [];

  // Calculate stats
  const totalProperties = properties.length;
  const rentedProperties = properties.filter((p: any) => p.status === 'RENTED').length;
  const vacantProperties = properties.filter((p: any) => p.status === 'VACANT').length;
  const totalRevenue = properties
    .filter((p: any) => p.status === 'RENTED')
    .reduce((sum: number, p: any) => sum + parseFloat(p.cost || '0'), 0);
  const occupancyRate = totalProperties > 0 ? Math.round((rentedProperties / totalProperties) * 100) : 0;

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2" data-testid="text-dashboard-description">
          Overview of your property portfolio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-properties">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-properties">
              {totalProperties}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {parents.length} locations
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-rented-properties">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rented Properties</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-rented-properties">
              {rentedProperties}
            </div>
            <p className="text-xs text-muted-foreground">
              {occupancyRate}% occupancy rate
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-vacant-properties">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacant Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-vacant-properties">
              {vacantProperties}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for rent
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-revenue">
              {formatSAR(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From rented properties
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="card-property-status">
          <CardHeader>
            <CardTitle>Property Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Rented</span>
                <span className="text-sm font-medium text-green-600">{rentedProperties}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Vacant</span>
                <span className="text-sm font-medium text-orange-600">{vacantProperties}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Reserved</span>
                <span className="text-sm font-medium text-blue-600">
                  {properties.filter((p: any) => p.status === 'RESERVED').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-parent-estates">
          <CardHeader>
            <CardTitle>Parent Real Estates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {parents.slice(0, 5).map((parent: any) => (
                <div key={parent.id} className="flex items-center justify-between">
                  <span className="text-sm">{parent.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {parent.city}
                  </span>
                </div>
              ))}
              {parents.length === 0 && (
                <p className="text-sm text-muted-foreground">No parent real estates yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Property Owner Dashboard Component
function PropertyOwnerDashboard() {
  const { user } = useAuth();

  // Fetch properties owned by this user
  const { data: propertiesData, isLoading: loadingProperties } = useQuery({
    queryKey: ['/api/properties', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/properties?pageSize=1000', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  // Fetch contracts for owned properties
  const { data: contractsData, isLoading: loadingContracts } = useQuery({
    queryKey: ['/api/contracts', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/contracts', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch contracts');
      return response.json();
    },
  });

  // Fetch tenants
  const { data: tenantsData, isLoading: loadingTenants } = useQuery({
    queryKey: ['/api/tenants', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/tenants', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch tenants');
      return response.json();
    },
  });

  const allProperties = propertiesData?.data || [];
  const allContracts = contractsData?.data || [];
  const allTenants = tenantsData?.data || [];

  // Filter properties owned by this user
  const properties = allProperties.filter((p: any) => p.ownerId === user?.id);

  // Filter contracts for owned properties
  const propertyIds = properties.map((p: any) => p.id);
  const contracts = allContracts.filter((c: any) => propertyIds.includes(c.propertyId));

  // Get unique tenant IDs from contracts
  const tenantIds = [...new Set(contracts.map((c: any) => c.tenantId))];
  const tenants = allTenants.filter((t: any) => tenantIds.includes(t.id));

  // Calculate stats
  const totalProperties = properties.length;
  const rentedProperties = properties.filter((p: any) => p.status === 'RENTED').length;
  const availableProperties = properties.filter((p: any) => p.status === 'AVAILABLE').length;
  const reservedProperties = properties.filter((p: any) => p.status === 'RESERVED').length;
  const activeContracts = contracts.filter((c: any) => {
    const endDate = new Date(c.endDate);
    return endDate >= new Date();
  }).length;
  const totalTenants = tenants.length;
  const occupancyRate = totalProperties > 0 ? Math.round((rentedProperties / totalProperties) * 100) : 0;

  const isLoading = loadingProperties || loadingContracts || loadingTenants;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-owner-dashboard">
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
          Property Owner Dashboard
        </h1>
        <p className="text-muted-foreground mt-2" data-testid="text-dashboard-description">
          View your property portfolio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-properties">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-properties">
              {totalProperties}
            </div>
            <p className="text-xs text-muted-foreground">
              Properties you own
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-rented-properties">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rented</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-rented-properties">
              {rentedProperties}
            </div>
            <p className="text-xs text-muted-foreground">
              {occupancyRate}% occupancy
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-contracts">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-active-contracts">
              {activeContracts}
            </div>
            <p className="text-xs text-muted-foreground">
              Current rental agreements
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-tenants">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-tenants">
              {totalTenants}
            </div>
            <p className="text-xs text-muted-foreground">
              Renting your properties
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Property Status Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="card-property-status">
          <CardHeader>
            <CardTitle>Property Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <span className="text-sm font-medium">Rented</span>
                <span className="text-lg font-bold text-green-600">{rentedProperties}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <span className="text-sm font-medium">Available</span>
                <span className="text-lg font-bold text-orange-600">{availableProperties}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <span className="text-sm font-medium">Reserved</span>
                <span className="text-lg font-bold text-blue-600">{reservedProperties}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-recent-contracts">
          <CardHeader>
            <CardTitle>Recent Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contracts.slice(0, 5).map((contract: any) => (
                <div key={contract.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {contract.property?.name || 'Property'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contract.tenant?.firstName} {contract.tenant?.lastName}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {new Date(contract.endDate) >= new Date() ? 'Active' : 'Expired'}
                  </Badge>
                </div>
              ))}
              {contracts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No contracts yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}