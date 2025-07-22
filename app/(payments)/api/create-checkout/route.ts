import { createLemonSqueezyCheckout } from "@/lib/lemonsqueezy";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from '@/app/(auth)/auth';
import { getUser }  from '@/lib/db/queries';

// This function is used to create a Lemon Squeezy Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// By default, it doesn't force users to be authenticated. But if they are, it will prefill the Checkout data with their email and/or credit card
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.variantId) {
    return NextResponse.json(
      { error: "Variant ID is required" },
      { status: 400 }
    );
  } else if (!body.redirectUrl) {
    return NextResponse.json(
      { error: "Redirect URL is required" },
      { status: 400 }
    );
  }

  try {
    const session = await auth();

    // Check if user exists - if not, they're not logged in
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to make a purchase." },
        { status: 401 }
      );
    }

    const { variantId, redirectUrl } = body;
    // console.log(redirectUrl)

    const profiles = await getUser(session.user.email!);
    const profile = profiles[0];
    const checkoutURL = await createLemonSqueezyCheckout({
      variantId,
      redirectUrl,
      // If user is logged in, this will automatically prefill Checkout data like email and/or credit card for faster checkout
      userId: profile?.id,
      email: profile?.email,
      // If you send coupons from the frontend, you can pass it here
      // discountCode: body.discountCode,
    });

    return NextResponse.json({ url: checkoutURL });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error)?.message || 'Unknown error' }, { status: 500 });
  }
}
