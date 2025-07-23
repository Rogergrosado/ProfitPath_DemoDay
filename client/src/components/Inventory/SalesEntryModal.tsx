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
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Package, DollarSign, Info, AlertTriangle, CheckCircle } from "lucide-react";

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
    mutationFn: (data: any) => apiRequest("/api/sales/manual-entry", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: (response) => {
      console.log("✅ Sale recorded successfully:", response);
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
      
      // Force refetch sales history queries with a small delay to ensure backend is updated
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          predicate: (query) => query.queryKey[0] === "/api/sales/history"
        });
        queryClient.refetchQueries({ 
          predicate: (query) => query.queryKey[0] === "/api/sales/history"
        });
      }, 100);
      
      // Invalidate all related queries for comprehensive updates
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/kpis"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "/api/sales/calendar"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/performance/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance/kpis"] });
    },
    onError: (error: any) => {
      console.error("❌ Error recording manual sale:", error.response?.data || error.message);
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
        description: `Cannot sell ${formData.quantity} units. Only ${inventory.currentStock || 0} units available.`,
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
      sku: inventory.sku,
      quantity_sold: formData.quantity,
      unit_price: formData.unitPrice,
      sale_date: formData.saleDate,
      notes: formData.notes,
    };
    
    console.log("📤 Submitting manual sale entry:", requestBody);
    
    createSaleMutation.mutate(requestBody);
  };

  // Calculate financial metrics and warnings
  const totalRevenue = formData.quantity * formData.unitPrice;
  const totalCost = formData.quantity * parseFloat(inventory.costPrice || "0");
  const profit = totalRevenue - totalCost;
  const remainingStock = (inventory.currentStock || 0) - formData.quantity;
  
  // Warning states
  const isLowStock = remainingStock <= (inventory.reorderPoint || 0) && remainingStock > 0;
  const isOutOfStock = remainingStock <= 0;
  const hasStockWarning = isLowStock || isOutOfStock;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center text-black dark:text-white">
            <ShoppingCart className="h-5 w-5 mr-2 text-[#fd7014]" />
            Manual Sales Entry
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Record a manual sale entry and update inventory levels automatically
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 1. Current Status Summary (Display-only) */}
          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="font-semibold text-black dark:text-white mb-3 flex items-center">
              <Info className="h-4 w-4 mr-2 text-[#fd7014]" />
              Current Status Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Product Name</Label>
                <p className="font-semibold text-black dark:text-white">{inventory.name}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">SKU</Label>
                <p className="font-semibold text-black dark:text-white">{inventory.sku || "N/A"}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Stock</Label>
                <p className="font-bold text-blue-600 dark:text-blue-400">{inventory.currentStock || 0} units</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Unit Price</Label>
                <p className="font-bold text-blue-600 dark:text-blue-400">${inventory.sellingPrice || "0.00"}</p>
              </div>
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This date will update the sales history calendar</p>
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



          {/* Warning Section */}
          {hasStockWarning && (
            <div className={`p-4 rounded-lg border ${
              isOutOfStock 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center">
                <AlertTriangle className={`h-4 w-4 mr-2 ${
                  isOutOfStock ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                }`} />
                <span className={`text-sm font-medium ${
                  isOutOfStock 
                    ? 'text-red-800 dark:text-red-200' 
                    : 'text-yellow-800 dark:text-yellow-200'
                }`}>
                  {isOutOfStock 
                    ? 'Out of Stock Warning: This sale will result in zero inventory' 
                    : `Low Stock Alert: Remaining stock (${remainingStock}) will be at or below reorder point (${inventory.reorderPoint || 0})`
                  }
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