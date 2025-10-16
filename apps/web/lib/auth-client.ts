/**
 * Better Auth Client
 *
 * Client-side authentication utilities for the Next.js app.
 * Uses Better Auth with Convex integration.
 *
 * Usage:
 * import { authClient } from "@/lib/auth-client";
 * const { signIn, signUp, signOut } = authClient;
 */

import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

/**
 * Better Auth client configuration
 *
 * Features:
 * - Email/password authentication
 * - Convex integration for session management
 * - Automatic token refresh
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  plugins: [
    // Convex integration - manages JWT tokens
    convexClient(),
  ],
});

/**
 * Export commonly used auth methods for convenience
 */
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
