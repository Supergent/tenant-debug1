import { httpRouter } from "convex/server";
import { components } from "../_generated/api";
import { internal } from "./_generated/api";

/**
 * Stripe Webhook Handlers
 *
 * Process Stripe events securely with signature verification.
 * Handles subscription lifecycle events and payment confirmations.
 */

const http = httpRouter();

/**
 * Stripe webhook endpoint
 */
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    const body = await request.text();

    try {
      // Verify webhook signature
      const event = await verifyStripeWebhook(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      // Process event based on type
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutCompleted(ctx, event.data.object);
          break;

        case "customer.subscription.created":
          await handleSubscriptionCreated(ctx, event.data.object);
          break;

        case "customer.subscription.updated":
          await handleSubscriptionUpdated(ctx, event.data.object);
          break;

        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(ctx, event.data.object);
          break;

        case "invoice.paid":
          await handleInvoicePaid(ctx, event.data.object);
          break;

        case "invoice.payment_failed":
          await handleInvoicePaymentFailed(ctx, event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return new Response(
        JSON.stringify({ received: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400 }
      );
    }
  }
});

/**
 * Verify Stripe webhook signature
 */
async function verifyStripeWebhook(
  body: string,
  signature: string,
  secret: string
): Promise<any> {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  return stripe.webhooks.constructEvent(body, signature, secret);
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(ctx: any, session: any) {
  const userId = session.metadata.userId;

  if (session.mode === "subscription") {
    // Subscription checkout completed
    await ctx.runMutation(
      internal.subscriptions.activate,
      {
        userId,
        stripeSubscriptionId: session.subscription,
        stripeCustomerId: session.customer,
        status: "active"
      }
    );
  } else {
    // One-time payment completed
    await ctx.runMutation(
      internal.payments.markPaid,
      {
        sessionId: session.id,
        amount: session.amount_total,
        paidAt: Date.now()
      }
    );
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(ctx: any, subscription: any) {
  const userId = subscription.metadata.userId;

  await ctx.runMutation(
    internal.subscriptions.create,
    {
      userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodEnd: subscription.current_period_end * 1000,
      trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : null
    }
  );

  // Send welcome email if subscription is active
  if (subscription.status === "active") {
    await ctx.scheduler.runAfter(
      0,
      internal.email.send.sendWelcomeEmail,
      { userId }
    );
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(ctx: any, subscription: any) {
  await ctx.runMutation(
    internal.subscriptions.update,
    {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodEnd: subscription.current_period_end * 1000,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  );
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(ctx: any, subscription: any) {
  await ctx.runMutation(
    internal.subscriptions.delete,
    {
      stripeSubscriptionId: subscription.id,
      deletedAt: Date.now()
    }
  );

  // Downgrade user features
  const sub = await ctx.runQuery(
    internal.subscriptions.getByStripeId,
    { stripeSubscriptionId: subscription.id }
  );

  if (sub) {
    await ctx.runMutation(
      internal.users.downgradeFeatures,
      { userId: sub.userId }
    );
  }
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(ctx: any, invoice: any) {
  // Log successful payment
  await ctx.runMutation(
    internal.payments.createInvoiceRecord,
    {
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      status: "paid",
      paidAt: invoice.status_transitions.paid_at * 1000
    }
  );
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(ctx: any, invoice: any) {
  // Notify user of failed payment
  const subscription = await ctx.runQuery(
    internal.subscriptions.getByStripeId,
    { stripeSubscriptionId: invoice.subscription }
  );

  if (subscription) {
    await ctx.scheduler.runAfter(
      0,
      internal.notifications.create,
      {
        userId: subscription.userId,
        title: "Payment Failed",
        message: "Your recent payment failed. Please update your payment method.",
        type: "payment_failed"
      }
    );
  }
}

export default http;
