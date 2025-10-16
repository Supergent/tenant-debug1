import { action } from "./_generated/server";
import { components } from "../_generated/api";
import { v } from "convex/values";

/**
 * Stripe Checkout Functions
 *
 * Create and manage Stripe checkout sessions for payments and subscriptions.
 */

/**
 * Create a checkout session for one-time payment
 */
export const createPaymentCheckout = action({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
    metadata: v.optional(v.object({}))
  },
  handler: async (ctx, args) => {
    try {
      // Get user email
      const user = await ctx.runQuery(
        components.internal.users.get,
        { userId: args.userId }
      );

      if (!user) {
        throw new Error("User not found");
      }

      // Create Stripe checkout session
      const session = await ctx.runAction(
        components.autumn.createCheckoutSession,
        {
          mode: "payment",
          customerEmail: user.email,
          lineItems: [
            {
              price_data: {
                currency: "usd",
                unit_amount: args.amount,
                product_data: {
                  name: args.description
                }
              },
              quantity: 1
            }
          ],
          successUrl: args.successUrl,
          cancelUrl: args.cancelUrl,
          metadata: {
            userId: args.userId,
            ...(args.metadata || {})
          }
        }
      );

      // Store checkout session in database
      await ctx.runMutation(
        components.internal.payments.createCheckoutSession,
        {
          userId: args.userId,
          sessionId: session.id,
          amount: args.amount,
          status: "pending"
        }
      );

      return {
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url
      };
    } catch (error) {
      console.error("Failed to create payment checkout:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});

/**
 * Create a checkout session for subscription
 */
export const createSubscriptionCheckout = action({
  args: {
    userId: v.id("users"),
    priceId: v.string(),  // Stripe Price ID (e.g., price_1234...)
    successUrl: v.string(),
    cancelUrl: v.string(),
    trialDays: v.optional(v.number()),
    metadata: v.optional(v.object({}))
  },
  handler: async (ctx, args) => {
    try {
      // Get user
      const user = await ctx.runQuery(
        components.internal.users.get,
        { userId: args.userId }
      );

      if (!user) {
        throw new Error("User not found");
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await ctx.runAction(
          components.autumn.createCustomer,
          {
            email: user.email,
            name: user.name,
            metadata: {
              userId: args.userId
            }
          }
        );
        customerId = customer.id;

        // Store customer ID
        await ctx.runMutation(
          components.internal.users.updateStripeCustomer,
          {
            userId: args.userId,
            stripeCustomerId: customerId
          }
        );
      }

      // Build session config
      const sessionConfig: any = {
        mode: "subscription",
        customer: customerId,
        lineItems: [
          {
            price: args.priceId,
            quantity: 1
          }
        ],
        successUrl: args.successUrl,
        cancelUrl: args.cancelUrl,
        metadata: {
          userId: args.userId,
          ...(args.metadata || {})
        }
      };

      // Add trial if specified
      if (args.trialDays && args.trialDays > 0) {
        sessionConfig.subscription_data = {
          trial_period_days: args.trialDays
        };
      }

      // Create checkout session
      const session = await ctx.runAction(
        components.autumn.createCheckoutSession,
        sessionConfig
      );

      // Store checkout session
      await ctx.runMutation(
        components.internal.subscriptions.createCheckoutSession,
        {
          userId: args.userId,
          sessionId: session.id,
          priceId: args.priceId,
          status: "pending"
        }
      );

      return {
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url
      };
    } catch (error) {
      console.error("Failed to create subscription checkout:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});

/**
 * Get checkout session status
 */
export const getCheckoutStatus = action({
  args: {
    sessionId: v.string()
  },
  handler: async (ctx, args) => {
    try {
      const session = await ctx.runAction(
        components.autumn.retrieveSession,
        { sessionId: args.sessionId }
      );

      return {
        success: true,
        status: session.payment_status,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total
      };
    } catch (error) {
      console.error("Failed to get checkout status:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});
