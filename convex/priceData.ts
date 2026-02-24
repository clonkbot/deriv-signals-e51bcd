import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getLatest = query({
  args: { symbol: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("priceData")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .order("desc")
      .first();
  },
});

export const getHistory = query({
  args: { symbol: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("priceData")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .order("desc")
      .take(args.limit || 100);
  },
});

export const insert = mutation({
  args: {
    symbol: v.string(),
    price: v.number(),
    open: v.number(),
    high: v.number(),
    low: v.number(),
    close: v.number(),
    volume: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("priceData", {
      ...args,
      timestamp: Date.now(),
    });
  },
});
