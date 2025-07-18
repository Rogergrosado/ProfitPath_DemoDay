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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  estimatedPrice: z.coerce.number().positive("Price must be positive").optional(),
  competition: z.enum(["low", "medium", "high"]).optional(),
  demandScore: z.coerce.number().min(0).max(100).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductModalProps {
  children?: React.ReactNode;
}

export function AddProductModal({ children }: AddProductModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      estimatedPrice: undefined,
      competition: undefined,
      demandScore: undefined,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (data: ProductFormData) => apiRequest("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/watchlist"] });
      toast({ title: "Product added successfully" });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to add product", variant: "destructive" });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-[hsl(20,90%,54%)] hover:bg-orange-400 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)] text-white">
        <DialogHeader>
          <DialogTitle>Add Product to Watchlist</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter product name..."
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description..."
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="home-garden">Home & Garden</SelectItem>
                      <SelectItem value="sports-outdoors">Sports & Outdoors</SelectItem>
                      <SelectItem value="health-beauty">Health & Beauty</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="toys-games">Toys & Games</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
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
                name="competition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competition Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="demandScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Demand Score (0-100)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="85"
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
                disabled={createProductMutation.isPending}
                className="bg-[hsl(20,90%,54%)] hover:bg-orange-400 text-white"
              >
                {createProductMutation.isPending ? "Adding..." : "Add Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
