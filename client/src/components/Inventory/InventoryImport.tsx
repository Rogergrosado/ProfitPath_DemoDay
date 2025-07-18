import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react";

interface InventoryImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryImport({ open, onOpenChange }: InventoryImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "complete">("upload");
  const [importResults, setImportResults] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/inventory/import", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: (results) => {
      setImportResults(results);
      setStep("complete");
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Import completed",
        description: `${results.successful} items imported successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Please check your file format and try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    // Parse CSV preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Empty file",
          description: "The CSV file appears to be empty or missing data.",
          variant: "destructive",
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        const item: any = {};
        headers.forEach((header, index) => {
          item[header] = values[index] || '';
        });
        return item;
      });

      setImportPreview(preview);
      setStep("preview");
    };
    
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const items = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const item: any = {};
        headers.forEach((header, index) => {
          item[header] = values[index] || '';
        });
        return item;
      });

      importMutation.mutate({ items });
    };
    
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `name,sku,category,currentStock,reorderPoint,costPrice,sellingPrice,supplierName,supplierSKU,leadTimeDays
Example Product,EX-001,Electronics,100,20,15.00,29.99,Supplier Inc,SUP-001,7
Another Item,AN-002,Home & Garden,50,10,8.50,19.99,Garden Co,GC-002,14`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetModal = () => {
    setFile(null);
    setImportPreview([]);
    setStep("upload");
    setImportResults(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetModal();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-white dark:bg-[#222831] border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center text-black dark:text-white">
            <Upload className="h-5 w-5 mr-2 text-[#fd7014]" />
            Import Inventory
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Upload a CSV file to bulk import or update inventory items.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-6">
            {/* Template Download */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200">Need a template?</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mb-3">
                    Download our CSV template with the correct format and example data.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadTemplate}
                    className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <Label htmlFor="file-upload" className="text-black dark:text-white">Upload CSV File</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-[#fd7014] hover:text-[#e5640f]">Upload a file</span> or drag and drop
                  </label>
                  <p className="text-xs">CSV files only</p>
                </div>
              </div>
            </div>

            {/* Required Fields */}
            <div>
              <h3 className="font-medium text-black dark:text-white mb-3">Required CSV Columns</h3>
              <div className="grid grid-cols-2 gap-2">
                {['name', 'sku', 'category', 'currentStock', 'costPrice', 'sellingPrice'].map(field => (
                  <Badge key={field} variant="outline" className="justify-start text-black dark:text-white border-gray-300 dark:border-slate-600">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-black dark:text-white">Preview Import Data</h3>
              <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {importPreview.length} items (showing first 5)
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-600">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">Name</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">SKU</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">Stock</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                  {importPreview.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-black dark:text-white">{item.name || 'N/A'}</td>
                      <td className="px-3 py-2 text-black dark:text-white">{item.sku || 'N/A'}</td>
                      <td className="px-3 py-2 text-black dark:text-white">{item.currentStock || '0'}</td>
                      <td className="px-3 py-2 text-black dark:text-white">${item.sellingPrice || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setStep("upload")}
                className="border-gray-300 dark:border-slate-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={importMutation.isPending}
                className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
              >
                {importMutation.isPending ? "Importing..." : "Import Data"}
              </Button>
            </div>
          </div>
        )}

        {step === "complete" && importResults && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="font-medium text-black dark:text-white mb-2">Import Complete</h3>
              <p className="text-gray-600 dark:text-gray-400">Your inventory data has been imported successfully.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {importResults.successful || 0}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Items Imported</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {importResults.failed || 0}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Failed Items</div>
              </div>
            </div>

            {importResults.errors && importResults.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Import Errors</h4>
                <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
                  {importResults.errors.slice(0, 5).map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {importResults.errors.length > 5 && (
                    <li>• ... and {importResults.errors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}