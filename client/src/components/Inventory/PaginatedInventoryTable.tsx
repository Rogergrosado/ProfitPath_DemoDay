import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeaders, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InventoryDetailModal } from "@/components/Inventory/InventoryDetailModal";
import { SalesEntryModal } from "@/components/Inventory/SalesEntryModal";
import { SortableTableHeader, PaginationControls } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";
import { Package, DollarSign, BarChart3, Eye, Edit, Trash2 } from "lucide-react";
interface InventoryItem {
  id: number;
  userId: number;
  productId?: number;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  reservedStock?: number;
  reorderPoint: number;
  costPrice: string | null;
  sellingPrice: string | null;
  imageUrl?: string;
}

interface PaginatedInventoryTableProps {
  className?: string;
}

export function PaginatedInventoryTable({ className }: PaginatedInventoryTableProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);

  const pagination = usePagination({
    initialPageSize: 10,
    initialSortBy: 'name',
    initialOrder: 'asc'
  });

  const { data, isLoading } = useQuery({
    queryKey: ["/api/inventory", pagination.getQueryParams().toString()],
    enabled: !!user,
    queryFn: async () => {
      const authHeaders = await getAuthHeaders();
      const params = pagination.getQueryParams();
      
      const response = await fetch(`/api/inventory?${params.toString()}`, {
        headers: authHeaders
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/inventory/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    }
  });

  const inventoryItems = data?.results || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || pagination.page;

  const getStockStatus = (item: InventoryItem) => {
    const stock = item.currentStock || 0;
    const reorderPoint = item.reorderPoint || 0;
    
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock <= reorderPoint) {
      return <Badge className="bg-yellow-500 text-white">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white">In Stock</Badge>;
    }
  };

  const formatCurrency = (amount: string | number | null) => {
    if (!amount) return '$0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSalesEntry = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowSalesModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <SortableTableHeader
                onSort={() => pagination.setSorting('name')}
                sortDirection={pagination.sortBy === 'name' ? pagination.order : null}
              >
                Product
              </SortableTableHeader>
              <SortableTableHeader
                onSort={() => pagination.setSorting('sku')}
                sortDirection={pagination.sortBy === 'sku' ? pagination.order : null}
              >
                SKU
              </SortableTableHeader>
              <SortableTableHeader
                onSort={() => pagination.setSorting('category')}
                sortDirection={pagination.sortBy === 'category' ? pagination.order : null}
              >
                Category
              </SortableTableHeader>
              <SortableTableHeader
                onSort={() => pagination.setSorting('currentStock')}
                sortDirection={pagination.sortBy === 'currentStock' ? pagination.order : null}
              >
                Stock
              </SortableTableHeader>
              <SortableTableHeader
                onSort={() => pagination.setSorting('sellingPrice')}
                sortDirection={pagination.sortBy === 'sellingPrice' ? pagination.order : null}
              >
                Price
              </SortableTableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {inventoryItems.map((item: InventoryItem) => (
              <tr 
                key={item.id} 
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <div className="font-medium text-black dark:text-white">{item.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        ID: {item.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm text-black dark:text-white">
                    {item.sku}
                  </code>
                </td>
                <td className="py-4 px-4">
                  <span className="text-black dark:text-white">{item.category}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="text-black dark:text-white font-medium">
                    {item.currentStock || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Reorder: {item.reorderPoint || 0}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-black dark:text-white font-medium">
                    {formatCurrency(item.sellingPrice)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Cost: {formatCurrency(item.costPrice)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  {getStockStatus(item)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSalesEntry(item)}
                      className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Record Sale"
                    >
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                      title="Delete Item"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inventoryItems.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No inventory items found.
        </div>
      )}

      {inventoryItems.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          totalItems={data?.totalItems}
        />
      )}

      {/* Modals */}
      {selectedItem && (
        <>
          <InventoryDetailModal
            inventory={selectedItem}
            open={showDetailModal}
            onOpenChange={(open) => {
              setShowDetailModal(open);
              if (!open) setSelectedItem(null);
            }}
          />

          <SalesEntryModal
            inventory={selectedItem}
            open={showSalesModal}
            onOpenChange={(open) => {
              setShowSalesModal(open);
              if (!open) setSelectedItem(null);
            }}
          />
        </>
      )}
    </div>
  );
}