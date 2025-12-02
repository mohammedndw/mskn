import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Search, Building2, BedDouble, Bath, Expand, Calendar, Upload, Trash2, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeader } from "@/lib/auth";
import { PROPERTY_STATUSES, SAUDI_REGIONS, SAUDI_CITIES } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/currency";
import type { PropertyWithDetails, ParentRealEstate } from "@/types";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "office", label: "Office" },
  { value: "shop", label: "Shop" },
  { value: "warehouse", label: "Warehouse" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];

const formSchema = z.object({
  estateId: z.string().optional(),
  name: z.string().min(1, "Property name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().max(1000, "Description must be 1000 characters or less").optional(),
  type: z.string().min(1, "Property type is required"),
  status: z.enum(['AVAILABLE', 'RESERVED', 'RENTED']),
  bedrooms: z.number().min(0, "Bedrooms must be 0 or greater").optional(),
  bathrooms: z.number().min(0, "Bathrooms must be 0 or greater").optional(),
  area: z.number().min(1, "Area must be 1 or greater").optional(),
  floor: z.number().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  ownerNationalId: z.string().optional(),
  // Location fields
  region: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  street: z.string().optional(),
  buildingNumber: z.string().optional(),
  zipCode: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PropertyDetailModalProps {
  property: PropertyWithDetails | null;
  mode: 'view' | 'edit';
  open: boolean;
  onClose: () => void;
}

export default function PropertyDetailModal({ property, mode, open, onClose }: PropertyDetailModalProps) {
  const [parentSearchOpen, setParentSearchOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estateId: property?.estateId || "",
      name: property?.name || "",
      description: property?.description || "",
      type: property?.type || "",
      status: property?.status || "AVAILABLE",
      bedrooms: property?.bedrooms,
      bathrooms: property?.bathrooms,
      area: property?.area,
      floor: property?.floor,
      imageUrl: property?.imageUrl || "",
      ownerNationalId: "",
      // Location defaults
      region: (property as any)?.region || "",
      city: (property as any)?.city || "",
      district: (property as any)?.district || "",
      street: (property as any)?.street || "",
      buildingNumber: (property as any)?.buildingNumber || "",
      zipCode: (property as any)?.zipCode || "",
    },
  });

  // Reset form when property changes
  if (property && form.getValues('name') !== property.name) {
    form.reset({
      estateId: property.estateId || "",
      name: property.name,
      description: property.description || "",
      type: property.type,
      status: property.status,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      floor: property.floor,
      imageUrl: property.imageUrl || "",
      ownerNationalId: "",
      // Location fields
      region: (property as any)?.region || "",
      city: (property as any)?.city || "",
      district: (property as any)?.district || "",
      street: (property as any)?.street || "",
      buildingNumber: (property as any)?.buildingNumber || "",
      zipCode: (property as any)?.zipCode || "",
    });
    // Reset image state when property changes
    setSelectedImage(null);
    setImagePreview(null);
  }

  const selectedEstateId = form.watch("estateId");

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only JPEG, PNG, GIF, and WebP images are allowed.",
          variant: "destructive",
        });
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload image to server
  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/properties/upload-image', {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return result.data.imageUrl;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Fetch parent real estates
  const { data: parentsData } = useQuery({
    queryKey: ['/api/estates', parentSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (parentSearch) params.set('q', parentSearch);
      const response = await fetch(`/api/estates?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch estates');
      return response.json();
    },
    enabled: mode === 'edit',
  });

  const parents = parentsData?.data || [];
  const selectedParent = parents.find((p: ParentRealEstate) => p.id === selectedEstateId) || property?.estate;

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload: Record<string, any> = {
        estateId: data.estateId,
        name: data.name,
        type: data.type,
        status: data.status,
      };

      if (data.description) payload.description = data.description;
      if (data.bedrooms !== undefined) payload.bedrooms = data.bedrooms;
      if (data.bathrooms !== undefined) payload.bathrooms = data.bathrooms;
      if (data.area !== undefined) payload.area = data.area;
      if (data.floor !== undefined) payload.floor = data.floor;
      if (data.imageUrl) payload.imageUrl = data.imageUrl;
      if (data.ownerNationalId) payload.ownerNationalId = data.ownerNationalId;

      // Location fields
      if (data.region) payload.region = data.region;
      if (data.city) payload.city = data.city;
      if (data.district) payload.district = data.district;
      if (data.street) payload.street = data.street;
      if (data.buildingNumber) payload.buildingNumber = data.buildingNumber;
      if (data.zipCode) payload.zipCode = data.zipCode;

      const response = await fetch(`/api/properties/${property?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      // Reset image state on success
      setSelectedImage(null);
      setImagePreview(null);
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.message;
      try {
        const errorData = JSON.parse(errorMessage);
        toast({
          title: "Error",
          description: errorData.message || "Failed to update property",
          variant: "destructive",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to update property",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = async (data: FormData) => {
    // Upload image first if selected
    let imageUrl = data.imageUrl;
    if (selectedImage) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    updateMutation.mutate({ ...data, imageUrl });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'RENTED': return 'status-rented';
      case 'RESERVED': return 'status-reserved';
      case 'AVAILABLE': return 'status-vacant';
      default: return 'status-vacant';
    }
  };

  if (!property) return null;

  // View Mode
  if (mode === 'view') {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {property.name}
              <Badge className={`${getStatusBadgeClass(property.status)} text-xs font-medium border ml-2`}>
                {property.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Property details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image */}
            <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
              {property.imageUrl ? (
                <img
                  src={property.imageUrl}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Parent Estate</p>
                <p className="font-medium">{property.estate?.name || "No parent estate"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{property.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{property.estate?.region} - {property.estate?.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={`${getStatusBadgeClass(property.status)} text-xs font-medium border`}>
                  {property.status}
                </Badge>
              </div>
            </div>

            {/* Features */}
            <div className="flex items-center gap-4 flex-wrap">
              {property.bedrooms !== undefined && (
                <div className="flex items-center gap-1 text-sm bg-muted px-3 py-1.5 rounded">
                  <BedDouble className="h-4 w-4" />
                  {property.bedrooms} Bedrooms
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div className="flex items-center gap-1 text-sm bg-muted px-3 py-1.5 rounded">
                  <Bath className="h-4 w-4" />
                  {property.bathrooms} Bathrooms
                </div>
              )}
              {property.area !== undefined && (
                <div className="flex items-center gap-1 text-sm bg-muted px-3 py-1.5 rounded">
                  <Expand className="h-4 w-4" />
                  {property.area} SQM
                </div>
              )}
              {property.floor !== undefined && (
                <div className="flex items-center gap-1 text-sm bg-muted px-3 py-1.5 rounded">
                  Floor {property.floor}
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{property.description}</p>
              </div>
            )}

            {/* Owner */}
            {property.owner && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Owner</p>
                <p className="font-medium">{property.owner.firstName} {property.owner.lastName}</p>
                <p className="text-sm text-muted-foreground">{property.owner.email}</p>
              </div>
            )}

            {/* Created */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Created {formatRelativeTime(property.createdAt)}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Edit Mode
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>Update property details</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Parent Estate */}
            <FormField
              control={form.control}
              name="estateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Estate *</FormLabel>
                  <Popover open={parentSearchOpen} onOpenChange={setParentSearchOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {selectedParent ? selectedParent.name : "Select parent estate..."}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search estates..."
                          value={parentSearch}
                          onValueChange={setParentSearch}
                        />
                        <CommandList>
                          <CommandEmpty>No estates found.</CommandEmpty>
                          <CommandGroup>
                            {parents.map((parent: ParentRealEstate) => (
                              <CommandItem
                                key={parent.id}
                                value={parent.name}
                                onSelect={() => {
                                  field.onChange(parent.id);
                                  setParentSearchOpen(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{parent.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {parent.region} - {parent.city}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROPERTY_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea className="h-20 resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (SQM)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <FormLabel>Property Image</FormLabel>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                {imagePreview || property?.imageUrl ? (
                  <div className="relative">
                    <img
                      src={imagePreview || property?.imageUrl || ''}
                      alt="Property preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        handleRemoveImage();
                        form.setValue('imageUrl', '');
                      }}
                      data-testid="button-remove-image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-3">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Click to upload image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, GIF, WebP (max 5MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                  data-testid="input-image-file"
                />
              </div>
              {uploadingImage && (
                <p className="text-sm text-muted-foreground">Uploading image...</p>
              )}
              {/* Option to change image when one already exists */}
              {(imagePreview || property?.imageUrl) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change Image
                </Button>
              )}
            </div>

            {/* Location Information Section */}
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h3 className="font-medium text-foreground">Location Information</h3>
              <p className="text-xs text-muted-foreground">
                Update the property location details.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SAUDI_REGIONS.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!form.watch("region")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select City" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.watch("region") && SAUDI_CITIES[form.watch("region") as keyof typeof SAUDI_CITIES]?.map((city) => (
                            <SelectItem key={city.value} value={city.value}>
                              {city.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District / Neighborhood</FormLabel>
                    <FormControl>
                      <Input placeholder="Al Olaya" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder="King Fahd Road" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="buildingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Building Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={updateMutation.isPending || uploadingImage}>
                {uploadingImage ? "Uploading Image..." : updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
