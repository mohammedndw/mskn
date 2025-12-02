import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Contract validation schema
const insertContractSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  price: z.number().positive("Price must be greater than 0"),
  paymentFrequency: z.enum(["MONTHLY", "QUARTERLY", "SEMI_ANNUALLY", "ANNUALLY"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type InsertContract = z.infer<typeof insertContractSchema>;

interface ContractFormProps {
  onSuccess?: () => void;
}

export default function ContractForm({ onSuccess }: ContractFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch properties (units only)
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

  // Fetch tenants
  const { data: tenantsData } = useQuery({
    queryKey: ['/api/tenants'],
    queryFn: async () => {
      const response = await fetch('/api/tenants', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch tenants');
      return response.json();
    },
  });

  const properties = propertiesData?.data || [];
  const tenants = tenantsData?.data || [];

  const form = useForm<InsertContract>({
    resolver: zodResolver(insertContractSchema.extend({
      price: insertContractSchema.shape.price.refine(val => val > 0, "Price must be greater than 0"),
    })),
    defaultValues: {
      propertyId: "",
      tenantId: "",
      price: "" as unknown as number,
      paymentFrequency: "MONTHLY",
      startDate: "",
      endDate: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertContract) => {
      // Validate dates - allow past dates for historical contracts
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end.getTime() < start.getTime()) {
        throw new Error("End date cannot be before start date");
      }
      return await apiRequest('POST', '/api/contracts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      toast({
        title: "Success",
        description: "Contract created successfully",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create contract",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContract) => {
    createMutation.mutate(data);
  };

  return (
    <DialogContent className="sm:max-w-[500px]" data-testid="dialog-contract-form">
      <DialogHeader>
        <DialogTitle data-testid="text-dialog-title">Create Contract</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-property">
                      <SelectValue placeholder="Select a property unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map((property: any) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name} - {property.city}
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
            name="tenantId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tenant</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-tenant">
                      <SelectValue placeholder="Select a tenant" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tenants.map((tenant: any) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.firstName} {tenant.lastName} - {tenant.phone}
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
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Price (SAR)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="5000"
                    value={field.value === undefined || field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === '' ? "" : parseFloat(val));
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    data-testid="input-price"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Frequency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-payment-frequency">
                      <SelectValue placeholder="Select payment frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="SEMI_ANNUALLY">Semi-Annually</SelectItem>
                    <SelectItem value="ANNUALLY">Annually</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    data-testid="input-start-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    data-testid="input-end-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              data-testid="button-submit-contract"
            >
              {createMutation.isPending ? "Creating..." : "Create Contract"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
