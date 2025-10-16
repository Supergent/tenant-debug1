import { action } from "./_generated/server";
import { components } from "../_generated/api";
import { v } from "convex/values";
import {
  welcomeEmail,
  passwordResetEmail,
  notificationDigestEmail,
  transactionReceiptEmail
} from "./templates";

/**
 * Email Sending Functions
 *
 * Convenient wrappers around Resend component for common email types.
 * All emails are sent asynchronously and include error handling.
 */

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = action({
  args: {
    to: v.string(),
    userName: v.string(),
    dashboardUrl: v.string()
  },
  handler: async (ctx, args) => {
    const { subject, html } = welcomeEmail({
      userName: args.userName,
      dashboardUrl: args.dashboardUrl
    });

    try {
      const result = await ctx.runAction(
        components.resend.send,
        {
          to: args.to,
          subject,
          html,
          from: process.env.EMAIL_FROM || "noreply@example.com"
        }
      );

      return {
        success: true,
        messageId: result.id
      };
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = action({
  args: {
    to: v.string(),
    userName: v.string(),
    resetUrl: v.string(),
    expiresIn: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { subject, html } = passwordResetEmail({
      userName: args.userName,
      resetUrl: args.resetUrl,
      expiresIn: args.expiresIn || "1 hour"
    });

    try {
      const result = await ctx.runAction(
        components.resend.send,
        {
          to: args.to,
          subject,
          html,
          from: process.env.EMAIL_FROM || "noreply@example.com"
        }
      );

      return {
        success: true,
        messageId: result.id
      };
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});

/**
 * Send notification digest
 */
export const sendNotificationDigest = action({
  args: {
    to: v.string(),
    userName: v.string(),
    notifications: v.array(v.object({
      title: v.string(),
      message: v.string(),
      timestamp: v.number()
    })),
    dashboardUrl: v.string()
  },
  handler: async (ctx, args) => {
    if (args.notifications.length === 0) {
      return { success: false, error: "No notifications to send" };
    }

    const { subject, html } = notificationDigestEmail({
      userName: args.userName,
      notifications: args.notifications,
      dashboardUrl: args.dashboardUrl
    });

    try {
      const result = await ctx.runAction(
        components.resend.send,
        {
          to: args.to,
          subject,
          html,
          from: process.env.EMAIL_FROM || "noreply@example.com"
        }
      );

      return {
        success: true,
        messageId: result.id,
        notificationCount: args.notifications.length
      };
    } catch (error) {
      console.error("Failed to send notification digest:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});

/**
 * Send transaction receipt
 */
export const sendTransactionReceipt = action({
  args: {
    to: v.string(),
    userName: v.string(),
    amount: v.number(),
    description: v.string(),
    transactionId: v.string()
  },
  handler: async (ctx, args) => {
    const { subject, html } = transactionReceiptEmail({
      userName: args.userName,
      amount: args.amount,
      description: args.description,
      transactionId: args.transactionId,
      date: Date.now()
    });

    try {
      const result = await ctx.runAction(
        components.resend.send,
        {
          to: args.to,
          subject,
          html,
          from: process.env.EMAIL_FROM || "noreply@example.com"
        }
      );

      return {
        success: true,
        messageId: result.id
      };
    } catch (error) {
      console.error("Failed to send transaction receipt:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});

/**
 * Send custom email (for one-off emails)
 */
export const sendCustomEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    from: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    try {
      const result = await ctx.runAction(
        components.resend.send,
        {
          to: args.to,
          subject: args.subject,
          html: args.html,
          from: args.from || process.env.EMAIL_FROM || "noreply@example.com"
        }
      );

      return {
        success: true,
        messageId: result.id
      };
    } catch (error) {
      console.error("Failed to send custom email:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});
