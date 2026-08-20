import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const event = await req.json();

    console.log("===== RESEND INBOUND EMAIL =====");
    console.log(JSON.stringify(event, null, 2));
    console.log("================================");

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Resend webhook error:", error);

    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
