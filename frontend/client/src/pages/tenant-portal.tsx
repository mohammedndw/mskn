import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency, getDaysUntil, isContractExpired, isContractExpiringSoon, formatDateRelative } from "@/lib/utils-shared";
import { FileText, Wrench, Home, Calendar, MapPin, User, Phone, CreditCard, Clock } from "lucide-react";
import type { ContractWithDetails, MaintenanceRequest } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { MaintenanceRequestForm } from "@/components/maintenance-request-form";

export async function tenantApiRequest(endpoint: string, token: string, options?: RequestInit) {
  const res = await fetch(endpoint, {
    ...(options ?? {}),
    headers: {
      ...(options?.headers ?? {}),
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return res.json();
}

function ContractOverview({ contract }: { contract: ContractWithDetails }) {
  const daysUntilEnd = getDaysUntil(contract.endDate);
  const isExpired = isContractExpired(contract.endDate);
  const isExpiringSoon = isContractExpiringSoon(contract.endDate);

  return (
    <div className="space-y-6">
      <Card data-testid="card-contract-overview">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl" data-testid="text-property-name">
                {contract.property.name}
              </CardTitle>
              <CardDescription data-testid="text-property-address">
                {contract.property.address || `${contract.property.street}, ${contract.property.neighborhood}`}
              </CardDescription>
            </div>
            <Badge 
              variant={isExpired ? "destructive" : isExpiringSoon ? "secondary" : "default"}
              data-testid="badge-contract-status"
            >
              {isExpired ? "Expired" : isExpiringSoon ? "Expiring Soon" : "Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tenant</p>
                  <p className="text-base" data-testid="text-tenant-name">{contract.tenant.firstName} {contract.tenant.lastName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-base" data-testid="text-tenant-phone">{contract.tenant.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Rent</p>
                  <p className="text-lg font-semibold" data-testid="text-contract-price">
                    {formatCurrency(contract.price)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contract Period</p>
                  <p className="text-base" data-testid="text-contract-period">
                    {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Property Details</p>
                  <div className="text-base space-y-1">
                    {contract.property.numberOfRooms && (
                      <p>{contract.property.numberOfRooms} Rooms</p>
                    )}
                    {contract.property.numberOfBathrooms && (
                      <p>{contract.property.numberOfBathrooms} Bathrooms</p>
                    )}
                    {contract.property.sqm && (
                      <p>{contract.property.sqm} m²</p>
                    )}
                  </div>
                </div>
              </div>

              {!isExpired && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Time Remaining</p>
                    <p className="text-base" data-testid="text-days-remaining">
                      {daysUntilEnd} days
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ContractDetails({ contract }: { contract: ContractWithDetails }) {
  return (
    <div className="space-y-4">
      <ContractOverview contract={contract} />
      
      <Card data-testid="card-location-details">
        <CardHeader>
          <CardTitle>Location Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contract.property?.region && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Region</p>
                  <p className="text-base">{contract.property.region}</p>
                </div>
              </div>
            )}
            {contract.property?.city && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">City</p>
                  <p className="text-base">{contract.property.city}</p>
                </div>
              </div>
            )}
            {contract.property?.neighborhood && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Neighborhood</p>
                  <p className="text-base">{contract.property.neighborhood}</p>
                </div>
              </div>
            )}
            {contract.property?.street && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Street</p>
                  <p className="text-base">{contract.property.street}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {contract.property?.description && (
        <Card data-testid="card-property-description">
          <CardHeader>
            <CardTitle>Property Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">{contract.property.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MaintenanceRequests({ contractId, token }: { contractId: string; token: string }) {
  const { data: requests, isLoading } = useQuery<MaintenanceRequest[]>({
    queryKey: ['/api/tenant-portal/maintenance', token],
    queryFn: async () => {
      const json = await tenantApiRequest(`/api/tenant-portal/contracts/${contractId}`, token);
      // The maintenance requests are included in the contract details
      return json.data?.maintenanceRequests || [];
    },
  });

  const statusColors = {
    PENDING: "secondary",
    IN_PROGRESS: "default",
    COMPLETED: "outline",
    CANCELLED: "destructive",
  } as const;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Maintenance Requests</CardTitle>
              <CardDescription>Submit and track your maintenance requests</CardDescription>
            </div>
            <MaintenanceRequestForm contractId={contractId} accessToken={token} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !requests || requests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No maintenance requests yet. Click "New Request" to submit one.
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request: any) => (
                <Card key={request.id} data-testid={`card-request-${request.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg" data-testid="text-request-title">
                            {request.title}
                          </CardTitle>
                          <Badge variant={statusColors[request.status as keyof typeof statusColors]} data-testid="badge-request-status">
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3" />
                            {formatDateRelative(request.createdAt)}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                    {request.images && Array.isArray(request.images) && request.images.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {request.images.map((url: string, idx: number) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Request photo ${idx + 1}`}
                            className="w-full h-20 object-cover rounded-md cursor-pointer hover-elevate"
                            onClick={() => window.open(url, '_blank')}
                            data-testid={`img-request-photo-${idx}`}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TenantPortal() {
  const { token } = useParams<{ token: string }>();

  const { data: portalData, isLoading, error } = useQuery<{ tenant: any; contracts: ContractWithDetails[] }>({
    queryKey: ['/api/tenant-portal/contracts', token],
    queryFn: async () => {
      const json = await tenantApiRequest('/api/tenant-portal/contracts', token!);
      return json.data;
    },
    enabled: !!token,
  });

  // Get the first contract (main contract for this portal link)
  const contract = portalData?.contracts?.[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Contract Not Found</CardTitle>
            <CardDescription>
              The contract link you're trying to access is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please contact your property manager for a valid access link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold" data-testid="text-portal-title">Tenant Portal</h1>
          <p className="text-muted-foreground mt-1" data-testid="text-portal-subtitle">
            View your contract and submit maintenance requests
          </p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="contract" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2" data-testid="tabs-navigation">
            <TabsTrigger value="contract" data-testid="tab-contract">
              <FileText className="w-4 h-4 mr-2" />
              Contract
            </TabsTrigger>
            <TabsTrigger value="maintenance" data-testid="tab-maintenance">
              <Wrench className="w-4 h-4 mr-2" />
              Maintenance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="contract" className="mt-6">
            <ContractDetails contract={contract} />
          </TabsContent>
          
          <TabsContent value="maintenance" className="mt-6">
            <MaintenanceRequests contractId={contract.id} token={token!} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
