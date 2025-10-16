/**
 * Endpoint Layer: Tasks
 *
 * Business logic for task management operations.
 * Composes database operations from the db layer.
 * Handles authentication, authorization, validation, and rate limiting.
 *
 * CRITICAL: NEVER uses ctx.db directly - only imports from ../db
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import * as Tasks from "../db/tasks";
import {
  isValidTaskTitle,
  isValidTaskDescription,
  sanitizeString,
  ValidationErrors,
} from "../helpers/validation";

/**
 * Create a new task
 *
 * Rate limited: 20 per minute with burst capacity of 5
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication - get authenticated user
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting - prevent spam
    const rateLimitStatus = await rateLimiter.limit(ctx, "createTask", {
      key: authUser._id,
    });

    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(
          rateLimitStatus.retryAfter / 1000
        )} seconds.`
      );
    }

    // 3. Input validation and sanitization
    const sanitizedTitle = sanitizeString(args.title, 200);
    const sanitizedDescription = args.description
      ? sanitizeString(args.description, 2000)
      : undefined;

    if (!isValidTaskTitle(sanitizedTitle)) {
      if (sanitizedTitle.trim().length === 0) {
        throw new Error(ValidationErrors.TASK_TITLE_EMPTY);
      }
      throw new Error(ValidationErrors.TASK_TITLE_TOO_LONG);
    }

    if (!isValidTaskDescription(sanitizedDescription)) {
      throw new Error(ValidationErrors.TASK_DESCRIPTION_TOO_LONG);
    }

    // 4. Business logic - create task via database layer
    return await Tasks.createTask(ctx, {
      userId: authUser._id,
      title: sanitizedTitle,
      description: sanitizedDescription,
    });
  },
});

/**
 * List all tasks for the authenticated user
 *
 * Returns tasks sorted by creation time (newest first)
 */
export const list = query({
  handler: async (ctx) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Fetch all user's tasks via database layer
    return await Tasks.getTasksByUser(ctx, authUser._id);
  },
});

/**
 * List tasks filtered by status
 *
 * @param status - "active" or "completed"
 */
export const listByStatus = query({
  args: {
    status: v.union(v.literal("active"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Fetch filtered tasks via database layer
    return await Tasks.getTasksByUserAndStatus(ctx, authUser._id, args.status);
  },
});

/**
 * Get a single task by ID
 */
export const get = query({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Fetch task via database layer
    const task = await Tasks.getTaskById(ctx, args.id);

    if (!task) {
      throw new Error("Task not found");
    }

    // Authorization - verify ownership
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to view this task");
    }

    return task;
  },
});

/**
 * Update a task
 *
 * Rate limited: 50 per minute with burst capacity of 10
 */
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "updateTask", {
      key: authUser._id,
    });

    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(
          rateLimitStatus.retryAfter / 1000
        )} seconds.`
      );
    }

    // 3. Fetch task and verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to update this task");
    }

    // 4. Validation and sanitization
    const updateData: {
      title?: string;
      description?: string;
      status?: "active" | "completed";
    } = {};

    if (args.title !== undefined) {
      const sanitizedTitle = sanitizeString(args.title, 200);
      if (!isValidTaskTitle(sanitizedTitle)) {
        if (sanitizedTitle.trim().length === 0) {
          throw new Error(ValidationErrors.TASK_TITLE_EMPTY);
        }
        throw new Error(ValidationErrors.TASK_TITLE_TOO_LONG);
      }
      updateData.title = sanitizedTitle;
    }

    if (args.description !== undefined) {
      const sanitizedDescription = sanitizeString(args.description, 2000);
      if (!isValidTaskDescription(sanitizedDescription)) {
        throw new Error(ValidationErrors.TASK_DESCRIPTION_TOO_LONG);
      }
      updateData.description = sanitizedDescription;
    }

    if (args.status !== undefined) {
      updateData.status = args.status;
    }

    // 5. Update via database layer
    return await Tasks.updateTask(ctx, args.id, updateData);
  },
});

/**
 * Toggle task status between active and completed
 *
 * Convenience method for the common case of marking tasks done/undone.
 * Rate limited: 50 per minute with burst capacity of 10
 */
export const toggleStatus = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "updateTask", {
      key: authUser._id,
    });

    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(
          rateLimitStatus.retryAfter / 1000
        )} seconds.`
      );
    }

    // 3. Fetch task and verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to update this task");
    }

    // 4. Toggle status via database layer
    return await Tasks.toggleTaskStatus(ctx, args.id);
  },
});

/**
 * Delete a task
 *
 * Rate limited: 30 per minute with burst capacity of 5
 */
export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "deleteTask", {
      key: authUser._id,
    });

    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(
          rateLimitStatus.retryAfter / 1000
        )} seconds.`
      );
    }

    // 3. Fetch task and verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to delete this task");
    }

    // 4. Delete via database layer
    return await Tasks.deleteTask(ctx, args.id);
  },
});
