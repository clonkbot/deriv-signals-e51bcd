import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Trading symbols being monitored
  watchlist: defineTable({
    userId: v.id("users"),
    symbol: v.string(),
    displayName: v.string(),
    exchange: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Price data snapshots
  priceData: defineTable({
    symbol: v.string(),
    price: v.number(),
    open: v.number(),
    high: v.number(),
    low: v.number(),
    close: v.number(),
    volume: v.number(),
    timestamp: v.number(),
  }).index("by_symbol", ["symbol"])
    .index("by_symbol_time", ["symbol", "timestamp"]),

  // Trading signals/alerts
  signals: defineTable({
    userId: v.id("users"),
    symbol: v.string(),
    type: v.union(v.literal("BUY"), v.literal("SELL")),
    strategy: v.string(),
    entryPrice: v.number(),
    targetPrice: v.optional(v.number()),
    stopLoss: v.optional(v.number()),
    confidence: v.number(), // 0-100
    status: v.union(v.literal("active"), v.literal("closed"), v.literal("expired")),
    result: v.optional(v.union(v.literal("win"), v.literal("loss"), v.literal("breakeven"))),
    exitPrice: v.optional(v.number()),
    pnlPercent: v.optional(v.number()),
    chartSnapshot: v.optional(v.string()),
    notes: v.optional(v.string()),
    alertSent: v.boolean(),
    createdAt: v.number(),
    closedAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_symbol", ["symbol"]),

  // Alert notification settings
  alertSettings: defineTable({
    userId: v.id("users"),
    telegramEnabled: v.boolean(),
    telegramChatId: v.optional(v.string()),
    emailEnabled: v.boolean(),
    email: v.optional(v.string()),
    smsEnabled: v.boolean(),
    phoneNumber: v.optional(v.string()),
    pushEnabled: v.boolean(),
    minConfidence: v.number(), // minimum confidence to send alerts
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Trading rules/strategies
  strategies: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    isActive: v.boolean(),
    rules: v.string(), // JSON stringified rules
    indicators: v.array(v.string()),
    timeframes: v.array(v.string()),
    winRate: v.optional(v.number()),
    totalTrades: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Performance logs
  performanceLogs: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD
    totalTrades: v.number(),
    wins: v.number(),
    losses: v.number(),
    breakeven: v.number(),
    totalPnlPercent: v.number(),
    avgRR: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),
});
