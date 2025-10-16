import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { components } from "./_generated/api";
import { type DataModel } from "./_generated/dataModel";

/**
 * Better Auth Client for Convex
 *
 * Provides type-safe access to Better Auth operations within Convex functions.
 * Use `authComponent.getAuthUser(ctx)` to get the authenticated user.
 */
export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Better Auth Configuration
 *
 * Creates a Better Auth instance with Convex adapter.
 *
 * Features:
 * - Email/password authentication
 * - 30-day JWT tokens (no refresh needed during this period)
 * - No email verification (for simplicity)
 * - Convex database adapter for session storage
 *
 * @param ctx - Convex context (query, mutation, or action)
 * @param options - Optional configuration
 */
export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    baseURL: process.env.SITE_URL!,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Simple setup - no email verification
    },
    plugins: [
      convex({
        jwtExpirationSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  });
};
