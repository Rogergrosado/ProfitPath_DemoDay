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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Calendar, TrendingUp } from "lucide-react";

interface RestockProductModalProps {
  inventory: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RestockProductModal({ inventory, open, onOpenChange }: RestockProductModalProps) {
  const [formData, setFormData] = useState({
    quantity: 0,
    reorderDate: new Date().toISOString().split('T')[0],
    notes: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const restockMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/inventory/${inventory.sku}/restock`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Product restocked successfully",
        description: `Added ${formData.quantity} units to ${inventory.name}. Reorder recorded for ${formData.reorderDate}.`,
      });
      onOpenChange(false);
      setFormData({
        quantity: 0,
        reorderDate: new Date().toISOString().split('T')[0],
        notes: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reorder/calendar"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-sales"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to restock product",
        description: error.response?.data?.message || error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Reorder quantity must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    const requestBody = {
      quantity: formData.quantity,
      reorderDate: formData.reorderDate,
      notes: formData.notes,
    };
    
    restockMutation.mutate(requestBody);
  };

  const getStockStatus = (currentStock: number, reorderPoint: number) => {
    if (currentStock === 0) {
      return { variant: "destructive" as const, label: "Out of Stock" };
    } else if (currentStock <= reorderPoint) {
      return { variant: "default" as const, label: "Low Stock" };
    } else {
      return { variant: "secondary" as const, label: "In Stock" };
    }
  };

  // Reactive calculations
  const currentStock = inventory.currentStock || 0;
  const reorderQuantity = formData.quantity;
  const remainingStock = currentStock + reorderQuantity;
  const unitPrice = parseFloat(inventory.sellingPrice || "0");
  const costPrice = parseFloat(inventory.costPrice || "0");
  const totalValue = remainingStock * unitPrice;
  const totalCost = reorderQuantity * costPrice;
  const stockStatus = getStockStatus(remainingStock, inventory.reorderPoint || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center text-black dark:text-white">
            <Package className="h-5 w-5 mr-2 text-[#fd7014]" />
            Restock Product
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Record a reorder for "{inventory.name}" and update inventory levels.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Product Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Status</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Product Name</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">{inventory.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">SKU</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">{inventory.sku}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Current Stock</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">{currentStock} units</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Unit Price</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">${unitPrice.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Restock Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Restock Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Reorder Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                      placeholder="Enter quantity to add"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Reorder Date</Label>
                    <Input
                      type="date"
                      value={formData.reorderDate}
                      onChange={(e) => setFormData({ ...formData, reorderDate: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Notes (Optional)</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1"
                    placeholder="Add notes about this restock..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reorder Summary - Reactive */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-[#fd7014]" />
                  Reorder Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Remaining Stock</Label>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {remainingStock} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant={stockStatus.variant} className="text-xs">
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Total Value</Label>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        ${totalValue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Total Cost</Label>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        -${totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visual indicator for restock impact */}
                {reorderQuantity > 0 && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-800 dark:text-green-200">
                        Adding {reorderQuantity} units will increase stock from {currentStock} to {remainingStock} units
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
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
                disabled={restockMutation.isPending || formData.quantity <= 0}
                className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
              >
                {restockMutation.isPending ? "Restocking..." : `Restock ${formData.quantity > 0 ? formData.quantity + ' Units' : 'Product'}`}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}