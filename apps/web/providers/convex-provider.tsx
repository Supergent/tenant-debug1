/**
 * Convex Provider
 *
 * Wraps the app with ConvexProviderWithAuth to integrate
 * Convex backend with Better Auth authentication.
 *
 * This provider:
 * - Manages Convex connection
 * - Handles authentication tokens
 * - Enables real-time subscriptions
 * - Provides useQuery, useMutation hooks
 */

"use client";

import { ConvexProviderWithAuth } from "@convex-dev/better-auth/react";
import { convex } from "@/lib/convex";
import { authClient } from "@/lib/auth-client";
import { ReactNode } from "react";

interface ConvexClientProviderProps {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return (
    <ConvexProviderWithAuth client={convex} authClient={authClient}>
      {children}
    </ConvexProviderWithAuth>
  );
}
