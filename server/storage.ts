import {
  users,
  products,
  inventory,
  sales,
  goals,
  goalHistory,
  salesHistory,
  calendarSales,
  reorderCalendar,
  activityLog,
  trophies,
  userTrophies,
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
  type GoalHistory,
  type InsertGoalHistory,
  type SalesHistory,
  type InsertSalesHistory,
  type CalendarSales,
  type InsertCalendarSales,
  type ReorderCalendar,
  type InsertReorderCalendar,
  type Trophy,
  type InsertTrophy,
  type UserTrophy,
  type InsertUserTrophy,
  ActivityLog,
  InsertActivityLog
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



    const [salesMetrics] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${sales.totalRevenue}), 0)`,
        totalProfit: sql<number>`COALESCE(SUM(${sales.profit}), 0)`,
      })
      .from(sales)
      .where(eq(sales.userId, userId));

    const [goalStats] = await db
      .select({
        completedGoals: sql<number>`COUNT(CASE WHEN ${goals.isActive} = true THEN 1 END)`,
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
    
    // Create activity log entry for sale
    await this.createActivityLog({
      userId: sale.userId,
      action: 'sale',
      details: `Recorded sale: ${sale.quantity} × ${sale.productName} ($${sale.totalRevenue})`,
      metadata: { 
        saleId: newSale.id,
        sku: sale.sku,
        quantity: sale.quantity,
        revenue: sale.totalRevenue,
        profit: sale.profit
      }
    });
    
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

    const newSales = await db.insert(sales).values(importData).returning();
    
    // Create activity log entry for CSV import
    const totalRevenue = importData.reduce((sum, sale) => sum + Number(sale.totalRevenue), 0);
    const totalUnits = importData.reduce((sum, sale) => sum + sale.quantity, 0);
    
    await this.createActivityLog({
      userId,
      action: 'csv_import',
      details: `Imported ${importData.length} sales records ($${totalRevenue.toFixed(2)} revenue, ${totalUnits} units)`,
      metadata: { 
        batchId,
        recordCount: importData.length,
        totalRevenue: totalRevenue.toFixed(2),
        totalUnits
      }
    });
    
    return newSales;
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
    // Convert targetValue to string as required by database schema
    const goalData = {
      ...goal,
      targetValue: goal.targetValue.toString()
    };
    const [newGoal] = await db.insert(goals).values(goalData).returning();
    
    // Create activity log entry for goal creation
    await this.createActivityLog({
      userId: goal.userId,
      action: 'goal_created',
      details: `Created new goal: "${goal.description}" (Target: ${goal.targetValue} ${goal.metric})`,
      metadata: { 
        goalId: newGoal.id, 
        metric: goal.metric, 
        targetValue: goal.targetValue,
        scope: goal.scope,
        period: goal.period
      }
    });
    
    // Trigger trophy progress update after creating a goal
    this.updateTrophyProgress(goal.userId).catch(console.error);
    return newGoal;
  }

  async updateGoal(id: number, updateData: Partial<InsertGoal>): Promise<Goal> {
    // Convert targetValue to string if present
    const goalUpdateData = {
      ...updateData,
      ...(updateData.targetValue !== undefined && { targetValue: updateData.targetValue.toString() })
    };
    const [goal] = await db
      .update(goals)
      .set(goalUpdateData)
      .where(eq(goals.id, id))
      .returning();
    return goal;
  }

  async deleteGoal(id: number): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }

  async getGoalHistory(userId: number): Promise<any[]> {
    try {
      const history = await db.select().from(goalHistory).where(eq(goalHistory.userId, userId));
      console.log(`📊 Retrieved ${history.length} goal history records for user ${userId}`);
      return history;
    } catch (error) {
      console.error("Error fetching goal history:", error);
      return [];
    }
  }

  async getGoalsWithProgress(userId: number): Promise<any[]> {
    const userGoals = await this.getGoals(userId);
    const goalsWithProgress = [];

    for (const goal of userGoals) {
      let currentValue = 0;
      const now = new Date();
      const goalCreatedAt = new Date(goal.createdAt);
      const periodDays = this.getPeriodDays(goal.period);
      
      // Calculate goal tracking window
      const startDate = goalCreatedAt;
      const goalEndDate = new Date(goalCreatedAt.getTime() + (periodDays * 24 * 60 * 60 * 1000));
      
      // Always track within the full goal period - goals track all sales within their period
      // regardless of current date (allows for future-dated sales entries)
      const effectiveEndDate = goalEndDate;

      // Build base conditions for the query - track all sales within goal period
      const baseConditions = [
        eq(sales.userId, userId),
        gte(sales.saleDate, startDate),
        lte(sales.saleDate, effectiveEndDate)
      ];

      // Add scope-specific conditions
      console.log(`🔍 Checking scope conditions - scope: ${goal.scope}, targetSKU: '${goal.targetSKU}', targetCategory: '${goal.targetCategory}'`);
      if (goal.scope === 'sku' && goal.targetSKU) {
        console.log(`🎯 Adding SKU filter: ${goal.targetSKU}`);
        baseConditions.push(eq(sales.sku, goal.targetSKU));
      } else if (goal.scope === 'category' && goal.targetCategory) {
        console.log(`🎯 Adding category filter: ${goal.targetCategory}`);
        baseConditions.push(eq(sales.category, goal.targetCategory));
      }

      // Calculate current progress based on metric type
      if (goal.metric === 'revenue') {
        const [result] = await db
          .select({ total: sql<number>`COALESCE(SUM(CAST(${sales.totalRevenue} AS DECIMAL)), 0)` })
          .from(sales)
          .where(and(...baseConditions));
        currentValue = Number(result.total);
      } else if (goal.metric === 'unitsSold') {
        console.log(`📊 Executing unitsSold query with ${baseConditions.length} conditions`);
        console.log(`📊 Query conditions:`, {
          userId,
          startDate: startDate.toISOString(),
          effectiveEndDate: effectiveEndDate.toISOString(),
          goalEndDate: goalEndDate.toISOString(),
          targetSKU: goal.targetSKU,
          scope: goal.scope
        });
        
        // Debug: Check all sales for this user and SKU
        const allSalesForSKU = await db
          .select()
          .from(sales)
          .where(and(
            eq(sales.userId, userId),
            eq(sales.sku, goal.targetSKU)
          ));
        console.log(`📊 All sales for SKU ${goal.targetSKU}:`, allSalesForSKU);
        
        const [result] = await db
          .select({ total: sql<number>`COALESCE(SUM(${sales.quantity}), 0)` })
          .from(sales)
          .where(and(...baseConditions));
        console.log(`📊 Query result for unitsSold:`, result);
        currentValue = Number(result.total);
        
        // Debug: Show matched sales for verification  
        const matchedSales = await db
          .select({ id: sales.id, quantity: sales.quantity, saleDate: sales.saleDate })
          .from(sales)
          .where(and(...baseConditions));
        console.log(`📊 Matched sales for calculation:`, matchedSales);
      } else if (goal.metric === 'profit') {
        const [result] = await db
          .select({ total: sql<number>`COALESCE(SUM(CAST(${sales.profit} AS DECIMAL)), 0)` })
          .from(sales)
          .where(and(...baseConditions));
        currentValue = Number(result.total);
      } else if (goal.metric === 'profitMargin') {
        const [revenueResult] = await db
          .select({ 
            revenue: sql<number>`COALESCE(SUM(CAST(${sales.totalRevenue} AS DECIMAL)), 0)`,
            profit: sql<number>`COALESCE(SUM(CAST(${sales.profit} AS DECIMAL)), 0)`
          })
          .from(sales)
          .where(and(...baseConditions));
        
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

      // Determine goal status based on current date vs goal period
      const isGoalExpired = now > goalEndDate;
      const timeRemaining = goalEndDate.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (24 * 60 * 60 * 1000)));
      
      // Update status to reflect time-based context
      if (isGoalExpired) {
        status = progressPercentage >= 100 ? 'met' : 'unmet';
      } else if (progressPercentage >= 100) {
        status = 'met';
      } else if (daysRemaining <= 3 && progressPercentage < 75) {
        status = 'critical';
      } else if (progressPercentage >= 80) {
        status = 'on_track';
      } else if (progressPercentage >= 50) {
        status = 'at_risk';
      } else {
        status = 'off_track';
      }

      console.log(`🎯 Goal ${goal.id} progress: ${currentValue}/${targetValue} (${progressPercentage.toFixed(1)}%) - Status: ${status}`);
      console.log(`📅 Goal period: ${startDate.toISOString()} to ${goalEndDate.toISOString()}`);
      console.log(`⏰ Days remaining: ${daysRemaining}, Expired: ${isGoalExpired}`);
      console.log(`🔍 Goal scope: ${goal.scope}, target SKU: ${goal.targetSKU}, metric: ${goal.metric}`);

      // Auto-archive completed goals only if they've been active for more than 1 minute
      const goalAge = now.getTime() - goal.createdAt.getTime();
      const oneMinute = 60 * 1000;
      
      if (progressPercentage >= 100 && status === 'met' && goalAge > oneMinute) {
        console.log(`🏆 Goal ${goal.id} completed (${progressPercentage.toFixed(1)}%), archiving to history`);
        await this.archiveGoal(goal, currentValue, startDate, goalEndDate, 'met');
        continue; // Skip adding to active goals list
      }

      goalsWithProgress.push({
        ...goal,
        currentValue,
        targetValue,
        progressPercentage: Number(progressPercentage.toFixed(1)),
        status,
        daysRemaining,
        isExpired: isGoalExpired,
        startDate: startDate.toISOString(),
        endDate: goalEndDate.toISOString(),
        trackingPeriod: `${startDate.toISOString().split('T')[0]} to ${goalEndDate.toISOString().split('T')[0]}`
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

  // Goal History Management
  async archiveGoal(goal: Goal, achievedValue: number, startDate: Date, endDate: Date, status: 'met' | 'unmet'): Promise<void> {
    try {
      // Calculate progress percentage
      const progressPercentage = (achievedValue / Number(goal.targetValue)) * 100;
      
      // Use raw SQL for goal_history insert to match existing table structure
      await db.execute(sql`
        INSERT INTO goal_history (
          user_id, original_goal_id, metric, target_value, final_value, 
          progress_percentage, scope, target_category, target_sku, period, 
          description, status, start_date, end_date
        ) VALUES (
          ${goal.userId}, ${goal.id}, ${goal.metric}, ${goal.targetValue}, ${achievedValue.toString()},
          ${progressPercentage}, ${goal.scope}, ${goal.targetCategory || ''}, ${goal.targetSKU || ''}, ${goal.period}, 
          ${goal.description || ''}, ${status}, ${startDate}, ${endDate}
        )
      `);
      
      // Remove from active goals
      await db.delete(goals).where(eq(goals.id, goal.id));
      
      console.log(`✅ Goal ${goal.id} successfully archived to history with status: ${status}`);
      
      // Create activity log entry for goal completion
      await this.createActivityLog({
        userId: goal.userId,
        action: 'goal_achieved',
        details: `Completed goal "${goal.description}" with ${progressPercentage.toFixed(1)}% progress (${achievedValue}/${goal.targetValue} ${goal.metric})`,
        metadata: { 
          goalId: goal.id, 
          metric: goal.metric, 
          targetValue: goal.targetValue,
          achievedValue,
          progressPercentage: progressPercentage.toFixed(1)
        }
      });
    } catch (error) {
      console.error(`❌ Failed to archive goal ${goal.id}:`, error);
    }
  }

  async getGoalHistory(userId: number): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          id, user_id, original_goal_id, metric, target_value, final_value,
          progress_percentage, scope, target_category, target_sku, period, description,
          status, start_date, end_date, completed_at, created_at
        FROM goal_history 
        WHERE user_id = ${userId}
        ORDER BY completed_at DESC
      `);
      const history = result.rows;
      console.log(`📊 Retrieved ${history.length} goal history records for user ${userId}`);
      return history;
    } catch (error) {
      console.error("Error fetching goal history:", error);
      return [];
    }
  }



  // New methods for inventory system overhaul
  async createSalesHistoryEntry(entry: InsertSalesHistory): Promise<SalesHistory> {
    const [newEntry] = await db.insert(salesHistory).values(entry).returning();
    return newEntry;
  }

  async getSalesHistory(userId: number, startDate?: Date, endDate?: Date): Promise<SalesHistory[]> {
    let query = db.select().from(salesHistory).where(eq(salesHistory.userId, userId));

    if (startDate && endDate) {
      query = db.select().from(salesHistory).where(and(
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
      query = db.select().from(calendarSales).where(and(
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
      query = db.select().from(reorderCalendar).where(and(
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
          revenue: sql<number>`COALESCE(SUM(CAST(${sales.totalRevenue} AS DECIMAL)), 0)`,
          profit: sql<number>`COALESCE(SUM(CAST(${sales.profit} AS DECIMAL)), 0)`,
          units: sql<number>`COALESCE(SUM(${sales.quantity}), 0)`,
          orderCount: sql<number>`COUNT(DISTINCT ${sales.id})`
        })
        .from(sales);

      // Apply filters
      const conditions: any[] = [eq(sales.userId, userId)];

      if (filters.startDate) {
        conditions.push(gte(sales.saleDate, new Date(filters.startDate)));
      }
      if (filters.endDate) {
        conditions.push(lte(sales.saleDate, new Date(filters.endDate)));
      }
      if (filters.sku) {
        conditions.push(eq(sales.sku, filters.sku));
      }
      if (filters.category) {
        conditions.push(eq(sales.category, filters.category));
      }

      const [result] = await query.where(and(...conditions)) as any;

      const avgOrderValue = result.orderCount > 0 ? Number(result.revenue) / Number(result.orderCount) : 0;

      return {
        totalRevenue: Number(result.revenue),
        totalProfit: Number(result.profit),
        unitsSold: Number(result.units),
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
    overallProfit: number;
    overallProfitMargin: number;
    overallConversionRate: number;
  }> {
    try {
      const [result] = await db
        .select({
          revenue: sql<number>`COALESCE(SUM(CAST(${sales.totalRevenue} AS DECIMAL)), 0)`,
          profit: sql<number>`COALESCE(SUM(CAST(${sales.profit} AS DECIMAL)), 0)`,
          units: sql<number>`COALESCE(SUM(${sales.quantity}), 0)`
        })
        .from(sales)
        .where(eq(sales.userId, userId));

      const overallRevenue = Number(result.revenue);
      const overallProfit = Number(result.profit);
      const overallProfitMargin = overallRevenue > 0 ? (overallProfit / overallRevenue) * 100 : 0;

      return {
        overallRevenue,
        overallUnitsSold: Number(result.units),
        overallProfit,
        overallProfitMargin: Number(overallProfitMargin.toFixed(2)),
        overallConversionRate: 4.2
      };
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      return {
        overallRevenue: 0,
        overallUnitsSold: 0,
        overallProfit: 0,
        overallProfitMargin: 0,
        overallConversionRate: 0
      };
    }
  }

  // NEW: Dashboard Analytics Summary - Sales data by time range
  async getSalesSummaryByRange(userId: number, range: string): Promise<{
    date: string;
    revenue: number;
    profit: number;
    units: number;
  }[]> {
    try {
      let groupBy: string;
      let dateFilter: string;
      
      switch (range) {
        case 'daily':
          groupBy = "DATE(sale_date)";
          dateFilter = "sale_date >= CURRENT_DATE - INTERVAL '7 days'";
          break;
        case 'monthly':
          groupBy = "DATE_TRUNC('month', sale_date)";  
          dateFilter = "sale_date >= CURRENT_DATE - INTERVAL '12 months'";
          break;
        case 'weekly':
        default:
          groupBy = "DATE_TRUNC('week', sale_date)";
          dateFilter = "sale_date >= CURRENT_DATE - INTERVAL '8 weeks'";
          break;
      }

      const results = await db
        .select({
          date: sql<string>`${sql.raw(groupBy)}`,
          units: sql<number>`COALESCE(SUM(${sales.quantity}), 0)`,
          revenue: sql<number>`COALESCE(SUM(CAST(${sales.totalRevenue} AS DECIMAL)), 0)`,
          profit: sql<number>`COALESCE(SUM(CAST(${sales.profit} AS DECIMAL)), 0)`
        })
        .from(sales)
        .where(and(
          eq(sales.userId, userId),
          sql`${sql.raw(dateFilter)}`
        ))
        .groupBy(sql`${sql.raw(groupBy)}`)
        .orderBy(sql`${sql.raw(groupBy)}`);

      return results.map(row => ({
        date: row.date,
        units: Number(row.units),
        revenue: Number(row.revenue),
        profit: Number(row.profit),
      }));
    } catch (error) {
      console.error('Error fetching sales summary by range:', error);
      return [];
    }
  }

  // NEW: Sales Trends Explorer - Time-series data
  async getSalesTrends(userId: number, filters: {
    startDate?: string;
    endDate?: string;
    sku?: string;
    category?: string;
  }): Promise<{
    date: string;
    revenue: number;
    unitsSold: number;
    profit: number;
    avgOrderValue: number;
  }[]> {
    try {
      let query = db
        .select({
          date: sql<string>`DATE(${sales.saleDate})`,
          revenue: sql<number>`COALESCE(SUM(CAST(${sales.totalRevenue} AS DECIMAL)), 0)`,
          profit: sql<number>`COALESCE(SUM(CAST(${sales.profit} AS DECIMAL)), 0)`,
          units: sql<number>`COALESCE(SUM(${sales.quantity}), 0)`,
          orderCount: sql<number>`COUNT(DISTINCT ${sales.id})`
        })
        .from(sales)
        .groupBy(sql`DATE(${sales.saleDate})`);

      // Apply filters
      const conditions: any[] = [eq(sales.userId, userId)];

      if (filters.startDate) {
        conditions.push(gte(sales.saleDate, new Date(filters.startDate)));
      }
      if (filters.endDate) {
        conditions.push(lte(sales.saleDate, new Date(filters.endDate)));
      }
      if (filters.sku) {
        conditions.push(eq(sales.sku, filters.sku));
      }
      if (filters.category) {
        conditions.push(eq(sales.category, filters.category));
      }

      const results = await query.where(and(...conditions)).orderBy(sql`DATE(${sales.saleDate})`);

      return results.map(result => ({
        date: result.date,
        revenue: Number(result.revenue),
        unitsSold: Number(result.units),
        profit: Number(result.profit),
        avgOrderValue: result.orderCount > 0 ? Number((Number(result.revenue) / Number(result.orderCount)).toFixed(2)) : 0
      }));
    } catch (error) {
      console.error('Error fetching sales trends:', error);
      return [];
    }
  }

  // NEW: SKU Leaderboard - Performance ranking
  async getSKULeaderboard(userId: number, filters: {
    sortBy?: 'unitsSold' | 'revenue' | 'profit' | 'margin';
    order?: 'asc' | 'desc';
    category?: string;
  }): Promise<{
    sku: string;
    product: string;
    unitsSold: number;
    revenue: number;
    profit: number;
    avgOrderValue: number;
    margin: number;
  }[]> {
    try {
      let query = db
        .select({
          sku: sales.sku,
          product: sales.productName,
          unitsSold: sql<number>`COALESCE(SUM(${sales.quantity}), 0)`,
          revenue: sql<number>`COALESCE(SUM(CAST(${sales.totalRevenue} AS DECIMAL)), 0)`,
          profit: sql<number>`COALESCE(SUM(CAST(${sales.profit} AS DECIMAL)), 0)`,
          orderCount: sql<number>`COUNT(DISTINCT ${sales.id})`
        })
        .from(sales)
        .groupBy(sales.sku, sales.productName);

      // Apply filters
      const conditions: any[] = [eq(sales.userId, userId)];

      if (filters.category) {
        conditions.push(eq(sales.category, filters.category));
      }

      const results = await query.where(and(...conditions));

      // Calculate derived metrics and sort
      const leaderboard = results.map(result => {
        const revenue = Number(result.revenue);
        const profit = Number(result.profit);
        const unitsSold = Number(result.unitsSold);
        const orderCount = Number(result.orderCount);
        
        return {
          sku: result.sku,
          product: result.product || 'Unknown Product',
          unitsSold,
          revenue,
          profit,
          avgOrderValue: orderCount > 0 ? Number((revenue / orderCount).toFixed(2)) : 0,
          margin: revenue > 0 ? Number(((profit / revenue) * 100).toFixed(2)) : 0
        };
      });

      // Sort by specified field
      const sortBy = filters.sortBy || 'revenue';
      const order = filters.order || 'desc';
      
      leaderboard.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        return order === 'desc' ? bVal - aVal : aVal - bVal;
      });

      return leaderboard;
    } catch (error) {
      console.error('Error fetching SKU leaderboard:', error);
      return [];
    }
  }

  // TROPHY SYSTEM METHODS
  async initializeTrophies(): Promise<void> {
    try {
      // Check if trophies are already seeded
      const existingTrophies = await db.select().from(trophies).limit(1);
      if (existingTrophies.length > 0) {
        return; // Already initialized
      }

      // Seed 30 trophies (10 bronze, 10 silver, 10 gold, 1 platinum)
      const trophyData = [
        // Bronze Trophies (10)
        { name: "First Sale", description: "Complete your first sale", metric: "units", threshold: "1", tier: "bronze" },
        { name: "Starter Revenue", description: "Reach $100 in total revenue", metric: "revenue", threshold: "100", tier: "bronze" },
        { name: "First Profit", description: "Generate your first $50 in profit", metric: "profit", threshold: "50", tier: "bronze" },
        { name: "5% Margin Club", description: "Maintain at least 5% profit margin", metric: "profit_margin", threshold: "5", tier: "bronze" },
        { name: "10 Orders Strong", description: "Sell at least 10 units", metric: "units", threshold: "10", tier: "bronze" },
        { name: "Growing Business", description: "Reach $250 in total revenue", metric: "revenue", threshold: "250", tier: "bronze" },
        { name: "Small Profit Win", description: "Achieve $100 in total profit", metric: "profit", threshold: "100", tier: "bronze" },
        { name: "Decent Margin", description: "Maintain 8% profit margin", metric: "profit_margin", threshold: "8", tier: "bronze" },
        { name: "Quarter Century", description: "Sell 25 units total", metric: "units", threshold: "25", tier: "bronze" },
        { name: "Half-K Revenue", description: "Reach $500 in total revenue", metric: "revenue", threshold: "500", tier: "bronze" },

        // Silver Trophies (10)
        { name: "Quarter K Club", description: "Sell 250 units", metric: "units", threshold: "250", tier: "silver" },
        { name: "$1K Seller", description: "Reach $1,000 in total revenue", metric: "revenue", threshold: "1000", tier: "silver" },
        { name: "Profit Grows", description: "Hit $500 total profit", metric: "profit", threshold: "500", tier: "silver" },
        { name: "Margin Maker", description: "Maintain at least 15% profit margin", metric: "profit_margin", threshold: "15", tier: "silver" },
        { name: "Century Club", description: "Sell 100 units total", metric: "units", threshold: "100", tier: "silver" },
        { name: "Big League", description: "Reach $5,000 in total revenue", metric: "revenue", threshold: "5000", tier: "silver" },
        { name: "Profit Master", description: "Achieve $1,000 in total profit", metric: "profit", threshold: "1000", tier: "silver" },
        { name: "Strong Margins", description: "Maintain 20% profit margin", metric: "profit_margin", threshold: "20", tier: "silver" },
        { name: "Volume Expert", description: "Sell 500 units total", metric: "units", threshold: "500", tier: "silver" },
        { name: "Revenue Champion", description: "Reach $10,000 in total revenue", metric: "revenue", threshold: "10000", tier: "silver" },

        // Gold Trophies (10)
        { name: "1K Club", description: "Sell 1,000 units", metric: "units", threshold: "1000", tier: "gold" },
        { name: "Major League", description: "Reach $25,000 in total revenue", metric: "revenue", threshold: "25000", tier: "gold" },
        { name: "Profit Legend", description: "Achieve $5,000 in total profit", metric: "profit", threshold: "5000", tier: "gold" },
        { name: "Premium Margins", description: "Maintain 25% profit margin", metric: "profit_margin", threshold: "25", tier: "gold" },
        { name: "Volume King", description: "Sell 2,500 units total", metric: "units", threshold: "2500", tier: "gold" },
        { name: "Big Revenue", description: "Reach $50,000 in total revenue", metric: "revenue", threshold: "50000", tier: "gold" },
        { name: "Profit Emperor", description: "Achieve $10,000 in total profit", metric: "profit", threshold: "10000", tier: "gold" },
        { name: "Elite Margins", description: "Maintain 30% profit margin", metric: "profit_margin", threshold: "30", tier: "gold" },
        { name: "Unit Master", description: "Sell 5,000 units total", metric: "units", threshold: "5000", tier: "gold" },
        { name: "Six-Figure Success", description: "Reach $100,000 in total revenue", metric: "revenue", threshold: "100000", tier: "gold" },

        // Platinum Trophy (1)
        { name: "Ultimate FBA Master", description: "Unlock all 30 achievements", metric: "trophies_completed", threshold: "30", tier: "platinum" }
      ];

      await db.insert(trophies).values(trophyData);
      console.log('✨ Trophies initialized successfully');
    } catch (error) {
      console.error('Error initializing trophies:', error);
    }
  }

  async getUserTrophies(userId: number): Promise<{
    trophy: Trophy;
    completed: boolean;
    percentComplete: number;
    earnedAt: Date | null;
  }[]> {
    try {
      const userTrophyData = await db
        .select({
          trophy: trophies,
          userTrophy: userTrophies
        })
        .from(trophies)
        .leftJoin(userTrophies, and(
          eq(userTrophies.trophyId, trophies.id),
          eq(userTrophies.userId, userId)
        ))
        .orderBy(trophies.tier, trophies.id);

      return userTrophyData.map(row => ({
        trophy: row.trophy,
        completed: row.userTrophy?.completed || false,
        percentComplete: Number(row.userTrophy?.percentComplete || 0),
        earnedAt: row.userTrophy?.earnedAt || null
      }));
    } catch (error) {
      console.error('Error fetching user trophies:', error);
      return [];
    }
  }

  async updateTrophyProgress(userId: number): Promise<void> {
    try {
      // Get current dashboard KPIs
      const kpis = await this.getDashboardKPIs(userId);
      
      // Get all trophies
      const allTrophies = await db.select().from(trophies);
      
      let completedTrophies = 0;
      
      for (const trophy of allTrophies) {
        if (trophy.tier === 'platinum') continue; // Handle platinum separately
        
        let currentValue = 0;
        let threshold = Number(trophy.threshold);
        
        // Map trophy metrics to KPI values
        switch (trophy.metric) {
          case 'revenue':
            currentValue = kpis.overallRevenue;
            break;
          case 'units':
            currentValue = kpis.overallUnitsSold;
            break;
          case 'profit':
            currentValue = kpis.overallProfit;
            break;
          case 'profit_margin':
            currentValue = kpis.overallProfitMargin;
            break;
        }
        
        const percentComplete = Math.min(100, (currentValue / threshold) * 100);
        const isCompleted = percentComplete >= 100;
        
        if (isCompleted) completedTrophies++;
        
        // Insert or update user trophy progress using upsert pattern
        const existingRecord = await db
          .select()
          .from(userTrophies)
          .where(and(
            eq(userTrophies.trophyId, trophy.id),
            eq(userTrophies.userId, userId)
          ))
          .limit(1);

        if (existingRecord.length > 0) {
          // Update existing record
          await db
            .update(userTrophies)
            .set({
              completed: isCompleted,
              percentComplete: percentComplete.toFixed(2),
              earnedAt: isCompleted && !existingRecord[0].earnedAt ? new Date() : existingRecord[0].earnedAt
            })
            .where(and(
              eq(userTrophies.trophyId, trophy.id),
              eq(userTrophies.userId, userId)
            ));
        } else {
          // Insert new record
          await db
            .insert(userTrophies)
            .values({
              trophyId: trophy.id,
              userId,
              completed: isCompleted,
              percentComplete: percentComplete.toFixed(2),
              earnedAt: isCompleted ? new Date() : null
            });
        }
      }
      
      // Handle Platinum trophy (all others completed)
      const platinumTrophy = allTrophies.find(t => t.tier === 'platinum');
      if (platinumTrophy) {
        const platinumCompleted = completedTrophies >= 30;
        
        const existingPlatinumRecord = await db
          .select()
          .from(userTrophies)
          .where(and(
            eq(userTrophies.trophyId, platinumTrophy.id),
            eq(userTrophies.userId, userId)
          ))
          .limit(1);

        if (existingPlatinumRecord.length > 0) {
          // Update existing platinum trophy record
          await db
            .update(userTrophies)
            .set({
              completed: platinumCompleted,
              percentComplete: ((completedTrophies / 30) * 100).toFixed(2),
              earnedAt: platinumCompleted && !existingPlatinumRecord[0].earnedAt ? new Date() : existingPlatinumRecord[0].earnedAt
            })
            .where(and(
              eq(userTrophies.trophyId, platinumTrophy.id),
              eq(userTrophies.userId, userId)
            ));
        } else {
          // Insert new platinum trophy record
          await db
            .insert(userTrophies)
            .values({
              trophyId: platinumTrophy.id,
              userId,
              completed: platinumCompleted,
              percentComplete: ((completedTrophies / 30) * 100).toFixed(2),
              earnedAt: platinumCompleted ? new Date() : null
            });
        }
      }
      
      console.log(`🏆 Trophy progress updated for user ${userId}: ${completedTrophies}/30 completed`);
    } catch (error) {
      console.error('Error updating trophy progress:', error);
    }
  }

  async getClosestTrophies(userId: number, limit: number = 5): Promise<{
    trophy: Trophy;
    percentComplete: number;
    currentValue: number;
    targetValue: number;
  }[]> {
    try {
      const kpis = await this.getDashboardKPIs(userId);
      const userTrophyData = await this.getUserTrophies(userId);
      
      const incomplete = userTrophyData
        .filter(t => !t.completed && t.trophy.tier !== 'platinum')
        .map(t => {
          let currentValue = 0;
          const targetValue = Number(t.trophy.threshold);
          
          switch (t.trophy.metric) {
            case 'revenue': currentValue = kpis.overallRevenue; break;
            case 'units': currentValue = kpis.overallUnitsSold; break;
            case 'profit': currentValue = kpis.overallProfit; break;
            case 'profit_margin': currentValue = kpis.overallProfitMargin; break;
          }
          
          return {
            trophy: t.trophy,
            percentComplete: t.percentComplete,
            currentValue,
            targetValue
          };
        })
        .sort((a, b) => b.percentComplete - a.percentComplete) // Sort by completion desc
        .slice(0, limit);
        
      return incomplete;
    } catch (error) {
      console.error('Error fetching closest trophies:', error);
      return [];
    }
  }

  async getActiveGoalsWithProgress(userId: number): Promise<{
    id: number;
    metric: string;
    scope: string;
    targetValue: number;
    currentValue: number;
    percentComplete: number;
    status: 'Met' | 'On Track' | 'Off Track' | 'Unmet';
    timePeriod: string;
    description: string;
    sku?: string;
    category?: string;
  }[]> {
    try {
      const userGoals = await db.select().from(goals).where(eq(goals.userId, userId));
      const kpis = await this.getDashboardKPIs(userId);
      
      return await Promise.all(userGoals.map(async (goal) => {
        let currentValue = 0;
        
        // Get current value based on scope and metric
        if (goal.scope === 'global') {
          switch (goal.metric) {
            case 'revenue': currentValue = kpis.overallRevenue; break;
            case 'units': currentValue = kpis.overallUnitsSold; break;
            case 'profit': currentValue = kpis.overallProfit; break;
            case 'profit_margin': currentValue = kpis.overallProfitMargin; break;
          }
        } else if (goal.scope === 'sku' && goal.targetSKU) {
          // Get SKU-specific metrics
          const skuMetrics = await db
            .select({
              revenue: sql<number>`COALESCE(SUM(CAST(${sales.totalRevenue} AS DECIMAL)), 0)`,
              profit: sql<number>`COALESCE(SUM(CAST(${sales.profit} AS DECIMAL)), 0)`,
              units: sql<number>`COALESCE(SUM(${sales.quantity}), 0)`
            })
            .from(sales)
            .where(and(eq(sales.userId, userId), eq(sales.sku, goal.targetSKU)));
          
          const [result] = skuMetrics;
          switch (goal.metric) {
            case 'revenue': currentValue = Number(result.revenue); break;
            case 'units': currentValue = Number(result.units); break;
            case 'profit': currentValue = Number(result.profit); break;
          }
        } else if (goal.scope === 'category' && goal.targetCategory) {
          // Get category-specific metrics
          const categoryMetrics = await db
            .select({
              revenue: sql<number>`COALESCE(SUM(CAST(${sales.totalRevenue} AS DECIMAL)), 0)`,
              profit: sql<number>`COALESCE(SUM(CAST(${sales.profit} AS DECIMAL)), 0)`,
              units: sql<number>`COALESCE(SUM(${sales.quantity}), 0)`
            })
            .from(sales)
            .where(and(eq(sales.userId, userId), eq(sales.category, goal.targetCategory)));
          
          const [result] = categoryMetrics;
          switch (goal.metric) {
            case 'revenue': currentValue = Number(result.revenue); break;
            case 'units': currentValue = Number(result.units); break;
            case 'profit': currentValue = Number(result.profit); break;
          }
        }
        
        const targetValue = parseFloat(goal.targetValue);
        const percentComplete = Math.min(100, (currentValue / targetValue) * 100);
        let status: 'Met' | 'On Track' | 'Off Track' | 'Unmet' = 'Unmet';
        
        if (percentComplete >= 100) status = 'Met';
        else if (percentComplete >= 75) status = 'On Track';
        else if (percentComplete >= 25) status = 'Off Track';
        
        return {
          id: goal.id,
          metric: goal.metric,
          scope: goal.scope,
          targetValue: targetValue,
          currentValue,
          percentComplete: Number(percentComplete.toFixed(2)),
          status,
          timePeriod: goal.period,
          description: goal.description || '',
          sku: goal.targetSKU || undefined,
          category: goal.targetCategory || undefined
        };
      }));
    } catch (error) {
      console.error('Error fetching active goals with progress:', error);
      return [];
    }
  }

  // Activity Log Methods
  async getActivityLog(userId: number, limit: number = 10): Promise<ActivityLog[]> {
    try {
      const result = await db.execute(sql`
        SELECT id, user_id, action, details, metadata, created_at
        FROM activity_log 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `);
      return result.rows as ActivityLog[];
    } catch (error) {
      console.error("Error fetching activity log:", error);
      return [];
    }
  }

  async createActivityLog(entry: InsertActivityLog): Promise<ActivityLog> {
    const [newEntry] = await db.insert(activityLog).values(entry).returning();
    return newEntry;
  }
}

export const storage = new DatabaseStorage();
