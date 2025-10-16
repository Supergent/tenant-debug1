/**
 * Email Templates
 *
 * Reusable HTML email templates with consistent branding.
 * All templates are responsive and tested across email clients.
 */

interface EmailTemplate {
  subject: string;
  html: string;
}

/**
 * Welcome email template
 */
export function welcomeEmail(data: {
  userName: string;
  dashboardUrl: string;
}): EmailTemplate {
  return {
    subject: `Welcome to Jn76W8Fswz9Hy73Pg5Zjc6G9Zx7Sj1M6!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #0066cc;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>Welcome to Jn76W8Fswz9Hy73Pg5Zjc6G9Zx7Sj1M6, ${data.userName}!</h1>

          <p>We're thrilled to have you on board. Your account is now set up and ready to go.</p>

          <p>Here's what you can do next:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Explore the dashboard</li>
            <li>Invite team members</li>
          </ul>

          <a href="${data.dashboardUrl}" class="button">Go to Dashboard</a>

          <div class="footer">
            <p>If you have any questions, just reply to this email—we're always happy to help.</p>
            <p>&copy; 2024 Jn76W8Fswz9Hy73Pg5Zjc6G9Zx7Sj1M6. All rights reserved.</p>
          </div>
        </body>
      </html>
    `
  };
}

/**
 * Password reset email template
 */
export function passwordResetEmail(data: {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}): EmailTemplate {
  return {
    subject: "Reset your password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #0066cc;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <h1>Reset your password</h1>

          <p>Hi ${data.userName},</p>

          <p>We received a request to reset your password. Click the button below to create a new password:</p>

          <a href="${data.resetUrl}" class="button">Reset Password</a>

          <div class="warning">
            <p><strong>This link expires in ${data.expiresIn}.</strong></p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>

          <p>For security reasons, this link can only be used once.</p>
        </body>
      </html>
    `
  };
}

/**
 * Notification digest email template
 */
export function notificationDigestEmail(data: {
  userName: string;
  notifications: Array<{ title: string; message: string; timestamp: number }>;
  dashboardUrl: string;
}): EmailTemplate {
  const notificationsList = data.notifications
    .map(n => `
      <div style="padding: 12px; margin: 8px 0; background-color: #f8f9fa; border-radius: 4px;">
        <strong>${n.title}</strong>
        <p style="margin: 4px 0; color: #666;">${n.message}</p>
        <small style="color: #999;">${new Date(n.timestamp).toLocaleString()}</small>
      </div>
    `)
    .join("");

  return {
    subject: `You have ${data.notifications.length} new notifications`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #0066cc;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <h1>Your Notification Digest</h1>

          <p>Hi ${data.userName},</p>

          <p>Here's what you missed:</p>

          ${notificationsList}

          <a href="${data.dashboardUrl}" class="button">View All Notifications</a>
        </body>
      </html>
    `
  };
}

/**
 * Transaction receipt email template
 */
export function transactionReceiptEmail(data: {
  userName: string;
  amount: number;
  description: string;
  transactionId: string;
  date: number;
}): EmailTemplate {
  return {
    subject: `Receipt for your ${(data.amount / 100).toFixed(2)} payment`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .receipt {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .receipt-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #dee2e6;
            }
            .total {
              font-size: 20px;
              font-weight: bold;
              margin-top: 12px;
            }
          </style>
        </head>
        <body>
          <h1>Payment Receipt</h1>

          <p>Hi ${data.userName},</p>

          <p>Thank you for your payment. Here are the details:</p>

          <div class="receipt">
            <div class="receipt-row">
              <span>Description</span>
              <strong>${data.description}</strong>
            </div>
            <div class="receipt-row">
              <span>Date</span>
              <span>${new Date(data.date).toLocaleDateString()}</span>
            </div>
            <div class="receipt-row">
              <span>Transaction ID</span>
              <span>${data.transactionId}</span>
            </div>
            <div class="receipt-row total">
              <span>Total</span>
              <span>$${(data.amount / 100).toFixed(2)}</span>
            </div>
          </div>

          <p>Keep this email for your records.</p>
        </body>
      </html>
    `
  };
}
