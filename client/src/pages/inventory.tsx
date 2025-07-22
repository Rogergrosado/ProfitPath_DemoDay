import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { InventoryTable } from "@/components/Inventory/InventoryTable";
import { InventoryDetailModal } from "@/components/Inventory/InventoryDetailModal";
import { SalesEntryModal } from "@/components/Inventory/SalesEntryModal";
import { InventoryImport } from "@/components/Inventory/InventoryImport";
import { ReorderCalendar } from "@/components/Inventory/ReorderCalendar";
import { AddInventoryModal } from "@/components/Inventory/AddInventoryModal";
import { RealTimeAlerts } from "@/components/Inventory/RealTimeAlerts";
import { AnalyticsModal } from "@/components/Inventory/AnalyticsModal";
import { AdvancedReorderCalendar } from "@/components/Inventory/AdvancedReorderCalendar";
import { CalendarView } from "@/components/Inventory/CalendarView";
import { SalesHistoryTable } from "@/components/Inventory/SalesHistoryTable";
import PerformanceSyncModal from "@/components/modals/PerformanceSyncModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Upload,
  Download,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  ShoppingCart,
  BarChart3
} from "lucide-react";

export default function Inventory() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [selectedInventory, setSelectedInventory] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync function for inventory changes
  const handleInventorySync = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch('/api/performance/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        // Invalidate performance cache to trigger refetch
        queryClient.invalidateQueries({ queryKey: ["/api/performance/metrics"] });
        setTimeout(() => setIsSyncing(false), 1500);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setIsSyncing(false);
    }
  };

  // Fetch user profile for personalization
  const { data: userProfile } = useQuery({
    queryKey: ["/api/user/profile"],
    enabled: !!user,
  });

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["/api/inventory"],
    enabled: !!user,
  });

  if (loading || isLoading) {
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

  // Calculate inventory metrics
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum: number, item: any) => 
    sum + ((item.currentStock || 0) * parseFloat(item.sellingPrice || 0)), 0
  );
  const lowStockItems = inventory.filter((item: any) => 
    (item.currentStock || 0) <= (item.reorderPoint || 0)
  ).length;
  const outOfStockItems = inventory.filter((item: any) => 
    (item.currentStock || 0) === 0
  ).length;

  // Filter inventory items
  const filteredItems = inventory.filter((item: any) => {
    const categoryMatch = selectedCategory === "all" || item.category === selectedCategory;
    let stockMatch = true;
    
    if (stockFilter === "low") {
      stockMatch = (item.currentStock || 0) <= (item.reorderPoint || 0) && (item.currentStock || 0) > 0;
    } else if (stockFilter === "out") {
      stockMatch = (item.currentStock || 0) === 0;
    } else if (stockFilter === "in-stock") {
      stockMatch = (item.currentStock || 0) > (item.reorderPoint || 0);
    }
    
    return categoryMatch && stockMatch;
  });

  const handleEditInventory = (item: any) => {
    setSelectedInventory(item);
    setShowDetailModal(true);
  };

  const handleAddSale = (item: any) => {
    setSelectedInventory(item);
    setShowSalesModal(true);
  };

  const handleAnalytics = (item: any) => {
    setSelectedInventory(item);
    setShowAnalyticsModal(true);
  };

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
                <h1 className="text-3xl font-bold mb-2">
                  {userProfile?.businessName ? `${userProfile.businessName} Inventory` : 'Inventory Management'}
                </h1>
                <p className="text-gray-600 dark:text-slate-400">
                  {userProfile?.businessName 
                    ? `Central hub for managing ${userProfile.businessName} launched, stocked, and sell-ready products`
                    : "Central hub for managing launched, stocked, and sell-ready products"
                  }
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowImportModal(true)}
                  className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
                <Button 
                  onClick={handleInventorySync}
                  disabled={isSyncing}
                  variant="outline"
                  className="border-[#fd7014] text-[#fd7014] hover:bg-[#fd7014]/10"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Performance'}
                </Button>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manual Entry
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total SKUs</p>
                    <p className="text-2xl font-bold text-black dark:text-white">{totalItems}</p>
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
                    <p className="text-2xl font-bold text-black dark:text-white">${Math.round(totalValue).toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Low Stock Alerts</p>
                    <p className="text-2xl font-bold text-black dark:text-white">{lowStockItems}</p>
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
                    <p className="text-2xl font-bold text-black dark:text-white">{outOfStockItems}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/10 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-[#222831]">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="alerts" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Real-Time Alerts
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Advanced Calendar
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Filters */}
              <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-black dark:text-white">Category</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white">
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
                      <label className="block text-sm font-medium mb-2 text-black dark:text-white">Stock Status</label>
                      <Select value={stockFilter} onValueChange={setStockFilter}>
                        <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white">
                          <SelectValue placeholder="All Stock Levels" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                          <SelectItem value="all">All Stock Levels</SelectItem>
                          <SelectItem value="in-stock">In Stock</SelectItem>
                          <SelectItem value="low">Low Stock</SelectItem>
                          <SelectItem value="out">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button variant="outline" className="w-full border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">
                        <Search className="h-4 w-4 mr-2" />
                        Search SKUs
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory Table */}
              <InventoryTable 
                items={filteredItems}
                onEdit={handleEditInventory}
                onAddSale={handleAddSale}
                onAnalytics={handleAnalytics}
              />
            </TabsContent>

            <TabsContent value="alerts">
              <RealTimeAlerts />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CalendarView type="sales" />
                <CalendarView type="reorder" />
              </div>
              <div className="grid grid-cols-1 gap-6">
                <SalesHistoryTable />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stock Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Stock Turn Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2.4x</div>
                    <p className="text-xs text-gray-500">Avg monthly turnover</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Days of Supply</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">45 days</div>
                    <p className="text-xs text-gray-500">At current sales rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Reorder Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      ${(inventory?.reduce((sum: number, item: any) => 
                        sum + ((item.reorderPoint || 0) * parseFloat(item.costPrice || "0")), 0) || 0).toFixed(0)}
                    </div>
                    <p className="text-xs text-gray-500">Suggested reorder amount</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Advanced analytics will show inventory performance insights once more sales data is available.</p>
                    <p className="text-sm mt-2">Record sales transactions to unlock detailed inventory analytics.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Inventory Reports</h3>
                <p className="text-muted-foreground">Generate detailed inventory reports and analytics</p>
                <Button 
                  onClick={() => setLocation('/reports')}
                  className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                >
                  Go to Advanced Report Builder
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Modals */}
          {showDetailModal && selectedInventory && (
            <InventoryDetailModal 
              inventory={selectedInventory}
              open={showDetailModal}
              onOpenChange={setShowDetailModal}
            />
          )}

          {showSalesModal && selectedInventory && (
            <SalesEntryModal
              inventory={selectedInventory}
              open={showSalesModal}
              onOpenChange={setShowSalesModal}
            />
          )}

          {showImportModal && (
            <InventoryImport
              open={showImportModal}
              onOpenChange={setShowImportModal}
            />
          )}

          {showAddModal && (
            <AddInventoryModal
              open={showAddModal}
              onOpenChange={setShowAddModal}
            />
          )}

          {showAnalyticsModal && selectedInventory && (
            <AnalyticsModal
              isOpen={showAnalyticsModal}
              onClose={() => setShowAnalyticsModal(false)}
              inventory={selectedInventory}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Analytics Component
function InventoryAnalytics({ items }: { items: any[] }) {
  const categoryBreakdown = items.reduce((acc: any, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { count: 0, value: 0 };
    }
    acc[category].count += 1;
    acc[category].value += (item.currentStock || 0) * parseFloat(item.sellingPrice || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-black dark:text-white">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryBreakdown).map(([category, data]: [string, any]) => (
              <div key={category} className="flex justify-between items-center p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div>
                  <h3 className="font-semibold text-black dark:text-white">{category}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{data.count} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black dark:text-white">${Math.round(data.value).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
