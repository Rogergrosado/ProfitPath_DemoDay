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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Calendar, User, Building, TrendingUp, BarChart3, History, Plus } from "lucide-react";
import { SalesHistoryTable } from "./SalesHistoryTable";

interface InventoryDetailModalProps {
  inventory: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryDetailModal({ inventory, open, onOpenChange }: InventoryDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [restockData, setRestockData] = useState({ quantity: 0, notes: "" });
  const [formData, setFormData] = useState({
    name: inventory.name || "",
    sku: inventory.sku || "",
    category: inventory.category || "",
    currentStock: inventory.currentStock || 0,
    reorderPoint: inventory.reorderPoint || 0,
    costPrice: inventory.costPrice || "",
    sellingPrice: inventory.sellingPrice || "",
    supplierName: inventory.supplierName || "",
    supplierSKU: inventory.supplierSKU || "",
    leadTimeDays: inventory.leadTimeDays || 0,
    notes: inventory.notes || "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/inventory/${inventory.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Inventory updated successfully",
        description: "Your changes have been saved.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update inventory",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const restockMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/inventory/${inventory.sku}/restock`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Stock updated successfully",
        description: `Added ${restockData.quantity} units to inventory.`,
      });
      setRestockData({ quantity: 0, notes: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reorder/calendar"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update stock",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockData.quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity greater than 0.",
        variant: "destructive",
      });
      return;
    }
    restockMutation.mutate(restockData);
  };

  const getStockStatus = () => {
    const currentStock = formData.currentStock || 0;
    const reorderPoint = formData.reorderPoint || 0;
    
    if (currentStock === 0) {
      return <Badge className="bg-red-500/20 text-red-600 dark:text-red-400">Out of Stock</Badge>;
    } else if (currentStock <= reorderPoint) {
      return <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-500/20 text-green-600 dark:text-green-400">In Stock</Badge>;
    }
  };

  const stockValue = (formData.currentStock || 0) * parseFloat(formData.sellingPrice || "0");
  const potentialProfit = ((parseFloat(formData.sellingPrice || "0") - parseFloat(formData.costPrice || "0")) * (formData.currentStock || 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center text-black dark:text-white">
            <Package className="h-5 w-5 mr-2 text-[#fd7014]" />
            {formData.name} - Enhanced Inventory Management
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Complete inventory management with stock tracking, sales history, and analytics
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-slate-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="restock" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
              <Plus className="w-4 h-4 mr-1" />
              Restock
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
              <History className="w-4 h-4 mr-1" />
              History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-1" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-black dark:text-white">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="sku" className="text-black dark:text-white">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                disabled={!isEditing}
                className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category" className="text-black dark:text-white">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={!isEditing}
              className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
            />
          </div>

          {/* Stock Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black dark:text-white flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Stock Information
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currentStock" className="text-black dark:text-white">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="reorderPoint" className="text-black dark:text-white">Reorder Point</Label>
                <Input
                  id="reorderPoint"
                  type="number"
                  min="0"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                />
              </div>
              <div>
                <Label className="text-black dark:text-white">Stock Status</Label>
                <div className="mt-2">
                  {getStockStatus()}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black dark:text-white">Pricing Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costPrice" className="text-black dark:text-white">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  disabled={!isEditing}
                  className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="sellingPrice" className="text-black dark:text-white">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  disabled={!isEditing}
                  className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Stock Value:</span>
                <p className="font-bold text-black dark:text-white">${stockValue.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Potential Profit:</span>
                <p className="font-bold text-black dark:text-white">${potentialProfit.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black dark:text-white flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Supplier Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplierName" className="text-black dark:text-white">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  disabled={!isEditing}
                  className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="supplierSKU" className="text-black dark:text-white">Supplier SKU</Label>
                <Input
                  id="supplierSKU"
                  value={formData.supplierSKU}
                  onChange={(e) => setFormData({ ...formData, supplierSKU: e.target.value })}
                  disabled={!isEditing}
                  className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="leadTimeDays" className="text-black dark:text-white">Lead Time (Days)</Label>
              <Input
                id="leadTimeDays"
                type="number"
                min="0"
                value={formData.leadTimeDays}
                onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 0 })}
                disabled={!isEditing}
                className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-black dark:text-white">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={!isEditing}
              placeholder="Add any notes about this inventory item..."
              className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Close
            </Button>
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
              >
                Edit Details
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: inventory.name || "",
                      sku: inventory.sku || "",
                      category: inventory.category || "",
                      currentStock: inventory.currentStock || 0,
                      reorderPoint: inventory.reorderPoint || 0,
                      costPrice: inventory.costPrice || "",
                      sellingPrice: inventory.sellingPrice || "",
                      supplierName: inventory.supplierName || "",
                      supplierSKU: inventory.supplierSKU || "",
                      leadTimeDays: inventory.leadTimeDays || 0,
                      notes: inventory.notes || "",
                    });
                  }}
                  className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </form>
      </TabsContent>

      <TabsContent value="restock" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Restock Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRestock} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restockQuantity" className="text-black dark:text-white">Quantity to Add</Label>
                  <Input
                    id="restockQuantity"
                    type="number"
                    min="1"
                    value={restockData.quantity}
                    onChange={(e) => setRestockData({ ...restockData, quantity: parseInt(e.target.value) || 0 })}
                    className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                  />
                </div>
                <div>
                  <Label className="text-black dark:text-white">New Total Stock</Label>
                  <div className="mt-2 text-lg font-semibold text-green-600 dark:text-green-400">
                    {(formData.currentStock || 0) + restockData.quantity} units
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="restockNotes" className="text-black dark:text-white">Notes (Optional)</Label>
                <Textarea
                  id="restockNotes"
                  value={restockData.notes}
                  onChange={(e) => setRestockData({ ...restockData, notes: e.target.value })}
                  placeholder="Add notes about this restock..."
                  className="bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRestockData({ quantity: 0, notes: "" })}
                  className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={restockMutation.isPending || restockData.quantity <= 0}
                  className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                >
                  {restockMutation.isPending ? "Adding Stock..." : `Add ${restockData.quantity} Units`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <SalesHistoryTable inventorySku={inventory.sku} />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Stock Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${stockValue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Current inventory value</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Potential Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${potentialProfit.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">If all stock sells</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Days Until Reorder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formData.currentStock <= formData.reorderPoint ? "NOW" : "TBD"}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Based on current stock</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
);
}