import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Save, Edit3, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ColumnDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface ManualDataEntryProps {
  columns: ColumnDefinition[];
  onDataSubmit: (data: any[]) => void;
  title?: string;
  description?: string;
  maxRows?: number;
}

export function ManualDataEntry({ 
  columns, 
  onDataSubmit, 
  title = "Manual Data Entry",
  description = "Enter data manually or add rows as needed",
  maxRows = 50 
}: ManualDataEntryProps) {
  const [rows, setRows] = useState<any[]>([{}]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const addRow = () => {
    if (rows.length < maxRows) {
      setRows([...rows, {}]);
    } else {
      toast({
        title: "Row limit reached",
        description: `Maximum ${maxRows} rows allowed`,
        variant: "destructive",
      });
    }
  };

  const addMultipleRows = (count: number) => {
    const newRowsCount = Math.min(count, maxRows - rows.length);
    if (newRowsCount > 0) {
      const newRows = Array(newRowsCount).fill({}).map(() => ({}));
      setRows([...rows, ...newRows]);
      toast({
        title: "Rows added",
        description: `Added ${newRowsCount} new rows`,
      });
    } else {
      toast({
        title: "Cannot add rows",
        description: `Would exceed maximum limit of ${maxRows} rows`,
        variant: "destructive",
      });
    }
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows);
      
      // Clean up errors for removed row
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`${index}-`)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  const updateCell = (rowIndex: number, columnKey: string, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [columnKey]: value };
    setRows(newRows);
    
    // Clear error for this cell
    const errorKey = `${rowIndex}-${columnKey}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const validateData = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    rows.forEach((row, rowIndex) => {
      columns.forEach(column => {
        const value = row[column.key];
        const errorKey = `${rowIndex}-${column.key}`;

        if (column.required && (!value || value.toString().trim() === '')) {
          newErrors[errorKey] = `${column.label} is required`;
          isValid = false;
        } else if (value && column.type === 'number' && isNaN(Number(value))) {
          newErrors[errorKey] = `${column.label} must be a valid number`;
          isValid = false;
        } else if (value && column.type === 'date' && isNaN(Date.parse(value))) {
          newErrors[errorKey] = `${column.label} must be a valid date`;
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateData()) {
      toast({
        title: "Validation errors",
        description: "Please fix the errors before submitting",
        variant: "destructive",
      });
      return;
    }

    // Filter out completely empty rows
    const validRows = rows.filter(row => 
      Object.values(row).some(value => value && value.toString().trim() !== '')
    );

    if (validRows.length === 0) {
      toast({
        title: "No data to submit",
        description: "Please enter at least one row of data",
        variant: "destructive",
      });
      return;
    }

    // Process data based on column types
    const processedRows = validRows.map(row => {
      const processed: any = {};
      columns.forEach(column => {
        let value = row[column.key];
        
        if (value !== undefined && value !== null && value !== '') {
          switch (column.type) {
            case 'number':
              processed[column.key] = Number(value);
              break;
            case 'date':
              processed[column.key] = new Date(value);
              break;
            default:
              processed[column.key] = value.toString().trim();
          }
        } else if (column.type === 'number') {
          processed[column.key] = 0;
        } else {
          processed[column.key] = '';
        }
      });
      return processed;
    });

    onDataSubmit(processedRows);
    
    toast({
      title: "Data submitted successfully",
      description: `${processedRows.length} rows processed`,
    });
  };

  const renderInput = (column: ColumnDefinition, rowIndex: number, value: string) => {
    const errorKey = `${rowIndex}-${column.key}`;
    const hasError = !!errors[errorKey];

    switch (column.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => updateCell(rowIndex, column.key, e.target.value)}
            className={`w-full h-9 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 ${
              hasError 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            } bg-white dark:bg-gray-800 text-black dark:text-white`}
          >
            <option value="">Select...</option>
            {column.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => updateCell(rowIndex, column.key, e.target.value)}
            className={`text-sm h-9 ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            placeholder={column.placeholder}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => updateCell(rowIndex, column.key, e.target.value)}
            className={`text-sm h-9 ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            placeholder={column.placeholder || '0'}
            step="0.01"
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => updateCell(rowIndex, column.key, e.target.value)}
            className={`text-sm h-9 ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            placeholder={column.placeholder}
          />
        );
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-2 flex items-center justify-center gap-2">
          <Edit3 className="h-5 w-5 text-[#fd7014]" />
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-sm">
              {rows.length} product{rows.length !== 1 ? 's' : ''} 
              {maxRows && ` (max ${maxRows})`}
            </Badge>
            <div className="flex gap-2">
              <Button
                onClick={addRow}
                size="sm"
                variant="outline"
                disabled={rows.length >= maxRows}
                className="border-gray-300 dark:border-slate-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add 1
              </Button>
              <Button
                onClick={() => addMultipleRows(5)}
                size="sm"
                variant="outline"
                disabled={rows.length + 5 > maxRows}
                className="border-gray-300 dark:border-slate-600"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add 5
              </Button>
              <Button
                onClick={() => addMultipleRows(10)}
                size="sm"
                variant="outline"
                disabled={rows.length + 10 > maxRows}
                className="border-gray-300 dark:border-slate-600"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add 10
              </Button>
              <Button 
                onClick={handleSubmit} 
                size="sm"
                className="bg-[#fd7014] hover:bg-[#e5640f] text-white"
              >
                <Save className="h-4 w-4 mr-1" />
                Submit All
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4">

          <div className="overflow-x-auto max-h-96">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                  <th className="p-3 text-left text-sm font-semibold w-12 bg-gray-50 dark:bg-gray-700">#</th>
                  {columns.map(column => (
                    <th key={column.key} className="p-3 text-left text-sm font-semibold min-w-40 bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-center gap-1">
                        {column.label}
                        {column.required && <span className="text-red-500 text-xs">*</span>}
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-left text-sm font-semibold w-16 bg-gray-50 dark:bg-gray-700">Remove</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-3 text-sm text-gray-500 font-medium bg-gray-25 dark:bg-gray-800">
                      {rowIndex + 1}
                    </td>
                    {columns.map(column => (
                      <td key={column.key} className="p-3">
                        <div className="space-y-1">
                          {renderInput(column, rowIndex, row[column.key])}
                          {errors[`${rowIndex}-${column.key}`] && (
                            <p className="text-xs text-red-500 font-medium">
                              {errors[`${rowIndex}-${column.key}`]}
                            </p>
                          )}
                        </div>
                      </td>
                    ))}
                    <td className="p-3">
                      <Button
                        onClick={() => removeRow(rowIndex)}
                        size="sm"
                        variant="ghost"
                        disabled={rows.length === 1}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-2">
                Please fix the following errors:
              </p>
              <div className="max-h-24 overflow-y-auto">
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}