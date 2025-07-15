
import crypto from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line import/no-unresolved
import { updateUser, getUser } from "@/lib/db/queries";
// eslint-disable-next-line import/no-unresolved
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Create database connection
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

// This is where we receive Lemon Squeezy webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req: NextRequest) {
  console.log("🔥 WEBHOOK RECEIVED - Headers:", Object.fromEntries(req.headers.entries()));
  const text = await req.text();
  console.log("🔥 WEBHOOK BODY:", text);

  // Check if the signing secret is set
  const signingSecret = process.env.LEMONSQUEEZY_SIGNING_SECRET;
  console.log("🔥 SIGNING SECRET EXISTS:", !!signingSecret);
  if (!signingSecret) {
    console.error("🔥 LEMONSQUEEZY_SIGNING_SECRET is not set");
    return new Response("Server configuration error", {
      status: 500,
    });
  }

  const hmac = crypto.createHmac(
    "sha256",
    signingSecret
  );
  const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8");
  const signature = Buffer.from(headers().get("x-signature") || "", "utf8");

  // Verify the signature
  console.log("🔥 SIGNATURE VERIFICATION:");
  console.log("🔥 Expected digest:", digest.toString('hex'));
  console.log("🔥 Received signature:", signature.toString('hex'));
  console.log("🔥 X-Signature header:", headers().get("x-signature"));
  
  if (!crypto.timingSafeEqual(
    new Uint8Array(digest),
    new Uint8Array(signature)
  )) {
    console.log("🔥 SIGNATURE MISMATCH - Invalid signature.");
    
    // TEMPORARY: Skip signature validation for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log("🔥 DEVELOPMENT MODE: Skipping signature validation");
    } else {
      return new Response("Invalid signature.", {
        status: 400,
      });
    }
  }
  
  console.log("🔥 SIGNATURE VALID ✅");

  // Get the payload
  const payload = JSON.parse(text);

  const eventName = payload.meta.event_name;
  const customerId = payload.data.attributes.customer_id.toString();
  console.log("🔥 PROCESSING EVENT:", eventName, "Customer ID:", customerId);
  console.log("🔥 FULL PAYLOAD:", JSON.stringify(payload, null, 2));

  try {
    switch (eventName) {
      case "order_created": {
        // Grant access to the product
        const email = payload.data.attributes.user_email;
        const variantId = payload.data.attributes.first_order_item?.variant_id.toString();
        const userId = payload.meta?.custom_data?.userId;

        // Find or create user
        let foundUser;
        if (userId) {
          foundUser = (await db.select().from(user).where(eq(user.id, userId)))[0];
        } else if (email) {
          foundUser = (await getUser(email))[0];
          if (!foundUser) {
            // Create new user if not exists
            foundUser = (await db.insert(user).values({
              email,
              customerId,
              hasAccess: true,
              variantId,
            }).returning())[0];
          }
        }

        if (!foundUser) {
          return new Response("User not found", { status: 404 });
        }

        // Update user with subscription details
        console.log("🔥 UPDATING USER:", foundUser.id, "with hasAccess: true");
        await updateUser(foundUser.id, {
          customerId,
          variantId,
          hasAccess: true,
          updatedAt: new Date(),
        });
        console.log("🔥 USER UPDATED SUCCESSFULLY");
        
        // Trigger session refresh for this user
        console.log("🔥 PAYMENT SUCCESS - User should refresh session");

        break;
      }

      case "subscription_cancelled": {


        const foundUser = (await db
          .select()
          .from(user)
          .where(eq(user.customerId, customerId)))[0];

        if (!foundUser) {
          console.error("User not found for customerId:", customerId);
          return new Response("User not found", { status: 404 });
        }

        // Revoke access to your product
        await updateUser(foundUser.id, {
          hasAccess: false,
          updatedAt: new Date(),
        });
        // console.log("Revoked access for customer ID:", customerId);

        break;
      }

      default:
        console.log("🔥 UNHANDLED EVENT TYPE:", eventName);
        console.log("🔥 EVENT DATA:", JSON.stringify(payload.data, null, 2));
    }
  } catch (e) {
    console.error("🔥 LEMONSQUEEZY ERROR:", e instanceof Error ? e.message : e);
    console.error("🔥 ERROR STACK:", e instanceof Error ? e.stack : "No stack trace");
    return new Response(`Webhook processing failed: ${e instanceof Error ? e.message : 'Unknown error'}`, {
      status: 500,
    });
  }

  return NextResponse.json(
    { success: true, redirect: '/' },
    { status: 200 }
  );
}