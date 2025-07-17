import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertInventorySchema, insertSaleSchema, insertGoalSchema, insertReportSchema } from "@shared/schema";

// Extend Express Request type to include userId
interface AuthenticatedRequest extends Request {
  userId: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware to get user from Firebase token (simplified for now)
  const requireAuth = (req: any, res: any, next: any) => {
    // In a real app, verify Firebase token here
    // For now, we'll use a mock user ID from headers
    const userId = req.headers['x-user-id'];
    if (!userId) {
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

  app.put("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const updateData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(authReq.userId, updateData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Products (Watchlist)
  app.get("/api/products/watchlist", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const products = await storage.getProducts(authReq.userId);
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
      const itemData = insertInventorySchema.parse({ ...req.body, userId: authReq.userId });
      const item = await storage.createInventoryItem(itemData);
      res.json(item);
    } catch (error: any) {
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
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
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
      res.json(sale);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/performance/metrics", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const metrics = await storage.getSalesMetrics(authReq.userId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Goals
  app.get("/api/goals", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const goals = await storage.getGoals(authReq.userId);
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
      const reportData = insertReportSchema.parse({ ...req.body, userId: req.userId });
      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/reports/export", requireAuth, async (req, res) => {
    try {
      // Implementation for report export would go here
      // For now, return a placeholder response
      res.json({ success: true, message: "Export functionality not yet implemented" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
