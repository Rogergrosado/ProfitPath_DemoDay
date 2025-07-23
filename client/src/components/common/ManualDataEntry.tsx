import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Save, Edit3 } from "lucide-react";
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
            className={`w-full p-2 text-sm border rounded ${
              hasError 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-800`}
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
            className={`text-sm ${hasError ? 'border-red-500' : ''}`}
            placeholder={column.placeholder}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => updateCell(rowIndex, column.key, e.target.value)}
            className={`text-sm ${hasError ? 'border-red-500' : ''}`}
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
            className={`text-sm ${hasError ? 'border-red-500' : ''}`}
            placeholder={column.placeholder}
          />
        );
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Badge variant="outline">
            {rows.length} row{rows.length !== 1 ? 's' : ''} 
            {maxRows && ` (max ${maxRows})`}
          </Badge>
          <div className="flex gap-2">
            <Button
              onClick={addRow}
              size="sm"
              variant="outline"
              disabled={rows.length >= maxRows}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </Button>
            <Button onClick={handleSubmit} size="sm">
              <Save className="h-4 w-4 mr-1" />
              Submit Data
            </Button>
          </div>
        </div>

        <Separator />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left text-sm font-medium w-8">#</th>
                {columns.map(column => (
                  <th key={column.key} className="p-2 text-left text-sm font-medium min-w-32">
                    {column.label}
                    {column.required && <span className="text-red-500 ml-1">*</span>}
                  </th>
                ))}
                <th className="p-2 text-left text-sm font-medium w-12">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-2 text-sm text-gray-500">{rowIndex + 1}</td>
                  {columns.map(column => (
                    <td key={column.key} className="p-2">
                      {renderInput(column, rowIndex, row[column.key])}
                      {errors[`${rowIndex}-${column.key}`] && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors[`${rowIndex}-${column.key}`]}
                        </p>
                      )}
                    </td>
                  ))}
                  <td className="p-2">
                    <Button
                      onClick={() => removeRow(rowIndex)}
                      size="sm"
                      variant="ghost"
                      disabled={rows.length === 1}
                      className="text-red-500 hover:text-red-700"
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              Please fix the following errors:
            </p>
            <ul className="text-sm text-red-600 dark:text-red-400 mt-1 list-disc list-inside">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}