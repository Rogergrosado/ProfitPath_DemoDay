import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export function ProductTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products/watchlist"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/watchlist"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    },
  });

  const promoteToInventoryMutation = useMutation({
    mutationFn: (product: Product) =>
      apiRequest("POST", "/api/inventory", {
        name: product.name,
        sku: product.sku || `SKU-${Date.now()}`,
        category: product.category,
        currentStock: 0,
        sellingPrice: product.estimatedPrice,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({ title: "Product promoted to inventory" });
    },
    onError: () => {
      toast({ title: "Failed to promote product", variant: "destructive" });
    },
  });

  const getCompetitionColor = (competition: string) => {
    switch (competition?.toLowerCase()) {
      case "low":
        return "bg-green-500/20 text-green-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "high":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "researching":
        return "bg-blue-500/20 text-blue-400";
      case "validated":
        return "bg-green-500/20 text-green-400";
      case "ready_to_launch":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[hsl(240,10%,13%)] rounded-xl border border-[hsl(240,3.7%,15.9%)] overflow-hidden">
        <div className="p-6 text-slate-400">Loading products...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-[hsl(240,10%,13%)] rounded-xl border border-[hsl(240,3.7%,15.9%)] overflow-hidden">
        <div className="p-6 text-center text-slate-400">
          No products in your watchlist. Add your first product to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(240,10%,13%)] rounded-xl border border-[hsl(240,3.7%,15.9%)] overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-800">
            <TableRow>
              <TableHead className="text-white">Product</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Est. Price</TableHead>
              <TableHead className="text-white">Competition</TableHead>
              <TableHead className="text-white">Demand Score</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product: Product) => (
              <TableRow key={product.id} className="border-t border-slate-600 hover:bg-slate-800">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-white">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-slate-400">{product.description}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-300">{product.category}</TableCell>
                <TableCell className="text-slate-300">
                  {product.estimatedPrice ? `$${product.estimatedPrice}` : "N/A"}
                </TableCell>
                <TableCell>
                  <Badge className={getCompetitionColor(product.competition || "")}>
                    {product.competition || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={product.demandScore || 0}
                      className="w-16 bg-slate-600"
                      style={{
                        "--progress-foreground": product.demandScore && product.demandScore > 70 ? "hsl(142, 76%, 36%)" : "hsl(20, 90%, 54%)",
                      } as React.CSSProperties}
                    />
                    <span className="text-sm text-slate-300">{product.demandScore || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(product.status || "")}>
                    {product.status?.replace("_", " ") || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[hsl(20,90%,54%)] hover:text-orange-300"
                      onClick={() => promoteToInventoryMutation.mutate(product)}
                      disabled={promoteToInventoryMutation.isPending}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-red-400"
                      onClick={() => deleteProductMutation.mutate(product.id)}
                      disabled={deleteProductMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
