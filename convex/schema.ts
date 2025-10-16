import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Database Schema for Simple Todo App
 *
 * Architecture: Four-layer Convex pattern
 * - Database layer: convex/db/*.ts (CRUD operations)
 * - Endpoint layer: convex/endpoints/*.ts (business logic)
 * - Helper layer: convex/helpers/*.ts (utilities)
 *
 * All tables are user-scoped with proper indexing for performance.
 */

export default defineSchema({
  /**
   * Tasks Table
   *
   * Core entity for todo items. Each task belongs to a user and has
   * a completion status. Real-time updates via Convex subscriptions.
   */
  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("completed")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    // Primary index: Get all tasks for a user
    .index("by_user", ["userId"])
    // Common query: Get tasks by user and status (active/completed)
    .index("by_user_and_status", ["userId", "status"])
    // Sort by creation time for chronological ordering
    .index("by_user_and_created", ["userId", "createdAt"]),
});
