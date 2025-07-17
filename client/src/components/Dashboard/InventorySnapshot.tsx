import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, TrendingDown, Eye } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  status: 'healthy' | 'low' | 'critical' | 'out-of-stock';
  value: number;
  velocity: number; // units per day
  daysLeft: number;
}

const inventoryData: InventoryItem[] = [
  {
    id: 1,
    name: "Wireless Earbuds Pro",
    sku: "WEP-2024-001",
    currentStock: 156,
    reorderPoint: 50,
    status: "healthy",
    value: 18720,
    velocity: 12,
    daysLeft: 13
  },
  {
    id: 2,
    name: "Fitness Tracker X1",
    sku: "FTX-2024-002",
    currentStock: 23,
    reorderPoint: 25,
    status: "critical",
    value: 2530,
    velocity: 8,
    daysLeft: 3
  },
  {
    id: 3,
    name: "Smart Phone Case",
    sku: "SPC-2024-003",
    currentStock: 89,
    reorderPoint: 30,
    status: "healthy",
    value: 2670,
    velocity: 15,
    daysLeft: 6
  },
  {
    id: 4,
    name: "Bluetooth Speaker Mini",
    sku: "BSM-2024-004",
    currentStock: 12,
    reorderPoint: 20,
    status: "low",
    value: 840,
    velocity: 6,
    daysLeft: 2
  },
  {
    id: 5,
    name: "USB-C Cable 6ft",
    sku: "UCC-2024-005",
    currentStock: 0,
    reorderPoint: 100,
    status: "out-of-stock",
    value: 0,
    velocity: 25,
    daysLeft: 0
  }
];

export function InventorySnapshot() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'critical':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
      case 'out-of-stock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const criticalItems = inventoryData.filter(item => 
    item.status === 'critical' || item.status === 'out-of-stock'
  ).length;

  const lowStockItems = inventoryData.filter(item => item.status === 'low').length;

  const totalValue = inventoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-card-foreground">Inventory Snapshot</CardTitle>
            </div>
            <Button variant="outline" size="sm" className="bg-card border-border text-card-foreground hover:bg-muted">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-lg font-bold text-card-foreground">
                ${totalValue.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <p className="text-sm text-orange-600 dark:text-orange-400">Critical Items</p>
              <p className="text-lg font-bold text-orange-800 dark:text-orange-300">
                {criticalItems}
              </p>
            </div>
            <div className="text-center p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Low Stock</p>
              <p className="text-lg font-bold text-yellow-800 dark:text-yellow-300">
                {lowStockItems}
              </p>
            </div>
          </div>

          {/* Inventory Items */}
          <div className="space-y-3">
            {inventoryData.slice(0, 5).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="font-medium text-card-foreground text-sm">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.sku}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-card-foreground">
                      {item.currentStock} units
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.daysLeft} days left
                    </p>
                  </div>
                  
                  <Badge className={getStatusColor(item.status)}>
                    {item.status.replace('-', ' ')}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Alert Summary */}
          {(criticalItems > 0 || lowStockItems > 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  Attention Required
                </p>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                You have {criticalItems} critical and {lowStockItems} low stock items that need restocking.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}