import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Inventory } from "@shared/schema";

export function InventoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const reorderMutation = useMutation({
    mutationFn: (item: Inventory) =>
      apiRequest("PUT", `/api/inventory/${item.id}`, {
        currentStock: (item.currentStock || 0) + 100, // Add 100 units
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({ title: "Inventory updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update inventory", variant: "destructive" });
    },
  });

  const filteredInventory = inventory.filter((item: Inventory) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (item: Inventory) => {
    const availableStock = (item.currentStock || 0) - (item.reservedStock || 0);
    const reorderPoint = item.reorderPoint || 0;

    if (availableStock <= 0) {
      return { label: "Out of Stock", color: "bg-red-500/20 text-red-400" };
    } else if (availableStock <= reorderPoint) {
      return { label: "Low Stock", color: "bg-red-500/20 text-red-400" };
    } else if (availableStock <= reorderPoint * 1.5) {
      return { label: "Reorder Soon", color: "bg-yellow-500/20 text-yellow-400" };
    }
    return null;
  };

  const handleSelectItem = (itemId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredInventory.map((item: Inventory) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[hsl(240,10%,13%)] rounded-xl border border-[hsl(240,3.7%,15.9%)] overflow-hidden">
        <div className="p-6 text-slate-400">Loading inventory...</div>
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="bg-[hsl(240,10%,13%)] rounded-xl border border-[hsl(240,3.7%,15.9%)] overflow-hidden">
        <div className="p-6 text-center text-slate-400">
          No inventory items found. Add your first inventory item to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-[hsl(240,10%,13%)] rounded-xl p-6 border border-[hsl(240,3.7%,15.9%)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search by SKU, name, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-white focus:ring-[hsl(20,90%,54%)] focus:border-[hsl(20,90%,54%)]"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[hsl(240,10%,13%)] rounded-xl border border-[hsl(240,3.7%,15.9%)] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-800">
              <TableRow>
                <TableHead className="text-white">
                  <Checkbox
                    checked={
                      filteredInventory.length > 0 &&
                      selectedItems.length === filteredInventory.length
                    }
                    onCheckedChange={handleSelectAll}
                    className="border-slate-600 text-[hsl(20,90%,54%)] focus:ring-[hsl(20,90%,54%)]"
                  />
                </TableHead>
                <TableHead className="text-white">Product</TableHead>
                <TableHead className="text-white">SKU</TableHead>
                <TableHead className="text-white">Current Stock</TableHead>
                <TableHead className="text-white">Reserved</TableHead>
                <TableHead className="text-white">Available</TableHead>
                <TableHead className="text-white">Reorder Point</TableHead>
                <TableHead className="text-white">Last Updated</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item: Inventory, index: number) => {
                const availableStock = (item.currentStock || 0) - (item.reservedStock || 0);
                const stockStatus = getStockStatus(item);
                const rowClass = index % 2 === 0 ? "bg-slate-800" : "bg-slate-900";

                return (
                  <TableRow
                    key={item.id}
                    className={`border-t border-slate-600 hover:bg-slate-700 ${rowClass}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                        className="border-slate-600 text-[hsl(20,90%,54%)] focus:ring-[hsl(20,90%,54%)]"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-white">{item.name}</div>
                          <div className="text-sm text-slate-400">{item.category}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300 font-mono">{item.sku}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-white">{item.currentStock || 0}</span>
                    </TableCell>
                    <TableCell className="text-slate-300">{item.reservedStock || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-semibold ${
                            availableStock <= 0
                              ? "text-red-400"
                              : availableStock <= (item.reorderPoint || 0)
                              ? "text-yellow-400"
                              : "text-green-400"
                          }`}
                        >
                          {availableStock}
                        </span>
                        {stockStatus && (
                          <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{item.reorderPoint || 0}</TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {item.lastUpdated
                        ? new Date(item.lastUpdated).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="default"
                          className={`${
                            stockStatus?.label === "Low Stock" || stockStatus?.label === "Out of Stock"
                              ? "bg-red-500 hover:bg-red-400"
                              : "bg-[hsl(20,90%,54%)] hover:bg-orange-400"
                          } text-white transition-all duration-200 hover:scale-105`}
                          onClick={() => reorderMutation.mutate(item)}
                          disabled={reorderMutation.isPending}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
