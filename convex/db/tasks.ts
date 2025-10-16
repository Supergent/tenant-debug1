/**
 * Database Layer: Tasks
 *
 * This is the ONLY file that directly accesses the tasks table using ctx.db.
 * All tasks-related database operations are defined here as pure async functions.
 *
 * Architecture Pattern:
 * - Pure async functions (NOT Convex queries/mutations)
 * - Uses QueryCtx and MutationCtx types
 * - Exports functions for use by endpoint layer
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * CREATE - Insert a new task
 */
export async function createTask(
  ctx: MutationCtx,
  args: {
    userId: string;
    title: string;
    description?: string;
  }
) {
  const now = Date.now();
  return await ctx.db.insert("tasks", {
    userId: args.userId,
    title: args.title,
    description: args.description,
    status: "active", // New tasks start as active
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * READ - Get task by ID
 */
export async function getTaskById(ctx: QueryCtx, id: Id<"tasks">) {
  return await ctx.db.get(id);
}

/**
 * READ - Get all tasks for a user (sorted by creation time, newest first)
 */
export async function getTasksByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

/**
 * READ - Get tasks by user and status
 * Useful for filtering active vs completed tasks
 */
export async function getTasksByUserAndStatus(
  ctx: QueryCtx,
  userId: string,
  status: "active" | "completed"
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_and_status", (q) =>
      q.eq("userId", userId).eq("status", status)
    )
    .order("desc")
    .collect();
}

/**
 * READ - Count tasks by user and status
 * Used for dashboard statistics
 */
export async function countTasksByUserAndStatus(
  ctx: QueryCtx,
  userId: string,
  status: "active" | "completed"
) {
  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_user_and_status", (q) =>
      q.eq("userId", userId).eq("status", status)
    )
    .collect();

  return tasks.length;
}

/**
 * READ - Count all tasks by user
 */
export async function countTasksByUser(ctx: QueryCtx, userId: string) {
  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  return tasks.length;
}

/**
 * READ - Get recent tasks (for dashboard)
 * Returns the most recently created tasks for a user
 */
export async function getRecentTasksByUser(
  ctx: QueryCtx,
  userId: string,
  limit: number = 5
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
    .order("desc")
    .take(limit);
}

/**
 * UPDATE - Update task fields
 */
export async function updateTask(
  ctx: MutationCtx,
  id: Id<"tasks">,
  args: {
    title?: string;
    description?: string;
    status?: "active" | "completed";
  }
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

/**
 * UPDATE - Toggle task status between active and completed
 */
export async function toggleTaskStatus(ctx: MutationCtx, id: Id<"tasks">) {
  const task = await ctx.db.get(id);
  if (!task) {
    throw new Error("Task not found");
  }

  const newStatus = task.status === "active" ? "completed" : "active";

  return await ctx.db.patch(id, {
    status: newStatus,
    updatedAt: Date.now(),
  });
}

/**
 * DELETE - Remove a task
 */
export async function deleteTask(ctx: MutationCtx, id: Id<"tasks">) {
  return await ctx.db.delete(id);
}
