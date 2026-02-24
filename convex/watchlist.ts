import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const add = mutation({
  args: {
    symbol: v.string(),
    displayName: v.string(),
    exchange: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already exists
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("symbol"), args.symbol))
      .first();

    if (existing) throw new Error("Symbol already in watchlist");

    return await ctx.db.insert("watchlist", {
      userId,
      symbol: args.symbol,
      displayName: args.displayName,
      exchange: args.exchange,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("watchlist") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, { isActive: !item.isActive });
  },
});

export const remove = mutation({
  args: { id: v.id("watchlist") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
