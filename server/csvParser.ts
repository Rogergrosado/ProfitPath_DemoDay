import { parse } from 'csv-parse/sync';

export interface CSVParseResult {
  type: 'sales' | 'products' | 'mixed';
  salesData: any[];
  productsData: any[];
  errors: string[];
}

export function parseCSV(csvContent: string): CSVParseResult {
  const result: CSVParseResult = {
    type: 'sales',
    salesData: [],
    productsData: [],
    errors: []
  };

  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (records.length === 0) {
      result.errors.push('CSV file is empty or has no valid data rows');
      return result;
    }

    const headers = Object.keys(records[0]).map(h => h.toLowerCase().trim());
    
    // Detect CSV type based on headers
    const hasSalesFields = headers.some(h => 
      h.includes('units sold') || h.includes('quantity') || h.includes('sale date') || h.includes('date')
    );
    const hasProductFields = headers.some(h => 
      h.includes('product name') || h.includes('current stock') || h.includes('supplier') || h.includes('reorder')
    );

    if (hasSalesFields && hasProductFields) {
      result.type = 'mixed';
    } else if (hasSalesFields) {
      result.type = 'sales';
    } else if (hasProductFields) {
      result.type = 'products';
    } else {
      result.errors.push('Unable to determine CSV type. Please ensure headers match expected format.');
      return result;
    }

    // Parse records based on type
    for (const [index, record] of records.entries()) {
      try {
        if (result.type === 'sales' || result.type === 'mixed') {
          const salesRecord = parseSalesRecord(record, index + 2); // +2 for header and 0-index
          if (salesRecord) {
            result.salesData.push(salesRecord);
          }
        }

        if (result.type === 'products' || result.type === 'mixed') {
          const productRecord = parseProductRecord(record, index + 2);
          if (productRecord) {
            result.productsData.push(productRecord);
          }
        }
      } catch (error: any) {
        result.errors.push(`Row ${index + 2}: ${error.message}`);
      }
    }

  } catch (error: any) {
    result.errors.push(`CSV parsing error: ${error.message}`);
  }

  return result;
}

function parseSalesRecord(record: any, rowNumber: number): any | null {
  const sku = findFieldValue(record, ['sku', 'product sku', 'item sku', 'product_sku', 'item_sku', 'code', 'product code']);
  const date = findFieldValue(record, ['date', 'sale date', 'transaction date', 'order date', 'purchase date', 'sold date']);
  const quantity = findFieldValue(record, ['quantity', 'units sold', 'qty', 'amount', 'units', 'quantity sold', 'sold']);
  const price = findFieldValue(record, ['price', 'unit price', 'selling price', 'sale price', 'unit_price', 'sell_price']);

  if (!sku) {
    throw new Error('SKU is required for sales records');
  }
  if (!date) {
    throw new Error('Date is required for sales records');
  }
  if (!quantity || isNaN(Number(quantity))) {
    throw new Error('Valid quantity is required for sales records');
  }
  if (!price || isNaN(Number(price))) {
    throw new Error('Valid price is required for sales records');
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date format');
  }

  const qty = parseInt(quantity);
  const unitPrice = parseFloat(price);
  const totalRevenue = qty * unitPrice;

  return {
    sku: sku.toString().trim(),
    productName: findFieldValue(record, ['product name', 'name', 'item name']) || sku,
    category: findFieldValue(record, ['category', 'product category']) || 'imported',
    quantity: qty,
    unitPrice: unitPrice.toFixed(2),
    totalRevenue: totalRevenue.toFixed(2),
    totalCost: findFieldValue(record, ['total cost', 'cost']) ? 
      parseFloat(findFieldValue(record, ['total cost', 'cost'])).toFixed(2) : '0.00',
    profit: totalRevenue.toFixed(2), // Will be recalculated on backend
    saleDate: parsedDate,
    marketplace: findFieldValue(record, ['marketplace', 'platform']) || 'imported',
    notes: findFieldValue(record, ['notes', 'description', 'memo']) || `Imported from CSV row ${rowNumber}`,
  };
}

function parseProductRecord(record: any, rowNumber: number): any | null {
  const name = findFieldValue(record, ['product name', 'name', 'item name', 'title', 'product', 'item']);
  const sku = findFieldValue(record, ['sku', 'product sku', 'item sku', 'product_sku', 'item_sku', 'code']);
  const category = findFieldValue(record, ['category', 'product category', 'type', 'product_category']);

  if (!name) {
    throw new Error('Product name is required');
  }
  if (!sku) {
    throw new Error('SKU is required');
  }

  const sellingPrice = findFieldValue(record, ['selling price', 'price', 'unit price', 'sale price']);
  const costPrice = findFieldValue(record, ['cost price', 'cost', 'unit cost']);
  const currentStock = findFieldValue(record, ['current stock', 'stock', 'inventory', 'quantity']);
  const reorderPoint = findFieldValue(record, ['reorder point', 'min stock', 'reorder level']);

  return {
    name: name.toString().trim(),
    sku: sku.toString().trim(),
    category: category || 'imported',
    sellingPrice: sellingPrice ? parseFloat(sellingPrice).toFixed(2) : '0.00',
    costPrice: costPrice ? parseFloat(costPrice).toFixed(2) : '0.00',
    currentStock: currentStock ? parseInt(currentStock) : 0,
    reorderPoint: reorderPoint ? parseInt(reorderPoint) : 10,
    leadTime: findFieldValue(record, ['lead time', 'delivery time']) || 7,
    supplierName: findFieldValue(record, ['supplier', 'supplier name', 'vendor']) || 'Unknown',
    supplierContact: findFieldValue(record, ['supplier contact', 'vendor contact']) || '',
    location: findFieldValue(record, ['location', 'warehouse']) || 'Default',
    notes: findFieldValue(record, ['notes', 'description']) || `Imported from CSV row ${rowNumber}`,
  };
}

function findFieldValue(record: any, possibleKeys: string[]): string | undefined {
  const recordKeys = Object.keys(record);
  
  for (const targetKey of possibleKeys) {
    const normalizedTarget = targetKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Try exact match first
    if (record[targetKey] !== undefined && record[targetKey] !== '') {
      return record[targetKey];
    }
    
    // Enhanced flexible matching
    for (const recordKey of recordKeys) {
      const normalizedRecordKey = recordKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      const lowerRecordKey = recordKey.toLowerCase().trim();
      const lowerTargetKey = targetKey.toLowerCase().trim();
      
      // Case-insensitive exact match
      if (lowerRecordKey === lowerTargetKey) {
        const value = record[recordKey];
        if (value !== undefined && value !== '' && value !== null) {
          return value.toString().trim();
        }
      }
      
      // Normalized match (removes spaces, punctuation)
      if (normalizedRecordKey === normalizedTarget) {
        const value = record[recordKey];
        if (value !== undefined && value !== '' && value !== null) {
          return value.toString().trim();
        }
      }
      
      // Contains match (both directions)
      if (normalizedRecordKey.includes(normalizedTarget) || normalizedTarget.includes(normalizedRecordKey)) {
        const value = record[recordKey];
        if (value !== undefined && value !== '' && value !== null) {
          return value.toString().trim();
        }
      }
    }
  }
  
  return undefined;
}

export function validateCSVData(data: any[], type: 'sales' | 'products'): string[] {
  const errors: string[] = [];
  
  if (type === 'sales') {
    for (const [index, record] of data.entries()) {
      if (!record.sku) errors.push(`Row ${index + 1}: SKU is required`);
      if (!record.quantity || record.quantity <= 0) errors.push(`Row ${index + 1}: Valid quantity is required`);
      if (!record.unitPrice || parseFloat(record.unitPrice) <= 0) errors.push(`Row ${index + 1}: Valid price is required`);
      if (!record.saleDate) errors.push(`Row ${index + 1}: Sale date is required`);
    }
  } else if (type === 'products') {
    for (const [index, record] of data.entries()) {
      if (!record.name) errors.push(`Row ${index + 1}: Product name is required`);
      if (!record.sku) errors.push(`Row ${index + 1}: SKU is required`);
      if (record.currentStock < 0) errors.push(`Row ${index + 1}: Stock cannot be negative`);
      if (parseFloat(record.sellingPrice) < 0) errors.push(`Row ${index + 1}: Selling price cannot be negative`);
      if (parseFloat(record.costPrice) < 0) errors.push(`Row ${index + 1}: Cost price cannot be negative`);
    }
  }
  
  return errors;
}