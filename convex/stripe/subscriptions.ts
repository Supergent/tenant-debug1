import { action, query, mutation } from "./_generated/server";
import { components } from "../_generated/api";
import { v } from "convex/values";

/**
 * Subscription Management
 *
 * Handle subscription lifecycle: create, update, cancel, reactivate
 */

/**
 * Get user's current subscription
 */
export const getCurrentSubscription = query({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    if (!subscription) {
      return null;
    }

    return {
      id: subscription._id,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      status: subscription.status,
      plan: subscription.plan,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
      trialEnd: subscription.trialEnd
    };
  }
});

/**
 * Cancel subscription (at period end)
 */
export const cancelSubscription = action({
  args: {
    userId: v.id("users"),
    immediate: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    try {
      // Get current subscription
      const subscription = await ctx.runQuery(
        components.internal.subscriptions.getCurrent,
        { userId: args.userId }
      );

      if (!subscription || !subscription.stripeSubscriptionId) {
        return {
          success: false,
          error: "No active subscription found"
        };
      }

      // Cancel in Stripe
      const canceledSub = await ctx.runAction(
        components.autumn.cancelSubscription,
        {
          subscriptionId: subscription.stripeSubscriptionId,
          immediate: args.immediate || false
        }
      );

      // Update in database
      await ctx.runMutation(
        components.internal.subscriptions.markCanceled,
        {
          userId: args.userId,
          cancelAtPeriodEnd: !args.immediate,
          canceledAt: Date.now()
        }
      );

      return {
        success: true,
        canceledAt: args.immediate ? "immediately" : "at period end",
        periodEnd: subscription.currentPeriodEnd
      };
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});

/**
 * Reactivate a canceled subscription
 */
export const reactivateSubscription = action({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    try {
      // Get subscription
      const subscription = await ctx.runQuery(
        components.internal.subscriptions.getCurrent,
        { userId: args.userId }
      );

      if (!subscription || !subscription.stripeSubscriptionId) {
        return {
          success: false,
          error: "No subscription found"
        };
      }

      if (!subscription.cancelAtPeriodEnd) {
        return {
          success: false,
          error: "Subscription is not scheduled for cancellation"
        };
      }

      // Reactivate in Stripe
      await ctx.runAction(
        components.autumn.updateSubscription,
        {
          subscriptionId: subscription.stripeSubscriptionId,
          cancelAtPeriodEnd: false
        }
      );

      // Update database
      await ctx.runMutation(
        components.internal.subscriptions.reactivate,
        { userId: args.userId }
      );

      return {
        success: true,
        message: "Subscription reactivated"
      };
    } catch (error) {
      console.error("Failed to reactivate subscription:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});

/**
 * Update subscription plan
 */
export const updateSubscriptionPlan = action({
  args: {
    userId: v.id("users"),
    newPriceId: v.string(),
    prorationBehavior: v.optional(v.union(
      v.literal("create_prorations"),
      v.literal("none"),
      v.literal("always_invoice")
    ))
  },
  handler: async (ctx, args) => {
    try {
      // Get current subscription
      const subscription = await ctx.runQuery(
        components.internal.subscriptions.getCurrent,
        { userId: args.userId }
      );

      if (!subscription || !subscription.stripeSubscriptionId) {
        return {
          success: false,
          error: "No active subscription found"
        };
      }

      // Update in Stripe
      const updatedSub = await ctx.runAction(
        components.autumn.updateSubscription,
        {
          subscriptionId: subscription.stripeSubscriptionId,
          priceId: args.newPriceId,
          prorationBehavior: args.prorationBehavior || "create_prorations"
        }
      );

      // Update database
      await ctx.runMutation(
        components.internal.subscriptions.updatePlan,
        {
          userId: args.userId,
          priceId: args.newPriceId,
          updatedAt: Date.now()
        }
      );

      return {
        success: true,
        message: "Subscription plan updated"
      };
    } catch (error) {
      console.error("Failed to update subscription plan:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});

/**
 * Get subscription billing history
 */
export const getBillingHistory = action({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    try {
      // Get user's Stripe customer ID
      const user = await ctx.runQuery(
        components.internal.users.get,
        { userId: args.userId }
      );

      if (!user || !user.stripeCustomerId) {
        return {
          success: true,
          invoices: []
        };
      }

      // Get invoices from Stripe
      const invoices = await ctx.runAction(
        components.autumn.listInvoices,
        {
          customerId: user.stripeCustomerId,
          limit: args.limit || 10
        }
      );

      return {
        success: true,
        invoices: invoices.data.map((inv: any) => ({
          id: inv.id,
          amount: inv.amount_paid,
          currency: inv.currency,
          status: inv.status,
          date: inv.created * 1000,
          pdfUrl: inv.invoice_pdf
        }))
      };
    } catch (error) {
      console.error("Failed to get billing history:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});
