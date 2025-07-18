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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Plus } from "lucide-react";

interface AddInventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddInventoryModal({ open, onOpenChange }: AddInventoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    currentStock: 0,
    reorderPoint: 0,
    costPrice: "",
    sellingPrice: "",
    supplierName: "",
    supplierSKU: "",
    leadTimeDays: 7,
    notes: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/inventory", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Inventory item created successfully",
        description: "The new inventory item has been added to your system.",
      });
      onOpenChange(false);
      resetForm();
      // Force refresh inventory data
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.refetchQueries({ queryKey: ["/api/inventory"] });
      // Also refresh any related queries
      queryClient.invalidateQueries({ queryKey: ["/api"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create inventory item",
        description: error.message || "Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      category: "",
      currentStock: 0,
      reorderPoint: 0,
      costPrice: "",
      sellingPrice: "",
      supplierName: "",
      supplierSKU: "",
      leadTimeDays: 7,
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.sku || !formData.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (Name, SKU, Category).",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.costPrice) < 0 || parseFloat(formData.sellingPrice) < 0) {
      toast({
        title: "Invalid pricing",
        description: "Cost and selling prices must be positive numbers.",
        variant: "destructive",
      });
      return;
    }

    // Prepare data according to current database schema
    const submissionData = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category || null,
      currentStock: formData.currentStock || 0,
      reservedStock: 0,
      reorderPoint: formData.reorderPoint || 0,
      costPrice: formData.costPrice ? parseFloat(formData.costPrice).toString() : null,
      sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice).toString() : null,
    };

    createMutation.mutate(submissionData);
  };

  const generateSKU = () => {
    const prefix = formData.name.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const timestamp = Date.now().toString().slice(-3);
    setFormData({ ...formData, sku: `${prefix}-${timestamp}-${random}` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center text-black dark:text-white">
            <Package className="h-5 w-5 mr-2 text-[#fd7014]" />
            Add New Inventory Item
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Add a new inventory item with complete product details, pricing, and stock information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black dark:text-white">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-black dark:text-white">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sku" className="text-black dark:text-white">SKU *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Product SKU"
                    className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSKU}
                    className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="category" className="text-black dark:text-white">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="home-garden">Home & Garden</SelectItem>
                  <SelectItem value="sports-outdoors">Sports & Outdoors</SelectItem>
                  <SelectItem value="health-beauty">Health & Beauty</SelectItem>
                  <SelectItem value="toys-games">Toys & Games</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stock Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black dark:text-white">Stock Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentStock" className="text-black dark:text-white">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
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
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                />
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
                  placeholder="0.00"
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
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
                  placeholder="0.00"
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                />
              </div>
            </div>
            {parseFloat(formData.costPrice) > 0 && parseFloat(formData.sellingPrice) > 0 && (
              <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Profit Margin: {(((parseFloat(formData.sellingPrice) - parseFloat(formData.costPrice)) / parseFloat(formData.sellingPrice)) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Profit per Unit: ${(parseFloat(formData.sellingPrice) - parseFloat(formData.costPrice)).toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Supplier Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black dark:text-white">Supplier Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplierName" className="text-black dark:text-white">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="Supplier company name"
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="supplierSKU" className="text-black dark:text-white">Supplier SKU</Label>
                <Input
                  id="supplierSKU"
                  value={formData.supplierSKU}
                  onChange={(e) => setFormData({ ...formData, supplierSKU: e.target.value })}
                  placeholder="Supplier's product code"
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
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
                onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 7 })}
                className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
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
              placeholder="Add any additional notes about this inventory item..."
              className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white"
              rows={3}
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
            >
              {createMutation.isPending ? "Creating..." : "Create Inventory Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}