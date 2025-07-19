import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertInventorySchema, insertSaleSchema, insertGoalSchema, insertReportSchema } from "@shared/schema";

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

  // Auth middleware to get user from Firebase token or fallback to x-user-id
  const requireAuth = async (req: any, res: any, next: any) => {
    console.log('🔐 Auth middleware called, headers:', {
      authorization: req.headers.authorization ? `Bearer ${req.headers.authorization.split(' ')[1]?.substring(0, 20)}...` : 'none',
      'x-user-id': req.headers['x-user-id'] || 'none'
    });
    
    // Check for Firebase token first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // For now, we'll trust the token and use the fallback user ID
        // In production, you would verify the token with Firebase Admin SDK
        console.log('🔐 Firebase token received and accepted');
        // Use hardcoded user ID for development
        (req as AuthenticatedRequest).userId = 3;
        return next();
      } catch (error) {
        console.warn('Firebase token verification failed:', error);
      }
    }
    
    // Fallback to x-user-id header for backwards compatibility
    const userId = req.headers['x-user-id'];
    if (!userId) {
      console.error('❌ No authentication found - missing both Bearer token and x-user-id');
      return res.status(401).json({ message: "Unauthorized" });
    }
    (req as AuthenticatedRequest).userId = parseInt(userId as string);
    next();
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
      const authReq = req as AuthenticatedRequest;
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
            const existingItems = await storage.getInventoryItems(authReq.userId);
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
      const reports = await storage.getReports(authReq.userId);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reports", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const reportData = insertReportSchema.parse({ ...req.body, userId: authReq.userId });
      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/reports/:id/export", requireAuth, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const format = req.query.format as string || "pdf";
      // Implementation for report export would go here
      // For now, return a placeholder response
      res.json({ success: true, message: `Export as ${format.toUpperCase()} functionality simulated`, reportId, format });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/reports/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReport(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
