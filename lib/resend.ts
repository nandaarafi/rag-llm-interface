import { Resend } from "resend";

// DEVELOPER CONTROL: Set to false to disable email sending and Google OAuth
export const DEV_ENABLE_EXTERNAL_SERVICES = true;

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Email Configuration
export const emailConfig = {
  // For automated emails (login links, password resets, etc.)
  fromNoReply: process.env.RESEND_FROM_NOREPLY || "Mindscribe <noreply@resend.mindscribe.xyz>",
  
  // For admin notifications, updates, announcements
  fromAdmin: process.env.RESEND_FROM_ADMIN || "Team at Mindscribe <team@resend.mindscribe.xyz>",
  
  // Support email for customer inquiries
  supportEmail: process.env.RESEND_SUPPORT_EMAIL || "support@mindscribe.xyz",
  
  // Reply-to email for customer responses
  replyTo: process.env.RESEND_REPLY_TO || "hello@resend.mindscribe.xyz",
};

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  replyTo,
  from,
}: {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string | string[];
  from?: string;
}) => {
  // Developer control: Skip sending emails if disabled
  if (!DEV_ENABLE_EXTERNAL_SERVICES) {
    console.log(`[DEV MODE] Email sending disabled. Would have sent: ${subject} to ${to}`);
    return { id: 'dev-mode-skip' };
  }

  const { data, error } = await resend.emails.send({
    from: from || emailConfig.fromNoReply,
    to,
    subject,
    text,
    html,
    replyTo: replyTo || emailConfig.replyTo,
  });

  if (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }

  return data;
};

// Enhanced Email Templates
export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
        <h1 style="color: #333; margin: 0;">Mindscribe</h1>
      </div>
      
      <div style="padding: 30px 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
        <p style="color: #555; margin-bottom: 20px;">
          You requested a password reset for your Mindscribe account. Click the button below to create a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #007cba; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
          This link will expire in 1 hour for security reasons.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this reset, please ignore this email or contact our support team if you have concerns.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; background-color: #f9f9f9;">
        <p style="color: #666; font-size: 12px; margin: 0;">
          Need help? Contact us at <a href="mailto:${emailConfig.supportEmail}" style="color: #007cba;">${emailConfig.supportEmail}</a>
        </p>
      </div>
    </div>
  `;

  const text = `
    Mindscribe - Reset Your Password
    
    You requested a password reset for your Mindscribe account.
    
    Reset your password: ${resetUrl}
    
    This link will expire in 1 hour for security reasons.
    
    If you didn't request this reset, please ignore this email.
    
    Need help? Contact us at ${emailConfig.supportEmail}
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password - Mindscribe",
    html,
    text,
    from: emailConfig.fromNoReply,
  });
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
        <h1 style="color: #333; margin: 0;">Mindscribe</h1>
      </div>
      
      <div style="padding: 30px 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">Welcome to Mindscribe, ${name}! 🎉</h2>
        
        <p style="color: #555; margin-bottom: 20px;">
          We're thrilled to have you join our community! Mindscribe is here to help you unlock your potential with AI-powered assistance.
        </p>
        
        <p style="color: #555; margin-bottom: 25px;">
          Here's what you can do next:
        </p>
        
        <ul style="color: #555; margin-bottom: 25px; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Complete your profile setup</li>
          <li style="margin-bottom: 8px;">Start your first AI conversation</li>
          <li style="margin-bottom: 8px;">Explore our features and tools</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}" 
             style="background-color: #28a745; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Get Started
          </a>
        </div>
        
        <p style="color: #555;">
          If you have any questions, don't hesitate to reach out to our support team.
        </p>
        
        <p style="color: #555; margin-top: 25px;">
          Best regards,<br>
          The Mindscribe Team
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; background-color: #f9f9f9;">
        <p style="color: #666; font-size: 12px; margin: 0;">
          Questions? We're here to help at <a href="mailto:${emailConfig.supportEmail}" style="color: #007cba;">${emailConfig.supportEmail}</a>
        </p>
      </div>
    </div>
  `;

  const text = `
    Welcome to Mindscribe, ${name}!
    
    We're thrilled to have you join our community! Mindscribe is here to help you unlock your potential with AI-powered assistance.
    
    Here's what you can do next:
    • Complete your profile setup
    • Start your first AI conversation  
    • Explore our features and tools
    
    Get started: ${process.env.NEXTAUTH_URL}
    
    If you have any questions, don't hesitate to reach out to our support team at ${emailConfig.supportEmail}
    
    Best regards,
    The Mindscribe Team
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to Mindscribe! Let's get started 🚀",
    html,
    text,
    from: emailConfig.fromAdmin, // Using admin email for welcome
  });
};

export const sendPaymentConfirmationEmail = async (email: string, name: string, amount: string, plan: string = "Premium") => {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
        <h1 style="color: #333; margin: 0;">Mindscribe</h1>
      </div>
      
      <div style="padding: 30px 20px;">
        <h2 style="color: #28a745; margin-bottom: 20px;">Payment Confirmed! 🎉</h2>
        
        <p style="color: #555; margin-bottom: 20px;">Hi ${name},</p>
        
        <p style="color: #555; margin-bottom: 25px;">
          Thank you for upgrading to <strong>${plan}</strong>! Your payment of <strong>${amount}</strong> has been successfully processed.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <h3 style="color: #333; margin-top: 0;">What's unlocked:</h3>
          <ul style="color: #555; margin-bottom: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Unlimited AI conversations</li>
            <li style="margin-bottom: 8px;">Priority support</li>
            <li style="margin-bottom: 8px;">Advanced features</li>
            <li style="margin-bottom: 8px;">Export capabilities</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}" 
             style="background-color: #007cba; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Access Your Account
          </a>
        </div>
        
        <p style="color: #555;">
          Your upgraded features are now active and ready to use!
        </p>
        
        <p style="color: #555; margin-top: 25px;">
          Best regards,<br>
          The Mindscribe Team
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; background-color: #f9f9f9;">
        <p style="color: #666; font-size: 12px; margin: 0;">
          Need help? Contact us at <a href="mailto:${emailConfig.supportEmail}" style="color: #007cba;">${emailConfig.supportEmail}</a>
        </p>
      </div>
    </div>
  `;

  const text = `
    Mindscribe - Payment Confirmed!
    
    Hi ${name},
    
    Thank you for upgrading to ${plan}! Your payment of ${amount} has been successfully processed.
    
    What's unlocked:
    • Unlimited AI conversations
    • Priority support  
    • Advanced features
    • Export capabilities
    
    Access your account: ${process.env.NEXTAUTH_URL}
    
    Your upgraded features are now active and ready to use!
    
    Need help? Contact us at ${emailConfig.supportEmail}
    
    Best regards,
    The Mindscribe Team
  `;

  return sendEmail({
    to: email,
    subject: "Payment Confirmed - Welcome to Premium! 🚀",
    html,
    text,
    from: emailConfig.fromAdmin,
  });
};

// Admin notification emails
export const sendNewUserNotification = async (userEmail: string, userName: string) => {
  return sendEmail({
    to: emailConfig.supportEmail,
    subject: "New User Registration - Mindscribe",
    html: `
      <h2>New User Registered</h2>
      <p><strong>Name:</strong> ${userName}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `,
    text: `
      New User Registered
      
      Name: ${userName}
      Email: ${userEmail}
      Time: ${new Date().toLocaleString()}
    `,
    from: emailConfig.fromAdmin,
  });
};

export const sendEmailVerificationEmail = async (email: string, verificationToken: string) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
        <h1 style="color: #333; margin: 0;">Mindscribe</h1>
      </div>
      
      <div style="padding: 30px 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
        <p style="color: #555; margin-bottom: 20px;">
          Thank you for signing up for Mindscribe! To complete your registration and start using your account, please verify your email address by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #007cba; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
          This link will expire in 24 hours for security reasons.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't create an account with us, please ignore this email or contact our support team if you have concerns.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; background-color: #f9f9f9;">
        <p style="color: #666; font-size: 12px; margin: 0;">
          Need help? Contact us at <a href="mailto:${emailConfig.supportEmail}" style="color: #007cba;">${emailConfig.supportEmail}</a>
        </p>
      </div>
    </div>
  `;

  const text = `
    Mindscribe - Verify Your Email Address
    
    Thank you for signing up for Mindscribe! To complete your registration and start using your account, please verify your email address.
    
    Verify your email: ${verificationUrl}
    
    This link will expire in 24 hours for security reasons.
    
    If you didn't create an account with us, please ignore this email.
    
    Need help? Contact us at ${emailConfig.supportEmail}
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your Email Address - Mindscribe",
    html,
    text,
    from: emailConfig.fromNoReply,
  });
};

export const sendContactFormEmail = async (name: string, email: string, message: string) => {
  return sendEmail({
    to: emailConfig.supportEmail,
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${message.replace(/\n/g, '<br>')}
      </div>
    `,
    text: `
      New Contact Form Submission
      
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `,
    from: emailConfig.fromNoReply,
    replyTo: email, // Allow direct reply to the user
  });
};