# 🚀 Production Setup Guide

This guide will help you deploy your AI Chatbot SaaS to production using Vercel.

## 📋 Pre-Launch Checklist

### 1. Environment Variables Setup

#### Required Environment Variables
Create these in your Vercel dashboard under Settings > Environment Variables:

```env
# Database
DATABASE_URL=your_database_connection_string

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_secret_key_here
GOOGLE_ID=your_google_oauth_client_id
GOOGLE_SECRET=your_google_oauth_client_secret

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Payment Processing (LemonSqueezy)
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_SIGNING_SECRET=your_webhook_signing_secret

# AI Models (choose your preferred provider)
OPENAI_API_KEY=your_openai_api_key
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key
# OR
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
```

### 2. Database Setup

#### Option A: Vercel Postgres
1. Go to your Vercel dashboard
2. Navigate to Storage > Create Database > Postgres
3. Copy the connection string to `DATABASE_URL`

#### Option B: Neon.tech
1. Create account at neon.tech
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### 3. Email Service Setup (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add your domain for sending emails
4. Verify your domain
5. Set `RESEND_FROM_EMAIL` to an email using your verified domain

### 4. Authentication Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Secret to environment variables

### 5. Payment Processing Setup (LemonSqueezy)

1. Sign up at [lemonsqueezy.com](https://lemonsqueezy.com)
2. Create your store and products
3. Get API key from Settings > API
4. Set up webhook endpoint: `https://yourdomain.com/api/webhook`
5. Copy Store ID and Signing Secret to environment variables

### 6. Domain Setup

1. Add your custom domain in Vercel dashboard
2. Configure DNS records as instructed
3. SSL will be automatically provisioned
4. Update `NEXTAUTH_URL` to your custom domain

## 🔧 Database Migration

After setting up your database connection, you need to run migrations:

1. **Automatic**: Migrations run automatically during build (`pnpm build`)
2. **Manual**: Run `pnpm db:generate` then `pnpm db:migrate`

## 📧 Email Templates

The following emails are automatically sent:

- **Welcome Email**: Sent when users register
- **Password Reset**: Sent when users request password reset
- **Payment Confirmation**: Sent when payment is successful

## 🔒 Security Checklist

- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Environment variables secured
- [ ] Database connection encrypted
- [ ] Email service authenticated
- [ ] Payment webhooks verified
- [ ] OAuth providers configured correctly

## 📊 Monitoring Setup

Consider setting up:

1. **Error Tracking**: Sentry integration
2. **Analytics**: Vercel Analytics (already integrated)
3. **Performance**: Vercel Speed Insights
4. **Uptime**: External monitoring service

## 🚀 Deployment Steps

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Configure Build**: 
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`
3. **Set Environment Variables**: Add all required variables
4. **Deploy**: Push to main branch or deploy manually
5. **Test**: Verify all functionality works in production

## 🧪 Pre-Launch Testing

Test these critical flows:

- [ ] User registration with email confirmation
- [ ] Google OAuth login
- [ ] Password reset flow
- [ ] Payment processing
- [ ] Chat functionality
- [ ] Mobile responsiveness
- [ ] Email delivery

## 📋 Post-Launch Tasks

- [ ] Monitor error logs
- [ ] Check email delivery rates
- [ ] Monitor payment success rates
- [ ] Set up regular database backups
- [ ] Configure monitoring alerts
- [ ] Plan scaling strategy

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**: Check DATABASE_URL format
2. **Email Not Sending**: Verify Resend domain and API key
3. **OAuth Errors**: Check redirect URLs and credentials
4. **Payment Issues**: Verify LemonSqueezy webhook URL and signing secret

### Support Resources

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Next.js Documentation: [nextjs.org/docs](https://nextjs.org/docs)
- Resend Documentation: [resend.com/docs](https://resend.com/docs)
- LemonSqueezy Documentation: [docs.lemonsqueezy.com](https://docs.lemonsqueezy.com)

## 📞 Need Help?

If you encounter issues during setup, check the logs in:
- Vercel Functions tab for server errors
- Browser console for client errors
- Email service dashboard for delivery issues
- Payment provider dashboard for transaction issues