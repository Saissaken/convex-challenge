import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  transactions: defineTable({
    userId: v.id("users"),
    amount: v.number(), // positive for incoming, negative for outgoing
    type: v.union(
      v.literal("daily_claim"),
      v.literal("battle_bet"),
      v.literal("battle_win")
    ),
    battleId: v.optional(v.id("battles")),
    description: v.string(),
  }).index("by_user", ["userId"]),

  battles: defineTable({
    creatorId: v.id("users"),
    opponentId: v.optional(v.id("users")),
    betAmount: v.number(),
    creatorMove: v.union(
      v.literal("rock"),
      v.literal("paper"),
      v.literal("scissors")
    ),
    opponentMove: v.optional(
      v.union(v.literal("rock"), v.literal("paper"), v.literal("scissors"))
    ),
    winnerId: v.optional(v.id("users")),
    status: v.union(
      v.literal("waiting"), // waiting for opponent
      v.literal("active"), // both players joined, moves submitted
      v.literal("finished") // battle resolved
    ),
    giphyId: v.string(),
    finishedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_creator", ["creatorId"])
    .index("by_opponent", ["opponentId"]),

  chatMessages: defineTable({
    userId: v.id("users"),
    message: v.string(),
    createdAt: v.number(),
  }),

  dailyClaims: defineTable({
    userId: v.id("users"),
    claimedAt: v.number(),
    day: v.string(), // YYYY-MM-DD format for easier querying
  })
    .index("by_user_and_day", ["userId", "day"])
    .index("by_user", ["userId"]),

  // Leaderboard (will be added via migration)
  // leaderboard: defineTable({
  //   userId: v.id("users"),
  //   wins: v.number(),
  //   totalBattles: v.number(),
  //   winRate: v.number(),
  // }).index("by_wins", ["wins"]),
};

const applicationAuthTables = {
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // other "users" fields...
  }).index("email", ["email"]),
};

export default defineSchema({
  ...applicationAuthTables,
  ...applicationTables,
});
