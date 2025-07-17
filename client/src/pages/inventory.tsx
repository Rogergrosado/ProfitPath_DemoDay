import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { InventoryTable } from "@/components/Inventory/InventoryTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, TriangleAlert, Clock, DollarSign, Download, Package2 } from "lucide-react";

export default function Inventory() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory"],
    enabled: !!user,
  });

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

  const totalProducts = inventory.length;
  const lowStockItems = inventory.filter((item: any) => 
    (item.currentStock || 0) - (item.reservedStock || 0) <= (item.reorderPoint || 0)
  ).length;
  const reorderSoonItems = inventory.filter((item: any) => {
    const available = (item.currentStock || 0) - (item.reservedStock || 0);
    const reorderPoint = item.reorderPoint || 0;
    return available > reorderPoint && available <= reorderPoint * 1.5;
  }).length;
  const totalValue = inventory.reduce((sum: number, item: any) => 
    sum + ((item.currentStock || 0) * parseFloat(item.sellingPrice || 0)), 0
  );

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
                <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
                <p className="text-slate-400">Monitor and manage your current stock levels</p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button className="bg-[var(--orange-primary)] hover:bg-[var(--orange-light)] text-white">
                  <Package2 className="h-4 w-4 mr-2" />
                  Bulk Reorder
                </Button>
              </div>
            </div>
          </div>

          {/* Inventory Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{totalProducts}</div>
                    <div className="text-slate-400 text-sm">Total Products</div>
                  </div>
                  <Package className="h-6 w-6 text-[var(--orange-primary)]" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-400">{lowStockItems}</div>
                    <div className="text-slate-400 text-sm">Low Stock Items</div>
                  </div>
                  <TriangleAlert className="h-6 w-6 text-red-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{reorderSoonItems}</div>
                    <div className="text-slate-400 text-sm">Reorder Soon</div>
                  </div>
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[var(--charcoal)] border-[var(--slate-custom)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">${totalValue.toLocaleString()}</div>
                    <div className="text-slate-400 text-sm">Total Value</div>
                  </div>
                  <DollarSign className="h-6 w-6 text-[var(--orange-primary)]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Table */}
          <InventoryTable />
        </div>
      </main>
    </div>
  );
}
