import { v } from "convex/values";
import {
  mutation,
  internalMutation,
  internalAction,
  query,
  QueryCtx,
} from "./_generated/server";
import { ConvexError } from "convex/values";
import { api, components, internal } from "./_generated/api";
import { DataModel, Doc, Id } from "./_generated/dataModel";
import { asyncMap } from "convex-helpers";
import { getOneFromOrThrow } from "convex-helpers/server/relationships";
import { condition, assert, getById, requireAuth } from "./_utils";
import { TableAggregate } from "@convex-dev/aggregate";

export type Battle = Doc<"battles"> & {
  creator: string;
  opponent?: string;
  winner?: string;
};

async function getFullBattle(
  ctx: QueryCtx,
  battle: Doc<"battles">
): Promise<Battle> {
  const creator = await getOneFromOrThrow(
    ctx.db,
    "users",
    "by_id",
    battle.creatorId,
    "_id"
  );

  const opponent =
    battle.opponentId &&
    (await getOneFromOrThrow(
      ctx.db,
      "users",
      "by_id",
      battle.opponentId,
      "_id"
    ));

  const winner =
    battle.winnerId &&
    (await getOneFromOrThrow(ctx.db, "users", "by_id", battle.winnerId, "_id"));

  return {
    ...battle,
    creator: creator.nickname,
    opponent: opponent?.nickname,
    winner: winner?.nickname,
  };
}

const aggregateBattles = new TableAggregate<{
  Key: "waiting" | "active" | "finished";
  DataModel: DataModel;
  TableName: "battles";
}>(components.aggregateBattles, {
  sortKey: (doc) => doc.status, // Allows querying across time ranges.
  sumValue: (doc) => doc.betAmount, // The value to be used in `.sum` calculations.
});

// Aggregate for tracking user wins - only includes finished battles with winners
const aggregateUserWins = new TableAggregate<{
  Key: Id<"users"> | null;
  DataModel: DataModel;
  TableName: "battles";
}>(components.aggregateUserWins, {
  sortKey: (doc) => {
    // Only aggregate finished battles with winners
    return doc.status === "finished" && doc.winnerId ? doc.winnerId : null;
  },
  sumValue: (doc) => {
    // Each finished battle with a winner counts as 1 win for that user
    return doc.status === "finished" && doc.winnerId ? 1 : 0;
  },
});

export const getTotalBattles = query({
  args: {},
  handler: async (ctx) => {
    return await aggregateBattles.count(ctx);
  },
});

// Helper function to rebuild the user wins aggregate if needed
export const rebuildUserWinsAggregate = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Clear the existing aggregate
    await aggregateUserWins.clear(ctx);

    // Rebuild by inserting all battles
    const allBattles = await ctx.db.query("battles").collect();
    for (const battle of allBattles) {
      await aggregateUserWins.insert(ctx, battle);
    }
  },
});

export const getTotalBetAmount = query({
  args: {},
  handler: async (ctx) => {
    // Sum bet amounts for finished battles only
    const totalWon = await aggregateBattles.sum(ctx, {
      namespace: undefined,
      bounds: {
        lower: { key: "finished", inclusive: true },
        upper: { key: "finished", inclusive: true },
      },
    });

    return totalWon * 2;
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    // Get all unique users who have won battles
    const allUsers = await ctx.db.query("users").collect();
    const userWinCounts: Array<{
      userId: Id<"users">;
      wins: number;
      nickname: string;
    }> = [];

    // For each user, efficiently count their wins using the aggregate
    for (const user of allUsers) {
      const winCount = await aggregateUserWins.sum(ctx, {
        namespace: undefined,
        bounds: {
          lower: { key: user._id, inclusive: true },
          upper: { key: user._id, inclusive: true },
        },
      });

      if (winCount > 0) {
        userWinCounts.push({
          userId: user._id,
          wins: winCount,
          nickname: user.nickname,
        });
      }
    }

    // Sort by wins (descending) and return top 10
    return userWinCounts.sort((a, b) => b.wins - a.wins).slice(0, 10);
  },
});

export const getOpenBattles = query({
  args: {},
  handler: async (ctx) => {
    const battles = await asyncMap(
      ctx.db
        .query("battles")
        .filter((q) => q.neq(q.field("status"), "finished"))
        .order("desc")
        .collect(),
      (battle) => getFullBattle(ctx, battle)
    );
    return battles;
  },
});

export const getRecentBattles = query({
  args: {},
  handler: async (ctx) => {
    const battles = await asyncMap(
      ctx.db
        .query("battles")
        .withIndex("by_status", (q) => q.eq("status", "finished"))
        .order("desc")
        .take(10),
      (battle) => getFullBattle(ctx, battle)
    );
    return battles;
  },
});

export const createBattle = mutation({
  args: {
    betAmount: v.number(),
    creatorMove: v.union(
      v.literal("rock"),
      v.literal("paper"),
      v.literal("scissors")
    ),
  },
  returns: v.id("battles"),
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Validate bet amount
    condition(args.betAmount > 0, "Bet amount must be positive");
    condition(args.betAmount <= 1000, "Bet amount cannot exceed 1000");

    // Check user balance using getBalance query
    const currentBalance = await ctx.runQuery(api.users.getBalance);

    condition(
      currentBalance >= args.betAmount,
      `Insufficient balance. You have ${currentBalance} coins but need ${args.betAmount} coins to place this bet.`
    );

    // Create the battle (without Giphy ID for now)
    const battleId = await ctx.db.insert("battles", {
      creatorId: userId,
      betAmount: args.betAmount,
      creatorMove: args.creatorMove,
      status: "waiting",
      // giphyId will be added later by the scheduled action
    });
    const battle = await getById(ctx, battleId);
    await aggregateBattles.insert(ctx, battle);
    await aggregateUserWins.insert(ctx, battle);

    // Create a transaction record for the bet
    await ctx.db.insert("transactions", {
      userId,
      amount: -args.betAmount,
      type: "battle_bet",
      battleId,
      description: `Bet placed for battle`,
    });

    // Schedule action to fetch and update Giphy ID
    await ctx.scheduler.runAfter(0, internal.battles.updateBattleWithGiphy, {
      battleId,
      tag: "rock paper scissors",
    });

    return battleId;
  },
});

export const updateBattleWithGiphy = internalAction({
  args: {
    battleId: v.id("battles"),
    tag: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Fetch random Giphy
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/random?api_key=GlVGYHkr3WSBnllca54iNt0yFbjz7L65&tag=${args.tag}&rating=g`
    );

    condition(response.ok, "Failed to fetch from Giphy");

    const data = await response.json();
    const giphyId = data.data?.id;

    condition(giphyId, "No Giphy ID found");

    // Update the battle with the Giphy ID
    await ctx.runMutation(internal.battles.updateBattleGiphyId, {
      battleId: args.battleId,
      giphyId,
    });
  },
});

export const updateBattleGiphyId = internalMutation({
  args: {
    battleId: v.id("battles"),
    giphyId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.battleId, {
      giphyId: args.giphyId,
    });
  },
});

export const joinBattle = mutation({
  args: {
    battleId: v.id("battles"),
    move: v.union(v.literal("rock"), v.literal("paper"), v.literal("scissors")),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const battle = await getById(ctx, args.battleId);

    if (battle.status !== "waiting") {
      throw new ConvexError("Battle is not available to join");
    }

    condition(battle.creatorId !== userId, "Cannot join your own battle");

    // Check user balance
    const balance = await ctx.runQuery(api.users.getBalance);
    condition(balance >= battle.betAmount, "Insufficient balance");

    console.log("balance", balance);
    // Deduct bet amount
    await ctx.db.insert("transactions", {
      userId,
      amount: -battle.betAmount,
      type: "battle_bet",
      battleId: args.battleId,
      description: "Battle bet",
    });

    const oldBattle = await getById(ctx, args.battleId);
    // Update battle
    await ctx.db.patch(args.battleId, {
      opponentId: userId,
      opponentMove: args.move,
      status: "active",
    });
    const newBattle = await getById(ctx, args.battleId);
    await aggregateBattles.replace(ctx, oldBattle, newBattle);
    await aggregateUserWins.replace(ctx, oldBattle, newBattle);

    // Schedule battle resolution in 5 seconds
    await ctx.scheduler.runAfter(5000, internal.battles.resolveBattle, {
      battleId: args.battleId,
    });
  },
});

export const resolveBattle = internalMutation({
  args: { battleId: v.id("battles") },
  handler: async (ctx, args) => {
    const battle = await getById(ctx, args.battleId);

    condition(battle.status === "active", "Battle is not active");

    assert(battle.creatorMove, "Creator move not found");

    assert(battle.opponentMove, "Opponent move not found");

    assert(battle.opponentId, "Opponent not found");

    // Determine winner
    let winnerId: Id<"users"> | undefined;

    if (battle.creatorMove === battle.opponentMove) {
      // Draw - refund both players
      await ctx.db.insert("transactions", {
        userId: battle.creatorId,
        amount: battle.betAmount,
        type: "battle_win",
        battleId: args.battleId,
        description: "Battle refund (draw)",
      });

      await ctx.db.insert("transactions", {
        userId: battle.opponentId,
        amount: battle.betAmount,
        type: "battle_win",
        battleId: args.battleId,
        description: "Battle refund (draw)",
      });
    } else {
      // Determine winner based on rock-paper-scissors rules
      const winConditions = {
        rock: "scissors",
        paper: "rock",
        scissors: "paper",
      };

      if (winConditions[battle.creatorMove] === battle.opponentMove) {
        winnerId = battle.creatorId;
      } else {
        winnerId = battle.opponentId;
      }

      if (!winnerId) {
        throw new ConvexError("Winner not found");
      }

      // Award winnings to winner
      await ctx.db.insert("transactions", {
        userId: winnerId,
        amount: battle.betAmount * 2,
        type: "battle_win",
        battleId: args.battleId,
        description: "Battle victory",
      });
    }

    const oldBattle = await getById(ctx, args.battleId);
    // Update battle status
    await ctx.db.patch(args.battleId, {
      status: "finished",
      winnerId: winnerId || undefined,
      finishedAt: Date.now(),
    });
    const newBattle = await getById(ctx, args.battleId);
    await aggregateBattles.replace(ctx, oldBattle, newBattle);
    await aggregateUserWins.replace(ctx, oldBattle, newBattle);
  },
});
