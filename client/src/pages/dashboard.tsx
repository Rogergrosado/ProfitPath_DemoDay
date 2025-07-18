import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Eye,
  Target,
  ExternalLink
} from "lucide-react";

const COLORS = ['#fd7014', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState("30d");

  // API queries for dashboard data
  const { data: performanceMetrics } = useQuery({
    queryKey: ["/api/performance/metrics", dateRange],
    enabled: !!user,
  });

  const { data: inventorySummary } = useQuery({
    queryKey: ["/api/inventory/summary"],
    enabled: !!user,
  });

  const { data: salesData = [] } = useQuery({
    queryKey: ["/api/sales", dateRange],
    enabled: !!user,
  });

  const { data: watchlistProducts = [] } = useQuery({
    queryKey: ["/api/products/watchlist"],
    enabled: !!user,
  });

  const { data: categoryData = [] } = useQuery({
    queryKey: ["/api/performance/categories", dateRange],
    enabled: !!user,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["/api/goals"],
    enabled: !!user,
  });

  const { data: inventory = [] } = useQuery({
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

  // Process sales data for trending
  const salesTrendData = salesData.reduce((acc: any[], sale: any) => {
    const date = new Date(sale.saleDate).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.revenue += parseFloat(sale.totalRevenue);
      existing.units += sale.quantity;
    } else {
      acc.push({
        date,
        revenue: parseFloat(sale.totalRevenue),
        units: sale.quantity,
      });
    }
    return acc;
  }, []).slice(-7); // Last 7 days

  // Calculate metrics
  const metrics = performanceMetrics || {
    totalRevenue: salesData.reduce((sum: number, sale: any) => sum + parseFloat(sale.totalRevenue), 0),
    totalProfit: salesData.reduce((sum: number, sale: any) => sum + parseFloat(sale.profit || 0), 0),
    totalUnits: salesData.reduce((sum: number, sale: any) => sum + sale.quantity, 0),
    conversionRate: 2.4,
  };

  const inventoryStats = inventorySummary || {
    totalItems: inventory.length,
    totalValue: inventory.reduce((sum: number, item: any) => sum + ((item.currentStock || 0) * parseFloat(item.sellingPrice || 0)), 0),
    lowStockItems: inventory.filter((item: any) => (item.currentStock || 0) <= (item.reorderPoint || 0)).length,
    outOfStockItems: inventory.filter((item: any) => (item.currentStock || 0) === 0).length,
  };

  const activeGoals = goals.filter((goal: any) => goal.isActive).slice(0, 3);
  const recentProducts = watchlistProducts.slice(0, 3);
  const lowStockItems = inventory.filter((item: any) => (item.currentStock || 0) <= (item.reorderPoint || 0)).slice(0, 3);

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
                <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
                <p className="text-gray-600 dark:text-slate-400">
                  Welcome back, {user.displayName}! Monitor your Amazon FBA business performance
                </p>
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-black dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Revenue</p>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      ${Math.round(metrics.totalRevenue).toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">+12.5%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Profit</p>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      ${Math.round(metrics.totalProfit).toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm text-blue-500">+8.2%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Units Sold</p>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      {metrics.totalUnits.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-purple-500 mr-1" />
                      <span className="text-sm text-purple-500">+15.3%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Conversion Rate</p>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      {metrics.conversionRate.toFixed(1)}%
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm text-red-500">-2.1%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/10 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Inventory Snapshot */}
            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium text-black dark:text-white">Inventory Snapshot</CardTitle>
                <Link href="/inventory">
                  <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Items</span>
                    <span className="font-medium text-black dark:text-white">{inventoryStats.totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Stock Value</span>
                    <span className="font-medium text-black dark:text-white">${Math.round(inventoryStats.totalValue).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Low Stock</span>
                    <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                      {inventoryStats.lowStockItems} items
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</span>
                    <Badge className="bg-red-500/20 text-red-600 dark:text-red-400">
                      {inventoryStats.outOfStockItems} items
                    </Badge>
                  </div>
                  
                  {lowStockItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <h4 className="text-sm font-medium text-black dark:text-white mb-2">Alerts</h4>
                      <div className="space-y-2">
                        {lowStockItems.map((item: any) => (
                          <div key={item.id} className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {item.name} - {item.currentStock} units left
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sales by Category Chart */}
            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="revenue"
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tracked Products Mini-View */}
            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium text-black dark:text-white">Tracked Products</CardTitle>
                <Link href="/products">
                  <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentProducts.length === 0 ? (
                    <div className="text-center py-4">
                      <Eye className="h-8 w-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No products in watchlist</p>
                    </div>
                  ) : (
                    recentProducts.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-black dark:text-white">{product.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{product.category}</p>
                        </div>
                        <Badge className={`text-xs ${
                          product.status === 'ready_to_launch' 
                            ? "bg-green-500/20 text-green-600 dark:text-green-400"
                            : product.status === 'validated'
                            ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" 
                            : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                        }`}>
                          {product.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Goal Progress Overview */}
            {activeGoals.length > 0 && (
              <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-black dark:text-white flex items-center">
                    <Target className="h-5 w-5 mr-2 text-[#fd7014]" />
                    Goal Progress
                  </CardTitle>
                  <Link href="/goals">
                    <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeGoals.map((goal: any) => {
                      const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                      return (
                        <div key={goal.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-black dark:text-white">
                              {goal.metric.charAt(0).toUpperCase() + goal.metric.slice(1)} Goal
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Sales Trend */}
            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-black dark:text-white">Recent Sales Trend</CardTitle>
                <Link href="/analytics">
                  <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#fd7014" 
                      strokeWidth={2} 
                      name="Revenue ($)" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}