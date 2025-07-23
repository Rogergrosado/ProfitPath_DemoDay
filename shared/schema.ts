import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, unique } from "drizzle-orm/pg-core";
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
  industryType: text("industry_type"),
  fbaYears: integer("fba_years"),
  avgDailySales: decimal("avg_daily_sales", { precision: 10, scale: 2 }),
  defaultLeadTime: integer("default_lead_time").default(14),
  currency: text("currency").default("USD"),
  timezone: text("timezone").default("UTC"),
  theme: text("theme").default("dark"),
  emailNotifications: boolean("email_notifications").default(true),
  inventoryAlerts: boolean("inventory_alerts").default(true),
  goalAlerts: boolean("goal_alerts").default(true),
  lowStockThreshold: integer("low_stock_threshold").default(10),
  autoSync: boolean("auto_sync").default(false),
  exportFormat: text("export_format").default("CSV"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  productName: text("product_name"),
  category: text("category"),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  profit: decimal("profit", { precision: 10, scale: 2 }),
  saleDate: timestamp("sale_date").notNull(),
  marketplace: text("marketplace").default("amazon"), // amazon, ebay, etc.
  region: text("region").default("US"),
  importBatch: text("import_batch"), // For tracking CSV imports
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

export const goalHistory = pgTable("goal_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  originalGoalId: integer("original_goal_id").notNull(),
  metric: text("metric").notNull(),
  targetValue: decimal("target_value", { precision: 15, scale: 2 }).notNull(),
  finalValue: decimal("final_value", { precision: 15, scale: 2 }).notNull(),
  scope: text("scope").notNull(),
  targetCategory: text("target_category"),
  targetSKU: text("target_sku"),
  period: text("period").notNull(),
  description: text("description"),
  status: text("status").notNull(), // "met", "unmet"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  daysToComplete: integer("days_to_complete"),
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

// New tables for inventory system overhaul
// Activity Log for Recent Activity tracking
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(), // "sale", "goal_created", "goal_achieved", "inventory_update", "csv_import"
  details: text("details").notNull(), // Human-readable description
  metadata: jsonb("metadata"), // Additional structured data
  createdAt: timestamp("created_at").defaultNow(),
});

export const salesHistory = pgTable("sales_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  inventoryId: integer("inventory_id").references(() => inventory.id),
  sku: text("sku").notNull(),
  productName: text("product_name").notNull(),
  quantitySold: integer("quantity_sold").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  profit: decimal("profit", { precision: 10, scale: 2 }),
  saleDate: timestamp("sale_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calendarSales = pgTable("calendar_sales", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sku: text("sku").notNull(),
  productName: text("product_name").notNull(),
  saleDate: timestamp("sale_date").notNull(),
  quantity: integer("quantity").notNull(),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reorderCalendar = pgTable("reorder_calendar", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  inventoryId: integer("inventory_id").references(() => inventory.id),
  sku: text("sku").notNull(),
  productName: text("product_name").notNull(),
  reorderDate: timestamp("reorder_date").notNull(),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  inventory: many(inventory),
  sales: many(sales),
  goals: many(goals),
  goalHistory: many(goalHistory),
  reports: many(reports),
  salesHistory: many(salesHistory),
  calendarSales: many(calendarSales),
  reorderCalendar: many(reorderCalendar),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  inventoryItems: many(inventory),
}));

export const salesHistoryRelations = relations(salesHistory, ({ one }) => ({
  user: one(users, {
    fields: [salesHistory.userId],
    references: [users.id],
  }),
  inventory: one(inventory, {
    fields: [salesHistory.inventoryId],
    references: [inventory.id],
  }),
}));

export const calendarSalesRelations = relations(calendarSales, ({ one }) => ({
  user: one(users, {
    fields: [calendarSales.userId],
    references: [users.id],
  }),
}));

export const reorderCalendarRelations = relations(reorderCalendar, ({ one }) => ({
  user: one(users, {
    fields: [reorderCalendar.userId],
    references: [users.id],
  }),
  inventory: one(inventory, {
    fields: [reorderCalendar.inventoryId],
    references: [inventory.id],
  }),
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

export const goalHistoryRelations = relations(goalHistory, ({ one }) => ({
  user: one(users, {
    fields: [goalHistory.userId],
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
}).extend({
  estimatedPrice: z.union([z.string(), z.number()]).optional().transform((val) => 
    val ? val.toString() : undefined
  ),
  demandScore: z.union([z.string(), z.number()]).optional().transform((val) => 
    val ? Number(val) : undefined
  ),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
}).extend({
  saleDate: z.union([z.date(), z.string()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  unitPrice: z.union([z.string(), z.number()]).transform((val) => val.toString()),
  totalRevenue: z.union([z.string(), z.number()]).transform((val) => val.toString()),
  totalCost: z.union([z.string(), z.number()]).optional().transform((val) => 
    val ? val.toString() : undefined
  ),
  profit: z.union([z.string(), z.number()]).optional().transform((val) => 
    val ? val.toString() : undefined
  ),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  targetValue: z.union([z.string(), z.number()]).transform(val => Number(val)) // Accept both string and number, convert to number
});

export const insertGoalHistorySchema = createInsertSchema(goalHistory).omit({
  id: true,
  completedAt: true,
}).extend({
  targetValue: z.union([z.string(), z.number()]).transform(val => Number(val)),
  achievedValue: z.union([z.string(), z.number()]).transform(val => Number(val))
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// New insert schemas for inventory system overhaul
export const insertSalesHistorySchema = createInsertSchema(salesHistory).omit({
  id: true,
  createdAt: true,
}).extend({
  saleDate: z.union([z.date(), z.string()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  unitPrice: z.union([z.string(), z.number()]).transform((val) => val.toString()),
  totalRevenue: z.union([z.string(), z.number()]).transform((val) => val.toString()),
  totalCost: z.union([z.string(), z.number()]).optional().transform((val) => 
    val ? val.toString() : undefined
  ),
  profit: z.union([z.string(), z.number()]).optional().transform((val) => 
    val ? val.toString() : undefined
  ),
});

export const insertCalendarSalesSchema = createInsertSchema(calendarSales).omit({
  id: true,
  createdAt: true,
}).extend({
  saleDate: z.union([z.date(), z.string()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  totalRevenue: z.union([z.string(), z.number()]).transform((val) => val.toString()),
});

export const insertReorderCalendarSchema = createInsertSchema(reorderCalendar).omit({
  id: true,
  createdAt: true,
}).extend({
  reorderDate: z.union([z.date(), z.string()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true,
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
export type GoalHistory = typeof goalHistory.$inferSelect;
export type InsertGoalHistory = z.infer<typeof insertGoalHistorySchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

// New types for inventory system overhaul
export type SalesHistory = typeof salesHistory.$inferSelect;
export type InsertSalesHistory = z.infer<typeof insertSalesHistorySchema>;
export type CalendarSales = typeof calendarSales.$inferSelect;
export type InsertCalendarSales = z.infer<typeof insertCalendarSalesSchema>;
export type ReorderCalendar = typeof reorderCalendar.$inferSelect;
export type InsertReorderCalendar = z.infer<typeof insertReorderCalendarSchema>;

// Activity Log types
export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Trophy System Tables
export const trophies = pgTable("trophies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  metric: text("metric").notNull(), // "revenue", "units", "profit_margin", "conversion_rate"
  threshold: decimal("threshold", { precision: 12, scale: 2 }).notNull(),
  tier: text("tier").notNull(), // "bronze", "silver", "gold", "platinum"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userTrophies = pgTable("user_trophies", {
  id: serial("id").primaryKey(),
  trophyId: integer("trophy_id").references(() => trophies.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  completed: boolean("completed").default(false).notNull(),
  percentComplete: decimal("percent_complete", { precision: 5, scale: 2 }).default("0").notNull(),
  earnedAt: timestamp("earned_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserTrophy: unique().on(table.trophyId, table.userId)
}));

// Trophy System Relations
export const trophiesRelations = relations(trophies, ({ many }) => ({
  userTrophies: many(userTrophies),
}));

export const userTrophiesRelations = relations(userTrophies, ({ one }) => ({
  user: one(users, {
    fields: [userTrophies.userId],
    references: [users.id],
  }),
  trophy: one(trophies, {
    fields: [userTrophies.trophyId],
    references: [trophies.id],
  }),
}));

// Trophy System Insert Schemas
export const insertTrophySchema = createInsertSchema(trophies).omit({ id: true, createdAt: true });
export const insertUserTrophySchema = createInsertSchema(userTrophies).omit({ id: true, createdAt: true });

// Trophy System Types
export type Trophy = typeof trophies.$inferSelect;
export type InsertTrophy = z.infer<typeof insertTrophySchema>;
export type UserTrophy = typeof userTrophies.$inferSelect;
export type InsertUserTrophy = z.infer<typeof insertUserTrophySchema>;
