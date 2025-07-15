import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("🧪 TEST WEBHOOK RECEIVED");
  console.log("🧪 Headers:", Object.fromEntries(req.headers.entries()));
  
  try {
    const body = await req.text();
    console.log("🧪 Body:", body);
    
    return NextResponse.json({ 
      success: true, 
      message: "Test webhook received successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("🧪 Test webhook error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: "Webhook test endpoint is working",
    timestamp: new Date().toISOString()
  });
}