import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Eye,
  ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";

export function InventoryDataIntegration() {
  const [, setLocation] = useLocation();

  // Fetch real inventory summary
  const { data: inventorySummary, isLoading } = useQuery({
    queryKey: ["/api/inventory/summary"],
  });

  // Fetch real inventory items for recent updates
  const { data: inventoryData, isLoading: itemsLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  if (isLoading || itemsLoading) {
    return (
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Real-Time Inventory Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-pulse">Loading real inventory data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = (inventorySummary as any) || { totalItems: 0, totalValue: 0, lowStockItems: 0, outOfStockItems: 0 };
  const inventoryItems = (inventoryData as any)?.results || [];
  const recentItems = inventoryItems.slice(0, 3); // Show 3 most recent items

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Real-Time Inventory Data
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/inventory")}
            className="text-primary hover:text-primary/80"
          >
            <Eye className="h-4 w-4 mr-1" />
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {summary.totalItems}
            </div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${summary.totalValue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </div>
        </div>

        {/* Alerts */}
        {(summary.lowStockItems > 0 || summary.outOfStockItems > 0) && (
          <div className="space-y-2">
            {summary.outOfStockItems > 0 && (
              <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700 dark:text-red-400">
                    {summary.outOfStockItems} out of stock
                  </span>
                </div>
                <Badge variant="destructive" className="text-xs">
                  Critical
                </Badge>
              </div>
            )}
            {summary.lowStockItems > 0 && (
              <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                  <span className="text-sm text-orange-700 dark:text-orange-400">
                    {summary.lowStockItems} low stock alerts
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Warning
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Recent Inventory Items */}
        {recentItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Updates</h4>
            {recentItems.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    SKU: {item.sku} • Stock: {item.currentStock}
                  </div>
                </div>
                <div className="text-sm font-medium text-primary">
                  ${Number(item.sellingPrice || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        <Button 
          onClick={() => setLocation("/inventory")} 
          className="w-full mt-4"
          variant="outline"
        >
          Manage Inventory
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}