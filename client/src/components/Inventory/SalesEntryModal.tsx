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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, DollarSign } from "lucide-react";

interface SalesEntryModalProps {
  inventory: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SalesEntryModal({ inventory, open, onOpenChange }: SalesEntryModalProps) {
  const [formData, setFormData] = useState({
    quantity: 1,
    unitPrice: parseFloat(inventory.sellingPrice || "0"),
    saleDate: new Date().toISOString().split('T')[0],
    notes: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSaleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/sales", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Sale recorded successfully",
        description: "The sale has been added and inventory updated.",
      });
      onOpenChange(false);
      setFormData({
        quantity: 1,
        unitPrice: parseFloat(inventory.sellingPrice || "0"),
        saleDate: new Date().toISOString().split('T')[0],
        notes: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
    },
    onError: (error: any) => {
      console.error("❌ Error recording inventory sale:", error.response?.data || error.message);
      toast({
        title: "Failed to record sale",
        description: error.response?.data?.message || error.message || "Please check all fields and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.quantity <= 0 || formData.unitPrice <= 0) {
      toast({
        title: "Invalid input",
        description: "Quantity and unit price must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    if (formData.quantity > (inventory.currentStock || 0)) {
      toast({
        title: "Insufficient stock",
        description: `Only ${inventory.currentStock || 0} units available in stock.`,
        variant: "destructive",
      });
      return;
    }

    const totalRevenue = formData.quantity * formData.unitPrice;
    const totalCost = formData.quantity * parseFloat(inventory.costPrice || "0");
    const profit = totalRevenue - totalCost;

    const requestBody = {
      inventoryId: inventory.id,
      sku: inventory.sku,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      totalRevenue: totalRevenue,
      totalCost: totalCost,
      profit: profit,
      saleDate: new Date(formData.saleDate),
      notes: formData.notes,
      productName: inventory.name,
      category: inventory.category || "inventory-item",
    };
    
    console.log("📤 Submitting inventory sale:", requestBody);
    
    createSaleMutation.mutate(requestBody);
  };

  const totalRevenue = formData.quantity * formData.unitPrice;
  const totalCost = formData.quantity * parseFloat(inventory.costPrice || "0");
  const profit = totalRevenue - totalCost;
  const remainingStock = (inventory.currentStock || 0) - formData.quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center text-black dark:text-white">
            <ShoppingCart className="h-5 w-5 mr-2 text-[#fd7014]" />
            Record Sale
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Record a sale for {inventory.name} and update inventory levels.
          </DialogDescription>
        </DialogHeader>

        {/* Product Information */}
        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg mb-6">
          <div className="flex items-center space-x-3 mb-3">
            {inventory.imageUrl ? (
              <img src={inventory.imageUrl} alt={inventory.name} className="h-12 w-12 rounded-lg object-cover" />
            ) : (
              <div className="h-12 w-12 bg-gray-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-black dark:text-white">{inventory.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {inventory.sku}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Current Stock:</span>
              <p className="font-medium text-black dark:text-white">{inventory.currentStock || 0} units</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Unit Price:</span>
              <p className="font-medium text-black dark:text-white">${inventory.sellingPrice || "0.00"}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sale Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity" className="text-black dark:text-white">Quantity Sold *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={inventory.currentStock || 0}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="unitPrice" className="text-black dark:text-white">Unit Price *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="saleDate" className="text-black dark:text-white">Sale Date *</Label>
            <Input
              id="saleDate"
              type="date"
              value={formData.saleDate}
              onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
              className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-black dark:text-white">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this sale..."
              className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
            />
          </div>

          {/* Sale Summary */}
          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-black dark:text-white">Sale Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Revenue:</span>
                <p className="font-bold text-green-600 dark:text-green-400">${totalRevenue.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                <p className="font-medium text-black dark:text-white">${totalCost.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Profit:</span>
                <p className={`font-bold ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${profit.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Remaining Stock:</span>
                <p className="font-medium text-black dark:text-white">{remainingStock} units</p>
              </div>
            </div>
          </div>

          {/* Warning for low stock */}
          {remainingStock <= (inventory.reorderPoint || 0) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Warning: This sale will bring stock below the reorder point ({inventory.reorderPoint || 0} units)
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSaleMutation.isPending || formData.quantity > (inventory.currentStock || 0)}
              className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
            >
              {createSaleMutation.isPending ? "Recording..." : "Record Sale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}