/**
 * Endpoint Layer: Dashboard
 *
 * Provides summary statistics and recent data for the dashboard view.
 * Aggregates data from multiple database operations.
 *
 * CRITICAL: NEVER uses ctx.db directly - only imports from ../db
 */

import { query } from "../_generated/server";
import { authComponent } from "../auth";
import * as Tasks from "../db/tasks";

/**
 * Dashboard Summary
 *
 * Returns aggregate statistics for the authenticated user:
 * - Total task count
 * - Active task count
 * - Completed task count
 * - Completion rate percentage
 */
export const summary = query({
  handler: async (ctx) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Fetch counts via database layer
    const totalTasks = await Tasks.countTasksByUser(ctx, authUser._id);
    const activeTasks = await Tasks.countTasksByUserAndStatus(
      ctx,
      authUser._id,
      "active"
    );
    const completedTasks = await Tasks.countTasksByUserAndStatus(
      ctx,
      authUser._id,
      "completed"
    );

    // Calculate completion rate
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      activeTasks,
      completedTasks,
      completionRate,
    };
  },
});

/**
 * Recent Tasks
 *
 * Returns the most recently created tasks for the authenticated user.
 * Used to populate the dashboard table view.
 *
 * @returns Array of up to 10 most recent tasks
 */
export const recent = query({
  handler: async (ctx) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Fetch recent tasks via database layer
    return await Tasks.getRecentTasksByUser(ctx, authUser._id, 10);
  },
});

/**
 * Task Statistics by Status
 *
 * Returns detailed breakdown of tasks by status.
 * Useful for charts and visualizations.
 */
export const tasksByStatus = query({
  handler: async (ctx) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Fetch counts via database layer
    const active = await Tasks.countTasksByUserAndStatus(
      ctx,
      authUser._id,
      "active"
    );
    const completed = await Tasks.countTasksByUserAndStatus(
      ctx,
      authUser._id,
      "completed"
    );

    return {
      active,
      completed,
    };
  },
});
