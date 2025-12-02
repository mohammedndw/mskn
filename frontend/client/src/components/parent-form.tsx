import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SAUDI_REGIONS, SAUDI_CITIES } from "@/lib/constants";
const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().max(1000, "Description must be 1000 characters or less").optional(),
  region: z.string().min(2, "Region is required"),
  city: z.string().min(2, "City is required"),
  street: z.string().min(2, "Street is required"),
  address: z.string().min(2, "Address is required").max(200, "Address must be 200 characters or less"),
});

type FormData = z.infer<typeof formSchema>;

interface ParentFormProps {
  onClose: () => void;
}

export default function ParentForm({ onClose }: ParentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      region: "",
      city: "",
      street: "",
      address: "",
    },
  });

  const selectedRegion = form.watch("region");
  const availableCities = selectedRegion ? SAUDI_CITIES[selectedRegion as keyof typeof SAUDI_CITIES] || [] : [];

  // Reset city when region changes
  form.watch((data, { name }) => {
    if (name === "region" && data.region) {
      form.setValue("city", "");
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/estates', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/estates'] });
      toast({
        title: "Success",
        description: "Parent RealEstate created successfully",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      if (error.message.includes('422') && error.message.includes('fieldErrors')) {
        // Handle field validation errors from server
        const errorData = JSON.parse(error.message.split(': ')[1] || '{}');
        if (errorData.fieldErrors) {
          Object.entries(errorData.fieldErrors).forEach(([field, messages]) => {
            form.setError(field as keyof FormData, {
              message: Array.isArray(messages) ? messages[0] : messages,
            });
          });
        }
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create parent real estate",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" data-testid="dialog-parent-form">
      <DialogHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <DialogTitle data-testid="text-form-title">Create Parent RealEstate</DialogTitle>
          <DialogDescription>Fill in the details to create a new parent real estate</DialogDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-form">
          <X className="h-4 w-4" />
        </Button>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Al Noor Business Center" 
                    {...field} 
                    data-testid="input-name"
                  />
                </FormControl>
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
                    placeholder="Modern commercial complex with retail and office spaces"
                    className="h-20 resize-none"
                    {...field}
                    data-testid="input-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region *</FormLabel>
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
                  <FormLabel>City *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-city">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCities.map((city) => (
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
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street *</FormLabel>
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

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="King Fahd Road, intersection with Prince Sultan Street"
                    className="h-16 resize-none"
                    {...field}
                    data-testid="input-address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending}
              data-testid="button-create-parent"
            >
              {createMutation.isPending ? "Creating..." : "Create Parent RealEstate"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
