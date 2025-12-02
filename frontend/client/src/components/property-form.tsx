import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Search, Upload, Trash2, ImageIcon, MapPin } from "lucide-react";
import {
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { SAUDI_REGIONS, SAUDI_CITIES, PROPERTY_STATUSES } from "@/lib/constants";
import type { ParentRealEstate } from "@/types";

const formSchema = z.object({
  // Property fields
  parentId: z.string().optional(),
  name: z.string().min(1, "Property name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().max(1000, "Description must be 1000 characters or less").optional(),
  type: z.string().min(1, "Property type is required"),
  status: z.enum(['AVAILABLE', 'RESERVED', 'RENTED']),
  bedrooms: z.number().min(0, "Bedrooms must be 0 or greater").optional(),
  bathrooms: z.number().min(0, "Bathrooms must be 0 or greater").optional(),
  area: z.number().min(1, "Area must be 1 or greater").optional(),
  floor: z.number().optional(),
  // Location fields
  region: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  street: z.string().optional(),
  buildingNumber: z.string().optional(),
  zipCode: z.string().optional(),
  // Owner fields
  ownerNationalId: z.string().length(10, "National ID must be exactly 10 digits").regex(/^\d{10}$/, "National ID must contain only digits"),
  ownerFirstName: z.string().min(2, "First name must be at least 2 characters"),
  ownerLastName: z.string().min(2, "Last name must be at least 2 characters"),
  ownerPhone: z.string().regex(/^05\d{8}$/, "Phone must be in format 05XXXXXXXX"),
  ownerEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

interface PropertyFormProps {
  onClose: () => void;
}

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "office", label: "Office" },
  { value: "shop", label: "Shop" },
  { value: "warehouse", label: "Warehouse" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];

export default function PropertyForm({ onClose }: PropertyFormProps) {
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
      parentId: "",
      name: "",
      description: "",
      type: "",
      status: "AVAILABLE",
      bedrooms: undefined,
      bathrooms: undefined,
      area: undefined,
      floor: undefined,
      // Location defaults
      region: "",
      city: "",
      district: "",
      street: "",
      buildingNumber: "",
      zipCode: "",
      // Owner defaults
      ownerNationalId: "",
      ownerFirstName: "",
      ownerLastName: "",
      ownerPhone: "",
      ownerEmail: "",
    },
  });

  const selectedParentId = form.watch("parentId");

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

  // Fetch parent real estates with search
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
  });

  const parents = parentsData?.data || [];
  const selectedParent = parents.find((p: ParentRealEstate) => p.id === selectedParentId);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload: Record<string, any> = {
        name: data.name,
        type: data.type,
        status: data.status,
        // Owner fields (required)
        ownerNationalId: data.ownerNationalId,
        ownerFirstName: data.ownerFirstName,
        ownerLastName: data.ownerLastName,
        ownerPhone: data.ownerPhone,
      };

      // Optional parent estate - only include if selected
      if (data.parentId) payload.estateId = data.parentId;

      // Optional owner field
      if (data.ownerEmail) payload.ownerEmail = data.ownerEmail;

      // Optional property fields
      if (data.description) payload.description = data.description;
      if (data.bedrooms !== undefined) payload.bedrooms = data.bedrooms;
      if (data.bathrooms !== undefined) payload.bathrooms = data.bathrooms;
      if (data.area !== undefined) payload.area = data.area;
      if (data.floor !== undefined) payload.floor = data.floor;
      if ((data as any).imageUrl) payload.imageUrl = (data as any).imageUrl;

      // Location fields
      if (data.region) payload.region = data.region;
      if (data.city) payload.city = data.city;
      if (data.district) payload.district = data.district;
      if (data.street) payload.street = data.street;
      if (data.buildingNumber) payload.buildingNumber = data.buildingNumber;
      if (data.zipCode) payload.zipCode = data.zipCode;

      const response = await fetch('/api/properties', {
        method: 'POST',
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
        description: "Property created successfully",
      });
      form.reset();
      // Reset image state
      setSelectedImage(null);
      setImagePreview(null);
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.message;
      try {
        const errorData = JSON.parse(errorMessage);
        if (errorData.fieldErrors) {
          Object.entries(errorData.fieldErrors).forEach(([field, messages]) => {
            form.setError(field as keyof FormData, {
              message: Array.isArray(messages) ? messages[0] : messages,
            });
          });
        } else {
          toast({
            title: "Error",
            description: errorData.message || "Failed to create property",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to create property",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = async (data: FormData) => {
    // Upload image first if selected
    let imageUrl: string | undefined;
    if (selectedImage) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    // Add imageUrl to data if uploaded
    createMutation.mutate({ ...data, imageUrl } as any);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-property-form">
      <DialogHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <DialogTitle data-testid="text-property-form-title">Create Property</DialogTitle>
          <DialogDescription>Fill in the details to create a new property</DialogDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-property-form">
          <X className="h-4 w-4" />
        </Button>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Parent RealEstate Search */}
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent RealEstate (Optional)</FormLabel>
                <Popover open={parentSearchOpen} onOpenChange={setParentSearchOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                        data-testid="button-parent-search"
                      >
                        {selectedParent ? selectedParent.name : "Select parent real estate (optional)..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search parent real estate..."
                        value={parentSearch}
                        onValueChange={setParentSearch}
                        data-testid="input-parent-search"
                      />
                      <CommandList>
                        <CommandEmpty>No parent real estate found.</CommandEmpty>
                        <CommandGroup>
                          {/* Clear selection option */}
                          {selectedParentId && (
                            <CommandItem
                              value="__clear__"
                              onSelect={() => {
                                field.onChange("");
                                setParentSearchOpen(false);
                              }}
                              className="text-muted-foreground"
                              data-testid="option-clear-parent"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Clear selection
                            </CommandItem>
                          )}
                          {parents.map((parent: ParentRealEstate) => (
                            <CommandItem
                              key={parent.id}
                              value={parent.name}
                              onSelect={() => {
                                field.onChange(parent.id);
                                setParentSearchOpen(false);
                              }}
                              data-testid={`option-parent-${parent.id}`}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{parent.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {parent.region} • {parent.city}
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
                  <FormLabel>Property Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Office Suite 304" 
                      {...field}
                      data-testid="input-property-name"
                    />
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
                      <SelectTrigger data-testid="select-status">
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
                <FormLabel>Property Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-property-type">
                      <SelectValue placeholder="Select Type" />
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
                  <Textarea
                    placeholder="Spacious property with great amenities..."
                    className="h-20 resize-none"
                    {...field}
                    data-testid="input-property-description"
                  />
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
                      placeholder="3"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value) || undefined)}
                      data-testid="input-bedrooms"
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
                      placeholder="2"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value) || undefined)}
                      data-testid="input-bathrooms"
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
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="150"
                        className="pr-12"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined)}
                        data-testid="input-area"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">SQM</span>
                    </div>
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
                      placeholder="1"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value) || undefined)}
                      data-testid="input-floor"
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
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Property preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
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
          </div>

          {/* Location Information Section */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <h3 className="font-medium text-foreground">Location Information</h3>
            <p className="text-xs text-muted-foreground">
              Enter the property location details. If a parent estate is selected, location will be inherited from it.
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
                        <SelectTrigger data-testid="select-region">
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
                        <SelectTrigger data-testid="select-city">
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
                    <Input
                      placeholder="Al Olaya"
                      {...field}
                      data-testid="input-district"
                    />
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
                    <Input
                      placeholder="King Fahd Road"
                      {...field}
                      data-testid="input-street"
                    />
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
                      <Input
                        placeholder="1234"
                        {...field}
                        data-testid="input-building-number"
                      />
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
                      <Input
                        placeholder="12345"
                        {...field}
                        data-testid="input-zip-code"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Owner Information Section */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <h3 className="font-medium text-foreground">Owner Information</h3>
            <p className="text-xs text-muted-foreground">
              If owner exists, they will be linked. If not, a new owner account will be created.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ownerFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ahmed"
                        {...field}
                        data-testid="input-owner-first-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mohammed"
                        {...field}
                        data-testid="input-owner-last-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ownerNationalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>National ID *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234567890"
                      maxLength={10}
                      {...field}
                      data-testid="input-owner-national-id"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ownerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="05XXXXXXXX"
                        maxLength={10}
                        {...field}
                        data-testid="input-owner-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="owner@example.com"
                        {...field}
                        data-testid="input-owner-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending || uploadingImage}
              data-testid="button-create-property"
            >
              {uploadingImage ? "Uploading Image..." : createMutation.isPending ? "Creating..." : "Create Property"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-property"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
