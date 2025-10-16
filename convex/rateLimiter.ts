/**
 * Rate Limiter Configuration
 *
 * Configures rate limiting for API endpoints to prevent abuse.
 * Uses token bucket algorithm for smooth rate limiting with burst capacity.
 *
 * Token Bucket Algorithm:
 * - Allows bursts up to capacity
 * - Refills tokens over time at specified rate
 * - Good for user-facing operations
 */

import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  /**
   * Create Task - Allow 20 creates per minute with burst capacity of 5
   * Prevents spam while allowing normal usage bursts
   */
  createTask: {
    kind: "token bucket",
    rate: 20,
    period: MINUTE,
    capacity: 5,
  },

  /**
   * Update Task - Allow 50 updates per minute
   * Higher limit since users frequently toggle task status
   */
  updateTask: {
    kind: "token bucket",
    rate: 50,
    period: MINUTE,
    capacity: 10,
  },

  /**
   * Delete Task - Allow 30 deletes per minute
   * Moderate limit to prevent accidental bulk deletions
   */
  deleteTask: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 5,
  },

  /**
   * Sign Up - Strict limit to prevent abuse
   * Fixed window: hard limit per hour
   */
  signUp: {
    kind: "fixed window",
    rate: 5,
    period: HOUR,
  },
});
