import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeaders, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SortableTableHeader, PaginationControls } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";
import { Package, ArrowRight, Eye, Edit, Trash2, TrendingUp } from "lucide-react";
interface Product {
  id: number;
  userId: number;
  name: string;
  description?: string;
  category: string;
  estimatedPrice: string | null;
  competitionLevel: string;
  status: string;
}

interface PaginatedWatchlistTableProps {
  className?: string;
}

export function PaginatedWatchlistTable({ className }: PaginatedWatchlistTableProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const pagination = usePagination({
    initialPageSize: 10,
    initialSortBy: 'name',
    initialOrder: 'asc'
  });

  const { data, isLoading } = useQuery({
    queryKey: ["/api/products/watchlist", pagination.getQueryParams().toString()],
    enabled: !!user,
    queryFn: async () => {
      const authHeaders = await getAuthHeaders();
      const params = pagination.getQueryParams();
      
      const response = await fetch(`/api/products/watchlist?${params.toString()}`, {
        headers: authHeaders
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist products');
      }
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/products/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/watchlist"] });
    }
  });

  const products = data?.results || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || pagination.page;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'researching':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">🔍 Researching</Badge>;
      case 'validated':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ Validated</Badge>;
      case 'ready_to_launch':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">🚀 Ready</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to remove this product from your watchlist?')) {
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
                onSort={() => pagination.setSorting('category')}
                sortDirection={pagination.sortBy === 'category' ? pagination.order : null}
              >
                Category
              </SortableTableHeader>
              <SortableTableHeader
                onSort={() => pagination.setSorting('estimatedPrice')}
                sortDirection={pagination.sortBy === 'estimatedPrice' ? pagination.order : null}
              >
                Est. Price
              </SortableTableHeader>
              <SortableTableHeader
                onSort={() => pagination.setSorting('competitionLevel')}
                sortDirection={pagination.sortBy === 'competitionLevel' ? pagination.order : null}
              >
                Competition
              </SortableTableHeader>
              <SortableTableHeader
                onSort={() => pagination.setSorting('status')}
                sortDirection={pagination.sortBy === 'status' ? pagination.order : null}
              >
                Status
              </SortableTableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: Product) => (
              <tr 
                key={product.id} 
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <div className="font-medium text-black dark:text-white">{product.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-black dark:text-white">{product.category}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="text-black dark:text-white font-medium">
                    {formatCurrency(product.estimatedPrice)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className={`h-4 w-4 ${
                      product.competitionLevel === 'High' ? 'text-red-500' :
                      product.competitionLevel === 'Medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      product.competitionLevel === 'High' ? 'text-red-600 dark:text-red-400' :
                      product.competitionLevel === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {product.competitionLevel}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {getStatusBadge(product.status)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                      title="Promote to Inventory"
                    >
                      <ArrowRight className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                      title="Remove from Watchlist"
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

      {products.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No products in your watchlist.
        </div>
      )}

      {products.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          totalItems={data?.totalItems}
        />
      )}
    </div>
  );
}