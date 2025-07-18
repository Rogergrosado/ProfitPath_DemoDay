import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SalesEntryModal } from "@/components/Inventory/SalesEntryModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  DollarSign,
  Package,
  TrendingUp,
  Target,
  Plus,
  Calendar,
  Activity,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

const COLORS = ['#fd7014', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState("30d");
  const [salesEntryModalOpen, setSalesEntryModalOpen] = useState(false);

  const { data: performanceMetrics } = useQuery({
    queryKey: ["/api/performance/metrics", dateRange],
    enabled: !!user,
  });

  const { data: salesData = [] } = useQuery({
    queryKey: ["/api/sales", dateRange],
    enabled: !!user,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["/api/goals"],
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

  // Process data for charts
  const revenueData = salesData.reduce((acc: any[], sale: any) => {
    const date = new Date(sale.saleDate).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.revenue += parseFloat(sale.totalRevenue);
      existing.profit += parseFloat(sale.profit || 0);
    } else {
      acc.push({
        date,
        revenue: parseFloat(sale.totalRevenue),
        profit: parseFloat(sale.profit || 0),
      });
    }
    return acc;
  }, []);

  // Category performance data
  const categoryData = salesData.reduce((acc: any[], sale: any) => {
    const category = sale.category || 'Uncategorized';
    const existing = acc.find(item => item.category === category);
    if (existing) {
      existing.revenue += parseFloat(sale.totalRevenue);
      existing.units += sale.quantity;
    } else {
      acc.push({
        category,
        revenue: parseFloat(sale.totalRevenue),
        units: sale.quantity,
      });
    }
    return acc;
  }, []);

  // Product performance data
  const productData = salesData.reduce((acc: any[], sale: any) => {
    const existing = acc.find(item => item.sku === sale.sku);
    if (existing) {
      existing.revenue += parseFloat(sale.totalRevenue);
      existing.units += sale.quantity;
      existing.profit += parseFloat(sale.profit || 0);
    } else {
      acc.push({
        sku: sale.sku,
        revenue: parseFloat(sale.totalRevenue),
        units: sale.quantity,
        profit: parseFloat(sale.profit || 0),
        profitMargin: sale.profit ? (parseFloat(sale.profit) / parseFloat(sale.totalRevenue)) * 100 : 0,
      });
    }
    return acc;
  }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  const metrics = performanceMetrics || {
    totalRevenue: salesData.reduce((sum: number, sale: any) => sum + parseFloat(sale.totalRevenue), 0),
    totalProfit: salesData.reduce((sum: number, sale: any) => sum + parseFloat(sale.profit || 0), 0),
    totalUnits: salesData.reduce((sum: number, sale: any) => sum + sale.quantity, 0),
    conversionRate: 2.4, // Mock for now
  };

  const activeGoals = goals.filter((goal: any) => goal.isActive);

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
                <h1 className="text-3xl font-bold mb-2">Performance Analytics</h1>
                <p className="text-gray-600 dark:text-slate-400">
                  Deep insights into your business performance and trends
                </p>
              </div>
              <div className="flex space-x-3">
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
                <Button 
                  onClick={() => setSalesEntryModalOpen(true)}
                  className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sale
                </Button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      ${Math.round(metrics.totalRevenue).toLocaleString()}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Profit</p>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      ${Math.round(metrics.totalProfit).toLocaleString()}
                    </p>
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
                  </div>
                  <div className="w-12 h-12 bg-orange-500/10 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue & Profit Trends */}
            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Revenue & Profit Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
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
                    <Line type="monotone" dataKey="revenue" stroke="#fd7014" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
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
          </div>

          {/* Top Products Performance */}
          <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Top Products Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-slate-700">
                    <TableHead className="text-black dark:text-white">SKU</TableHead>
                    <TableHead className="text-black dark:text-white">Revenue</TableHead>
                    <TableHead className="text-black dark:text-white">Units Sold</TableHead>
                    <TableHead className="text-black dark:text-white">Profit</TableHead>
                    <TableHead className="text-black dark:text-white">Margin</TableHead>
                    <TableHead className="text-black dark:text-white">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productData.map((product: any, index: number) => (
                    <TableRow key={product.sku} className="border-gray-200 dark:border-slate-700">
                      <TableCell className="font-medium text-black dark:text-white">
                        #{index + 1} {product.sku}
                      </TableCell>
                      <TableCell className="text-black dark:text-white">
                        ${Math.round(product.revenue).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-black dark:text-white">
                        {product.units.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-black dark:text-white">
                        ${Math.round(product.profit).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${
                          product.profitMargin > 30 
                            ? "bg-green-500/20 text-green-600 dark:text-green-400"
                            : product.profitMargin > 15
                            ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                            : "bg-red-500/20 text-red-600 dark:text-red-400"
                        }`}>
                          {product.profitMargin.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={Math.min((product.revenue / productData[0]?.revenue) * 100, 100)} className="w-16" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {((product.revenue / productData[0]?.revenue) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Goal Progress Summary */}
          {activeGoals.length > 0 && (
            <Card className="bg-gray-50 dark:bg-[#222831] border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-black dark:text-white">
                  <Target className="h-5 w-5 mr-2 text-[#fd7014]" />
                  Active Goals Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeGoals.slice(0, 3).map((goal: any) => {
                    const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                    return (
                      <div key={goal.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-black dark:text-white">
                              {goal.metric.charAt(0).toUpperCase() + goal.metric.slice(1)} Goal
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Target: {goal.targetValue.toLocaleString()} in {goal.period}
                            </p>
                          </div>
                          <Badge className={`${
                            progress >= 100 
                              ? "bg-green-500/20 text-green-600 dark:text-green-400"
                              : progress >= 75
                              ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                              : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                          }`}>
                            {progress.toFixed(1)}%
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <SalesEntryModal
        open={salesEntryModalOpen}
        onOpenChange={setSalesEntryModalOpen}
      />
    </div>
  );
}