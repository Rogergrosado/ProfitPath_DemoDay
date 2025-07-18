import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

interface PromoteToInventoryModalProps {
  productId: number;
  children: React.ReactNode;
}

export function PromoteToInventoryModal({ productId, children }: PromoteToInventoryModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    sku: "",
    currentStock: "",
    costPrice: "",
    sellingPrice: "",
    reorderPoint: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const promoteMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/products/${productId}/promote`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Product promoted successfully",
        description: "Product has been added to your active inventory.",
      });
      setOpen(false);
      setFormData({
        sku: "",
        currentStock: "",
        costPrice: "",
        sellingPrice: "",
        reorderPoint: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products/watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to promote product",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.currentStock || !formData.costPrice || !formData.sellingPrice) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    promoteMutation.mutate({
      sku: formData.sku,
      currentStock: parseInt(formData.currentStock),
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      reorderPoint: parseInt(formData.reorderPoint) || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center text-black dark:text-white">
            <ArrowRight className="h-5 w-5 mr-2 text-[#fd7014]" />
            Promote to Inventory
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Add inventory details to move this product to your active inventory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku" className="text-black dark:text-white">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU"
                className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="currentStock" className="text-black dark:text-white">Initial Stock *</Label>
              <Input
                id="currentStock"
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                placeholder="Units"
                className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costPrice" className="text-black dark:text-white">Cost Price *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                placeholder="$0.00"
                className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="sellingPrice" className="text-black dark:text-white">Selling Price *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                placeholder="$0.00"
                className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reorderPoint" className="text-black dark:text-white">Reorder Point</Label>
            <Input
              id="reorderPoint"
              type="number"
              min="0"
              value={formData.reorderPoint}
              onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
              placeholder="Minimum stock level (optional)"
              className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={promoteMutation.isPending}
              className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
            >
              {promoteMutation.isPending ? "Promoting..." : "Promote to Inventory"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}