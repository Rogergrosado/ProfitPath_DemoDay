import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package,
  DollarSign,
} from "lucide-react";

interface SalesImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function SalesImportModal({ open, onClose }: SalesImportModalProps) {
  const [csvData, setCsvData] = useState("");
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [importStep, setImportStep] = useState<"upload" | "preview" | "complete">("upload");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: (salesData: any[]) => 
      apiRequest("/api/sales/bulk-import", {
        method: "POST",
        body: JSON.stringify({ salesData }),
      }),
    onSuccess: (data) => {
      toast({
        title: "Import Successful",
        description: `Imported ${data.importedCount} sales records`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setImportStep("complete");
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import sales data",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
        parseCSV(content);
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csv: string) => {
    try {
      const lines = csv.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        
        headers.forEach((header, index) => {
          const normalizedHeader = header.toLowerCase().replace(/\s+/g, '_');
          row[normalizedHeader] = values[index] || '';
        });
        
        return row;
      });

      setParsedData(data);
      setImportStep("preview");
    } catch (error) {
      toast({
        title: "Parse Error",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    if (parsedData.length > 0) {
      importMutation.mutate(parsedData);
    }
  };

  const handleClose = () => {
    setCsvData("");
    setParsedData([]);
    setImportStep("upload");
    onClose();
  };

  const downloadTemplate = () => {
    const template = `sku,product_name,category,quantity,unit_price,total_cost,sale_date,marketplace,region
WEP-2024-001,Wireless Earbuds Pro,Electronics,2,120.00,90.00,2024-07-15,amazon,US
FTX-2024-002,Fitness Tracker X1,Health & Beauty,1,110.00,65.00,2024-07-14,amazon,US
SPC-2024-003,Sports Water Bottle,Sports,5,30.00,40.00,2024-07-13,ebay,US
HGC-2024-004,Home & Garden Set,Home & Garden,3,85.00,150.00,2024-07-12,amazon,US
ELX-2024-005,Electronic Gadget,Electronics,1,200.00,120.00,2024-07-11,amazon,US`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'sales_import_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getStats = () => {
    if (parsedData.length === 0) return null;
    
    const totalRevenue = parsedData.reduce((sum, item) => {
      const revenue = parseFloat(item.unit_price || 0) * parseInt(item.quantity || 0);
      return sum + revenue;
    }, 0);
    
    const totalUnits = parsedData.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
    const uniqueSkus = new Set(parsedData.map(item => item.sku)).size;
    
    return { totalRevenue, totalUnits, uniqueSkus };
  };

  const stats = getStats();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Sales Data Import - Performance Analytics
          </DialogTitle>
        </DialogHeader>

        {importStep === "upload" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Sales Data</h3>
                <p className="text-muted-foreground mb-4">
                  Import your historical sales data to enhance performance analytics
                </p>
                
                <div className="space-y-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <Label htmlFor="csv-upload">
                    <Button asChild className="cursor-pointer">
                      <span>Choose CSV File</span>
                    </Button>
                  </Label>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Or paste CSV data directly:</p>
                    <Textarea
                      placeholder="Paste your CSV data here..."
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      className="mt-2 h-32"
                    />
                    <Button 
                      onClick={() => parseCSV(csvData)} 
                      disabled={!csvData.trim()}
                      className="mt-2"
                    >
                      Parse Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Download className="h-4 w-4 mr-2" />
                  CSV Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Download our template to ensure proper data formatting:
                </p>
                <div className="space-y-2">
                  <div className="text-xs font-mono bg-muted p-2 rounded">
                    Required columns: sku, quantity, unit_price, sale_date<br/>
                    Optional: product_name, category, total_cost, marketplace, region
                  </div>
                  <Button onClick={downloadTemplate} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {importStep === "preview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Preview Import Data</h3>
              <Badge variant="outline">{parsedData.length} records</Badge>
            </div>

            {stats && (
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-lg font-semibold">${stats.totalRevenue.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Units</p>
                        <p className="text-lg font-semibold">{stats.totalUnits}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Unique SKUs</p>
                        <p className="text-lg font-semibold">{stats.uniqueSkus}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">SKU</th>
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Qty</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{row.sku}</td>
                      <td className="p-2">{row.product_name || '-'}</td>
                      <td className="p-2">{row.category || '-'}</td>
                      <td className="p-2">{row.quantity}</td>
                      <td className="p-2">${row.unit_price}</td>
                      <td className="p-2">{row.sale_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 10 && (
                <div className="p-2 text-center text-sm text-muted-foreground bg-muted">
                  ... and {parsedData.length - 10} more records
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setImportStep("upload")}>
                Back
              </Button>
              <Button 
                onClick={handleImport}
                disabled={importMutation.isPending}
                className="bg-primary text-primary-foreground"
              >
                {importMutation.isPending ? "Importing..." : "Import Sales Data"}
              </Button>
            </div>
          </div>
        )}

        {importStep === "complete" && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-medium">Import Complete!</h3>
            <p className="text-muted-foreground">
              Your sales data has been successfully imported and integrated with your performance analytics.
              Inventory levels have been automatically updated.
            </p>
            <div className="space-x-2">
              <Button onClick={handleClose}>Close</Button>
              <Button variant="outline" onClick={() => setImportStep("upload")}>
                Import More Data
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}