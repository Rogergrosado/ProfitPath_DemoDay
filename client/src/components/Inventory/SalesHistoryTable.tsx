import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, TrendingUp, DollarSign, Package } from "lucide-react";

interface SalesHistoryTableProps {
  inventorySku?: string;
  startDate?: Date;
  endDate?: Date;
}

export function SalesHistoryTable({ inventorySku, startDate, endDate }: SalesHistoryTableProps) {
  const { data: salesHistory, isLoading } = useQuery({
    queryKey: ["/api/sales/history", inventorySku, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());
      if (inventorySku) params.append("sku", inventorySku);
      
      const response = await fetch(`/api/sales/history?${params}`);
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Sales History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = salesHistory?.reduce((sum: number, sale: any) => 
    sum + parseFloat(sale.totalRevenue || 0), 0) || 0;
  const totalUnits = salesHistory?.reduce((sum: number, sale: any) => 
    sum + (sale.quantitySold || 0), 0) || 0;
  const totalProfit = salesHistory?.reduce((sum: number, sale: any) => 
    sum + parseFloat(sale.profit || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Units Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalUnits}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${totalProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Detailed Sales History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {salesHistory && salesHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesHistory.map((sale: any) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {format(new Date(sale.saleDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {sale.productName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sale.sku}</Badge>
                    </TableCell>
                    <TableCell>{sale.quantitySold}</TableCell>
                    <TableCell>${parseFloat(sale.unitPrice || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-green-600 dark:text-green-400 font-semibold">
                      ${parseFloat(sale.totalRevenue || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-purple-600 dark:text-purple-400 font-semibold">
                      ${parseFloat(sale.profit || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sales history available for the selected period.</p>
              <p className="text-sm mt-2">Sales will appear here once you record transactions.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}