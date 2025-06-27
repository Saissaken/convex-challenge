import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

export const sendMessage = mutation({
  args: { message: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Must be logged in to send messages");
    }

    if (args.message.trim().length === 0) {
      throw new ConvexError("Message cannot be empty");
    }

    if (args.message.length > 500) {
      throw new ConvexError("Message too long");
    }

    await ctx.db.insert("chatMessages", {
      userId,
      message: args.message.trim(),
      createdAt: Date.now(),
    });
  },
});

export const getRecentMessages = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("chatMessages").order("desc").take(50);

    // Get user info for each message
    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.userId);
        if (!user) throw new ConvexError("User not found");
        return {
          ...message,
          from: user.nickname,
        };
      })
    );

    return messagesWithUsers.reverse(); // Show oldest first
  },
});
