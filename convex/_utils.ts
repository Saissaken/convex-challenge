import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { QueryCtx } from "./_generated/server";
import { Id, TableNames, Doc } from "./_generated/dataModel";

export async function requireAuth(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("Must be logged in to create a battle");
  }
  return userId;
}

export async function getById<T extends TableNames>(
  ctx: QueryCtx,
  id: Id<T>
): Promise<Doc<T>> {
  const item = await ctx.db.get(id);
  if (!item) {
    throw new ConvexError(`${id.__tableName} not found with id ${id}`);
  }
  return item;
}

export function condition(
  condition: boolean,
  errorMessage: string
): asserts condition {
  if (!condition) {
    throw new ConvexError(errorMessage);
  }
}

export function assert<T>(
  value: T,
  errorMessage: string
): asserts value is NonNullable<T> {
  if (value == null) {
    throw new ConvexError(errorMessage);
  }
}
