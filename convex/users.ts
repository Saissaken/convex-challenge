import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { requireAuth } from "./_utils";

export const getBalance = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    // Get all transactions for the user
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Calculate current balance by summing all transaction amounts
    const currentBalance = transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    return currentBalance;
  },
});

export const claimTokens = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    // Check if user has already claimed free tokens today
    const today = new Date();
    const dayString = today.toISOString().split("T")[0]; // YYYY-MM-DD format

    const existingClaim = await ctx.db
      .query("dailyClaims")
      .withIndex("by_user_and_day", (q) =>
        q.eq("userId", userId).eq("day", dayString)
      )
      .first();

    if (existingClaim) {
      throw new ConvexError("You have already claimed your daily tokens!");
    }

    // Create a transaction for claiming 100 tokens
    await ctx.db.insert("transactions", {
      userId,
      amount: 100,
      type: "daily_claim",
      description: "Daily free tokens",
    });

    // Record the daily claim
    await ctx.db.insert("dailyClaims", {
      userId,
      claimedAt: Date.now(),
      day: dayString,
    });

    return null;
  },
});
