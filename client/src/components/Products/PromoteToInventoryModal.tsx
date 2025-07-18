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
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export function PromoteToInventoryModal({ isOpen, onClose, product }: PromoteToInventoryModalProps) {
  const [formData, setFormData] = useState({
    sku: product?.sku || `${product?.name?.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}` || "",
    currentStock: "",
    costPrice: "",
    sellingPrice: product?.estimatedPrice || "",
    reorderPoint: "20",
    supplierName: "",
    supplierSku: "",
    leadTimeDays: "7",
    notes: `Promoted from Watchlist on ${new Date().toLocaleDateString()}`,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const promoteMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/inventory", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        name: product.name,
        category: product.category,
        productId: product.id,
      }),
    }),
    onSuccess: () => {
      toast({
        title: "Product promoted successfully",
        description: "Product has been added to your active inventory.",
      });
      onClose();
      setFormData({
        sku: "",
        currentStock: "",
        costPrice: "",
        sellingPrice: "",
        reorderPoint: "20",
        supplierName: "",
        supplierSku: "",
        leadTimeDays: "7",
        notes: "",
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
        description: "Please fill in SKU, Initial Stock, Cost Price, and Selling Price.",
        variant: "destructive",
      });
      return;
    }

    promoteMutation.mutate({
      ...formData,
      currentStock: parseInt(formData.currentStock),
      reorderPoint: parseInt(formData.reorderPoint),
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      leadTimeDays: parseInt(formData.leadTimeDays),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700" aria-describedby="promote-product-description">
        <DialogHeader>
          <DialogTitle className="flex items-center text-black dark:text-white">
            <ArrowRight className="h-5 w-5 mr-2 text-[#fd7014]" />
            Promote "{product?.name}" to Inventory
          </DialogTitle>
          <DialogDescription id="promote-product-description" className="text-gray-600 dark:text-gray-400">
            Add inventory details to move this product to your active inventory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pre-filled Product Info */}
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-black dark:text-white mb-2">Product Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">Name:</span> {product?.name}</p>
              <p><span className="font-medium">Category:</span> {product?.category}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku" className="text-black dark:text-white">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter unique SKU"
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
                placeholder="100"
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
                placeholder="9.25"
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
                placeholder="24.99"
                className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reorderPoint" className="text-black dark:text-white">Reorder Point</Label>
              <Input
                id="reorderPoint"
                type="number"
                min="0"
                value={formData.reorderPoint}
                onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                placeholder="20"
                className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="leadTimeDays" className="text-black dark:text-white">Lead Time (Days)</Label>
              <Input
                id="leadTimeDays"
                type="number"
                min="1"
                value={formData.leadTimeDays}
                onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
                placeholder="7"
                className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplierName" className="text-black dark:text-white">Supplier Name</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                placeholder="SolarTech Ltd."
                className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="supplierSku" className="text-black dark:text-white">Supplier SKU</Label>
              <Input
                id="supplierSku"
                value={formData.supplierSku}
                onChange={(e) => setFormData({ ...formData, supplierSku: e.target.value })}
                placeholder="ST-GLW-6PK"
                className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-black dark:text-white">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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