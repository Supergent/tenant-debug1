import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { createAuth } from "./auth";

/**
 * HTTP Router for Better Auth
 *
 * Handles all authentication-related HTTP requests:
 * - POST /auth/sign-up - Create new account
 * - POST /auth/sign-in - Login
 * - POST /auth/sign-out - Logout
 * - GET /auth/session - Get current session
 * - And other Better Auth endpoints
 *
 * The httpAction() wrapper provides proper TypeScript types for ctx and request.
 */
const http = httpRouter();

// Better Auth POST routes (sign-up, sign-in, sign-out, etc.)
http.route({
  path: "/auth/*",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx);
    return await auth.handler(request);
  }),
});

// Better Auth GET routes (session, user info, etc.)
http.route({
  path: "/auth/*",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx);
    return await auth.handler(request);
  }),
});

export default http;
