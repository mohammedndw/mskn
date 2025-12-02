import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { getAuthHeader } from "@/lib/auth";
import ParentForm from "@/components/parent-form";

export default function ParentEstatesPage() {
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch parent real estates
  const { data: parentsData, isLoading } = useQuery({
    queryKey: ['/api/estates', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('q', search);

      const response = await fetch(`/api/estates?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch parent real estates');
      return response.json();
    },
  });

  const parents = parentsData?.data || [];

  return (
    <div className="space-y-6" data-testid="page-parent-estates">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-parent-estates-title">
            Parent Real Estates
          </h1>
          <p className="text-muted-foreground mt-2" data-testid="text-parent-estates-description">
            Manage your building complexes and compounds
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          data-testid="button-create-parent"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Parent Real Estate
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search parent real estates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search-parents"
        />
      </div>

      {/* Parent Real Estates Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse" data-testid={`skeleton-parent-${i}`}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : parents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-state-parents">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {search ? "No parent real estates found" : "No parent real estates yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search 
              ? "Try adjusting your search terms" 
              : "Create your first building complex or compound to get started"
            }
          </p>
          {!search && (
            <Button 
              onClick={() => setShowCreateDialog(true)}
              data-testid="button-create-first-parent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Parent Real Estate
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {parents.map((parent: any) => (
            <Card key={parent.id} className="hover:shadow-md transition-shadow hover-elevate" data-testid={`card-parent-${parent.id}`}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2" data-testid={`text-parent-name-${parent.id}`}>
                  {parent.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4" data-testid={`text-parent-location-${parent.id}`}>
                  {parent.district}, {parent.city}
                </p>
                {parent.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-parent-description-${parent.id}`}>
                    {parent.description}
                  </p>
                )}
                <div className="flex items-center mt-4 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3 mr-1" />
                  <span>{parent.region}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <ParentForm onClose={() => setShowCreateDialog(false)} />
      </Dialog>
    </div>
  );
}