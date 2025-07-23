import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertInventorySchema, insertSaleSchema, insertGoalSchema, insertReportSchema, insertSalesHistorySchema, insertCalendarSalesSchema, insertReorderCalendarSchema } from "@shared/schema";

// Extend Express Request type to include userId
interface AuthenticatedRequest extends Request {
  userId: number;
}

// Performance recalculation trigger function
async function triggerPerformanceRecalculation(userId: number) {
  // This could be expanded to update cached metrics, trigger webhooks, etc.
  console.log(`🔄 Triggering performance recalculation for user ${userId}`);
  
  // For now, we'll just ensure the metrics are fresh
  // The actual calculation happens in storage.getSalesMetrics()
  await storage.getSalesMetrics(userId, "30d");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    }
  });

  // Auth middleware to get user from Firebase token
  const requireAuth = async (req: any, res: any, next: any) => {
    console.log('🔐 Auth middleware called, headers:', {
      authorization: req.headers.authorization ? `Bearer ${req.headers.authorization.split(' ')[1]?.substring(0, 20)}...` : 'none'
    });
    
    // Check for Firebase token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No Firebase Bearer token found');
      return res.status(401).json({ message: "Unauthorized - Firebase token required" });
    }

    const token = authHeader.split(' ')[1];
    try {
      // Decode the Firebase JWT token (without verification for development)
      // In production, you would use Firebase Admin SDK to verify
      const decodedPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const firebaseUid = decodedPayload.user_id;
      
      if (!firebaseUid) {
        console.error('❌ No user_id found in Firebase token');
        return res.status(401).json({ message: "Invalid Firebase token - no user ID" });
      }

      console.log('🔐 Firebase token decoded, UID:', firebaseUid);
      
      // Look up internal user ID by Firebase UID
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        console.error('❌ No user found for Firebase UID:', firebaseUid);
        return res.status(401).json({ message: "User not found" });
      }

      console.log('✅ User authenticated:', user.email, '(ID:', user.id, ')');
      (req as AuthenticatedRequest).userId = user.id;
      return next();
      
    } catch (error) {
      console.error('❌ Firebase token verification failed:', error);
      return res.status(401).json({ message: "Invalid Firebase token" });
    }
  };

  // Users
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/firebase/:firebaseUid", async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.params.firebaseUid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await storage.getUser(authReq.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const updateData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(authReq.userId, updateData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await storage.getUser(authReq.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user/stats", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const stats = await storage.getUserStats(authReq.userId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user/settings", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await storage.getUser(authReq.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/user/settings", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const updateData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(authReq.userId, updateData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/user/test-notification", requireAuth, async (req, res) => {
    try {
      // Mock test notification
      res.json({ message: "Test notification sent successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Products (Watchlist)
  app.get("/api/products/watchlist", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const products = await storage.getWatchlistProducts(authReq.userId);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const productData = insertProductSchema.parse({ ...req.body, userId: authReq.userId });
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, updateData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Promote product to inventory
  app.post("/api/products/:id/promote", requireAuth, async (req, res) => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const productId = parseInt(req.params.id);
      const { sku, currentStock, costPrice, sellingPrice, reorderPoint } = req.body;

      // Validate required fields
      if (!sku || currentStock === undefined || !costPrice || !sellingPrice) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get the product to promote
      const product = await storage.getProduct(productId);
      if (!product || product.userId !== authReq.userId) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Create inventory item
      const inventoryItem = await storage.createInventoryItem({
        userId: authReq.userId,
        productId: productId,
        name: product.name,
        sku: sku,
        category: product.category,
        currentStock: currentStock,
        reservedStock: 0,
        reorderPoint: reorderPoint || 0,
        costPrice: costPrice.toString(),
        sellingPrice: sellingPrice.toString(),
        imageUrl: product.imageUrl,
      });

      res.json(inventoryItem);
    } catch (error: any) {
      console.error("Error promoting product:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Manual Sales Entry - Comprehensive endpoint
  app.post('/api/sales/manual-entry', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { sku, quantity_sold, unit_price, sale_date, notes } = req.body;
      const userId = authReq.userId;

      // Validate required fields
      if (!sku || !quantity_sold || !unit_price || !sale_date) {
        return res.status(400).json({ 
          message: "Missing required fields: sku, quantity_sold, unit_price, sale_date" 
        });
      }

      // Validate data types
      if (quantity_sold <= 0 || unit_price <= 0) {
        return res.status(400).json({ 
          message: "Quantity sold and unit price must be greater than zero" 
        });
      }

      console.log(`📤 Processing manual sale entry for user ${userId}:`, {
        sku, quantity_sold, unit_price, sale_date, notes
      });

      // Process the comprehensive manual sale
      const result = await storage.processManualSale(userId, {
        sku,
        quantity_sold: parseInt(quantity_sold),
        unit_price: parseFloat(unit_price),
        sale_date,
        notes
      });

      // Trigger performance recalculation
      await triggerPerformanceRecalculation(userId);

      console.log(`✅ Manual sale processed successfully:`, {
        newStock: result.updatedInventory.currentStock,
        revenue: result.saleEntry.totalRevenue,
        profit: result.saleEntry.profit
      });

      res.json({
        success: true,
        message: "Sale recorded successfully",
        data: {
          inventory: result.updatedInventory,
          sale: result.saleEntry,
          calendar: result.calendarEntry,
          kpis: result.kpis
        }
      });

    } catch (error: any) {
      console.error('❌ Manual sales entry error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to process manual sale entry' 
      });
    }
  });

  // Inventory KPIs endpoint
  app.get('/api/inventory/kpis', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const kpis = await storage.getInventoryKPIs(authReq.userId);
      res.json(kpis);
    } catch (error: any) {
      console.error('KPIs error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Sales History endpoint (removed duplicate - keeping the one further down with proper getSalesHistory method)

  // Calendar endpoints for sales and reorder data
  app.get('/api/sales/calendar', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { month, year } = req.query;
      const userId = authReq.userId;

      // Get sales data for the specified month/year
      const sales = await storage.getSales(userId);
      const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate.getMonth() === parseInt(month as string) - 1 && 
               saleDate.getFullYear() === parseInt(year as string);
      });

      res.json(filteredSales);
    } catch (error) {
      console.error('Sales calendar error:', error);
      res.status(500).json({ message: 'Failed to fetch sales calendar' });
    }
  });

  app.get('/api/reorder/calendar', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { month, year } = req.query;
      const userId = authReq.userId;

      // Get inventory items that need reordering
      const inventory = await storage.getInventory(userId);
      const reorderItems = inventory.filter(item => 
        (item.currentStock || 0) <= (item.reorderPoint || 0)
      ).map(item => ({
        ...item,
        reorderDate: new Date().toISOString(), // Placeholder - in real app this would be calculated
        quantity: item.reorderPoint || 0
      }));

      res.json(reorderItems);
    } catch (error) {
      console.error('Reorder calendar error:', error);
      res.status(500).json({ message: 'Failed to fetch reorder calendar' });
    }
  });

  // Restock endpoint with calendar integration
  app.post('/api/inventory/:sku/restock', requireAuth, async (req, res) => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const { sku } = req.params;
      const { quantity, reorderDate, notes } = req.body;
      const userId = authReq.userId;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      // Find inventory item by SKU
      const inventory = await storage.getInventory(userId);
      const item = inventory.find(inv => inv.sku === sku);
      
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      // Update inventory stock level (additive restock)
      const newStockLevel = (item.currentStock || 0) + parseInt(quantity);
      const updatedItem = {
        ...item,
        currentStock: newStockLevel,
        lastRestocked: new Date(reorderDate || new Date())
      };

      await storage.updateInventoryItem(item.id, updatedItem);
      
      // Record reorder to calendar for advanced reorder calendar tracking
      try {
        await storage.createReorderCalendarEntry({
          userId,
          inventoryId: item.id,
          sku: item.sku || "",
          productName: item.name || "",
          reorderDate: new Date(reorderDate || new Date()),
          quantity: parseInt(quantity),
          notes: notes || ""
        });
      } catch (calendarError) {
        console.warn('Failed to record reorder calendar entry:', calendarError);
        // Don't fail the entire request if calendar entry fails
      }
      
      res.json({ 
        message: "Product restocked successfully", 
        item: updatedItem,
        previousStock: (item.currentStock || 0),
        newStock: newStockLevel,
        quantityAdded: parseInt(quantity),
        reorderDate: reorderDate || new Date().toISOString(),
        notes: notes || ""
      });
    } catch (error: any) {
      console.error('Restock error:', error);
      res.status(500).json({ message: error.message || 'Failed to update stock' });
    }
  });

  // Inventory
  app.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const inventory = await storage.getInventory(authReq.userId);
      res.json(inventory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/inventory", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      console.log("Received inventory data:", req.body);
      
      // Manually validate and transform data (using current database schema)
      const itemData = {
        userId: authReq.userId,
        name: req.body.name,
        sku: req.body.sku,
        category: req.body.category,
        currentStock: parseInt(req.body.currentStock) || 0,
        reservedStock: parseInt(req.body.reservedStock) || 0,
        reorderPoint: parseInt(req.body.reorderPoint) || 0,
        costPrice: req.body.costPrice ? req.body.costPrice.toString() : null,
        sellingPrice: req.body.sellingPrice ? req.body.sellingPrice.toString() : null,
        productId: req.body.productId || null,
      };
      
      console.log("Transformed inventory data:", itemData);
      const item = await storage.createInventoryItem(itemData);
      res.json(item);
    } catch (error: any) {
      console.error("Inventory creation error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/inventory/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertInventorySchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(id, updateData);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/inventory/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInventoryItem(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Inventory CSV Import endpoint
  app.post("/api/inventory/import", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { items } = req.body;
      
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ message: "No items provided for import" });
      }

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const item of items) {
        try {
          // Check if inventory item with this SKU already exists
          const existingItems = await storage.getInventory(authReq.userId);
          const existing = existingItems.find(inv => inv.sku === item.sku);
          
          if (existing) {
            // Update existing inventory item
            const updateData = {
              name: item.name || existing.name,
              category: item.category || existing.category,
              currentStock: parseInt(item.currentStock) || existing.currentStock,
              costPrice: item.costPrice ? item.costPrice.toString() : existing.costPrice,
              sellingPrice: item.sellingPrice ? item.sellingPrice.toString() : existing.sellingPrice,
              reorderPoint: parseInt(item.reorderPoint) || existing.reorderPoint,
              supplierName: item.supplierName || existing.supplierName,
              supplierSKU: item.supplierSKU || existing.supplierSKU,
              leadTimeDays: parseInt(item.leadTimeDays) || existing.leadTimeDays,
              notes: item.notes || existing.notes,
            };
            
            await storage.updateInventoryItem(existing.id, updateData);
            imported++;
          } else {
            // Create new inventory item
            const inventoryData = {
              userId: authReq.userId,
              name: item.name,
              sku: item.sku,
              category: item.category,
              currentStock: parseInt(item.currentStock) || 0,
              reservedStock: 0,
              reorderPoint: parseInt(item.reorderPoint) || 0,
              costPrice: item.costPrice ? item.costPrice.toString() : null,
              sellingPrice: item.sellingPrice ? item.sellingPrice.toString() : null,
              supplierName: item.supplierName || null,
              supplierSKU: item.supplierSKU || null,
              leadTimeDays: parseInt(item.leadTimeDays) || 14,
              notes: item.notes || null,
            };
            
            await storage.createInventoryItem(inventoryData);
            imported++;
          }
        } catch (error: any) {
          console.warn(`Failed to process inventory item ${item.sku}:`, error);
          errors.push(`Failed to import ${item.sku}: ${error.message}`);
          skipped++;
        }
      }

      res.json({
        message: `Successfully imported ${imported} items. ${skipped} items were ${skipped > 0 ? 'skipped due to errors' : 'skipped'}.`,
        imported,
        skipped,
        errors: errors.length > 0 ? errors : undefined
      });
      
    } catch (error: any) {
      console.error('Inventory import error:', error);
      res.status(500).json({ message: error.message || 'Failed to import inventory' });
    }
  });

  // Bulk operations endpoints
  app.post("/api/inventory/bulk-edit", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      console.log("🔄 Bulk edit initiated");
      const { items, updates } = req.body;
      
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items array is required" });
      }

      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Updates object is required" });
      }

      let updated = 0;
      const errors: string[] = [];

      for (const itemId of items) {
        try {
          await storage.updateInventoryItem(itemId, updates);
          updated++;
        } catch (error: any) {
          errors.push(`Failed to update item ${itemId}: ${error.message}`);
        }
      }
      
      console.log(`✅ Bulk edit completed: ${updated} items updated`);
      res.json({ 
        message: "Bulk edit successful", 
        updated,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error: any) {
      console.error("❌ Bulk edit error:", error);
      res.status(500).json({ error: error.message || "Failed to update items" });
    }
  });

  app.delete("/api/inventory/bulk-delete", requireAuth, async (req, res) => {
    try {
      console.log("🗑️ Bulk delete initiated");
      const { items } = req.body;
      
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items array is required" });
      }

      let deleted = 0;
      const errors: string[] = [];

      for (const itemId of items) {
        try {
          await storage.deleteInventoryItem(itemId);
          deleted++;
        } catch (error: any) {
          errors.push(`Failed to delete item ${itemId}: ${error.message}`);
        }
      }
      
      console.log(`✅ Bulk delete completed: ${deleted} items deleted`);
      res.json({ 
        message: "Bulk delete successful", 
        deleted,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error: any) {
      console.error("❌ Bulk delete error:", error);
      res.status(500).json({ error: error.message || "Failed to delete items" });
    }
  });

  app.post("/api/inventory/bulk-category", requireAuth, async (req, res) => {
    try {
      console.log("🏷️ Bulk category update initiated");
      const { items, category } = req.body;
      
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items array is required" });
      }

      if (!category) {
        return res.status(400).json({ error: "Category is required" });
      }

      let updated = 0;
      const errors: string[] = [];

      for (const itemId of items) {
        try {
          await storage.updateInventoryItem(itemId, { category });
          updated++;
        } catch (error: any) {
          errors.push(`Failed to update category for item ${itemId}: ${error.message}`);
        }
      }
      
      console.log(`✅ Bulk category update completed: ${updated} items updated`);
      res.json({ 
        message: "Bulk category update successful", 
        updated,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error: any) {
      console.error("❌ Bulk category update error:", error);
      res.status(500).json({ error: error.message || "Failed to update categories" });
    }
  });

  // Sales
  app.get("/api/sales", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const range = req.query.range as string;
      
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (range) {
        endDate = new Date();
        switch (range) {
          case '7d':
            startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '1y':
            startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
            break;
        }
      } else {
        startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      }
      
      const sales = await storage.getSales(authReq.userId, startDate, endDate);
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sales", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const saleData = insertSaleSchema.parse({ ...req.body, userId: authReq.userId });
      const sale = await storage.createSale(saleData);
      
      // Create corresponding sales history entry for consistency
      try {
        await storage.createSalesHistoryEntry({
          userId: authReq.userId,
          inventoryId: sale.inventoryId,
          sku: sale.sku,
          productName: sale.productName || 'Unknown Product',
          quantitySold: sale.quantity,
          unitPrice: sale.unitPrice,
          totalRevenue: sale.totalRevenue,
          totalCost: sale.totalCost,
          profit: sale.profit,
          saleDate: sale.saleDate,
          notes: null,
        });
        console.log(`📊 Sales history entry created for SKU: ${sale.sku}`);
      } catch (historyError) {
        console.warn(`Failed to create sales history entry for SKU ${sale.sku}:`, historyError);
      }
      
      // Update inventory levels when individual sales are recorded
      if (sale.sku && sale.quantity) {
        try {
          await storage.updateInventoryFromSales(authReq.userId, sale.sku, sale.quantity);
        } catch (error) {
          console.warn(`Failed to update inventory for SKU ${sale.sku}:`, error);
        }
      }
      
      // Trigger performance recalculation
      try {
        await triggerPerformanceRecalculation(authReq.userId);
      } catch (error) {
        console.warn('Performance recalculation failed:', error);
      }
      
      res.json(sale);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // CSV Import endpoint with intelligent parsing
  app.post("/api/sales/csv-import", requireAuth, upload.single('csvFile'), async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Handle multipart form data (CSV file upload)
      if (!req.body.csvContent && !req.file) {
        return res.status(400).json({ message: "No CSV content or file provided" });
      }
      
      // Import CSV parser
      const { parseCSV, validateCSVData } = await import('./csvParser');
      
      const csvContent = req.body.csvContent || req.file?.buffer?.toString('utf-8');
      const mode = req.body.mode || 'sales'; // sales, products, mixed
      
      if (!csvContent) {
        return res.status(400).json({ message: "Invalid CSV content" });
      }
      
      const parseResult = parseCSV(csvContent);
      
      if (parseResult.errors.length > 0) {
        return res.status(400).json({ 
          message: "CSV parsing errors", 
          errors: parseResult.errors 
        });
      }
      
      let importedSales: any[] = [];
      let importedProducts: any[] = [];
      
      // Process sales data
      if (parseResult.salesData.length > 0) {
        const salesErrors = validateCSVData(parseResult.salesData, 'sales');
        if (salesErrors.length > 0) {
          return res.status(400).json({ message: "Sales data validation failed", errors: salesErrors });
        }
        
        const batchId = `csv_${Date.now()}_${authReq.userId}`;
        
        for (const saleRecord of parseResult.salesData) {
          const saleData = insertSaleSchema.parse({
            ...saleRecord,
            userId: authReq.userId,
            importBatch: batchId
          });
          
          const sale = await storage.createSale(saleData);
          importedSales.push(sale);
          
          // Update inventory levels
          try {
            await storage.updateInventoryFromSales(authReq.userId, sale.sku, sale.quantity);
          } catch (error) {
            console.warn(`Failed to update inventory for SKU ${sale.sku}:`, error);
          }
        }
      }
      
      // Process products data
      if (parseResult.productsData.length > 0) {
        const productErrors = validateCSVData(parseResult.productsData, 'products');
        if (productErrors.length > 0) {
          return res.status(400).json({ message: "Product data validation failed", errors: productErrors });
        }
        
        for (const productRecord of parseResult.productsData) {
          try {
            // Check if inventory item with this SKU already exists
            const existingItems = await storage.getInventory(authReq.userId);
            const existing = existingItems.find(item => item.sku === productRecord.sku);
            
            if (existing) {
              // Update existing inventory item
              const updatedItem = await storage.updateInventoryItem(existing.id, productRecord);
              importedProducts.push(updatedItem);
            } else {
              // Create new inventory item
              const inventoryData = insertInventorySchema.parse({
                ...productRecord,
                userId: authReq.userId
              });
              const newItem = await storage.createInventoryItem(inventoryData);
              importedProducts.push(newItem);
            }
          } catch (error: any) {
            console.warn(`Failed to process product ${productRecord.sku}:`, error);
          }
        }
      }
      
      // Trigger performance recalculation after any sales import
      if (importedSales.length > 0) {
        try {
          const existingFunction = triggerPerformanceRecalculation;
          if (typeof existingFunction === 'function') {
            await existingFunction(authReq.userId);
          }
        } catch (error) {
          console.warn('Performance recalculation failed after CSV import:', error);
        }
      }
      
      res.json({
        message: `Successfully imported ${importedSales.length} sales and ${importedProducts.length} products`,
        importedSales: importedSales.length,
        importedProducts: importedProducts.length,
        type: parseResult.type,
        salesData: importedSales,
        productsData: importedProducts
      });
      
    } catch (error: any) {
      console.error('CSV import error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Bulk sales import for Performance Analytics
  app.post("/api/sales/bulk-import", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { salesData } = req.body;
      
      if (!Array.isArray(salesData) || salesData.length === 0) {
        return res.status(400).json({ message: "Invalid sales data format" });
      }
      
      const batchId = `batch_${Date.now()}_${authReq.userId}`;
      
      const importedSales = await storage.bulkImportSales(authReq.userId, salesData, batchId);
      
      // Update inventory levels for each sale
      for (const sale of importedSales) {
        try {
          await storage.updateInventoryFromSales(authReq.userId, sale.sku, sale.quantity);
        } catch (error) {
          console.warn(`Failed to update inventory for SKU ${sale.sku}:`, error);
        }
      }
      
      // Trigger performance recalculation after bulk import
      try {
        const existingFunction = triggerPerformanceRecalculation;
        if (typeof existingFunction === 'function') {
          await existingFunction(authReq.userId);
        }
      } catch (error) {
        console.warn('Performance recalculation failed after bulk import:', error);
      }
      
      res.json({ 
        message: `Successfully imported ${importedSales.length} sales records`,
        batchId,
        importedCount: importedSales.length,
        data: importedSales
      });
    } catch (error: any) {
      console.error("Error importing sales:", error);
      res.status(500).json({ message: "Failed to import sales data", error: error.message });
    }
  });

  app.get("/api/performance/metrics", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const dateRange = req.query.dateRange as string || "30d";
      const metrics = await storage.getSalesMetrics(authReq.userId, dateRange);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/performance/categories", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const dateRange = req.query.dateRange as string || "30d";
      const categories = await storage.getCategoryPerformance(authReq.userId, dateRange);
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // NEW: Performance KPIs with filters
  app.get("/api/performance/kpis", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { startDate, endDate, sku, category } = req.query;

      const kpis = await storage.getPerformanceKPIs(authReq.userId, {
        startDate: startDate as string,
        endDate: endDate as string,
        sku: sku as string,
        category: category as string
      });
      
      res.json(kpis);
    } catch (error: any) {
      console.error('Error fetching performance KPIs:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // NEW: Dashboard KPIs (career-wide aggregates)
  app.get("/api/dashboard/kpis", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const kpis = await storage.getDashboardKPIs(authReq.userId);
      res.json(kpis);
    } catch (error: any) {
      console.error('Error fetching dashboard KPIs:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // NEW: Dashboard Analytics Summary - Real-time chart data
  app.get("/api/analytics/dashboard-summary", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { range = 'weekly' } = req.query;
      
      const salesData = await storage.getSalesSummaryByRange(authReq.userId, range as string);
      
      const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
      const totalProfit = salesData.reduce((sum, item) => sum + item.profit, 0);  
      const totalUnitsSold = salesData.reduce((sum, item) => sum + item.units, 0);
      
      res.json({
        salesData,
        summary: {
          totalRevenue,
          totalProfit,
          totalUnitsSold,
        }
      });
    } catch (error: any) {
      console.error('Error fetching dashboard summary:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // NEW: Sales Trends Explorer API
  app.get("/api/analytics/sales-trend", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { startDate, endDate, sku, category } = req.query;

      const trends = await storage.getSalesTrends(authReq.userId, {
        startDate: startDate as string,
        endDate: endDate as string,
        sku: sku as string,
        category: category as string
      });
      
      res.json(trends);
    } catch (error: any) {
      console.error('Error fetching sales trends:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // NEW: SKU Leaderboard API
  app.get("/api/analytics/sku-leaderboard", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { sortBy, order, category } = req.query;

      const leaderboard = await storage.getSKULeaderboard(authReq.userId, {
        sortBy: sortBy as 'unitsSold' | 'revenue' | 'profit' | 'margin',
        order: order as 'asc' | 'desc',
        category: category as string
      });
      
      res.json(leaderboard);
    } catch (error: any) {
      console.error('Error fetching SKU leaderboard:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // TROPHY SYSTEM API ROUTES
  app.get("/api/trophies", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userTrophies = await storage.getUserTrophies(authReq.userId);
      res.json(userTrophies);
    } catch (error: any) {
      console.error('Error fetching trophies:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/trophies/closest", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { limit } = req.query;
      const closest = await storage.getClosestTrophies(authReq.userId, limit ? parseInt(limit as string) : 5);
      res.json(closest);
    } catch (error: any) {
      console.error('Error fetching closest trophies:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/trophies/update-progress", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      await storage.updateTrophyProgress(authReq.userId);
      res.json({ success: true, message: "Trophy progress updated successfully" });
    } catch (error: any) {
      console.error('Error updating trophy progress:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/goals/active", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const activeGoals = await storage.getActiveGoalsWithProgress(authReq.userId);
      res.json(activeGoals);
    } catch (error: any) {
      console.error('Error fetching active goals:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/goals/with-progress", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      console.log(`🎯 Fetching goals with progress for user ${authReq.userId}`);
      const goalsWithProgress = await storage.getGoalsWithProgress(authReq.userId);
      console.log(`📊 Returning ${goalsWithProgress.length} goals with progress`);
      res.json(goalsWithProgress);
    } catch (error: any) {
      console.error('Error fetching goals with progress:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Helper function for performance recalculation
  async function triggerPerformanceRecalculation(userId: number): Promise<void> {
    console.log(`🔄 Triggering performance recalculation for user ${userId}`);
    // This could be expanded to clear caches, trigger background jobs, etc.
  }

  // Performance recalculation endpoint
  app.post("/api/performance/recalculate", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      console.log(`🔄 Manual performance recalculation triggered for user ${authReq.userId}`);
      
      // Force refresh of cached metrics
      const metrics = await storage.getSalesMetrics(authReq.userId, "30d");
      const categories = await storage.getCategoryPerformance(authReq.userId, "30d");
      
      res.json({ 
        success: true, 
        message: "Performance metrics recalculated successfully",
        metrics,
        categories
      });
    } catch (error: any) {
      console.error("Performance recalculation error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory/summary", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const summary = await storage.getInventorySummary(authReq.userId);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Goals
  app.get("/api/goals", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const goals = await storage.getGoalsWithProgress(authReq.userId);
      res.json(goals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Alias for goals with progress - used by dashboard
  app.get("/api/goals/with-progress", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const goals = await storage.getGoalsWithProgress(authReq.userId);
      res.json(goals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/goals", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const goalData = insertGoalSchema.parse({ ...req.body, userId: authReq.userId });
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/goals/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(id, updateData);
      res.json(goal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/goals/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGoal(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Recalculate performance metrics
  app.post("/api/performance/recalculate", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Get fresh data from database
      const sales = await storage.getSales(authReq.userId);
      const inventoryItems = await storage.getInventoryItems(authReq.userId);
      
      // Calculate fresh metrics
      const totalRevenue = sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.totalRevenue), 0);
      const totalProfit = sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.profit || 0), 0);
      const totalUnits = sales.reduce((sum: number, sale: any) => sum + sale.quantity, 0);
      const conversionRate = 2.4; // Mock for now
      
      const metrics = {
        totalRevenue,
        totalProfit,
        totalUnits,
        conversionRate,
        lastUpdated: new Date().toISOString()
      };
      
      res.json({ success: true, metrics });
    } catch (error) {
      console.error('Performance recalculation error:', error);
      res.status(500).json({ error: "Recalculation failed" });
    }
  });

  // Reports
  app.get("/api/reports", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { type } = req.query;
      
      let reports = await storage.getReports(authReq.userId);
      
      // Filter by type if specified
      if (type && type !== "all") {
        reports = reports.filter((report: any) => report.type === type);
      }
      
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reports", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Enhanced validation for custom report builder
      const { name, description, type, widgets, config, template } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: "Report name is required" });
      }
      
      if (!type || typeof type !== 'string') {
        return res.status(400).json({ message: "Report type is required" });
      }
      
      if (!widgets || !Array.isArray(widgets) || widgets.length === 0) {
        return res.status(400).json({ message: "At least one widget is required" });
      }

      // Create report data structure compatible with the new builder
      const reportData = {
        userId: authReq.userId,
        name: name.trim(),
        description: description || "",
        type: type, // Required field for database schema
        template: template || config?.template || "custom",
        widgets: JSON.stringify(widgets),
        config: JSON.stringify({
          layout: config?.layout || 'grid',
          theme: config?.theme || 'default',
          exportFormats: config?.exportFormats || ['pdf', 'csv'],
          ...config
        })
      };
      
      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error: any) {
      console.error('Create report error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/reports/:id/export", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const reportId = parseInt(req.params.id);
      const format = req.query.format as string || "pdf";
      
      // Get the report details
      const report = await storage.getReportById(reportId, authReq.userId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      // Parse widgets to get data for export
      const widgets = JSON.parse(report.widgets);
      const reportData = {
        name: report.name,
        description: report.description,
        widgets: widgets,
        generatedAt: new Date().toISOString()
      };
      
      if (format.toLowerCase() === 'csv') {
        // Generate CSV export
        const csvData = await generateCSVExport(authReq.userId, widgets);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv"`);
        res.send(csvData);
      } else {
        // PDF export simulation - in real implementation would use jsPDF or similar
        res.json({ 
          success: true, 
          message: `${format.toUpperCase()} export generated successfully`,
          reportId, 
          format,
          fileName: `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`,
          downloadUrl: `/api/reports/${reportId}/download?format=${format}`,
          data: reportData
        });
      }
    } catch (error: any) {
      console.error('Export report error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Helper function to generate CSV export
  async function generateCSVExport(userId: number, widgets: any[]): Promise<string> {
    try {
      const csvRows: string[] = [];
      csvRows.push('Widget,Type,Data Source,Metric,Value');
      
      for (const widget of widgets) {
        let value = 'N/A';
        try {
          switch (widget.config.dataSource) {
            case 'sales':
            case 'performance':
              const kpis = await storage.getPerformanceKPIs(userId, {});
              value = kpis[widget.config.metric] || 'N/A';
              break;
            case 'inventory':
              const inventory = await storage.getInventorySummary(userId);
              value = inventory[widget.config.metric] || 'N/A';
              break;
            case 'goals':
              const goals = await storage.getGoalsWithProgress(userId);
              value = goals.length.toString();
              break;
          }
        } catch (error) {
          console.error('Error fetching widget data for CSV:', error);
        }
        
        csvRows.push(`"${widget.title}","${widget.type}","${widget.config.dataSource}","${widget.config.metric || 'N/A'}","${value}"`);
      }
      
      return csvRows.join('\n');
    } catch (error) {
      console.error('CSV generation error:', error);
      return 'Error generating CSV data';
    }
  }

  app.delete("/api/reports/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReport(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // New endpoints for inventory system overhaul
  
  // Inventory KPIs
  app.get("/api/inventory/kpis", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const kpis = await storage.getInventoryKPIs(authReq.userId);
      res.json(kpis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Restock inventory item
  app.post("/api/inventory/:sku/restock", requireAuth, async (req, res) => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const sku = req.params.sku;
      const { quantity, notes } = req.body;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const updatedItem = await storage.restockInventoryItem(sku, authReq.userId, quantity, notes);
      res.json(updatedItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Sales History
  app.get("/api/sales/history", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { sku, startDate, endDate } = req.query;
      const userId = authReq.userId;

      console.log(`📊 Fetching sales history for user ${userId}:`, { sku, startDate, endDate });

      // Use the dedicated getSalesHistory method with date filtering
      let start: Date | undefined;
      let end: Date | undefined;
      
      if (startDate) start = new Date(startDate as string);
      if (endDate) end = new Date(endDate as string);

      const salesHistory = await storage.getSalesHistory(userId, start, end);
      
      // Filter by SKU if provided
      let filteredHistory = salesHistory;
      if (sku) {
        filteredHistory = salesHistory.filter(sale => sale.sku === sku);
      }

      console.log(`✅ Returning ${filteredHistory.length} sales history records:`, 
        filteredHistory.map(s => ({ sku: s.sku, date: s.saleDate })));
      res.json(filteredHistory);
    } catch (error: any) {
      console.error('❌ Sales history error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sales/history", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const entryData = insertSalesHistorySchema.parse({ ...req.body, userId: authReq.userId });
      const entry = await storage.createSalesHistoryEntry(entryData);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Calendar Sales
  app.get("/api/sales/calendar", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const month = req.query.month as string;
      const year = req.query.year as string;
      
      const calendarSales = await storage.getCalendarSales(authReq.userId, month, year);
      res.json(calendarSales);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sales/calendar", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const saleData = insertCalendarSalesSchema.parse({ ...req.body, userId: authReq.userId });
      const sale = await storage.createCalendarSale(saleData);
      res.json(sale);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Reorder Calendar
  app.get("/api/reorder/calendar", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const month = req.query.month as string;
      const year = req.query.year as string;
      
      const reorderCalendar = await storage.getReorderCalendar(authReq.userId, month, year);
      res.json(reorderCalendar);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reorder/calendar", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const entryData = insertReorderCalendarSchema.parse({ ...req.body, userId: authReq.userId });
      const entry = await storage.createReorderEntry(entryData);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
