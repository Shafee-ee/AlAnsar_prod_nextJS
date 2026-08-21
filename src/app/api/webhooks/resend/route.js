import { NextResponse } from "next/server";
import { Resend } from "resend";
import { adminDB } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const event = await req.json();

    console.log("===== RESEND INBOUND EMAIL =====");
    console.log(JSON.stringify(event, null, 2));

    if (event.type !== "email.received") {
      return NextResponse.json({ received: true });
    }

    const emailId = event.data?.email_id;

    if (!emailId) {
      console.error("No email_id in webhook event");
      return NextResponse.json({ error: "Missing email_id" }, { status: 400 });
    }

    const { data: email, error } = await resend.emails.receiving.get(emailId);

    if (error || !email) {
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
    console.log("========================");

    /*
     * The outgoing Ustaad email contains:
     *
     * [submissionId]
     *
     * in the subject.
     *
     * A reply normally becomes:
     * Re: New Question Approved ... [submissionId]
     */
    const subject = email.subject || "";

    const match = subject.match(/\[([^\]]+)\]/);

    if (!match) {
      console.log("No submission ID found in subject");
      return NextResponse.json({ received: true });
    }

    const submissionId = match[1];

    console.log("Submission ID:", submissionId);

    const submissionRef = adminDB
      .collection("qna_submissions")
      .doc(submissionId);

    const submissionSnap = await submissionRef.get();

    if (!submissionSnap.exists) {
      console.error("Submission not found:", submissionId);

      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }

    const answer = (email.text || "").trim();

    if (!answer) {
      console.error("Received email contains no text answer");

      return NextResponse.json({ error: "Empty email body" }, { status: 400 });
    }

    await submissionRef.update({
      ustaad_answer: answer,
      status: "answered",
      answeredAt: FieldValue.serverTimestamp(),
    });

    console.log("===== USTAAD ANSWER SAVED =====");
    console.log("Submission:", submissionId);

    return NextResponse.json({
      received: true,
      saved: true,
      submissionId,
    });
  } catch (error) {
    console.error("Resend webhook error:", error);

    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
