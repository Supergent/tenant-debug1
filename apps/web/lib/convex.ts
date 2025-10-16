/**
 * Convex Client
 *
 * Client-side Convex connection for the Next.js app.
 * This client is used with ConvexProviderWithAuth.
 *
 * Usage:
 * import { convex } from "@/lib/convex";
 */

import { ConvexReactClient } from "convex/react";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error(
    "Missing NEXT_PUBLIC_CONVEX_URL environment variable. " +
    "Run 'npx convex dev' to get your Convex URL."
  );
}

/**
 * Convex client instance
 *
 * Connects to your Convex backend.
 * Integrated with Better Auth for authentication.
 */
export const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL
);
