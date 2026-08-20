import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const event = await req.json();

    console.log("===== RESEND INBOUND EMAIL =====");
    console.log(JSON.stringify(event, null, 2));

    if (event.type === "email.received") {
      const emailId = event.data.email_id;

      const { data: email, error } = await resend.emails.receiving.get(emailId);

      if (error) {
        console.error("Failed to retrieve received email:", error);

        return NextResponse.json(
          { error: "Failed to retrieve email" },
          { status: 500 },
        );
      }

      console.log("===== ACTUAL EMAIL =====");
      console.log("From:", email.from);
      console.log("Subject:", email.subject);
      console.log("Text:", email.text);
      console.log("HTML:", email.html);
      console.log("========================");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Resend webhook error:", error);

    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
