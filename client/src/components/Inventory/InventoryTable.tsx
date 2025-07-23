import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionToolbar } from "./BulkActionToolbar";
import { Edit, Package as PackageRestock, Package, AlertTriangle, TrendingUp, CheckSquare } from "lucide-react";
import { 
  ProfitTooltip, 
  VelocityTooltip, 
  StockTooltip, 
  PricingTooltip 
} from "@/components/Inventory/InventoryTooltip";

interface InventoryTableProps {
  items: any[];
  onEdit: (item: any) => void;
  onRestock: (item: any) => void;
  onAnalytics?: (item: any) => void;
}

export function InventoryTable({ items, onEdit, onRestock, onAnalytics }: InventoryTableProps) {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems([...items]);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (item: any, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    }
  };

  const isSelected = (item: any) => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  const isAllSelected = items.length > 0 && selectedItems.length === items.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < items.length;

  const handleBulkActionComplete = () => {
    setSelectedItems([]);
  };

  const getStockStatus = (item: any) => {
    const currentStock = item.currentStock || 0;
    const reorderPoint = item.reorderPoint || 0;
    
    if (currentStock === 0) {
      return <Badge className="bg-red-500/20 text-red-600 dark:text-red-400">Out of Stock</Badge>;
    } else if (currentStock <= reorderPoint) {
      return <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-500/20 text-green-600 dark:text-green-400">In Stock</Badge>;
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  if (items.length === 0) {
    return (
      <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No inventory items found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or promote products from your watchlist.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <BulkActionToolbar 
        selectedItems={selectedItems}
        onSelectionClear={() => setSelectedItems([])}
        onActionComplete={handleBulkActionComplete}
      />
      
      <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-black dark:text-white">
            <span>Inventory Items</span>
            {selectedItems.length > 0 && (
              <Badge variant="secondary" className="bg-[#fd7014] text-white">
                {selectedItems.length} selected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-600">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400 w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-[#fd7014] data-[state=checked]:border-[#fd7014]"
                  />
                </th>
                <StockTooltip>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400 cursor-help">Product</th>
                </StockTooltip>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Category</th>
                <VelocityTooltip>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400 cursor-help">Stock</th>
                </VelocityTooltip>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                <PricingTooltip>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400 cursor-help">Cost</th>
                </PricingTooltip>
                <ProfitTooltip>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400 cursor-help">Price</th>
                </ProfitTooltip>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Value</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
              {items.map((item) => {
                const stockValue = (item.currentStock || 0) * parseFloat(item.sellingPrice || 0);
                return (
                  <tr key={item.id} className={`hover:bg-gray-100 dark:hover:bg-slate-700/50 ${isSelected(item) ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}>
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={isSelected(item)}
                        onCheckedChange={(checked) => handleSelectItem(item, !!checked)}
                        className="data-[state=checked]:bg-[#fd7014] data-[state=checked]:border-[#fd7014]"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-black dark:text-white">{item.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Updated {new Date(item.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm text-black dark:text-white">{item.sku}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-black dark:text-white">{item.category}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-black dark:text-white">{item.currentStock || 0} units</div>
                        {(item.reorderPoint || 0) > 0 && (
                          <div className="text-gray-500 dark:text-gray-400">
                            Reorder at {item.reorderPoint}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStockStatus(item)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-black dark:text-white">{formatCurrency(item.costPrice || 0)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-black dark:text-white">{formatCurrency(item.sellingPrice || 0)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-black dark:text-white">
                        {formatCurrency(stockValue)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(item)}
                          className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onRestock(item)}
                          className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                          title="Restock Product"
                        >
                          <PackageRestock className="h-4 w-4" />
                        </Button>
                        {onAnalytics && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAnalytics(item)}
                            className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700/20"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </CardContent>
      </Card>
    </>
  );
}