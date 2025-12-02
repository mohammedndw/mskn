import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreVertical, MapPin, Expand, Calendar, BedDouble, Bath, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/currency";
import { apiRequest } from "@/lib/queryClient";
import type { PropertyWithDetails } from "@/types";

interface PropertyCardProps {
  property: PropertyWithDetails;
  readOnly?: boolean;
  onView?: (property: PropertyWithDetails) => void;
  onEdit?: (property: PropertyWithDetails) => void;
}

export default function PropertyCard({ property, readOnly = false, onView, onEdit }: PropertyCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/properties/${property.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'RENTED':
        return 'status-rented';
      case 'RESERVED':
        return 'status-reserved';
      case 'AVAILABLE':
        return 'status-vacant';
      default:
        return 'status-vacant';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'RENTED':
        return 'Rented';
      case 'RESERVED':
        return 'Reserved';
      case 'AVAILABLE':
        return 'Available';
      default:
        return 'Unknown';
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow hover-elevate" data-testid={`card-property-${property.id}`}>
        {/* Property Image */}
        <div className="w-full h-48 bg-muted relative">
          {property.imageUrl ? (
            <img
              src={property.imageUrl}
              alt={property.name}
              className="w-full h-full object-cover"
              data-testid={`img-property-${property.id}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3
                className="font-semibold text-foreground hover:text-primary cursor-pointer line-clamp-1"
                data-testid={`text-property-name-${property.id}`}
              >
                {property.name}
              </h3>
              <p
                className="text-sm text-muted-foreground line-clamp-1"
                data-testid={`text-parent-name-${property.id}`}
              >
                {property.estate?.name || "No parent estate"}
              </p>
            </div>
            <Badge
              className={`${getStatusBadgeClass(property.status)} text-xs font-medium border ml-2`}
              data-testid={`badge-status-${property.id}`}
            >
              {getStatusLabel(property.status)}
            </Badge>
          </div>

          {property.estate && (
            <p
              className="text-xs text-muted-foreground mb-2"
              data-testid={`text-location-${property.id}`}
            >
              {property.estate.region} • {property.estate.city}
            </p>
          )}

          {property.type && (
            <p className="text-xs text-muted-foreground mb-2" data-testid={`text-type-${property.id}`}>
              Type: {property.type}
            </p>
          )}

          {(property.bedrooms || property.bathrooms) && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {property.bedrooms ? (
                <span className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded" data-testid={`text-rooms-${property.id}`} aria-label={`${property.bedrooms} bedrooms`}>
                  <BedDouble className="h-3 w-3" aria-hidden="true" />
                  {property.bedrooms} Beds
                </span>
              ) : null}
              {property.bathrooms ? (
                <span className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded" data-testid={`text-bathrooms-${property.id}`} aria-label={`${property.bathrooms} bathrooms`}>
                  <Bath className="h-3 w-3" aria-hidden="true" />
                  {property.bathrooms} Baths
                </span>
              ) : null}
              {property.floor !== undefined && property.floor !== null && (
                <span className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded" data-testid={`text-floor-${property.id}`} aria-label={`Floor ${property.floor}`}>
                  Floor {property.floor}
                </span>
              )}
            </div>
          )}

          {property.area && (
            <div className="flex items-center text-sm mb-3">
              <span className="flex items-center gap-1">
                <Expand className="h-3 w-3 text-muted-foreground" />
                <span data-testid={`text-sqm-${property.id}`}>{property.area} SQM</span>
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span
              className="text-xs text-muted-foreground flex items-center gap-1"
              data-testid={`text-created-${property.id}`}
            >
              <Calendar className="h-3 w-3" />
              {formatRelativeTime(property.createdAt)}
            </span>
            {!readOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-actions-${property.id}`}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem
                    onClick={() => onView?.(property)}
                    data-testid={`button-view-${property.id}`}
                  >
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEdit?.(property)}
                    data-testid={`button-edit-${property.id}`}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    data-testid={`button-delete-${property.id}`}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{property.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
