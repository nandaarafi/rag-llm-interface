import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Auth
    AUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url().transform(val => val.trim()),
    
    // Google OAuth
    GOOGLE_ID: z.string().min(1).transform(val => val.trim()),
    GOOGLE_SECRET: z.string().min(1).transform(val => val.trim()),
    
    // AI API
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).transform(val => val.trim()),
    OPENROUTER_API_KEY: z.string().optional().transform(val => val?.trim()),
    
    // Database
    DATABASE_URL: z.string().url().transform(val => val.trim()),
    
    // Email
    RESEND_API_KEY: z.string().min(1).transform(val => val.trim()),
    RESEND_FROM_EMAIL: z.string().min(1).transform(val => val.trim()).refine(val => val.includes('@'), 'Must be valid email format'),
    
    // Payments
    LEMONSQUEEZY_API_KEY: z.string().min(1).transform(val => val.trim()),
    LEMONSQUEEZY_STORE_ID: z.string().optional().transform(val => val?.trim()),
    LEMONSQUEEZY_VARIANT_ID: z.string().optional().transform(val => val?.trim()),
    LEMONSQUEEZY_SIGNING_SECRET: z.string().min(1).transform(val => val.trim()),
    
    // File uploads
    UPLOADTHING_TOKEN: z.string().min(1).transform(val => val.trim()),
    
    // Environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  client: {
    // Add client-side env vars here if needed
  },
  runtimeEnv: {
    // Server
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_ID: process.env.GOOGLE_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    LEMONSQUEEZY_API_KEY: process.env.LEMONSQUEEZY_API_KEY,
    LEMONSQUEEZY_STORE_ID: process.env.LEMONSQUEEZY_STORE_ID,
    LEMONSQUEEZY_VARIANT_ID: process.env.LEMONSQUEEZY_VARIANT_ID,
    LEMONSQUEEZY_SIGNING_SECRET: process.env.LEMONSQUEEZY_SIGNING_SECRET,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    
    // Client (none currently)
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});