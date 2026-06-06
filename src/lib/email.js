import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const IMAM_NOTIFICATION_LIST = [
  "shafeeazeemag@gmail.com",
  "muyeen@technopulse.in",
];

export async function sendEmailToImam(question, submissionId) {
  try {
    const adminLink = "https://alansarweekly.com/admin/qna/qna-submissions";

    await resend.emails.send({
      from: "Al Ansar Weekly <editor@alansarweekly.com>",
      to: IMAM_NOTIFICATION_LIST,
      reply_to: "alansarweekly786@gmail.com",
      subject: "New Question Approved – Al Ansar Weekly",
      html: `
        <div style="font-family:Arial, sans-serif; max-width:600px; margin:auto; padding:20px;">
          
          <h2 style="color:#1D3F9A; margin-bottom:10px;">
            New Question Approved
          </h2>

          <p style="font-size:16px; color:#333;">
            A new question has been approved and is ready for review.
          </p>

          <div style="
            background:#f5f7fb;
            padding:15px;
            border-radius:8px;
            margin:20px 0;
            font-size:16px;
          ">
            <strong>Question:</strong><br/>
            ${question} 
          </div>

          <p style="font-size:14px; color:#555;">
            Submission ID: ${submissionId}
          </p>

         

          <p style="margin-top:30px; font-size:12px; color:#777;">
            Al Ansar Weekly
          </p>

        </div>
      `,
    });
  } catch (err) {
    console.error("Email to imam failed:", err);
  }
}

export async function sendEmailToUser({ email, question, answer }) {
  return resend.emails.send({
    from: "Al Ansar Weekly <editor@alansarweekly.com>",
    reply_to: "alansarweekly786@gmail.com",
    to: email,
    subject: "Your question has been answered",
    html: `
      <p>Your question:</p>
      <p><strong>${question}</strong></p>

      <p>Answer:</p>
      <p>${answer}</p>

      <p>Thank you for reaching out.</p>
    `,
  });
}
