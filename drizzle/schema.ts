import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Brand Projects - Each user can have multiple brand projects
 */
export const brandProjects = mysqlTable("brand_projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Project metadata
  name: varchar("name", { length: 255 }).notNull(),
  initialConcept: text("initialConcept").notNull(),
  
  // Workflow state
  currentPhase: mysqlEnum("currentPhase", [
    "discovery",
    "strategy",
    "concepts",
    "refinement",
    "toolkit",
    "completed"
  ]).default("discovery").notNull(),
  
  // Discovery data (JSON storage for flexibility)
  discoveryAnswers: text("discoveryAnswers"),
  
  // Strategy output
  strategyData: text("strategyData"),
  
  // Selected concept ID
  selectedConceptId: int("selectedConceptId"),
  
  // Final toolkit URL
  toolkitPdfUrl: text("toolkitPdfUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrandProject = typeof brandProjects.$inferSelect;
export type InsertBrandProject = typeof brandProjects.$inferInsert;

/**
 * Brand Concepts - 3 visual directions generated for each project
 */
export const brandConcepts = mysqlTable("brand_concepts", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  // Concept metadata
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  
  // Visual identity
  primaryColor: varchar("primaryColor", { length: 7 }).notNull(),
  secondaryColor: varchar("secondaryColor", { length: 7 }).notNull(),
  accentColor: varchar("accentColor", { length: 7 }).notNull(),
  
  // Typography
  displayFont: varchar("displayFont", { length: 100 }).notNull(),
  bodyFont: varchar("bodyFont", { length: 100 }).notNull(),
  
  // Visual style
  visualStyle: varchar("visualStyle", { length: 100 }).notNull(),
  
  // Generated assets
  moodboardImageUrl: text("moodboardImageUrl"),
  logoConceptImageUrl: text("logoConceptImageUrl"),
  
  // Messaging
  tagline: text("tagline"),
  toneOfVoice: text("toneOfVoice"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BrandConcept = typeof brandConcepts.$inferSelect;
export type InsertBrandConcept = typeof brandConcepts.$inferInsert;

/**
 * Chat Messages - Conversation history for each project
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  // Optional answer choices for multiple-choice questions
  answerChoices: text("answerChoices"), // JSON array of strings
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;