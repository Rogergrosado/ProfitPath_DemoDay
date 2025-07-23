import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  Bell, 
  Package, 
  TrendingDown, 
  Clock,
  X,
  CheckCircle,
  RefreshCw,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'reorder_point' | 'slow_moving' | 'price_change';
  severity: 'critical' | 'warning' | 'info';
  sku: string;
  productName: string;
  message: string;
  currentStock: number;
  reorderPoint?: number;
  recommendedAction: string;
  timestamp: Date;
  dismissed: boolean;
}

const ALERT_CONFIGS = {
  low_stock: {
    icon: AlertTriangle,
    color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
    iconColor: 'text-yellow-500',
    label: 'Low Stock'
  },
  out_of_stock: {
    icon: Package,
    color: 'bg-red-500/20 text-red-600 border-red-500/30',
    iconColor: 'text-red-500',
    label: 'Out of Stock'
  },
  overstock: {
    icon: TrendingDown,
    color: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    iconColor: 'text-blue-500',
    label: 'Overstock'
  },
  reorder_point: {
    icon: Clock,
    color: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
    iconColor: 'text-orange-500',
    label: 'Reorder Time'
  },
  slow_moving: {
    icon: TrendingDown,
    color: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
    iconColor: 'text-purple-500',
    label: 'Slow Moving'
  },
  price_change: {
    icon: Zap,
    color: 'bg-green-500/20 text-green-600 border-green-500/30',
    iconColor: 'text-green-500',
    label: 'Price Alert'
  }
};

export function RealTimeAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data: inventoryResponse } = useQuery({
    queryKey: ["/api/inventory"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  const inventory = (inventoryResponse as any)?.results || [];

  const { data: salesResponse } = useQuery({
    queryKey: ["/api/sales"],
    refetchInterval: 60000, // Refresh every minute
  });
  
  const salesData = (salesResponse as any)?.results || [];

  // Generate real-time alerts based on inventory data
  useEffect(() => {
    if (inventory.length === 0) return;

    const newAlerts: InventoryAlert[] = [];
    const currentTime = new Date();

    inventory.forEach((item: any) => {
      const currentStock = item.currentStock || 0;
      const reorderPoint = item.reorderPoint || 10;
      const maxStock = item.maxStock || 100;

      // Critical: Out of Stock
      if (currentStock === 0) {
        newAlerts.push({
          id: `out-of-stock-${item.id}`,
          type: 'out_of_stock',
          severity: 'critical',
          sku: item.sku,
          productName: item.productName,
          message: `${item.productName} is completely out of stock`,
          currentStock,
          recommendedAction: 'Immediate reorder required to avoid sales loss',
          timestamp: currentTime,
          dismissed: false
        });
      }
      // Warning: Low Stock
      else if (currentStock <= reorderPoint) {
        newAlerts.push({
          id: `low-stock-${item.id}`,
          type: 'low_stock',
          severity: 'warning',
          sku: item.sku,
          productName: item.productName,
          message: `${item.productName} stock is below reorder point (${currentStock}/${reorderPoint})`,
          currentStock,
          reorderPoint,
          recommendedAction: 'Place reorder within 7 days to maintain stock levels',
          timestamp: currentTime,
          dismissed: false
        });
      }
      // Info: Overstock
      else if (currentStock > maxStock) {
        newAlerts.push({
          id: `overstock-${item.id}`,
          type: 'overstock',
          severity: 'info',
          sku: item.sku,
          productName: item.productName,
          message: `${item.productName} has excess inventory (${currentStock}/${maxStock})`,
          currentStock,
          recommendedAction: 'Consider promotional campaigns to move excess stock',
          timestamp: currentTime,
          dismissed: false
        });
      }
    });

    // Slow moving stock analysis
    const thirtyDaysAgo = new Date(currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);
    inventory.forEach((item: any) => {
      const recentSales = salesData.filter((sale: any) => 
        sale.sku === item.sku && new Date(sale.saleDate) > thirtyDaysAgo
      );
      
      if (recentSales.length === 0 && item.currentStock > 0) {
        newAlerts.push({
          id: `slow-moving-${item.id}`,
          type: 'slow_moving',
          severity: 'warning',
          sku: item.sku,
          productName: item.productName,
          message: `${item.productName} has no sales in the last 30 days`,
          currentStock: item.currentStock,
          recommendedAction: 'Review pricing strategy or consider discounting',
          timestamp: currentTime,
          dismissed: false
        });
      }
    });

    setAlerts(newAlerts);
    setLastUpdate(currentTime);
  }, [inventory, salesData]);

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
    toast({
      title: "Alert Dismissed",
      description: "Alert has been marked as handled.",
    });
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = activeAlerts.filter(alert => alert.severity === 'warning');

  const AlertCard = ({ alert }: { alert: InventoryAlert }) => {
    const config = ALERT_CONFIGS[alert.type];
    const Icon = config.icon;

    return (
      <Alert className={`${config.color} border`}>
        <Icon className={`h-4 w-4 ${config.iconColor}`} />
        <div className="flex-1">
          <AlertDescription>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {alert.sku}
                  </Badge>
                  <Badge className={config.color}>
                    {config.label}
                  </Badge>
                </div>
                <p className="font-medium">{alert.message}</p>
                <p className="text-sm opacity-75 mt-1">{alert.recommendedAction}</p>
                <p className="text-xs opacity-60 mt-2">
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.id)}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  return (
    <div className="space-y-4">
      {/* Alert Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Real-Time Inventory Alerts</span>
            <Badge variant="secondary" className="ml-auto">
              {activeAlerts.length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{criticalAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{warningAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Warning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {inventory.length - criticalAlerts.length - warningAlerts.length}
              </div>
              <div className="text-sm text-muted-foreground">Healthy</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
            {activeAlerts.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAllAlerts(true)}
              >
                View All Alerts
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Most Critical Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Most Critical Alerts</h3>
          {activeAlerts
            .sort((a, b) => {
              const severityOrder = { critical: 3, warning: 2, info: 1 };
              return severityOrder[b.severity] - severityOrder[a.severity];
            })
            .slice(0, 3)
            .map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
        </div>
      )}

      {/* No Alerts State */}
      {activeAlerts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p className="font-medium text-green-600">All inventory levels are healthy</p>
            <p className="text-sm text-muted-foreground">No alerts require immediate attention</p>
          </CardContent>
        </Card>
      )}

      {/* All Alerts Modal */}
      <Dialog open={showAllAlerts} onOpenChange={setShowAllAlerts}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Inventory Alerts</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
            {activeAlerts.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>No active alerts</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}