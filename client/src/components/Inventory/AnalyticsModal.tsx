import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: any;
}

export function AnalyticsModal({ isOpen, onClose, inventory }: AnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState("manual");
  const [formData, setFormData] = useState({
    quantity: 1,
    unitPrice: parseFloat(inventory?.sellingPrice || "0"),
    saleDate: new Date().toISOString().split('T')[0],
    notes: "",
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvMode, setCsvMode] = useState<"sales" | "products" | "mixed">("sales");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSaleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/sales", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({ title: "Sale recorded successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance/metrics"] });
      onClose();
      setFormData({
        quantity: 1,
        unitPrice: parseFloat(inventory?.sellingPrice || "0"),
        saleDate: new Date().toISOString().split('T')[0],
        notes: "",
      });
    },
    onError: (error: any) => {
      console.error("❌ Error recording sale:", error);
      toast({
        title: "Failed to record sale",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const csvImportMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return fetch("/api/sales/csv-import", {
        method: "POST",
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: (data) => {
      toast({ 
        title: "CSV Import Successful", 
        description: `Imported ${data.importedCount} records`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance/metrics"] });
      setCsvFile(null);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "CSV Import Failed",
        description: "Please check your CSV format and try again",
        variant: "destructive",
      });
    },
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.quantity <= 0 || formData.unitPrice <= 0) {
      toast({
        title: "Invalid input",
        description: "Quantity and price must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    const totalRevenue = formData.quantity * formData.unitPrice;
    const totalCost = formData.quantity * parseFloat(inventory.costPrice || "0");
    const profit = totalRevenue - totalCost;

    const requestBody = {
      inventoryId: inventory.id,
      sku: inventory.sku,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2),
      totalCost: totalCost.toFixed(2),
      profit: profit.toFixed(2),
      saleDate: new Date(formData.saleDate),
      notes: formData.notes,
      productName: inventory.name,
      category: inventory.category || "inventory-item",
    };

    console.log("📤 Submitting analytics sale:", requestBody);
    createSaleMutation.mutate(requestBody);
  };

  const handleCsvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", csvFile);
    formData.append("mode", csvMode);
    formData.append("inventoryId", inventory.id.toString());

    csvImportMutation.mutate(formData);
  };

  const downloadTemplate = (type: "sales" | "products" | "mixed") => {
    let csvContent = "";
    
    switch (type) {
      case "sales":
        csvContent = "SKU,Date,Units Sold,Unit Price,Notes\n";
        csvContent += `${inventory.sku},${new Date().toISOString().split('T')[0]},1,${inventory.sellingPrice || 0},Sample sale`;
        break;
      case "products":
        csvContent = "Product Name,SKU,Category,Selling Price,Cost Price,Current Stock,Reorder Point,Supplier\n";
        csvContent += `Sample Product,SAMPLE-001,Electronics,29.99,15.50,100,20,Sample Supplier`;
        break;
      case "mixed":
        csvContent = "Product Name,SKU,Category,Selling Price,Cost Price,Current Stock,Date,Units Sold,Unit Price\n";
        csvContent += `${inventory.name},${inventory.sku},${inventory.category},${inventory.sellingPrice},${inventory.costPrice},${inventory.currentStock},${new Date().toISOString().split('T')[0]},1,${inventory.sellingPrice}`;
        break;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_template.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[hsl(240,10%,13%)] border-gray-200 dark:border-[hsl(240,3.7%,15.9%)] text-black dark:text-white max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="analytics-modal-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black dark:text-white">
            <TrendingUp className="h-5 w-5 text-[#fd7014]" />
            Analytics & Sales Entry - {inventory?.name}
          </DialogTitle>
          <p id="analytics-modal-description" className="text-sm text-gray-600 dark:text-gray-400">
            Record sales data manually or import from CSV files to update performance metrics
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-slate-800">
            <TabsTrigger value="manual" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="csv" className="data-[state=active]:bg-[#fd7014] data-[state=active]:text-white">
              CSV Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <Card className="bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <DollarSign className="h-4 w-4 text-[#fd7014]" />
                  Record Individual Sale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-black dark:text-white">Quantity Sold</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                        className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-black dark:text-white">Unit Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})}
                        className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-black dark:text-white">Sale Date</Label>
                    <Input
                      type="date"
                      value={formData.saleDate}
                      onChange={(e) => setFormData({...formData, saleDate: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-black dark:text-white">Notes (Optional)</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional notes about this sale..."
                      className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onClose}
                      className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createSaleMutation.isPending}
                      className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                    >
                      {createSaleMutation.isPending ? "Recording..." : "Record Sale"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <Card className="bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Upload className="h-4 w-4 text-[#fd7014]" />
                  Bulk CSV Import
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-black dark:text-white">Import Mode</Label>
                  <select
                    value={csvMode}
                    onChange={(e) => setCsvMode(e.target.value as "sales" | "products" | "mixed")}
                    className="w-full p-2 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-black dark:text-white rounded"
                  >
                    <option value="sales">Sales Data Only</option>
                    <option value="products">Products/Inventory Only</option>
                    <option value="mixed">Mixed (Products + Sales)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTemplate("sales")}
                    className="text-xs border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Sales Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTemplate("products")}
                    className="text-xs border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Products Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTemplate("mixed")}
                    className="text-xs border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Mixed Template
                  </Button>
                </div>

                <form onSubmit={handleCsvSubmit} className="space-y-4">
                  <div>
                    <Label className="text-black dark:text-white">Select CSV File</Label>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-black dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onClose}
                      className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={csvImportMutation.isPending || !csvFile}
                      className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                    >
                      {csvImportMutation.isPending ? "Importing..." : "Import CSV"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}