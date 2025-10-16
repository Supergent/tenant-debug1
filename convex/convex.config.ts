import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp();

// Better Auth MUST be first
app.use(betterAuth);

// Rate Limiter for production API protection
app.use(rateLimiter);

export default app;
