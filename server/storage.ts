import {
  users,
  products,
  inventory,
  sales,
  goals,
  reports,
  salesHistory,
  calendarSales,
  reorderCalendar,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Inventory,
  type InsertInventory,
  type Sale,
  type InsertSale,
  type Goal,
  type InsertGoal,
  type Report,
  type InsertReport,
  type SalesHistory,
  type InsertSalesHistory,
  type CalendarSales,
  type InsertCalendarSales,
  type ReorderCalendar,
  type InsertReorderCalendar,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getUserStats(userId: number): Promise<{
    inventoryItems: number;
    salesEntries: number;
    goalProgress: number;
    reportsExported: number;
    totalRevenue: number;
    totalProfit: number;
  }>;

  // Products
  getProducts(userId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getWatchlistProducts(userId: number): Promise<Product[]>;

  // Inventory
  getInventory(userId: number): Promise<Inventory[]>;
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  getInventoryItemBySku(sku: string, userId: number): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory>;
  updateInventoryItemBySku(sku: string, userId: number, item: Partial<InsertInventory>): Promise<Inventory>;
  deleteInventoryItem(id: number): Promise<void>;
  restockInventoryItem(sku: string, userId: number, quantity: number, notes?: string): Promise<Inventory>;

  // Sales
  getSales(userId: number, startDate?: Date, endDate?: Date): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  getSalesMetrics(userId: number, dateRange?: string): Promise<{
    totalRevenue: number;
    totalProfit: number;
    totalUnits: number;
    averageOrderValue: number;
    conversionRate: number;
  }>;
  getCategoryPerformance(userId: number, dateRange?: string): Promise<any[]>;
  getInventorySummary(userId: number): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  }>;

  // Goals
  getGoals(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal>;
  deleteGoal(id: number): Promise<void>;
  getGoalsWithProgress(userId: number): Promise<any[]>;

  // Reports
  getReports(userId: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  deleteReport(id: number): Promise<void>;

  // Sales History & Calendar (New for inventory system overhaul)
  createSalesHistoryEntry(entry: InsertSalesHistory): Promise<SalesHistory>;
  getSalesHistory(userId: number, startDate?: Date, endDate?: Date): Promise<SalesHistory[]>;
  createCalendarSale(sale: InsertCalendarSales): Promise<CalendarSales>;
  getCalendarSales(userId: number, month?: string, year?: string): Promise<CalendarSales[]>;
  createReorderEntry(entry: InsertReorderCalendar): Promise<ReorderCalendar>;
  createReorderCalendarEntry(entry: InsertReorderCalendar): Promise<ReorderCalendar>;
  getReorderCalendar(userId: number, month?: string, year?: string): Promise<ReorderCalendar[]>;
  getInventoryKPIs(userId: number): Promise<{
    totalSKUs: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  }>;

  // Manual Sales Entry (New comprehensive method)
  processManualSale(userId: number, saleData: {
    sku: string;
    quantity_sold: number;
    unit_price: number;
    sale_date: string;
    notes?: string;
  }): Promise<{
    updatedInventory: Inventory;
    saleEntry: Sale;
    calendarEntry: CalendarSales;
    kpis: {
      totalSKUs: number;
      totalValue: number;
      lowStockItems: number;
      outOfStockItems: number;
    };
  }>;

  // NEW: KPI methods
  getPerformanceKPIs(userId: number, filters: {
    startDate?: string;
    endDate?: string;
    sku?: string;
    category?: string;
  }): Promise<{
    totalRevenue: number;
    totalProfit: number;
    unitsSold: number;
    avgOrderValue: number;
  }>;
  getDashboardKPIs(userId: number): Promise<{
    overallRevenue: number;
    overallUnitsSold: number;
    overallProfitMargin: number;
    overallConversionRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserStats(userId: number): Promise<{
    inventoryItems: number;
    salesEntries: number;
    goalProgress: number;
    reportsExported: number;
    totalRevenue: number;
    totalProfit: number;
  }> {
    const [inventoryCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(inventory)
      .where(eq(inventory.userId, userId));

    const [salesCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(sales)
      .where(eq(sales.userId, userId));

    const [reportsCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reports)
      .where(eq(reports.userId, userId));

    const [salesMetrics] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${sales.totalRevenue}), 0)`,
        totalProfit: sql<number>`COALESCE(SUM(${sales.profit}), 0)`,
      })
      .from(sales)
      .where(eq(sales.userId, userId));

    const [goalStats] = await db
      .select({
        completedGoals: sql<number>`COUNT(CASE WHEN ${goals.status} = 'completed' THEN 1 END)`,
        totalGoals: sql<number>`COUNT(*)`
      })
      .from(goals)
      .where(eq(goals.userId, userId));

    const goalProgress = goalStats.totalGoals > 0 
      ? Math.round((goalStats.completedGoals / goalStats.totalGoals) * 100)
      : 0;

    return {
      inventoryItems: Number(inventoryCount.count),
      salesEntries: Number(salesCount.count),
      goalProgress,
      reportsExported: Number(reportsCount.count),
      totalRevenue: Number(salesMetrics.totalRevenue),
      totalProfit: Number(salesMetrics.totalProfit),
    };
  }

  // Products
  async getProducts(userId: number): Promise<Product[]> {
    return db.select().from(products).where(eq(products.userId, userId)).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getWatchlistProducts(userId: number): Promise<Product[]> {
    // Get products that haven't been promoted to inventory yet
    const existingInventoryProductIds = await db
      .select({ productId: inventory.productId })
      .from(inventory)
      .where(eq(inventory.userId, userId));
    
    const excludedIds = existingInventoryProductIds
      .map(item => item.productId)
      .filter(id => id !== null);

    if (excludedIds.length === 0) {
      // If no products are in inventory, return all products
      return this.getProducts(userId);
    }

    // Return products not in inventory
    const allProducts = await this.getProducts(userId);
    return allProducts.filter(product => !excludedIds.includes(product.id));
  }

  // Inventory
  async getInventory(userId: number): Promise<Inventory[]> {
    return db.select().from(inventory).where(eq(inventory.userId, userId)).orderBy(desc(inventory.lastUpdated));
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item || undefined;
  }

  async getInventoryItemBySku(sku: string, userId: number): Promise<Inventory | undefined> {
    const [item] = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.sku, sku), eq(inventory.userId, userId)));
    return item || undefined;
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, updateData: Partial<InsertInventory>): Promise<Inventory> {
    const [item] = await db
      .update(inventory)
      .set({ ...updateData, lastUpdated: new Date() })
      .where(eq(inventory.id, id))
      .returning();
    return item;
  }

  async updateInventoryItemBySku(sku: string, userId: number, updateData: Partial<InsertInventory>): Promise<Inventory> {
    const [item] = await db
      .update(inventory)
      .set({ ...updateData, lastUpdated: new Date() })
      .where(and(eq(inventory.sku, sku), eq(inventory.userId, userId)))
      .returning();
    return item;
  }

  async restockInventoryItem(sku: string, userId: number, quantity: number, notes?: string): Promise<Inventory> {
    // Get current inventory item
    const existingItem = await this.getInventoryItemBySku(sku, userId);
    if (!existingItem) {
      throw new Error("Inventory item not found");
    }

    // Update stock
    const newStock = (existingItem.currentStock || 0) + quantity;
    const [updatedItem] = await db
      .update(inventory)
      .set({ 
        currentStock: newStock, 
        lastUpdated: new Date() 
      })
      .where(and(eq(inventory.sku, sku), eq(inventory.userId, userId)))
      .returning();

    // Add reorder calendar entry
    await this.createReorderEntry({
      userId,
      inventoryId: existingItem.id,
      sku: sku,
      productName: existingItem.name,
      reorderDate: new Date(),
      quantity,
      notes: notes || null,
    });

    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  // Sales
  async getSales(userId: number, startDate?: Date, endDate?: Date): Promise<Sale[]> {
    let baseQuery = db.select().from(sales);
    
    if (startDate && endDate) {
      return baseQuery
        .where(and(
          eq(sales.userId, userId),
          gte(sales.saleDate, startDate),
          lte(sales.saleDate, endDate)
        ))
        .orderBy(desc(sales.saleDate));
    }
    
    return baseQuery
      .where(eq(sales.userId, userId))
      .orderBy(desc(sales.saleDate));
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [newSale] = await db.insert(sales).values(sale).returning();
    return newSale;
  }

  async bulkImportSales(userId: number, salesData: any[], batchId: string): Promise<Sale[]> {
    const importData = salesData.map(sale => ({
      userId,
      sku: sale.sku,
      productName: sale.productName || sale.product_name || sale.name,
      category: sale.category,
      quantity: parseInt(sale.quantity),
      unitPrice: sale.unitPrice || sale.unit_price,
      totalRevenue: sale.totalRevenue || sale.total_revenue || (parseFloat(sale.unitPrice || sale.unit_price) * parseInt(sale.quantity)),
      totalCost: sale.totalCost || sale.total_cost,
      profit: sale.profit || ((sale.totalRevenue || (parseFloat(sale.unitPrice || sale.unit_price) * parseInt(sale.quantity))) - (sale.totalCost || sale.total_cost || 0)),
      saleDate: new Date(sale.saleDate || sale.sale_date),
      marketplace: sale.marketplace || 'amazon',
      region: sale.region || 'US',
      importBatch: batchId,
    }));

    return db.insert(sales).values(importData).returning();
  }

  async updateInventoryFromSales(userId: number, sku: string, quantitySold: number): Promise<void> {
    // Update inventory levels when sales are recorded
    await db
      .update(inventory)
      .set({
        currentStock: sql`${inventory.currentStock} - ${quantitySold}`,
        lastUpdated: new Date(),
      })
      .where(and(eq(inventory.userId, userId), eq(inventory.sku, sku)));
  }

  async getSalesMetrics(userId: number, dateRange?: string): Promise<{
    totalRevenue: number;
    totalProfit: number;
    totalUnits: number;
    averageOrderValue: number;
    conversionRate: number;
  }> {
    let whereCondition = eq(sales.userId, userId);
    
    // Add date range filtering if specified
    if (dateRange) {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      whereCondition = and(
        eq(sales.userId, userId),
        sql`${sales.saleDate} >= ${startDate}`
      ) as any;
    }

    const result = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${sales.totalRevenue} AS DECIMAL)), 0)`,
        totalProfit: sql<number>`COALESCE(SUM(CAST(${sales.profit} AS DECIMAL)), 0)`,
        totalUnits: sql<number>`COALESCE(SUM(${sales.quantity}), 0)`,
        totalSales: sql<number>`COUNT(*)`,
      })
      .from(sales)
      .where(whereCondition);

    const metrics = result[0];
    const averageOrderValue = metrics.totalSales > 0 ? Number(metrics.totalRevenue) / Number(metrics.totalSales) : 0;

    return {
      totalRevenue: Number(metrics.totalRevenue),
      totalProfit: Number(metrics.totalProfit),
      totalUnits: Number(metrics.totalUnits),
      averageOrderValue: Number(averageOrderValue),
      conversionRate: 2.4, // Mock conversion rate for now
    };
  }

  async getCategoryPerformance(userId: number, dateRange?: string): Promise<any[]> {
    try {
      let dateFilter = sql`1=1`;
      if (dateRange) {
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
        dateFilter = sql`${sales.saleDate} >= NOW() - INTERVAL '${sql.raw(days.toString())} days'`;
      }

      const result = await db
        .select({
          category: sales.category,
          totalRevenue: sql<number>`COALESCE(SUM(${sales.totalRevenue}), 0)`,
          totalUnits: sql<number>`COALESCE(SUM(${sales.quantity}), 0)`,
        })
        .from(sales)
        .where(and(eq(sales.userId, userId), dateFilter))
        .groupBy(sales.category);

      if (result.length === 0) {
        // Return calculated data from actual inventory categories if no sales data
        const inventoryCategories = await db
          .select({
            category: inventory.category,
            totalValue: sql<number>`COALESCE(SUM(${inventory.currentStock} * ${inventory.sellingPrice}), 0)`,
            totalUnits: sql<number>`COALESCE(SUM(${inventory.currentStock}), 0)`,
          })
          .from(inventory)
          .where(eq(inventory.userId, userId))
          .groupBy(inventory.category);

        return inventoryCategories.map(item => ({
          category: item.category || 'Uncategorized',
          revenue: Number(item.totalValue || 0),
          units: Number(item.totalUnits || 0),
        }));
      }

      return result.map(item => ({
        category: item.category || 'Uncategorized',
        revenue: Number(item.totalRevenue || 0),
        units: Number(item.totalUnits || 0),
      }));
    } catch (error) {
      console.error('Error in getCategoryPerformance:', error);
      return [];
    }
  }

  async getInventorySummary(userId: number): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  }> {
    const result = await db
      .select({
        totalItems: sql<number>`COUNT(*)`,
        totalValue: sql<number>`COALESCE(SUM(${inventory.currentStock} * ${inventory.sellingPrice}), 0)`,
        lowStockItems: sql<number>`COUNT(CASE WHEN ${inventory.currentStock} <= ${inventory.reorderPoint} THEN 1 END)`,
        outOfStockItems: sql<number>`COUNT(CASE WHEN ${inventory.currentStock} = 0 THEN 1 END)`,
      })
      .from(inventory)
      .where(eq(inventory.userId, userId));

    const summary = result[0];
    return {
      totalItems: Number(summary.totalItems),
      totalValue: Number(summary.totalValue),
      lowStockItems: Number(summary.lowStockItems),
      outOfStockItems: Number(summary.outOfStockItems),
    };
  }

  // Goals
  async getGoals(userId: number): Promise<Goal[]> {
    return db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal || undefined;
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: number, updateData: Partial<InsertGoal>): Promise<Goal> {
    const [goal] = await db
      .update(goals)
      .set(updateData)
      .where(eq(goals.id, id))
      .returning();
    return goal;
  }

  async deleteGoal(id: number): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }

  async getGoalsWithProgress(userId: number): Promise<any[]> {
    const userGoals = await this.getGoals(userId);
    const goalsWithProgress = [];

    for (const goal of userGoals) {
      let currentValue = 0;
      const now = new Date();
      const periodDays = this.getPeriodDays(goal.period);
      const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

      // Calculate current progress based on metric type
      if (goal.metric === 'revenue') {
        const [result] = await db
          .select({ total: sql<number>`COALESCE(SUM(${sales.totalRevenue}), 0)` })
          .from(sales)
          .where(
            and(
              eq(sales.userId, userId),
              gte(sales.saleDate, startDate),
              lte(sales.saleDate, now)
            )
          );
        currentValue = Number(result.total);
      } else if (goal.metric === 'unitsSold') {
        const [result] = await db
          .select({ total: sql<number>`COALESCE(SUM(${sales.quantity}), 0)` })
          .from(sales)
          .where(
            and(
              eq(sales.userId, userId),
              gte(sales.saleDate, startDate),
              lte(sales.saleDate, now)
            )
          );
        currentValue = Number(result.total);
      } else if (goal.metric === 'profit') {
        const [result] = await db
          .select({ total: sql<number>`COALESCE(SUM(${sales.profit}), 0)` })
          .from(sales)
          .where(
            and(
              eq(sales.userId, userId),
              gte(sales.saleDate, startDate),
              lte(sales.saleDate, now)
            )
          );
        currentValue = Number(result.total);
      } else if (goal.metric === 'profitMargin') {
        const [revenueResult] = await db
          .select({ 
            revenue: sql<number>`COALESCE(SUM(${sales.totalRevenue}), 0)`,
            profit: sql<number>`COALESCE(SUM(${sales.profit}), 0)`
          })
          .from(sales)
          .where(
            and(
              eq(sales.userId, userId),
              gte(sales.saleDate, startDate),
              lte(sales.saleDate, now)
            )
          );
        
        const revenue = Number(revenueResult.revenue);
        const profit = Number(revenueResult.profit);
        currentValue = revenue > 0 ? (profit / revenue) * 100 : 0;
      }

      // Calculate status
      const targetValue = Number(goal.targetValue);
      const progressPercentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
      
      let status = 'on_track';
      if (progressPercentage >= 100) {
        status = 'met';
      } else if (progressPercentage < 50) {
        status = 'off_track';
      } else if (progressPercentage < 80) {
        status = 'at_risk';
      }

      goalsWithProgress.push({
        ...goal,
        currentValue,
        targetValue,
        progressPercentage,
        status
      });
    }

    return goalsWithProgress;
  }

  private getPeriodDays(period: string): number {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }

  // Reports
  async getReports(userId: number): Promise<Report[]> {
    return db.select().from(reports).where(eq(reports.userId, userId)).orderBy(desc(reports.createdAt));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async deleteReport(id: number): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }

  // New methods for inventory system overhaul
  async createSalesHistoryEntry(entry: InsertSalesHistory): Promise<SalesHistory> {
    const [newEntry] = await db.insert(salesHistory).values(entry).returning();
    return newEntry;
  }

  async getSalesHistory(userId: number, startDate?: Date, endDate?: Date): Promise<SalesHistory[]> {
    let query = db.select().from(salesHistory).where(eq(salesHistory.userId, userId));

    if (startDate && endDate) {
      query = query.where(and(
        eq(salesHistory.userId, userId),
        gte(salesHistory.saleDate, startDate),
        lte(salesHistory.saleDate, endDate)
      ));
    }

    return query.orderBy(desc(salesHistory.saleDate));
  }

  async createCalendarSale(sale: InsertCalendarSales): Promise<CalendarSales> {
    const [newSale] = await db.insert(calendarSales).values(sale).returning();
    return newSale;
  }

  async getCalendarSales(userId: number, month?: string, year?: string): Promise<CalendarSales[]> {
    let query = db.select().from(calendarSales).where(eq(calendarSales.userId, userId));

    if (month && year) {
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      query = query.where(and(
        eq(calendarSales.userId, userId),
        gte(calendarSales.saleDate, startDate),
        lte(calendarSales.saleDate, endDate)
      ));
    }

    return query.orderBy(desc(calendarSales.saleDate));
  }

  async createReorderEntry(entry: InsertReorderCalendar): Promise<ReorderCalendar> {
    const [newEntry] = await db.insert(reorderCalendar).values(entry).returning();
    return newEntry;
  }

  async createReorderCalendarEntry(entry: InsertReorderCalendar): Promise<ReorderCalendar> {
    // Alias for createReorderEntry for better API consistency
    return this.createReorderEntry(entry);
  }

  async getReorderCalendar(userId: number, month?: string, year?: string): Promise<ReorderCalendar[]> {
    let query = db.select().from(reorderCalendar).where(eq(reorderCalendar.userId, userId));

    if (month && year) {
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      query = query.where(and(
        eq(reorderCalendar.userId, userId),
        gte(reorderCalendar.reorderDate, startDate),
        lte(reorderCalendar.reorderDate, endDate)
      ));
    }

    return query.orderBy(desc(reorderCalendar.reorderDate));
  }

  async getInventoryKPIs(userId: number): Promise<{
    totalSKUs: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  }> {
    const result = await db
      .select({
        totalSKUs: sql<number>`COUNT(DISTINCT ${inventory.sku})`,
        totalValue: sql<number>`COALESCE(SUM(${inventory.currentStock} * ${inventory.sellingPrice}), 0)`,
        lowStockItems: sql<number>`COUNT(CASE WHEN ${inventory.currentStock} <= ${inventory.reorderPoint} AND ${inventory.currentStock} > 0 THEN 1 END)`,
        outOfStockItems: sql<number>`COUNT(CASE WHEN ${inventory.currentStock} = 0 THEN 1 END)`,
      })
      .from(inventory)
      .where(eq(inventory.userId, userId));

    const metrics = result[0];
    return {
      totalSKUs: Number(metrics.totalSKUs),
      totalValue: Number(metrics.totalValue),
      lowStockItems: Number(metrics.lowStockItems),
      outOfStockItems: Number(metrics.outOfStockItems),
    };
  }

  // Manual Sales Entry - Comprehensive processing method
  async processManualSale(userId: number, saleData: {
    sku: string;
    quantity_sold: number;
    unit_price: number;
    sale_date: string;
    notes?: string;
  }): Promise<{
    updatedInventory: Inventory;
    saleEntry: Sale;
    calendarEntry: CalendarSales;
    kpis: {
      totalSKUs: number;
      totalValue: number;
      lowStockItems: number;
      outOfStockItems: number;
    };
  }> {
    // 1. Fetch current inventory item by SKU
    const inventoryItem = await this.getInventoryItemBySku(saleData.sku, userId);
    if (!inventoryItem) {
      throw new Error(`Inventory item with SKU ${saleData.sku} not found`);
    }

    // 2. Validate quantity sold doesn't exceed current stock
    if (saleData.quantity_sold > (inventoryItem.currentStock || 0)) {
      throw new Error(`Cannot sell ${saleData.quantity_sold} units. Only ${inventoryItem.currentStock || 0} units available.`);
    }

    // 3. Calculate sale metrics
    const totalRevenue = saleData.quantity_sold * saleData.unit_price;
    const costPrice = parseFloat(inventoryItem.costPrice || "0");
    const totalCost = saleData.quantity_sold * costPrice;
    const profit = totalRevenue - totalCost;
    const newStock = (inventoryItem.currentStock || 0) - saleData.quantity_sold;

    // 4. Update inventory stock
    const updatedInventory = await this.updateInventoryItem(inventoryItem.id, {
      currentStock: newStock,
      lastUpdated: new Date(),
    });

    // 5. Create sale entry
    const saleEntry = await this.createSale({
      userId,
      inventoryId: inventoryItem.id,
      sku: saleData.sku,
      productName: inventoryItem.name,
      category: inventoryItem.category || "inventory-item",
      quantity: saleData.quantity_sold,
      unitPrice: saleData.unit_price.toString(),
      totalRevenue: totalRevenue.toString(),
      totalCost: totalCost.toString(),
      profit: profit.toString(),
      saleDate: new Date(saleData.sale_date),
      marketplace: "manual",
      region: "US",
    });

    // 6. Create calendar entry for sales history calendar
    const calendarEntry = await this.createCalendarSale({
      userId,
      sku: saleData.sku,
      productName: inventoryItem.name,
      saleDate: new Date(saleData.sale_date),
      quantity: saleData.quantity_sold,
      totalRevenue: totalRevenue.toString(),
    });

    // 7. Create sales history entry with notes
    await this.createSalesHistoryEntry({
      userId,
      inventoryId: inventoryItem.id,
      sku: saleData.sku,
      productName: inventoryItem.name,
      quantitySold: saleData.quantity_sold,
      unitPrice: saleData.unit_price.toString(),
      totalRevenue: totalRevenue.toString(),
      totalCost: totalCost.toString(),
      profit: profit.toString(),
      saleDate: new Date(saleData.sale_date),
      notes: saleData.notes || null,
    });

    // 8. Recalculate and return KPIs
    const kpis = await this.getInventoryKPIs(userId);

    return {
      updatedInventory,
      saleEntry,
      calendarEntry,
      kpis,
    };
  }
  // NEW: Performance KPIs with filters
  async getPerformanceKPIs(userId: number, filters: {
    startDate?: string;
    endDate?: string;
    sku?: string;
    category?: string;
  }): Promise<{
    totalRevenue: number;
    totalProfit: number;
    unitsSold: number;
    avgOrderValue: number;
  }> {
    try {
      let query = db
        .select({
          revenue: sql<number>`COALESCE(SUM(${salesHistory.unitPrice} * ${salesHistory.quantity}), 0)`,
          profit: sql<number>`COALESCE(SUM((${salesHistory.unitPrice} - ${salesHistory.cost}) * ${salesHistory.quantity}), 0)`,
          units: sql<number>`COALESCE(SUM(${salesHistory.quantity}), 0)`,
          orderCount: sql<number>`COUNT(DISTINCT ${salesHistory.id})`
        })
        .from(salesHistory);

      // Apply filters
      const conditions: any[] = [eq(salesHistory.userId, userId)];

      if (filters.startDate) {
        conditions.push(gte(salesHistory.saleDate, new Date(filters.startDate)));
      }
      if (filters.endDate) {
        conditions.push(lte(salesHistory.saleDate, new Date(filters.endDate)));
      }
      if (filters.sku) {
        conditions.push(eq(salesHistory.sku, filters.sku));
      }
      if (filters.category) {
        // Join with inventory to filter by category
        query = query.innerJoin(inventory, eq(salesHistory.sku, inventory.sku));
        conditions.push(eq(inventory.category, filters.category));
      }

      const [result] = await query.where(and(...conditions));

      const avgOrderValue = result.orderCount > 0 ? result.revenue / result.orderCount : 0;

      return {
        totalRevenue: result.revenue,
        totalProfit: result.profit,
        unitsSold: result.units,
        avgOrderValue: Number(avgOrderValue.toFixed(2))
      };
    } catch (error) {
      console.error('Error fetching performance KPIs:', error);
      return {
        totalRevenue: 0,
        totalProfit: 0,
        unitsSold: 0,
        avgOrderValue: 0
      };
    }
  }

  // NEW: Dashboard KPIs (career-wide aggregates)
  async getDashboardKPIs(userId: number): Promise<{
    overallRevenue: number;
    overallUnitsSold: number;
    overallProfitMargin: number;
    overallConversionRate: number;
  }> {
    try {
      const [result] = await db
        .select({
          revenue: sql<number>`COALESCE(SUM(${salesHistory.unitPrice} * ${salesHistory.quantity}), 0)`,
          profit: sql<number>`COALESCE(SUM((${salesHistory.unitPrice} - ${salesHistory.cost}) * ${salesHistory.quantity}), 0)`,
          units: sql<number>`COALESCE(SUM(${salesHistory.quantity}), 0)`
        })
        .from(salesHistory)
        .where(eq(salesHistory.userId, userId));

      const profitMargin = result.revenue > 0 ? (result.profit / result.revenue) * 100 : 0;
      const conversionRate = 2.4; // Mock conversion rate until we track product views

      return {
        overallRevenue: result.revenue,
        overallUnitsSold: result.units,
        overallProfitMargin: Number(profitMargin.toFixed(2)),
        overallConversionRate: conversionRate
      };
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      return {
        overallRevenue: 0,
        overallUnitsSold: 0,
        overallProfitMargin: 0,
        overallConversionRate: 0
      };
    }
  }
}

export const storage = new DatabaseStorage();
