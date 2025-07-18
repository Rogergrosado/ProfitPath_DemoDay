import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const saleSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().positive("Unit price must be positive"),
  totalCost: z.coerce.number().min(0, "Total cost cannot be negative").optional(),
  saleDate: z.string().min(1, "Sale date is required"),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SalesEntryModalProps {
  children?: React.ReactNode;
}

export function SalesEntryModal({ children }: SalesEntryModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      sku: "",
      quantity: 1,
      unitPrice: 0,
      totalCost: 0,
      saleDate: new Date().toISOString().split('T')[0], // Today's date
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: (data: SaleFormData) => {
      const totalRevenue = data.quantity * data.unitPrice;
      const profit = totalRevenue - (data.totalCost || 0);
      
      const requestBody = {
        sku: data.sku,
        quantity: data.quantity,
        unitPrice: data.unitPrice.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        totalCost: (data.totalCost || 0).toFixed(2),
        profit: profit.toFixed(2),
        saleDate: new Date(data.saleDate),
        productName: data.sku, // Using SKU as product name fallback
        category: "manual-entry",
      };
      
      console.log("📤 Submitting sale:", requestBody);
      
      return apiRequest("/api/sales", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance/metrics"] });
      toast({ title: "Sale added successfully" });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("❌ Error recording sale:", error.response?.data || error.message);
      toast({ 
        title: "Failed to add sale", 
        description: error.response?.data?.message || error.message || "Please check all fields and try again.",
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: SaleFormData) => {
    createSaleMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-[hsl(20,90%,54%)] hover:bg-orange-400 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Sale
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)] text-white">
        <DialogHeader>
          <DialogTitle>Manual Sales Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product SKU</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter SKU..."
                      {...field}
                      className="bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        className="bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        className="bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="totalCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Cost (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      className="bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="saleDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createSaleMutation.isPending}
                className="bg-[hsl(20,90%,54%)] hover:bg-orange-400 text-white"
              >
                {createSaleMutation.isPending ? "Adding..." : "Add Sale"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
