import { NextResponse } from "next/server";
import { Resend } from "resend";
import { adminDB } from "@/lib/firebaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const event = await req.json();

    console.log("===== RESEND WEBHOOK =====");
    console.log(JSON.stringify(event, null, 2));

    if (event.type !== "email.received") {
      return NextResponse.json({ received: true });
    }

    const emailId = event.data?.email_id;

    if (!emailId) {
      console.error("Webhook missing email_id");

      return NextResponse.json({ error: "Missing email_id" }, { status: 400 });
    }

    /*
     * ---------------------------------------------------------
     * 1. DURABLE WEBHOOK RECORD
     * ---------------------------------------------------------
     */

    const webhookRef = adminDB.collection("email_webhook_events").doc(emailId);

    const existingWebhook = await webhookRef.get();

    if (existingWebhook.exists) {
      const existingData = existingWebhook.data();

      if (existingData?.status === "processed") {
        console.log("Webhook already processed:", emailId);

        return NextResponse.json({
          received: true,
          alreadyProcessed: true,
        });
      }
    }

    await webhookRef.set(
      {
        emailId,
        type: event.type,
        status: "received",
        receivedAt: new Date(),
      },
      { merge: true },
    );

    /*
     * ---------------------------------------------------------
     * 2. RETRIEVE ACTUAL EMAIL FROM RESEND
     * ---------------------------------------------------------
     */

    const { data: email, error } = await resend.emails.receiving.get(emailId);

    if (error || !email) {
      console.error("Failed to retrieve received email:", error);

      await webhookRef.set(
        {
          status: "failed",
          error: error?.message || "Email not found",
          failedAt: new Date(),
        },
        { merge: true },
      );

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
     * ---------------------------------------------------------
     * 3. EXTRACT SUBMISSION ID FROM SUBJECT
     *
     * Expected:
     *
     * Re: New Question Approved – Al Ansar Weekly [ABC123]
     * ---------------------------------------------------------
     */

    const subject = email.subject || "";

    const submissionMatch = subject.match(/Al Ansar Weekly\s*\[([^\]]+)\]/i);

    if (!submissionMatch) {
      console.error("Could not find submission ID in subject:", subject);

      await webhookRef.set(
        {
          status: "failed",
          reason: "submission_id_not_found",
          from: email.from || "",
          subject,
          body: email.text || email.html || "",
          failedAt: new Date(),
        },
        { merge: true },
      );

      return NextResponse.json({
        received: true,
        processed: false,
        reason: "submission_id_not_found",
      });
    }

    const submissionId = submissionMatch[1];

    console.log("Submission ID:", submissionId);

    /*
     * ---------------------------------------------------------
     * 4. FIND THE ORIGINAL SUBMISSION
     * ---------------------------------------------------------
     */

    const submissionRef = adminDB
      .collection("qna_submissions")
      .doc(submissionId);

    const submissionSnap = await submissionRef.get();

    if (!submissionSnap.exists) {
      console.error("Submission not found:", submissionId);

      await webhookRef.set(
        {
          status: "failed",
          reason: "submission_not_found",
          submissionId,
          from: email.from || "",
          subject,
          body: email.text || email.html || "",
          failedAt: new Date(),
        },
        { merge: true },
      );

      return NextResponse.json(
        {
          error: "Submission not found",
          submissionId,
        },
        { status: 500 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. SAVE USTAAD'S REPLY
     * ---------------------------------------------------------
     */

    const rawReply = email.text || email.html || "";

    const replyText = rawReply.split(/\nOn .*wrote:\n/i)[0].trim();
    await submissionRef.update({
      ustaad_answer: replyText,
      ustaad_answered_at: new Date(),
      ustaad_answered_from: email.from || "",
      ustaad_email_id: emailId,
      ustaad_email_subject: subject,
    });

    /*
     * ---------------------------------------------------------
     * 6. MARK WEBHOOK AS SUCCESSFULLY PROCESSED
     * ---------------------------------------------------------
     */

    await webhookRef.set(
      {
        status: "processed",
        submissionId,
        from: email.from || "",
        subject,
        processedAt: new Date(),
      },
      { merge: true },
    );

    console.log("===== USTAAD ANSWER SAVED =====", submissionId);

    return NextResponse.json({
      received: true,
      processed: true,
      submissionId,
    });
  } catch (error) {
    console.error("Resend webhook error:", error);

    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
