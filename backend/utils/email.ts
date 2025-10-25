/**
 * Email Helper Functions
 * Handles sending emails using various providers
 */

import nodemailer from 'nodemailer';
import { User } from '../models/User';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter(EMAIL_CONFIG);
};

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Send email using nodemailer
 */
export const sendEmail = async (options: EmailOptions) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"GameTradeX" <${EMAIL_CONFIG.auth.user}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${result.messageId} to ${options.to}`);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (user: any) => {
  const emailOptions: EmailOptions = {
    to: user.email,
    subject: 'Welcome to GameTradeX!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Welcome to GameTradeX!</h1>
        <p>Hi ${user.username},</p>
        <p>Welcome to GameTradeX! Your account has been successfully created.</p>
        <p>You can now start buying and selling gaming accounts safely.</p>
        <div style="margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Go to Dashboard
          </a>
        </div>
        <p>Best regards,<br>The GameTradeX Team</p>
      </div>
    `
  };

  return sendEmail(emailOptions);
};

/**
 * Send email verification email
 */
export const sendVerificationEmail = async (user: any, verificationToken: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const emailOptions: EmailOptions = {
    to: user.email,
    subject: 'Verify your GameTradeX account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Verify your email address</h1>
        <p>Hi ${user.username},</p>
        <p>Please click the button below to verify your email address:</p>
        <div style="margin: 20px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>Best regards,<br>The GameTradeX Team</p>
      </div>
    `
  };

  return sendEmail(emailOptions);
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user: any, resetToken: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const emailOptions: EmailOptions = {
    to: user.email,
    subject: 'Reset your GameTradeX password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Password Reset Request</h1>
        <p>Hi ${user.username},</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <div style="margin: 20px 0;">
          <a href="${resetUrl}" 
             style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>The GameTradeX Team</p>
      </div>
    `
  };

  return sendEmail(emailOptions);
};

/**
 * Send listing notification email
 */
export const sendListingNotificationEmail = async (
  user: any,
  listingTitle: string,
  action: 'approved' | 'rejected' | 'updated',
  listingUrl: string
) => {
  const emailOptions: EmailOptions = {
    to: user.email,
    subject: `Your listing "${listingTitle}" has been ${action}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Listing ${action.charAt(0).toUpperCase() + action.slice(1)}</h1>
        <p>Hi ${user.username},</p>
        <p>Your listing "${listingTitle}" has been ${action} by our admin team.</p>
        <div style="margin: 20px 0;">
          <a href="${listingUrl}" 
             style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Listing
          </a>
        </div>
        <p>Best regards,<br>The GameTradeX Team</p>
      </div>
    `
  };

  return sendEmail(emailOptions);
};

/**
 * Send escrow notification email
 */
export const sendEscrowNotificationEmail = async (
  user: any,
  escrowId: string,
  action: 'created' | 'funded' | 'released' | 'disputed',
  amount: number,
  escrowUrl: string
) => {
  const emailOptions: EmailOptions = {
    to: user.email,
    subject: `Escrow ${action.charAt(0).toUpperCase() + action.slice(1)} - $${amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Escrow ${action.charAt(0).toUpperCase() + action.slice(1)}</h1>
        <p>Hi ${user.username},</p>
        <p>An escrow transaction for $${amount} has been ${action}.</p>
        <div style="margin: 20px 0;">
          <a href="${escrowUrl}" 
             style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Escrow
          </a>
        </div>
        <p>Best regards,<br>The GameTradeX Team</p>
      </div>
    `
  };

  return sendEmail(emailOptions);
};

/**
 * Send security alert email
 */
export const sendSecurityAlertEmail = async (
  user: any,
  securityEvent: string,
  details: string
) => {
  const emailOptions: EmailOptions = {
    to: user.email,
    subject: `Security Alert: ${securityEvent}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Security Alert</h1>
        <p>Hi ${user.username},</p>
        <p>We detected a security event on your account:</p>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Event:</strong> ${securityEvent}<br>
          <strong>Details:</strong> ${details}
        </div>
        <p>If this wasn't you, please secure your account immediately.</p>
        <div style="margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/security" 
             style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Secure Account
          </a>
        </div>
        <p>Best regards,<br>The GameTradeX Security Team</p>
      </div>
    `
  };

  return sendEmail(emailOptions);
};

/**
 * Send bulk email to multiple users
 */
export const sendBulkEmail = async (
  users: any[],
  subject: string,
  html: string,
  text?: string
) => {
  const emailOptions: EmailOptions = {
    to: users.map(user => user.email),
    subject,
    html,
    text
  };

  return sendEmail(emailOptions);
};

/**
 * Test email configuration
 */
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration is invalid:', error);
    return false;
  }
};
