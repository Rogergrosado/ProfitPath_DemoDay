import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Download, FileText, CheckCircle, AlertCircle, X, Info, FileSpreadsheet } from "lucide-react";

interface InventoryImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PreviewItem {
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  costPrice: number;
  sellingPrice: number;
  errors?: string[];
}

export function InventoryImport({ open, onOpenChange }: InventoryImportProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<"upload" | "preview" | "complete">("upload");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: (data: PreviewItem[]) => apiRequest("/api/inventory/import", {
      method: "POST",
      body: JSON.stringify({ items: data }),
    }),
    onSuccess: (response) => {
      setCurrentStep("complete");
      toast({
        title: "Import successful",
        description: `Successfully imported ${response.imported} items. ${response.skipped} items were skipped.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Please check your CSV format and try again.",
        variant: "destructive",
      });
    },
  });

  const requiredColumns = [
    { key: "name", label: "Product Name", required: true },
    { key: "sku", label: "SKU", required: true },
    { key: "category", label: "Category", required: true },
    { key: "currentStock", label: "Current Stock", required: false },
    { key: "costPrice", label: "Cost Price", required: false },
    { key: "sellingPrice", label: "Selling Price", required: false },
    { key: "reorderPoint", label: "Reorder Point", required: false },
    { key: "supplierName", label: "Supplier Name", required: false },
    { key: "supplierSKU", label: "Supplier SKU", required: false },
    { key: "leadTimeDays", label: "Lead Time (Days)", required: false },
    { key: "notes", label: "Notes", required: false },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results: any) => {
        console.log("CSV Parse Results:", results);
        
        if (results.errors.length > 0) {
          console.error("CSV Parse Errors:", results.errors);
          toast({
            title: "CSV parsing errors",
            description: "Please check your file format and try again.",
            variant: "destructive",
          });
          return;
        }

        const rawData = results.data;
        if (!rawData || rawData.length === 0) {
          toast({
            title: "Empty CSV file",
            description: "The CSV file contains no data.",
            variant: "destructive",
          });
          return;
        }

        // Check for required columns
        const headers = Object.keys(rawData[0]).map(h => h.toLowerCase());
        console.log("CSV Headers:", headers);
        
        const missingRequired = requiredColumns
          .filter(col => col.required && !headers.includes(col.key.toLowerCase()))
          .map(col => col.label);
        
        if (missingRequired.length > 0) {
          setValidationErrors([`Missing required columns: ${missingRequired.join(', ')}`]);
          return;
        }

        // Transform and validate data
        const data: PreviewItem[] = [];
        const errors: string[] = [];
        
        rawData.forEach((row: any, index: number) => {
          const item: any = {};
          const itemErrors: string[] = [];
          
          // Map CSV columns to our schema
          item.name = row.name || row.productname || '';
          item.sku = row.sku || '';
          item.category = row.category || '';
          item.currentStock = parseInt(row.currentstock || row.stock || row.quantity || '0') || 0;
          item.costPrice = parseFloat(row.costprice || row.cost || '0') || 0;
          item.sellingPrice = parseFloat(row.sellingprice || row.price || row.selling_price || '0') || 0;
          item.reorderPoint = parseInt(row.reorderpoint || row.reorder_point || '0') || 0;
          item.supplierName = row.suppliername || row.supplier || '';
          item.supplierSKU = row.suppliersku || row.supplier_sku || '';
          item.leadTimeDays = parseInt(row.leadtimedays || row.lead_time || '14') || 14;
          item.notes = row.notes || '';

          // Validation
          if (!item.name) itemErrors.push("Missing product name");
          if (!item.sku) itemErrors.push("Missing SKU");
          if (!item.category) itemErrors.push("Missing category");
          
          if (itemErrors.length > 0) {
            item.errors = itemErrors;
            errors.push(`Row ${index + 2}: ${itemErrors.join(', ')}`);
          }
          
          data.push(item);
        });
        
        console.log("Parsed CSV Data:", data);
        setPreviewData(data);
        setValidationErrors(errors);
        setCurrentStep("preview");
      },
      error: (error: any) => {
        console.error("CSV Parse Error:", error);
        toast({
          title: "Failed to parse CSV",
          description: "Please check your file format and try again.",
          variant: "destructive",
        });
      }
    });
  };

  const downloadTemplate = () => {
    const headers = requiredColumns.map(col => col.key).join(',');
    const sampleData = [
      'Wireless Earbuds,WE-2024-001,electronics,100,25.99,49.99,20,TechSupplier,SUP-WE-001,14,High-quality wireless earbuds',
      'Gaming Mouse,GM-2024-002,electronics,50,15.50,39.99,10,GamerCorp,GC-GM-789,7,RGB gaming mouse with high DPI'
    ];
    
    const csvContent = [headers, ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const validItems = previewData.filter(item => !item.errors || item.errors.length === 0);
    if (validItems.length === 0) {
      toast({
        title: "No valid items to import",
        description: "Please fix the validation errors before importing.",
        variant: "destructive",
      });
      return;
    }
    
    importMutation.mutate(validItems);
  };

  const resetImport = () => {
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setCurrentStep("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validItemsCount = previewData.filter(item => !item.errors || item.errors.length === 0).length;
  const invalidItemsCount = previewData.length - validItemsCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center text-black dark:text-white">
            <FileSpreadsheet className="h-5 w-5 mr-2 text-[#fd7014]" />
            Import Inventory from CSV
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {currentStep === "upload" && "Upload your CSV file to import inventory items in bulk"}
            {currentStep === "preview" && "Review your data before importing"}
            {currentStep === "complete" && "Import completed successfully"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === "upload" && (
            <>
              {/* Instructions */}
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800 dark:text-blue-300">
                    <Info className="h-5 w-5 mr-2" />
                    CSV Format Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Required Columns:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {requiredColumns.filter(col => col.required).map(col => (
                        <Badge key={col.key} variant="secondary" className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                          {col.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Optional Columns:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {requiredColumns.filter(col => !col.required).map(col => (
                        <Badge key={col.key} variant="outline" className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300">
                          {col.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="mb-2"><strong>Important Guidelines:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Use column headers exactly as shown above (case-insensitive)</li>
                      <li>SKU must be unique for each product</li>
                      <li>Categories: electronics, home-garden, sports-outdoors, health-beauty, toys-games, clothing, automotive, books</li>
                      <li>Prices should be decimal numbers (e.g., 25.99)</li>
                      <li>Stock quantities should be whole numbers</li>
                      <li>Lead time should be in days</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Template Download */}
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template CSV
                </Button>
              </div>

              {/* Drag and Drop Area */}
              <Card 
                className={`border-2 border-dashed transition-colors ${
                  dragActive 
                    ? "border-[#fd7014] bg-orange-50 dark:bg-orange-900/20" 
                    : "border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <CardContent className="p-12 text-center">
                  <Upload className={`h-16 w-16 mx-auto mb-4 ${
                    dragActive ? "text-[#fd7014]" : "text-gray-400 dark:text-gray-600"
                  }`} />
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    Drop your CSV file here
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    or click to browse and select a file
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Choose CSV File
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {currentStep === "preview" && (
            <>
              {/* Preview Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{validItemsCount}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Valid Items</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">{invalidItemsCount}</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Invalid Items</div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{previewData.length}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Total Items</div>
                  </CardContent>
                </Card>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="text-red-800 dark:text-red-300">Validation Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <ul className="space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700 dark:text-red-300">
                            • {error}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Preview Data */}
              <Card className="bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Preview Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {previewData.slice(0, 10).map((item, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${
                            item.errors && item.errors.length > 0
                              ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                              : "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-black dark:text-white">{item.name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                SKU: {item.sku} | Category: {item.category} | Stock: {item.currentStock}
                              </div>
                            </div>
                            {item.errors && item.errors.length > 0 ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          {item.errors && item.errors.length > 0 && (
                            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                              {item.errors.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                      {previewData.length > 10 && (
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                          ... and {previewData.length - 10} more items
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}

          {currentStep === "complete" && (
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                  Import Completed Successfully!
                </h3>
                <p className="text-green-700 dark:text-green-400">
                  Your inventory items have been imported and are now available in your system.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            {currentStep === "upload" && (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
            )}
            
            {currentStep === "preview" && (
              <>
                <Button
                  variant="outline"
                  onClick={resetImport}
                  className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={validItemsCount === 0 || importMutation.isPending}
                  className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
                >
                  {importMutation.isPending ? "Importing..." : `Import ${validItemsCount} Items`}
                </Button>
              </>
            )}
            
            {currentStep === "complete" && (
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}