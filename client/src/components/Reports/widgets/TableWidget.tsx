import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReportWidget } from "../ReportBuilderCanvas";
import { getAuthHeaders } from "@/lib/queryClient";

interface TableWidgetProps {
  widget: ReportWidget;
}

export function TableWidget({ widget }: TableWidgetProps) {
  const { data: tableData, isLoading } = useQuery({
    queryKey: [`/api/${widget.config.dataSource}/table`, widget.config.metric],
    queryFn: async () => {
      try {
        const authHeaders = await getAuthHeaders();
        let endpoint = "";
        
        switch (widget.config.dataSource) {
          case "sales":
          case "performance":
            endpoint = "/api/sales";
            break;
          case "inventory":
            endpoint = "/api/inventory";
            break;
          case "goals":
            endpoint = "/api/goals";
            break;
          default:
            endpoint = "/api/sales";
        }

        const response = await fetch(endpoint, {
          headers: authHeaders
        });
        
        if (!response.ok) throw new Error('Failed to fetch table data');
        const data = await response.json();
        
        // Limit to first 5 rows for widget display
        return Array.isArray(data) ? data.slice(0, 5) : [];
      } catch (error) {
        console.error('Error fetching table data:', error);
        return [];
      }
    }
  });

  const formatValue = (value: any, key: string) => {
    if (value === null || value === undefined) return "N/A";
    
    if (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('profit') || key.toLowerCase().includes('price')) {
      const num = parseFloat(value);
      return isNaN(num) ? "N/A" : `$${num.toLocaleString()}`;
    }
    
    if (key.toLowerCase().includes('date')) {
      return new Date(value).toLocaleDateString();
    }
    
    return String(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!tableData || tableData.length === 0) {
    return (
      <div className="text-center py-4">
        <span className="text-sm text-muted-foreground">No data available</span>
      </div>
    );
  }

  const firstItem = tableData[0];
  const columns = Object.keys(firstItem).filter(key => 
    !key.toLowerCase().includes('id') && 
    !key.toLowerCase().includes('userid') &&
    !key.toLowerCase().includes('createdat')
  ).slice(0, 3); // Limit to 3 columns for widget display

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead key={column} className="text-xs p-1">
                {column.charAt(0).toUpperCase() + column.slice(1)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow key={index}>
              {columns.map(column => (
                <TableCell key={column} className="text-xs p-1">
                  {column.toLowerCase().includes('status') ? (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {row[column]}
                    </Badge>
                  ) : (
                    formatValue(row[column], column)
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="text-xs text-muted-foreground">
        Showing {tableData.length} of {tableData.length} records
      </div>
    </div>
  );
}