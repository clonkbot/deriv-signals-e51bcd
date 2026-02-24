import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.status) {
      return await ctx.db
        .query("signals")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", userId).eq("status", args.status as "active" | "closed" | "expired")
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("signals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const signals = await ctx.db
      .query("signals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const closedSignals = signals.filter(s => s.status === "closed" && s.result);
    const wins = closedSignals.filter(s => s.result === "win").length;
    const losses = closedSignals.filter(s => s.result === "loss").length;
    const activeSignals = signals.filter(s => s.status === "active").length;

    const totalPnl = closedSignals.reduce((sum, s) => sum + (s.pnlPercent || 0), 0);

    // Calculate average R:R
    let totalRR = 0;
    let rrCount = 0;
    closedSignals.forEach(s => {
      if (s.targetPrice && s.stopLoss && s.entryPrice) {
        const reward = Math.abs(s.targetPrice - s.entryPrice);
        const risk = Math.abs(s.entryPrice - s.stopLoss);
        if (risk > 0) {
          totalRR += reward / risk;
          rrCount++;
        }
      }
    });

    return {
      totalTrades: closedSignals.length,
      wins,
      losses,
      winRate: closedSignals.length > 0 ? (wins / closedSignals.length) * 100 : 0,
      avgRR: rrCount > 0 ? totalRR / rrCount : 0,
      totalPnl,
      activeSignals,
    };
  },
});

export const create = mutation({
  args: {
    symbol: v.string(),
    type: v.union(v.literal("BUY"), v.literal("SELL")),
    strategy: v.string(),
    entryPrice: v.number(),
    targetPrice: v.optional(v.number()),
    stopLoss: v.optional(v.number()),
    confidence: v.number(),
    chartSnapshot: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("signals", {
      userId,
      symbol: args.symbol,
      type: args.type,
      strategy: args.strategy,
      entryPrice: args.entryPrice,
      targetPrice: args.targetPrice,
      stopLoss: args.stopLoss,
      confidence: args.confidence,
      status: "active",
      chartSnapshot: args.chartSnapshot,
      notes: args.notes,
      alertSent: false,
      createdAt: Date.now(),
    });
  },
});

export const closeSignal = mutation({
  args: {
    id: v.id("signals"),
    exitPrice: v.number(),
    result: v.union(v.literal("win"), v.literal("loss"), v.literal("breakeven")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const signal = await ctx.db.get(args.id);
    if (!signal || signal.userId !== userId) throw new Error("Signal not found");

    const pnlPercent = signal.type === "BUY"
      ? ((args.exitPrice - signal.entryPrice) / signal.entryPrice) * 100
      : ((signal.entryPrice - args.exitPrice) / signal.entryPrice) * 100;

    await ctx.db.patch(args.id, {
      status: "closed",
      exitPrice: args.exitPrice,
      result: args.result,
      pnlPercent,
      closedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("signals") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const signal = await ctx.db.get(args.id);
    if (!signal || signal.userId !== userId) throw new Error("Signal not found");

    await ctx.db.delete(args.id);
  },
});
