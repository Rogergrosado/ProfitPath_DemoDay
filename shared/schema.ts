import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  photoURL: text("photo_url"),
  firebaseUid: text("firebase_uid").notNull().unique(),
  businessName: text("business_name"),
  phone: text("phone"),
  currency: text("currency").default("USD"),
  timezone: text("timezone").default("UTC"),
  theme: text("theme").default("dark"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  sku: text("sku"),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  competition: text("competition"), // "low", "medium", "high"
  demandScore: integer("demand_score"),
  status: text("status").default("researching"), // "researching", "validated", "ready_to_launch"
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  category: text("category"),
  currentStock: integer("current_stock").default(0),
  reservedStock: integer("reserved_stock").default(0),
  reorderPoint: integer("reorder_point").default(0),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  inventoryId: integer("inventory_id").references(() => inventory.id),
  sku: text("sku").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  profit: decimal("profit", { precision: 10, scale: 2 }),
  saleDate: timestamp("sale_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  metric: text("metric").notNull(), // "revenue" | "unitsSold" | "profit" | "profitMargin"
  targetValue: decimal("target_value", { precision: 15, scale: 2 }).notNull(),
  scope: text("scope").notNull(), // "global", "sku", "category"
  targetCategory: text("target_category"), // for category scope
  targetSKU: text("target_sku"), // for sku scope
  period: text("period").notNull(), // "7d", "30d", "90d", etc.
  description: text("description"), // optional description
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // "sales_summary", "inventory_report", "profit_analysis", "custom"
  config: jsonb("config"), // Stores widget configuration for custom reports
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  inventory: many(inventory),
  sales: many(sales),
  goals: many(goals),
  reports: many(reports),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  inventoryItems: many(inventory),
}));

export const inventoryRelations = relations(inventory, ({ one, many }) => ({
  user: one(users, {
    fields: [inventory.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
  sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
  }),
  inventory: one(inventory, {
    fields: [sales.inventoryId],
    references: [inventory.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
