import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com";

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string | string[];
}) => {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    text,
    html,
    ...(replyTo && { replyTo }),
  });

  if (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }

  return data;
};

// Email Templates
export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  const text = `
    Reset Your Password
    
    You requested a password reset. Use this link to reset your password:
    ${resetUrl}
    
    This link will expire in 1 hour.
    If you didn't request this, please ignore this email.
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password",
    html,
    text,
  });
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #333; text-align: center;">Welcome to AI Chatbot!</h1>
      <p>Hi ${name},</p>
      <p>Welcome to our AI Chatbot platform! We're excited to have you on board.</p>
      <p>You can start chatting right away by visiting your dashboard.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Chatting</a>
      </div>
      <p>Best regards,<br>The AI Chatbot Team</p>
    </div>
  `;

  const text = `
    Welcome to AI Chatbot!
    
    Hi ${name},
    
    Welcome to our AI Chatbot platform! We're excited to have you on board.
    
    You can start chatting right away by visiting: ${process.env.NEXTAUTH_URL}
    
    Best regards,
    The AI Chatbot Team
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to AI Chatbot!",
    html,
    text,
  });
};

export const sendPaymentConfirmationEmail = async (email: string, name: string, amount: string) => {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #333; text-align: center;">Payment Confirmed!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for your payment of ${amount}. Your account has been upgraded and you now have full access to all features.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Your Account</a>
      </div>
      <p>Best regards,<br>The AI Chatbot Team</p>
    </div>
  `;

  const text = `
    Payment Confirmed!
    
    Hi ${name},
    
    Thank you for your payment of ${amount}. Your account has been upgraded and you now have full access to all features.
    
    Visit: ${process.env.NEXTAUTH_URL}
    
    Best regards,
    The AI Chatbot Team
  `;

  return sendEmail({
    to: email,
    subject: "Payment Confirmed - Welcome to Premium!",
    html,
    text,
  });
};
