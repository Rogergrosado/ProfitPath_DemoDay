import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { PerformanceKPICards } from "@/components/Analytics/PerformanceKPICards";
import { CategoryBreakdownChart } from "@/components/Analytics/CategoryBreakdownChart";
import { SalesEntryModal } from "@/components/Analytics/SalesEntryModal";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";

export default function Analytics() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState("30");

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--navy)] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const revenueData = [
    { month: "Jan", revenue: 35000 },
    { month: "Feb", revenue: 42000 },
    { month: "Mar", revenue: 38000 },
    { month: "Apr", revenue: 48000 },
    { month: "May", revenue: 45000 },
    { month: "Jun", revenue: 52000 },
  ];

  const topProducts = [
    {
      name: "Wireless Earbuds Pro",
      category: "Electronics",
      revenue: 24580,
      growth: 12,
    },
    {
      name: "Fitness Tracker X1",
      category: "Health & Fitness",
      revenue: 18920,
      growth: 8,
    },
    {
      name: "Smart Home Device",
      category: "Home & Garden",
      revenue: 15670,
      growth: -3,
    },
  ];

  const productPerformance = [
    {
      name: "Wireless Earbuds Pro",
      sku: "WEP-001",
      unitsSold: 847,
      revenue: 24580,
      profit: 8930,
      margin: 36.3,
      growth: 12,
    },
    {
      name: "Fitness Tracker X1", 
      sku: "FTX-001",
      unitsSold: 623,
      revenue: 18920,
      profit: 6240,
      margin: 33.0,
      growth: 8,
    },
    {
      name: "Smart Home Device",
      sku: "SHD-001", 
      unitsSold: 412,
      revenue: 15670,
      profit: 4710,
      margin: 30.1,
      growth: -3,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--navy)] text-white flex">
      <Sidebar />
      <ThemeToggle />
      
      <main className="flex-1 ml-64 p-6">
        <div className="fade-in">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Performance Analytics</h1>
                <p className="text-slate-400">Track your business performance and trends</p>
              </div>
              <div className="flex space-x-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="bg-[var(--charcoal)] border-[var(--slate-custom)] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 3 Months</SelectItem>
                    <SelectItem value="180">Last 6 Months</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                  </SelectContent>
                </Select>
                <SalesEntryModal>
                  <Button className="bg-[var(--orange-primary)] hover:bg-[var(--orange-light)] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sale
                  </Button>
                </SalesEntryModal>
              </div>
            </div>
          </div>

          {/* Performance KPIs */}
          <PerformanceKPICards />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trend */}
            <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                          color: "#ffffff",
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(20, 90%, 54%)"
                        strokeWidth={3}
                        dot={{ fill: "hsl(20, 90%, 54%)", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Top Products by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[var(--orange-primary)]/20 rounded-lg flex items-center justify-center">
                          <span className="text-[var(--orange-primary)] font-semibold">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm text-white">{product.name}</div>
                          <div className="text-xs text-slate-400">{product.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">${product.revenue.toLocaleString()}</div>
                        <div className={`text-xs flex items-center ${
                          product.growth > 0 ? "text-green-400" : "text-red-400"
                        }`}>
                          {product.growth > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                          {Math.abs(product.growth)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CategoryBreakdownChart />
          </div>

          {/* Product Performance Table */}
          <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Product Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-800">
                    <TableRow>
                      <TableHead className="text-white">Product</TableHead>
                      <TableHead className="text-white">Units Sold</TableHead>
                      <TableHead className="text-white">Revenue</TableHead>
                      <TableHead className="text-white">Profit</TableHead>
                      <TableHead className="text-white">Margin</TableHead>
                      <TableHead className="text-white">Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productPerformance.map((product, index) => (
                      <TableRow key={index} className="border-t border-slate-600 hover:bg-slate-800">
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{product.name}</div>
                            <div className="text-sm text-slate-400">{product.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-white">{product.unitsSold}</TableCell>
                        <TableCell className="font-semibold text-white">${product.revenue.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold text-green-400">${product.profit.toLocaleString()}</TableCell>
                        <TableCell className="text-white">{product.margin}%</TableCell>
                        <TableCell>
                          <div className={`flex items-center ${
                            product.growth > 0 ? "text-green-400" : "text-red-400"
                          }`}>
                            {product.growth > 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                            <span>{Math.abs(product.growth)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
