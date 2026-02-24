import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("strategies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    rules: v.string(),
    indicators: v.array(v.string()),
    timeframes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("strategies", {
      userId,
      name: args.name,
      description: args.description,
      isActive: true,
      rules: args.rules,
      indicators: args.indicators,
      timeframes: args.timeframes,
      totalTrades: 0,
      createdAt: Date.now(),
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("strategies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const strategy = await ctx.db.get(args.id);
    if (!strategy || strategy.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, { isActive: !strategy.isActive });
  },
});

export const remove = mutation({
  args: { id: v.id("strategies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const strategy = await ctx.db.get(args.id);
    if (!strategy || strategy.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
