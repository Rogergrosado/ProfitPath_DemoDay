import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { ProductTable } from "@/components/Products/ProductTable";
import { AddProductModal } from "@/components/Products/AddProductModal";
import { PromoteToInventoryModal } from "@/components/Products/PromoteToInventoryModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  TrendingUp, 
  Package, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";

export default function Products() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeView, setActiveView] = useState("watchlist");

  const { data: watchlistProducts = [] } = useQuery({
    queryKey: ["/api/products/watchlist"],
    enabled: !!user,
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["/api/inventory"],
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d0f13] flex items-center justify-center">
        <div className="text-black dark:text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0f13] text-black dark:text-white flex">
      <Sidebar />
      <ThemeToggle />
      
      <main className="flex-1 ml-64 p-6">
        <div className="fade-in">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Product Workshop</h1>
                <p className="text-gray-600 dark:text-slate-400">Research, validate, and track products before launching to inventory</p>
              </div>
              <div className="flex space-x-2">
                <AddProductModal>
                  <Button className="bg-[#fd7014] hover:bg-[#e5640f] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </AddProductModal>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="mb-6">
            <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setActiveView("watchlist")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "watchlist"
                    ? "bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Watchlist Products
              </button>
              <button
                onClick={() => setActiveView("inventory")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "inventory"
                    ? "bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />
                Active Inventory
              </button>
            </div>
          </div>

          {/* Dynamic Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {activeView === "watchlist" ? (
              <>
                <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Products Tracked</p>
                        <p className="text-2xl font-bold text-black dark:text-white">{watchlistProducts.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Eye className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Ready to Launch</p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                          {watchlistProducts.filter((p: any) => p.status === "ready_to_launch").length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/10 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Avg. Est. Price</p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                          ${Math.round(watchlistProducts.reduce((sum: number, p: any) => sum + (parseFloat(p.estimatedPrice || 0)), 0) / (watchlistProducts.length || 1))}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-purple-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">In Research</p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                          {watchlistProducts.filter((p: any) => p.status === "researching").length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500/10 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-orange-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total SKUs</p>
                        <p className="text-2xl font-bold text-black dark:text-white">{inventoryItems.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Value</p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                          ${Math.round(inventoryItems.reduce((sum: number, item: any) => sum + ((item.currentStock || 0) * parseFloat(item.sellingPrice || 0)), 0))}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/10 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Low Stock</p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                          {inventoryItems.filter((item: any) => (item.currentStock || 0) <= (item.reorderPoint || 0)).length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Out of Stock</p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                          {inventoryItems.filter((item: any) => (item.currentStock || 0) === 0).length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-500/10 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Filters */}
          <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700 mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-black dark:text-white">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white focus:ring-[#fd7014] focus:border-[#fd7014]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="home-garden">Home & Garden</SelectItem>
                      <SelectItem value="sports-outdoors">Sports & Outdoors</SelectItem>
                      <SelectItem value="health-beauty">Health & Beauty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-black dark:text-white">Price Range</label>
                  <Select>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white focus:ring-[#fd7014] focus:border-[#fd7014]">
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                      <SelectItem value="all">Any Price</SelectItem>
                      <SelectItem value="0-25">$0 - $25</SelectItem>
                      <SelectItem value="25-100">$25 - $100</SelectItem>
                      <SelectItem value="100+">$100+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-black dark:text-white">Competition</label>
                  <Select>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white focus:ring-[#fd7014] focus:border-[#fd7014]">
                      <SelectValue placeholder="Any Level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                      <SelectItem value="all">Any Level</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-black dark:text-white">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white focus:ring-[#fd7014] focus:border-[#fd7014]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="researching">Researching</SelectItem>
                      <SelectItem value="validated">Validated</SelectItem>
                      <SelectItem value="ready_to_launch">Ready to Launch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Content */}
          {activeView === "watchlist" ? (
            <WatchlistProductsView 
              products={watchlistProducts}
              selectedCategory={selectedCategory}
              selectedStatus={selectedStatus}
            />
          ) : (
            <InventoryItemsView 
              items={inventoryItems}
              selectedCategory={selectedCategory}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Watchlist Products View Component
function WatchlistProductsView({ 
  products, 
  selectedCategory, 
  selectedStatus 
}: { 
  products: any[], 
  selectedCategory: string, 
  selectedStatus: string 
}) {
  const filteredProducts = products.filter((product: any) => {
    const categoryMatch = selectedCategory === "all" || product.category === selectedCategory;
    const statusMatch = selectedStatus === "all" || product.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "researching":
        return <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400">Researching</Badge>;
      case "validated":
        return <Badge className="bg-green-500/20 text-green-600 dark:text-green-400">Validated</Badge>;
      case "ready_to_launch":
        return <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400">Ready to Launch</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-600 dark:text-gray-400">{status}</Badge>;
    }
  };

  const getCompetitionBadge = (competition: string) => {
    switch (competition) {
      case "low":
        return <Badge className="bg-green-500/20 text-green-600 dark:text-green-400">Low</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">Medium</Badge>;
      case "high":
        return <Badge className="bg-red-500/20 text-red-600 dark:text-red-400">High</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-600 dark:text-gray-400">Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-black dark:text-white">Watchlist Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products in watchlist</h3>
              <p className="text-gray-500 dark:text-gray-400">Start by adding products you want to research and track.</p>
            </div>
          ) : (
            filteredProducts.map((product: any) => (
              <div key={product.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-black dark:text-white">{product.name}</h3>
                      {getStatusBadge(product.status)}
                      {product.competition && getCompetitionBadge(product.competition)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{product.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Category:</span>
                        <p className="text-black dark:text-white">{product.category}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Est. Price:</span>
                        <p className="text-black dark:text-white">${product.estimatedPrice || "N/A"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Demand Score:</span>
                        <p className="text-black dark:text-white">{product.demandScore || "N/A"}/100</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Added:</span>
                        <p className="text-black dark:text-white">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {product.status === "ready_to_launch" && (
                      <PromoteToInventoryModal productId={product.id}>
                        <Button size="sm" className="bg-[#fd7014] hover:bg-[#e5640f] text-white">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Promote
                        </Button>
                      </PromoteToInventoryModal>
                    )}
                    <Button variant="outline" size="sm" className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Inventory Items View Component  
function InventoryItemsView({ 
  items, 
  selectedCategory 
}: { 
  items: any[], 
  selectedCategory: string 
}) {
  const filteredItems = items.filter((item: any) => {
    return selectedCategory === "all" || item.category === selectedCategory;
  });

  const getStockStatus = (item: any) => {
    const available = (item.currentStock || 0) - (item.reservedStock || 0);
    const reorderPoint = item.reorderPoint || 0;
    
    if (available <= reorderPoint) {
      return <Badge className="bg-red-500/20 text-red-600 dark:text-red-400">Low Stock</Badge>;
    } else if (available <= reorderPoint * 1.5) {
      return <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">Reorder Soon</Badge>;
    } else {
      return <Badge className="bg-green-500/20 text-green-600 dark:text-green-400">In Stock</Badge>;
    }
  };

  return (
    <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-black dark:text-white">Active Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No inventory items</h3>
              <p className="text-gray-500 dark:text-gray-400">Promote products from your watchlist to start tracking inventory.</p>
            </div>
          ) : (
            filteredItems.map((item: any) => (
              <div key={item.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-black dark:text-white">{item.name}</h3>
                      <Badge className="bg-gray-500/20 text-gray-600 dark:text-gray-400">{item.sku}</Badge>
                      {getStockStatus(item)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Category:</span>
                        <p className="text-black dark:text-white">{item.category}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Stock:</span>
                        <p className="text-black dark:text-white">{item.currentStock || 0} units</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Cost Price:</span>
                        <p className="text-black dark:text-white">${item.costPrice || "N/A"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Selling Price:</span>
                        <p className="text-black dark:text-white">${item.sellingPrice || "N/A"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Value:</span>
                        <p className="text-black dark:text-white">
                          ${Math.round((item.currentStock || 0) * parseFloat(item.sellingPrice || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm" className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">
                      Update Stock
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
