"use client";

import * as React from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "@convex-dev/better-auth/react";
import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { ToastProvider } from "./toast";

// Convex client setup
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Better Auth client setup
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  plugins: [convexClient()],
});

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <>{children}</>;
};

export const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ConvexProviderWithAuth client={convex} authClient={authClient}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </ConvexProviderWithAuth>
  );
};
