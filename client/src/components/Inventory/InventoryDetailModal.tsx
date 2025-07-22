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
import { Package, Calendar, User, Building, TrendingUp, BarChart3, History, Plus, Edit, Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/api/inventory/${inventory.id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      toast({
        title: "Product deleted successfully",
        description: "The inventory item has been removed.",
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete product",
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

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${formData.name}? This action cannot be undone.`)) {
      deleteMutation.mutate();
    }
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
            {!isEditing ? (
              // Display Mode
              <div className="space-y-6">
                {/* Product Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Product Name</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{formData.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">SKU</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{formData.sku}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{formData.category}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Stock Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stock Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Current Stock</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{formData.currentStock || 0} units</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Reorder Point</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{formData.reorderPoint || 0} units</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Stock Status</Label>
                      <div className="mt-1">
                        {getStockStatus()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pricing Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Cost Price</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        ${parseFloat(formData.costPrice || "0").toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Selling Price</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        ${parseFloat(formData.sellingPrice || "0").toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Stock Value</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        ${stockValue.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Potential Profit</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        ${potentialProfit.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Supplier Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Supplier Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Supplier Name</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formData.supplierName || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Supplier SKU</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formData.supplierSKU || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Lead Time (Days)</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formData.leadTimeDays || 0} days
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formData.notes || "No notes"}
                    </p>
                  </CardContent>
                </Card>

                {/* Edit Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Edit Product Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Product Info - Editable */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Product Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">SKU</Label>
                        <Input
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Beauty">Beauty</SelectItem>
                            <SelectItem value="Home">Home</SelectItem>
                            <SelectItem value="Books">Books</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Automotive">Automotive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Stock Information - Display Only */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-4">Stock Information</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Current Stock</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{formData.currentStock || 0} units</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Reorder Point</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{formData.reorderPoint || 0} units</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Stock Status</Label>
                          <div className="mt-1">
                            {getStockStatus()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Information - Editable */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-4">Pricing Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Cost Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.costPrice}
                            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Selling Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.sellingPrice}
                            onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                            className="mt-1"
                            required
                          />
                        </div>
                      </div>
                      
                      {/* Reactive Fields */}
                      <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Stock Value</Label>
                          <p className="text-sm font-medium">
                            ${((formData.currentStock || 0) * parseFloat(formData.costPrice || "0")).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Potential Profit</Label>
                          <p className="text-sm font-medium">
                            ${((formData.currentStock || 0) * (parseFloat(formData.sellingPrice || "0") - parseFloat(formData.costPrice || "0"))).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Supplier Information - Editable */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-4">Supplier Information</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Supplier Name</Label>
                          <Input
                            value={formData.supplierName}
                            onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                            className="mt-1"
                            placeholder="Enter supplier name"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Supplier SKU</Label>
                          <Input
                            value={formData.supplierSKU}
                            onChange={(e) => setFormData({ ...formData, supplierSKU: e.target.value })}
                            className="mt-1"
                            placeholder="Enter supplier SKU"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Lead Time (Days)</Label>
                          <Input
                            type="number"
                            value={formData.leadTimeDays}
                            onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 0 })}
                            className="mt-1"
                            placeholder="Lead time in days"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes - Editable */}
                    <div className="border-t pt-4">
                      <Label className="text-sm font-medium">Notes (optional)</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="mt-1"
                        placeholder="Additional notes"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4 border-t">
                      <Button 
                        type="button" 
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </Button>
                      <div className="flex gap-2">
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
                        >
                          Close
                        </Button>
                        <Button 
                          type="submit"
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? "Saving..." : "Edit Details"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </form>
            )}
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