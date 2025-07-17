import {
  users,
  products,
  inventory,
  sales,
  goals,
  reports,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  // Products
  getProducts(userId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Inventory
  getInventory(userId: number): Promise<Inventory[]>;
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory>;
  deleteInventoryItem(id: number): Promise<void>;

  // Sales
  getSales(userId: number, startDate?: Date, endDate?: Date): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  getSalesMetrics(userId: number): Promise<{
    totalRevenue: number;
    totalProfit: number;
    totalUnits: number;
    averageOrderValue: number;
  }>;

  // Goals
  getGoals(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal>;
  deleteGoal(id: number): Promise<void>;

  // Reports
  getReports(userId: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  deleteReport(id: number): Promise<void>;
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
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
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

  // Inventory
  async getInventory(userId: number): Promise<Inventory[]> {
    return db.select().from(inventory).where(eq(inventory.userId, userId)).orderBy(desc(inventory.lastUpdated));
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
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

  async getSalesMetrics(userId: number): Promise<{
    totalRevenue: number;
    totalProfit: number;
    totalUnits: number;
    averageOrderValue: number;
  }> {
    const result = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${sales.totalRevenue}), 0)`,
        totalProfit: sql<number>`COALESCE(SUM(${sales.profit}), 0)`,
        totalUnits: sql<number>`COALESCE(SUM(${sales.quantity}), 0)`,
        totalSales: sql<number>`COUNT(*)`,
      })
      .from(sales)
      .where(eq(sales.userId, userId));

    const metrics = result[0];
    const averageOrderValue = metrics.totalSales > 0 ? metrics.totalRevenue / metrics.totalSales : 0;

    return {
      totalRevenue: Number(metrics.totalRevenue),
      totalProfit: Number(metrics.totalProfit),
      totalUnits: Number(metrics.totalUnits),
      averageOrderValue: Number(averageOrderValue),
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
}

export const storage = new DatabaseStorage();
