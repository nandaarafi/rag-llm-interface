
import crypto from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { updateUser, getUser } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
// This is where we receive Lemon Squeezy webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req: NextRequest) {
  const text = await req.text();
//   console.log("Received request body:", text);

  // Check if the signing secret is set
  const signingSecret = process.env.LEMONSQUEEZY_SIGNING_SECRET;
  if (!signingSecret) {
    // console.error("LEMONSQUEEZY_SIGNING_SECRET is not set");
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
  if (!crypto.timingSafeEqual(
    new Uint8Array(digest),
    new Uint8Array(signature)
  )) {
    // console.log("Invalid signature.");
    return new Response("Invalid signature.", {
      status: 400,
    });
  }

  // Get the payload
  const payload = JSON.parse(text);

  const eventName = payload.meta.event_name;
  const customerId = payload.data.attributes.customer_id.toString();
//   console.log("Processing event:", payload);

  try {
    switch (eventName) {
      case "order_created": {
        // Grant access to the product
        const email = payload.data.attributes.user_email;
        const variantId = payload.data.attributes.first_order_item?.variant_id.toString();
        const userId = payload.meta?.custom_data?.userId;

        // Find or create user
        let user;
        if (userId) {
          user = (await db.select().from(user).where(eq(user.id, userId)))[0];
        } else if (email) {
          user = (await getUser(email))[0];
          if (!user) {
            // Create new user if not exists
            user = (await db.insert(user).values({
              email,
              customerId,
              hasAccess: true,
              variantId,
            }).returning())[0];
          }
        }

        if (!user) {
          return new Response("User not found", { status: 404 });
        }

        // Update user with subscription details
        await updateUser(user.id, {
          customerId,
          variantId,
          hasAccess: true,
          updatedAt: new Date(),
        });

        break;
      }

      case "subscription_cancelled": {


        const user = await db
          .select()
          .from(user)
          .eq("customerId", customerId)
          .single();

        // Revoke access to your product
        await updateUser(user?.id, {
          hasAccess: false,
          updatedAt: new Date(),
        });
        // console.log("Revoked access for customer ID:", customerId);

        break;
      }

      default:
        // console.log("Unhandled event type:", eventName);
    }
  } catch (e) {
    console.error("lemonsqueezy error: ", e.message);
  }

  return NextResponse.json(
    { success: true, redirect: '/' },
    { status: 200 }
  );
}