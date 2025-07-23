import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit3,
  Trash2,
  Download,
  Tag,
  DollarSign,
  Package,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";

interface BulkActionToolbarProps {
  selectedItems: any[];
  onSelectionClear: () => void;
  onActionComplete: () => void;
}

interface BulkEditData {
  category?: string;
  costPrice?: number;
  sellingPrice?: number;
  reorderPoint?: number;
  supplierName?: string;
  leadTimeDays?: number;
}

export function BulkActionToolbar({ selectedItems, onSelectionClear, onActionComplete }: BulkActionToolbarProps) {
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<BulkEditData>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bulkEditMutation = useMutation({
    mutationFn: (data: { items: number[], updates: BulkEditData }) =>
      apiRequest("/api/inventory/bulk-edit", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (response) => {
      toast({
        title: "Bulk edit successful",
        description: `Updated ${response.updated} items successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setShowBulkEdit(false);
      setBulkEditData({});
      onActionComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Bulk edit failed",
        description: error.message || "Failed to update items",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (itemIds: number[]) =>
      apiRequest("/api/inventory/bulk-delete", {
        method: "DELETE",
        body: JSON.stringify({ items: itemIds }),
      }),
    onSuccess: (response) => {
      toast({
        title: "Bulk delete successful",
        description: `Deleted ${response.deleted} items successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setShowDeleteConfirm(false);
      onActionComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Bulk delete failed",
        description: error.message || "Failed to delete items",
        variant: "destructive",
      });
    },
  });

  const bulkCategoryMutation = useMutation({
    mutationFn: (data: { items: number[], category: string }) =>
      apiRequest("/api/inventory/bulk-category", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (response) => {
      toast({
        title: "Category update successful",
        description: `Updated category for ${response.updated} items`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      onActionComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Category update failed",
        description: error.message || "Failed to update categories",
        variant: "destructive",
      });
    },
  });

  const handleBulkEdit = () => {
    const itemIds = selectedItems.map(item => item.id);
    const updates = Object.fromEntries(
      Object.entries(bulkEditData).filter(([_, value]) => value !== undefined && value !== '')
    );

    if (Object.keys(updates).length === 0) {
      toast({
        title: "No changes specified",
        description: "Please specify at least one field to update",
        variant: "destructive",
      });
      return;
    }

    bulkEditMutation.mutate({ items: itemIds, updates });
  };

  const handleBulkDelete = () => {
    const itemIds = selectedItems.map(item => item.id);
    bulkDeleteMutation.mutate(itemIds);
  };

  const handleCategoryChange = (category: string) => {
    const itemIds = selectedItems.map(item => item.id);
    bulkCategoryMutation.mutate({ items: itemIds, category });
  };

  const handleExport = () => {
    const csvContent = [
      // Headers
      'Name,SKU,Category,Current Stock,Cost Price,Selling Price,Reorder Point,Supplier,Lead Time,Notes',
      // Data rows
      ...selectedItems.map(item => [
        item.name,
        item.sku,
        item.category,
        item.currentStock,
        item.costPrice,
        item.sellingPrice,
        item.reorderPoint,
        item.supplierName || '',
        item.leadTimeDays,
        item.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bulk_inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Exported ${selectedItems.length} items to CSV`,
    });
  };

  if (selectedItems.length === 0) return null;

  return (
    <>
      <Card className="mb-4 border-2 border-[#fd7014] bg-orange-50 dark:bg-orange-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-[#fd7014] text-white">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </Badge>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowBulkEdit(true)}
                  className="border-gray-300 dark:border-slate-600"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Bulk Edit
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="border-gray-300 dark:border-slate-600">
                      <Tag className="h-4 w-4 mr-1" />
                      Category
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleCategoryChange('electronics')}>
                      Electronics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCategoryChange('automotive')}>
                      Automotive
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCategoryChange('home')}>
                      Home & Garden
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCategoryChange('tools')}>
                      Tools
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCategoryChange('other')}>
                      Other
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExport}
                  className="border-gray-300 dark:border-slate-600"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>

                <Separator orientation="vertical" className="h-6" />

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={onSelectionClear}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Selection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEdit} onOpenChange={setShowBulkEdit}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Edit Items</DialogTitle>
            <DialogDescription>
              Update multiple items at once. Leave fields empty to keep existing values.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={bulkEditData.category || ''} onValueChange={(value) => setBulkEditData({...bulkEditData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="No change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No change</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="home">Home & Garden</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="supplier">Supplier Name</Label>
                <Input
                  id="supplier"
                  value={bulkEditData.supplierName || ''}
                  onChange={(e) => setBulkEditData({...bulkEditData, supplierName: e.target.value})}
                  placeholder="No change"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={bulkEditData.costPrice || ''}
                  onChange={(e) => setBulkEditData({...bulkEditData, costPrice: parseFloat(e.target.value) || undefined})}
                  placeholder="No change"
                />
              </div>

              <div>
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={bulkEditData.sellingPrice || ''}
                  onChange={(e) => setBulkEditData({...bulkEditData, sellingPrice: parseFloat(e.target.value) || undefined})}
                  placeholder="No change"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reorderPoint">Reorder Point</Label>
                <Input
                  id="reorderPoint"
                  type="number"
                  value={bulkEditData.reorderPoint || ''}
                  onChange={(e) => setBulkEditData({...bulkEditData, reorderPoint: parseInt(e.target.value) || undefined})}
                  placeholder="No change"
                />
              </div>

              <div>
                <Label htmlFor="leadTime">Lead Time (Days)</Label>
                <Input
                  id="leadTime"
                  type="number"
                  value={bulkEditData.leadTimeDays || ''}
                  onChange={(e) => setBulkEditData({...bulkEditData, leadTimeDays: parseInt(e.target.value) || undefined})}
                  placeholder="No change"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowBulkEdit(false)}
              disabled={bulkEditMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkEdit}
              disabled={bulkEditMutation.isPending}
              className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
            >
              {bulkEditMutation.isPending ? "Updating..." : `Update ${selectedItems.length} Items`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Bulk Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedItems.length} selected item{selectedItems.length !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
            <p className="text-sm text-red-700 dark:text-red-300">
              Items to be deleted:
            </p>
            <ul className="text-sm text-red-600 dark:text-red-400 mt-1 max-h-32 overflow-y-auto">
              {selectedItems.slice(0, 10).map(item => (
                <li key={item.id}>• {item.name} ({item.sku})</li>
              ))}
              {selectedItems.length > 10 && (
                <li>... and {selectedItems.length - 10} more items</li>
              )}
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={bulkDeleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              variant="destructive"
            >
              {bulkDeleteMutation.isPending ? "Deleting..." : `Delete ${selectedItems.length} Items`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}