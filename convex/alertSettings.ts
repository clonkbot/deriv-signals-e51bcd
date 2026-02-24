import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("alertSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      return {
        telegramEnabled: false,
        telegramChatId: "",
        emailEnabled: false,
        email: "",
        smsEnabled: false,
        phoneNumber: "",
        pushEnabled: false,
        minConfidence: 70,
      };
    }

    return settings;
  },
});

export const update = mutation({
  args: {
    telegramEnabled: v.boolean(),
    telegramChatId: v.optional(v.string()),
    emailEnabled: v.boolean(),
    email: v.optional(v.string()),
    smsEnabled: v.boolean(),
    phoneNumber: v.optional(v.string()),
    pushEnabled: v.boolean(),
    minConfidence: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("alertSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("alertSettings", {
        userId,
        ...args,
        updatedAt: Date.now(),
      });
    }
  },
});
